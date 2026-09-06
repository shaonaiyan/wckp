// 《一朝天子》Prototype 0.3 御案主界面渲染器 (UIRenderer)
// PC 16:9 沉浸御案风格：深木宣纸、三大头条纪事、朝野名宿印记、五大御前奏折与朱批印玺 (Section 49~55)

import { BALANCE } from '../data/balance.js';
import { CHARACTER_TRAITS } from '../data/traits.js';

export class UIRenderer {
  constructor(game, container, characterPanel) {
    this.game = game;
    this.container = container;
    this.characterPanel = characterPanel;
  }

  render() {
    this.renderTopBar();
    this.renderHeadlines();
    this.renderCharactersSidebar();
    this.renderProposals();
    this.renderSeasonAmbience();
  }

  // 1. 顶部王朝纪年、帝储春秋与宏观背景属性 (Section 50)
  renderTopBar() {
    const world = this.game.world;
    const emp = world.royalFamilyManager.emperor;
    const heir = world.royalFamilyManager.getHeir();
    const timeText = world.historyManager.getYearSeasonText(world.turn, emp.eraName);
    const healthInfo = world.royalFamilyManager.getEmperorHealthInfo();

    // 纪年与天家信息
    const timeEl = document.getElementById('dynasty-time-text');
    if (timeEl) {
      timeEl.innerHTML = `<strong>${emp.dynasty}</strong> · <span class="era-badge">${timeText}</span>`;
    }

    const emperorEl = document.getElementById('emperor-info-text');
    if (emperorEl) {
      emperorEl.innerHTML = `
        <span class="info-label">圣躬：</span><strong>${emp.age}岁</strong>
        <span class="health-badge health-${emp.healthLevel}" title="${healthInfo.desc}">【${healthInfo.label}】</span>
        <span class="info-divider">|</span>
        <span class="info-label">在位：</span><strong>${emp.yearsReigning}年</strong>
        <span class="info-divider">|</span>
        <span class="info-label">储嗣：</span><strong>${heir ? `${heir.title}【${heir.name}】(${heir.age}岁)` : '未立'}</strong>
      `;
    }

    // 宏观四维：降级为词汇描述 + 很弱的背景条 (Section 41 & 50)
    this.renderMacroStat('treasury', world.macroStats.treasury, '国库');
    this.renderMacroStat('livelihood', world.macroStats.livelihood, '民生');
    this.renderMacroStat('might', world.macroStats.might, '国势');
    this.renderMacroStat('authority', world.macroStats.authority, '皇威');
  }

  renderMacroStat(statKey, val, name) {
    const tiers = BALANCE.STAT_DESCRIPTIONS[statKey] || [];
    let tier = tiers.find(t => val >= t.min && val <= t.max) || tiers[tiers.length - 1];

    const labelEl = document.getElementById(`stat-desc-${statKey}`);
    const barEl = document.getElementById(`stat-bar-${statKey}`);

    if (labelEl) {
      labelEl.textContent = tier ? tier.label : '尚可';
      labelEl.title = tier ? `${name}：${tier.desc} (数值：${val})` : '';
    }
    if (barEl) {
      barEl.style.width = `${Math.max(5, Math.min(100, val))}%`;
    }
  }

  // 2. 中央三大御前头条 (天下、朝堂、宫中) (Section 23 & 50)
  renderHeadlines() {
    const container = document.getElementById('headlines-container');
    if (!container) return;
    container.innerHTML = '';

    const headlines = this.game.world.newsManager.currentHeadlines;
    const catNames = { realm: '天下大势', court: '朝堂章奏', palace: '禁中文华' };

    headlines.forEach(news => {
      const card = document.createElement('div');
      card.className = `headline-card headline-${news.category || 'realm'}`;

      let charBadge = '';
      if (news.character) {
        charBadge = `<span class="headline-char-tag">涉及名宿：${news.character.name}</span>`;
      }

      card.innerHTML = `
        <div class="headline-type-badge">${catNames[news.category] || '天下纪事'}</div>
        <div class="headline-title">${news.title}</div>
        <div class="headline-content">${news.text}</div>
        ${charBadge ? `<div class="headline-footer">${charBadge}</div>` : ''}
      `;
      container.appendChild(card);
    });
  }

  // 3. 屏幕一侧：当前 5~8 名朝野重要人物印章卡 (Section 51)
  renderCharactersSidebar() {
    const container = document.getElementById('characters-list');
    if (!container) return;
    container.innerHTML = '';

    const characters = this.game.world.characterManager.getActive();

    characters.forEach(char => {
      const isFollowed = this.game.world.characterManager.isFollowed(char.id);
      const card = document.createElement('div');
      card.className = `character-card ${isFollowed ? 'is-followed' : ''}`;

      // 性格标签
      const traitsHtml = char.traits.map(tKey => {
        const def = CHARACTER_TRAITS[tKey] || { name: tKey };
        return `<span class="trait-tag">${def.name}</span>`;
      }).join('');

      card.innerHTML = `
        <div class="char-avatar-seal">
          <div class="seal-inner">${char.name.slice(0, 1)}</div>
          ${char.hasNewEvent ? '<div class="ink-dot-indicator" title="此公有新近重大章奏变故"></div>' : ''}
        </div>
        <div class="char-summary">
          <div class="char-header-line">
            <span class="char-name">${char.name}</span>
            <span class="char-age">${char.age}岁</span>
            <button class="char-star-btn ${isFollowed ? 'active' : ''}" data-id="${char.id}" title="关注此人">
              ${isFollowed ? '★' : '☆'}
            </button>
          </div>
          <div class="char-office">${char.office}</div>
          <div class="char-traits">${traitsHtml}</div>
          <div class="char-state-quote">${char.stateQuote || char.initialQuote}</div>
        </div>
      `;

      // 关注按钮事件
      const starBtn = card.querySelector('.char-star-btn');
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.toggleFollowCharacter(char.id);
      });

      // 点击展开人物详情与生平纪事弹窗
      card.addEventListener('click', () => {
        if (this.characterPanel) {
          this.characterPanel.show(char.id);
        }
      });

      container.appendChild(card);
    });
  }

  // 4. 底部御前 5 份奏折与朱批 (Section 52 & 53)
  renderProposals() {
    const container = document.getElementById('proposals-container');
    if (!container) return;
    container.innerHTML = '';

    const proposals = this.game.world.proposalManager.currentProposals;
    const selectedId = this.game.selectedProposalId;

    proposals.forEach(prop => {
      const isSelected = selectedId === prop.id;
      const isKept = this.game.world.proposalManager.keptProposal && this.game.world.proposalManager.keptProposal.id === prop.id;

      const card = document.createElement('div');
      card.className = `proposal-card ${isSelected ? 'selected' : ''} ${isKept ? 'is-kept' : ''}`;

      card.innerHTML = `
        <div class="proposal-source-badge">${prop.sourceDepartment}</div>
        <div class="proposal-title">${prop.title}</div>
        <div class="proposal-desc">${prop.description}</div>
        <div class="proposal-consequence">
          <strong>直接后果：</strong>${prop.visibleConsequences}
        </div>
        <div class="proposal-card-actions">
          <button class="wood-btn btn-xs btn-keep-proposal ${isKept ? 'active' : ''}">
            ${isKept ? '已留中待议' : '留中'}
          </button>
        </div>
      `;

      // 点击留中待议
      const keepBtn = card.querySelector('.btn-keep-proposal');
      keepBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.toggleKeepProposal(prop.id);
      });

      // 点选奏折
      card.addEventListener('click', () => {
        this.game.selectProposal(prop.id);
      });

      container.appendChild(card);
    });

    // 更新底部朱批与退朝按钮状态 (Section 53 & 54)
    const playBtn = document.getElementById('btn-play-card');
    const adjournBtn = document.getElementById('btn-adjourn-court');

    if (playBtn) {
      if (selectedId && !this.game.world.isSuccessionPending) {
        playBtn.disabled = false;
        playBtn.classList.remove('disabled');
        playBtn.textContent = '朱批照准';
      } else {
        playBtn.disabled = true;
        playBtn.classList.add('disabled');
        playBtn.textContent = '请批阅奏折';
      }
    }

    if (adjournBtn) {
      if (!this.game.world.isSuccessionPending) {
        adjournBtn.disabled = false;
        adjournBtn.classList.remove('disabled');
        adjournBtn.textContent = '退朝 · 无为';
      } else {
        adjournBtn.disabled = true;
        adjournBtn.classList.add('disabled');
      }
    }
  }

  // 5. 季节氛围微妙光晕变化 (Section 83)
  renderSeasonAmbience() {
    const season = this.game.world.historyManager.getSeason(this.game.world.turn);
    const theme = BALANCE.SEASON_THEMES[season];
    const deskEl = document.getElementById('game-container');
    if (deskEl && theme) {
      deskEl.style.backgroundColor = '';
      deskEl.style.boxShadow = `inset 0 0 100px ${theme.tint}`;
    }
  }

  // 朱批盖印反馈动画 (Section 53)
  playEnactFeedback(feedbackText) {
    const overlay = document.getElementById('seal-animation-overlay');
    const sealImg = document.getElementById('imperial-seal-stamp');
    const feedbackBox = document.getElementById('action-feedback-banner');
    const feedbackFlavor = document.getElementById('feedback-flavor-text');

    if (overlay && sealImg) {
      overlay.classList.remove('hidden');
      sealImg.classList.add('stamp-down');
      setTimeout(() => {
        sealImg.classList.remove('stamp-down');
        overlay.classList.add('hidden');
      }, 750);
    }

    if (feedbackBox && feedbackFlavor) {
      feedbackFlavor.textContent = feedbackText || '朱批照准，诸司即刻奉行。';
      feedbackBox.classList.remove('hidden');
      setTimeout(() => {
        feedbackBox.classList.add('hidden');
      }, 2500);
    }
  }
}
