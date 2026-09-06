// Prototype 0.2 遥测数据与深度统计管理器 (TelemetryManager)
// 记录精确的出牌前手牌、自动索敌、交互评级、后遗状态、Meaningful Choice 分析与因果链

export class TelemetryManager {
  constructor() {
    this.turnLogs = [];
    this.gameMetadata = {
      gameId: null,
      seed: null,
      eraName: null,
      startedAt: null,
      endedAt: null,
      finalOutcome: null,
      defeatReason: null,
      totalTurns: 0,
      peakTurn: 1,
      peakStatsTotal: 0,
      mostSevereCrisis: null
    };

    // 总体指标追踪
    this.qualityCounts = {
      excellent: 0,
      good: 0,
      weak: 0,
      none: 0,
      dangerous: 0
    };
    this.totalNeglectEscalations = 0;
  }

  reset(seed, eraName) {
    this.turnLogs = [];
    this.qualityCounts = {
      excellent: 0,
      good: 0,
      weak: 0,
      none: 0,
      dangerous: 0
    };
    this.totalNeglectEscalations = 0;
    this.gameMetadata = {
      gameId: 'dynasty_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      seed,
      eraName,
      startedAt: new Date().toISOString(),
      endedAt: null,
      finalOutcome: null,
      defeatReason: null,
      totalTurns: 0,
      peakTurn: 1,
      peakStatsTotal: 0,
      mostSevereCrisis: null
    };
  }

  // 记录本轮数据快照 (严格执行 0.2 格式)
  logTurn(turnData) {
    this.turnLogs.push(turnData);

    if (turnData.interaction_quality && this.qualityCounts[turnData.interaction_quality] !== undefined) {
      this.qualityCounts[turnData.interaction_quality]++;
    }

    // 追踪繁荣峰值
    const statsTotal = (turnData.stats_after.treasury || 0) + (turnData.stats_after.morale || 0) +
      (turnData.stats_after.military || 0) + (turnData.stats_after.court || 0);
    if (statsTotal > this.gameMetadata.peakStatsTotal) {
      this.gameMetadata.peakStatsTotal = statsTotal;
      this.gameMetadata.peakTurn = turnData.turn;
    }

    // 追踪最高危机
    for (const s of turnData.situation_after) {
      if (!this.gameMetadata.mostSevereCrisis || (s.stage && s.stage > this.gameMetadata.mostSevereCrisis.stage)) {
        this.gameMetadata.mostSevereCrisis = {
          id: s.id,
          name: s.name,
          stage: s.stage,
          turn: turnData.turn
        };
      }
    }

    this.gameMetadata.totalTurns = turnData.turn;
  }

  recordNeglectEscalation() {
    this.totalNeglectEscalations++;
  }

  finalizeGame(outcome, reason) {
    this.gameMetadata.endedAt = new Date().toISOString();
    this.gameMetadata.finalOutcome = outcome;
    this.gameMetadata.defeatReason = reason || (outcome === 'victory' ? '历经四十季风雨，四海暂安' : '社稷倾覆');
  }

  // 聚合生成完整 0.2 统计分析报告
  generateFullReport(deckManager, situationManager, stateManager, residueManager, policyManager) {
    // 1. 卡牌统计
    const cardSummary = {};
    for (const [cardId, stat] of Object.entries(deckManager.cardStats)) {
      const usageRate = stat.drawn > 0 ? ((stat.played / stat.drawn) * 100).toFixed(1) + '%' : '0%';
      cardSummary[cardId] = {
        drawn: stat.drawn,
        played: stat.played,
        held: stat.held,
        usage_rate: usageRate
      };
    }

    // 2. 局势统计
    const situationSummary = {};
    for (const [sitId, stat] of Object.entries(situationManager.situationHistory)) {
      const avgDuration = stat.spawnCount > 0 ? (stat.turnsActive / stat.spawnCount).toFixed(1) : 0;
      situationSummary[sitId] = {
        spawnCount: stat.spawnCount,
        resolvedCount: stat.resolvedCount,
        neglectedEscalations: stat.neglectedEscalations,
        avgTurnsActive: Number(avgDuration)
      };
    }

    // 3. Meaningful Choice 统计汇总
    let totalTurnsWithChoices = 0;
    let sumMultiValidTurns = 0;
    for (const t of this.turnLogs) {
      if (t.meaningful_choices) {
        totalTurnsWithChoices++;
        const validOptions = (t.meaningful_choices.excellentChoiceCount || 0) + (t.meaningful_choices.goodChoiceCount || 0);
        if (validOptions >= 2) sumMultiValidTurns++;
      }
    }
    const multiValidChoiceRatio = totalTurnsWithChoices > 0
      ? ((sumMultiValidTurns / totalTurnsWithChoices) * 100).toFixed(1) + '%'
      : '0%';

    return {
      metadata: this.gameMetadata,
      summary: {
        totalTurnsSurviving: this.gameMetadata.totalTurns,
        outcome: this.gameMetadata.finalOutcome,
        defeatReason: this.gameMetadata.defeatReason,
        peakProsperity: {
          turn: this.gameMetadata.peakTurn,
          statsTotal: this.gameMetadata.peakStatsTotal
        },
        mostSevereCrisis: this.gameMetadata.mostSevereCrisis,
        totalNeglectEscalations: this.totalNeglectEscalations,
        meaningfulChoiceStats: {
          totalTurnsEvaluated: totalTurnsWithChoices,
          turnsWithAtLeast2GoodOptions: sumMultiValidTurns,
          multiValidChoiceRatio // 有压力时手牌至少有2种好解法的回合占比
        },
        interactionQualityDistribution: this.qualityCounts,
        activeResiduesAtEnd: residueManager ? residueManager.getActive().map(r => r.name) : [],
        activePoliciesAtEnd: policyManager ? policyManager.getActive().map(p => p.name) : []
      },
      cards_statistics: cardSummary,
      situations_statistics: situationSummary,
      turns_log: this.turnLogs
    };
  }

  exportJSON(deckManager, situationManager, stateManager, residueManager, policyManager) {
    const report = this.generateFullReport(deckManager, situationManager, stateManager, residueManager, policyManager);
    return JSON.stringify(report, null, 2);
  }

  downloadJSON(deckManager, situationManager, stateManager, residueManager, policyManager) {
    const jsonStr = this.exportJSON(deckManager, situationManager, stateManager, residueManager, policyManager);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yichao_tianzi_v02_telemetry_${this.gameMetadata.seed || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async copyJSON(deckManager, situationManager, stateManager, residueManager, policyManager) {
    const jsonStr = this.exportJSON(deckManager, situationManager, stateManager, residueManager, policyManager);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonStr);
      return true;
    }
    return false;
  }
}
