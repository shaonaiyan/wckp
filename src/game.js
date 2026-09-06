// 核心游戏状态机与控制流管理器
import { RandomManager } from './engine/prng.js';
import { StateManager } from './engine/stateManager.js';
import { SituationManager } from './engine/situationManager.js';
import { CardManager } from './engine/cardManager.js';
import { HistoryManager } from './engine/historyManager.js';
import { TelemetryManager } from './engine/telemetry.js';
import { SaveManager } from './engine/saveManager.js';
import { BALANCE } from './data/balance.js';
import { CARDS } from './data/cards.js';
import { SITUATIONS } from './data/situations.js';

export class GameState {
  constructor(seed = null) {
    this.initialSeed = seed || RandomManager.generateRandomSeed();
    this.randomManager = new RandomManager(this.initialSeed);
    this.stateManager = new StateManager(this.randomManager);
    this.situationManager = new SituationManager(this.randomManager);
    this.cardManager = new CardManager(this.randomManager);
    this.historyManager = new HistoryManager('永和');
    this.telemetryManager = new TelemetryManager();

    // 游戏流程变量
    this.turn = 1;
    this.phase = 'PLAY_CARD'; // 'PLAY_CARD' | 'POST_PLAY' | 'RESOLVING' | 'ENDED'
    this.isGameOver = false;
    this.gameOutcome = null; // 'victory' | 'defeat'
    this.defeatReason = null;
    this.godMode = false;

    // 当前选中的卡牌与目标
    this.selectedCardId = null;
    this.selectedSituationId = null;

    // 本轮打牌结算反馈缓存
    this.lastActionResult = null;

    // 监听回调 (用于UI更新)
    this.onStateChanged = null;
    this.onPlayFeedback = null;
    this.onGameOver = null;
  }

  // 启动新游戏
  startNewGame(seed = null, eraName = null) {
    SaveManager.clear();
    const activeSeed = seed || RandomManager.generateRandomSeed();
    this.initialSeed = activeSeed;
    this.randomManager.reset(activeSeed);

    const pickedEra = eraName || this.randomManager.choice(BALANCE.ERA_NAMES) || '永和';

    this.stateManager.reset();
    this.situationManager.reset();
    this.cardManager.reset();
    this.historyManager.reset(pickedEra);
    this.telemetryManager.reset(activeSeed, pickedEra);

    this.turn = 1;
    this.phase = 'PLAY_CARD';
    this.isGameOver = false;
    this.gameOutcome = null;
    this.defeatReason = null;
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.lastActionResult = null;

    // 记录登基
    this.historyManager.recordCoronation();

    // 第1轮初始化：仅有【江南丰收】
    this.situationManager.setupFirstTurn();

    // 抽取第1轮手牌5张
    this.cardManager.drawHand(this.stateManager, this.situationManager.getActive());

    this.notifyStateChanged();
    SaveManager.save(this);
  }

  // 从存档恢复游戏
  loadFromSave() {
    const data = SaveManager.load();
    if (!data) return false;

    try {
      this.initialSeed = data.seed;
      this.randomManager = new RandomManager(data.seed);
      this.turn = data.turn;
      this.phase = data.phase || 'PLAY_CARD';
      this.isGameOver = data.isGameOver;
      this.gameOutcome = data.gameOutcome;
      this.defeatReason = data.defeatReason;
      this.godMode = data.godMode || false;

      // 恢复 StateManager
      this.stateManager.treasury = data.stats.treasury;
      this.stateManager.morale = data.stats.morale;
      this.stateManager.military = data.stats.military;
      this.stateManager.court = data.stats.court;
      this.stateManager.longTermStates = [...data.longTermStates];
      this.stateManager.actionHistory = [...data.actionHistory];
      this.stateManager.categoryCounts = { ...data.categoryCounts };
      this.stateManager.recentStreaks = { ...data.recentStreaks };
      this.stateManager.debtCount = data.debtCount || 0;
      this.stateManager.rewardCount = data.rewardCount || 0;
      this.stateManager.lowMoraleTurns = data.lowMoraleTurns || 0;
      this.stateManager.highCourtTurns = data.highCourtTurns || 0;

      // 恢复 SituationManager
      this.situationManager.activeSituations = [...data.activeSituations];
      this.situationManager.deferredQueue = [...data.deferredQueue];
      this.situationManager.situationHistory = { ...data.situationHistory };

      // 恢复 CardManager
      this.cardManager.hand = [...data.hand];
      this.cardManager.keptCard = data.keptCard ? { ...data.keptCard } : null;
      this.cardManager.pendingCard = data.pendingCard ? { ...data.pendingCard } : null;
      this.cardManager.cardStats = { ...data.cardStats };

      // 恢复 History
      this.historyManager.reset(data.eraName);
      this.historyManager.entries = [...data.historyEntries];

      // 恢复 Telemetry
      this.telemetryManager.turnLogs = [...data.turnLogs];
      this.telemetryManager.gameMetadata = { ...data.gameMetadata };

      this.selectedCardId = null;
      this.selectedSituationId = null;

      this.notifyStateChanged();
      return true;
    } catch (e) {
      console.error('Failed to restore save:', e);
      return false;
    }
  }

  // 获取纪年文本
  getCurrentTimeText() {
    return this.historyManager.getYearSeasonText(this.turn);
  }

  // 选择手牌
  selectCard(cardId) {
    if (this.phase !== 'PLAY_CARD' || this.isGameOver) return;
    if (this.selectedCardId === cardId) {
      this.selectedCardId = null; // 取消选中
      this.selectedSituationId = null;
    } else {
      this.selectedCardId = cardId;
      const card = this.cardManager.hand.find(c => c.id === cardId);
      // 如果该牌不适用局势目标，清空选中的局势
      if (card && card.targetType === 'none') {
        this.selectedSituationId = null;
      }
    }
    this.notifyStateChanged();
  }

  // 选择局势（作为打牌的目标）
  selectSituation(situationId) {
    if (this.phase !== 'PLAY_CARD' || this.isGameOver) return;
    if (this.selectedSituationId === situationId) {
      this.selectedSituationId = null;
    } else {
      this.selectedSituationId = situationId;
    }
    this.notifyStateChanged();
  }

  // 玩家打出选中的牌
  playSelectedCard() {
    if (this.phase !== 'PLAY_CARD' || this.isGameOver) return null;
    if (!this.selectedCardId) return null;

    const card = this.cardManager.hand.find(c => c.id === this.selectedCardId);
    if (!card) return null;

    // 记录打牌前的快照用于 Telemetry
    const statsBefore = this.stateManager.getStats();
    const situationsBefore = this.situationManager.getActive().map(s => ({ ...s }));

    // 执行出牌
    const result = this.cardManager.playCard(
      this.selectedCardId,
      this.selectedSituationId,
      this.stateManager,
      this.situationManager
    );

    if (!result.success) return result;

    this.lastActionResult = result;
    this.phase = 'POST_PLAY'; // 切换到出牌后阶段（可选择保留牌，准备退朝）

    // 记录史册
    const situationText = result.sitResolution ? result.sitResolution.text : null;
    this.historyManager.recordTurnEvent(this.turn, card.name, result.flavor, result.delta, situationText);

    // 记录 Telemetry
    this.telemetryManager.logTurn({
      turn: this.turn,
      year: Math.floor((this.turn - 1) / BALANCE.ROUNDS_PER_YEAR) + 1,
      season: BALANCE.SEASONS[(this.turn - 1) % BALANCE.ROUNDS_PER_YEAR],
      stats_before: statsBefore,
      situations_before: situationsBefore,
      cards_drawn: this.cardManager.hand.map(c => c.id),
      card_kept_from_previous: card.isKeptFromPrev ? card.id : null,
      card_played: card.id,
      target: this.selectedSituationId,
      effects: result.delta,
      stats_after: this.stateManager.getStats(),
      situations_after: this.situationManager.getActive().map(s => ({ ...s })),
      long_term_states: [...this.stateManager.longTermStates],
      random_seed: this.randomManager.seed
    });

    // 触发视觉与音效/文字反馈
    if (typeof this.onPlayFeedback === 'function') {
      this.onPlayFeedback(result);
    }

    // 检查即时失败判定
    this.checkEndCondition();

    SaveManager.save(this);
    this.notifyStateChanged();
    return result;
  }

  // 玩家在打完牌后，选择保留1张未使用的手牌（留待下朝）
  toggleKeepCard(cardId) {
    if (this.phase !== 'POST_PLAY' || this.isGameOver) return;
    if (this.cardManager.keptCard && this.cardManager.keptCard.id === cardId) {
      this.cardManager.setKeptCard(null); // 取消保留
    } else {
      this.cardManager.setKeptCard(cardId);
    }
    this.notifyStateChanged();
  }

  // 点击【退朝】进入下一季度
  adjournCourt() {
    if (this.phase !== 'POST_PLAY' || this.isGameOver) return;

    // 检查是否已达到40轮上限胜利
    if (this.turn >= BALANCE.MAX_TURNS) {
      this.triggerVictory();
      return;
    }

    // 进入新的一轮流程 (四、每轮标准流程)
    this.turn++;
    this.phase = 'PLAY_CARD';
    this.selectedCardId = null;
    this.selectedSituationId = null;
    this.lastActionResult = null;

    // 1. 结算上一季度持续效果 (长期状态 tick)
    this.stateManager.tickLongTermStates();

    // 2. 当前局势推进 (局势 tick 伤害、持续时间-1、升级判定、自然解除)
    const sitLogs = this.situationManager.tickSituations(this.stateManager);
    for (const log of sitLogs) {
      if (log.type === 'escalated') {
        this.historyManager.recordCrisis(this.turn, log.text);
      }
    }

    // 3. 宏观长期状态评估 (如民生凋敝、权力集中)
    this.stateManager.evaluateMacroState();

    // 4. 根据王朝状态概率生成/升级/解除局势
    this.situationManager.evaluateGeneration(this.turn, this.stateManager);

    // 检查失败条件（在局势结算后）
    if (this.checkEndCondition()) {
      return;
    }

    // 5. 抽取5张牌（若上一轮保留了1张则只补抽4张）
    this.cardManager.drawHand(this.stateManager, this.situationManager.getActive());

    SaveManager.save(this);
    this.notifyStateChanged();
  }

  // 检查胜负判定
  checkEndCondition() {
    if (this.isGameOver) return true;

    // 失败判定
    const defeat = this.stateManager.checkDefeat(this.situationManager.getActive(), this.godMode);
    if (defeat) {
      this.triggerDefeat(defeat.reason);
      return true;
    }

    // 40轮胜利判定
    if (this.turn > BALANCE.MAX_TURNS) {
      this.triggerVictory();
      return true;
    }

    return false;
  }

  // 触发失败
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

  // 触发胜利 (40轮生存)
  triggerVictory() {
    this.isGameOver = true;
    this.gameOutcome = 'victory';
    this.defeatReason = null;
    this.phase = 'ENDED';

    this.historyManager.recordEnding(this.turn, true, '天下大定');
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

  // =================== Debug 操作方法 ===================

  debugNextTurn() {
    // 自动选择第一张手牌打出并退朝
    if (this.phase === 'PLAY_CARD' && this.cardManager.hand.length > 0) {
      this.selectedCardId = this.cardManager.hand[0].id;
      this.playSelectedCard();
    }
    if (this.phase === 'POST_PLAY') {
      this.adjournCourt();
    }
  }

  debugForceCard(cardId) {
    this.cardManager.forceAddCard(cardId);
    this.notifyStateChanged();
  }

  debugForceSituation(situationId) {
    this.situationManager.addSituation(situationId);
    this.notifyStateChanged();
  }

  debugSetStats(stats) {
    if (stats.treasury !== undefined) this.stateManager.treasury = this.stateManager.clamp(stats.treasury);
    if (stats.morale !== undefined) this.stateManager.morale = this.stateManager.clamp(stats.morale);
    if (stats.military !== undefined) this.stateManager.military = this.stateManager.clamp(stats.military);
    if (stats.court !== undefined) this.stateManager.court = this.stateManager.clamp(stats.court);
    this.checkEndCondition();
    this.notifyStateChanged();
  }

  debugClearSituations() {
    this.situationManager.clearAll();
    this.notifyStateChanged();
  }

  debugClearStates() {
    this.stateManager.longTermStates = [];
    this.notifyStateChanged();
  }

  debugFastForwardToTurn20() {
    this.turn = 20;
    this.stateManager.treasury = 50;
    this.stateManager.morale = 50;
    this.stateManager.military = 50;
    this.stateManager.court = 50;
    this.phase = 'PLAY_CARD';
    this.isGameOver = false;
    this.cardManager.drawHand(this.stateManager, this.situationManager.getActive());
    this.notifyStateChanged();
  }

  debugTriggerCrisisState() {
    this.stateManager.treasury = 20;
    this.stateManager.morale = 22;
    this.stateManager.military = 25;
    this.stateManager.court = 20;
    this.situationManager.addSituation('border_war');
    this.situationManager.addSituation('yellow_river_flood');
    this.notifyStateChanged();
  }

  debugToggleGodMode() {
    this.godMode = !this.godMode;
    this.notifyStateChanged();
    return this.godMode;
  }
}
