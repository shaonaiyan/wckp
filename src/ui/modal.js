// 模态弹窗与终局结算面板
export class ModalManager {
  constructor(game) {
    this.game = game;
    this.init();
  }

  init() {
    // 史册展开与折叠
    const chronicleToggle = document.getElementById('btn-toggle-chronicle');
    const chronicleSidebar = document.getElementById('chronicle-sidebar');
    const chronicleClose = document.getElementById('btn-close-chronicle');

    if (chronicleToggle && chronicleSidebar) {
      chronicleToggle.addEventListener('click', () => {
        chronicleSidebar.classList.toggle('open');
      });
    }
    if (chronicleClose && chronicleSidebar) {
      chronicleClose.addEventListener('click', () => {
        chronicleSidebar.classList.remove('open');
      });
    }

    // 终局弹窗内部按钮
    const restartBtn = document.getElementById('modal-btn-restart');
    const exportBtn = document.getElementById('modal-btn-export');
    const copyBtn = document.getElementById('modal-btn-copy');

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.hideGameOverModal();
        this.game.startNewGame();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.game.telemetryManager.downloadJSON(
          this.game.cardManager.cardStats,
          this.game.situationManager.situationHistory,
          this.game.stateManager
        );
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await this.game.telemetryManager.copyJSON(
          this.game.cardManager.cardStats,
          this.game.situationManager.situationHistory,
          this.game.stateManager
        );
        if (ok) alert('本局完整遥测数据已复制到剪贴板！');
      });
    }
  }

  // 展示终局弹窗
  showGameOverModal(data) {
    const modal = document.getElementById('game-over-modal');
    if (!modal) return;

    const isVictory = data.outcome === 'victory';
    const titleEl = document.getElementById('modal-dynasty-title');
    const subtitleEl = document.getElementById('modal-dynasty-subtitle');
    const summaryContainer = document.getElementById('modal-summary-content');

    const meta = this.game.telemetryManager.gameMetadata;
    const report = this.game.telemetryManager.generateFullReport(
      this.game.cardManager.cardStats,
      this.game.situationManager.situationHistory,
      this.game.stateManager
    );

    if (titleEl) {
      titleEl.textContent = isVictory ? '【江山暂安】' : '【王朝倾覆】';
      titleEl.className = `modal-title ${isVictory ? 'title-victory' : 'title-defeat'}`;
    }

    if (subtitleEl) {
      subtitleEl.textContent = isVictory
        ? '帝御宇四十季，虽经风云跌宕，终保四境清平。'
        : `国祚中绝。${data.reason || '社稷崩颓'}`;
    }

    if (summaryContainer) {
      const peakText = `${this.game.historyManager.getYearSeasonText(report.summary.peakProsperity.turn)} (国势总和: ${report.summary.peakProsperity.statsTotal})`;
      const crisisText = report.summary.mostSevereCrisis
        ? `【${report.summary.mostSevereCrisis.name}】(严重度 ${report.summary.mostSevereCrisis.severity})`
        : '无大恶疾';

      const ratios = Object.entries(report.summary.categoryRatios)
        .map(([k, v]) => `<li>${this.getCategoryName(k)}：${v}</li>`)
        .join('');

      summaryContainer.innerHTML = `
        <div class="summary-card">
          <div class="summary-item"><strong>立国寿算：</strong>历经 ${meta.totalTurns} 季 (约 ${Math.floor(meta.totalTurns / 4)} 年)</div>
          <div class="summary-item"><strong>极盛时期：</strong>${peakText}</div>
          <div class="summary-item"><strong>最危局势：</strong>${crisisText}</div>
          <div class="summary-item"><strong>治理流派倾向：</strong>${this.getCategoryName(report.summary.favoredCategory)}</div>
          <div class="summary-item">
            <strong>百工诏令施用比例：</strong>
            <ul class="ratio-list">${ratios}</ul>
          </div>
          <div class="summary-item"><strong>随机种子：</strong><code>${this.game.randomManager.initialSeed}</code></div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
  }

  hideGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    if (modal) modal.classList.add('hidden');
  }

  getCategoryName(cat) {
    const map = {
      finance: '财政',
      livelihood: '民生',
      military: '军事',
      diplomacy: '外交',
      politics: '政治',
      special: '国事',
      均衡治理: '均衡中道'
    };
    return map[cat] || cat;
  }
}
