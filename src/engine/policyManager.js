// Prototype 0.2 年度定策管理器 (PolicyManager)
// 每年第4季度末触发一次三选一，最多同时激活3个国策

import { POLICIES } from '../data/policies.js';
import { BALANCE } from '../data/balance.js';

export class PolicyManager {
  constructor(prng) {
    this.prng = prng;
    this.activePolicies = []; // [{ id, name, title, category, description, tagBonus }]
    this.pendingOptions = null; // 当前待选的3个选项
  }

  reset() {
    this.activePolicies = [];
    this.pendingOptions = null;
  }

  getActive() {
    return this.activePolicies;
  }

  hasPolicy(id) {
    return this.activePolicies.some(p => p.id === id);
  }

  hasTagBonus(tag) {
    return this.activePolicies.some(p => p.tagBonus === tag);
  }

  // 生成年度定策候选 (从6中随机挑3，优先排除已有的)
  generateDraftOptions() {
    const all = Object.values(POLICIES);
    // 优先候选未激活的
    let candidates = all.filter(p => !this.hasPolicy(p.id));
    if (candidates.length < 3) candidates = all;

    const shuffled = this.prng.shuffle([...candidates]);
    this.pendingOptions = shuffled.slice(0, 3);
    return this.pendingOptions;
  }

  // 玩家选取一项国策
  selectPolicy(policyId) {
    const def = POLICIES[policyId];
    if (!def) return null;

    let replaced = null;
    // 如果已经存在则刷新
    const idx = this.activePolicies.findIndex(p => p.id === policyId);
    if (idx !== -1) {
      this.pendingOptions = null;
      return { policy: this.activePolicies[idx], replaced: null };
    }

    if (this.activePolicies.length >= BALANCE.MAX_ACTIVE_POLICIES) {
      replaced = this.activePolicies.shift();
    }

    const instance = { ...def };
    this.activePolicies.push(instance);
    this.pendingOptions = null;

    return { policy: instance, replaced };
  }
}
