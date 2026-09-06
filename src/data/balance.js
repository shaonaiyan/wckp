// Constants and game balance configuration for "一朝天子"
export const BALANCE = {
  // Game length
  MAX_TURNS: 40,
  ROUNDS_PER_YEAR: 4,
  SEASONS: ['春', '夏', '秋', '冬'],
  
  // Initial core stats
  INITIAL_STATS: {
    treasury: 55, // 国库
    morale: 60,   // 民心
    military: 55, // 军势
    court: 60     // 朝局
  },
  INITIAL_STAT_VARIANCE: 5, // ±5 random offset at start
  
  // Hand constraints
  HAND_SIZE: 5,
  MAX_KEPT_CARDS: 1,
  
  // Situations constraints
  MAX_ACTIVE_SITUATIONS: 3,
  
  // Stat thresholds & tier descriptions
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
  
  // Category names & styling
  CARD_CATEGORIES: {
    finance: { name: '财政', color: '#c59b27' },
    livelihood: { name: '民生', color: '#4a8553' },
    military: { name: '军事', color: '#a33a32' },
    diplomacy: { name: '外交', color: '#4a6fa5' },
    politics: { name: '政治', color: '#7a4b8a' },
    special: { name: '国事', color: '#8a6d3b' }
  },

  // Era names generator
  ERA_NAMES: ['永和', '天祐', '弘昭', '隆安', '明正', '开平', '光瑞', '正德']
};
