// Prototype 0.2 主界面渲染器 (UIRenderer)
// 强调局势三阶段印记、可行方向、卡牌人格、自动索敌锁定与代价预告

import { BALANCE } from '../data/balance.js';
import { InteractionResolver } from '../engine/interactionResolver.js';

export class UIRenderer {
  constructor(game, container) {
    this.game = game;
    this.container = container;
  }

  render() {
    this.renderTopBar();
    this.renderResiduesAndPolicies();
    this.renderSituations();
    this.renderHand();
    this.renderActionBar();
    this.renderHistorySidebar();
  }

  // 顶部四项健康度与纪年
  renderTopBar() {
    const timeEl = document.getElementById('dynasty-time');
    const eraEl = document.getElementById('dynasty-era');
    if (timeEl) timeEl.textContent = this.game.getCurrentTimeText();
    if (eraEl) eraEl.textContent = `治世第 ${this.game.turn} / ${BALANCE.MAX_TURNS} 季`;

    const stats = this.game.stateManager.getStats();
    const tiers = this.game.stateManager.getAllTiers();

    ['treasury', 'morale', 'military', 'court'].forEach(key => {
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
    });
  }

  // 渲染后遗状态 (Residues) 与年度国策 (Policies) 徽章
  renderResiduesAndPolicies() {
    const listEl = document.getElementById('active-states-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const residues = this.game.residueManager.getActive();
    const policies = this.game.policyManager.getActive();

    if (residues.length === 0 && policies.length === 0) {
      listEl.innerHTML = '<span class="empty-state-hint">案头清简 · 暂无沉疴与国策羁绊</span>';
      return;
    }

    // 年度国策徽章
    policies.forEach(p => {
      const badge = document.createElement('div');
      badge.className = 'state-badge badge-policy';
      badge.innerHTML = `
        <span class="badge-tag">国策</span>
        <span class="badge-title">【${p.title}】</span>
        <div class="state-popover">
          <div class="popover-title">国策：${p.name}</div>
          <div class="popover-desc">${p.description}</div>
        </div>
      `;
      listEl.appendChild(badge);
    });

    // 后遗状态徽章
    residues.forEach(r => {
      const badge = document.createElement('div');
      badge.className = `state-badge badge-residue residue-${r.type}`;
      badge.innerHTML = `
        <span class="badge-tag">后遗</span>
        <span class="badge-title">【${r.name} · ${r.duration}季】</span>
        <div class="state-popover">
          <div class="popover-title">后遗：${r.name} (余${r.duration}季)</div>
          <div class="popover-desc">${r.description}</div>
        </div>
      `;
      listEl.appendChild(badge);
    });
  }

  // 渲染场上天下局势 (三阶段印记 ●○○ + 可行方向)
  renderSituations() {
    const container = document.getElementById('situations-board');
    if (!container) return;
    container.innerHTML = '';

    const situations = this.game.situationManager.getActive();
    const selectedCard = this.getSelectedCard();

    // 预判当前选中卡牌的目标分析
    let cardAnalysis = null;
    if (selectedCard) {
      cardAnalysis = InteractionResolver.analyzeCardOptions(
        selectedCard,
        this.game.stateManager,
        situations,
        this.game.policyManager,
        this.game.residueManager
      );
    }

    situations.forEach(sit => {
      const cardEl = document.createElement('div');
      cardEl.className = `situation-card situation-${sit.category}`;

      const isTargeted = this.game.selectedSituationId === sit.id;
      if (isTargeted) cardEl.classList.add('selected');

      // 自动索敌或多目标合法判断
      let matchInfo = null;
      if (cardAnalysis && cardAnalysis.matches) {
        matchInfo = cardAnalysis.matches.find(m => m.situation.id === sit.id);
      }

      if (matchInfo) {
        cardEl.classList.add('applicable-target');
        if (this.game.autoTargeted && isTargeted) {
          cardEl.classList.add('auto-locked');
        }
      }

      // 三阶段压力印记
      let stageDots = '';
      const stageConfig = BALANCE.SITUATION_STAGES[sit.stage] || { name: '稳定', symbol: '○○○' };
      for (let i = 1; i <= (sit.maxStage || 3); i++) {
        const filled = i <= sit.stage;
        stageDots += `<span class="stage-pip ${filled ? 'active' : ''}"></span>`;
      }

      // 阶段描述与标题
      const profile = (sit.stageProfiles && sit.stageProfiles[sit.stage])
        ? sit.stageProfiles[sit.stage]
        : { name: sit.name, desc: sit.description };

      const categoryLabel = sit.category === 'opportunity'
        ? '机会'
        : (sit.category === 'crisis' ? '重大危机' : '政患');

      // 可行方向提示标签
      const hintsHtml = (sit.directionHints || []).map(h => `<span class="dir-hint">${h}</span>`).join(' ');

      // 若与选中卡牌匹配，展示评级标签
      let qualityBadge = '';
      if (matchInfo) {
        const q = matchInfo.evalResult.quality;
        const qConfig = BALANCE.INTERACTION_QUALITIES[q] || { label: q, symbol: '•' };
        qualityBadge = `<div class="target-eval-badge quality-${q}">${qConfig.symbol} ${qConfig.label}</div>`;
      }

      cardEl.innerHTML = `
        <div class="sit-header">
          <span class="sit-tag tag-${sit.category}">${categoryLabel} · ${stageConfig.name}</span>
          <div class="sit-pips-wrap" title="阶段等次">${stageDots}</div>
        </div>
        <div class="sit-name">【${sit.name}】</div>
        <div class="sit-subname">${profile.name}</div>
        <div class="sit-desc">${profile.desc}</div>
        <div class="sit-directions-bar">
          <div class="dir-label">可行方向：</div>
          <div class="dir-list">${hintsHtml}</div>
        </div>
        ${qualityBadge}
        ${this.game.autoTargeted && isTargeted ? '<div class="auto-target-indicator">◈ 已自动锁定目标</div>' : ''}
      `;

      cardEl.addEventListener('click', () => {
        if (this.game.phase === 'PLAY_CARD') {
          this.game.selectSituation(sit.id);
        }
      });

      container.appendChild(cardEl);
    });

    // 补充留白
    const emptyCount = BALANCE.MAX_ACTIVE_SITUATIONS - situations.length;
    for (let i = 0; i < emptyCount; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'situation-placeholder';
      placeholder.innerHTML = '<span>案头无急政 · 暂安</span>';
      container.appendChild(placeholder);
    }
  }

  // 渲染底部手牌 (5张折子奏折)
  renderHand() {
    const handContainer = document.getElementById('hand-cards');
    if (!handContainer) return;
    handContainer.innerHTML = '';

    const hand = this.game.deckManager.hand;
    const selectedId = this.game.selectedCardId;
    const keptCard = this.game.deckManager.keptCard;
    const isPostPlay = this.game.phase === 'POST_PLAY';

    hand.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `hand-card card-cat-${card.category}`;
      if (selectedId === card.id) cardEl.classList.add('selected');
      if (card.isKeptFromPrev) cardEl.classList.add('kept-from-prev');

      const isKept = keptCard && keptCard.id === card.id;
      if (isKept) cardEl.classList.add('marked-to-keep');

      // 印章
      let sealTag = '';
      if (card.isKeptFromPrev) {
        sealTag = '<span class="card-seal-tag seal-past">上季遗策</span>';
      }
      if (isKept) {
        sealTag += '<span class="card-seal-tag seal-keep">留待下朝</span>';
      }

      // 卡牌标签徽章
      const tagsHtml = card.tags.map(t => `<span class="card-tag-pill">${BALANCE.TAG_NAMES[t] || t}</span>`).join('');

      cardEl.innerHTML = `
        <div class="card-spine"></div>
        <div class="card-content-wrap">
          ${isPostPlay ? `
            <div class="quick-keep-bar">
              <button class="btn-quick-keep ${isKept ? 'active' : ''}">
                ${isKept ? '已留' : '留'}
              </button>
            </div>
          ` : ''}
          <div class="card-top-row">
            <div class="card-tags-list">${tagsHtml}</div>
            ${sealTag}
          </div>
          <div class="card-title">${card.name}</div>
          <div class="card-personality">${card.personality || '中正平允'}</div>
          <div class="card-summary">${card.description}</div>
        </div>
      `;

      if (!isPostPlay) {
        cardEl.addEventListener('click', () => {
          this.game.selectCard(card.id);
        });
      } else {
        const keepBtn = cardEl.querySelector('.btn-quick-keep');
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

  // 渲染操作控制栏与预期后果预告
  renderActionBar() {
    const playBtn = document.getElementById('btn-play-card');
    const adjournBtn = document.getElementById('btn-adjourn-court');
    const hintEl = document.getElementById('action-hint-text');

    const selectedCard = this.getSelectedCard();
    const isPostPlay = this.game.phase === 'POST_PLAY';

    if (hintEl) {
      if (this.game.phase === 'PLAY_CARD') {
        if (!selectedCard) {
          hintEl.innerHTML = '请挑选案头奏折批复施行。<strong>每季仅可行一策</strong>。';
        } else {
          const analysis = InteractionResolver.analyzeCardOptions(
            selectedCard,
            this.game.stateManager,
            this.game.situationManager.getActive(),
            this.game.policyManager,
            this.game.residueManager
          );

          const targetSituation = this.game.selectedSituationId
            ? this.game.situationManager.getActive().find(s => s.id === this.game.selectedSituationId)
            : analysis.autoTarget;

          if (targetSituation) {
            const q = analysis.bestQuality;
            const qConfig = BALANCE.INTERACTION_QUALITIES[q] || { label: q };
            hintEl.innerHTML = `将施策于：<strong>【${targetSituation.name}】</strong> (评级：<span class="quality-text-${q}">${qConfig.label}</span>) ── 预期后果：${analysis.costPreview}`;
          } else if (analysis.validTargets.length > 1) {
            hintEl.innerHTML = `【${selectedCard.name}】可用于多个局势，<strong>请点击上方目标局势卡</strong>指定。`;
          } else {
            hintEl.innerHTML = `【${selectedCard.name}】将作为通用国政施行。预期影响：${selectedCard.personality}`;
          }
        }
      } else if (isPostPlay) {
        hintEl.innerHTML = '政令已布。<strong>可点击剩余奏折上方的【留】按钮留存一策</strong>，或直接「退朝」。';
      } else if (this.game.phase === 'ANNUAL_POLICY') {
        hintEl.innerHTML = '岁末廷议，请从朝议定策中确立来年国策。';
      } else if (this.game.phase === 'ENDED') {
        hintEl.innerHTML = '天命所止，大朝已毕。';
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

  // 渲染史册
  renderHistorySidebar() {
    const listEl = document.getElementById('chronicle-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const entries = this.game.historyManager.getAllEntries();
    [...entries].reverse().forEach(entry => {
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

  getSelectedCard() {
    if (!this.game.selectedCardId) return null;
    return this.game.deckManager.hand.find(c => c.id === this.game.selectedCardId);
  }

  // 出牌反馈 (玉玺盖印 + 明确的阶段演变与后遗状态生成提示)
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
      }, 650);
    }

    if (feedbackBox && feedbackText) {
      let stageChangeText = '';
      if (result.targetSituation && result.sitResolution) {
        stageChangeText = `<div class="feedback-stage-change">【${result.targetSituation.name}】：${result.sitResolution.text}</div>`;
      }

      let residueText = '';
      if (result.residueCreated && result.residueCreated.residue) {
        residueText = `<div class="feedback-residue-gain">✦ 种下因果：获得【${result.residueCreated.residue.name}】</div>`;
      }

      feedbackText.innerHTML = `
        <div class="feedback-headline">${result.headline}</div>
        <div class="feedback-quote">“${result.historyText}”</div>
        ${stageChangeText}
        ${residueText}
      `;

      if (feedbackDeltas) {
        feedbackDeltas.innerHTML = '';
        const d = result.statDelta;
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
