// Prototype 0.2 朝廷宏观健康度管理器 (StateManager)
// 维护国库、民心、军势、朝局四项大局健康度与失败检测

import { BALANCE } from '../data/balance.js';

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
  }

  clamp(val) {
    return Math.max(0, Math.min(100, Math.round(val)));
  }

  getStats() {
    return {
      treasury: this.treasury,
      morale: this.morale,
      military: this.military,
      court: this.court
    };
  }

  getTier(statName) {
    const val = this[statName];
    const tiers = BALANCE.STAT_TIERS[statName];
    for (const t of tiers) {
      if (val >= t.min && val <= t.max) return t;
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

  applyDelta(delta) {
    if (!delta) return;
    if (delta.treasury !== undefined) this.treasury = this.clamp(this.treasury + delta.treasury);
    if (delta.morale !== undefined) this.morale = this.clamp(this.morale + delta.morale);
    if (delta.military !== undefined) this.military = this.clamp(this.military + delta.military);
    if (delta.court !== undefined) this.court = this.clamp(this.court + delta.court);
  }

  // 失败条件检测：任意两项核心健康度同时 <= 0
  checkDefeat(situations = [], godMode = false) {
    if (godMode) return null;

    const zeros = [];
    if (this.treasury <= 0) zeros.push('国库枯竭');
    if (this.morale <= 0) zeros.push('民心尽丧');
    if (this.military <= 0) zeros.push('军势解体');
    if (this.court <= 0) zeros.push('朝局崩溃');

    if (zeros.length >= 2) {
      return {
        defeated: true,
        reason: `${zeros.join('与')}，宗庙蒙尘社稷倾覆`
      };
    }

    // 检查是否有重大危机恶化到顶
    for (const s of situations) {
      if (s.category === 'crisis' && s.stage >= 3 && s.wasNeglectedExceeded) {
        return {
          defeated: true,
          reason: `【${s.name}】彻底失控爆发，社稷倾覆`
        };
      }
    }

    return null;
  }
}
