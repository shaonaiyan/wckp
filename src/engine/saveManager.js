// Prototype 0.2 存档管理器 (SaveManager)
const SAVE_KEY = 'yichao_tianzi_save_v02';

export class SaveManager {
  static save(gameState) {
    try {
      const data = {
        version: '0.2',
        seed: gameState.randomManager.initialSeed,
        turn: gameState.turn,
        eraName: gameState.historyManager.eraName,
        isGameOver: gameState.isGameOver,
        gameOutcome: gameState.gameOutcome,
        defeatReason: gameState.defeatReason,
        godMode: gameState.godMode,
        phase: gameState.phase,

        // 宏观健康度
        stats: gameState.stateManager.getStats(),

        // 真实牌库
        drawPile: gameState.deckManager.drawPile,
        discardPile: gameState.deckManager.discardPile,
        hand: gameState.deckManager.hand,
        keptCard: gameState.deckManager.keptCard,
        cardStats: gameState.deckManager.cardStats,

        // 局势
        activeSituations: gameState.situationManager.activeSituations,
        deferredQueue: gameState.situationManager.deferredQueue,
        situationHistory: gameState.situationManager.situationHistory,

        // 后遗状态与年度国策
        activeResidues: gameState.residueManager.activeResidues,
        activePolicies: gameState.policyManager.activePolicies,

        // 史册与遥测
        historyEntries: gameState.historyManager.entries,
        turnLogs: gameState.telemetryManager.turnLogs,
        gameMetadata: gameState.telemetryManager.gameMetadata,
        qualityCounts: gameState.telemetryManager.qualityCounts,
        totalNeglectEscalations: gameState.telemetryManager.totalNeglectEscalations,

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
