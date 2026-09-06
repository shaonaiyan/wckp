// 《一朝天子》Prototype 0.3 帝王本纪与大统继位弹窗 (EndingPanel)
// 展现《大行皇帝本纪》史评，并提供【继承大统 · 继续王朝】承续世界生态 (Section 9 & 10)

export class EndingPanel {
  constructor(game) {
    this.game = game;
    this.modal = null;
    this.init();
  }

  init() {
    let el = document.getElementById('succession-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'succession-modal';
      el.className = 'modal-overlay hidden';
      el.innerHTML = `
        <div class="modal-box succession-modal-box">
          <div class="annals-header">
            <div class="annals-dynasty-badge" id="annals-dynasty-badge">大晟实录</div>
            <h2 class="annals-title" id="annals-title">【永安帝本纪】</h2>
            <div class="annals-subtitle" id="annals-subtitle">享年五十三岁 · 临朝在位二十四年</div>
          </div>

          <div class="annals-body">
            <div class="annals-card">
              <div class="annals-field"><strong>大行尊谥：</strong><span id="annals-posthumous">宣皇帝</span></div>
              <div class="annals-field"><strong>辅政大臣：</strong><span id="annals-minister">沈恪、魏肃</span></div>
              <div class="annals-field"><strong>在位大略：</strong><span id="annals-deeds">开海通商；清丈隐田。</span></div>
              <div class="annals-field"><strong>嗣位皇子：</strong><span id="annals-successor">皇太子承平</span></div>
            </div>

            <div class="annals-evaluation-box" id="annals-evaluation">
              史臣赞曰：恭俭有度，宽以持中，终保宗社承平。
            </div>

            <div class="annals-full-text" id="annals-fulltext"></div>
          </div>

          <div class="modal-actions annals-actions">
            <button class="wood-btn btn-primary btn-large" id="btn-continue-succession">
              继承大统 · 继续王朝
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(el);
    }
    this.modal = el;

    const continueBtn = document.getElementById('btn-continue-succession');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.hide();
        this.game.continueSuccession();
      });
    }
  }

  show(annals) {
    if (!annals) return;
    const titleEl = document.getElementById('annals-title');
    const subtitleEl = document.getElementById('annals-subtitle');
    const postEl = document.getElementById('annals-posthumous');
    const minEl = document.getElementById('annals-minister');
    const deedsEl = document.getElementById('annals-deeds');
    const succEl = document.getElementById('annals-successor');
    const evalEl = document.getElementById('annals-evaluation');
    const fullEl = document.getElementById('annals-fulltext');

    if (titleEl) titleEl.textContent = `【${annals.eraName}帝本纪】`;
    if (subtitleEl) subtitleEl.textContent = `享年 ${annals.deathAge} 岁 · 临朝在位 ${annals.yearsReigned} 年`;
    if (postEl) postEl.textContent = annals.posthumousTitle;
    if (minEl) minEl.textContent = annals.mostImportantMinister;
    if (deedsEl) deedsEl.textContent = annals.deedsSummary;
    if (succEl) succEl.textContent = `皇太子【${annals.successor}】`;
    if (evalEl) evalEl.innerHTML = `<strong>史臣评赞：</strong>${annals.summaryEvaluation}`;
    if (fullEl) fullEl.textContent = annals.fullText;

    this.modal.classList.remove('hidden');
  }

  hide() {
    if (this.modal) this.modal.classList.add('hidden');
  }
}
