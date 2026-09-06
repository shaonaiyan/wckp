// 卡牌管理器：负责牌池权重计算、防极端烂手抽牌、卡牌打出与效果修正、保留牌机制
import { CARDS } from '../data/cards.js';
import { BALANCE } from '../data/balance.js';
import { LONG_TERM_STATES } from '../data/states.js';

export class CardManager {
  constructor(prng) {
    this.prng = prng;
    this.hand = [];           // 当前手牌 (最多5张)
    this.keptCard = null;     // 从上一轮保留的牌
    this.pendingCard = null;  // 本轮打出的牌
    this.cardStats = {};      // 每张卡的数据统计: drawn, played, held
    this.initStats();
  }

  initStats() {
    for (const c of CARDS) {
      this.cardStats[c.id] = {
        drawn: 0,
        played: 0,
        held: 0
      };
    }
  }

  reset() {
    this.hand = [];
    this.keptCard = null;
    this.pendingCard = null;
    this.initStats();
  }

  // 计算当前所有卡牌的动态抽取权重
  calculateDynamicWeights(state, situations) {
    const weights = {};
    const hasWar = situations.some(s => ['northern_incursion', 'border_war'].includes(s.id));
    const hasDisaster = situations.some(s => ['yellow_river_flood', 'land_annexation'].includes(s.id));

    // 获取玩家历史偏好比例
    const totalPlayed = Object.values(state.categoryCounts).reduce((a, b) => a + b, 0);

    for (const card of CARDS) {
      let w = card.weight || 10;

      // 1. 根据国家宏观状态微调
      if (card.category === 'finance' && state.treasury < 40) w += 4;
      if (card.category === 'livelihood' && (state.morale < 40 || hasDisaster)) w += 5;
      if (card.category === 'military' && (state.military < 40 || hasWar)) w += 5;
      if (card.category === 'diplomacy' && hasWar) w += 4;
      if (card.category === 'politics' && state.court < 40) w += 5;

      // 2. 根据长期状态微调
      if (state.hasLongTermState('authoritarian_rule') && (card.tags.includes('hardline') || card.tags.includes('purge'))) {
        w += 4;
      }
      if (state.hasLongTermState('thriving_sea_trade') && card.tags.includes('trade')) {
        w += 3;
      }

      // 3. 历史行为倾向反馈 (轻微影响未来随机权重)
      if (totalPlayed > 0) {
        const catRatio = (state.categoryCounts[card.category] || 0) / totalPlayed;
        if (catRatio > 0.3) {
          w += Math.round(catRatio * 6); // 倾向增强
        }
      }

      weights[card.id] = Math.max(1, w);
    }

    return weights;
  }

  // 抽取手牌到5张（若有保留牌则放入保留牌并补抽，且防止5张完全同类）
  drawHand(state, situations) {
    const targetSize = BALANCE.HAND_SIZE;
    const newHand = [];

    // 如果上一轮有保留牌，优先进入手牌
    if (this.keptCard) {
      newHand.push({ ...this.keptCard, isKeptFromPrev: true });
      this.cardStats[this.keptCard.id].held++;
      this.keptCard = null;
    }

    const weights = this.calculateDynamicWeights(state, situations);
    const candidatePool = CARDS.map(c => ({ item: c, weight: weights[c.id] }));

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      attempts++;
      const currentDraw = [...newHand];
      const needed = targetSize - currentDraw.length;

      for (let i = 0; i < needed; i++) {
        // 加权抽取
        const picked = this.prng.weightedChoice(candidatePool);
        currentDraw.push({ ...picked, isKeptFromPrev: false });
      }

      // 规则检查：防极端烂手——抽5张时禁止出现5张完全同类牌
      const categories = new Set(currentDraw.map(c => c.category));
      if (categories.size >= 2 || currentDraw.length < 5) {
        this.hand = currentDraw;
        break;
      }
    }

    // 记录统计
    for (const card of this.hand) {
      if (!card.isKeptFromPrev) {
        this.cardStats[card.id].drawn++;
      }
    }

    return this.hand;
  }

  // 设置要保留的牌 (最多1张)
  setKeptCard(cardId) {
    if (!cardId) {
      this.keptCard = null;
      return null;
    }
    const card = this.hand.find(c => c.id === cardId);
    if (card && card.canHold !== false) {
      this.keptCard = { ...card };
      return this.keptCard;
    }
    return null;
  }

  // 执行打出一张牌
  playCard(cardId, targetSituationId, state, situationManager) {
    const cardIndex = this.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: '牌不在手牌中' };
    }

    const card = this.hand[cardIndex];
    let targetSituation = null;
    if (targetSituationId) {
      targetSituation = situationManager.getActive().find(s => s.id === targetSituationId);
    }

    // 计算效果
    let effectResult;
    const activeSituations = situationManager ? situationManager.getActive() : [];
    if (typeof card.dynamicEffect === 'function') {
      effectResult = card.dynamicEffect(state, targetSituation, this.prng, activeSituations);
    } else {
      effectResult = {
        delta: { ...card.baseEffect },
        flavor: `${card.name}付诸施行，朝廷上下依旨奉行。`
      };
    }

    const delta = { ...(effectResult.delta || card.baseEffect) };

    // 长期状态对卡牌效果的被动修正
    for (const sid of state.longTermStates) {
      const stateDef = LONG_TERM_STATES[sid];
      if (stateDef && typeof stateDef.cardModifier === 'function') {
        stateDef.cardModifier(card, delta);
      }
    }

    // 局势对卡牌效果的修正 (例如江南丰收提升农业税收)
    for (const sit of situationManager.getActive()) {
      if (sit.cardModifier && sit.cardModifier.tags) {
        const matches = sit.cardModifier.tags.some(t => card.tags.includes(t) || card.category === t);
        if (matches && sit.cardModifier.bonusTreasury) {
          delta.treasury = (delta.treasury || 0) + sit.cardModifier.bonusTreasury;
        }
      }
    }

    // 应用数值变更
    state.applyDelta(delta);

    // 局势目标化解
    let sitResolution = null;
    if (targetSituation && effectResult.resolveAmount) {
      sitResolution = situationManager.resolveSituation(targetSituation.id, effectResult.resolveAmount);
    }

    // 长期状态赋予
    if (effectResult.addState) {
      state.addLongTermState(effectResult.addState);
    }

    // 计数器递增
    if (effectResult.incrementDebt) state.debtCount = (state.debtCount || 0) + 1;
    if (effectResult.incrementReward) state.rewardCount = (state.rewardCount || 0) + 1;

    // 记录行为与统计
    state.recordCardPlayed(card);
    this.cardStats[card.id].played++;

    // 从手牌中移除打出的牌
    this.hand.splice(cardIndex, 1);
    this.pendingCard = card;

    return {
      success: true,
      card,
      delta,
      flavor: effectResult.flavor,
      targetSituation,
      sitResolution
    };
  }

  // 调试辅助：强制添加某张牌进手牌
  forceAddCard(cardId) {
    const def = CARDS.find(c => c.id === cardId);
    if (!def) return false;
    if (this.hand.length >= BALANCE.HAND_SIZE) {
      this.hand.pop(); // 挤出最后一张
    }
    this.hand.push({ ...def, isKeptFromPrev: false });
    this.cardStats[def.id].drawn++;
    return true;
  }
}
