// 局势数据配置：定义16种天下局势（正面、普通负面、重大危机）
// 数据驱动，完全解耦

export const SITUATIONS = [
  // ---------------- 正面局势 ----------------
  {
    id: 'harvest_south',
    name: '江南丰收',
    category: 'positive',
    severity: 1,
    defaultDuration: 3,
    maxDuration: 4,
    stage: 1,
    maxStage: 1,
    description: '两浙湖广稻浪千顷，岁稔年丰，仓廪充实。',
    tickEffect: { treasury: 3, morale: 2, military: 0, court: 0 },
    responsiveTags: ['agriculture', 'tax', 'economy'],
    cardModifier: {
      tags: ['tax', 'agriculture'],
      bonusTreasury: 4
    },
    triggerCondition: (state, activeSituations, prng) => {
      // 垦荒或休养生息，或者高民心时容易触发
      const baseChance = state.hasLongTermState('rest_and_recuperate') ? 0.25 : 0.12;
      return prng.nextFloat() < baseChance;
    }
  },
  {
    id: 'universal_peace',
    name: '四海升平',
    category: 'positive',
    severity: 1,
    defaultDuration: 3,
    maxDuration: 3,
    stage: 1,
    maxStage: 1,
    description: '边鄙宴然，黎庶乐业，路不拾遗，四方宾服。',
    tickEffect: { treasury: 1, morale: 3, military: 1, court: 1 },
    responsiveTags: ['morale', 'peace'],
    triggerCondition: (state, activeSituations, prng) => {
      if (state.morale > 70 && state.court > 60 && (!activeSituations || activeSituations.every(s => s.category === 'positive'))) {
        return prng.nextFloat() < 0.2;
      }
      return false;
    }
  },
  {
    id: 'thriving_trade',
    name: '商路繁荣',
    category: 'positive',
    severity: 1,
    defaultDuration: 3,
    maxDuration: 3,
    stage: 1,
    maxStage: 1,
    description: '运河百舸争流，关隘客商云集，南北货畅其流。',
    tickEffect: { treasury: 3, morale: 1, military: 0, court: 0 },
    responsiveTags: ['finance', 'trade'],
    cardModifier: {
      tags: ['finance', 'trade'],
      bonusTreasury: 4
    },
    triggerCondition: (state, activeSituations, prng) => {
      if (state.hasLongTermState('thriving_sea_trade') || state.treasury > 65) {
        return prng.nextFloat() < 0.22;
      }
      return false;
    }
  },

  // ---------------- 普通负面局势 ----------------
  {
    id: 'northern_incursion',
    name: '北境犯边',
    category: 'negative',
    severity: 2,
    defaultDuration: -1, // 持续直到解决或升级
    stage: 1,
    maxStage: 3,
    description: '胡骑数万人寇雁门云中，烽烟昼夜不绝，边塞告急。',
    tickEffect: { treasury: -2, morale: -1, military: -3, court: 0 },
    responsiveTags: ['military', 'diplomacy', 'border', 'war'],
    unresolvedCount: 0,
    escalateThreshold: 3, // 连续3轮未缓解升级为边境战争
    escalateTo: 'border_war',
    triggerCondition: (state, activeSituations, prng) => {
      if (activeSituations && activeSituations.some(s => ['northern_incursion', 'border_war'].includes(s.id))) return false;
      const weight = state.military < 45 ? 0.35 : 0.15;
      return prng.nextFloat() < weight;
    }
  },
  {
    id: 'yellow_river_flood',
    name: '黄河水患',
    category: 'negative',
    severity: 2,
    defaultDuration: 4,
    stage: 1,
    maxStage: 3,
    description: '秋汛猛涨大堤决口，漂没千里农田庐舍，饥民遍野。',
    tickEffect: { treasury: -3, morale: -4, military: 0, court: 0 },
    responsiveTags: ['disaster', 'relief', 'agriculture', 'engineering'],
    triggerCondition: (state, activeSituations, prng) => {
      if (activeSituations && activeSituations.some(s => s.id === 'yellow_river_flood')) return false;
      if (state.hasLongTermState('waterworks_ready')) return prng.nextFloat() < 0.06;
      return prng.nextFloat() < 0.18;
    }
  },
  {
    id: 'empty_treasury',
    name: '国库空虚',
    category: 'negative',
    severity: 2,
    defaultDuration: -1,
    stage: 1,
    maxStage: 2,
    description: '太仓见底度支支绌，百官俸米积欠，百计筹措无门。',
    tickEffect: { treasury: -1, morale: -2, military: -1, court: -2 },
    responsiveTags: ['finance', 'tax', 'debt'],
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => s.id === 'empty_treasury')) return false;
      return state.treasury <= 25;
    },
    autoResolve: (state) => state.treasury >= 45
  },
  {
    id: 'rising_discontent',
    name: '民怨渐起',
    category: 'negative',
    severity: 2,
    defaultDuration: -1,
    stage: 1,
    maxStage: 3,
    description: '荒政弛废吏胥诛求，乡野流民聚啸，隐闻谣诼白莲之乱。',
    tickEffect: { treasury: 0, morale: -4, military: 0, court: -1 },
    responsiveTags: ['relief', 'livelihood', 'amnesty'],
    unresolvedCount: 0,
    escalateThreshold: 3,
    escalateTo: 'major_rebellion',
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => ['rising_discontent', 'major_rebellion'].includes(s.id))) return false;
      return state.morale <= 35;
    },
    autoResolve: (state) => state.morale >= 55
  },
  {
    id: 'corrupt_minister',
    name: '权臣坐大',
    category: 'negative',
    severity: 2,
    defaultDuration: -1,
    stage: 1,
    maxStage: 3,
    description: '辅政阁臣广树私党，内外奏折皆先过其门，威福自操。',
    tickEffect: { treasury: -1, morale: 0, military: 0, court: -3 },
    responsiveTags: ['politics', 'purge', 'centralization'],
    triggerCondition: (state, activeSituations, prng) => {
      if (activeSituations && activeSituations.some(s => ['corrupt_minister', 'court_intrigue'].includes(s.id))) return false;
      if (state.court < 40) return prng.nextFloat() < 0.28;
      return false;
    }
  },
  {
    id: 'bureaucratic_corruption',
    name: '吏治腐败',
    category: 'negative',
    severity: 2,
    defaultDuration: 4,
    stage: 1,
    maxStage: 2,
    description: '贿赂公行部费横征，下僚侵渔小民，朝廷令典废格不行。',
    tickEffect: { treasury: -2, morale: -2, military: 0, court: -2 },
    responsiveTags: ['anti_corruption', 'reform', 'politics'],
    triggerCondition: (state, activeSituations, prng) => {
      if (activeSituations && activeSituations.some(s => s.id === 'bureaucratic_corruption')) return false;
      if (state.court < 48 || state.treasury > 80) return prng.nextFloat() < 0.22;
      return false;
    }
  },
  {
    id: 'land_annexation',
    name: '土地兼并',
    category: 'negative',
    severity: 2,
    defaultDuration: 5,
    stage: 1,
    maxStage: 2,
    description: '豪强兼并田连阡陌，失地流民充斥，民心沉沦日深。',
    tickEffect: { treasury: -1, morale: -3, military: 0, court: 0 },
    responsiveTags: ['agriculture', 'tax', 'reform'],
    triggerCondition: (state, activeSituations, prng) => {
      if (activeSituations && activeSituations.some(s => s.id === 'land_annexation')) return false;
      return prng.nextFloat() < 0.16;
    }
  },
  {
    id: 'military_arrears',
    name: '军饷拖欠',
    category: 'negative',
    severity: 2,
    defaultDuration: -1,
    stage: 1,
    maxStage: 3,
    description: '九边精骑已有半载未领行粮，营中哗噪，按剑而立。',
    tickEffect: { treasury: 0, morale: -2, military: -4, court: -1 },
    responsiveTags: ['military', 'finance', 'debt'],
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => s.id === 'military_arrears')) return false;
      return state.treasury < 30 && state.military > 50;
    },
    autoResolve: (state) => state.treasury >= 45
  },
  {
    id: 'warlord_buildup',
    name: '边将拥兵',
    category: 'negative',
    severity: 2,
    defaultDuration: -1,
    stage: 1,
    maxStage: 3,
    description: '节镇重臣蓄养假子健儿万数，骄蹇自恣，朝命不行于关外。',
    tickEffect: { treasury: -2, morale: 0, military: 2, court: -3 },
    responsiveTags: ['warlord', 'centralization', 'politics'],
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => s.id === 'warlord_buildup')) return false;
      return state.military >= 65 && state.court <= 40;
    }
  },

  // ---------------- 重大危机局势 ----------------
  {
    id: 'border_war',
    name: '边境战争',
    category: 'crisis',
    severity: 4,
    defaultDuration: -1,
    stage: 1,
    maxStage: 5,
    description: '异族倾国入寇烽连百里，关隘失守，三军浴血，社稷受惊。',
    tickEffect: { treasury: -5, morale: -3, military: -5, court: -2 },
    responsiveTags: ['military', 'war', 'diplomacy', 'finance'],
    triggerCondition: (state, activeSituations, prng) => {
      if (activeSituations && activeSituations.some(s => s.id === 'border_war')) return false;
      if (state.military < 25) return prng.nextFloat() < 0.3;
      return false;
    }
  },
  {
    id: 'major_rebellion',
    name: '大规模民变',
    category: 'crisis',
    severity: 4,
    defaultDuration: -1,
    stage: 1,
    maxStage: 5,
    description: '闯王揭竿群盗如蚁，州县残破赤地千里，乱军逼近中原。',
    tickEffect: { treasury: -4, morale: -5, military: -3, court: -4 },
    responsiveTags: ['relief', 'purge', 'amnesty', 'military'],
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => s.id === 'major_rebellion')) return false;
      return state.morale < 20;
    }
  },
  {
    id: 'court_intrigue',
    name: '宫廷政争',
    category: 'crisis',
    severity: 4,
    defaultDuration: -1,
    stage: 1,
    maxStage: 5,
    description: '内侍勾结党臣密谋矫诏，南北两司相倾，紫禁城内杀气潜伏。',
    tickEffect: { treasury: -2, morale: -2, military: -2, court: -6 },
    responsiveTags: ['politics', 'purge', 'tactics'],
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => s.id === 'court_intrigue')) return false;
      return state.court < 20;
    }
  },
  {
    id: 'dynasty_crisis',
    name: '王朝危机',
    category: 'crisis',
    severity: 5,
    defaultDuration: -1,
    stage: 1,
    maxStage: 5,
    description: '内外交困天崩地裂，天命式微社稷摇摇欲坠，至危亡存灭之秋！',
    tickEffect: { treasury: -4, morale: -4, military: -4, court: -4 },
    responsiveTags: ['crisis', 'finance', 'military', 'politics', 'relief'],
    triggerCondition: (state, activeSituations) => {
      if (activeSituations && activeSituations.some(s => s.id === 'dynasty_crisis')) return false;
      // 多个状态同时极差
      const lowCount = [state.treasury, state.morale, state.military, state.court].filter(v => v <= 25).length;
      return lowCount >= 3;
    }
  }
];
