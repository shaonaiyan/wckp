// Prototype 0.2 卡牌实体配置 (24张核心卡牌)
// 每张卡牌具备明确行为人格与主要标签，驱动真实牌库运作
export const CARDS = [
  // ---------------- 财政类 (6张) ----------------
  {
    id: 'levy_taxes',
    name: '加征赋税',
    category: 'finance',
    tags: ['finance', 'force'],
    personality: '解燃眉急 · 苛取民利',
    description: '下诏增派一季田赋商税，急充空匮太仓。',
    baseCost: { treasury: 18, morale: -10, military: 0, court: 0 },
    targetApplicableTags: ['finance', 'relief', 'opportunity'],
    fallbackFlavor: '户部檄文四出，赋税强征解京，太仓见涨而市井怨声渐起。'
  },
  {
    id: 'tax_relief',
    name: '蠲免田赋',
    category: 'finance',
    tags: ['relief', 'finance'],
    personality: '施恩安民 · 割舍帑银',
    description: '宽免受灾遭困州县钱粮，与民生息。',
    baseCost: { treasury: -12, morale: 14, military: 0, court: 2 },
    targetApplicableTags: ['relief', 'finance', 'opportunity'],
    fallbackFlavor: '诏下蠲租，穷黎老幼额手称庆，民间市气渐见活络。'
  },
  {
    id: 'national_debt',
    name: '挪借内帑',
    category: 'finance',
    tags: ['finance'],
    personality: '预支信用 · 债台潜筑',
    description: '勒借晋徽巨室及皇亲私财，立解国库燃眉之困。',
    baseCost: { treasury: 22, morale: -4, military: 0, court: -5 },
    targetApplicableTags: ['finance', 'military'],
    fallbackFlavor: '内帑与富商银两如期凑足，虽解当下困窘，来日连本带利难以交割。'
  },
  {
    id: 'salt_tax_reform',
    name: '整顿盐税',
    category: 'finance',
    tags: ['finance', 'reform'],
    personality: '清理利权 · 触动群贵',
    description: '严查官私盐引，朝廷整饬垄断税权，充实国帑。',
    baseCost: { treasury: 12, morale: -2, military: 0, court: 3 },
    targetApplicableTags: ['finance', 'reform'],
    fallbackFlavor: '盐政巡按清查漏税窝案，利归公帑，私盐豪族隐有私怨。'
  },
  {
    id: 'open_sea_trade',
    name: '开海通商',
    category: 'finance',
    tags: ['trade', 'finance'],
    personality: '弛禁拓殖 · 财自海来',
    description: '重开沿海市舶司，准民间舟舶与西洋互市。',
    baseCost: { treasury: 8, morale: 4, military: 0, court: -2 },
    targetApplicableTags: ['trade', 'opportunity', 'finance'],
    fallbackFlavor: '千帆出洋番货流通，市舶抽解银课日增，沿海气象为之一振。'
  },
  {
    id: 'confiscate_assets',
    name: '抄没家产',
    category: 'finance',
    tags: ['finance', 'purge', 'force'],
    personality: '抄没巨室 · 震恐朝野',
    description: '缇骑搜籍巨贪宿吏宅邸，财帛珍宝尽数解部。',
    baseCost: { treasury: 16, morale: 2, military: 0, court: -6 },
    targetApplicableTags: ['purge', 'reform', 'finance'],
    fallbackFlavor: '锦衣四出籍没贪邸，充盈太仓数月度支，京官侧目人人自危。'
  },

  // ---------------- 民生类 (6张) ----------------
  {
    id: 'granary_relief',
    name: '开仓赈济',
    category: 'livelihood',
    tags: ['relief'],
    personality: '放粮救生 · 仓储骤空',
    description: '尽开沿河沿路常平仓义仓，施粥施药安抚灾黎。',
    baseCost: { treasury: -14, morale: 16, military: 0, court: 1 },
    targetApplicableTags: ['relief', 'disaster'],
    fallbackFlavor: '义仓大开，施粥抚恤，饥民得喘，然库中陈粮几近耗竭。'
  },
  {
    id: 'water_conservancy',
    name: '兴修水利',
    category: 'livelihood',
    tags: ['construction', 'relief'],
    personality: '百代基业 · 靡费巨万',
    description: '征调良工经年筑堤浚河，修治千里河防工程。',
    baseCost: { treasury: -16, morale: 6, military: 0, court: 2 },
    targetApplicableTags: ['construction', 'disaster', 'relief'],
    fallbackFlavor: '大修水利堵口合龙，石堤坚如盘石，经年水患大患初定。'
  },
  {
    id: 'conscript_labor',
    name: '征发民夫',
    category: 'livelihood',
    tags: ['force', 'construction'],
    personality: '省帑强征 · 苦役加身',
    description: '敕令郡县签点壮丁充实徭役，省帑应急。',
    baseCost: { treasury: 0, morale: -12, military: 2, court: 2 },
    targetApplicableTags: ['construction', 'disaster', 'military'],
    fallbackFlavor: '差役四出抓丁办役，官署省得开销，田头多留妇孺号泣。'
  },
  {
    id: 'encourage_reclamation',
    name: '劝农垦荒',
    category: 'livelihood',
    tags: ['relief', 'construction'],
    personality: '敦本务实 · 藏富于田',
    description: '赐民耕牛种籽，免新垦田亩三年地赋。',
    baseCost: { treasury: -6, morale: 8, military: 0, court: 2 },
    targetApplicableTags: ['relief', 'opportunity'],
    fallbackFlavor: '春耕开荒，四郊阡陌初定，流民渐安于陇亩。'
  },
  {
    id: 'general_amnesty',
    name: '大赦天下',
    category: 'livelihood',
    tags: ['prestige', 'relief'],
    personality: '旷典施仁 · 纲纪弛张',
    description: '涣汗大号，非大辟者咸予涤除原宥。',
    baseCost: { treasury: -3, morale: 12, military: -3, court: 1 },
    targetApplicableTags: ['relief', 'prestige'],
    fallbackFlavor: '恩诏颁行，囚徒除桎梏归田里，万方感戴天子深仁。'
  },
  {
    id: 'store_grain',
    name: '储粮备荒',
    category: 'livelihood',
    tags: ['relief', 'finance'],
    personality: '未雨绸缪 · 潜伏投资',
    description: '平价采买秋粮运储常平仓，以备荒年无虞。',
    baseCost: { treasury: -10, morale: 4, military: 0, court: 2 },
    targetApplicableTags: ['relief', 'opportunity'],
    fallbackFlavor: '太仓收储新米千斛，扎固粮道，日后灾异皆有依恃。'
  },

  // ---------------- 军事类 (4张) ----------------
  {
    id: 'recruit_troops',
    name: '征募新军',
    category: 'military',
    tags: ['military', 'force'],
    personality: '扩伍厉兵 · 糜饷损民',
    description: '大开招募之榜，拔选关陇江淮勇壮入京营。',
    baseCost: { treasury: -14, morale: -6, military: 16, court: 2 },
    targetApplicableTags: ['military', 'force'],
    fallbackFlavor: '招募虎贲组建精旅，校场剑戟如林，中枢兵力大振。'
  },
  {
    id: 'demobilize_troops',
    name: '裁撤冗兵',
    category: 'military',
    tags: ['finance', 'reform'],
    personality: '节饷削冗 · 兵心浮动',
    description: '清核营伍耗饷之弊，简汰老弱罢黜挂名虚额。',
    baseCost: { treasury: 14, morale: 2, military: -12, court: 1 },
    targetApplicableTags: ['finance', 'military', 'reform'],
    fallbackFlavor: '清汰冗兵数万，度支糜饷顿减，然裁撤卒伍偶有怨哗。'
  },
  {
    id: 'dispatch_troops_north',
    name: '调兵北上',
    category: 'military',
    tags: ['military', 'force'],
    personality: '雷霆御敌 · 关山苦寒',
    description: '命大将提调精骑奔赴北塞，迎击胡虏锋芒。',
    baseCost: { treasury: -12, morale: -3, military: 6, court: 3 },
    targetApplicableTags: ['military', 'force'],
    fallbackFlavor: '三军北指，旌旗连宵，关塞森严，外患强虏暂为之震慑。'
  },
  {
    id: 'overhaul_armaments',
    name: '整顿军备',
    category: 'military',
    tags: ['military', 'reform'],
    personality: '固甲利器 · 严饬纪律',
    description: '督造精工火器铠甲，严明行伍赏罚条例。',
    baseCost: { treasury: -8, morale: 0, military: 8, court: 4 },
    targetApplicableTags: ['military', 'reform'],
    fallbackFlavor: '武备修整，甲仗鲜明，兵部稽核精良，诸将凛遵军律。'
  },

  // ---------------- 外交类 (3张) ----------------
  {
    id: 'peace_envoy',
    name: '遣使议和',
    category: 'diplomacy',
    tags: ['diplomacy'],
    personality: '唇枪舌剑 · 暂息干戈',
    description: '遣大员持节北出塞外，勘界定盟以止烽火。',
    baseCost: { treasury: -6, morale: 2, military: -2, court: 2 },
    targetApplicableTags: ['diplomacy', 'trade'],
    fallbackFlavor: '使节折冲樽俎，言辞坚毅，塞外可汗终收兵戈订立誓书。'
  },
  {
    id: 'peace_marriage',
    name: '和亲息战',
    category: 'diplomacy',
    tags: ['diplomacy', 'prestige'],
    personality: '割舍威严 · 忍辱偷安',
    description: '封宗女为公主出降单于，辅以岁币厚赐换取安宁。',
    baseCost: { treasury: -8, morale: -6, military: 0, court: -2 },
    targetApplicableTags: ['diplomacy', 'prestige'],
    fallbackFlavor: '翠华北去泪染边草，塞外虽止金鼓，朝臣皆低首叹息。'
  },
  {
    id: 'open_border_market',
    name: '开放互市',
    category: 'diplomacy',
    tags: ['trade', 'diplomacy'],
    personality: '以商止战 · 化敌为客',
    description: '在长城关隘开设茶马互市榷场，互通有无。',
    baseCost: { treasury: 6, morale: 4, military: 0, court: 1 },
    targetApplicableTags: ['trade', 'diplomacy'],
    fallbackFlavor: '榷场互市开市，胡客汉商摩肩接踵，烽烟隐于驼铃声中。'
  },

  // ---------------- 政治类 (5张) ----------------
  {
    id: 'rectify_governance',
    name: '整顿吏治',
    category: 'politics',
    tags: ['reform', 'purge'],
    personality: '明察激浊 · 触逆群僚',
    description: '巡抚各司考察庶官，罢免庸懦贪墨者数以百计。',
    baseCost: { treasury: 4, morale: 8, military: 0, court: -3 },
    targetApplicableTags: ['reform', 'purge'],
    fallbackFlavor: '风宪大动纠弹不法，百僚战栗，清明之风渐复于中枢。'
  },
  {
    id: 'reward_officials',
    name: '封赏群臣',
    category: 'politics',
    tags: ['prestige', 'finance'],
    personality: '金帛买心 · 虚糜太仓',
    description: '厚赐朝野公卿内廷金帛官爵，笼络人心。',
    baseCost: { treasury: -12, morale: -2, military: 0, court: 12 },
    targetApplicableTags: ['prestige', 'reform'],
    fallbackFlavor: '金帛赐下百官称万岁，权臣公卿暂敛锋芒，廷争稍息。'
  },
  {
    id: 'covert_demotion',
    name: '明升暗降',
    category: 'politics',
    tags: ['reform', 'diplomacy'],
    personality: '虚尊散阶 · 阴夺其柄',
    description: '进封重臣三公太傅之崇号，密转枢要实柄于心腹。',
    baseCost: { treasury: -4, morale: 2, military: 0, court: 8 },
    targetApplicableTags: ['reform', 'diplomacy'],
    fallbackFlavor: '尊号荣加而实权潜移，权要虽知其意亦无可如何，朝局风平浪静。'
  },
  {
    id: 'curb_warlords',
    name: '下旨削藩',
    category: 'politics',
    tags: ['force', 'military', 'reform'],
    personality: '干戈逼降 · 生死豪赌',
    description: '收藩镇节度将领兵印，令其交割部伍入京述职。',
    baseCost: { treasury: -6, morale: 0, military: 2, court: 14 },
    targetApplicableTags: ['force', 'military'],
    fallbackFlavor: '中旨严切逼令解甲，骄将错愕不敢拒命，中央帅权大定。'
  },
  {
    id: 'capital_purge',
    name: '大索京师',
    category: 'politics',
    tags: ['purge', 'force'],
    personality: '雷霆断狱 · 人心惶骇',
    description: '缇骑连夜围封九门，雷厉搜捕异己下诏狱审问。',
    baseCost: { treasury: 6, morale: -14, military: 0, court: 18 },
    targetApplicableTags: ['purge', 'force'],
    fallbackFlavor: '京门夜闭铁锁琅铛，逆党悉数伏诛，天威凛凛而民心震恐。'
  }
];
