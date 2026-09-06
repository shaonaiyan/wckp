// 《一朝天子》Prototype 0.3 调试面板 (DebugPanel)
// 提供 6 大标准预设场景、快进演变、强制事件、隐蔽属性监视与 Telemetry 导出 (Section 66 & 72)

export class DebugPanel {
  constructor(game) {
    this.game = game;
    this.container = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    let el = document.getElementById('debug-panel-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'debug-panel-container';
      el.className = 'debug-panel hidden';
      document.body.appendChild(el);
    }
    this.container = el;

    const toggleBtn = document.getElementById('btn-toggle-debug');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        this.container.classList.toggle('hidden', !this.isOpen);
        if (this.isOpen) this.render();
      });
    }

    this.render();
  }

  update() {
    if (this.isOpen) {
      this.render();
    }
  }

  render() {
    if (!this.container) return;
    const world = this.game.world;
    const emp = world.royalFamilyManager.emperor;
    const heir = world.royalFamilyManager.getHeir();
    const metrics = this.game.telemetryManager.calculateMetrics(world);

    this.container.innerHTML = `
      <div class="debug-header">
        <h3>御前乾坤阁 · 0.3 调试与推演中枢</h3>
        <button class="debug-close-btn" id="btn-close-debug">×</button>
      </div>

      <div class="debug-section">
        <div class="debug-label">6大标准验收测试场景 (Section 72)</div>
        <div class="debug-btn-grid">
          <button class="wood-btn btn-sm" id="btn-preset-test-a">Test A: 纯旁观20季</button>
          <button class="wood-btn btn-sm" id="btn-preset-test-b">Test B: 提拔名臣沈恪</button>
          <button class="wood-btn btn-sm" id="btn-preset-test-c">Test C: 养大将韩策</button>
          <button class="wood-btn btn-sm" id="btn-preset-test-d">Test D: 完全昏君治世</button>
          <button class="wood-btn btn-sm" id="btn-preset-test-e">Test E: 储君十五年成长</button>
          <button class="wood-btn btn-sm" id="btn-preset-test-f">Test F: 皇帝驾崩新皇继位</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-label">岁月推进与旁观模拟 (Section 4)</div>
        <div class="debug-btn-grid">
          <button class="wood-btn btn-sm" id="btn-debug-step-1">推进 1 季</button>
          <button class="wood-btn btn-sm" id="btn-debug-step-4">快进 1 年 (4季)</button>
          <button class="wood-btn btn-sm" id="btn-debug-step-20">快进 5 年 (20季)</button>
          <button class="wood-btn btn-sm btn-warn" id="btn-debug-kill-emperor">强制皇帝驾崩</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-label">0.3 核心生命力指标 (Telemetry 0.3)</div>
        <div class="debug-info-box">
          <div>推演总季度：<strong>${metrics.totalTurns} 季</strong> | 总生成事件：<strong>${metrics.totalEventsSimulated}</strong></div>
          <div>故事连续率 (Thread占比)：<strong>${metrics.storyContinuityRate}</strong></div>
          <div>人物复现率 (人物出镜占比)：<strong>${metrics.characterRecurrenceRate}</strong></div>
          <div>孤立随机事件率：<strong>${metrics.isolatedRandomEventRatio}</strong> (越低越好)</div>
          <div>人物平均复现间隔：<strong>${metrics.avgCharacterReturnInterval}</strong></div>
          <div>种下因果Hook：<strong>${metrics.causalHooksPlanted}</strong> | 触发后延因果：<strong>${metrics.causalHooksTriggered}</strong></div>
        </div>
        <div class="debug-btn-grid mt-2">
          <button class="wood-btn btn-sm" id="btn-debug-export-json">下载 0.3 完整JSON</button>
          <button class="wood-btn btn-sm" id="btn-debug-copy-json">复制 0.3 JSON</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-label">天家与朝臣隐蔽数值</div>
        <div class="debug-info-box">
          <div>皇帝：${emp ? emp.name : '无'} (${emp ? emp.age : 0}岁) · 健康Level: ${emp ? emp.healthLevel : 0}</div>
          <div>储君：${heir ? heir.name : '未立'} (${heir ? heir.age : 0}岁) · 讲官: ${heir ? heir.tutor || '无' : '无'}</div>
          <div>活跃故事线程：${world.threadManager.getActiveThreads().map(t => t.name + `(第${t.stage}阶)`).join('、') || '无'}</div>
          <div>种下的因果Hook：${world.causalHookManager.getAll().map(h => h.name).join('、') || '无'}</div>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-label">四大区域与五大势力精确数值</div>
        <div class="debug-info-box">
          <div>北境：繁荣 ${world.regions.north.prosperity} / 治安 ${world.regions.north.order} / 压力 ${world.regions.north.pressure}</div>
          <div>江南：繁荣 ${world.regions.south.prosperity} / 治安 ${world.regions.south.order} / 压力 ${world.regions.south.pressure}</div>
          <div>文官: ${world.factions.civil.influence} | 武将: ${world.factions.military.influence} | 豪族: ${world.factions.gentry.influence} | 商人: ${world.factions.merchants.influence} | 内廷: ${world.factions.palace.influence}</div>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-label">种子控制与重开</div>
        <div class="debug-row">
          <input type="text" id="debug-seed-input" value="${world.initialSeed}" class="wood-input" style="width: 140px;" />
          <button class="wood-btn btn-sm" id="btn-debug-apply-seed">应用并重开</button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = document.getElementById('btn-close-debug');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.isOpen = false;
        this.container.classList.add('hidden');
      });
    }

    // 预设场景绑定
    document.getElementById('btn-preset-test-a')?.addEventListener('click', () => {
      this.game.setupScenarioTestA();
      alert('已执行 Test A：纯旁观 20 季度世界自运转完成！可展开实录或查看下方头条。');
    });

    document.getElementById('btn-preset-test-b')?.addEventListener('click', () => {
      this.game.setupScenarioTestB();
      alert('已执行 Test B：提拔沈恪为帝师并清丈田亩，连续推演 12 季完成！');
    });

    document.getElementById('btn-preset-test-c')?.addEventListener('click', () => {
      this.game.setupScenarioTestC();
      alert('已执行 Test C：连续大养大将韩策，后召其入京参政，推演 16 季完成！');
    });

    document.getElementById('btn-preset-test-d')?.addEventListener('click', () => {
      this.game.setupScenarioTestD();
      alert('已执行 Test D：完全昏君治世，大修西苑、求仙、南巡，推演 12 季完成！');
    });

    document.getElementById('btn-preset-test-e')?.addEventListener('click', () => {
      this.game.setupScenarioTestE();
      alert('已执行 Test E：储君 15 年经筵开蒙、成丁、议政推演完成！');
    });

    document.getElementById('btn-preset-test-f')?.addEventListener('click', () => {
      this.game.setupScenarioTestF();
      alert('已执行 Test F：皇帝驾崩、生成本纪、新君继位继续王朝完成！');
    });

    // 步进按钮
    document.getElementById('btn-debug-step-1')?.addEventListener('click', () => {
      this.game.adjournCourt();
    });

    document.getElementById('btn-debug-step-4')?.addEventListener('click', () => {
      this.game.spectateQuarters(4);
    });

    document.getElementById('btn-debug-step-20')?.addEventListener('click', () => {
      this.game.spectateQuarters(20);
    });

    document.getElementById('btn-debug-kill-emperor')?.addEventListener('click', () => {
      const world = this.game.world;
      world.royalFamilyManager.forceEmperorDeath(world.turn, '暴疾崩殂');
      world.isSuccessionPending = true;
      world.currentAnnals = world.successionManager.generateImperialAnnals(
        world.royalFamilyManager.emperor,
        world.royalFamilyManager,
        world.characterManager,
        world.historyManager,
        world.causalHookManager
      );
      if (typeof this.game.onSuccessionPrompt === 'function') {
        this.game.onSuccessionPrompt(world.currentAnnals);
      }
      this.game.notifyStateChanged();
    });

    // Telemetry JSON 导出
    document.getElementById('btn-debug-export-json')?.addEventListener('click', () => {
      this.game.telemetryManager.downloadJSON(this.game.world);
    });

    document.getElementById('btn-debug-copy-json')?.addEventListener('click', async () => {
      const ok = await this.game.telemetryManager.copyJSON(this.game.world);
      if (ok) alert('Prototype 0.3 完整遥测数据已复制至剪贴板！');
    });

    // 种子重开
    document.getElementById('btn-debug-apply-seed')?.addEventListener('click', () => {
      const seedVal = document.getElementById('debug-seed-input').value.trim();
      this.game.startNewGame(seedVal || null);
    });
  }
}
