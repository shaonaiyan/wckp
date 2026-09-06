// 《一朝天子》Prototype 0.3 御前奏折管理器 (ProposalManager)
// 维护每季呈送御案的 5 份奏折、人物主动具折、留中待议与决断执行 (Section 26~32 & 60)

import { PROPOSAL_TEMPLATES } from '../data/proposalTemplates.js';
import { BALANCE } from '../data/balance.js';

export class ProposalManager {
  constructor(prng) {
    this.prng = prng;
    this.currentProposals = []; // 当季 5 份奏折
    this.keptProposal = null; // 【留中待议】的一份奏折 (Section 60)
  }

  reset() {
    this.currentProposals = [];
    this.keptProposal = null;
  }

  // 标记/取消【留中待议】
  toggleKeepProposal(proposalId) {
    if (this.keptProposal && this.keptProposal.id === proposalId) {
      this.keptProposal = null;
      return null;
    }
    const prop = this.currentProposals.find(p => p.id === proposalId);
    if (prop) {
      this.keptProposal = { ...prop, isKeptFromPrev: true };
      return this.keptProposal;
    }
    return null;
  }

  // 每季生成 5 份御前奏折
  generateTurnProposals(turn, world) {
    const proposals = [];

    // 1. 如果上季有【留中待议】奏折，必优先呈上 (Section 60)
    if (this.keptProposal) {
      proposals.push({ ...this.keptProposal, isKept: true });
      this.keptProposal = null;
    }

    // 2. 筛选当前世界上合法候选奏折
    const available = PROPOSAL_TEMPLATES.filter(tmpl => {
      // 避免重复呈上同一张
      if (proposals.some(p => p.id === tmpl.id)) return false;
      return typeof tmpl.conditions === 'function' ? tmpl.conditions(world) : true;
    });

    // 3. 按照类型比例补充 (2人物奏请, 1机会, 1皇室/人事, 1皇权诏令)
    const petitions = available.filter(p => p.type === 'petition');
    const opportunities = available.filter(p => p.type === 'opportunity');
    const royals = available.filter(p => p.type === 'royal');
    const edicts = available.filter(p => p.type === 'edict');

    // 补充人物奏请 (约2份)
    const shuffledPetitions = this.prng.shuffle(petitions);
    while (proposals.length < 3 && shuffledPetitions.length > 0) {
      proposals.push({ ...shuffledPetitions.pop(), isKept: false });
    }

    // 补充世界机会 (约1份)
    const shuffledOpps = this.prng.shuffle(opportunities);
    if (proposals.length < 4 && shuffledOpps.length > 0) {
      proposals.push({ ...shuffledOpps.pop(), isKept: false });
    }

    // 补充皇室人事 (约1份)
    const shuffledRoyals = this.prng.shuffle(royals);
    if (proposals.length < 4 && shuffledRoyals.length > 0) {
      proposals.push({ ...shuffledRoyals.pop(), isKept: false });
    }

    // 用普通诏令补齐至 5 份
    const shuffledEdicts = this.prng.shuffle(edicts);
    while (proposals.length < BALANCE.PROPOSALS_PER_TURN && shuffledEdicts.length > 0) {
      proposals.push({ ...shuffledEdicts.pop(), isKept: false });
    }

    // 极端保底：若仍不足5张，从全部合法候选直接补
    const remainingPool = this.prng.shuffle(available.filter(p => !proposals.some(x => x.id === p.id)));
    while (proposals.length < BALANCE.PROPOSALS_PER_TURN && remainingPool.length > 0) {
      proposals.push({ ...remainingPool.pop(), isKept: false });
    }

    this.currentProposals = proposals;
    return this.currentProposals;
  }

  // 皇帝朱批执行一项奏折 (Section 53)
  enactProposal(proposalId, turn, world) {
    let prop = this.currentProposals.find(p => p.id === proposalId);
    if (!prop) {
      prop = PROPOSAL_TEMPLATES.find(p => p.id === proposalId);
    }
    if (!prop) return null;

    // 1. 执行具体效果
    let feedback = '';
    if (typeof prop.execute === 'function') {
      feedback = prop.execute(world);
    }

    // 2. 种植因果 Hooks (Section 61)
    if (Array.isArray(prop.hiddenHooks)) {
      prop.hiddenHooks.forEach(hookId => {
        world.causalHookManager.addHook(
          hookId,
          turn,
          prop.title,
          prop.sourceCharacterId ? [prop.sourceCharacterId] : []
        );
      });
    }

    // 3. 记录记忆 (Memory)
    if (prop.sourceCharacterId) {
      world.memoryManager.addMemory({
        type: 'character',
        targetId: prop.sourceCharacterId,
        description: `帝准其【${prop.title}】之请，深感简在帝心`,
        importance: 7,
        turn
      });
    }

    return {
      proposal: prop,
      feedback: feedback || '朱批照准，诸司即刻奉行。'
    };
  }

  restore(data) {
    this.currentProposals = Array.isArray(data.currentProposals) ? [...data.currentProposals] : [];
    this.keptProposal = data.keptProposal ? { ...data.keptProposal } : null;
  }
}
