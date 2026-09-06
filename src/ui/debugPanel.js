// Prototype 0.2 Debug 控制台 (DebugPanel)
// 包含 4 大标准测试场景、真实实体牌库监控、Reaction Matrix 评级与年度国策测试

import { CARDS } from '../data/cards.js';
import { SITUATIONS } from '../data/situations.js';
import { RESIDUES } from '../data/residues.js';
import { InteractionResolver } from '../engine/interactionResolver.js';

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

    if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggle());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

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

  bindActionButtons() {
    // 4 大标准测试场景 (Section 35)
    document.getElementById('dbg-btn-scenario-a')?.addEventListener('click', () => {
      this.game.setupScenarioTestA();
      this.update();
      alert('已载入【Test A: 黄河水患·恶化】场景！测试同一问题是否至少有3种不同代价解法。');
    });

    document.getElementById('dbg-btn-scenario-b')?.addEventListener('click', () => {
      this.game.setupScenarioTestB();
      this.update();
      alert('已载入【Test B: 北境危机·危急】场景！测试武力、外交、贸易、筹钱应对不同后果。');
    });

    document.getElementById('dbg-btn-scenario-c')?.addEventListener('click', () => {
      this.game.setupScenarioTestC();
      this.update();
      alert('已载入【Test C: 双重危机】场景！两事皆急手牌各有对应，只能出一张产生真正取舍。');
    });

    document.getElementById('dbg-btn-scenario-d')?.addEventListener('click', () => {
      this.game.setupScenarioTestD();
      this.update();
      alert('已载入【Test D: 盛世】场景！测试丰收与海贸双机会，检验建设欲望。');
    });

    // 基础操作
    document.getElementById('dbg-btn-next-turn')?.addEventListener('click', () => {
      this.game.debugNextTurn();
      this.update();
    });

    document.getElementById('dbg-btn-godmode')?.addEventListener('click', (e) => {
      this.game.godMode = !this.game.godMode;
      e.target.textContent = `无失败模式: ${this.game.godMode ? '已开启' : '已关闭'}`;
      e.target.classList.toggle('active', this.game.godMode);
      this.update();
    });

    document.getElementById('dbg-btn-trigger-annual')?.addEventListener('click', () => {
      this.game.phase = 'ANNUAL_POLICY';
      const options = this.game.policyManager.generateDraftOptions();
      this.game.notifyStateChanged();
      if (typeof this.game.onAnnualDraft === 'function') {
        this.game.onAnnualDraft(options);
      }
    });

    document.getElementById('dbg-btn-clear-residues')?.addEventListener('click', () => {
      this.game.residueManager.reset();
      this.game.notifyStateChanged();
      this.update();
    });

    document.getElementById('dbg-btn-clear-sits')?.addEventListener('click', () => {
      this.game.situationManager.clearAll();
      this.game.notifyStateChanged();
      this.update();
    });

    // 数值调整
    ['treasury', 'morale', 'military', 'court'].forEach(key => {
      document.getElementById(`dbg-btn-${key}-plus`)?.addEventListener('click', () => {
        this.game.stateManager.applyDelta({ [key]: 5 });
        this.game.notifyStateChanged();
        this.update();
      });
      document.getElementById(`dbg-btn-${key}-minus`)?.addEventListener('click', () => {
        this.game.stateManager.applyDelta({ [key]: -5 });
        this.game.checkEndCondition();
        this.game.notifyStateChanged();
        this.update();
      });
    });

    // 种子重启
    document.getElementById('dbg-btn-apply-seed')?.addEventListener('click', () => {
      const customSeed = document.getElementById('dbg-input-seed')?.value.trim();
      if (customSeed) {
        this.game.startNewGame(customSeed);
        this.update();
      }
    });

    document.getElementById('dbg-btn-reset')?.addEventListener('click', () => {
      if (confirm('确认重开新朝并清空存档吗？')) {
        this.game.startNewGame();
        this.update();
      }
    });

    // 导出与复制
    document.getElementById('dbg-btn-export-json')?.addEventListener('click', () => {
      this.game.telemetryManager.downloadJSON(
        this.game.deckManager,
        this.game.situationManager,
        this.game.stateManager,
        this.game.residueManager,
        this.game.policyManager
      );
    });

    document.getElementById('dbg-btn-copy-json')?.addEventListener('click', async () => {
      const ok = await this.game.telemetryManager.copyJSON(
        this.game.deckManager,
        this.game.situationManager,
        this.game.stateManager,
        this.game.residueManager,
        this.game.policyManager
      );
      if (ok) alert('0.2 遥测数据已复制到剪贴板！');
    });
  }

  populateSelectors() {
    // 卡牌下拉
    const cardSelect = document.getElementById('dbg-select-card');
    if (cardSelect) {
      cardSelect.innerHTML = '';
      CARDS.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `[${c.category}] ${c.name}`;
        cardSelect.appendChild(opt);
      });
    }

    document.getElementById('dbg-btn-force-card')?.addEventListener('click', () => {
      const val = cardSelect?.value;
      if (val) {
        this.game.deckManager.forceCardToHand(val);
        this.game.notifyStateChanged();
        this.update();
      }
    });

    // 局势下拉
    const sitSelect = document.getElementById('dbg-select-sit');
    if (sitSelect) {
      sitSelect.innerHTML = '';
      SITUATIONS.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `[${s.category}] ${s.name}`;
        sitSelect.appendChild(opt);
      });
    }

    document.getElementById('dbg-btn-force-sit')?.addEventListener('click', () => {
      const val = sitSelect?.value;
      if (val) {
        this.game.situationManager.addSituation(val);
        this.game.notifyStateChanged();
        this.update();
      }
    });

    // 后遗状态下拉
    const resSelect = document.getElementById('dbg-select-residue');
    if (resSelect) {
      resSelect.innerHTML = '';
      Object.values(RESIDUES).forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `【${r.name}】(${r.type})`;
        resSelect.appendChild(opt);
      });
    }

    document.getElementById('dbg-btn-force-residue')?.addEventListener('click', () => {
      const val = resSelect?.value;
      if (val) {
        this.game.residueManager.addResidue(val);
        this.game.notifyStateChanged();
        this.update();
      }
    });
  }

  // 刷新监控面板
  update() {
    if (!this.isOpen) return;

    // 实时状态
    const infoEl = document.getElementById('dbg-realtime-info');
    if (infoEl) {
      const stats = this.game.stateManager.getStats();
      const dm = this.game.deckManager;
      infoEl.innerHTML = `
        <div class="dbg-kv"><span>种子：</span><code>${this.game.randomManager.initialSeed}</code></div>
        <div class="dbg-kv"><span>时间：</span>${this.game.getCurrentTimeText()} (第${this.game.turn}季)</div>
        <div class="dbg-kv"><span>阶段机：</span><strong>${this.game.phase}</strong></div>
        <div class="dbg-kv"><span>健康度：</span>库:<strong>${stats.treasury}</strong> 民:<strong>${stats.morale}</strong> 军:<strong>${stats.military}</strong> 朝:<strong>${stats.court}</strong></div>
        <div class="dbg-kv"><span>牌库统计：</span>摸牌堆: <strong>${dm.drawPile.length}</strong> | 弃牌堆: <strong>${dm.discardPile.length}</strong> | 手牌: <strong>${dm.hand.length}</strong></div>
        <div class="dbg-kv"><span>当前保留牌：</span>${dm.keptCard ? `【${dm.keptCard.name}】` : '无'}</div>
        <div class="dbg-kv"><span>后遗沉疴：</span>${this.game.residueManager.getActive().map(r => `【${r.name}·${r.duration}季】`).join(' ') || '无'}</div>
        <div class="dbg-kv"><span>已施国策：</span>${this.game.policyManager.getActive().map(p => `【${p.title}】`).join(' ') || '无'}</div>
      `;
    }

    // 局势详情
    const sitsEl = document.getElementById('dbg-sits-info');
    if (sitsEl) {
      const sits = this.game.situationManager.getActive();
      sitsEl.innerHTML = sits.length ? sits.map(s => `
        <div class="dbg-sit-item">
          <strong>【${s.name}】</strong> [${s.category}] 阶段: ${s.stage}/${s.maxStage || 3}
          <button class="dbg-btn-xs" onclick="window.__GAME__.situationManager.forceSetStage('${s.id}', 1); window.__GAME__.notifyStateChanged();">设为1阶</button>
          <button class="dbg-btn-xs" onclick="window.__GAME__.situationManager.forceSetStage('${s.id}', 2); window.__GAME__.notifyStateChanged();">设为2阶</button>
          <button class="dbg-btn-xs" onclick="window.__GAME__.situationManager.forceSetStage('${s.id}', 3); window.__GAME__.notifyStateChanged();">设为3阶</button>
        </div>
      `).join('') : '<div class="dbg-empty">当前案头无急政</div>';
    }

    // 当前手牌的 Reaction Matrix 评级透视 (Section 34)
    const matrixEl = document.getElementById('dbg-matrix-info');
    if (matrixEl) {
      const sits = this.game.situationManager.getActive();
      const hand = this.game.deckManager.hand;
      if (hand.length === 0 || sits.length === 0) {
        matrixEl.innerHTML = '<span class="dbg-text-small">无手牌或无局势可供矩阵对比</span>';
      } else {
        let tableHtml = '<table class="dbg-table"><tr><th>手牌</th>';
        sits.forEach(s => tableHtml += `<th>${s.name}</th>`);
        tableHtml += '</tr>';

        hand.forEach(c => {
          tableHtml += `<tr><td><strong>${c.name}</strong></td>`;
          sits.forEach(s => {
            const analysis = InteractionResolver.analyzeCardOptions(
              c,
              this.game.stateManager,
              [s],
              this.game.policyManager,
              this.game.residueManager
            );
            const q = analysis.bestQuality;
            tableHtml += `<td class="dbg-cell-${q}">${q}</td>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</table>';
        matrixEl.innerHTML = tableHtml;
      }
    }
  }
}
