// 《一朝天子》Prototype 0.3 王朝实录侧边栏 (ChroniclePanel)
// 提供历史编年起居注查询与分类筛选 (Section 56)

export class ChroniclePanel {
  constructor(game) {
    this.game = game;
    this.filterCategory = 'all';
    this.init();
  }

  init() {
    const toggleBtn = document.getElementById('btn-toggle-chronicle');
    const sidebar = document.getElementById('chronicle-sidebar');
    const closeBtn = document.getElementById('btn-close-chronicle');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        this.render();
      });
    }

    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    }

    // 分类筛选标签
    const filterContainer = document.getElementById('chronicle-filters');
    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.chronicle-filter-btn');
        if (!btn) return;
        document.querySelectorAll('.chronicle-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterCategory = btn.dataset.category || 'all';
        this.render();
      });
    }
  }

  render() {
    const listEl = document.getElementById('chronicle-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const entries = this.game.world.historyManager.getAllEntries();
    const filtered = entries.filter(entry => {
      if (this.filterCategory === 'all') return true;
      if (this.filterCategory === 'palace' && (entry.type === 'palace' || entry.type === 'royal')) return true;
      if (this.filterCategory === 'action' && (entry.type === 'action' || entry.type === 'adjourn')) return true;
      return entry.type === this.filterCategory;
    });

    [...filtered].reverse().forEach(entry => {
      const item = document.createElement('div');
      item.className = `chronicle-item item-${entry.type}`;
      item.innerHTML = `
        <div class="chronicle-time">${entry.timeText}</div>
        <div class="chronicle-title">${entry.title}</div>
        <div class="chronicle-text">${entry.text}</div>
      `;
      listEl.appendChild(item);
    });
  }
}
