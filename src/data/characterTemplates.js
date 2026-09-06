// 《一朝天子》Prototype 0.3 初始人物与角色模板库 (Character Templates)

export const CHARACTER_TEMPLATES = [
  {
    id: 'han_ce',
    name: '韩策',
    gender: 'male',
    baseAge: 42,
    role: 'frontier_general',
    office: '镇北大将军',
    region: 'north',
    faction: 'military',
    traits: ['martial', 'ambitious'], // 尚武, 野心
    ambition: 78,
    competence: 86,
    influence: 68,
    relationshipToEmperor: 'favored', // 受知遇
    initialQuote: '“边关三万健儿，唯凭大将军令旗所向。”',
    starter: true,
    initialGoal: '开拓北境，受封万户侯'
  },
  {
    id: 'shen_ke',
    name: '沈恪',
    gender: 'male',
    baseAge: 38,
    role: 'local_reformer',
    office: '河东巡抚兼按察使',
    region: 'central',
    faction: 'civil',
    traits: ['reforming', 'upright'], // 改革, 刚直
    ambition: 62,
    competence: 88,
    influence: 45,
    relationshipToEmperor: 'respected',
    initialQuote: '“天下旧弊丛生，非雷霆更化不可救。”',
    starter: true,
    initialGoal: '清丈田亩，革除赋税积弊'
  },
  {
    id: 'wei_su',
    name: '魏肃',
    gender: 'male',
    baseAge: 56,
    role: 'chancellor',
    office: '中书令 · 首辅',
    region: 'central',
    faction: 'civil',
    traits: ['conservative', 'devoted'], // 保守, 忠谨
    ambition: 45,
    competence: 80,
    influence: 75,
    relationshipToEmperor: 'trusted',
    initialQuote: '“祖宗家法已具，朝廷唯在持重安民，慎勿轻动。”',
    starter: true,
    initialGoal: '平息朝议纷争，保国祚无虞'
  },
  {
    id: 'pei_jian',
    name: '裴简',
    gender: 'male',
    baseAge: 34,
    role: 'censor',
    office: '左副都御史',
    region: 'central',
    faction: 'civil',
    traits: ['incorruptible', 'upright'], // 清廉, 刚直
    ambition: 50,
    competence: 76,
    influence: 40,
    relationshipToEmperor: 'neutral',
    initialQuote: '“臣职在宪台，宁为玉碎，不作避事之木偶。”',
    starter: true,
    initialGoal: '弹劾权门，澄清吏治风宪'
  },
  {
    id: 'gu_yuan',
    name: '顾源',
    gender: 'male',
    baseAge: 46,
    role: 'merchant_magnate',
    office: '两浙市舶司总管 · 巨贾',
    region: 'south',
    faction: 'merchants',
    traits: ['mercantile', 'tactful'], // 重利, 圆滑
    ambition: 70,
    competence: 82,
    influence: 52,
    relationshipToEmperor: 'friendly',
    initialQuote: '“四海金玉互通，自古未有闭关而能大富者。”',
    starter: true,
    initialGoal: '拓宽海运通商，得内廷特许盐引'
  },
  {
    id: 'wang_cheng',
    name: '汪成',
    gender: 'male',
    baseAge: 48,
    role: 'eunuch',
    office: '司礼监掌印太监',
    region: 'central',
    faction: 'palace',
    traits: ['tactful', 'extravagant'], // 圆滑, 奢靡
    ambition: 65,
    competence: 72,
    influence: 60,
    relationshipToEmperor: 'servant',
    initialQuote: '“伺候万岁爷喜怒，方是内廷奴婢的第一分内事。”',
    starter: true,
    initialGoal: '巩固内廷批红之柄，充实内库'
  },
  // 储备与后续登场名臣/豪族/将领
  {
    id: 'shi_xiong',
    name: '石雄',
    gender: 'male',
    baseAge: 29,
    role: 'young_general',
    office: '折冲校尉 · 宿卫统领',
    region: 'north',
    faction: 'military',
    traits: ['martial', 'devoted'], // 尚武, 忠谨
    ambition: 55,
    competence: 84,
    influence: 35,
    relationshipToEmperor: 'neutral',
    initialQuote: '“马革裹尸，男儿本色，愿领精骑为前锋。”',
    starter: false,
    initialGoal: '建功立业，名列麒麟阁'
  },
  {
    id: 'lu_boyuan',
    name: '陆伯渊',
    gender: 'male',
    baseAge: 61,
    role: 'scholar',
    office: '翰林院掌院学士',
    region: 'central',
    faction: 'civil',
    traits: ['benevolent', 'conservative'], // 宽仁, 保守
    ambition: 30,
    competence: 78,
    influence: 55,
    relationshipToEmperor: 'respected',
    initialQuote: '“经筵讲席，首重立人德业，次乃及事功。”',
    starter: false,
    initialGoal: '辅导东宫圣学，传衍斯文正脉'
  },
  {
    id: 'xie_chengli',
    name: '谢承礼',
    gender: 'male',
    baseAge: 40,
    role: 'gentry_noble',
    office: '户部右侍郎 · 陈郡谢氏宗长',
    region: 'south',
    faction: 'gentry',
    traits: ['tactful', 'extravagant'], // 圆滑, 奢靡
    ambition: 68,
    competence: 74,
    influence: 62,
    relationshipToEmperor: 'neutral',
    initialQuote: '“江南百年士族，安得轻受迁客骚人妄动。”',
    starter: false,
    initialGoal: '庇荫江左族党，抗拒清丈均田'
  },
  {
    id: 'fan_tingyu',
    name: '范廷玉',
    gender: 'male',
    baseAge: 45,
    role: 'provincial_governor',
    office: '淮南转运使',
    region: 'central',
    faction: 'civil',
    traits: ['incorruptible', 'benevolent'], // 清廉, 宽仁
    ambition: 35,
    competence: 82,
    influence: 40,
    relationshipToEmperor: 'neutral',
    initialQuote: '“百姓一箪食一壶浆皆是民脂，安敢轻掷之于虚名。”',
    starter: false,
    initialGoal: '储蓄仓庾，遇灾无殍'
  },
  {
    id: 'cui_daotong',
    name: '崔道通',
    gender: 'male',
    baseAge: 44,
    role: 'stern_official',
    office: '刑部左侍郎',
    region: 'central',
    faction: 'civil',
    traits: ['suspicious', 'upright'], // 多疑, 刚直
    ambition: 65,
    competence: 79,
    influence: 48,
    relationshipToEmperor: 'neutral',
    initialQuote: '“乱世用重典，法度严明则奸宄自敛。”',
    starter: false,
    initialGoal: '综核名实，整肃刑宪'
  },
  {
    id: 'cang_tianba',
    name: '呼延朔',
    gender: 'male',
    baseAge: 27,
    role: 'steppe_prince',
    office: '乌桓西帐小王',
    region: 'north',
    faction: 'military',
    traits: ['ambitious', 'martial'], // 野心, 尚武
    ambition: 85,
    competence: 78,
    influence: 45,
    relationshipToEmperor: 'neutral',
    initialQuote: '“大雕终当搏击青云，我安能永屈于荒原之下？”',
    starter: false,
    initialGoal: '借中原之援，诛杀长兄一统草原'
  }
];

// 姓名生成库 (姓与名)
export const NAME_POOLS = {
  surnames: ['韩', '沈', '顾', '陆', '魏', '裴', '卢', '崔', '杨', '谢', '石', '赵', '苏', '范', '萧', '杜', '薛', '高', '李', '王'],
  givenMale: ['策', '恪', '肃', '简', '源', '雄', '伯渊', '承礼', '廷玉', '道通', '文德', '克勤', '崇光', '思齐', '景澄', '世绩', '元霸', '知节', '光辅', '道济'],
  givenFemale: ['徽音', '明婉', '长宁', '云容', '素商', '玉华', '文君', '秀容', '令仪', '婉清', '淑慎', '华仪'],
  steppeSurnames: ['阿史那', '呼延', '独孤', '慕容', '拓跋', '宇文'],
  steppeGiven: ['浑', '朔', '烈', '鹰', '骨咄', '拔汗', '达干', '突苾']
};
