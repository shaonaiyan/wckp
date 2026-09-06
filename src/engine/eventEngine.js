// 《一朝天子》Prototype 0.3 世界事件引擎 (EventEngine)
// 严格执行事件优先级：已有线程 > 重要人物自主作为 > 皇室生命周期 > 地方状态漂移 > 纯随机事件 (Section 21)

import { EVENT_TEMPLATES } from '../data/eventTemplates.js';

export class EventEngine {
  constructor(prng) {
    this.prng = prng;
  }

  // 生成单季全部世界变迁事件
  simulateQuarterEvents(turn, world) {
    const allEvents = [];

    // 第一优先级：已有故事线程推进 (Thread Progression)
    const threadEvents = world.threadManager.tickQuarter(turn, world);
    allEvents.push(...threadEvents);

    // 第二优先级：重要人物自主作为 (Character Autonomous Deeds)
    const charEvents = world.characterManager.tickQuarter(turn, world.historyManager, world.memoryManager);
    allEvents.push(...charEvents);

    // 第三优先级：皇室天家生命周期 (Royal Lifecycle)
    const royalEvents = world.royalFamilyManager.tickQuarter(turn, world);
    allEvents.push(...royalEvents);

    // 第四优先级：地方与区域状态自然演化 (Regional Status Drift)
    const regionEvents = this.simulateRegionalDrift(turn, world);
    allEvents.push(...regionEvents);

    // 第五优先级：极少量独立新随机世界事件 (若前面事件过少)
    if (allEvents.length < 2 && this.prng.next() < 0.4) {
      const independentEvents = this.pickIndependentWorldEvent(turn, world);
      if (independentEvents) allEvents.push(independentEvents);
    }

    return allEvents;
  }

  // 区域环境自然呼吸演化
  simulateRegionalDrift(turn, world) {
    const events = [];

    // 秋冬季中原黄淮或江南岁入
    const season = world.historyManager.getSeason(turn);
    if (season === '秋' && this.prng.next() < 0.35) {
      if (world.regions.south.prosperity >= 70 && !world.regions.south.hasHarvestedThisYear) {
        world.regions.south.hasHarvestedThisYear = true;
        events.push({
          type: 'regional_drift',
          category: 'realm',
          priority: 65,
          region: 'south',
          title: '【秋收巨万】',
          text: '江南四府晚稻获毕，登场万斛，太仓岁入无匮，商贾称便。',
          chronicleText: '江南秋熟，公私兼足。'
        });
      }
    } else if (season === '春') {
      world.regions.south.hasHarvestedThisYear = false;
    }

    return events;
  }

  // 独立随机事件 (控制在极低比率，杜绝碎片化随机段子)
  pickIndependentWorldEvent(turn, world) {
    const standaloneCandidates = EVENT_TEMPLATES.filter(e =>
      e.id === 'imperial_examination_held' ||
      e.id === 'silk_road_caravan_arrives' ||
      e.id === 'jiangnan_salt_smuggling'
    );

    if (standaloneCandidates.length === 0) return null;
    const picked = this.prng.choice(standaloneCandidates);
    const res = picked.execute(world);
    return {
      type: 'independent_random',
      category: picked.category,
      priority: picked.priority || 60,
      title: picked.title,
      text: res.text || picked.newsTemplate,
      chronicleText: picked.chronicleTemplate
    };
  }
}
