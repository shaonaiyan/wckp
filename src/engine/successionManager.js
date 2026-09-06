// 《一朝天子》Prototype 0.3 帝位传承与本纪管理器 (SuccessionManager)
// 皇帝驾崩后生成《本纪》史评，继位保留完整世界生态 (Section 9 & 10)

import { BALANCE } from '../data/balance.js';

export class SuccessionManager {
  constructor() {
    this.pastEmperors = []; // 历代先帝《本纪》记录
  }

  reset() {
    this.pastEmperors = [];
  }

  // 生成《大行皇帝本纪》总结 (Section 9)
  generateImperialAnnals(emperor, royalFamily, characterManager, historyManager, causalHookManager) {
    const yearsReigned = emperor.yearsReigning || Math.max(1, Math.floor(emperor.age - emperor.startAge));
    const heir = royalFamily.getHeir();
    const heirName = heir ? heir.name : '宗室贤王';

    // 梳理在位期间最重要人物
    const activeChars = characterManager.getActive();
    let mostImportantMinister = activeChars.length > 0
      ? activeChars.reduce((max, c) => (c.influence > max.influence ? c : max), activeChars[0]).name
      : '宰辅魏肃';

    // 梳理重大因果政策
    const hooks = causalHookManager.getAll();
    const majorDeeds = [];
    if (hooks.some(h => h.id === 'open_sea_trade')) majorDeeds.push('开海通商，百舶通洋');
    if (hooks.some(h => h.id === 'shen_ke_reform_enacted')) majorDeeds.push('清丈隐田，均平赋役');
    if (hooks.some(h => h.id === 'han_ce_reinforced')) majorDeeds.push('扩充北军，威加朔漠');
    if (hooks.some(h => h.id === 'palace_construction_started')) majorDeeds.push('广筑西苑，好营宫观');
    if (hooks.some(h => h.id === 'general_amnesty_declared')) majorDeeds.push('宽仁布政，频颁大赦');

    const deedsSummary = majorDeeds.length > 0 ? majorDeeds.join('；') + '。' : '持重守文，恭俭奉先。';

    // 谥号与史官总评
    let posthumousTitle = '文皇帝';
    let summaryEvaluation = '恭俭有度，宽以持中，终保宗社承平。';
    if (hooks.some(h => h.id === 'han_ce_reinforced')) {
      posthumousTitle = '武皇帝';
      summaryEvaluation = '尚武拓土，军容赫赫，塞北诸番畏威纳款。';
    } else if (hooks.some(h => h.id === 'shen_ke_reform_enacted')) {
      posthumousTitle = '宣皇帝';
      summaryEvaluation = '锐意更张，均赋整弊，实中兴一代之令主。';
    } else if (hooks.some(h => h.id === 'palace_construction_started')) {
      posthumousTitle = '僖皇帝';
      summaryEvaluation = '晚岁喜营造神仙之好，度支渐耗，然社稷未倾。';
    }

    const annals = {
      emperorName: emperor.name,
      eraName: emperor.eraName,
      posthumousTitle,
      startAge: emperor.startAge,
      deathAge: emperor.age,
      yearsReigned,
      reason: emperor.deathReason || '圣躬寝笃，龙驭宾天',
      mostImportantMinister,
      deedsSummary,
      successor: heirName,
      summaryEvaluation,
      fullText: `【${emperor.eraName}帝本纪】\n帝二十${emperor.startAge % 10}岁即位，临朝在位二十有${yearsReigned % 10 || 3}载。初年定策立嗣，四方粗安。其间${deedsSummary}在位期间倚重名臣【${mostImportantMinister}】总领大政。晚岁${emperor.deathReason}。史臣赞曰：${summaryEvaluation}皇太子【${heirName}】奉遗诏践祚，定来岁为改元之始。`
    };

    this.pastEmperors.push(annals);
    return annals;
  }

  // 储君登基，世界生态绝对保留 (Section 10)
  executeSuccession(world, prng) {
    const oldEmperor = world.royalFamily.emperor;
    const heir = world.royalFamily.getHeir();

    const newEra = prng.choice(BALANCE.ERA_NAMES.filter(e => e !== oldEmperor.eraName)) || '景泰';
    const newAge = heir ? heir.age : 22;
    const newName = heir ? heir.name : '景明';

    // 继承世界：新皇帝登基
    world.royalFamily.emperor = {
      generation: (oldEmperor.generation || 1) + 1,
      dynasty: oldEmperor.dynasty,
      eraName: newEra,
      name: newName,
      templeName: '恭宗',
      age: Math.max(16, newAge),
      startAge: Math.max(16, newAge),
      yearsReigning: 0,
      healthLevel: 4,
      traits: heir && heir.traits ? [...heir.traits] : ['devoted', 'benevolent'],
      alive: true,
      deathTurn: null,
      deathReason: null,
      annalsHighlights: []
    };

    // 新皇立新皇后
    world.royalFamily.empress = {
      name: '李氏',
      title: '皇后',
      age: Math.max(16, newAge - 2),
      alive: true,
      pregnant: false,
      pregnancyTurns: 0
    };

    // 幼年皇子备位
    world.royalFamily.children = [
      {
        id: `child_gen2_${Date.now()}`,
        name: '绍宣',
        title: '皇长子',
        gender: 'male',
        age: 1,
        alive: true,
        isHeir: true,
        tutor: null,
        traits: ['benevolent', 'conservative'],
        health: 'healthy',
        married: false,
        history: ['新皇践祚，诞育元子。']
      }
    ];
    world.royalFamily.heirId = world.royalFamily.children[0].id;

    // 记录登基史册
    world.historyManager.recordSuccession(world.turn, newEra, newName);

    return world.royalFamily.emperor;
  }

  restore(data) {
    this.pastEmperors = Array.isArray(data) ? [...data] : [];
  }
}
