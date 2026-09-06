// Prototype 0.2 核心局势定义 (12种核心局势 + 危机演变)
// 包含三阶段压力系统 (●○○ -> ●●○ -> ●●●)，放任离散后果，以及机会局势
export const SITUATIONS = [
  // ---------------- 负面局势 (10种) ----------------
  {
    id: 'northern_incursion',
    name: '北境犯边',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '胡骑犯关寇掠雁门云中，烽燧昼夜不绝。',
    applicableTags: ['military', 'diplomacy', 'trade', 'finance'],
    directionHints: ['⚔ 武备强攻', '🤝 遣使议和', '⇄ 开设互市', '💰 筹集军费'],
    stageProfiles: {
      1: { name: '游骑扰边', desc: '塞外部落数千游骑袭扰关城，小掠而去。' },
      2: { name: '边关失守', desc: '胡虏大队突破雁门三座要隘烽堡，关内告急。' },
      3: { name: '大战将起', desc: '单于倾部南下营寨百里，大战一触即发！' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { military: -5, morale: -2 },
        headline: '北境失利',
        historyText: '朝廷未加干预，胡骑连陷雁门三座烽堡，边关失守。'
      },
      toStage3: {
        statDelta: { military: -8, treasury: -6, morale: -4 },
        headline: '胡骑长驱',
        historyText: '边备废弛，边军连战连溃，数县膏腴之地沦陷。'
      },
      onExceed: {
        escalateTo: 'border_war',
        statDelta: { military: -10, treasury: -10, morale: -6 },
        headline: '全面边战爆发！',
        historyText: '屡误边事，胡虏终破长城天险，引发全国大乱！'
      }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => ['northern_incursion', 'border_war'].includes(s.id))) return false;
      const base = state.military < 45 ? 0.35 : 0.15;
      return prng.nextFloat() < base;
    }
  },

  {
    id: 'yellow_river_flood',
    name: '黄河水患',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '伏汛秋汛并发，浑黄狂澜激荡大堤，沿河官民危惧。',
    applicableTags: ['relief', 'construction', 'force', 'finance'],
    directionHints: ['🌾 开仓放粮', '🧱 兴修水利', '🛠 征发民夫', '💰 调拨帑银'],
    stageProfiles: {
      1: { name: '河水暴涨', desc: '大河水位陡涨漫过月堤，水势湍急。' },
      2: { name: '大堤决口', desc: '河决漂没数州庐舍良田，数万饥民露宿河滩。' },
      3: { name: '流民狂潮', desc: '泛区延袤千里赤地无收，流民裹挟四出。' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { morale: -6, treasury: -4 },
        headline: '黄河大堤决口',
        historyText: '河防溃决，浊流淹浸千里沃野，数州皆成泽国。'
      },
      toStage3: {
        statDelta: { morale: -10, treasury: -6 },
        headline: '水患演为大灾',
        historyText: '灾情失控，流民如蚁聚啸，中原腹地民不聊生。'
      },
      onExceed: {
        escalateTo: 'rising_discontent',
        statDelta: { morale: -12, court: -6 },
        headline: '饥民起事！',
        historyText: '水灾无救，流亡饥民相率铤而走险，激起四野民怨。'
      }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => s.id === 'yellow_river_flood')) return false;
      return prng.nextFloat() < 0.2;
    }
  },

  {
    id: 'land_annexation',
    name: '土地兼并',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '富室豪家买尽膏腴，失地流氓渐失生计，税源大损。',
    applicableTags: ['relief', 'reform', 'trade', 'force'],
    directionHints: ['⚖ 清丈抑兼并', '🌾 宽免租赋', '📜 劝农开荒', '⚡ 强力收缴'],
    stageProfiles: {
      1: { name: '豪强兼夺', desc: '官绅隐庇私田，巧立名目勒购平民良田。' },
      2: { name: '贫户流徙', desc: '自耕农大批破产为佃，郡县赋税大幅削减。' },
      3: { name: '田连阡陌', desc: '豪族隐户百万，失地流民相聚草泽，隐患已深。' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { morale: -4, treasury: -4 },
        headline: '民田多遭吞并',
        historyText: '兼并之风大盛，自耕农沦为佃仆，太仓粮赋漏失日甚。'
      },
      toStage3: {
        statDelta: { morale: -8, court: -4 },
        headline: '豪家跨州连郡',
        historyText: '地方世家大族擅权欺罔，民田尽去，贫民怨声载道。'
      },
      onExceed: {
        escalateTo: 'rising_discontent',
        statDelta: { morale: -10, court: -6 },
        headline: '失地民乱！',
        historyText: '失地破产流民忍无可忍，终于爆发暴乱。'
      }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => s.id === 'land_annexation')) return false;
      return prng.nextFloat() < 0.16;
    }
  },

  {
    id: 'corrupt_minister',
    name: '权臣坐大',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '辅政柄政大僚门生广布，章奏多留中擅决，威柄下移。',
    applicableTags: ['reform', 'diplomacy', 'prestige', 'purge'],
    directionHints: ['📜 明升暗降', '⚡ 下诏查抄', '🎖 金帛安抚', '🗡 大索京师'],
    stageProfiles: {
      1: { name: '朋党渐结', desc: '六部庶僚多出其门，相权隐隐凌驾百辟。' },
      2: { name: '政令自操', desc: '朝廷诏敕皆先经私门商定，言官钳口不敢奏。' },
      3: { name: '乾纲受制', desc: '枢密实权尽在其手，内侍外戚通连，皇权岌岌可危！' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { court: -6, morale: -2 },
        headline: '权要擅权欺罔',
        historyText: '未抑私党，权相广结死党，政由相府出，天子垂拱而已。'
      },
      toStage3: {
        statDelta: { court: -10, treasury: -4 },
        headline: '朝局尽操其手',
        historyText: '群臣视权臣脸色行事，公私税课多饱私囊，天威荡然。'
      },
      onExceed: {
        escalateTo: 'court_intrigue',
        statDelta: { court: -14, morale: -6 },
        headline: '宫廷大变爆发！',
        historyText: '权臣密结内侍矫旨作乱，紫禁城内杀气潜伏！'
      }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => ['corrupt_minister', 'court_intrigue'].includes(s.id))) return false;
      return state.court < 42 && prng.nextFloat() < 0.28;
    }
  },

  {
    id: 'empty_treasury',
    name: '国库吃紧',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '帑银日渐干涸，度支百计挪借，各部用费捉襟见肘。',
    applicableTags: ['finance', 'trade', 'purge', 'reform'],
    directionHints: ['💰 加征赋税', '⛵ 开海榷税', '⚡ 抄没贪腐', '📜 裁军省费'],
    stageProfiles: {
      1: { name: '度支告紧', desc: '户部存银日绌，百官年例常例开始短欠。' },
      2: { name: '支借无门', desc: '工部行伍饷银久压未发，借贷利息山积。' },
      3: { name: '太仓告罄', desc: '太仓存银见底，一应官务大政陷于停滞！' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { court: -4, military: -3 },
        headline: '欠款积压日深',
        historyText: '朝廷度支无解，官员行粮月例积欠，中枢信誉大受摧抑。'
      },
      toStage3: {
        statDelta: { military: -8, court: -6, morale: -4 },
        headline: '百工经费断绝',
        historyText: '度支彻底崩颓，官俸全无，连军备器械亦无银修缮。'
      },
      onExceed: {
        escalateTo: 'military_arrears',
        statDelta: { military: -10, morale: -6 },
        headline: '大欠军饷！',
        historyText: '国帑告罄无钱开拔，直接演变为三军哗噪欠饷！'
      }
    },
    spawnCondition: (state, activeSits) => {
      if (activeSits.some(s => ['empty_treasury', 'military_arrears'].includes(s.id))) return false;
      return state.treasury <= 32;
    }
  },

  {
    id: 'military_arrears',
    name: '军饷拖欠',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '边关与宿卫营垒半载未见足色饷银，将士按剑喧哗。',
    applicableTags: ['finance', 'military', 'force', 'purge'],
    directionHints: ['💰 筹款犒赏', '⚡ 借贷解急', '📜 裁减冗兵', '🎖 封赏军将'],
    stageProfiles: {
      1: { name: '饷银未给', desc: '塞外戍卒月粮短少，私下聚谋请饷。' },
      2: { name: '军营哗噪', desc: '京营与边镇士卒击鼓抗命，将弁压制不住。' },
      3: { name: '兵变在即', desc: '精锐列阵拔刀索饷，主将受挟，危急万分！' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { military: -6, morale: -3 },
        headline: '三军士气尽丧',
        historyText: '久欠军资，士卒按剑私议，防务废弛，烽燧不燃。'
      },
      toStage3: {
        statDelta: { military: -12, court: -6 },
        headline: '边塞兵心离乱',
        historyText: '欠饷已极，营中老卒哗变斩杀管饷文吏，局势险象环生。'
      },
      onExceed: {
        statDelta: { military: -15, court: -10 },
        headline: '悍卒哗变溃散！',
        historyText: '军饷终无着落，边军大溃破关，边防形同虚设！'
      }
    },
    spawnCondition: (state, activeSits) => {
      if (activeSits.some(s => s.id === 'military_arrears')) return false;
      return state.treasury < 30 && state.military > 48;
    }
  },

  {
    id: 'rising_discontent',
    name: '民怨四起',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '赋役繁重灾岁连绵，草泽百姓不堪诛求，四境揭竿隐伏。',
    applicableTags: ['relief', 'prestige', 'force', 'trade'],
    directionHints: ['🌾 开仓放粮', '📜 蠲免田赋', '🕊 大赦安抚', '⚡ 坚决清剿'],
    stageProfiles: {
      1: { name: '乡野怨声', desc: '流民聚集市井窃议，邪教妖人煽惑煽动。' },
      2: { name: '暴乱渐起', desc: '数县乱民聚众千人截杀官道，攻毁税卡。' },
      3: { name: '揭竿云聚', desc: '乱首称王分据要隘，从乱者日众，震动京畿！' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { morale: -8, court: -4 },
        headline: '民怨点燃烽火',
        historyText: '朝廷置若罔闻，饥民聚啸为盗破城劫狱，官军不能制。'
      },
      toStage3: {
        statDelta: { morale: -12, treasury: -6, court: -6 },
        headline: '民乱波及数府',
        historyText: '乱首裹挟数十万饥众席卷江淮，烽烟遍地。'
      },
      onExceed: {
        escalateTo: 'major_rebellion',
        statDelta: { morale: -16, court: -10, military: -8 },
        headline: '全国性大叛乱！',
        historyText: '民乱终于汇成狂潮，烽火逼近国都城下！'
      }
    },
    spawnCondition: (state, activeSits) => {
      if (activeSits.some(s => ['rising_discontent', 'major_rebellion'].includes(s.id))) return false;
      return state.morale <= 36;
    }
  },

  {
    id: 'bureaucratic_corruption',
    name: '吏治腐败',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '铨选贿赂公行，百司需索陋规，上下通同侵吞公款。',
    applicableTags: ['reform', 'purge', 'finance'],
    directionHints: ['📜 整饬考课', '⚡ 抄没严办', '🗡 大索京畿', '💰 清查税册'],
    stageProfiles: {
      1: { name: '部费陋规', desc: '下僚进奉门礼，公家账册虚增耗羡。' },
      2: { name: '贿买官爵', desc: '刺史县令皆纳金买缺，到任即敲骨吸髓。' },
      3: { name: '风宪荡然', desc: '贪墨结党牢不可破，御史不能纠，政令废格。' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { court: -5, treasury: -4 },
        headline: '贪风愈演愈烈',
        historyText: '未严惩贪官，部费行私蔚然成风，国计漏卮无可弥补。'
      },
      toStage3: {
        statDelta: { court: -8, morale: -6, treasury: -6 },
        headline: '吏治全面朽烂',
        historyText: '公道湮没，官逼民反，天下百姓视官差如豺虎。'
      },
      onExceed: {
        statDelta: { court: -12, morale: -8 },
        headline: '纪纲尽坏！',
        historyText: '中央威信荡然无存，四方守令皆图私利。'
      }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => s.id === 'bureaucratic_corruption')) return false;
      return state.court < 48 && prng.nextFloat() < 0.22;
    }
  },

  {
    id: 'warlord_buildup',
    name: '边将拥兵',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '节镇统兵大将蓄养牙兵死士万数，骄蹇拒命，尾大不掉。',
    applicableTags: ['force', 'reform', 'military', 'diplomacy'],
    directionHints: ['⚡ 严旨削藩', '📜 明升暗夺', '🤝 联姻抚慰', '🗡 伏甲诛灭'],
    stageProfiles: {
      1: { name: '牙将骄横', desc: '宿将广辟私幕，部将唯听大帅之命，不闻朝旨。' },
      2: { name: '自辟吏课', desc: '节镇截留关税，擅自任免州县，几同独立藩国。' },
      3: { name: '带甲称霸', desc: '拥兵十万坐观成败，朝廷稍加切责便按剑恫吓！' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { court: -6, military: 2 },
        headline: '藩镇割据成型',
        historyText: '朝廷迁延顾忌，边将截留地方赋税，羽翼日趋丰满。'
      },
      toStage3: {
        statDelta: { court: -10, military: 3 },
        headline: '大将抗命拒调',
        historyText: '中枢敕书被边将当庭撕毁，朝廷颜面扫地。'
      },
      onExceed: {
        escalateTo: 'border_war',
        statDelta: { court: -15, military: -10 },
        headline: '藩镇举兵作乱！',
        historyText: '节镇骄将举兵反叛，天下陷入藩镇割据血战！'
      }
    },
    spawnCondition: (state, activeSits) => {
      if (activeSits.some(s => s.id === 'warlord_buildup')) return false;
      return state.military >= 62 && state.court <= 40;
    }
  },

  {
    id: 'trade_route_blocked',
    name: '商路受阻',
    category: 'negative',
    initialStage: 1,
    maxStage: 3,
    description: '关陇茶马道与大运河多遭寇盗阻绝，南北百货流通大挫。',
    applicableTags: ['trade', 'military', 'diplomacy', 'finance'],
    directionHints: ['⇄ 开辟榷场', '⚔ 遣军平寇', '🤝 招安抚定', '💰 拨款浚通'],
    stageProfiles: {
      1: { name: '盗寇断道', desc: '江湖巨盗劫掠漕船商队，关津戒严。' },
      2: { name: '百货滞绝', desc: '南北商路几近断绝，粮盐贵如黄金，商税暴跌。' },
      3: { name: '关肆闭户', desc: '重镇市肆闭歇，流民失业，四方商贾望道裹足。' }
    },
    onNeglectConsequence: {
      toStage2: {
        statDelta: { treasury: -4, morale: -3 },
        headline: '商旅断绝物价腾涌',
        historyText: '官道无护，商旅裹足不前，京华物价腾踊，市面萧条。'
      },
      toStage3: {
        statDelta: { treasury: -8, morale: -6 },
        headline: '运河关道瘫痪',
        historyText: '南北漕运尽阻，关市颗粒无收，百货闭滞。'
      },
      onExceed: {
        statDelta: { treasury: -10, morale: -8 },
        headline: '经济几近崩颓！',
        historyText: '中枢度支尽为断流，地方财政陷于半瘫痪！'
      }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => s.id === 'trade_route_blocked')) return false;
      return prng.nextFloat() < 0.18;
    }
  },

  // ---------------- 机会局势 (2种绿色机会) ----------------
  {
    id: 'harvest_south',
    name: '江南丰收',
    category: 'opportunity',
    initialStage: 1,
    maxStage: 1,
    defaultDuration: 2, // 持续2季
    description: '两浙湖广稻花万顷，仓廪丰盈，乃抓紧治世生息之良机。',
    applicableTags: ['finance', 'relief', 'trade'],
    directionHints: ['💰 增收商税 (大获国帑)', '🌾 蠲免生息 (厚抚民心)', '🍚 平价储粮 (备荒防灾)'],
    stageProfiles: {
      1: { name: '万顷良田', desc: '稻禾连云，天下岁稔。' }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => s.id === 'harvest_south')) return false;
      const base = state.hasResidue && state.hasResidue('rest_and_recuperate') ? 0.35 : 0.15;
      return prng.nextFloat() < base;
    }
  },

  {
    id: 'thriving_sea_trade',
    name: '海贸兴起',
    category: 'opportunity',
    initialStage: 1,
    maxStage: 1,
    defaultDuration: 2,
    description: '西洋番舶云集广州泉州，香料象齿堆满货栈，财利大开。',
    applicableTags: ['trade', 'finance', 'force'],
    directionHints: ['⛵ 弛海拓殖 (长期利得)', '💰 抽分重税 (立得巨款)', '⚡ 闭关抑商 (稳固朝纲)'],
    stageProfiles: {
      1: { name: '千帆来朝', desc: '番邦货利丰厚，市舶提举日进千金。' }
    },
    spawnCondition: (state, activeSits, prng) => {
      if (activeSits.some(s => s.id === 'thriving_sea_trade')) return false;
      return state.treasury > 50 && prng.nextFloat() < 0.2;
    }
  },

  // ---------------- 重大危机 (演化终极产物) ----------------
  {
    id: 'border_war',
    name: '边境战争',
    category: 'crisis',
    initialStage: 2,
    maxStage: 3,
    description: '异族倾国大战全面爆发，十万重兵决战塞北，胜负系于社稷！',
    applicableTags: ['military', 'diplomacy', 'finance', 'force'],
    directionHints: ['⚔ 倾力死战', '🤝 屈辱媾和', '💰 筹饷死撑'],
    stageProfiles: {
      1: { name: '僵持对峙', desc: '双方连营数百里互有胜负。' },
      2: { name: '血战连天', desc: '三军浴血，每日糜耗太仓巨银，国力急剧透支！' },
      3: { name: '社稷危亡', desc: '京畿四面告警，敌军铁骑几薄九门！' }
    },
    onNeglectConsequence: {
      toStage3: {
        statDelta: { military: -12, treasury: -12, morale: -8 },
        headline: '前线大溃败！',
        historyText: '朝廷未发大军亦不议和，前线精锐被围歼尽，天下大震！'
      },
      onExceed: {
        statDelta: { military: -25, court: -25, morale: -25, treasury: -25 },
        headline: '宗庙蒙尘！',
        historyText: '塞外强敌破都而入，社稷沦亡！'
      }
    }
  },

  {
    id: 'major_rebellion',
    name: '大规模民变',
    category: 'crisis',
    initialStage: 2,
    maxStage: 3,
    description: '流贼百万揭竿席卷中原，攻州破府，社稷摇摇欲坠！',
    applicableTags: ['relief', 'force', 'prestige', 'purge'],
    directionHints: ['🌾 抚民赈饥', '⚔ 铁血围剿', '🕊 大赦遣散'],
    stageProfiles: {
      1: { name: '流贼成军', desc: '流寇立旗号设官职，攻拔多州府。' },
      2: { name: '席卷中原', desc: '官军屡战屡北，半壁江山尽失，道路阻绝。' },
      3: { name: '逼临京畿', desc: '大盗兵临城下，四方勤王难至！' }
    },
    onNeglectConsequence: {
      toStage3: {
        statDelta: { morale: -15, court: -12, treasury: -10 },
        headline: '叛军破关逼京',
        historyText: '官军不救，叛军席卷北上，中枢大震，满朝失色！'
      },
      onExceed: {
        statDelta: { morale: -30, court: -30, treasury: -25 },
        headline: '城门陷落！',
        historyText: '叛军突入大内，天命绝矣！'
      }
    }
  },

  {
    id: 'court_intrigue',
    name: '宫廷政争',
    category: 'crisis',
    initialStage: 2,
    maxStage: 3,
    description: '内廷外相密结党徒矫诏变乱，刀斧手隐伏宫闱，政变在即！',
    applicableTags: ['purge', 'force', 'reform'],
    directionHints: ['🗡 迅雷翦除', '📜 虚委妥协', '🎖 收买分化'],
    stageProfiles: {
      1: { name: '暗流密织', desc: '两宫太监通连内阁，宿卫将领暗怀异心。' },
      2: { name: '剑拔弩张', desc: '禁省宿卫换防，矫旨出入，天子近侍多遭换黜。' },
      3: { name: '逼宫在即', desc: '兵围紫禁城，迫天子禅位或诛戮忠良！' }
    },
    onNeglectConsequence: {
      toStage3: {
        statDelta: { court: -20, morale: -8 },
        headline: '逼宫大变！',
        historyText: '逆党擅改禁军印符封锁大内，朝臣皆束手待毙！'
      },
      onExceed: {
        statDelta: { court: -35, morale: -20 },
        headline: '皇位倾覆！',
        historyText: '权党矫诏弑君拥立幼傀，社稷易主！'
      }
    }
  }
];
