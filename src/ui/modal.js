// Prototype 0.2 弹窗与交互模态管理器 (ModalManager)
// 管理年度定策三选一弹窗、终局总结弹窗与史册抽屉

export class ModalManager {
  constructor(game) {
    this.game = game;
    this.init();
  }

  init() {
    // 史册侧边栏
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

    // 终局弹窗按钮
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
          this.game.deckManager,
          this.game.situationManager,
          this.game.stateManager,
          this.game.residueManager,
          this.game.policyManager
        );
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await this.game.telemetryManager.copyJSON(
          this.game.deckManager,
          this.game.situationManager,
          this.game.stateManager,
          this.game.residueManager,
          this.game.policyManager
        );
        if (ok) alert('本局完整 0.2 遥测数据已复制到剪贴板！');
      });
    }
  }

  // 展示年度定策 (朝议定策 3选1) 弹窗
  showAnnualDraftModal(options) {
    const modal = document.getElementById('annual-policy-modal');
    const optionsContainer = document.getElementById('annual-policy-options');
    if (!modal || !optionsContainer) return;

    optionsContainer.innerHTML = '';

    options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'policy-draft-card';
      card.innerHTML = `
        <div class="policy-card-tag">国策建议</div>
        <div class="policy-card-title">${opt.title}</div>
        <div class="policy-card-name">${opt.name}</div>
        <div class="policy-card-desc">${opt.description}</div>
        <button class="wood-btn btn-select-policy">确立此策</button>
      `;

      card.querySelector('.btn-select-policy').addEventListener('click', () => {
        modal.classList.add('hidden');
        this.game.applyAnnualPolicySelection(opt.id);
      });

      optionsContainer.appendChild(card);
    });

    modal.classList.remove('hidden');
  }

  // 展示终局弹窗
  showGameOverModal(data) {
    const modal = document.getElementById('game-over-modal');
    if (!modal) return;

    const isVictory = data.outcome === 'victory';
    const titleEl = document.getElementById('modal-dynasty-title');
    const subtitleEl = document.getElementById('modal-dynasty-subtitle');
    const summaryContainer = document.getElementById('modal-summary-content');

    const report = this.game.telemetryManager.generateFullReport(
      this.game.deckManager,
      this.game.situationManager,
      this.game.stateManager,
      this.game.residueManager,
      this.game.policyManager
    );

    if (titleEl) {
      titleEl.textContent = isVictory ? '【江山暂安】' : '【社稷倾覆】';
      titleEl.className = `modal-title ${isVictory ? 'title-victory' : 'title-defeat'}`;
    }

    if (subtitleEl) {
      subtitleEl.textContent = isVictory
        ? '帝在位四十季，运筹帷幄化险为夷，天下重归承平。'
        : `国祚中断。${data.reason || '社稷崩解'}`;
    }

    if (summaryContainer) {
      const peakText = `${this.game.historyManager.getYearSeasonText(report.summary.peakProsperity.turn)} (健康度总和: ${report.summary.peakProsperity.statsTotal})`;
      const crisisText = report.summary.mostSevereCrisis
        ? `【${report.summary.mostSevereCrisis.name}】(${report.summary.mostSevereCrisis.stage}阶)`
        : '无大恶疾';

      const choiceRatio = report.summary.meaningfulChoiceStats.multiValidChoiceRatio;
      const residuesList = report.summary.activeResiduesAtEnd.length
        ? report.summary.activeResiduesAtEnd.join('、')
        : '无';
      const policiesList = report.summary.activePoliciesAtEnd.length
        ? report.summary.activePoliciesAtEnd.join('、')
        : '无';

      summaryContainer.innerHTML = `
        <div class="summary-card">
          <div class="summary-item"><strong>立国寿算：</strong>历经 ${report.metadata.totalTurns} 季 (约 ${Math.floor(report.metadata.totalTurns / 4)} 年)</div>
          <div class="summary-item"><strong>极盛时期：</strong>${peakText}</div>
          <div class="summary-item"><strong>最危局势：</strong>${crisisText}</div>
          <div class="summary-item"><strong>多重有效抉择比率 (Meaningful Choices)：</strong>${choiceRatio} 的轮次手牌存在2种以上有效解法</div>
          <div class="summary-item"><strong>因放任而恶化次数：</strong>${report.summary.totalNeglectEscalations} 次</div>
          <div class="summary-item"><strong>终局时遗存沉疴：</strong>${residuesList}</div>
          <div class="summary-item"><strong>最终确立国策：</strong>${policiesList}</div>
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
}
