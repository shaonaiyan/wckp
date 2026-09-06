// 《一朝天子》Prototype 0.3 遥测与生命力统计管理器 (TelemetryManager)
// 记录世界生命力、人物复现率、故事连续率、孤立事件率、因果反馈与旁观统计 (Section 67~71)

export const TELEMETRY_STORAGE_KEY = 'yichao_tianzi_v03_telemetry';

export class TelemetryManager {
  constructor() {
    this.turnLogs = [];
    this.playerActions = [];
    this.characterAppearances = {}; // { [charName]: [turns] }
    this.spectatorRuns = [];
  }

  reset() {
    this.turnLogs = [];
    this.playerActions = [];
    this.characterAppearances = {};
  }

  logTurn(turnData) {
    this.turnLogs.push(turnData);

    // 统计人物出镜
    if (Array.isArray(turnData.headlines)) {
      turnData.headlines.forEach(h => {
        if (h.character) {
          const cname = h.character.name;
          if (!this.characterAppearances[cname]) this.characterAppearances[cname] = [];
          this.characterAppearances[cname].push(turnData.turn);
        }
      });
    }

    if (turnData.playerAction) {
      this.playerActions.push(turnData.playerAction);
    }
  }

  // 综合计算 0.3 核心指标 (Section 67)
  calculateMetrics(world) {
    const totalTurns = this.turnLogs.length;
    if (totalTurns === 0) {
      return {
        totalTurns: 0,
        characterRecurrenceRate: '0%',
        storyContinuityRate: '0%',
        isolatedRandomEventRatio: '0%',
        avgCharacterReturnInterval: '0 季',
        totalEventsSimulated: 0,
        headlinesShownCount: 0,
        playerActionCount: 0,
        nonActionCount: 0,
        causalHooksPlanted: 0,
        causalHooksTriggered: 0
      };
    }

    let headlinesTotal = 0;
    let threadHeadlines = 0;
    let characterHeadlines = 0;
    let isolatedHeadlines = 0;

    this.turnLogs.forEach(t => {
      if (Array.isArray(t.headlines)) {
        t.headlines.forEach(h => {
          headlinesTotal++;
          if (h.type === 'thread_progression' || h.threadId) {
            threadHeadlines++;
          }
          if (h.character || h.type === 'character_action' || h.type === 'character_death') {
            characterHeadlines++;
          }
          if (h.type === 'independent_random') {
            isolatedHeadlines++;
          }
        });
      }
    });

    const continuityRate = headlinesTotal > 0 ? ((threadHeadlines / headlinesTotal) * 100).toFixed(1) + '%' : '0%';
    const recurrenceRate = headlinesTotal > 0 ? ((characterHeadlines / headlinesTotal) * 100).toFixed(1) + '%' : '0%';
    const isolatedRatio = headlinesTotal > 0 ? ((isolatedHeadlines / headlinesTotal) * 100).toFixed(1) + '%' : '0%';

    // 计算人物平均复现间隔
    let intervals = [];
    Object.values(this.characterAppearances).forEach(turns => {
      if (turns.length >= 2) {
        for (let i = 1; i < turns.length; i++) {
          intervals.push(turns[i] - turns[i - 1]);
        }
      }
    });
    const avgInterval = intervals.length > 0
      ? (intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1) + ' 季'
      : '首次登场';

    const nonActionTurns = this.turnLogs.filter(t => !t.playerAction).length;
    const hooksPlanted = world ? world.causalHookManager.getAll().length : 0;
    const hooksTriggered = world ? world.causalHookManager.getAll().reduce((sum, h) => sum + (h.triggeredEventsCount || 0), 0) : 0;

    return {
      totalTurns,
      totalEventsSimulated: this.turnLogs.reduce((sum, t) => sum + (t.allEventsCount || 0), 0),
      headlinesShownCount: headlinesTotal,
      storyContinuityRate: continuityRate,
      characterRecurrenceRate: recurrenceRate,
      isolatedRandomEventRatio: isolatedRatio,
      avgCharacterReturnInterval: avgInterval,
      playerActionCount: this.playerActions.length,
      nonActionCount: nonActionTurns,
      causalHooksPlanted: hooksPlanted,
      causalHooksTriggered: hooksTriggered
    };
  }

  // 导出完整本局 0.3 遥测数据 JSON (Section 71)
  exportFullJSON(world) {
    const metrics = this.calculateMetrics(world);
    const report = {
      version: '0.3',
      exportedAt: new Date().toISOString(),
      seed: world.initialSeed,
      metrics,
      emperors: world.successionManager.pastEmperors,
      currentEmperor: world.royalFamilyManager.emperor,
      royalFamily: {
        empress: world.royalFamilyManager.empress,
        children: world.royalFamilyManager.children,
        heirId: world.royalFamilyManager.heirId
      },
      characters: world.characterManager.characters.map(c => ({
        name: c.name,
        office: c.office,
        age: c.age,
        alive: c.alive,
        traits: c.traits,
        influence: c.influence,
        history: c.history
      })),
      factions: world.factions,
      regions: world.regions,
      threads: world.threadManager.activeThreads,
      causalHooks: world.causalHookManager.getAll(),
      memories: world.memoryManager.getAll(),
      chronicle: world.historyManager.getAllEntries(),
      turnsLog: this.turnLogs
    };

    return JSON.stringify(report, null, 2);
  }

  downloadJSON(world) {
    const jsonStr = this.exportFullJSON(world);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yichao_tianzi_v03_telemetry_${world.initialSeed}_turn${world.turn}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async copyJSON(world) {
    const jsonStr = this.exportFullJSON(world);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonStr);
      return true;
    }
    return false;
  }
}
