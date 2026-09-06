// Debug 监控与控制台面板
import { CARDS } from '../data/cards.js';
import { SITUATIONS } from '../data/situations.js';

export class DebugPanel {
  constructor(game) {
    this.game = game;
    this.isOpen = false;
    this.panelEl = null;
    this.init();
  }

  init() {
    this.panelEl = document.getElementById('debug-drawer');
    const toggleBtn = document.getElementById('btn-toggle-debug');
    const closeBtn = document.getElementById('btn-close-debug');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.bindActionButtons();
    this.populateSelectors();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.panelEl) {
      this.panelEl.classList.toggle('open', this.isOpen);
      if (this.isOpen) this.update();
    }
  }

  close() {
    this.isOpen = false;
    if (this.panelEl) this.panelEl.classList.remove('open');
  }

  // 绑定各种调试功能按钮
  bindActionButtons() {
    // 下一轮
    const btnNextTurn = document.getElementById('dbg-btn-next-turn');
    if (btnNextTurn) {
      btnNextTurn.addEventListener('click', () => {
        this.game.debugNextTurn();
        this.update();
      });
    }

    // 属性修改
    const statKeys = ['treasury', 'morale', 'military', 'court'];
    statKeys.forEach(key => {
      const btnPlus = document.getElementById(`dbg-btn-${key}-plus`);
      const btnMinus = document.getElementById(`dbg-btn-${key}-minus`);
      if (btnPlus) {
        btnPlus.addEventListener('click', () => {
          this.game.stateManager.applyDelta({ [key]: 5 });
          this.game.notifyStateChanged();
          this.update();
        });
      }
      if (btnMinus) {
        btnMinus.addEventListener('click', () => {
          this.game.stateManager.applyDelta({ [key]: -5 });
          this.game.checkEndCondition();
          this.game.notifyStateChanged();
          this.update();
        });
      }
    });

    // 清除局势
    const btnClearSits = document.getElementById('dbg-btn-clear-sits');
    if (btnClearSits) {
      btnClearSits.addEventListener('click', () => {
        this.game.debugClearSituations();
        this.update();
      });
    }

    // 清除长期状态
    const btnClearStates = document.getElementById('dbg-btn-clear-states');
    if (btnClearStates) {
      btnClearStates.addEventListener('click', () => {
        this.game.debugClearStates();
        this.update();
      });
    }

    // 立刻进入第20轮
    const btnJump20 = document.getElementById('dbg-btn-jump-20');
    if (btnJump20) {
      btnJump20.addEventListener('click', () => {
        this.game.debugFastForwardToTurn20();
        this.update();
      });
    }

    // 立刻进入危机状态
    const btnTriggerCrisis = document.getElementById('dbg-btn-crisis');
    if (btnTriggerCrisis) {
      btnTriggerCrisis.addEventListener('click', () => {
        this.game.debugTriggerCrisisState();
        this.update();
      });
    }

    // 切换无失败模式
    const btnGodMode = document.getElementById('dbg-btn-godmode');
    if (btnGodMode) {
      btnGodMode.addEventListener('click', () => {
        const isGod = this.game.debugToggleGodMode();
        btnGodMode.textContent = `无失败模式: ${isGod ? '已开启' : '已关闭'}`;
        btnGodMode.classList.toggle('active', isGod);
        this.update();
      });
    }

    // 重置本局
    const btnReset = document.getElementById('dbg-btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('确认重置并重新开始本局吗？')) {
          this.game.startNewGame();
          this.update();
        }
      });
    }

    // 输入 Seed 开始新局
    const btnApplySeed = document.getElementById('dbg-btn-apply-seed');
    const inputSeed = document.getElementById('dbg-input-seed');
    if (btnApplySeed && inputSeed) {
      btnApplySeed.addEventListener('click', () => {
        const customSeed = inputSeed.value.trim();
        if (customSeed) {
          this.game.startNewGame(customSeed);
          this.update();
        }
      });
    }

    // 导出本局 JSON
    const btnExportJson = document.getElementById('dbg-btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        this.game.telemetryManager.downloadJSON(
          this.game.cardManager.cardStats,
          this.game.situationManager.situationHistory,
          this.game.stateManager
        );
      });
    }

    // 复制数据到剪贴板
    const btnCopyJson = document.getElementById('dbg-btn-copy-json');
    if (btnCopyJson) {
      btnCopyJson.addEventListener('click', async () => {
        const ok = await this.game.telemetryManager.copyJSON(
          this.game.cardManager.cardStats,
          this.game.situationManager.situationHistory,
          this.game.stateManager
        );
        if (ok) {
          alert('本局完整遥测数据已复制到剪贴板！');
        } else {
          alert('复制失败，请点击下载JSON。');
        }
      });
    }

    // 跑40轮快速自动化模拟
    const btnAutoSim = document.getElementById('dbg-btn-auto-sim');
    if (btnAutoSim) {
      btnAutoSim.addEventListener('click', () => {
        this.runAutoSimulation();
      });
    }
  }

  // 填充下拉选项
  populateSelectors() {
    // 卡牌下拉
    const cardSelect = document.getElementById('dbg-select-card');
    const btnForceCard = document.getElementById('dbg-btn-force-card');
    if (cardSelect) {
      cardSelect.innerHTML = '';
      CARDS.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `[${c.category}] ${c.name}`;
        cardSelect.appendChild(opt);
      });
    }
    if (btnForceCard && cardSelect) {
      btnForceCard.addEventListener('click', () => {
        this.game.debugForceCard(cardSelect.value);
        this.update();
      });
    }

    // 局势下拉
    const sitSelect = document.getElementById('dbg-select-sit');
    const btnForceSit = document.getElementById('dbg-btn-force-sit');
    if (sitSelect) {
      sitSelect.innerHTML = '';
      SITUATIONS.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `[${s.category}] ${s.name}`;
        sitSelect.appendChild(opt);
      });
    }
    if (btnForceSit && sitSelect) {
      btnForceSit.addEventListener('click', () => {
        this.game.debugForceSituation(sitSelect.value);
        this.update();
      });
    }
  }

  // 刷新调试面板内展示的数据
  update() {
    if (!this.isOpen) return;

    // 基础信息
    const infoEl = document.getElementById('dbg-realtime-info');
    if (infoEl) {
      const stats = this.game.stateManager.getStats();
      const currentSeed = this.game.randomManager.seed;
      const initialSeed = this.game.randomManager.initialSeed;
      const totalTurns = this.game.turn;

      infoEl.innerHTML = `
        <div class="dbg-kv"><span>初始种子：</span><code>${initialSeed}</code></div>
        <div class="dbg-kv"><span>当前种子状态：</span><code>${currentSeed}</code></div>
        <div class="dbg-kv"><span>当前季度：</span>${this.game.getCurrentTimeText()} (第${totalTurns}轮)</div>
        <div class="dbg-kv"><span>当前阶段：</span>${this.game.phase}</div>
        <div class="dbg-kv"><span>无失败模式：</span>${this.game.godMode ? '已开启' : '关闭'}</div>
        <div class="dbg-kv"><span>国库 (Treasury)：</span><strong>${stats.treasury}</strong> / 100</div>
        <div class="dbg-kv"><span>民心 (Morale)：</span><strong>${stats.morale}</strong> / 100</div>
        <div class="dbg-kv"><span>军势 (Military)：</span><strong>${stats.military}</strong> / 100</div>
        <div class="dbg-kv"><span>朝局 (Court)：</span><strong>${stats.court}</strong> / 100</div>
        <div class="dbg-kv"><span>长期状态：</span>${this.game.stateManager.longTermStates.length ? this.game.stateManager.longTermStates.join(', ') : '无'}</div>
      `;
    }

    // 场上局势明细
    const sitsEl = document.getElementById('dbg-sits-info');
    if (sitsEl) {
      const sits = this.game.situationManager.getActive();
      sitsEl.innerHTML = sits.length ? sits.map(s => `
        <div class="dbg-sit-item">
          <strong>【${s.name}】</strong> [${s.category}] 等级: ${s.stage}/${s.maxStage || 3} 严重度: ${s.severity} 剩余: ${s.duration}季
        </div>
      `).join('') : '<div class="dbg-empty">当前场上无局势</div>';
    }

    // 动态卡牌抽取权重分布
    const weightsEl = document.getElementById('dbg-weights-info');
    if (weightsEl) {
      const weights = this.game.cardManager.calculateDynamicWeights(
        this.game.stateManager,
        this.game.situationManager.getActive()
      );
      weightsEl.innerHTML = Object.entries(weights).map(([cid, w]) => {
        const card = CARDS.find(c => c.id === cid);
        return `<span class="dbg-tag">${card ? card.name : cid}: ${w}</span>`;
      }).join(' ');
    }

    // 玩家历史倾向比例
    const tendencyEl = document.getElementById('dbg-tendency-info');
    if (tendencyEl) {
      const counts = this.game.stateManager.categoryCounts;
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      tendencyEl.innerHTML = Object.entries(counts).map(([cat, c]) => {
        const pct = total > 0 ? ((c / total) * 100).toFixed(1) : 0;
        return `<span>${cat}: ${c}次 (${pct}%)</span>`;
      }).join(' | ');
    }
  }

  // 运行自动化 40 轮压力测试
  runAutoSimulation() {
    this.game.godMode = true; // 临时开启无失败以跑满40轮
    let steps = 0;
    while (!this.game.isGameOver && this.game.turn <= 40 && steps < 60) {
      steps++;
      // 打出第一张能打的牌
      if (this.game.phase === 'PLAY_CARD' && this.game.cardManager.hand.length > 0) {
        this.game.selectedCardId = this.game.cardManager.hand[0].id;
        const card = this.game.cardManager.hand[0];
        if (card.targetType === 'situation' || card.targetType === 'optional_situation') {
          const sits = this.game.situationManager.getActive();
          if (sits.length > 0) {
            this.game.selectedSituationId = sits[0].id;
          }
        }
        this.game.playSelectedCard();
      }
      if (this.game.phase === 'POST_PLAY') {
        this.game.adjournCourt();
      }
    }
    this.game.godMode = false;
    this.update();
    alert(`自动化模拟完成！共运行至第 ${this.game.turn} 轮。可在调试面板查看或导出JSON。`);
  }
}
