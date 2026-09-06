// Prototype 0.2 年度定策 (6种国策定义)
// 每4轮(1年)触发一次三选一，场上最多同时激活3个
export const POLICIES = {
  commerce_reform: {
    id: 'commerce_reform',
    name: '重商 · 市舶新政',
    title: '市舶新政',
    category: 'trade',
    description: '弛商禁，广招商舶番货，牌库中商贸与海贸决策效果大幅增强。',
    tagBonus: 'trade'
  },
  military_focus: {
    id: 'military_focus',
    name: '尚武 · 募勇边军',
    title: '募勇边军',
    category: 'military',
    description: '优容将士开拔重赏，所有军事手段对边患与战事的化解成效大幅提高。',
    tagBonus: 'military'
  },
  people_rest: {
    id: 'people_rest',
    name: '与民休息 · 轻徭薄赋',
    title: '轻徭薄赋',
    category: 'relief',
    description: '藏富于野节制官役，民生灾荒应对更平稳，不易激化民间反抗。',
    tagBonus: 'relief'
  },
  court_rectify: {
    id: 'court_rectify',
    name: '整饬朝纲 · 巡按天下',
    title: '巡按天下',
    category: 'reform',
    description: '御史按部明察秋毫，政治肃奸与整饬吏治时不易引起朝野剧烈反弹。',
    tagBonus: 'reform'
  },
  diplomatic_truce: {
    id: 'diplomatic_truce',
    name: '怀柔四夷 · 盟誓诸部',
    title: '盟誓诸部',
    category: 'diplomacy',
    description: '示恩北胡结纳羁縻，外交和谈与议和时能够以更少代价换取和平。',
    tagBonus: 'diplomacy'
  },
  authoritarian_might: {
    id: 'authoritarian_might',
    name: '威权治世 · 雷霆手段',
    title: '雷霆手段',
    category: 'force',
    description: '明刑弼教朝纲立断，所有强硬与清洗政令威力剧增，然易深埋积怨。',
    tagBonus: 'force'
  }
};
