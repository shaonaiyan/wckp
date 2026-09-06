// 《一朝天子》Prototype 0.3 人物与朝野名宿管理器 (CharacterManager)
// 维护 6~10 名核心活跃人物的成长、欲望、升迁、朋党、恩怨与生老病死

import { CHARACTER_TEMPLATES, NAME_POOLS } from '../data/characterTemplates.js';
import { CHARACTER_TRAITS, RELATION_TYPES } from '../data/traits.js';
import { BALANCE } from '../data/balance.js';

export class CharacterManager {
  constructor(prng) {
    this.prng = prng;
    this.characters = []; // 全部人物池
    this.followedIds = new Set(); // 玩家关注的名单 (☆ / ★)
  }

  reset() {
    this.characters = [];
    this.followedIds.clear();
    this.initStarters();
  }

  // 初始化初始 6 名朝野核心台阁将帅巨贾名宿 (Section 12)
  initStarters() {
    const starters = CHARACTER_TEMPLATES.filter(t => t.starter);
    starters.forEach(tmpl => {
      this.createInstanceFromTemplate(tmpl);
    });

    // 预设初始轻量人物关系 (Section 16)
    this.addRelationship('shen_ke', 'pei_jian', 'alliance'); // 沈恪与裴简互为清流同盟
    this.addRelationship('han_ce', 'wei_su', 'rival');       // 韩策与魏肃政见不合
    this.addRelationship('gu_yuan', 'wang_cheng', 'close');   // 巨贾顾源与内相结好
  }

  createInstanceFromTemplate(tmpl) {
    const inst = {
      id: tmpl.id,
      name: tmpl.name,
      gender: tmpl.gender || 'male',
      age: tmpl.baseAge || 40,
      alive: true,
      role: tmpl.role,
      office: tmpl.office,
      region: tmpl.region || 'central',
      faction: tmpl.faction || 'civil',
      traits: [...tmpl.traits],
      ambition: tmpl.ambition || 50,
      competence: tmpl.competence || 75,
      influence: tmpl.influence || 50,
      relationshipToEmperor: tmpl.relationshipToEmperor || 'neutral',
      relationships: {}, // { [otherCharId]: 'alliance' | 'rival' ... }
      currentGoal: tmpl.initialGoal || '尽职奉公',
      initialQuote: tmpl.initialQuote || '',
      stateQuote: tmpl.initialQuote || '',
      history: [
        `登仕之初，任【${tmpl.office}】。`
      ],
      memories: [],
      addMemory(turn, desc, importance = 5) {
        this.memories.push({ turn, desc, importance });
        if (this.memories.length > BALANCE.MAX_CHARACTER_MEMORIES) {
          this.memories.sort((a, b) => b.importance - a.importance);
          this.memories = this.memories.slice(0, BALANCE.MAX_CHARACTER_MEMORIES);
        }
      },
      hasNewEvent: false,
      lastEventTurn: 1
    };

    this.characters.push(inst);
    return inst;
  }

  getActive() {
    return this.characters.filter(c => c.alive).slice(0, BALANCE.MAX_ACTIVE_CHARACTERS);
  }

  get(id) {
    return this.characters.find(c => c.id === id);
  }

  isFollowed(id) {
    return this.followedIds.has(id);
  }

  toggleFollow(id) {
    if (this.followedIds.has(id)) {
      this.followedIds.delete(id);
      return false;
    } else {
      this.followedIds.add(id);
      return true;
    }
  }

  addRelationship(id1, id2, relationType) {
    const c1 = this.get(id1);
    const c2 = this.get(id2);
    if (!c1 || !c2) return;

    c1.relationships[id2] = relationType;
    // 对偶关系
    let reverseType = relationType;
    if (relationType === 'patron') reverseType = 'mentor_student';
    c2.relationships[id1] = reverseType;
  }

  // 激活后备人物模板
  activateCharacter(templateId) {
    const existing = this.get(templateId);
    if (existing) {
      if (!existing.alive) existing.alive = true;
      return existing;
    }

    const tmpl = CHARACTER_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      return this.createInstanceFromTemplate(tmpl);
    }
    return null;
  }

  // 每季人物生老病死与自主行为运转 (Section 15 & 22 & 46)
  tickQuarter(turn, historyManager, memoryManager) {
    const autonomousEvents = [];
    const active = this.getActive();

    // 1. 年龄推进 (每4季度长1岁)
    if (turn % BALANCE.ROUNDS_PER_YEAR === 0) {
      active.forEach(c => {
        c.age += 1;
      });
    }

    // 2. 人物自主行为与生老病死推进
    for (const c of active) {
      // 老年自然离世或致仕检测 (58岁以上小概率病逝，68岁以上大概率离世)
      if (c.age >= 58) {
        const deathChance = (c.age - 55) * 0.015;
        if (this.prng.next() < deathChance) {
          c.alive = false;
          c.history.push(`${historyManager.getYearSeasonText(turn)} 积劳成疾，病逝于邸舍，享年${c.age}。`);
          autonomousEvents.push({
            type: 'character_death',
            category: 'court',
            priority: 95,
            character: c,
            title: `【${c.name}病逝】`,
            text: `前${c.office}【${c.name}】病终于任，享年${c.age}。自践仕途历辅朝政数十年，朝野闻讯无不震悼。`,
            chronicleText: `【${c.name}】卒于邸，谥赐哀荣。`
          });
          continue;
        }
      }

      // 产生人物自主行为 (基于性格与官职驱动，Section 15)
      const action = this.evaluateAutonomousDeed(c, turn, historyManager);
      if (action) {
        autonomousEvents.push(action);
      }
    }

    // 3. 补充新秀人才 (保持在 6~8 人以上活跃)
    if (this.getActive().length < BALANCE.MIN_ACTIVE_CHARACTERS) {
      const newcomer = this.spawnNewcomer(turn, historyManager);
      if (newcomer) {
        autonomousEvents.push({
          type: 'character_newcomer',
          category: 'court',
          priority: 70,
          character: newcomer,
          title: `【新贵登朝】`,
          text: `新任${newcomer.office}【${newcomer.name}】(年${newcomer.age}岁)入奉朝议，器局凝重，初展锋芒。`,
          chronicleText: `【${newcomer.name}】受擢入仕，补授【${newcomer.office}】。`
        });
      }
    }

    return autonomousEvents;
  }

  // 人物自主欲望与作为判定 (Section 15)
  evaluateAutonomousDeed(c, turn, historyManager) {
    if (this.prng.next() > 0.35) return null; // 并非人人每季都在折腾，保持节奏留白

    // 韩策：尚武 + 野心
    if (c.id === 'han_ce' && c.region === 'north') {
      c.influence += 2;
      c.stateQuote = '“边关健儿日夜操练，唯待天子号令勒石塞外。”';
      c.history.push(`${historyManager.getYearSeasonText(turn)} 巡阅八达岭边卡，督训塞防骁骑。`);
      return {
        type: 'character_action',
        category: 'realm',
        priority: 75,
        character: c,
        title: '【韩策阅兵】',
        text: `大将军韩策亲勒精骑三万大阅于长城之下，军容整肃，塞北游骑望风慑服。`,
        chronicleText: `韩策大阅北军，边备肃严。`
      };
    }

    // 沈恪：改革 + 刚直
    if (c.id === 'shen_ke') {
      c.influence += 3;
      c.stateQuote = '“积弊深者疗之以猛药，虽受万夫指，无悔也。”';
      c.history.push(`${historyManager.getYearSeasonText(turn)} 严劾州县赋役弊端，申明均平法度。`);
      return {
        type: 'character_action',
        category: 'court',
        priority: 76,
        character: c,
        title: '【沈恪严察】',
        text: `沈恪巡历郡县，亲查常平仓与粮赋簿册，严惩欺隐小吏三十人，官箴为之悚栗。`,
        chronicleText: `沈恪督理度支，澄汰积弊。`
      };
    }

    // 顾源：重利 + 圆滑
    if (c.id === 'gu_yuan') {
      c.influence += 3;
      c.stateQuote = '“市舶通则四海金银归于中国，何乐而不为？”';
      c.history.push(`${historyManager.getYearSeasonText(turn)} 泛海联通南洋商路，捐纳助修海塘。`);
      return {
        type: 'character_action',
        category: 'realm',
        priority: 70,
        character: c,
        title: '【顾源市舶】',
        text: `顾氏船队自爪哇载香药珍珠数十万斛归港，完纳商税四万两，市舶司称其输纳勤笃。`,
        chronicleText: `顾源海舶纳税助饷，市舶充盈。`
      };
    }

    // 裴简：清廉 + 刚直
    if (c.id === 'pei_jian') {
      c.stateQuote = '“白刃在前，亦不可废风宪之职。”';
      c.history.push(`${historyManager.getYearSeasonText(turn)} 上疏纠劾百官怠职，言辞凛然。`);
      return {
        type: 'character_action',
        category: 'court',
        priority: 72,
        character: c,
        title: '【裴简谏诤】',
        text: `副都御史裴简伏阙上书，申论百官考成与风俗教化，直声震于阙下。`,
        chronicleText: `裴简上疏严申官考，风纪一振。`
      };
    }

    // 魏肃：保守 + 忠谨
    if (c.id === 'wei_su') {
      c.stateQuote = '“国之大事在祀与戎，宁迟重，莫轻躁。”';
      c.history.push(`${historyManager.getYearSeasonText(turn)} 调停台阁争议，平理庶狱。`);
      return {
        type: 'character_action',
        category: 'court',
        priority: 68,
        character: c,
        title: '【魏肃调停】',
        text: `中书令魏肃召六卿会食都堂，从容弥缝各部纷争，庶政规矩肃然。`,
        chronicleText: `首辅魏肃持重调和百僚，政令平顺。`
      };
    }

    // 其他人物通用行为
    if (c.traits.includes('martial')) {
      c.stateQuote = '“愿请长缨，誓保宗周万里江山。”';
      return {
        type: 'character_action',
        category: 'realm',
        priority: 65,
        character: c,
        title: `【${c.name}整军】`,
        text: `${c.office}【${c.name}】整饬麾下营伍，操演器械，将士用命。`,
        chronicleText: `【${c.name}】治兵有方，戎备整饬。`
      };
    }

    return null;
  }

  // 随机生成全新名臣
  spawnNewcomer(turn, historyManager) {
    const unactive = CHARACTER_TEMPLATES.find(t => !this.get(t.id));
    if (unactive) {
      const inst = this.createInstanceFromTemplate(unactive);
      inst.history.push(`${historyManager.getYearSeasonText(turn)} 登朝拜官，初任【${inst.office}】。`);
      return inst;
    }

    // 模板耗尽时，基于命名池动态生成
    const surname = this.prng.choice(NAME_POOLS.surnames);
    const given = this.prng.choice(NAME_POOLS.givenMale);
    const name = surname + given;
    const traitsPool = Object.keys(CHARACTER_TRAITS);
    const t1 = this.prng.choice(traitsPool);
    let t2 = this.prng.choice(traitsPool);
    if (t2 === t1) t2 = 'devoted';

    const offices = ['给事中', '御史中丞', '右佥都御史', '兵部郎中', '户部侍郎', '大理寺正'];
    const office = this.prng.choice(offices);

    const inst = {
      id: `gen_${Date.now()}_${this.characters.length}`,
      name,
      gender: 'male',
      age: this.prng.nextInt(30, 48),
      alive: true,
      role: 'civil_official',
      office,
      region: 'central',
      faction: 'civil',
      traits: [t1, t2],
      ambition: this.prng.nextInt(40, 75),
      competence: this.prng.nextInt(65, 88),
      influence: 35,
      relationshipToEmperor: 'neutral',
      relationships: {},
      currentGoal: '立德立功，光耀门楣',
      initialQuote: '“承乏入仕，唯愿不负清平盛世。”',
      stateQuote: '“承乏入仕，唯愿不负清平盛世。”',
      history: [
        `${historyManager.getYearSeasonText(turn)} 登朝拜官，初任【${office}】。`
      ],
      memories: [],
      addMemory(turn, desc, importance = 5) {
        this.memories.push({ turn, desc, importance });
        if (this.memories.length > BALANCE.MAX_CHARACTER_MEMORIES) {
          this.memories.sort((a, b) => b.importance - a.importance);
          this.memories = this.memories.slice(0, BALANCE.MAX_CHARACTER_MEMORIES);
        }
      },
      hasNewEvent: true,
      lastEventTurn: turn
    };

    this.characters.push(inst);
    return inst;
  }

  restore(data) {
    this.characters = Array.isArray(data.characters) ? data.characters.map(c => ({
      ...c,
      memories: Array.isArray(c.memories) ? [...c.memories] : [],
      addMemory(turn, desc, importance = 5) {
        this.memories.push({ turn, desc, importance });
        if (this.memories.length > BALANCE.MAX_CHARACTER_MEMORIES) {
          this.memories.sort((a, b) => b.importance - a.importance);
          this.memories = this.memories.slice(0, BALANCE.MAX_CHARACTER_MEMORIES);
        }
      }
    })) : [];
    this.followedIds = new Set(data.followedIds || []);
  }
}
