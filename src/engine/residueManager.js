// Prototype 0.2 后遗状态管理器 (ResidueManager)
// 维护场上最多3个后遗状态、持续季数流逝、被动效果与自然消散

import { RESIDUES } from '../data/residues.js';
import { BALANCE } from '../data/balance.js';

export class ResidueManager {
  constructor() {
    this.activeResidues = []; // [{ id, name, type, duration, description, tickEffect, modifier }]
  }

  reset() {
    this.activeResidues = [];
  }

  getActive() {
    return this.activeResidues;
  }

  hasResidue(id) {
    return this.activeResidues.some(r => r.id === id);
  }

  // 添加新后遗状态（最多3个，超出则顶替最早的一个）
  addResidue(residueId) {
    if (!residueId || !RESIDUES[residueId]) return null;
    const def = RESIDUES[residueId];

    // 如果已有，刷新持续时间
    const existing = this.activeResidues.find(r => r.id === residueId);
    if (existing) {
      existing.duration = def.defaultDuration;
      return { action: 'refreshed', residue: existing };
    }

    const instance = {
      id: def.id,
      name: def.name,
      type: def.type,
      duration: def.defaultDuration,
      description: def.description,
      tickEffect: def.tickEffect ? { ...def.tickEffect } : null,
      modifier: def.modifier ? { ...def.modifier } : null
    };

    let replaced = null;
    if (this.activeResidues.length >= BALANCE.MAX_ACTIVE_RESIDUES) {
      replaced = this.activeResidues.shift(); // 移除最早的
    }

    this.activeResidues.push(instance);
    return { action: 'added', residue: instance, replaced };
  }

  removeResidue(residueId) {
    const idx = this.activeResidues.findIndex(r => r.id === residueId);
    if (idx !== -1) {
      const removed = this.activeResidues.splice(idx, 1)[0];
      return removed;
    }
    return null;
  }

  // 每季末推进后遗状态生命周期
  tick(stateManager) {
    const logs = [];
    const survived = [];

    for (const r of this.activeResidues) {
      // 执行被动每季效果 (如岁币压力)
      if (r.tickEffect) {
        stateManager.applyDelta(r.tickEffect);
        logs.push({
          type: 'residue_tick',
          name: r.name,
          delta: r.tickEffect
        });
      }

      r.duration--;
      if (r.duration <= 0) {
        logs.push({
          type: 'residue_expired',
          name: r.name,
          text: `历经数季波折，【${r.name}】影响已告平复消散。`
        });
      } else {
        survived.push(r);
      }
    }

    this.activeResidues = survived;
    return logs;
  }
}
