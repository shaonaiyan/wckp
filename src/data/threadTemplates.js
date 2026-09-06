// 《一朝天子》Prototype 0.3 故事线程模板库 (Story Thread Templates)
// 8大核心连续故事线程，杜绝孤立碎片化随机事件

export const THREAD_TEMPLATES = {
  // 线程 A: 北境新王
  north_steppe_crisis: {
    id: 'north_steppe_crisis',
    name: '北境易主与争雄',
    category: 'realm',
    region: 'north',
    description: '塞外乌桓老王暴卒，幼弟与长兄争立王庭，边境阴云骤起。',
    stages: {
      1: {
        title: '老王暴卒 · 诸子争位',
        desc: '老王暴毙，长子阿史那浑占王庭，二子呼延朔率残部奔逃，边关哨骑频传异动。',
        transitions: [
          { nextStage: 2, weight: 60, condition: 'natural', event: 'steppe_civil_war' },
          { nextStage: 4, weight: 40, condition: 'second_prince_flees', event: 'second_prince_refuge' }
        ]
      },
      2: {
        title: '长子兼并 · 兵锋渐盛',
        desc: '阿史那浑兼并东部各帐，自称突苾大可汗，遣使入塞索要岁币与盐铁。',
        transitions: [
          { nextStage: 3, weight: 50, condition: 'war_risk', event: 'steppe_border_raid' },
          { nextStage: 5, weight: 50, condition: 'peace_risk', event: 'steppe_market_truce' }
        ]
      },
      3: {
        title: '烽烟骤起 · 大举入塞',
        desc: '胡骑数万长驱破塞，边将韩策拔剑誓师，北境进入血战。',
        transitions: [
          { nextStage: 6, weight: 70, condition: 'han_ce_victory', event: 'han_ce_crushes_steppe' },
          { nextStage: 7, weight: 30, condition: 'border_stalemate', event: 'border_bloody_winter' }
        ]
      },
      4: {
        title: '二子款塞 · 求援中原',
        desc: '呼延朔单骑扣关，誓以西帐臣服中原为质，乞求借兵复仇。',
        transitions: [
          { nextStage: 3, weight: 60, condition: 'refuse_or_attack', event: 'steppe_border_raid' },
          { nextStage: 5, weight: 40, condition: 'foster_prince', event: 'foster_steppe_vassal' }
        ]
      },
      5: {
        title: '北疆互市 · 羁縻粗安',
        desc: '边市大开，番汉互易牛马茶绢，北境暂获数载清宁。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'steppe_peace_cemented' }
        ]
      },
      6: {
        title: '封狼居胥 · 威震大漠',
        desc: '胡骑北遁千里，阿史那浑仅以身免，边镇将士威风凛凛。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'steppe_pacified' }
        ]
      },
      7: {
        title: '关塞苦战 · 伤亡枕藉',
        desc: '边关虽未破，连年转输已耗费民脂万千。',
        transitions: [
          { nextStage: 5, weight: 100, event: 'border_weary_peace' }
        ]
      }
    }
  },

  // 线程 B: 边将崛起
  frontier_general_rise: {
    id: 'frontier_general_rise',
    name: '边将韩策崛起',
    category: 'court',
    region: 'north',
    description: '韩策军功赫赫，门生旧部遍布边镇，朝中清流渐起忌惮。',
    stages: {
      1: {
        title: '立功受赏 · 边镇推尊',
        desc: '韩策数次挫败胡骑，军中唯知大将军令旗，边关武弁多出其门下。',
        transitions: [
          { nextStage: 2, weight: 70, event: 'han_ce_requests_funds' }
        ]
      },
      2: {
        title: '将骄兵悍 · 朝士侧目',
        desc: '韩策奏请加领三镇节度，言官御史裴简等上疏痛陈尾大不掉之患。',
        transitions: [
          { nextStage: 3, weight: 50, event: 'han_ce_dispute_court' },
          { nextStage: 4, weight: 50, event: 'han_ce_loyal_defense' }
        ]
      },
      3: {
        title: '召回入京 · 兵权之争',
        desc: '帝诏韩策回京入阁任枢密，其部属石雄等暗中惶惑不宁。',
        transitions: [
          { nextStage: 5, weight: 60, event: 'han_ce_takes_office_calm' },
          { nextStage: 6, weight: 40, event: 'border_troops_unrest' }
        ]
      },
      4: {
        title: '柱国重臣 · 勋戚一体',
        desc: '朝廷推心置腹，加封韩策上柱国，与皇室结好，边军成社稷干城。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'han_ce_pillar_of_state' }
        ]
      },
      5: {
        title: '垂老入枢 · 兵权平稳',
        desc: '韩策留京参政，边军实权还归兵部，避免藩镇跋扈之祸。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'han_ce_peaceful_retirement' }
        ]
      },
      6: {
        title: '边将离心 · 骄兵难制',
        desc: '北境部将生怨，边陲粮饷暗有克扣，军心浮动。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'han_ce_border_rift' }
        ]
      }
    }
  },

  // 线程 C: 地方改革 (沈恪清丈)
  local_reform_shen: {
    id: 'local_reform_shen',
    name: '沈恪均田清赋',
    category: 'court',
    region: 'central',
    description: '沈恪力推清丈豪强隐田，触动江左与中原世族根本。',
    stages: {
      1: {
        title: '清丈田亩 · 豪强惊疑',
        desc: '沈恪在河东张贴榜文，强令豪右如实具报隐占田粮，士绅震恐。',
        transitions: [
          { nextStage: 2, weight: 65, event: 'gentry_resist_reform' },
          { nextStage: 3, weight: 35, event: 'local_peasants_cheer' }
        ]
      },
      2: {
        title: '京兆弹劾 · 朋党攻讦',
        desc: '谢承礼联合中原故旧，弹劾沈恪苛政敛怨、残虐士林。',
        transitions: [
          { nextStage: 4, weight: 50, event: 'emperor_backs_shen' },
          { nextStage: 5, weight: 50, event: 'shen_ke_suspended' }
        ]
      },
      3: {
        title: '均赋成效 · 仓廪日实',
        desc: '河东赋税大增三成，流民归农，沈恪清名震动京师。',
        transitions: [
          { nextStage: 4, weight: 100, event: 'shen_promoted_central' }
        ]
      },
      4: {
        title: '入阁拜相 · 新政大行',
        desc: '沈恪奉诏入中枢主管度支，天下均赋新法全面推行。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'shen_reform_success' }
        ]
      },
      5: {
        title: '罢官外放 · 宿怨难解',
        desc: '沈恪受挫黜官，江南豪族额手称庆，赋税积弊依然如故。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'shen_reform_aborted' }
        ]
      }
    }
  },

  // 线程 D: 海贸与商人崛起
  sea_trade_merchant_rise: {
    id: 'sea_trade_merchant_rise',
    name: '海舶通商与顾氏金山',
    category: 'realm',
    region: 'south',
    description: '江南通海互市，顾源货殖通神，日进斗金，商贾渐涉政柄。',
    stages: {
      1: {
        title: '开海通商 · 舶客交驰',
        desc: '两浙开洋，巨舰扬帆远航南洋，顾源承揽市舶专市。',
        transitions: [
          { nextStage: 2, weight: 70, event: 'gu_yuan_donates_millions' }
        ]
      },
      2: {
        title: '巨资献帑 · 祈求盐引',
        desc: '顾源献万金助修国用，顺势奏请内廷给赐两淮两浙盐引独榷之权。',
        transitions: [
          { nextStage: 3, weight: 50, event: 'salt_monopoly_granted' },
          { nextStage: 4, weight: 50, event: 'merchant_gentry_intermarry' }
        ]
      },
      3: {
        title: '财赋巨擘 · 尾大不掉',
        desc: '商帮富可敌国，操纵东南物价，朝廷每年大半饷银需仰顾氏调停。',
        transitions: [
          { nextStage: 5, weight: 60, event: 'merchant_court_dependence' }
        ]
      },
      4: {
        title: '士商合流 · 江表重阀',
        desc: '顾氏与谢氏连姻，金穴联手门阀，东南政风大为一变。',
        transitions: [
          { nextStage: 5, weight: 100, event: 'gentry_merchant_coalition' }
        ]
      },
      5: {
        title: '东南柱石 · 赋源安稳',
        desc: '海商正式成为朝廷财政命脉，海防与府库两皆充盈。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'trade_prosperity_perpetual' }
        ]
      }
    }
  },

  // 线程 E: 储君成长
  heir_growth_destiny: {
    id: 'heir_growth_destiny',
    name: '东宫储嗣经略',
    category: 'palace',
    region: 'central',
    description: '储君受业读书，在严师与重臣之间日渐形成治道执念。',
    stages: {
      1: {
        title: '入阁启蒙 · 择求元良',
        desc: '皇太子年幼初入文华殿，文武重臣皆注目谁人当选东宫讲官。',
        transitions: [
          { nextStage: 2, weight: 50, event: 'prince_tutor_assigned' }
        ]
      },
      2: {
        title: '经筵受业 · 师徒论道',
        desc: '储君受师长熏陶，对天下大政初生己见，或尚法度，或崇德化。',
        transitions: [
          { nextStage: 3, weight: 60, event: 'prince_first_memorial' }
        ]
      },
      3: {
        title: '东宫议政 · 参决国事',
        desc: '太子年及弱冠，御前听政，百官渐趋东宫走动，隐现储党。',
        transitions: [
          { nextStage: 4, weight: 70, event: 'prince_matures_loyal' },
          { nextStage: 5, weight: 30, event: 'court_prince_rivalry' }
        ]
      },
      4: {
        title: '仁明英睿 · 储位磐石',
        desc: '储君威仪端肃，受海内人望归戴，社稷后继有其人。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'heir_ready_for_throne' }
        ]
      },
      5: {
        title: '储宫暗流 · 帝心微忌',
        desc: '东宫近侍与外廷结交渐密，帝王御前不无忧虞。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'heir_reconciled' }
        ]
      }
    }
  },

  // 线程 F: 朝堂党争
  court_factional_strife: {
    id: 'court_factional_strife',
    name: '台阁清浊党争',
    category: 'court',
    region: 'central',
    description: '变法派与旧党保守重臣势成水火，奏疏如雪，群臣交攻。',
    stages: {
      1: {
        title: '清议交锋 · 朝堂立派',
        desc: '御史言官与执政台臣因一事政见不合，彼此互参，渐成分垒。',
        transitions: [
          { nextStage: 2, weight: 70, event: 'mutual_impeachments_erupt' }
        ]
      },
      2: {
        title: '章奏互讦 · 百僚汹汹',
        desc: '六科十三道连篇累牍，政事迁延滞涩，六部几无暇料理民政。',
        transitions: [
          { nextStage: 3, weight: 50, event: 'emperor_intervenes_purge' },
          { nextStage: 4, weight: 50, event: 'faction_temporary_truce' }
        ]
      },
      3: {
        title: '朝堂更迭 · 一党独尊',
        desc: '帝断然下旨黜退一派领袖，朝局大定，然亦多有老臣心灰请归。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'court_clarified' }
        ]
      },
      4: {
        title: '各相让步 · 弥缝和局',
        desc: '在老辅臣周旋下，两派各自收敛锋芒，维持表面均势。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'court_balanced' }
        ]
      }
    }
  },

  // 线程 G: 灾害与名臣
  disaster_and_official: {
    id: 'disaster_and_official',
    name: '淮黄大水与循吏治平',
    category: 'realm',
    region: 'central',
    description: '黄淮暴水漂没州县，地方官或竭诚安民，或畏罪粉饰。',
    stages: {
      1: {
        title: '河决漫溢 · 郡邑成泽',
        desc: '夏秋淫雨，黄淮堤溃，数十万百姓失所，地方官巡抚急报求赈。',
        transitions: [
          { nextStage: 2, weight: 60, event: 'official_opens_granaries' },
          { nextStage: 3, weight: 40, event: 'corrupt_official_delays' }
        ]
      },
      2: {
        title: '开仓筑堤 · 万姓生全',
        desc: '地方官范廷玉等未奉明诏断然开太仓赈民，募集丁壮冒雨合龙，灾情大遏。',
        transitions: [
          { nextStage: 4, weight: 80, event: 'reclamation_harvest_bountiful' }
        ]
      },
      3: {
        title: '流民啸聚 · 官声狼藉',
        desc: '赈济不达，流民转徙，御史飞奏弹劾地方吏胥贪墨。',
        transitions: [
          { nextStage: 5, weight: 100, event: 'court_sends_investigator' }
        ]
      },
      4: {
        title: '万民万伞 · 入京拜阶',
        desc: '淮黄大定，百姓立生祠颂德，巡抚以治行第一擢升入京。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'disaster_pacified_hero' }
        ]
      },
      5: {
        title: '严旨拿办 · 官场震肃',
        desc: '朝廷按律问罪贪吏，发内帑拨粮再赈，中原民怨渐平。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'disaster_settled_harsh' }
        ]
      }
    }
  },

  // 线程 H: 帝王个人兴趣 (宫苑求仙)
  emperor_personal_pursuit: {
    id: 'emperor_personal_pursuit',
    name: '西苑长生与广厦之思',
    category: 'palace',
    region: 'central',
    description: '帝王好神仙方术与营建土木，内侍方士纷至沓来，史官秉笔暗记。',
    stages: {
      1: {
        title: '山人进药 · 灵符初呈',
        desc: '方外道士受内侍引见，进长生金丹与青词妙典，帝意甚悦。',
        transitions: [
          { nextStage: 2, weight: 60, event: 'construct_celestial_palace' },
          { nextStage: 3, weight: 40, event: 'austere_minister_remonstrates' }
        ]
      },
      2: {
        title: '飞阁连云 · 醮事夜达',
        desc: '西苑大宫殿日夜营修，香烟袅袅，耗银巨万，朝臣私下多有非议。',
        transitions: [
          { nextStage: 4, weight: 70, event: 'emperor_health_fused' }
        ]
      },
      3: {
        title: '谏官叩阙 · 焚烧药炉',
        desc: '裴简披麻上疏乞斩方士，帝感其忠谨，斥退方人，西苑遂废。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'emperor_pursuit_abandoned' }
        ]
      },
      4: {
        title: '金石反噬 · 圣体沉疴',
        desc: '金丹火燥，帝王起居失和，晚年渐有眩晕之疾，天下引为明鉴。',
        transitions: [
          { nextStage: 'resolved', weight: 100, event: 'emperor_pursuit_consequence' }
        ]
      }
    }
  }
};
