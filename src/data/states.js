// 长期王朝状态定义 (10种长期状态)
export const LONG_TERM_STATES = {
  thriving_sea_trade: {
    id: 'thriving_sea_trade',
    name: '海贸兴盛',
    type: 'positive',
    description: '舶商云集通商四海，关税日进斗金。财政类行动收益显著增加。',
    onTick: (state) => ({ treasury: 2 }),
    cardModifier: (card, effect) => {
      if (card.category === 'finance') {
        effect.treasury = (effect.treasury || 0) + 3;
      }
    }
  },
  heavy_debt: {
    id: 'heavy_debt',
    name: '债台高筑',
    type: 'negative',
    description: '子母相权息滚如山，太仓每季皆须还付巨额息银。',
    onTick: (state) => ({ treasury: -2 }),
    cardModifier: (card, effect) => {
      if (card.id === 'national_debt') {
        effect.treasury = Math.max(5, (effect.treasury || 0) - 4);
      }
    }
  },
  waterworks_ready: {
    id: 'waterworks_ready',
    name: '水利修整',
    type: 'positive',
    description: '堤防完固河渠疏通，自然洪涝之害大为削减。',
    onTick: (state) => ({}),
    situationModifier: (situation, tickDelta) => {
      if (situation.id === 'yellow_river_flood') {
        tickDelta.morale = Math.min(0, (tickDelta.morale || 0) + 2);
        tickDelta.treasury = Math.min(0, (tickDelta.treasury || 0) + 1);
      }
    }
  },
  military_reformed: {
    id: 'military_reformed',
    name: '军制革新',
    type: 'positive',
    description: '禁旅纪律严明操法新进，三军将士战力倍增。',
    onTick: (state) => ({ military: 1 }),
    cardModifier: (card, effect) => {
      if (card.category === 'military') {
        effect.military = (effect.military || 0) + 3;
      }
    }
  },
  authoritarian_rule: {
    id: 'authoritarian_rule',
    name: '高压统治',
    type: 'negative',
    description: '诏狱罗织缇骑满道，朝野噤若寒蝉。强硬铁腕加倍有效，然民心受制。',
    onTick: (state) => ({ court: 1, morale: -1 }),
    cardModifier: (card, effect) => {
      if (card.tags.includes('hardline') || card.tags.includes('purge')) {
        effect.court = (effect.court || 0) + 3;
      }
      if (card.category === 'livelihood') {
        effect.morale = Math.max(1, (effect.morale || 0) - 3);
      }
    }
  },
  reform_talents: {
    id: 'reform_talents',
    name: '新政人才',
    type: 'positive',
    description: '科第鼎盛清流拔擢，庶务推行皆得其人。改革类行事成效卓著。',
    onTick: (state) => ({ court: 1 }),
    cardModifier: (card, effect) => {
      if (card.tags.includes('reform')) {
        effect.court = (effect.court || 0) + 2;
        if (effect.treasury !== undefined && effect.treasury > 0) effect.treasury += 2;
      }
    }
  },
  militarism: {
    id: 'militarism',
    name: '穷兵黩武',
    type: 'negative',
    description: '连年用兵天下疲弊，帑藏匮竭而丁壮凋零，民心难安。',
    onTick: (state) => ({ treasury: -1, morale: -2 }),
    cardModifier: (card, effect) => {
      if (card.category === 'livelihood') {
        effect.morale = Math.max(2, (effect.morale || 0) - 3);
      }
    }
  },
  rest_and_recuperate: {
    id: 'rest_and_recuperate',
    name: '休养生息',
    type: 'positive',
    description: '三十税一与民休息，天下生齿日繁，四海呈祥。',
    onTick: (state) => ({ morale: 1, treasury: 1 })
  },
  centralized_power: {
    id: 'centralized_power',
    name: '权力集中',
    type: 'positive',
    description: '天子独断乾纲独揽，政出中枢，宵小权臣难以兴风作浪。',
    onTick: (state) => ({ court: 1 })
  },
  widespread_destitution: {
    id: 'widespread_destitution',
    name: '民生凋敝',
    type: 'negative',
    description: '闾阎空虚白骨露野，四境流民极易铤而走险聚啸称王。',
    onTick: (state) => ({ morale: -1 })
  }
};
