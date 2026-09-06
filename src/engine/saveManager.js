// 存档管理器：负责 LocalStorage 自动存储与读档恢复
const SAVE_KEY = 'yichao_tianzi_save_v1';

export class SaveManager {
  static save(gameState) {
    try {
      const data = {
        seed: gameState.randomManager.initialSeed,
        turn: gameState.turn,
        eraName: gameState.historyManager.eraName,
        isGameOver: gameState.isGameOver,
        gameOutcome: gameState.gameOutcome,
        defeatReason: gameState.defeatReason,
        godMode: gameState.godMode,
        phase: gameState.phase, // 'PLAY_CARD' | 'POST_PLAY' | 'ENDED'

        // 状态
        stats: gameState.stateManager.getStats(),
        longTermStates: gameState.stateManager.longTermStates,
        actionHistory: gameState.stateManager.actionHistory,
        categoryCounts: gameState.stateManager.categoryCounts,
        recentStreaks: gameState.stateManager.recentStreaks,
        debtCount: gameState.stateManager.debtCount,
        rewardCount: gameState.stateManager.rewardCount,
        lowMoraleTurns: gameState.stateManager.lowMoraleTurns,
        highCourtTurns: gameState.stateManager.highCourtTurns,

        // 局势
        activeSituations: gameState.situationManager.activeSituations,
        deferredQueue: gameState.situationManager.deferredQueue,
        situationHistory: gameState.situationManager.situationHistory,

        // 卡牌
        hand: gameState.cardManager.hand,
        keptCard: gameState.cardManager.keptCard,
        pendingCard: gameState.cardManager.pendingCard,
        cardStats: gameState.cardManager.cardStats,

        // 史册
        historyEntries: gameState.historyManager.entries,

        // 遥测
        turnLogs: gameState.telemetryManager.turnLogs,
        gameMetadata: gameState.telemetryManager.gameMetadata,

        savedAt: Date.now()
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save game to localStorage:', e);
      return false;
    }
  }

  static hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load save from localStorage:', e);
      return null;
    }
  }

  static clear() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to clear save:', e);
    }
  }
}
