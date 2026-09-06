// 《一朝天子》Prototype 0.3 皇室与天家宗支管理器 (RoyalFamilyManager)
// 维护皇帝、皇后、储君与皇子女的生老病死、教养、婚配与健康演变

import { BALANCE } from '../data/balance.js';
import { ROYAL_EVENTS } from '../data/royalEvents.js';

export class RoyalFamilyManager {
  constructor(prng) {
    this.prng = prng;
    this.emperor = null;
    this.empress = null;
    this.children = [];
    this.heirId = null;
  }

  reset(dynastyName = null, eraName = null) {
    const dynasty = dynastyName || this.prng.choice(BALANCE.DYNASTY_NAMES) || '大晟';
    const era = eraName || this.prng.choice(BALANCE.ERA_NAMES) || '永安';
    const startAge = this.prng.nextInt(BALANCE.EMPEROR_INIT.MIN_START_AGE, BALANCE.EMPEROR_INIT.MAX_START_AGE);

    // 随机 1~2 个皇帝性格标签 (Section 6)
    const t1 = this.prng.choice(BALANCE.EMPEROR_INIT.TRAITS);
    let t2 = this.prng.choice(BALANCE.EMPEROR_INIT.TRAITS);
    if (t2 === t1) t2 = null;
    const emperorTraits = t2 ? [t1, t2] : [t1];

    this.emperor = {
      generation: 1,
      dynasty,
      eraName: era,
      name: '承嗣',
      templeName: '太宗',
      age: startAge,
      startAge,
      yearsReigning: 0,
      healthLevel: 4, // 4: 康健, 3: 偶有小恙, 2: 体弱, 1: 病重, 0: 驾崩
      traits: emperorTraits,
      alive: true,
      deathTurn: null,
      deathReason: null,
      annalsHighlights: []
    };

    // 开局皇后
    this.empress = {
      name: '王婉',
      title: '皇后',
      age: Math.max(22, startAge - 4),
      alive: true,
      pregnant: false,
      pregnancyTurns: 0
    };

    // 开局预设皇长子 (3~5岁)
    this.children = [
      {
        id: 'heir_initial',
        name: '承平',
        title: '皇长子',
        gender: 'male',
        age: 4,
        alive: true,
        isHeir: true,
        tutor: null,
        traits: ['devoted', 'benevolent'],
        health: 'healthy',
        married: false,
        history: [
          '开国定策，即位初年册立为皇太子，居承华殿。'
        ]
      }
    ];
    this.heirId = 'heir_initial';
  }

  getEmperorHealthInfo() {
    const lvl = this.emperor ? this.emperor.healthLevel : 4;
    if (lvl >= 4) return BALANCE.EMPEROR_INIT.HEALTH_STATES.HEALTHY;
    if (lvl === 3) return BALANCE.EMPEROR_INIT.HEALTH_STATES.SLIGHT_ILL;
    if (lvl === 2) return BALANCE.EMPEROR_INIT.HEALTH_STATES.WEAK;
    return BALANCE.EMPEROR_INIT.HEALTH_STATES.CRITICAL;
  }

  getHeir() {
    if (!this.heirId) return null;
    return this.children.find(c => c.id === this.heirId && c.alive) || null;
  }

  // 每季天家岁月流逝与生命周期演变 (Section 7 & 8)
  tickQuarter(turn, world) {
    const historyManager = world ? world.historyManager : null;
    const events = [];

    // 1. 年龄递增 (每4季增1岁)
    if (turn % BALANCE.ROUNDS_PER_YEAR === 0) {
      this.emperor.age += 1;
      this.emperor.yearsReigning += 1;
      if (this.empress && this.empress.alive) this.empress.age += 1;
      this.children.forEach(c => {
        if (c.alive) c.age += 1;
      });
    }

    // 2. 孕期推进
    if (this.empress && this.empress.pregnant) {
      this.empress.pregnancyTurns++;
    }

    // 3. 皇帝高龄健康衰退与大行崩逝检测 (Section 8)
    // 50岁后偶有小恙概率上升；60岁后体弱；70岁后病笃
    if (this.emperor.alive) {
      if (this.emperor.age >= 50 && this.emperor.healthLevel === 4 && this.prng.next() < 0.12) {
        this.emperor.healthLevel = 3;
      }
      if (this.emperor.age >= 60 && this.emperor.healthLevel === 3 && this.prng.next() < 0.15) {
        this.emperor.healthLevel = 2;
      }
      if (this.emperor.age >= 68 && this.emperor.healthLevel === 2 && this.prng.next() < 0.2) {
        this.emperor.healthLevel = 1;
      }

      // 处于病重 (level 1) 时，每季检测是否大行崩逝
      if (this.emperor.healthLevel <= 1) {
        const deathChance = this.emperor.age >= 65 ? 0.35 : 0.2;
        if (this.prng.next() < deathChance) {
          this.emperor.alive = false;
          this.emperor.deathTurn = turn;
          this.emperor.deathReason = this.emperor.age >= 60 ? '积劳抱恙，春秋鼎盛龙驭宾天' : '寝疾大笃，中道崩殂';
          events.push({
            type: 'emperor_death',
            category: 'palace',
            priority: 100,
            title: '【龙驭上宾】',
            text: `皇帝大渐，崩于乾清宫，享年${this.emperor.age}岁，在位${this.emperor.yearsReigning}载。群臣哀恸，诏皇太子承统。`,
            chronicleText: `帝崩于乾清宫，在位${this.emperor.yearsReigning}年。`
          });
          return events;
        }
      }
    }

    // 4. 评估皇室生命周期事件 (怀孕、诞生、开蒙、择师、婚配等)
    const ctx = world || {
      royalFamily: this,
      turn,
      prng: this.prng,
      characterManager: null,
      historyManager
    };

    for (const def of ROYAL_EVENTS) {
      if (def.conditions(ctx)) {
        const res = def.execute(ctx);
        if (res) {
          events.push({
            type: 'royal_lifecycle',
            category: 'palace',
            priority: def.priority,
            title: `【${res.headline}】`,
            text: res.text,
            chronicleText: def.chronicleTemplate
          });
          break; // 每季最多触发一件重大皇室人生礼节
        }
      }
    }

    return events;
  }

  // 强制皇帝驾崩 (Debug / 测试使用)
  forceEmperorDeath(turn, reason = '暴疾崩殂') {
    if (!this.emperor) return null;
    this.emperor.alive = false;
    this.emperor.deathTurn = turn;
    this.emperor.deathReason = reason;
    return {
      type: 'emperor_death',
      category: 'palace',
      priority: 100,
      title: '【大行崩逝】',
      text: `大行皇帝忽发暴疾，崩于奉天殿，享年${this.emperor.age}，在位${this.emperor.yearsReigning}载。`,
      chronicleText: `帝暴疾崩，大统中更。`
    };
  }

  restore(data) {
    if (!data) return;
    this.emperor = data.emperor ? { ...data.emperor } : null;
    this.empress = data.empress ? { ...data.empress } : null;
    this.children = Array.isArray(data.children) ? [...data.children] : [];
    this.heirId = data.heirId || null;
  }
}
