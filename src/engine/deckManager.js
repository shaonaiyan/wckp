// Prototype 0.2 真实实体牌库管理器 (DeckManager)
// 维护 drawPile, discardPile, hand, keptCard
// 包含洗牌、真实实体抽牌、不重复发牌、以及智能抽牌保底机制

import { CARDS } from '../data/cards.js';
import { BALANCE } from '../data/balance.js';

export class DeckManager {
  constructor(prng) {
    this.prng = prng;
    this.drawPile = [];
    this.discardPile = [];
    this.hand = [];
    this.keptCard = null;
    this.handBeforePlay = []; // 每次出牌前保存的完整手牌快照
    this.cardStats = {};

    this.initDeck();
  }

  initStats() {
    this.cardStats = {};
    for (const c of CARDS) {
      this.cardStats[c.id] = { drawn: 0, played: 0, held: 0 };
    }
  }

  // 初始化真实实体牌库 (24张独立牌)
  initDeck() {
    this.initStats();
    this.drawPile = this.prng.shuffle([...CARDS]);
    this.discardPile = [];
    this.hand = [];
    this.keptCard = null;
    this.handBeforePlay = [];
  }

  reset() {
    this.initDeck();
  }

  // 抽牌并补满手牌至 targetSize (通常为5张)
  drawHand(targetSize = BALANCE.HAND_SIZE, activeSituations = []) {
    const newHand = [];

    // 1. 如果上一季有保留牌，优先进入手牌
    if (this.keptCard) {
      newHand.push({ ...this.keptCard, isKeptFromPrev: true });
      this.cardStats[this.keptCard.id].held++;
      this.keptCard = null;
    }

    // 2. 从 drawPile 补齐手牌
    while (newHand.length < targetSize) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) {
          // 极罕见：两边都抽空，从基础库重组
          this.drawPile = this.prng.shuffle([...CARDS]);
        } else {
          // 将弃牌堆洗牌成新摸牌堆
          this.drawPile = this.prng.shuffle([...this.discardPile]);
          this.discardPile = [];
        }
      }

      const card = this.drawPile.pop();
      // 同一轮禁止同名牌重复进入手牌
      if (!newHand.some(c => c.id === card.id)) {
        newHand.push({ ...card, isKeptFromPrev: false });
        this.cardStats[card.id].drawn++;
      } else {
        // 重复牌暂放弃牌堆，继续摸
        this.discardPile.push(card);
      }
    }

    // 3. 智能抽牌保底机制 (Section 28)
    // 如果场上有紧急局势，且抽到的5张牌完全没有任何相关应对标签：
    // 允许从摸牌堆或弃牌堆中调入1张相关牌替换手牌中无关的1张牌
    this.applySmartDrawProtection(newHand, activeSituations);

    this.hand = newHand;
    // 保存完整出牌前快照 (修复 0.1 Telemetry 缺陷)
    this.handBeforePlay = this.hand.map(c => ({ ...c }));

    return this.hand;
  }

  // 智能抽牌保底：最多保底1张相关牌，杜绝连抽5张完全无涉死手
  applySmartDrawProtection(hand, activeSituations) {
    if (!activeSituations || activeSituations.length === 0) return;

    // 收集场上急需的所有标签
    const neededTags = new Set();
    for (const s of activeSituations) {
      if (s.applicableTags) {
        s.applicableTags.forEach(t => neededTags.add(t));
      }
    }

    // 检查当前手牌是否完全没有相关标签
    const hasRelevantCard = hand.some(c => c.tags && c.tags.some(t => neededTags.has(t)));
    if (hasRelevantCard) return; // 已经有可用牌，不需要保底

    // 寻找一张相关牌进行置换
    const pool = [...this.drawPile, ...this.discardPile];
    const candidateIdx = pool.findIndex(c => c.tags && c.tags.some(t => neededTags.has(t)) && !hand.some(h => h.id === c.id));

    if (candidateIdx !== -1) {
      const rescuedCard = pool.splice(candidateIdx, 1)[0];
      // 换出手牌中的最后一张非保留牌
      const replaceIdx = hand.length - 1;
      const replacedCard = hand[replaceIdx];
      this.discardPile.push(replacedCard);
      hand[replaceIdx] = { ...rescuedCard, isKeptFromPrev: false };
      this.cardStats[rescuedCard.id].drawn++;
    }
  }

  // 设置/取消保留牌 (留待下朝，最多1张)
  toggleKeptCard(cardId) {
    if (!cardId) {
      this.keptCard = null;
      return null;
    }
    if (this.keptCard && this.keptCard.id === cardId) {
      this.keptCard = null;
      return null;
    }
    const card = this.hand.find(c => c.id === cardId);
    if (card) {
      this.keptCard = { ...card };
      return this.keptCard;
    }
    return null;
  }

  // 执行打牌后的弃牌处理：打出的牌与未保留的剩余手牌进弃牌堆
  finalizeTurn(playedCardId) {
    for (const card of this.hand) {
      if (card.id === playedCardId) {
        this.discardPile.push(card);
        this.cardStats[card.id].played++;
      } else if (this.keptCard && this.keptCard.id === card.id) {
        // 保留的牌暂不进入弃牌堆，留待下季
      } else {
        // 未保留的手牌进入弃牌堆
        this.discardPile.push(card);
      }
    }
    this.hand = [];
  }

  // 调试辅助：强制将某张牌置入手牌
  forceCardToHand(cardId) {
    const cardDef = CARDS.find(c => c.id === cardId);
    if (!cardDef) return false;
    // 如果已经在手牌中
    if (this.hand.some(c => c.id === cardId)) return true;
    if (this.hand.length >= BALANCE.HAND_SIZE) {
      const removed = this.hand.pop();
      this.discardPile.push(removed);
    }
    this.hand.push({ ...cardDef, isKeptFromPrev: false });
    this.cardStats[cardDef.id].drawn++;
    this.handBeforePlay = this.hand.map(c => ({ ...c }));
    return true;
  }
}
