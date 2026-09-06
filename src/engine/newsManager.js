// 《一朝天子》Prototype 0.3 御前头条新闻中枢 (NewsManager)
// 严格执行 3 条头条信息预算（天下、朝堂、宫中），支持人物关注加权与精准排序 (Section 23 & 57)

import { BALANCE } from '../data/balance.js';

export class NewsManager {
  constructor() {
    this.currentHeadlines = []; // 当季筛选出的 3 条头条
    this.allQuarterEvents = []; // 当季发生的全部后台大势
  }

  reset() {
    this.currentHeadlines = [];
    this.allQuarterEvents = [];
  }

  // 排序算法：计算单条世界事件的皇帝关注分 (Section 57)
  calculateEventScore(event, world) {
    let score = event.priority || 50;

    // 1. 是否涉及玩家特别关注的人物 (☆ / ★) -> 极高权重 (+35分)
    if (event.character && world.characterManager.isFollowed(event.character.id)) {
      score += 35;
    }

    // 2. 涉及重臣或帝王生死大变 -> 极高权重 (+40分)
    if (event.type === 'emperor_death' || event.type === 'character_death') {
      score += 40;
    }

    // 3. 涉及皇室与储嗣成长 (+25分)
    if (event.category === 'palace' || event.type === 'royal_lifecycle') {
      score += 25;
    }

    // 4. 属于已有故事线程的实质演进 (+15分)
    if (event.type === 'thread_progression') {
      score += 15;
    }

    // 5. 涉及玩家此前亲自种下的因果 (+20分)
    if (event.hookFeedback) {
      score += 20;
    }

    return score;
  }

  // 从单季全部事件中，严格提炼出 3 条核心御前头条 (Section 23)
  filterHeadlines(allEvents, world) {
    this.allQuarterEvents = [...allEvents];

    if (allEvents.length === 0) {
      this.currentHeadlines = [
        {
          category: 'realm',
          title: '【天下粗安】',
          text: '四海无惊，州郡按期输纳赋粮，关塞烽火久息。'
        },
        {
          category: 'court',
          title: '【百僚恪勤】',
          text: '六曹文案循例而行，百官奉敕各供其职，都堂无大事。'
        },
        {
          category: 'palace',
          title: '【宫闱穆穆】',
          text: '内廷诸司各守本分，圣躬起居如常，六宫肃静。'
        }
      ];
      return this.currentHeadlines;
    }

    // 为所有事件计算加权得分
    const scored = allEvents.map(e => ({
      ...e,
      finalScore: this.calculateEventScore(e, world)
    }));
    scored.sort((a, b) => b.finalScore - a.finalScore);

    // 推荐结构：天下 1 条，朝堂 1 条，宫中 1 条 (Section 23)
    const realms = scored.filter(e => e.category === 'realm');
    const courts = scored.filter(e => e.category === 'court');
    const palaces = scored.filter(e => e.category === 'palace');

    const selected = [];
    const usedIds = new Set();

    // 优先从 天下、朝堂、宫中 各选最高分 1 条
    if (realms.length > 0) {
      selected.push(realms[0]);
      usedIds.add(realms[0]);
    }
    if (courts.length > 0 && selected.length < BALANCE.MAX_HEADLINE_NEWS) {
      selected.push(courts[0]);
      usedIds.add(courts[0]);
    }
    if (palaces.length > 0 && selected.length < BALANCE.MAX_HEADLINE_NEWS) {
      selected.push(palaces[0]);
      usedIds.add(palaces[0]);
    }

    // 若某类别空缺，由全局剩余最高分补足至 3 条
    for (const e of scored) {
      if (selected.length >= BALANCE.MAX_HEADLINE_NEWS) break;
      if (!usedIds.has(e)) {
        selected.push(e);
        usedIds.add(e);
      }
    }

    this.currentHeadlines = selected;
    return this.currentHeadlines;
  }

  restore(data) {
    this.currentHeadlines = Array.isArray(data.currentHeadlines) ? [...data.currentHeadlines] : [];
    this.allQuarterEvents = Array.isArray(data.allQuarterEvents) ? [...data.allQuarterEvents] : [];
  }
}
