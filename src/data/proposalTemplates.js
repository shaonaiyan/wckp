// 《一朝天子》Prototype 0.3 御前奏折与皇权诏令库 (Proposal Templates)
// 代表每季度送到皇帝御案前能亲自过问决断的事项

export const PROPOSAL_TEMPLATES = [
  // ================== 【主动奏请 (人物主动递交)】 ==================
  {
    id: 'petition_han_ce_reinforce',
    sourceCharacterId: 'han_ce',
    sourceDepartment: '兵部 · 镇北大将军韩策奏',
    type: 'petition',
    title: '【请增北军三万】',
    description: '塞外风云变幻，乞调关内精壮并给发新制鸟铳火器，充实大同塞防。',
    visibleConsequences: '北境边备大大增强；国库需发百万银饷；韩策麾下兵力更加雄厚。',
    hiddenHooks: ['han_ce_reinforced'],
    persistence: 'urgent',
    conditions: (world) => {
      const han = world.characterManager.get('han_ce');
      return han && han.alive && han.region === 'north';
    },
    execute: (world) => {
      world.macroStats.treasury -= 10;
      world.regions.north.order += 15;
      world.regions.north.pressure = Math.max(5, world.regions.north.pressure - 15);
      const han = world.characterManager.get('han_ce');
      if (han) {
        han.influence += 8;
        han.addMemory(world.turn, '帝准增兵三万之请，恩遇备隆', 8);
        han.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 奉准增募北军精锐三万，军威益盛。`);
      }
      return '准奏。诏拨内帑与户部饷银，大扩北军，边防顿固。';
    }
  },
  {
    id: 'petition_shen_ke_reform',
    sourceCharacterId: 'shen_ke',
    sourceDepartment: '户部 · 沈恪具折',
    type: 'petition',
    title: '【请行均田清丈法令】',
    description: '臣痛见豪强蚕食民亩、诡寄丁税，乞降严旨清丈田亩，一准实产科赋。',
    visibleConsequences: '清查豪族隐田，长远增益国课；然必遭江左与中原缙绅世族怨望。',
    hiddenHooks: ['shen_ke_reform_enacted'],
    persistence: 'persistent',
    conditions: (world) => {
      const shen = world.characterManager.get('shen_ke');
      return shen && shen.alive && !world.causalHookManager.has('shen_ke_reform_enacted');
    },
    execute: (world) => {
      world.macroStats.livelihood += 8;
      world.factions.gentry.influence -= 12;
      const shen = world.characterManager.get('shen_ke');
      if (shen) {
        shen.influence += 10;
        shen.addMemory(world.turn, '帝断然力准清丈，以天下社稷托付', 9);
        shen.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 奉旨主持清丈隐田，变法全面启行。`);
      }
      world.threadManager.startThread('local_reform_shen', { actor: 'shen_ke' });
      return '朱批照准。颁敕清丈天下隐田，豪族虽怨，天下寒素为之一振。';
    }
  },
  {
    id: 'petition_gu_yuan_sea_trade',
    sourceCharacterId: 'gu_yuan',
    sourceDepartment: '市舶司 · 巨贾顾源奏',
    type: 'petition',
    title: '【请弛海禁通达外洋】',
    description: '南洋番舶数千云集泉浙，乞撤除巡海厉禁，凡纳关银者一体许其贸易。',
    visibleConsequences: '东南商贸大通，关税日进斗金；然商贾海寇势力亦随之膨胀。',
    hiddenHooks: ['open_sea_trade'],
    persistence: 'persistent',
    conditions: (world) => {
      const gu = world.characterManager.get('gu_yuan');
      return gu && gu.alive && !world.causalHookManager.has('open_sea_trade');
    },
    execute: (world) => {
      world.macroStats.treasury += 14;
      world.regions.south.prosperity += 15;
      world.factions.merchants.influence += 16;
      const gu = world.characterManager.get('gu_yuan');
      if (gu) {
        gu.influence += 12;
        gu.addMemory(world.turn, '帝准通海之请，顾氏基业自此大昌', 8);
        gu.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 奉旨在两浙督办市舶，海利大通。`);
      }
      world.threadManager.startThread('sea_trade_merchant_rise', { actor: 'gu_yuan' });
      return '准奏。撤弛海禁，万艘巨舶泛洋，东南关课日入千金。';
    }
  },
  {
    id: 'petition_pei_jian_impeach',
    sourceCharacterId: 'pei_jian',
    sourceDepartment: '都察院 · 裴简直陈',
    type: 'petition',
    title: '【参劾内臣外官通赂】',
    description: '臣风闻巡盐使与中官表里为奸，私通重贿，乞降天断交付诏狱深勘。',
    visibleConsequences: '震慑官场贪墨之风；严厉打击内廷声势；或惹怒宫中近幸。',
    hiddenHooks: ['strict_anticorruption'],
    persistence: 'urgent',
    conditions: (world) => {
      const pei = world.characterManager.get('pei_jian');
      return pei && pei.alive;
    },
    execute: (world) => {
      world.macroStats.authority += 8;
      world.factions.palace.influence -= 12;
      const pei = world.characterManager.get('pei_jian');
      if (pei) {
        pei.influence += 8;
        pei.addMemory(world.turn, '直言弹劾伏阙蒙准，天下叹伏风节', 8);
        pei.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 疏劾权门不法，名动公卿。`);
      }
      return '准奏。诏捕贪渎官弁下诏狱，朝野风肃，士气大励。';
    }
  },
  {
    id: 'petition_wei_su_frugal',
    sourceCharacterId: 'wei_su',
    sourceDepartment: '内阁 · 首辅魏肃疏',
    type: 'petition',
    title: '【陈请停罢杂役慎守持重】',
    description: '近岁土木劳费渐起，臣请裁削织造别办杂项，节用爱人，遵崇先王节俭之训。',
    visibleConsequences: '国帑开支大为收束；民间差役顿减；帝王少许游宴营造之乐。',
    hiddenHooks: ['austere_policy'],
    persistence: 'persistent',
    conditions: (world) => {
      const wei = world.characterManager.get('wei_su');
      return wei && wei.alive;
    },
    execute: (world) => {
      world.macroStats.treasury += 8;
      world.macroStats.livelihood += 6;
      const wei = world.characterManager.get('wei_su');
      if (wei) {
        wei.influence += 6;
        wei.addMemory(world.turn, '帝从老臣忠言，省徭节俭', 7);
      }
      return '温旨照准。停罢各路额外进贡与工役，海内称天子恭俭。';
    }
  },
  {
    id: 'petition_wang_cheng_palace',
    sourceCharacterId: 'wang_cheng',
    sourceDepartment: '司礼监 · 汪成密奏',
    type: 'petition',
    title: '【请拓西苑神仙殿宇】',
    description: '万寿延年当崇祀典，乞发内库羡银并征派工匠，修葺西苑真武宝殿。',
    visibleConsequences: '满足帝王清修幽憩之好；内廷权重上升；耗费帑金数十万。',
    hiddenHooks: ['palace_construction_started'],
    persistence: 'personal',
    conditions: (world) => {
      const wang = world.characterManager.get('wang_cheng');
      return wang && wang.alive && !world.causalHookManager.has('palace_construction_started');
    },
    execute: (world) => {
      world.macroStats.treasury -= 12;
      world.factions.palace.influence += 14;
      const wang = world.characterManager.get('wang_cheng');
      if (wang) {
        wang.influence += 8;
        wang.addMemory(world.turn, '奉旨总领内廷大营建，圣眷优渥', 7);
      }
      world.threadManager.startThread('emperor_personal_pursuit');
      return '依奏。令司礼监督工赶造西苑瑶台，日夕香火祷祝。';
    }
  },

  // ================== 【天下机会 (世界局势催生)】 ==================
  {
    id: 'opp_foster_second_prince',
    sourceCharacterId: null,
    sourceDepartment: '鸿胪寺 · 外交奏闻',
    type: 'opportunity',
    title: '【收留乌桓二王子呼延朔】',
    description: '呼延朔穷蹙投附，可给其器械甲仗，居之河套，以收藩篱以番攻番之效。',
    visibleConsequences: '招抚北塞异邦贵胄；引得乌桓大可汗阿史那浑仇视。',
    hiddenHooks: ['foster_steppe_vassal'],
    persistence: 'urgent',
    conditions: (world) => {
      return world.threadManager.hasActiveThread('north_steppe_crisis');
    },
    execute: (world) => {
      world.threadManager.advanceThread('north_steppe_crisis', 4);
      return '允准。赐呼延朔银印朱绶，许其在关外招聚旧部。';
    }
  },
  {
    id: 'opp_famine_relief_grain',
    sourceCharacterId: null,
    sourceDepartment: '户部 · 常平司急奏',
    type: 'opportunity',
    title: '【趁江南丰稔大储常平仓】',
    description: '江左水稻大丰，米价极廉，请出官银三十万两广籴储仓，备异日水旱之虞。',
    visibleConsequences: '短期动支部分府库银钱；中原江南数载内遇灾不荒。',
    hiddenHooks: ['granaries_full'],
    persistence: 'urgent',
    conditions: (world) => {
      return world.regions.south.prosperity >= 65;
    },
    execute: (world) => {
      world.macroStats.treasury -= 8;
      world.macroStats.livelihood += 12;
      world.regions.central.prosperity += 8;
      return '照准。官买余粮二百万石充实中原常平仓，民心定固。';
    }
  },
  {
    id: 'opp_border_silk_market',
    sourceCharacterId: null,
    sourceDepartment: '安西都护府 · 西陲驿呈',
    type: 'opportunity',
    title: '【辟置玉门互市大榷】',
    description: '西域商驼如潮，请在玉门置互市大关，榷课锦绮珠玉，收西陲万国之赋。',
    visibleConsequences: '大增西陲商税；边防守备需防备西域蛮夷偷袭。',
    hiddenHooks: ['silk_market_opened'],
    persistence: 'persistent',
    conditions: (world) => {
      return world.regions.west.prosperity >= 50;
    },
    execute: (world) => {
      world.macroStats.treasury += 10;
      world.regions.west.prosperity += 15;
      return '准奏。敕设玉门互市，榷税充库，西陲汉胡同市，盛况空前。';
    }
  },

  // ================== 【人事与皇室决策】 ==================
  {
    id: 'royal_appoint_shen_tutor',
    sourceCharacterId: null,
    sourceDepartment: '吏部与礼部会奏',
    type: 'royal',
    title: '【任沈恪为皇太子少傅】',
    description: '储君受业需经邦硕彦，沈恪刚方务实，堪为东宫师表传道授业。',
    visibleConsequences: '储君治学深受沈恪变法思想影响；沈恪地位愈加尊崇不可动摇。',
    hiddenHooks: ['appoint_shen_ke_tutor'],
    persistence: 'urgent',
    conditions: (world) => {
      const heir = world.royalFamily.getHeir();
      const shen = world.characterManager.get('shen_ke');
      return heir && heir.alive && heir.age >= 6 && !heir.tutor && shen && shen.alive;
    },
    execute: (world) => {
      const heir = world.royalFamily.getHeir();
      heir.tutor = '沈恪';
      heir.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 拜沈恪为东宫师，学尚实干。`);
      const shen = world.characterManager.get('shen_ke');
      if (shen) {
        shen.influence += 12;
        shen.addMemory(world.turn, '受任东宫少傅，得传平生所学于储君', 9);
      }
      world.characterManager.addRelationship('shen_ke', heir.id, 'mentor_student');
      return '特旨允准。命沈恪兼领少傅，日宿东宫端门讲经论政。';
    }
  },
  {
    id: 'royal_summon_han_ce_capital',
    sourceCharacterId: null,
    sourceDepartment: '内阁 · 密奏',
    type: 'royal',
    title: '【召大将韩策还京入阁】',
    description: '韩策北境威名过重，可加封参知政事回京辅弼，分其边塞实权。',
    visibleConsequences: '韩策离开边军；北境边镇将领易位；消除长期兵变风险。',
    hiddenHooks: ['summon_han_ce_capital'],
    persistence: 'persistent',
    conditions: (world) => {
      const han = world.characterManager.get('han_ce');
      return han && han.alive && han.region === 'north' && han.influence >= 65;
    },
    execute: (world) => {
      const han = world.characterManager.get('han_ce');
      if (han) {
        han.region = 'central';
        han.office = '枢密使 · 大学士';
        han.influence = Math.max(40, han.influence - 10);
        han.addMemory(world.turn, '奉诏还朝解兵权，心下悲凉知帝王防微杜渐', 8);
        han.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 奉召释兵权还朝入相。`);
      }
      world.threadManager.advanceThread('frontier_general_rise', 3);
      return '降密旨。加韩策参知政事还京，边务交副将石雄，不动声色弭平祸芽。';
    }
  },
  {
    id: 'royal_promote_young_general',
    sourceCharacterId: null,
    sourceDepartment: '兵部 · 选曹折',
    type: 'royal',
    title: '【擢升宿卫宿将石雄】',
    description: '折冲校尉石雄勇武忠谨，可擢为前军都督，分领宿卫京营兵柄。',
    visibleConsequences: '提拔忠心青年将校，制衡老将名门；石雄感恩图报。',
    hiddenHooks: ['promote_shi_xiong'],
    persistence: 'persistent',
    conditions: (world) => {
      const shi = world.characterManager.get('shi_xiong');
      return shi && shi.alive && shi.influence < 50;
    },
    execute: (world) => {
      world.characterManager.activateCharacter('shi_xiong');
      const shi = world.characterManager.get('shi_xiong');
      if (shi) {
        shi.office = '前军都督 · 殿前司';
        shi.influence += 20;
        shi.relationshipToEmperor = 'trusted';
        shi.addMemory(world.turn, '荷蒙天恩超擢提拔，誓以死报君父', 9);
      }
      return '特旨升石雄为前军都督，赐带御佩刀，宿卫宫禁严密。';
    }
  },
  {
    id: 'royal_marry_princess',
    sourceCharacterId: null,
    sourceDepartment: '宗人府 · 承旨',
    type: 'royal',
    title: '【赐婚皇女于重臣世族】',
    description: '长乐公主已届笄年，择选陈郡谢氏谢承礼长子尚主，以固朝野之谊。',
    visibleConsequences: '皇室与江左世族结为姻娅；朝中大臣关系更为融洽。',
    hiddenHooks: ['royal_marriage_gentry'],
    persistence: 'urgent',
    conditions: (world) => {
      const xie = world.characterManager.get('xie_chengli');
      return xie && xie.alive && !world.causalHookManager.has('royal_marriage_gentry');
    },
    execute: (world) => {
      world.factions.gentry.influence += 10;
      const xie = world.characterManager.get('xie_chengli');
      if (xie) {
        xie.influence += 12;
        xie.relationshipToEmperor = 'trusted';
        xie.addMemory(world.turn, '皇女下嫁谢氏，一门极荣，与皇室一体同休', 9);
      }
      return '允准。下旨降嫁皇女，谢氏入谢宫门，君臣骨肉同欢。';
    }
  },

  // ================== 【帝王日常与宏观诏令】 ==================
  {
    id: 'edict_general_amnesty',
    sourceCharacterId: null,
    sourceDepartment: '刑部 · 奉旨草诏',
    type: 'edict',
    title: '【颁布大赦诏书】',
    description: '祈天涤愆，除十恶逆伦外，天下死罪降等，徒流减等，宥免逋租。',
    visibleConsequences: '民心普遍欢欣悦服；然而州郡盗寇脱逃，治安短期下降。',
    hiddenHooks: ['general_amnesty_declared'],
    persistence: 'persistent',
    conditions: (world) => true,
    execute: (world) => {
      world.macroStats.livelihood += 10;
      world.macroStats.authority += 5;
      world.regions.central.order -= 8;
      world.regions.south.order -= 8;
      return '颁诏。大赦天下轻死徒流，四海囚徒向阙叩首，歌颂圣皇宽仁。';
    }
  },
  {
    id: 'edict_tax_relief',
    sourceCharacterId: null,
    sourceDepartment: '户部 · 奏议',
    type: 'edict',
    title: '【蠲免天下本色田赋三成】',
    description: '宽恤民生艰难，免除江淮中原今岁钱粮三成，与黎庶同休戚。',
    visibleConsequences: '国库短期赋入大减；民间休养生息，百姓爱戴皇德。',
    hiddenHooks: ['tax_relief_granted'],
    persistence: 'persistent',
    conditions: (world) => true,
    execute: (world) => {
      world.macroStats.treasury -= 14;
      world.macroStats.livelihood += 15;
      return '颁诏。诏蠲田赋三成，四民欣欣向荣，黎庶无啼饥号寒之叹。';
    }
  },
  {
    id: 'edict_hold_imperial_exam',
    sourceCharacterId: null,
    sourceDepartment: '礼部 · 贡院疏',
    type: 'edict',
    title: '【广开特科 · 取拔寒畯】',
    description: '特开恩科大选，敕令不论阀阅家世，只要通晓律历兵刑者一律拔擢。',
    visibleConsequences: '文官新锐辈出，打破世家垄断；世族老臣心生微怨。',
    hiddenHooks: ['imperial_exam_held'],
    persistence: 'persistent',
    conditions: (world) => true,
    execute: (world) => {
      world.macroStats.court += 10;
      world.factions.gentry.influence -= 10;
      world.factions.civil.influence += 12;
      return '准奏。贡院开锁试天下英才，金榜所列多为草泽名儒，士风大振。';
    }
  },
  {
    id: 'edict_southern_tour',
    sourceCharacterId: null,
    sourceDepartment: '礼部与太常寺',
    type: 'edict',
    title: '【御驾南巡阅看江淮】',
    description: '帝乘龙舟顺汴入淮，亲阅黄河大堤与江南水陆商市，抚问父老。',
    visibleConsequences: '皇权威势直达江左；亲查水利实情；舟师随从耗银巨万。',
    hiddenHooks: ['emperor_southern_tour'],
    persistence: 'personal',
    conditions: (world) => world.royalFamily.emperor.healthLevel >= 3,
    execute: (world) => {
      world.macroStats.treasury -= 12;
      world.macroStats.authority += 14;
      world.regions.south.order += 10;
      return '启程。旌旗蔽日南巡江表，父老遮道焚香迎跸，天威赫奕。';
    }
  },
  {
    id: 'edict_seek_immortality',
    sourceCharacterId: null,
    sourceDepartment: '太常寺 · 祠祭清吏司',
    type: 'edict',
    title: '【寻访名山道流 · 炼九转金丹】',
    description: '召华山、武当隐逸道士入内殿讲授吐纳还丹长生妙术，修内丹房。',
    visibleConsequences: '满足帝王追求长生之愿；耗费内库珍药；朝臣私相嗟叹。',
    hiddenHooks: ['emperor_alchemy_fused'],
    persistence: 'personal',
    conditions: (world) => world.royalFamily.emperor.age >= 40,
    execute: (world) => {
      world.macroStats.treasury -= 10;
      world.threadManager.startThread('emperor_personal_pursuit');
      return '准敕。辟道场筑丹炉，青烟腾绕，帝王意存遐举。';
    }
  },
  {
    id: 'edict_autumn_hunting',
    sourceCharacterId: null,
    sourceDepartment: '兵部 · 宿卫司',
    type: 'edict',
    title: '【木兰秋狝 · 讲武大典】',
    description: '亲领文武百官与禁卫六军出关大猎，扬威弓矢，校阅天下兵马。',
    visibleConsequences: '整肃禁军骑射威武；将士用命；犒赏士卒耗费部分库银。',
    hiddenHooks: ['imperial_autumn_hunt'],
    persistence: 'personal',
    conditions: (world) => world.royalFamily.emperor.healthLevel >= 3,
    execute: (world) => {
      world.macroStats.might += 12;
      world.macroStats.treasury -= 6;
      world.factions.military.influence += 8;
      return '御驾亲行。塞外角弓雷鸣，天子弯弧中雕，将士欢声动地。';
    }
  },
  {
    id: 'edict_audit_officials',
    sourceCharacterId: null,
    sourceDepartment: '都察院 · 考功司',
    type: 'edict',
    title: '【综核名实 · 京察大计】',
    description: '严加考校在京在野庶僚，贪婪软弱者一概勒令休致，清退老朽。',
    visibleConsequences: '吏治大幅整肃清澄；落第失意官员多怨中枢苛察。',
    hiddenHooks: ['imperial_bureaucratic_audit'],
    persistence: 'persistent',
    conditions: (world) => true,
    execute: (world) => {
      world.macroStats.court += 14;
      world.macroStats.authority += 8;
      return '降旨。考功严切，黜退不职杂流数百员，百司望风悚惧。';
    }
  }
];
