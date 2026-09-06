// 《一朝天子》Prototype 0.3 故事线程管理器 (ThreadManager)
// 8大连续故事线程演进中枢，杜绝孤立碎片化随机事件 (Section 19 & 20)

import { THREAD_TEMPLATES } from '../data/threadTemplates.js';
import { EVENT_TEMPLATES } from '../data/eventTemplates.js';

export class ThreadManager {
  constructor(prng) {
    this.prng = prng;
    this.activeThreads = []; // [{ threadId, templateId, stage, momentum, status, participants, region, history: [] }]
  }

  reset() {
    this.activeThreads = [];
    // 开局启动两条轻量自然连续故事线：北境易主 与 沈恪清丈
    this.startThread('north_steppe_crisis', { participants: ['han_ce'] });
    this.startThread('local_reform_shen', { participants: ['shen_ke', 'pei_jian'] });
  }

  getActiveThreads() {
    return this.activeThreads.filter(t => t.status === 'active');
  }

  hasActiveThread(templateId) {
    return this.activeThreads.some(t => t.templateId === templateId && t.status === 'active');
  }

  getThread(templateId) {
    return this.activeThreads.find(t => t.templateId === templateId && t.status === 'active');
  }

  // 启动新线程
  startThread(templateId, { participants = [], region = null } = {}) {
    if (this.hasActiveThread(templateId)) return null;
    const def = THREAD_TEMPLATES[templateId];
    if (!def) return null;

    const thread = {
      threadId: `th_${templateId}_${Date.now()}`,
      templateId,
      name: def.name,
      category: def.category,
      region: region || def.region || 'central',
      stage: 1,
      momentum: 50,
      status: 'active',
      participants: [...participants],
      lastEventTurn: 1,
      history: [
        { turn: 1, stage: 1, desc: def.stages[1].title }
      ]
    };

    this.activeThreads.push(thread);
    return thread;
  }

  // 强制/定向推进线程到某一阶段
  advanceThread(templateId, toStage) {
    const thread = this.getThread(templateId);
    if (!thread) return null;
    const def = THREAD_TEMPLATES[templateId];
    if (!def) return null;

    if (toStage === 'resolved') {
      thread.status = 'resolved';
      return thread;
    }

    thread.stage = toStage;
    const stageDef = def.stages[toStage];
    if (stageDef) {
      thread.history.push({
        stage: toStage,
        desc: stageDef.title
      });
    }
    return thread;
  }

  // 每季驱动已有线程自然推进 (Section 21)
  tickQuarter(turn, world) {
    const threadEvents = [];
    const active = this.getActiveThreads();

    for (const thread of active) {
      // 避免同一线程每轮无休止连续狂跳，给天下呼吸感 (约 35%~50% 概率本季推进)
      const turnsSince = turn - thread.lastEventTurn;
      const shouldAdvance = turnsSince >= 2 || (turnsSince >= 1 && this.prng.next() < 0.45);
      if (!shouldAdvance) continue;

      const def = THREAD_TEMPLATES[thread.templateId];
      if (!def) continue;

      const currentStageDef = def.stages[thread.stage];
      if (!currentStageDef || !currentStageDef.transitions || currentStageDef.transitions.length === 0) {
        thread.status = 'resolved';
        continue;
      }

      // 根据权重与世界条件挑选下一步分支
      const candidates = [];
      for (const tr of currentStageDef.transitions) {
        let weight = tr.weight || 50;

        // 根据玩家决策种植的 CausalHooks 修正概率 (Section 61)
        if (tr.event === 'han_ce_crushes_steppe' && world.causalHookManager.has('han_ce_reinforced')) {
          weight += 40;
        }
        if (tr.event === 'gentry_resist_reform' && world.factions.gentry.influence >= 60) {
          weight += 30;
        }
        if (tr.event === 'emperor_backs_shen' && world.causalHookManager.has('shen_ke_reform_enacted')) {
          weight += 50;
        }
        if (tr.event === 'gu_yuan_donates_millions' && world.causalHookManager.has('open_sea_trade')) {
          weight += 45;
        }

        candidates.push({ item: tr, weight });
      }

      const chosenTr = this.prng.weightedChoice(candidates);
      if (!chosenTr) continue;

      // 阶段迁移
      thread.lastEventTurn = turn;
      if (chosenTr.nextStage === 'resolved') {
        thread.status = 'resolved';
      } else {
        thread.stage = chosenTr.nextStage;
      }

      // 寻找并执行对应事件模板
      const evDef = EVENT_TEMPLATES.find(e => e.id === chosenTr.event);
      if (evDef) {
        const evResult = evDef.execute(world);
        threadEvents.push({
          type: 'thread_progression',
          threadId: thread.threadId,
          templateId: thread.templateId,
          threadName: thread.name,
          category: evDef.category,
          priority: evDef.priority || 80,
          title: evDef.title,
          text: evResult.text || evDef.newsTemplate,
          chronicleText: evDef.chronicleTemplate
        });
      }
    }

    // 若活跃线程过少 (< 2)，且局势平稳，自然催生新故事线程
    if (this.getActiveThreads().length < 2 && turn > 4 && this.prng.next() < 0.3) {
      const candidates = Object.keys(THREAD_TEMPLATES).filter(id => !this.hasActiveThread(id));
      if (candidates.length > 0) {
        const picked = this.prng.choice(candidates);
        this.startThread(picked);
      }
    }

    return threadEvents;
  }

  restore(data) {
    this.activeThreads = Array.isArray(data) ? [...data] : [];
  }
}
