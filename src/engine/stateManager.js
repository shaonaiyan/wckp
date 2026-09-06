// 国家核心属性与长期状态管理器
import { BALANCE } from '../data/balance.js';
import { LONG_TERM_STATES } from '../data/states.js';

export class StateManager {
  constructor(prng) {
    this.prng = prng;
    this.reset();
  }

  reset() {
    const v = BALANCE.INITIAL_STAT_VARIANCE;
    this.treasury = Math.max(20, Math.min(80, BALANCE.INITIAL_STATS.treasury + this.prng.nextInt(-v, v)));
    this.morale = Math.max(20, Math.min(80, BALANCE.INITIAL_STATS.morale + this.prng.nextInt(-v, v)));
    this.military = Math.max(20, Math.min(80, BALANCE.INITIAL_STATS.military + this.prng.nextInt(-v, v)));
    this.court = Math.max(20, Math.min(80, BALANCE.INITIAL_STATS.court + this.prng.nextInt(-v, v)));

    // 活跃的长期状态 (id array)
    this.longTermStates = [];
    
    // 玩家历史操作计数
    this.actionHistory = [];
    this.categoryCounts = {
      finance: 0,
      livelihood: 0,
      military: 0,
      diplomacy: 0,
      politics: 0,
      special: 0
    };
    
    // 连续倾向计数
    this.recentStreaks = {
      military: 0,
      economy: 0,
      hardline: 0
    };

    // 隐性历史事件计数器 (用于连续使用惩罚)
    this.debtCount = 0;
    this.rewardCount = 0;
    this.lowMoraleTurns = 0;
    this.highCourtTurns = 0;
  }

  // 限制属性在 0~100 之间
  clamp(val) {
    return Math.max(0, Math.min(100, Math.round(val)));
  }

  // 获取当前状态快照
  getStats() {
    return {
      treasury: this.treasury,
      morale: this.morale,
      military: this.military,
      court: this.court
    };
  }

  // 获取状态档位描述
  getTier(statName) {
    const val = this[statName];
    const tiers = BALANCE.STAT_TIERS[statName];
    for (const t of tiers) {
      if (val >= t.min && val <= t.max) {
        return t;
      }
    }
    return tiers[tiers.length - 1];
  }

  getAllTiers() {
    return {
      treasury: this.getTier('treasury'),
      morale: this.getTier('morale'),
      military: this.getTier('military'),
      court: this.getTier('court')
    };
  }

  // 应用数值变化
  applyDelta(delta) {
    if (!delta) return;
    if (delta.treasury !== undefined) this.treasury = this.clamp(this.treasury + delta.treasury);
    if (delta.morale !== undefined) this.morale = this.clamp(this.morale + delta.morale);
    if (delta.military !== undefined) this.military = this.clamp(this.military + delta.military);
    if (delta.court !== undefined) this.court = this.clamp(this.court + delta.court);
  }

  // 添加长期状态
  addLongTermState(stateId) {
    if (!LONG_TERM_STATES[stateId]) return false;
    if (!this.longTermStates.includes(stateId)) {
      this.longTermStates.push(stateId);
      return true;
    }
    return false;
  }

  // 移除长期状态
  removeLongTermState(stateId) {
    const idx = this.longTermStates.indexOf(stateId);
    if (idx !== -1) {
      this.longTermStates.splice(idx, 1);
      return true;
    }
    return false;
  }

  hasLongTermState(stateId) {
    return this.longTermStates.includes(stateId);
  }

  // 每轮结算长期状态的被动效果
  tickLongTermStates() {
    const deltas = [];
    for (const sid of this.longTermStates) {
      const def = LONG_TERM_STATES[sid];
      if (def && typeof def.onTick === 'function') {
        const delta = def.onTick(this);
        if (delta && Object.keys(delta).length > 0) {
          this.applyDelta(delta);
          deltas.push({ stateId: sid, name: def.name, delta });
        }
      }
    }
    return deltas;
  }

  // 记录玩家打出的一张牌，并更新倾向与潜在触发的长期状态
  recordCardPlayed(card) {
    if (!card) return;
    this.actionHistory.push({
      cardId: card.id,
      category: card.category,
      tags: [...card.tags]
    });
    if (this.categoryCounts[card.category] !== undefined) {
      this.categoryCounts[card.category]++;
    }

    // 检查连续倾向
    if (card.category === 'military') {
      this.recentStreaks.military++;
      this.recentStreaks.economy = 0;
      if (this.recentStreaks.military >= 3) {
        this.addLongTermState('militarism');
      }
    } else {
      this.recentStreaks.military = Math.max(0, this.recentStreaks.military - 1);
    }

    if (card.category === 'finance' || card.category === 'livelihood') {
      this.recentStreaks.economy++;
      if (this.recentStreaks.economy >= 4) {
        this.addLongTermState('rest_and_recuperate');
      }
    } else {
      this.recentStreaks.economy = Math.max(0, this.recentStreaks.economy - 1);
    }

    if (card.tags.includes('hardline') || card.tags.includes('purge')) {
      this.recentStreaks.hardline++;
      if (this.recentStreaks.hardline >= 3) {
        this.addLongTermState('authoritarian_rule');
      }
    }
  }

  // 每轮末更新宏观状态检测 (如民生凋敝、权力集中)
  evaluateMacroState() {
    if (this.morale < 30) {
      this.lowMoraleTurns++;
      if (this.lowMoraleTurns >= 3) {
        this.addLongTermState('widespread_destitution');
      }
    } else {
      this.lowMoraleTurns = 0;
      if (this.morale > 50) {
        this.removeLongTermState('widespread_destitution');
      }
    }

    if (this.court >= 75) {
      this.highCourtTurns++;
      if (this.highCourtTurns >= 3) {
        this.addLongTermState('centralized_power');
      }
    } else {
      this.highCourtTurns = 0;
    }
  }

  // 检查失败条件：
  // 1. 任意两个核心属性同时 <= 0
  // 2. 传入的危机严重度失控判定
  checkDefeat(situations = [], godMode = false) {
    if (godMode) return null;

    const zeroStats = [];
    if (this.treasury <= 0) zeroStats.push('国库枯竭');
    if (this.morale <= 0) zeroStats.push('民心尽丧');
    if (this.military <= 0) zeroStats.push('军势解体');
    if (this.court <= 0) zeroStats.push('朝局崩溃');

    if (zeroStats.length >= 2) {
      return {
        defeated: true,
        reason: `${zeroStats.join('与')}，社稷土崩瓦解`
      };
    }

    // 检查是否有重大危机达到最终失控等级 (stage >= 5)
    for (const s of situations) {
      if (s.category === 'crisis' && s.stage >= 5) {
        return {
          defeated: true,
          reason: `【${s.name}】彻底失控，社稷倾覆`
        };
      }
    }

    return null;
  }
}
