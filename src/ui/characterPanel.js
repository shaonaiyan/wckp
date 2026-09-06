// 《一朝天子》Prototype 0.3 人物详情与生平纪事弹窗 (CharacterPanel)
// 展现人物身份、性格、当前状态名言、人生简史与【何以至此】因果溯源 (Section 47)

import { CHARACTER_TRAITS, RELATION_TYPES } from '../data/traits.js';

export class CharacterPanel {
  constructor(game) {
    this.game = game;
    this.modal = null;
    this.currentChar = null;
    this.init();
  }

  init() {
    // 动态创建人物详情弹窗容器 (如果不存在)
    let el = document.getElementById('character-modal');
    if (!el) {
      el = document.createElement('div');
      el.id = 'character-modal';
      el.className = 'modal-overlay hidden';
      el.innerHTML = `
        <div class="modal-box character-modal-box">
          <button class="modal-close" id="btn-close-char-modal">×</button>
          <div id="char-modal-content"></div>
        </div>
      `;
      document.body.appendChild(el);
    }
    this.modal = el;

    const closeBtn = document.getElementById('btn-close-char-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // 点击蒙层关闭
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide();
    });
  }

  show(characterId) {
    const char = this.game.world.characterManager.get(characterId);
    if (!char) return;
    this.currentChar = char;
    char.hasNewEvent = false; // 清除新事件提示红墨点

    const isFollowed = this.game.world.characterManager.isFollowed(char.id);
    const container = document.getElementById('char-modal-content');
    if (!container) return;

    // 格式化性格标签
    const traitsHtml = char.traits.map(tKey => {
      const def = CHARACTER_TRAITS[tKey] || { name: tKey, desc: '' };
      return `<span class="char-trait-pill" title="${def.desc}">${def.name}</span>`;
    }).join('');

    // 格式化人际关系
    const relationsList = Object.entries(char.relationships || {}).map(([oid, rtype]) => {
      const other = this.game.world.characterManager.get(oid) || { name: '朝臣' };
      const rdef = RELATION_TYPES[rtype] || { label: rtype };
      return `<div class="relation-badge">${rdef.label}：<strong>${other.name}</strong></div>`;
    }).join('') || '<span class="text-muted">朝中自立，鲜有朋党</span>';

    // 格式化人生简史 (Section 47)
    const historyItems = (char.history || []).map(h => `<li>${h}</li>`).join('');

    // 格式化【何以至此】因果溯源 (Section 37)
    const causalChains = this.game.world.causalHookManager.explainCausalChain(char.id, char.history);
    const causalItems = causalChains.map(c => `<li>${c}</li>`).join('');

    container.innerHTML = `
      <div class="char-header">
        <div class="char-seal-avatar">${char.name.slice(0, 1)}</div>
        <div class="char-titles">
          <div class="char-name-row">
            <span class="char-modal-name">${char.name}</span>
            <span class="char-modal-age">${char.age}岁 · ${char.alive ? '在朝' : '已卒'}</span>
            <button class="btn-toggle-follow ${isFollowed ? 'followed' : ''}" id="modal-btn-follow">
              ${isFollowed ? '★ 已关注' : '☆ 关注'}
            </button>
          </div>
          <div class="char-modal-office">${char.office}</div>
          <div class="char-traits-row">${traitsHtml}</div>
        </div>
      </div>

      <div class="char-quote-box">
        ${char.stateQuote || char.initialQuote}
      </div>

      <div class="char-section">
        <div class="char-section-title">朝野声闻与交游</div>
        <div class="char-relations-grid">${relationsList}</div>
      </div>

      <div class="char-section">
        <div class="char-section-title">人生简史</div>
        <ul class="char-history-list">
          ${historyItems || '<li>历仕以来平稳无波。</li>'}
        </ul>
      </div>

      <div class="char-section">
        <div class="char-section-title">【何以至此 · 因果溯源】</div>
        <ul class="char-causal-list">
          ${causalItems || '<li>此公立朝本分，暂未受帝王重大特诏偏护。</li>'}
        </ul>
      </div>
    `;

    const followBtn = document.getElementById('modal-btn-follow');
    if (followBtn) {
      followBtn.addEventListener('click', () => {
        const nowFollowed = this.game.toggleFollowCharacter(char.id);
        followBtn.textContent = nowFollowed ? '★ 已关注' : '☆ 关注';
        followBtn.classList.toggle('followed', nowFollowed);
      });
    }

    this.modal.classList.remove('hidden');
  }

  hide() {
    if (this.modal) this.modal.classList.add('hidden');
    this.currentChar = null;
  }
}
