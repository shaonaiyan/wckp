// 《一朝天子》Prototype 0.3 记忆管理器 (MemoryManager)
// 维护人物记忆、线程记忆与王朝大事件记忆，驱动长期因果感

import { BALANCE } from '../data/balance.js';

export class MemoryManager {
  constructor() {
    this.memories = []; // 全局记忆池
  }

  reset() {
    this.memories = [];
  }

  // 为特定实体添加记忆
  addMemory({ type, targetId, description, importance = 5, turn = 1, sourceEventId = null, relatedIds = [] }) {
    const memory = {
      id: `mem_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type, // 'character' | 'thread' | 'dynasty'
      targetId, // characterId, threadId, etc.
      description,
      importance,
      turn,
      sourceEventId,
      relatedIds,
      createdAt: Date.now()
    };

    this.memories.push(memory);
    this.trimMemories(targetId, type);
    return memory;
  }

  // 限制单个角色的记忆在 3~6 条内，自动淘汰低重要度记忆
  trimMemories(targetId, type) {
    const limit = type === 'character' ? BALANCE.MAX_CHARACTER_MEMORIES : BALANCE.MAX_THREAD_MEMORIES;
    const targetMems = this.memories.filter(m => m.targetId === targetId);

    if (targetMems.length > limit) {
      // 优先保留重要度最高、生成时间最新的记忆
      targetMems.sort((a, b) => {
        if (b.importance !== a.importance) return b.importance - a.importance;
        return b.turn - a.turn;
      });

      const toKeep = new Set(targetMems.slice(0, limit).map(m => m.id));
      this.memories = this.memories.filter(m => m.targetId !== targetId || toKeep.has(m.id));
    }
  }

  getByTarget(targetId) {
    return this.memories.filter(m => m.targetId === targetId).sort((a, b) => b.turn - a.turn);
  }

  getAll() {
    return this.memories;
  }

  // 恢复存档
  restore(data) {
    this.memories = Array.isArray(data) ? [...data] : [];
  }
}
