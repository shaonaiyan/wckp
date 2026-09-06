// Prototype 0.2 后遗状态定义 (12种)
// 由明确语义行为产生，场上最多同时存在3个，持续2～4季
export const RESIDUES = {
  empty_granaries: {
    id: 'empty_granaries',
    name: '仓储空虚',
    type: 'negative',
    defaultDuration: 3,
    description: '各大常平仓见底，若再遭大灾则赈济乏力。',
    tag: 'relief',
    modifier: {
      reliefBonus: -1, // 赈济效果减弱
      disasterRisk: 1.5
    }
  },
  heavy_labor: {
    id: 'heavy_labor',
    name: '徭役沉重',
    type: 'negative',
    defaultDuration: 3,
    description: '四野丁男苦于官役，田亩荒芜，乡里偶闻叹息怨声。',
    tag: 'labor',
    modifier: {
      moralePressure: -2,
      rebellionRisk: 1.4
    }
  },
  gentry_influence: {
    id: 'gentry_influence',
    name: '豪族声望',
    type: 'negative',
    defaultDuration: 3,
    description: '地方世家大族捐纳有功借机坐大，兼并隐户日益猖獗。',
    tag: 'gentry',
    modifier: {
      landAnnexationRisk: 2.0,
      corruptMinisterRisk: 1.5
    }
  },
  solid_dykes: {
    id: 'solid_dykes',
    name: '河防稳固',
    type: 'positive',
    defaultDuration: 4,
    description: '大堤完固石工坚实，数载之内大汛难以破堤。',
    tag: 'engineering',
    modifier: {
      floodImmunity: true,
      floodRiskMult: 0.2
    }
  },
  weary_army: {
    id: 'weary_army',
    name: '边军疲惫',
    type: 'negative',
    defaultDuration: 3,
    description: '长年甲不解带远戍沙场，战马凋敝士卒思归，战力有所受挫。',
    tag: 'military',
    modifier: {
      militaryBonus: -1
    }
  },
  tribute_burden: {
    id: 'tribute_burden',
    name: '岁币压力',
    type: 'mixed',
    defaultDuration: 4,
    description: '每年向胡虏输送绢帛金银，边地虽得止战，太仓常年失血。',
    tag: 'diplomacy',
    tickEffect: { treasury: -2 },
    modifier: {
      borderIncursionRiskMult: 0.3
    }
  },
  border_market_boom: {
    id: 'border_market_boom',
    name: '边市繁荣',
    type: 'positive',
    defaultDuration: 3,
    description: '榷场互市客商云集，关税日增，塞上烽烟渐化作驼铃。',
    tag: 'trade',
    tickEffect: { treasury: 2 },
    modifier: {
      tradeBonus: 1
    }
  },
  court_terror: {
    id: 'court_terror',
    name: '朝野震恐',
    type: 'negative',
    defaultDuration: 3,
    description: '诏狱大兴株连蔓引，朝臣杜口结舌，下情难以顺畅上达。',
    tag: 'purge',
    tickEffect: { court: 1, morale: -2 },
    modifier: {
      reformPenalty: -1
    }
  },
  reform_talents: {
    id: 'reform_talents',
    name: '新政人才',
    type: 'positive',
    defaultDuration: 4,
    description: '春闱拔擢寒畯新秀，任事清廉敏达，官箴吏治为之一新。',
    tag: 'reform',
    modifier: {
      reformBonus: 1,
      corruptionClearBonus: 1
    }
  },
  plentiful_granary: {
    id: 'plentiful_granary',
    name: '粮储充足',
    type: 'positive',
    defaultDuration: 4,
    description: '太仓盈衍积粟红腐，四海荒政有恃无恐。',
    tag: 'relief',
    modifier: {
      reliefBonus: 1,
      disasterMitigation: 1
    }
  },
  rest_and_recuperate: {
    id: 'rest_and_recuperate',
    name: '休养生息',
    type: 'positive',
    defaultDuration: 4,
    description: '宽省赋役藏富于民，天下生齿渐繁，民气祥和。',
    tag: 'economy',
    tickEffect: { morale: 1, treasury: 1 },
    modifier: {
      opportunityRiskMult: 1.8
    }
  },
  deep_resentment: {
    id: 'deep_resentment',
    name: '积怨渐深',
    type: 'negative',
    defaultDuration: 3,
    description: '刑杀过重压而不服，乡野草泽潜藏怨毒，易遭点火成乱。',
    tag: 'rebellion',
    modifier: {
      rebellionEscalateFast: true
    }
  }
};
