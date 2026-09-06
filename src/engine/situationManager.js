// Prototype 0.2 天下局势管理器 (SituationManager)
// 负责局势三阶段压力、放任离散后果、恶化升级与化解判定

import { SITUATIONS } from '../data/situations.js';
import { BALANCE } from '../data/balance.js';

export class SituationManager {
  constructor(prng) {
    this.prng = prng;
    this.activeSituations = []; // 场上最多3个局势
    this.deferredQueue = [];
    this.situationHistory = {};
    this.initHistory();
  }

  initHistory() {
    this.situationHistory = {};
    for (const def of SITUATIONS) {
      this.situationHistory[def.id] = {
        spawnCount: 0,
        resolvedCount: 0,
        neglectedEscalations: 0,
        turnsActive: 0,
        interventionQualities: []
      };
    }
  }

  reset() {
    this.activeSituations = [];
    this.deferredQueue = [];
    this.initHistory();
  }

  getActive() {
    return this.activeSituations;
  }

  // 第一轮初始固定节奏：只有【江南丰收】
  setupFirstTurn() {
    this.activeSituations = [];
    this.addSituation('harvest_south');
  }

  // 实例化局势对象
  createInstance(situationId) {
    const def = SITUATIONS.find(s => s.id === situationId);
    if (!def) return null;
    return {
      id: def.id,
      name: def.name,
      category: def.category, // 'negative' | 'opportunity' | 'crisis'
      stage: def.initialStage || 1,
      maxStage: def.maxStage || 3,
      duration: def.defaultDuration || -1,
      description: def.description,
      applicableTags: [...(def.applicableTags || [])],
      directionHints: [...(def.directionHints || [])],
      stageProfiles: { ...def.stageProfiles },
      onNeglectConsequence: def.onNeglectConsequence ? JSON.parse(JSON.stringify(def.onNeglectConsequence)) : null,
      wasIntervenedThisTurn: false,
      turnsActive: 0
    };
  }

  // 添加局势到场上（最多3个）
  addSituation(situationId) {
    const def = SITUATIONS.find(s => s.id === situationId);
    if (!def) return { success: false };

    // 如果已有同类局势，升级阶段
    const existing = this.activeSituations.find(s => s.id === situationId);
    if (existing) {
      if (existing.stage < existing.maxStage) {
        existing.stage++;
        return { success: true, action: 'merged', situation: existing };
      }
      return { success: false, action: 'max_stage' };
    }

    const instance = this.createInstance(situationId);
    if (!instance) return { success: false };

    if (this.activeSituations.length < BALANCE.MAX_ACTIVE_SITUATIONS) {
      this.activeSituations.push(instance);
      if (this.situationHistory[def.id]) this.situationHistory[def.id].spawnCount++;
      return { success: true, action: 'added', situation: instance };
    }

    // 若满3个且新局势是负面/危机，优先替换正面机会
    if (instance.category !== 'opportunity') {
      const oppIdx = this.activeSituations.findIndex(s => s.category === 'opportunity');
      if (oppIdx !== -1) {
        const replaced = this.activeSituations.splice(oppIdx, 1)[0];
        this.activeSituations.push(instance);
        if (this.situationHistory[def.id]) this.situationHistory[def.id].spawnCount++;
        return { success: true, action: 'replaced_opportunity', replaced, situation: instance };
      }
    }

    // 放入延后队列
    this.deferredQueue.push(situationId);
    return { success: false, action: 'deferred' };
  }

  // 玩家打牌干预局势 (施加阶段变化)
  applySituationDelta(situationId, delta) {
    const sit = this.activeSituations.find(s => s.id === situationId);
    if (!sit) return null;

    sit.wasIntervenedThisTurn = true; // 标记本季已处理，避免放任恶化
    const oldStage = sit.stage;
    sit.stage += delta;

    if (sit.stage <= 0) {
      // 彻底解决并移除
      const idx = this.activeSituations.indexOf(sit);
      this.activeSituations.splice(idx, 1);
      if (this.situationHistory[sit.id]) this.situationHistory[sit.id].resolvedCount++;
      return {
        resolved: true,
        situation: sit,
        oldStage,
        newStage: 0,
        text: `【${sit.name}】已得根本化解！`
      };
    } else {
      return {
        resolved: false,
        situation: sit,
        oldStage,
        newStage: sit.stage,
        text: `【${sit.name}】压力缓解 (${oldStage}阶 → ${sit.stage}阶)。`
      };
    }
  }

  // 季末放任恶化与生命周期结算 (Section 4 & 23)
  tickNeglect(stateManager) {
    const logs = [];
    const nextSituations = [];

    for (const sit of this.activeSituations) {
      sit.turnsActive++;
      if (this.situationHistory[sit.id]) this.situationHistory[sit.id].turnsActive++;

      // 机会局势 (opportunity) 的持续季数递减
      if (sit.category === 'opportunity') {
        if (sit.duration > 0) sit.duration--;
        if (sit.duration === 0) {
          logs.push({
            type: 'opportunity_ended',
            situation: sit.name,
            headline: `【${sit.name}】时机已逝`,
            historyText: `四时流转，【${sit.name}】良机渐已平息过去。`
          });
          continue;
        }
        sit.wasIntervenedThisTurn = false;
        nextSituations.push(sit);
        continue;
      }

      // 负面局势与危机局势：检查本季是否被放任 (wasIntervenedThisTurn === false)
      if (!sit.wasIntervenedThisTurn) {
        if (this.situationHistory[sit.id]) this.situationHistory[sit.id].neglectedEscalations++;
        const conseq = sit.onNeglectConsequence;

        if (sit.stage === 1 && conseq && conseq.toStage2) {
          sit.stage = 2;
          stateManager.applyDelta(conseq.toStage2.statDelta);
          logs.push({
            type: 'neglect_escalation',
            situation: sit.name,
            oldStage: 1,
            newStage: 2,
            headline: `【${sit.name}】放任恶化`,
            historyText: conseq.toStage2.historyText
          });
          nextSituations.push(sit);
        } else if (sit.stage === 2 && conseq && conseq.toStage3) {
          sit.stage = 3;
          stateManager.applyDelta(conseq.toStage3.statDelta);
          logs.push({
            type: 'neglect_escalation',
            situation: sit.name,
            oldStage: 2,
            newStage: 3,
            headline: `【${sit.name}】危急迫切`,
            historyText: conseq.toStage3.historyText
          });
          nextSituations.push(sit);
        } else if (sit.stage >= 3 && conseq && conseq.onExceed) {
          // 恶化到顶，升级为重大危机或造成重挫
          stateManager.applyDelta(conseq.onExceed.statDelta);
          logs.push({
            type: 'crisis_escalation',
            situation: sit.name,
            oldStage: 3,
            newStage: 3,
            headline: conseq.onExceed.headline,
            historyText: conseq.onExceed.historyText
          });

          if (conseq.onExceed.escalateTo) {
            const crisisDef = SITUATIONS.find(s => s.id === conseq.onExceed.escalateTo);
            if (crisisDef) {
              const crisisInst = this.createInstance(crisisDef.id);
              if (crisisInst) nextSituations.push(crisisInst);
            }
          }
        } else {
          nextSituations.push(sit);
        }
      } else {
        // 本季有人管，重置标记
        sit.wasIntervenedThisTurn = false;
        nextSituations.push(sit);
      }
    }

    this.activeSituations = nextSituations;

    // 若有空位，从延后队列提入新局势
    while (this.activeSituations.length < BALANCE.MAX_ACTIVE_SITUATIONS && this.deferredQueue.length > 0) {
      const nextId = this.deferredQueue.shift();
      this.addSituation(nextId);
    }

    return logs;
  }

  // 评估自然新局势生成
  evaluateGeneration(turn, stateManager, residueManager) {
    if (turn === 1) return null;
    if (this.activeSituations.length >= BALANCE.MAX_ACTIVE_SITUATIONS) return null;

    const candidates = [];
    for (const def of SITUATIONS) {
      if (this.activeSituations.some(s => s.id === def.id)) continue;
      if (def.category === 'crisis') continue; // 危机通常通过恶化演变

      let canSpawn = false;
      if (typeof def.spawnCondition === 'function') {
        canSpawn = def.spawnCondition(stateManager, this.activeSituations, this.prng);
      }

      if (canSpawn) {
        let weight = 15;
        // 后遗状态对局势生成的因果影响 (Section 11)
        if (residueManager) {
          if (residueManager.hasResidue('gentry_influence') && (def.id === 'land_annexation' || def.id === 'corrupt_minister')) {
            weight += 25;
          }
          if (residueManager.hasResidue('heavy_labor') && def.id === 'rising_discontent') {
            weight += 20;
          }
          if (residueManager.hasResidue('solid_dykes') && def.id === 'yellow_river_flood') {
            weight = 0; // 河防稳固免疫水患
          }
          if (residueManager.hasResidue('tribute_burden') && def.id === 'northern_incursion') {
            weight = 5; // 岁币降低短期边患概率
          }
        }

        if (weight > 0) {
          candidates.push({ item: def.id, weight });
        }
      }
    }

    if (candidates.length === 0) return null;

    const pickedId = this.prng.weightedChoice(candidates);
    if (pickedId) {
      return this.addSituation(pickedId);
    }
    return null;
  }

  // Debug 强制设置局势阶段
  forceSetStage(situationId, stage) {
    const sit = this.activeSituations.find(s => s.id === situationId);
    if (sit) {
      sit.stage = Math.max(1, Math.min(sit.maxStage || 3, stage));
      return true;
    }
    return false;
  }

  clearAll() {
    this.activeSituations = [];
    this.deferredQueue = [];
  }
}
