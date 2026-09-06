// 《一朝天子》Prototype 0.2 数值常数与全局平衡配置
export const BALANCE = {
  MAX_TURNS: 40,
  ROUNDS_PER_YEAR: 4,
  SEASONS: ['春', '夏', '秋', '冬'],

  // 核心王朝健康度初始值
  INITIAL_STATS: {
    treasury: 55, // 国库
    morale: 60,   // 民心
    military: 55, // 军势
    court: 60     // 朝局
  },
  INITIAL_STAT_VARIANCE: 4,

  // 牌库与手牌规则
  DECK_BASE_SIZE: 24,
  HAND_SIZE: 5,
  MAX_KEPT_CARDS: 1,

  // 场上局势与状态上限
  MAX_ACTIVE_SITUATIONS: 3,
  MAX_ACTIVE_RESIDUES: 3,  // 场上后遗状态上限
  MAX_ACTIVE_POLICIES: 3,  // 年度国策上限

  // 局势阶段定义 (三阶段压力)
  SITUATION_STAGES: {
    1: { name: '征兆', symbol: '●○○', desc: '隐患初现' },
    2: { name: '恶化', symbol: '●●○', desc: '局势严峻' },
    3: { name: '危急', symbol: '●●●', desc: '临界爆发' }
  },

  // 交互评级
  INTERACTION_QUALITIES: {
    excellent: { label: '极有效', score: 3, color: '#2c593f', symbol: '★' },
    good:      { label: '有效',   score: 2, color: '#3d587a', symbol: '▲' },
    weak:      { label: '勉强',   score: 1, color: '#874e2a', symbol: '△' },
    none:      { label: '无涉',   score: 0, color: '#666666', symbol: '－' },
    dangerous: { label: '反噬',   score: -1, color: '#8b251e', symbol: '✕' }
  },

  // 动作标签中英文映射
  TAG_NAMES: {
    finance: '财政',
    relief: '赈济',
    military: '武备',
    diplomacy: '外交',
    trade: '商贸',
    reform: '吏治',
    force: '强硬',
    purge: '清洗',
    prestige: '礼制',
    construction: '营造'
  },

  // 四项健康度档位描述
  STAT_TIERS: {
    treasury: [
      { min: 76, max: 100, label: '充盈', css: 'tier-high' },
      { min: 51, max: 75,  label: '尚可', css: 'tier-good' },
      { min: 26, max: 50,  label: '吃紧', css: 'tier-warn' },
      { min: 0,  max: 25,  label: '枯竭', css: 'tier-danger' },
    ],
    morale: [
      { min: 76, max: 100, label: '归附', css: 'tier-high' },
      { min: 51, max: 75,  label: '安定', css: 'tier-good' },
      { min: 26, max: 50,  label: '不满', css: 'tier-warn' },
      { min: 0,  max: 25,  label: '沸腾', css: 'tier-danger' },
    ],
    military: [
      { min: 76, max: 100, label: '强盛', css: 'tier-high' },
      { min: 51, max: 75,  label: '可战', css: 'tier-good' },
      { min: 26, max: 50,  label: '疲弱', css: 'tier-warn' },
      { min: 0,  max: 25,  label: '危殆', css: 'tier-danger' },
    ],
    court: [
      { min: 76, max: 100, label: '稳固', css: 'tier-high' },
      { min: 51, max: 75,  label: '尚稳', css: 'tier-good' },
      { min: 26, max: 50,  label: '暗流', css: 'tier-warn' },
      { min: 0,  max: 25,  label: '失控', css: 'tier-danger' },
    ]
  },

  ERA_NAMES: ['永和', '天祐', '弘昭', '隆安', '明正', '开平', '光瑞', '正德']
};
