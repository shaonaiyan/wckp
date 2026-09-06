// 数据遥测与分析日志管理器
export class TelemetryManager {
  constructor() {
    this.turnLogs = [];
    this.gameMetadata = {
      gameId: null,
      seed: null,
      eraName: null,
      startedAt: null,
      endedAt: null,
      finalOutcome: null, // 'victory' | 'defeat'
      defeatReason: null,
      totalTurns: 0,
      peakTurn: 0,
      peakStatsTotal: 0,
      mostSevereCrisis: null
    };
  }

  reset(seed, eraName) {
    this.turnLogs = [];
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

  // 记录本轮数据快照
  logTurn(turnData) {
    this.turnLogs.push(turnData);

    // 追踪最繁荣时期
    const totalStats = turnData.stats_after.treasury + turnData.stats_after.morale +
      turnData.stats_after.military + turnData.stats_after.court;
    if (totalStats > this.gameMetadata.peakStatsTotal) {
      this.gameMetadata.peakStatsTotal = totalStats;
      this.gameMetadata.peakTurn = turnData.turn;
    }

    // 追踪最严重危机
    for (const s of turnData.situations_after) {
      if (!this.gameMetadata.mostSevereCrisis || s.severity > this.gameMetadata.mostSevereCrisis.severity) {
        this.gameMetadata.mostSevereCrisis = {
          name: s.name,
          category: s.category,
          severity: s.severity,
          turn: turnData.turn
        };
      }
    }

    this.gameMetadata.totalTurns = turnData.turn;
  }

  // 结算终局数据
  finalizeGame(outcome, reason) {
    this.gameMetadata.endedAt = new Date().toISOString();
    this.gameMetadata.finalOutcome = outcome;
    this.gameMetadata.defeatReason = reason || (outcome === 'victory' ? '治理四十载，四海暂安' : '社稷崩解');
  }

  // 聚合生成完整分析报告
  generateFullReport(cardStats, situationHistory, stateManager) {
    // 1. 卡牌统计与使用率
    const cardSummary = {};
    for (const [cardId, stat] of Object.entries(cardStats)) {
      const usageRate = stat.drawn > 0 ? (stat.played / stat.drawn * 100).toFixed(1) + '%' : '0%';
      cardSummary[cardId] = {
        drawn: stat.drawn,
        played: stat.played,
        held: stat.held,
        usage_rate: usageRate
      };
    }

    // 2. 局势统计
    const situationSummary = {};
    for (const [sitId, stat] of Object.entries(situationHistory)) {
      const avgDuration = stat.spawnCount > 0 ? (stat.totalTurnsActive / stat.spawnCount).toFixed(1) : 0;
      situationSummary[sitId] = {
        spawnCount: stat.spawnCount,
        avgTurnsActive: Number(avgDuration),
        resolvedCount: stat.resolvedCount,
        autoResolvedCount: stat.autoResolvedCount,
        escalatedCount: stat.escalatedCount
      };
    }

    // 3. 玩家流派与卡牌类别使用比例
    const categoryCounts = { ...stateManager.categoryCounts };
    const totalPlayed = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const categoryRatios = {};
    for (const [cat, count] of Object.entries(categoryCounts)) {
      categoryRatios[cat] = totalPlayed > 0 ? ((count / totalPlayed) * 100).toFixed(1) + '%' : '0%';
    }

    // 最常用卡牌流派
    let favoredCategory = '均衡治理';
    let maxCatCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCatCount) {
        maxCatCount = count;
        favoredCategory = cat;
      }
    }

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
        favoredCategory,
        categoryRatios,
        categoryCounts
      },
      cards_statistics: cardSummary,
      situations_statistics: situationSummary,
      turns_log: this.turnLogs
    };
  }

  // 导出 JSON 字符串
  exportJSON(cardStats, situationHistory, stateManager) {
    const report = this.generateFullReport(cardStats, situationHistory, stateManager);
    return JSON.stringify(report, null, 2);
  }

  // 触发浏览器下载
  downloadJSON(cardStats, situationHistory, stateManager) {
    const jsonStr = this.exportJSON(cardStats, situationHistory, stateManager);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yichao_tianzi_telemetry_${this.gameMetadata.seed || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 复制到剪贴板
  async copyJSON(cardStats, situationHistory, stateManager) {
    const jsonStr = this.exportJSON(cardStats, situationHistory, stateManager);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(jsonStr);
      return true;
    }
    return false;
  }
}
