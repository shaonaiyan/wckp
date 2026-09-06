// 主界面渲染与交互渲染器
import { BALANCE } from '../data/balance.js';

export class UIRenderer {
  constructor(game, container) {
    this.game = game;
    this.container = container;
  }

  // 全量渲染刷新
  render() {
    this.renderTopBar();
    this.renderSituations();
    this.renderHand();
    this.renderActionBar();
    this.renderHistorySidebar();
    this.renderStatesBadges();
  }

  // 顶部状态栏渲染
  renderTopBar() {
    const timeEl = document.getElementById('dynasty-time');
    const eraEl = document.getElementById('dynasty-era');
    if (timeEl) timeEl.textContent = this.game.getCurrentTimeText();
    if (eraEl) eraEl.textContent = `大统第 ${this.game.turn} / ${BALANCE.MAX_TURNS} 季`;

    const stats = this.game.stateManager.getStats();
    const tiers = this.game.stateManager.getAllTiers();

    // 四项核心属性
    const statKeys = ['treasury', 'morale', 'military', 'court'];
    for (const key of statKeys) {
      const tier = tiers[key];
      const val = stats[key];
      const tierEl = document.getElementById(`stat-tier-${key}`);
      const barEl = document.getElementById(`stat-bar-${key}`);
      const tooltipEl = document.getElementById(`stat-exact-${key}`);

      if (tierEl) {
        tierEl.textContent = tier.label;
        tierEl.className = `stat-tier ${tier.css}`;
      }
      if (barEl) {
        barEl.style.width = `${val}%`;
        barEl.className = `stat-bar-fill ${tier.css}`;
      }
      if (tooltipEl) {
        tooltipEl.textContent = `${val}/100`;
      }
    }
  }

  // 长期状态徽章渲染
  renderStatesBadges() {
    const listEl = document.getElementById('active-states-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const states = this.game.stateManager.longTermStates;
    if (states.length === 0) {
      listEl.innerHTML = '<span class="empty-state-hint">暂无长期定规</span>';
      return;
    }

    import('../data/states.js').then(({ LONG_TERM_STATES }) => {
      states.forEach(sid => {
        const def = LONG_TERM_STATES[sid];
        if (!def) return;
        const badge = document.createElement('div');
        badge.className = `state-badge state-${def.type}`;
        badge.innerHTML = `
          <span class="badge-dot"></span>
          <span class="badge-title">【${def.name}】</span>
          <div class="state-popover">
            <div class="popover-title">【${def.name}】</div>
            <div class="popover-desc">${def.description}</div>
          </div>
        `;
        listEl.appendChild(badge);
      });
    });
  }

  // 场上天下局势渲染 (最多3张)
  renderSituations() {
    const container = document.getElementById('situations-board');
    if (!container) return;
    container.innerHTML = '';

    const situations = this.game.situationManager.getActive();
    const selectedSituationId = this.game.selectedSituationId;
    const selectedCard = this.getSelectedCard();

    situations.forEach(sit => {
      const cardEl = document.createElement('div');
      cardEl.className = `situation-card situation-${sit.category}`;
      if (selectedSituationId === sit.id) cardEl.classList.add('selected');

      // 检查是否与当前选中的手牌可响应
      let isResponsive = false;
      if (selectedCard) {
        const matchesTags = selectedCard.tags && sit.responsiveTags &&
          selectedCard.tags.some(t => sit.responsiveTags.includes(t));
        const matchesCat = sit.responsiveTags && sit.responsiveTags.includes(selectedCard.category);
        const matchesDirect = selectedCard.targetTags && selectedCard.targetTags.some(t => sit.responsiveTags.includes(t) || sit.id === t);
        if (matchesTags || matchesCat || matchesDirect) {
          isResponsive = true;
          cardEl.classList.add('highlight-responsive');
        }
      }

      // 局势等级标识 (点或阶)
      let stageDots = '';
      for (let i = 1; i <= (sit.maxStage || 3); i++) {
        stageDots += `<span class="stage-pip ${i <= sit.stage ? 'active' : ''}"></span>`;
      }

      // 持续时间描述
      const durationText = sit.duration > 0 ? `余 ${sit.duration} 季` : '持久常驻';

      // 影响效果描述
      const effectsList = [];
      if (sit.tickEffect.treasury) effectsList.push(`国库 ${sit.tickEffect.treasury > 0 ? '+' : ''}${sit.tickEffect.treasury}`);
      if (sit.tickEffect.morale) effectsList.push(`民心 ${sit.tickEffect.morale > 0 ? '+' : ''}${sit.tickEffect.morale}`);
      if (sit.tickEffect.military) effectsList.push(`军势 ${sit.tickEffect.military > 0 ? '+' : ''}${sit.tickEffect.military}`);
      if (sit.tickEffect.court) effectsList.push(`朝局 ${sit.tickEffect.court > 0 ? '+' : ''}${sit.tickEffect.court}`);

      const categoryLabel = sit.category === 'positive' ? '祥兆' : (sit.category === 'crisis' ? '重大危机' : '政患');

      cardEl.innerHTML = `
        <div class="sit-header">
          <span class="sit-tag tag-${sit.category}">${categoryLabel}</span>
          <span class="sit-duration">${durationText}</span>
        </div>
        <div class="sit-name">【${sit.name}】</div>
        <div class="sit-stage">烈度等次：${stageDots}</div>
        <div class="sit-desc">${sit.description}</div>
        <div class="sit-effects">每季影响：${effectsList.length ? effectsList.join('，') : '微弱'}</div>
        ${isResponsive ? '<div class="sit-responsive-tip">◈ 选中奏折切中该局势</div>' : ''}
      `;

      cardEl.addEventListener('click', () => {
        if (this.game.phase === 'PLAY_CARD') {
          this.game.selectSituation(sit.id);
        }
      });

      container.appendChild(cardEl);
    });

    // 若场上局势少于3个，填充雅致木案留白
    const emptyCount = BALANCE.MAX_ACTIVE_SITUATIONS - situations.length;
    for (let i = 0; i < emptyCount; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'situation-placeholder';
      placeholder.innerHTML = '<span>案头无急务 · 暂安</span>';
      container.appendChild(placeholder);
    }
  }

  // 底部手牌渲染 (5张奏折折子)
  renderHand() {
    const handContainer = document.getElementById('hand-cards');
    if (!handContainer) return;
    handContainer.innerHTML = '';

    const hand = this.game.cardManager.hand;
    const selectedId = this.game.selectedCardId;
    const keptCard = this.game.cardManager.keptCard;
    const isPostPlay = this.game.phase === 'POST_PLAY';

    hand.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `hand-card card-cat-${card.category}`;
      if (selectedId === card.id) cardEl.classList.add('selected');
      if (card.isKeptFromPrev) cardEl.classList.add('kept-from-prev');

      const isThisCardKept = keptCard && keptCard.id === card.id;
      if (isThisCardKept) cardEl.classList.add('marked-to-keep');

      // 动态警告提示
      let warningHtml = '';
      if (typeof card.warningCondition === 'function' && card.warningCondition(this.game.situationManager.getActive())) {
        warningHtml = `<div class="card-warning-hint">${card.warningHint || '⚠ 局势不利'}</div>`;
      }

      // 印章/标签
      let sealTag = '';
      if (card.isKeptFromPrev) {
        sealTag = '<span class="card-seal-tag seal-past">上季遗策</span>';
      }
      if (isThisCardKept) {
        sealTag += '<span class="card-seal-tag seal-keep">留待下朝</span>';
      }

      // 分类名
      const catConfig = BALANCE.CARD_CATEGORIES[card.category] || { name: '杂务' };

      cardEl.innerHTML = `
        <div class="card-spine"></div>
        <div class="card-content-wrap">
          <div class="card-top-row">
            <span class="card-category-label">${catConfig.name}</span>
            ${sealTag}
          </div>
          <div class="card-title">${card.name}</div>
          <div class="card-summary">${card.description}</div>
          <div class="card-effect-preview">${card.effectDisplay}</div>
          ${warningHtml}
          ${isPostPlay ? `
            <button class="btn-toggle-keep ${isThisCardKept ? 'active' : ''}">
              ${isThisCardKept ? '已留待下朝' : '留待下朝'}
            </button>
          ` : ''}
        </div>
      `;

      // 点击交互
      if (!isPostPlay) {
        cardEl.addEventListener('click', () => {
          this.game.selectCard(card.id);
        });
      } else {
        const keepBtn = cardEl.querySelector('.btn-toggle-keep');
        if (keepBtn) {
          keepBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.game.toggleKeepCard(card.id);
          });
        }
        cardEl.addEventListener('click', () => {
          this.game.toggleKeepCard(card.id);
        });
      }

      handContainer.appendChild(cardEl);
    });
  }

  // 底部控制按钮与操作提示栏
  renderActionBar() {
    const playBtn = document.getElementById('btn-play-card');
    const adjournBtn = document.getElementById('btn-adjourn-court');
    const hintEl = document.getElementById('action-hint-text');

    const selectedCard = this.getSelectedCard();
    const isPostPlay = this.game.phase === 'POST_PLAY';

    if (hintEl) {
      if (this.game.phase === 'PLAY_CARD') {
        if (!selectedCard) {
          hintEl.textContent = '请从案头奏折中挑选一卷批复施行。每季仅可行一策。';
        } else if (selectedCard.targetType === 'situation' && !this.game.selectedSituationId) {
          hintEl.textContent = `【${selectedCard.name}】需选定具体天下局势作为目标，请点击上方局势牌。`;
        } else {
          hintEl.textContent = `已选定【${selectedCard.name}】。点击「盖印奉旨」即行实施。`;
        }
      } else if (isPostPlay) {
        hintEl.textContent = '此策已定。可挑选至多一卷手牌「留待下朝」，或直接点击「退朝」。';
      } else if (this.game.phase === 'ENDED') {
        hintEl.textContent = '朝事已毕。';
      }
    }

    if (playBtn) {
      if (this.game.phase === 'PLAY_CARD' && selectedCard) {
        playBtn.disabled = false;
        playBtn.classList.remove('disabled');
      } else {
        playBtn.disabled = true;
        playBtn.classList.add('disabled');
      }
    }

    if (adjournBtn) {
      if (isPostPlay && !this.game.isGameOver) {
        adjournBtn.disabled = false;
        adjournBtn.classList.remove('disabled');
      } else {
        adjournBtn.disabled = true;
        adjournBtn.classList.add('disabled');
      }
    }
  }

  // 渲染左侧史册
  renderHistorySidebar() {
    const listEl = document.getElementById('chronicle-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const entries = this.game.historyManager.getAllEntries();
    // 逆序展示最近的历史
    [...entries].reverse().forEach(entry => {
      const item = document.createElement('div');
      item.className = `chronicle-item item-${entry.type}`;

      let deltaSummary = '';
      if (entry.delta) {
        const changes = [];
        if (entry.delta.treasury) changes.push(`国库${entry.delta.treasury > 0 ? '+' : ''}${entry.delta.treasury}`);
        if (entry.delta.morale) changes.push(`民心${entry.delta.morale > 0 ? '+' : ''}${entry.delta.morale}`);
        if (entry.delta.military) changes.push(`军势${entry.delta.military > 0 ? '+' : ''}${entry.delta.military}`);
        if (entry.delta.court) changes.push(`朝局${entry.delta.court > 0 ? '+' : ''}${entry.delta.court}`);
        if (changes.length > 0) deltaSummary = `(${changes.join(' ')})`;
      }

      item.innerHTML = `
        <div class="chronicle-time">${entry.timeText}</div>
        <div class="chronicle-title">${entry.title} <span class="chronicle-delta">${deltaSummary}</span></div>
        <div class="chronicle-text">${entry.text}</div>
      `;
      listEl.appendChild(item);
    });
  }

  // 获取当前选中的手牌对象
  getSelectedCard() {
    if (!this.game.selectedCardId) return null;
    return this.game.cardManager.hand.find(c => c.id === this.game.selectedCardId);
  }

  // 播放打牌出牌视觉动效（玉玺盖印 + 历史文本飘出）
  playCardFeedback(result) {
    const overlay = document.getElementById('seal-animation-overlay');
    const sealImg = document.getElementById('imperial-seal-stamp');
    const feedbackBox = document.getElementById('action-feedback-banner');
    const feedbackText = document.getElementById('feedback-flavor-text');
    const feedbackDeltas = document.getElementById('feedback-stat-deltas');

    if (overlay && sealImg) {
      overlay.classList.remove('hidden');
      sealImg.classList.add('stamp-down');

      setTimeout(() => {
        sealImg.classList.remove('stamp-down');
        overlay.classList.add('hidden');
      }, 700);
    }

    if (feedbackBox && feedbackText) {
      feedbackText.textContent = `“${result.flavor}”`;

      // 渲染变化浮动数值
      if (feedbackDeltas) {
        feedbackDeltas.innerHTML = '';
        const d = result.delta;
        const labels = [
          { key: 'treasury', name: '国库' },
          { key: 'morale', name: '民心' },
          { key: 'military', name: '军势' },
          { key: 'court', name: '朝局' }
        ];
        labels.forEach(item => {
          const val = d[item.key];
          if (val) {
            const span = document.createElement('span');
            span.className = `delta-tag ${val > 0 ? 'pos' : 'neg'}`;
            span.textContent = `${item.name} ${val > 0 ? '↑' : '↓'} ${Math.abs(val)}`;
            feedbackDeltas.appendChild(span);
          }
        });
      }

      feedbackBox.classList.remove('hidden');
      feedbackBox.classList.add('show-feedback');
    }
  }
}
