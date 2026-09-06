// Prototype 0.2 核心游戏状态机与流程控制 (GameState)
import { RandomManager } from './engine/prng.js';
import { StateManager } from './engine/stateManager.js';
import { SituationManager } from './engine/situationManager.js';
import { DeckManager } from './engine/deckManager.js';
import { ResidueManager } from './engine/residueManager.js';
import { PolicyManager } from './engine/policyManager.js';
import { HistoryManager } from './engine/historyManager.js';
import { TelemetryManager } from './engine/telemetry.js';
import { SaveManager } from './engine/saveManager.js';
import { InteractionResolver } from './engine/interactionResolver.js';
import { BALANCE } from './data/balance.js';
import { CARDS } from './data/cards.js';
import { RESIDUES } from './data/residues.js';

export class GameState {
  constructor(seed = null) {
    this.initialSeed = seed || RandomManager.generateRandomSeed();
    this.randomManager = new RandomManager(this.initialSeed);
    this.stateManager = new StateManager(this.randomManager);
    this.situationManager = new SituationManager(this.randomManager);
    this.deckManager = new DeckManager(this.randomManager);
    this.residueManager = new ResidueManager();
    this.policyManager = new PolicyManager(this.randomManager);
    this.historyManager = new HistoryManager('永和');
    this.telemetryManager = new TelemetryManager();

    // 流程控制变量
    this.turn = 1;
    this.phase = 'PLAY_CARD'; // 'PLAY_CARD' | 'POST_PLAY' | 'ANNUAL_POLICY' | 'ENDED'
    this.isGameOver = false;
    this.gameOutcome = null;
    this.defeatReason = null;
    this.godMode = false;

    // 选择状态
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.autoTargeted = false;
    this.lastActionResult = null;
    this.pendingNeglectLogs = [];

    // UI 回调钩子
    this.onStateChanged = null;
    this.onPlayFeedback = null;
    this.onAnnualDraft = null;
    this.onGameOver = null;
  }

  // 开启新局
  startNewGame(seed = null, eraName = null) {
    SaveManager.clear();
    const activeSeed = seed || RandomManager.generateRandomSeed();
    this.initialSeed = activeSeed;
    this.randomManager.reset(activeSeed);

    const pickedEra = eraName || this.randomManager.choice(BALANCE.ERA_NAMES) || '永和';

    this.stateManager.reset();
    this.situationManager.reset();
    this.deckManager.reset();
    this.residueManager.reset();
    this.policyManager.reset();
    this.historyManager.reset(pickedEra);
    this.telemetryManager.reset(activeSeed, pickedEra);

    this.turn = 1;
    this.phase = 'PLAY_CARD';
    this.isGameOver = false;
    this.gameOutcome = null;
    this.defeatReason = null;
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.autoTargeted = false;
    this.lastActionResult = null;
    this.pendingNeglectLogs = [];

    this.historyManager.recordCoronation();
    this.situationManager.setupFirstTurn();
    this.deckManager.drawHand(BALANCE.HAND_SIZE, this.situationManager.getActive());

    this.notifyStateChanged();
    SaveManager.save(this);
  }

  // 恢复存档 (Prototype 0.2)
  loadFromSave() {
    try {
      const data = SaveManager.load();
      if (!data) return false;

      // 恢复种子与随机数发生器
      this.initialSeed = data.seed || this.initialSeed;
      this.randomManager = new RandomManager(this.initialSeed);

      // 基础流程状态
      this.turn = data.turn || 1;
      this.phase = data.phase || 'PLAY_CARD';
      this.isGameOver = !!data.isGameOver;
      this.gameOutcome = data.gameOutcome || null;
      this.defeatReason = data.defeatReason || null;
      this.godMode = !!data.godMode;

      // 恢复宏观健康度
      if (data.stats) {
        this.stateManager.treasury = data.stats.treasury;
        this.stateManager.morale = data.stats.morale;
        this.stateManager.military = data.stats.military;
        this.stateManager.court = data.stats.court;
      }

      // 恢复牌库与手牌
      this.deckManager.drawPile = Array.isArray(data.drawPile) ? [...data.drawPile] : [];
      this.deckManager.discardPile = Array.isArray(data.discardPile) ? [...data.discardPile] : [];
      this.deckManager.hand = Array.isArray(data.hand) ? [...data.hand] : [];
      this.deckManager.keptCard = data.keptCard ? { ...data.keptCard } : null;
      this.deckManager.handBeforePlay = this.deckManager.hand.map(c => ({ ...c }));
      if (data.cardStats) {
        this.deckManager.cardStats = { ...data.cardStats };
      }

      // 恢复局势
      this.situationManager.activeSituations = Array.isArray(data.activeSituations) ? [...data.activeSituations] : [];
      this.situationManager.deferredQueue = Array.isArray(data.deferredQueue) ? [...data.deferredQueue] : [];
      if (data.situationHistory) {
        this.situationManager.situationHistory = { ...data.situationHistory };
      }

      // 恢复后遗状态与年度国策
      this.residueManager.activeResidues = Array.isArray(data.activeResidues) ? [...data.activeResidues] : [];
      this.policyManager.activePolicies = Array.isArray(data.activePolicies) ? [...data.activePolicies] : [];
      this.policyManager.pendingOptions = null;

      // 恢复史册编年
      this.historyManager.eraName = data.eraName || '永和';
      this.historyManager.entries = Array.isArray(data.historyEntries) ? [...data.historyEntries] : [];

      // 恢复遥测数据
      if (data.turnLogs) this.telemetryManager.turnLogs = [...data.turnLogs];
      if (data.gameMetadata) this.telemetryManager.gameMetadata = { ...data.gameMetadata };
      if (data.qualityCounts) this.telemetryManager.qualityCounts = { ...data.qualityCounts };
      if (data.totalNeglectEscalations !== undefined) {
        this.telemetryManager.totalNeglectEscalations = data.totalNeglectEscalations;
      }

      // 重置当轮选择状态
      this.selectedCardId = null;
      this.selectedSituationId = null;
      this.autoTargeted = false;
      this.lastActionResult = null;
      this.pendingNeglectLogs = [];

      this.notifyStateChanged();

      // 如果当前处于年度定策阶段，生成并唤出候选
      if (this.phase === 'ANNUAL_POLICY') {
        const draftOptions = this.policyManager.generateDraftOptions();
        if (typeof this.onAnnualDraft === 'function') {
          this.onAnnualDraft(draftOptions);
        }
      }

      // 如果存档已终局，触发终局弹窗
      if (this.isGameOver && typeof this.onGameOver === 'function') {
        this.onGameOver({ outcome: this.gameOutcome, reason: this.defeatReason });
      }

      return true;
    } catch (e) {
      console.error('Failed to load from save:', e);
      return false;
    }
  }

  getCurrentTimeText() {
    return this.historyManager.getYearSeasonText(this.turn);
  }

  // 选择手牌，并执行智能自动索敌 (Section 1)
  selectCard(cardId) {
    if (this.phase !== 'PLAY_CARD' || this.isGameOver) return;

    if (this.selectedCardId === cardId) {
      // 取消选中
      this.selectedCardId = null;
      this.selectedSituationId = null;
      this.autoTargeted = false;
    } else {
      this.selectedCardId = cardId;
      const card = this.deckManager.hand.find(c => c.id === cardId);
      const analysis = InteractionResolver.analyzeCardOptions(
        card,
        this.stateManager,
        this.situationManager.getActive(),
        this.policyManager,
        this.residueManager
      );

      if (analysis.autoTarget) {
        // 存在唯一明显合法目标：直接自动锁定该目标！
        this.selectedSituationId = analysis.autoTarget.id;
        this.autoTargeted = true;
      } else {
        // 多个合法目标或无合法目标：清空目标待玩家点选
        this.selectedSituationId = null;
        this.autoTargeted = false;
      }
    }
    this.notifyStateChanged();
  }

  // 手动点击局势作为目标
  selectSituation(situationId) {
    if (this.phase !== 'PLAY_CARD' || this.isGameOver) return;
    this.selectedSituationId = (this.selectedSituationId === situationId) ? null : situationId;
    this.autoTargeted = false;
    this.notifyStateChanged();
  }

  // 分析手牌的 Meaningful Choice 指标
  evaluateHandChoices() {
    const activeSits = this.situationManager.getActive();
    let excellentCount = 0;
    let goodCount = 0;
    let weakCount = 0;
    let unrelatedCount = 0;

    for (const card of this.deckManager.hand) {
      const analysis = InteractionResolver.analyzeCardOptions(
        card,
        this.stateManager,
        activeSits,
        this.policyManager,
        this.residueManager
      );
      if (analysis.bestQuality === 'excellent') excellentCount++;
      else if (analysis.bestQuality === 'good') goodCount++;
      else if (analysis.bestQuality === 'weak') weakCount++;
      else unrelatedCount++;
    }

    return {
      excellentChoiceCount: excellentCount,
      goodChoiceCount: goodCount,
      weakChoiceCount: weakCount,
      unrelatedChoiceCount: unrelatedCount
    };
  }

  // 玩家打出选中的牌
  playSelectedCard() {
    if (this.phase !== 'PLAY_CARD' || this.isGameOver) return null;
    if (!this.selectedCardId) return null;

    const card = this.deckManager.hand.find(c => c.id === this.selectedCardId);
    if (!card) return null;

    // 快照记录 (出牌前)
    const handBeforePlay = this.deckManager.hand.map(c => c.id);
    const statsBefore = this.stateManager.getStats();
    const situationsBefore = this.situationManager.getActive().map(s => ({
      id: s.id,
      name: s.name,
      stage_before: s.stage
    }));
    const meaningfulChoices = this.evaluateHandChoices();

    // 解析出牌效果
    const result = InteractionResolver.resolve(
      card,
      this.selectedSituationId,
      this.stateManager,
      this.situationManager,
      this.residueManager,
      this.policyManager
    );

    if (!result.success) return result;

    this.lastActionResult = result;
    this.phase = 'POST_PLAY'; // 转入出牌后阶段 (可选保留牌并准备退朝)

    // 记录史册因果
    const targetName = result.targetSituation ? result.targetSituation.name : null;
    const residueDef = result.newResidue ? RESIDUES[result.newResidue] : null;
    this.historyManager.recordCausalAction(
      this.turn,
      targetName,
      card.name,
      result.historyText,
      residueDef ? residueDef.name : null
    );

    // 记录 Telemetry 0.2
    this.telemetryManager.logTurn({
      turn: this.turn,
      year: Math.floor((this.turn - 1) / BALANCE.ROUNDS_PER_YEAR) + 1,
      season: BALANCE.SEASONS[(this.turn - 1) % BALANCE.ROUNDS_PER_YEAR],
      hand_before_play: handBeforePlay,
      card_played: card.id,
      target: result.targetSituation ? result.targetSituation.id : null,
      auto_targeted: result.autoTargeted,
      interaction_quality: result.quality,
      situation_before: situationsBefore,
      situation_after: this.situationManager.getActive().map(s => ({
        id: s.id,
        name: s.name,
        stage_after: s.stage
      })),
      resolved: result.sitResolution ? result.sitResolution.resolved : false,
      escalated: false,
      residue_created: result.newResidue,
      residue_removed: result.residueRemoved ? result.residueRemoved.id : null,
      draw_pile_count: this.deckManager.drawPile.length,
      discard_pile_count: this.deckManager.discardPile.length,
      stats_before: statsBefore,
      stats_after: this.stateManager.getStats(),
      meaningful_choices: meaningfulChoices,
      random_seed: this.randomManager.seed
    });

    if (typeof this.onPlayFeedback === 'function') {
      this.onPlayFeedback(result);
    }

    this.checkEndCondition();
    SaveManager.save(this);
    this.notifyStateChanged();
    return result;
  }

  // 标记/取消保留牌 (留待下朝)
  toggleKeepCard(cardId) {
    if (this.phase !== 'POST_PLAY' || this.isGameOver) return;
    this.deckManager.toggleKeptCard(cardId);
    this.notifyStateChanged();
  }

  // 点击【退朝】进入下一季度
  adjournCourt() {
    if (this.phase !== 'POST_PLAY' || this.isGameOver) return;

    if (this.turn >= BALANCE.MAX_TURNS) {
      this.triggerVictory();
      return;
    }

    // 1. 弃牌处理：打出的牌和未保留牌入弃牌堆
    const playedCardId = this.lastActionResult ? this.lastActionResult.card.id : null;
    this.deckManager.finalizeTurn(playedCardId);

    // 2. 后遗状态推进
    this.residueManager.tick(this.stateManager);

    // 3. 放任恶化推进 (核心：未干预的局势恶化并触发离散后果)
    const neglectLogs = this.situationManager.tickNeglect(this.stateManager);
    this.pendingNeglectLogs = neglectLogs;

    for (const nlog of neglectLogs) {
      this.telemetryManager.recordNeglectEscalation();
      const stageText = nlog.oldStage ? `【${BALANCE.SITUATION_STAGES[nlog.oldStage].name}】恶化为【${BALANCE.SITUATION_STAGES[nlog.newStage].name}】` : '发生变故';
      this.historyManager.recordNeglect(this.turn, nlog.situation, stageText, nlog.historyText);
    }

    // 检查失败
    if (this.checkEndCondition()) return;

    // 4. 年度定策检查：每4季末触发一次 (Turn 4, 8, 12, 16...)
    if (this.turn % BALANCE.ROUNDS_PER_YEAR === 0 && this.turn < BALANCE.MAX_TURNS) {
      this.phase = 'ANNUAL_POLICY';
      const draftOptions = this.policyManager.generateDraftOptions();
      this.notifyStateChanged();
      if (typeof this.onAnnualDraft === 'function') {
        this.onAnnualDraft(draftOptions);
      }
      return; // 暂停等待玩家选择年度国策
    }

    this.advanceToNextTurn();
  }

  // 玩家选定年度国策后，继续推进回合
  applyAnnualPolicySelection(policyId) {
    const res = this.policyManager.selectPolicy(policyId);
    if (res && res.policy) {
      this.historyManager.recordPolicy(this.turn, res.policy.name, res.policy.description);
    }
    this.advanceToNextTurn();
  }

  // 正式步入下一轮抽牌
  advanceToNextTurn() {
    this.turn++;
    this.phase = 'PLAY_CARD';
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.autoTargeted = false;
    this.lastActionResult = null;

    // 评估生成新局势
    this.situationManager.evaluateGeneration(this.turn, this.stateManager, this.residueManager);

    if (this.checkEndCondition()) return;

    // 补抽手牌至5张
    this.deckManager.drawHand(BALANCE.HAND_SIZE, this.situationManager.getActive());

    SaveManager.save(this);
    this.notifyStateChanged();
  }

  checkEndCondition() {
    if (this.isGameOver) return true;

    const defeat = this.stateManager.checkDefeat(this.situationManager.getActive(), this.godMode);
    if (defeat) {
      this.triggerDefeat(defeat.reason);
      return true;
    }

    if (this.turn > BALANCE.MAX_TURNS) {
      this.triggerVictory();
      return true;
    }

    return false;
  }

  triggerDefeat(reason) {
    this.isGameOver = true;
    this.gameOutcome = 'defeat';
    this.defeatReason = reason;
    this.phase = 'ENDED';

    this.historyManager.recordEnding(this.turn, false, reason);
    this.telemetryManager.finalizeGame('defeat', reason);

    SaveManager.save(this);
    this.notifyStateChanged();

    if (typeof this.onGameOver === 'function') {
      this.onGameOver({ outcome: 'defeat', reason });
    }
  }

  triggerVictory() {
    this.isGameOver = true;
    this.gameOutcome = 'victory';
    this.defeatReason = null;
    this.phase = 'ENDED';

    this.historyManager.recordEnding(this.turn, true, '四海升平，一代治世');
    this.telemetryManager.finalizeGame('victory', '四海暂安');

    SaveManager.save(this);
    this.notifyStateChanged();

    if (typeof this.onGameOver === 'function') {
      this.onGameOver({ outcome: 'victory', reason: '四海暂安，一代令主' });
    }
  }

  notifyStateChanged() {
    if (typeof this.onStateChanged === 'function') {
      this.onStateChanged(this);
    }
  }

  // =================== Debug 4大标准测试场景 (Section 35) ===================

  // Test A: 黄河水患
  // 场上只有：黄河水患·恶化(stage 2)
  // 手牌固定：开仓赈济、兴修水利、征发民夫、开海通商、大赦天下
  setupScenarioTestA() {
    this.phase = 'PLAY_CARD';
    this.situationManager.clearAll();
    this.situationManager.addSituation('yellow_river_flood');
    this.situationManager.forceSetStage('yellow_river_flood', 2);

    this.deckManager.hand = [];
    const testCards = ['granary_relief', 'water_conservancy', 'conscript_labor', 'open_sea_trade', 'general_amnesty'];
    testCards.forEach(cid => {
      const def = CARDS.find(c => c.id === cid);
      if (def) this.deckManager.hand.push({ ...def, isKeptFromPrev: false });
    });
    this.deckManager.handBeforePlay = this.deckManager.hand.map(c => ({ ...c }));
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.notifyStateChanged();
  }

  // Test B: 北境危机
  // 场上：北境犯边·危急(stage 3)
  // 手牌：调兵北上、和亲息战、开放互市、加征赋税、整顿吏治
  setupScenarioTestB() {
    this.phase = 'PLAY_CARD';
    this.situationManager.clearAll();
    this.situationManager.addSituation('northern_incursion');
    this.situationManager.forceSetStage('northern_incursion', 3);

    this.deckManager.hand = [];
    const testCards = ['dispatch_troops_north', 'peace_marriage', 'open_border_market', 'levy_taxes', 'rectify_governance'];
    testCards.forEach(cid => {
      const def = CARDS.find(c => c.id === cid);
      if (def) this.deckManager.hand.push({ ...def, isKeptFromPrev: false });
    });
    this.deckManager.handBeforePlay = this.deckManager.hand.map(c => ({ ...c }));
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.notifyStateChanged();
  }

  // Test C: 双重危机
  // 场上：黄河水患·恶化(stage 2) + 北境犯边·恶化(stage 2)
  // 手牌：各有应对牌，只能出1张
  setupScenarioTestC() {
    this.phase = 'PLAY_CARD';
    this.situationManager.clearAll();
    this.situationManager.addSituation('yellow_river_flood');
    this.situationManager.forceSetStage('yellow_river_flood', 2);
    this.situationManager.addSituation('northern_incursion');
    this.situationManager.forceSetStage('northern_incursion', 2);

    this.deckManager.hand = [];
    const testCards = ['granary_relief', 'dispatch_troops_north', 'open_sea_trade', 'covert_demotion', 'store_grain'];
    testCards.forEach(cid => {
      const def = CARDS.find(c => c.id === cid);
      if (def) this.deckManager.hand.push({ ...def, isKeptFromPrev: false });
    });
    this.deckManager.handBeforePlay = this.deckManager.hand.map(c => ({ ...c }));
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.notifyStateChanged();
  }

  // Test D: 盛世
  // 场上：江南丰收 + 海贸兴起 (无灾难)
  // 手牌：蠲免田赋、开海通商、储粮备荒、劝农垦荒、加征赋税
  setupScenarioTestD() {
    this.phase = 'PLAY_CARD';
    this.situationManager.clearAll();
    this.situationManager.addSituation('harvest_south');
    this.situationManager.addSituation('thriving_sea_trade');

    this.deckManager.hand = [];
    const testCards = ['tax_relief', 'open_sea_trade', 'store_grain', 'encourage_reclamation', 'levy_taxes'];
    testCards.forEach(cid => {
      const def = CARDS.find(c => c.id === cid);
      if (def) this.deckManager.hand.push({ ...def, isKeptFromPrev: false });
    });
    this.deckManager.handBeforePlay = this.deckManager.hand.map(c => ({ ...c }));
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.notifyStateChanged();
  }

  // 调试助手
  debugNextTurn() {
    if (this.phase === 'PLAY_CARD' && this.deckManager.hand.length > 0) {
      this.selectCard(this.deckManager.hand[0].id);
      this.playSelectedCard();
    }
    if (this.phase === 'POST_PLAY') {
      this.adjournCourt();
    }
  }
}
