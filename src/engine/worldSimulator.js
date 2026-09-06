// 《一朝天子》Prototype 0.3 世界模拟演进核心 (WorldSimulator)
// 串联天下四方、庙堂百官、天家皇室、八大线程与御前决断，驱动王朝自我演进

import { RandomManager } from './prng.js';
import { REGIONS } from '../data/regions.js';
import { FACTIONS } from '../data/factions.js';
import { BALANCE } from '../data/balance.js';
import { CharacterManager } from './characterManager.js';
import { RoyalFamilyManager } from './royalFamilyManager.js';
import { ThreadManager } from './threadManager.js';
import { EventEngine } from './eventEngine.js';
import { ProposalManager } from './proposalManager.js';
import { NewsManager } from './newsManager.js';
import { MemoryManager } from './memoryManager.js';
import { CausalHookManager } from './causalHookManager.js';
import { SuccessionManager } from './successionManager.js';
import { HistoryManager } from './historyManager.js';

export class WorldSimulator {
  constructor(seed = null) {
    this.initialSeed = seed || RandomManager.generateRandomSeed();
    this.prng = new RandomManager(this.initialSeed);

    // 宏观四大背景属性 (降级为背景氛围，非清红点指标，Section 41)
    this.macroStats = { ...BALANCE.INITIAL_STATS };

    // 四大抽象区域与五大政治势力 (Section 17 & 18)
    this.regions = {
      north: { ...REGIONS.north.initialStats, id: 'north', name: '北境' },
      south: { ...REGIONS.south.initialStats, id: 'south', name: '江南' },
      central: { ...REGIONS.central.initialStats, id: 'central', name: '中原' },
      west: { ...REGIONS.west.initialStats, id: 'west', name: '西陲' }
    };

    this.factions = {
      civil: { influence: FACTIONS.civil.initialInfluence, id: 'civil', name: '文官' },
      military: { influence: FACTIONS.military.initialInfluence, id: 'military', name: '武将' },
      gentry: { influence: FACTIONS.gentry.initialInfluence, id: 'gentry', name: '豪族' },
      merchants: { influence: FACTIONS.merchants.initialInfluence, id: 'merchants', name: '商人' },
      palace: { influence: FACTIONS.palace.initialInfluence, id: 'palace', name: '内廷' }
    };

    // 子系统管理器实例
    this.memoryManager = new MemoryManager();
    this.causalHookManager = new CausalHookManager();
    this.historyManager = new HistoryManager('永安');
    this.characterManager = new CharacterManager(this.prng);
    this.royalFamilyManager = new RoyalFamilyManager(this.prng);
    this.threadManager = new ThreadManager(this.prng);
    this.eventEngine = new EventEngine(this.prng);
    this.proposalManager = new ProposalManager(this.prng);
    this.newsManager = new NewsManager();
    this.successionManager = new SuccessionManager();

    this.turn = 1;
    this.isSuccessionPending = false;
    this.currentAnnals = null;
  }

  get royalFamily() {
    return this.royalFamilyManager;
  }

  startNewGame(seed = null, dynastyName = null, eraName = null) {
    if (seed) {
      this.initialSeed = seed;
      this.prng.reset(seed);
    }

    this.turn = 1;
    this.macroStats = { ...BALANCE.INITIAL_STATS };
    this.isSuccessionPending = false;
    this.currentAnnals = null;

    // 重置四大区域与五大势力
    this.regions.north = { ...REGIONS.north.initialStats, id: 'north', name: '北境' };
    this.regions.south = { ...REGIONS.south.initialStats, id: 'south', name: '江南' };
    this.regions.central = { ...REGIONS.central.initialStats, id: 'central', name: '中原' };
    this.regions.west = { ...REGIONS.west.initialStats, id: 'west', name: '西陲' };

    this.factions.civil = { influence: FACTIONS.civil.initialInfluence, id: 'civil', name: '文官' };
    this.factions.military = { influence: FACTIONS.military.initialInfluence, id: 'military', name: '武将' };
    this.factions.gentry = { influence: FACTIONS.gentry.initialInfluence, id: 'gentry', name: '豪族' };
    this.factions.merchants = { influence: FACTIONS.merchants.initialInfluence, id: 'merchants', name: '商人' };
    this.factions.palace = { influence: FACTIONS.palace.initialInfluence, id: 'palace', name: '内廷' };

    this.memoryManager.reset();
    this.causalHookManager.reset();
    this.characterManager.reset();
    this.royalFamilyManager.reset(dynastyName, eraName);
    this.threadManager.reset();
    this.proposalManager.reset();
    this.newsManager.reset();
    this.successionManager.reset();

    const emp = this.royalFamilyManager.emperor;
    this.historyManager.reset(emp.eraName);
    this.historyManager.recordCoronation(emp.dynasty, emp.eraName, emp.startAge);

    // 第一季度初始 3 条新闻展示
    this.newsManager.filterHeadlines([
      {
        category: 'realm',
        priority: 80,
        title: '【万方称庆】',
        text: `${emp.dynasty}改元【${emp.eraName}】，塞北塞南关津罢兵，海隅父老望阙瞻拜。`
      },
      {
        category: 'court',
        priority: 75,
        title: '【首辅奉表】',
        text: '中书令魏肃率百僚入贺，恭进《圣德颂》，四海升平，朝纲初肃。'
      },
      {
        category: 'palace',
        priority: 70,
        title: '【中宫定分】',
        text: '册立王氏为正宫皇后，正位坤宁，六宫整肃，天家和睦。'
      }
    ], this);

    // 生成第 1 季 5 份御前奏折
    this.proposalManager.generateTurnProposals(1, this);
  }

  // 步入下一季度演进：处理玩家决策（或退朝无为）并推进世界 (Section 22 & 32)
  stepQuarter(chosenProposalId = null) {
    let actionResult = null;

    // 1. 执行玩家决断 (批准一项奏折 或 退朝无为)
    if (chosenProposalId) {
      actionResult = this.proposalManager.enactProposal(chosenProposalId, this.turn, this);
      if (actionResult && actionResult.proposal) {
        this.historyManager.recordPlayerAction(
          this.turn,
          actionResult.proposal.title,
          actionResult.proposal.sourceDepartment,
          actionResult.feedback,
          this.royalFamilyManager.emperor.eraName
        );
      }
    } else {
      // 玩家无为退朝 (Section 32 & 33)
      this.historyManager.recordAdjourn(this.turn, this.royalFamilyManager.emperor.eraName);
    }

    // 2. 时间推进至下一季度
    this.turn++;

    // 3. 执行单季全量世界演进模拟 (线程、人物、皇室、地方、随机)
    const quarterEvents = this.eventEngine.simulateQuarterEvents(this.turn, this);

    // 4. 新闻中枢严格过滤出 3 条核心御前头条 (Section 23 & 57)
    const headlines = this.newsManager.filterHeadlines(quarterEvents, this);

    // 5. 将头条写入史册
    headlines.forEach(h => {
      this.historyManager.recordWorldEvent(
        this.turn,
        h.title,
        h.text,
        h.category,
        this.royalFamilyManager.emperor.eraName
      );
    });

    // 6. 检查皇帝是否在演进中驾崩 (Section 8 & 9)
    if (!this.royalFamilyManager.emperor.alive && !this.isSuccessionPending) {
      this.isSuccessionPending = true;
      this.currentAnnals = this.successionManager.generateImperialAnnals(
        this.royalFamilyManager.emperor,
        this.royalFamilyManager,
        this.characterManager,
        this.historyManager,
        this.causalHookManager
      );
    }

    // 7. 生成下一季度御前 5 份奏折
    this.proposalManager.generateTurnProposals(this.turn, this);

    return {
      turn: this.turn,
      actionResult,
      headlines,
      allEvents: quarterEvents,
      isSuccessionPending: this.isSuccessionPending,
      annals: this.currentAnnals
    };
  }

  // 玩家在皇帝驾崩后，点击【继承大统 · 继续王朝】 (Section 10)
  continueSuccession() {
    if (!this.isSuccessionPending) return null;
    const newEmperor = this.successionManager.executeSuccession(this, this.prng);
    this.isSuccessionPending = false;
    this.currentAnnals = null;

    // 新皇帝登基后，重新刷新当季新闻与奏折
    this.newsManager.filterHeadlines([
      {
        category: 'palace',
        priority: 100,
        title: `【新皇登基】`,
        text: `皇太子【${newEmperor.name}】奉先帝遗诏践祚登基，改元【${newEmperor.eraName}】，垂拱受贺。`
      },
      {
        category: 'court',
        priority: 85,
        title: '【百官奉表】',
        text: '元老宰辅与四方镇将上表劝进，誓守忠荩，辅佐新君。'
      },
      {
        category: 'realm',
        priority: 80,
        title: '【恩诏布宪】',
        text: '颁发新朝恩诏，大赦逋租，天下万民额手仰颂圣化。'
      }
    ], this);

    this.proposalManager.generateTurnProposals(this.turn, this);
    return newEmperor;
  }
}
