// 天下局势管理器：控制局势生成、推进、合并、化解与恶化
import { SITUATIONS } from '../data/situations.js';
import { BALANCE } from '../data/balance.js';

export class SituationManager {
  constructor(prng) {
    this.prng = prng;
    this.activeSituations = []; // 场上最多3个局势
    this.deferredQueue = [];    // 延后出现的局势
    this.situationHistory = {}; // 记录每种局势的出现次数、处理次数等
    this.initHistory();
  }

  initHistory() {
    for (const def of SITUATIONS) {
      this.situationHistory[def.id] = {
        spawnCount: 0,
        resolvedCount: 0,
        autoResolvedCount: 0,
        escalatedCount: 0,
        totalTurnsActive: 0
      };
    }
  }

  reset() {
    this.activeSituations = [];
    this.deferredQueue = [];
    this.initHistory();
  }

  // 获取当前场上所有局势
  getActive() {
    return this.activeSituations;
  }

  // 第一轮固定节奏：仅【江南丰收】
  setupFirstTurn() {
    this.activeSituations = [];
    this.addSituation('harvest_south');
  }

  // 实例化一个局势对象
  createInstance(situationId) {
    const def = SITUATIONS.find(s => s.id === situationId);
    if (!def) return null;
    return {
      id: def.id,
      name: def.name,
      category: def.category,
      severity: def.severity,
      duration: def.defaultDuration,
      stage: def.stage,
      maxStage: def.maxStage,
      description: def.description,
      tickEffect: { ...def.tickEffect },
      responsiveTags: [...def.responsiveTags],
      unresolvedCount: 0,
      escalateThreshold: def.escalateThreshold || 0,
      escalateTo: def.escalateTo || null,
      turnsActive: 0
    };
  }

  // 添加局势到场上（严格遵守最多3个规则，处理合并、替换或延后）
  addSituation(situationId) {
    const def = SITUATIONS.find(s => s.id === situationId);
    if (!def) return { success: false, reason: 'invalid_id' };

    // 如果场上已存在该局势，则升级该局势（合并）
    const existing = this.activeSituations.find(s => s.id === situationId);
    if (existing) {
      if (existing.stage < existing.maxStage) {
        existing.stage++;
        existing.severity = Math.min(5, existing.severity + 1);
        if (existing.duration > 0) existing.duration += 2;
        return { success: true, action: 'merged', situation: existing };
      }
      return { success: false, action: 'already_max_stage' };
    }

    const instance = this.createInstance(situationId);
    if (!instance) return { success: false, reason: 'failed_instance' };

    // 场上少于3个，直接进入
    if (this.activeSituations.length < BALANCE.MAX_ACTIVE_SITUATIONS) {
      this.activeSituations.push(instance);
      this.situationHistory[def.id].spawnCount++;
      return { success: true, action: 'added', situation: instance };
    }

    // 场上已满3个：
    // 规则1：如果新局势是重大危机/负面局势，且场上有正面局势，优先替换正面局势
    if (instance.category !== 'positive') {
      const posIdx = this.activeSituations.findIndex(s => s.category === 'positive');
      if (posIdx !== -1) {
        const replaced = this.activeSituations.splice(posIdx, 1)[0];
        this.activeSituations.push(instance);
        this.situationHistory[def.id].spawnCount++;
        return { success: true, action: 'replaced_positive', replaced, situation: instance };
      }
    }

    // 规则2：同类局势合并（例如已有负面局势，升级严重程度）
    const sameCat = this.activeSituations.find(s => s.category === instance.category && s.stage < s.maxStage);
    if (sameCat) {
      sameCat.stage++;
      sameCat.severity = Math.min(5, sameCat.severity + 1);
      return { success: true, action: 'merged_category', situation: sameCat };
    }

    // 规则3：放入延后队列
    this.deferredQueue.push(situationId);
    return { success: false, action: 'deferred', situationId };
  }

  // 每轮局势结算与生命周期推进
  // 1. 统计活跃轮数
  // 2. 扣减持续时间
  // 3. 检查升级/恶化
  // 4. 检查自动解除
  tickSituations(state) {
    const logs = [];
    const survived = [];

    for (const sit of this.activeSituations) {
      sit.turnsActive++;
      this.situationHistory[sit.id].totalTurnsActive++;

      // 长期状态修正 tickDelta
      const tickDelta = { ...sit.tickEffect };
      for (const sid of state.longTermStates) {
        // states hooks if defined
      }

      // 应用局势每轮效果
      state.applyDelta(tickDelta);
      logs.push({
        type: 'tick',
        situation: sit.name,
        delta: tickDelta
      });

      // 检查自动解除条件
      const def = SITUATIONS.find(s => s.id === sit.id);
      let autoResolved = false;
      if (def && typeof def.autoResolve === 'function') {
        if (def.autoResolve(state)) {
          autoResolved = true;
          this.situationHistory[sit.id].autoResolvedCount++;
          logs.push({
            type: 'auto_resolve',
            situation: sit.name,
            text: `由于朝廷应对得宜，【${sit.name}】已然自然平息。`
          });
        }
      }

      if (autoResolved) continue;

      // 持续时间结算 (若大于0)
      if (sit.duration > 0) {
        sit.duration--;
        if (sit.duration <= 0) {
          this.situationHistory[sit.id].autoResolvedCount++;
          logs.push({
            type: 'expired',
            situation: sit.name,
            text: `历经数季，【${sit.name}】影响已然消散。`
          });
          continue;
        }
      }

      // 未解决升级推进 (如北境犯边未受干预)
      sit.unresolvedCount++;
      if (sit.escalateThreshold > 0 && sit.unresolvedCount >= sit.escalateThreshold && sit.escalateTo) {
        this.situationHistory[sit.id].escalatedCount++;
        const escalatedDef = SITUATIONS.find(s => s.id === sit.escalateTo);
        if (escalatedDef) {
          logs.push({
            type: 'escalated',
            oldSituation: sit.name,
            newSituation: escalatedDef.name,
            text: `因久拖未决，【${sit.name}】已然升级为【${escalatedDef.name}】！`
          });
          const newInst = this.createInstance(sit.escalateTo);
          if (newInst) {
            this.situationHistory[sit.escalateTo].spawnCount++;
            survived.push(newInst);
            continue;
          }
        }
      }

      survived.push(sit);
    }

    this.activeSituations = survived;

    // 检查是否有延后队列中的局势可以进场
    while (this.activeSituations.length < BALANCE.MAX_ACTIVE_SITUATIONS && this.deferredQueue.length > 0) {
      const nextId = this.deferredQueue.shift();
      this.addSituation(nextId);
    }

    return logs;
  }

  // 根据当前王朝状态概率评估新局势生成
  evaluateGeneration(turn, state) {
    if (turn === 1) return null; // 第1轮已固定只有江南丰收
    if (this.activeSituations.length >= BALANCE.MAX_ACTIVE_SITUATIONS) return null;

    // 早期轮次(2~4轮)限制重大危机生成
    const allowCrisis = turn >= 5;

    // 收集所有满足触发条件的候选局势
    const candidates = [];
    for (const def of SITUATIONS) {
      // 不重复生成场上已有的
      if (this.activeSituations.some(s => s.id === def.id)) continue;
      if (def.category === 'crisis' && !allowCrisis) continue;

      let canTrigger = false;
      if (typeof def.triggerCondition === 'function') {
        canTrigger = def.triggerCondition(state, this.activeSituations, this.prng);
      }

      if (canTrigger) {
        let weight = def.category === 'crisis' ? 10 : (def.category === 'negative' ? 20 : 15);
        // 状态相关加权
        if (def.id === 'yellow_river_flood' && turn >= 3 && turn <= 12) weight += 15;
        if (def.id === 'northern_incursion' && state.military < 50) weight += 20;
        if (def.id === 'rising_discontent' && state.morale < 40) weight += 25;
        candidates.push({ item: def.id, weight });
      }
    }

    if (candidates.length === 0) return null;

    // 挑选1个局势生成
    const pickedId = this.prng.weightedChoice(candidates);
    if (pickedId) {
      return this.addSituation(pickedId);
    }
    return null;
  }

  // 玩家打牌对特定局势进行化解/减轻
  resolveSituation(situationId, amount = 1) {
    const sit = this.activeSituations.find(s => s.id === situationId);
    if (!sit) return null;

    sit.unresolvedCount = 0; // 重置未解决计数，打断升级进度
    sit.stage -= amount;

    if (sit.stage <= 0) {
      // 彻底化解
      const idx = this.activeSituations.indexOf(sit);
      this.activeSituations.splice(idx, 1);
      this.situationHistory[sit.id].resolvedCount++;
      return { resolved: true, situation: sit, text: `【${sit.name}】已被彻底平定化解！` };
    } else {
      // 降低严重度
      sit.severity = Math.max(1, sit.severity - amount);
      return { resolved: false, situation: sit, text: `【${sit.name}】烈度有所缓解（降至第${sit.stage}级）。` };
    }
  }

  // 移除所有局势 (Debug)
  clearAll() {
    this.activeSituations = [];
    this.deferredQueue = [];
  }
}
