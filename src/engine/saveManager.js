// 《一朝天子》Prototype 0.3 存档管理器 (SaveManager)
const SAVE_KEY = 'yichao_tianzi_save_v03';

export class SaveManager {
  static save(target) {
    try {
      const world = target.world || target;
      const telemetry = target.telemetryManager || world.telemetryManager;
      const data = {
        version: '0.3',
        seed: world.initialSeed,
        turn: world.turn,
        macroStats: world.macroStats,
        regions: world.regions,
        factions: world.factions,
        characters: world.characterManager.characters,
        followedIds: [...world.characterManager.followedIds],
        royalFamily: {
          emperor: world.royalFamilyManager.emperor,
          empress: world.royalFamilyManager.empress,
          children: world.royalFamilyManager.children,
          heirId: world.royalFamilyManager.heirId
        },
        pastEmperors: world.successionManager.pastEmperors,
        threads: world.threadManager.activeThreads,
        causalHooks: world.causalHookManager.getAll(),
        memories: world.memoryManager.getAll(),
        proposals: {
          currentProposals: world.proposalManager.currentProposals,
          keptProposal: world.proposalManager.keptProposal
        },
        headlines: world.newsManager.currentHeadlines,
        history: {
          eraName: world.historyManager.eraName,
          entries: world.historyManager.entries
        },
        telemetryLogs: telemetry ? telemetry.turnLogs : [],
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
