// 《一朝天子》Prototype 0.3 数值常数与全局平衡配置
export const BALANCE = {
  VERSION: '0.3',
  MAX_TURNS: 80, // 20年 = 80季
  ROUNDS_PER_YEAR: 4,
  SEASONS: ['春', '夏', '秋', '冬'],
  SEASON_THEMES: {
    '春': { label: '春雨润物', tint: 'rgba(46, 89, 63, 0.08)', mood: '万象初苏' },
    '夏': { label: '夏日炎炽', tint: 'rgba(212, 175, 55, 0.06)', mood: '盛暑巡防' },
    '秋': { label: '秋水渐肃', tint: 'rgba(184, 115, 51, 0.08)', mood: '四野大熟' },
    '冬': { label: '冬寒严栗', tint: 'rgba(100, 110, 130, 0.10)', mood: '岁暮休沐' }
  },

  // 朝代名称池
  DYNASTY_NAMES: ['大晟', '大宁', '大昭', '大熙', '大梁', '大齐', '大楚', '大雍'],
  // 年号池
  ERA_NAMES: ['永安', '景泰', '建中', '弘道', '天宝', '隆平', '正和', '光天', '天祐', '开元'],

  // 皇帝初始属性
  EMPEROR_INIT: {
    MIN_START_AGE: 26,
    MAX_START_AGE: 34,
    TRAITS: ['宽仁', '尚武', '多疑', '节俭', '奢华', '好学', '刚烈', '优柔'],
    HEALTH_STATES: {
      HEALTHY: { label: '康健', level: 4, desc: '起居如常，精神健旺' },
      SLIGHT_ILL: { label: '偶有小恙', level: 3, desc: '偶感风寒，静养可安' },
      WEAK: { label: '体弱', level: 2, desc: '神思倦怠，卧疾渐繁' },
      CRITICAL: { label: '病重', level: 1, desc: '圣体沉笃，日夜难寐' }
    }
  },

  // 宏观健康度初始值 (降级为背景状态，非清红点指标)
  INITIAL_STATS: {
    treasury: 55, // 国库
    livelihood: 60, // 民生
    might: 55,     // 国势
    authority: 65  // 皇威
  },

  // 四项宏观描述档位
  STAT_DESCRIPTIONS: {
    treasury: [
      { min: 75, max: 100, label: '充盈', desc: '国帑殷实，岁入充裕' },
      { min: 50, max: 74,  label: '尚可', desc: '入出相当，度支粗足' },
      { min: 25, max: 49,  label: '吃紧', desc: '府库拮据，支绌见底' },
      { min: 0,  max: 24,  label: '枯竭', desc: '太仓无粟，度支瓦解' }
    ],
    livelihood: [
      { min: 75, max: 100, label: '殷实', desc: '黔首安乐，户有余粮' },
      { min: 50, max: 74,  label: '粗安', desc: '生齿渐繁，饥寒得免' },
      { min: 25, max: 49,  label: '艰窘', desc: '民怨暗生，流民散落' },
      { min: 0,  max: 24,  label: '凋敝', desc: '田亩荒绝，流殍载道' }
    ],
    might: [
      { min: 75, max: 100, label: '鼎盛', desc: '四方宾服，威加塞外' },
      { min: 50, max: 74,  label: '强盛', desc: '边境宁靖，戎旅整饬' },
      { min: 25, max: 49,  label: '守成', desc: '戎备渐懈，塞防堪虞' },
      { min: 0,  max: 24,  label: '疲敝', desc: '寇贼侵扰，烽燧数惊' }
    ],
    authority: [
      { min: 75, max: 100, label: '极盛', desc: '乾纲独断，万邦肃敬' },
      { min: 50, max: 74,  label: '崇严', desc: '群臣奉敕，政令通行' },
      { min: 25, max: 49,  label: '稍衰', desc: '朋党渐结，奏疏迁延' },
      { min: 0,  max: 24,  label: '削弱', desc: '权门专恣，威命不行' }
    ]
  },

  // 人物容量
  MIN_ACTIVE_CHARACTERS: 6,
  TARGET_ACTIVE_CHARACTERS: 8,
  MAX_ACTIVE_CHARACTERS: 12,

  // 每季信息与奏折预算
  MAX_HEADLINE_NEWS: 3,
  PROPOSALS_PER_TURN: 5,
  MAX_KEPT_PROPOSALS: 1, // 留中待议数量上限

  // 记忆上限
  MAX_CHARACTER_MEMORIES: 6,
  MAX_THREAD_MEMORIES: 8
};
