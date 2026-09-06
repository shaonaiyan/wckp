// 《一朝天子》Prototype 0.3 核心游戏状态机 (GameState)
// 轻量王朝人生模拟 + 随机御前决策核心架构

import { WorldSimulator } from './engine/worldSimulator.js';
import { TelemetryManager } from './engine/telemetry.js';
import { SaveManager } from './engine/saveManager.js';
import { BALANCE } from './data/balance.js';

export class GameState {
  constructor(seed = null) {
    this.initialSeed = seed;
    this.world = new WorldSimulator(seed);
    this.telemetryManager = new TelemetryManager();

    // 交互状态
    this.selectedProposalId = null;
    this.lastFeedback = null;
    this.isSpectating = false;

    // UI 钩子
    this.onStateChanged = null;
    this.onEnactFeedback = null;
    this.onSuccessionPrompt = null;
    this.onGameEnding = null;
  }

  // 开启全新王朝 (Section 6 & 86)
  startNewGame(seed = null, dynastyName = null, eraName = null) {
    SaveManager.clear();
    this.initialSeed = seed || this.initialSeed;
    this.world.startNewGame(this.initialSeed, dynastyName, eraName);
    this.telemetryManager.reset();

    this.selectedProposalId = null;
    this.lastFeedback = null;
    this.isSpectating = false;

    // 记录首季 Telemetry
    this.telemetryManager.logTurn({
      turn: 1,
      headlines: [...this.world.newsManager.currentHeadlines],
      playerAction: null,
      allEventsCount: 3
    });

    this.notifyStateChanged();
    SaveManager.save(this.world);
  }

  // 点选奏折展开阅读 (Section 53)
  selectProposal(proposalId) {
    if (this.world.isSuccessionPending) return;
    if (this.selectedProposalId === proposalId) {
      this.selectedProposalId = null;
    } else {
      this.selectedProposalId = proposalId;
    }
    this.notifyStateChanged();
  }

  // 皇帝【朱批】执行选中的奏折 (Section 32 & 53)
  enactSelectedProposal() {
    if (this.world.isSuccessionPending) return null;
    if (!this.selectedProposalId) return null;

    const chosenId = this.selectedProposalId;
    const chosenProposal = this.world.proposalManager.currentProposals.find(p => p.id === chosenId);
    this.selectedProposalId = null;

    // 推进并演化下一季度
    const stepResult = this.world.stepQuarter(chosenId);
    this.lastFeedback = stepResult.actionResult ? stepResult.actionResult.feedback : '朱批照准，诸司即刻奉行。';

    // 记录 Telemetry
    this.telemetryManager.logTurn({
      turn: stepResult.turn,
      headlines: [...stepResult.headlines],
      playerAction: chosenProposal ? chosenProposal.title : '朱批奏折',
      allEventsCount: stepResult.allEvents.length
    });

    if (typeof this.onEnactFeedback === 'function') {
      this.onEnactFeedback(this.lastFeedback, chosenProposal);
    }

    if (stepResult.isSuccessionPending && typeof this.onSuccessionPrompt === 'function') {
      this.onSuccessionPrompt(stepResult.annals);
    }

    SaveManager.save(this.world);
    this.notifyStateChanged();
    return stepResult;
  }

  // 标记【留中待议】 (Section 60)
  toggleKeepProposal(proposalId) {
    if (this.world.isSuccessionPending) return;
    this.world.proposalManager.toggleKeepProposal(proposalId);
    this.notifyStateChanged();
  }

  // 玩家选择【退朝 · 无为】 (Section 32 & 33)
  // 这是 0.3 的正统第一公民玩法，不扣行动点，世界自己运转！
  adjournCourt() {
    if (this.world.isSuccessionPending) return null;
    this.selectedProposalId = null;

    const stepResult = this.world.stepQuarter(null);
    this.lastFeedback = '本季未另发特旨，诸司依例行事。';

    // 记录 Telemetry
    this.telemetryManager.logTurn({
      turn: stepResult.turn,
      headlines: [...stepResult.headlines],
      playerAction: null,
      allEventsCount: stepResult.allEvents.length
    });

    if (stepResult.isSuccessionPending && typeof this.onSuccessionPrompt === 'function') {
      this.onSuccessionPrompt(stepResult.annals);
    }

    SaveManager.save(this.world);
    this.notifyStateChanged();
    return stepResult;
  }

  // 储君即位：【继承大统 · 继续王朝】 (Section 9 & 10)
  continueSuccession() {
    const newEmperor = this.world.continueSuccession();
    this.selectedProposalId = null;
    this.lastFeedback = `大行皇帝入庙，新君【${newEmperor.name}】改元【${newEmperor.eraName}】，登极大赦。`;

    SaveManager.save(this.world);
    this.notifyStateChanged();
    return newEmperor;
  }

  // 关注 / 取消关注人物 (☆ / ★) (Section 25)
  toggleFollowCharacter(characterId) {
    const res = this.world.characterManager.toggleFollow(characterId);
    this.notifyStateChanged();
    return res;
  }

  // 旁观模式：连续运行指定季度 (Section 4 & 70)
  spectateQuarters(quartersCount = 20) {
    this.isSpectating = true;
    for (let i = 0; i < quartersCount; i++) {
      if (this.world.isSuccessionPending) {
        this.world.continueSuccession();
      }
      this.adjournCourt();
    }
    this.isSpectating = false;
    this.notifyStateChanged();
    return this.telemetryManager.calculateMetrics(this.world);
  }

  notifyStateChanged() {
    if (typeof this.onStateChanged === 'function') {
      this.onStateChanged(this);
    }
  }

  // 恢复存档 (Section 10)
  loadFromSave() {
    try {
      const data = SaveManager.load();
      if (!data) return false;

      this.initialSeed = data.seed || this.initialSeed;
      this.world.initialSeed = this.initialSeed;
      this.world.turn = data.turn || 1;
      this.world.macroStats = data.macroStats ? { ...data.macroStats } : { ...BALANCE.INITIAL_STATS };
      this.world.regions = data.regions ? { ...data.regions } : this.world.regions;
      this.world.factions = data.factions ? { ...data.factions } : this.world.factions;

      this.world.characterManager.restore(data);
      this.world.royalFamilyManager.restore(data.royalFamily);
      this.world.successionManager.restore(data.pastEmperors);
      this.world.threadManager.restore(data.threads);
      this.world.causalHookManager.restore(data.causalHooks);
      this.world.memoryManager.restore(data.memories);
      this.world.proposalManager.restore(data.proposals);
      this.world.newsManager.restore(data.headlines);
      this.world.historyManager.restore(data.history);

      if (data.telemetryLogs) {
        if (this.telemetryManager) {
          this.telemetryManager.turnLogs = [...data.telemetryLogs];
        }
        if (this.world.telemetryManager) {
          this.world.telemetryManager.turnLogs = [...data.telemetryLogs];
        }
      }

      this.selectedProposalId = null;
      this.notifyStateChanged();
      return true;
    } catch (e) {
      console.error('Failed to load save in Prototype 0.3:', e);
      return false;
    }
  }

  // =================== 6大标准测试场景 (Section 72) ===================

  // Test A: 纯旁观 (20季度，完全不操作，验证世界自运转)
  setupScenarioTestA() {
    this.startNewGame('test_a_spectator_seed');
    return this.spectateQuarters(20);
  }

  enactAndRecord(proposalId) {
    const res = this.world.proposalManager.enactProposal(proposalId, this.world.turn, this.world);
    if (res && res.proposal) {
      this.world.historyManager.recordPlayerAction(
        this.world.turn,
        res.proposal.title,
        res.proposal.sourceDepartment,
        res.feedback,
        this.world.royalFamilyManager.emperor.eraName
      );
    }
    return res;
  }

  // Test B: 提拔名臣 (沈恪：改革、刚直，观察变法、政敌与储君师生关系)
  setupScenarioTestB() {
    this.startNewGame('test_b_shen_ke_seed');
    // 强制批准均田清丈法令
    this.enactAndRecord('petition_shen_ke_reform');
    // 任沈恪为储君少傅
    this.enactAndRecord('royal_appoint_shen_tutor');
    // 旁观推演 12 季
    return this.spectateQuarters(12);
  }

  // Test C: 养大将 (韩策：尚武、野心，连续批准增兵并观察门阀势力与军权演变)
  setupScenarioTestC() {
    this.startNewGame('test_c_han_ce_seed');
    // 批准增兵三万
    this.enactAndRecord('petition_han_ce_reinforce');
    // 连续推演 8 季
    this.spectateQuarters(8);
    // 召韩策入京
    this.enactAndRecord('royal_summon_han_ce_capital');
    return this.spectateQuarters(8);
  }

  // Test D: 完全昏君 (大修离宫、求仙问药、大典、狩猎，观察荒诞但有趣的历史)
  setupScenarioTestD() {
    this.startNewGame('test_d_hedonist_seed');
    // 修建西苑神仙殿宇
    this.enactAndRecord('petition_wang_cheng_palace');
    // 炼九转金丹
    this.enactAndRecord('edict_seek_immortality');
    // 御驾南巡
    this.enactAndRecord('edict_southern_tour');
    return this.spectateQuarters(12);
  }

  // Test E: 储君成长 (储君5岁，推进15年，检查启蒙、择师、议政与成年)
  setupScenarioTestE() {
    this.startNewGame('test_e_heir_growth_seed');
    const heir = this.world.royalFamilyManager.getHeir();
    if (heir) heir.age = 5;
    // 推进 15 年 = 60 季
    return this.spectateQuarters(60);
  }

  // Test F: 皇帝死亡继位 (强制驾崩，确认世界、人物、关系、Thread不重置，新皇继续)
  setupScenarioTestF() {
    this.startNewGame('test_f_succession_seed');
    // 推进 8 季
    this.spectateQuarters(8);
    // 强制皇帝死亡
    this.world.royalFamilyManager.forceEmperorDeath(this.world.turn);
    this.world.isSuccessionPending = true;
    this.world.currentAnnals = this.world.successionManager.generateImperialAnnals(
      this.world.royalFamilyManager.emperor,
      this.world.royalFamilyManager,
      this.world.characterManager,
      this.world.historyManager,
      this.world.causalHookManager
    );
    // 执行登基继位
    this.continueSuccession();
    // 继位后继续运转 8 季
    return this.spectateQuarters(8);
  }
}
