// 《一朝天子》Prototype 0.3 世界事件模板库 (World Event Templates)
// 包含 40+ 典型天下、朝堂与宫闱真实事件模板，全面驱动连续世界运转

export const EVENT_TEMPLATES = [
  // ====================== 【天下纪事 · 塞外与四方】 ======================
  {
    id: 'steppe_civil_war',
    category: 'realm',
    region: 'north',
    priority: 85,
    title: '乌桓内哄 · 狼烟夜起',
    newsTemplate: '【胡庭争锋】阿史那浑与呼延朔分立王庭交锋，数万骑驰猎瀚海，边境警讯频传。',
    chronicleTemplate: '乌桓诸部争位交兵，塞北震动。',
    execute: (world) => {
      world.regions.north.pressure += 10;
      return { headline: '胡庭争锋', text: '乌桓二王相争，败卒数十帐流入大同边关投降。' };
    }
  },
  {
    id: 'second_prince_refuge',
    category: 'realm',
    region: 'north',
    priority: 88,
    title: '乌桓王子扣关入塞',
    newsTemplate: '【质子扣关】呼延朔兵败仅率八百精骑遁至雁门关下，叩关愿入朝为质，乞中原给兵。',
    chronicleTemplate: '乌桓王子呼延朔入塞降款，求援天朝。',
    execute: (world) => {
      world.characterManager.activateCharacter('cang_tianba');
      return { headline: '质子扣关', text: '呼延朔解佩刀入关，自称西帐可汗臣仆，愿世世为朝廷守边。' };
    }
  },
  {
    id: 'steppe_border_raid',
    category: 'realm',
    region: 'north',
    priority: 92,
    title: '胡骑纵掠 · 边城告急',
    newsTemplate: '【边关告急】阿史那浑亲领铁骑叩长城，破三受降城，掳掠汉民牛羊，边将求援。',
    chronicleTemplate: '胡骑大掠云中，边民流离。',
    execute: (world) => {
      world.regions.north.order -= 15;
      world.regions.north.pressure += 15;
      return { headline: '边关告急', text: '大漠胡骑犯界，焚掠边堡，羽书一日三至。' };
    }
  },
  {
    id: 'steppe_market_truce',
    category: 'realm',
    region: 'north',
    priority: 78,
    title: '边堡纳款 · 盟誓罢兵',
    newsTemplate: '【北塞和亲】北疆使者献良马三千匹请开互市，南北罢兵，关塞烽燧暂息。',
    chronicleTemplate: '北虏修贡，边境罢兵开市。',
    execute: (world) => {
      world.regions.north.order += 15;
      world.regions.north.pressure = Math.max(10, world.regions.north.pressure - 20);
      return { headline: '北塞和亲', text: '关门大开互市，士卒解鞍牧马，塞北重归安宁。' };
    }
  },
  {
    id: 'han_ce_crushes_steppe',
    category: 'realm',
    region: 'north',
    priority: 96,
    title: '大将军韩策勒石燕然',
    newsTemplate: '【大捷告庙】大将军韩策出奇兵横绝大漠，斩虏首五千级，破虏王大营，捷奏传京。',
    chronicleTemplate: '大将军韩策大破乌桓，塞北肃清。',
    execute: (world) => {
      world.regions.north.pressure = 10;
      world.regions.north.order = 85;
      const han = world.characterManager.get('han_ce');
      if (han) {
        han.influence += 18;
        han.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 出奇兵大破虏营，威震大漠。`);
      }
      return { headline: '大捷告庙', text: '韩策飞骑传捷，捷书所至百官称贺，军声大振。' };
    }
  },
  {
    id: 'border_bloody_winter',
    category: 'realm',
    region: 'north',
    priority: 80,
    title: '严冬飞雪 · 边戍苦寒',
    newsTemplate: '【塞上苦寒】北疆大雪连月，胡汉兵戈相持不下，转输粮草道路冻阻，冻毙卒伍极多。',
    chronicleTemplate: '北疆大雪冰裂，边军转饷艰难。',
    execute: (world) => {
      world.macroStats.treasury -= 8;
      return { headline: '塞上苦寒', text: '大雪覆没边关，朝廷急发皮裘棉袍转饷前线。' };
    }
  },
  {
    id: 'steppe_pacified',
    category: 'realm',
    region: 'north',
    priority: 86,
    title: '大漠肃清 · 四海受抚',
    newsTemplate: '【瀚海平靖】阿史那浑远遁狼居胥山外，诸部尽遣质子入质京师，北境数十载无大患。',
    chronicleTemplate: '北境大定，胡尘顿消。',
    execute: (world) => {
      world.regions.north.pressure = 5;
      return { headline: '瀚海平靖', text: '北方塞外平定，烽火久熄，民乐其业。' };
    }
  },
  {
    id: 'foster_steppe_vassal',
    category: 'realm',
    region: 'north',
    priority: 84,
    title: '册封可汗 · 边塞藩屏',
    newsTemplate: '【册封羁縻】朝廷拜呼延朔为归义王、右贤王，分地河套，以藩卫中原边陲。',
    chronicleTemplate: '帝封呼延朔为王，以番御番。',
    execute: (world) => {
      world.regions.north.order += 12;
      return { headline: '册封羁縻', text: '二王子拜表谢恩，率众筑城受抚，为天朝北塞藩屏。' };
    }
  },
  {
    id: 'border_weary_peace',
    category: 'realm',
    region: 'north',
    priority: 75,
    title: '边防罢战 · 各收残卒',
    newsTemplate: '【疲兵罢战】关塞转输空乏，胡骑亦马毙粮尽，双方收兵罢战，边民暂获喘息。',
    chronicleTemplate: '塞防交战疲敝，各自罢兵。',
    execute: (world) => {
      world.regions.north.pressure = 30;
      return { headline: '疲兵罢战', text: '兵戈暂息，烽堠炊烟重起，然疮痍非数载难复。' };
    }
  },
  {
    id: 'jiangnan_bountiful_harvest',
    category: 'realm',
    region: 'south',
    priority: 70,
    title: '江南大熟 · 漕船如龙',
    newsTemplate: '【江南岁稔】两浙风调雨顺，苏湖熟而天下足，万艘漕运粮船泛淮入汴，太仓积粟。',
    chronicleTemplate: '江南大丰，漕米充牣太仓。',
    execute: (world) => {
      world.regions.south.prosperity += 12;
      world.macroStats.treasury += 8;
      world.macroStats.livelihood += 6;
      return { headline: '江南岁稔', text: '仓廪日满，百姓歌咏圣化，东南大定。' };
    }
  },
  {
    id: 'jiangnan_salt_smuggling',
    category: 'realm',
    region: 'south',
    priority: 72,
    title: '私盐巨枭 · 盘踞江海',
    newsTemplate: '【盐枭滋事】两淮私盐贩聚众拒捕，杀伤官军，市舶盐政大受亏蚀，抚臣严捕。',
    chronicleTemplate: '东南私盐豪酋啸聚，盐课大亏。',
    execute: (world) => {
      world.regions.south.order -= 12;
      return { headline: '盐枭滋事', text: '私盐枭雄联结宗族，巡按御史提兵捕剿。' };
    }
  },
  {
    id: 'central_river_flood_erupts',
    category: 'realm',
    region: 'central',
    priority: 88,
    title: '黄河大决 · 奔流漂邑',
    newsTemplate: '【黄河惊决】连雨月余，大河于原武溃决，漫溢数十里，田禾淹没，数万生民登高呼救。',
    chronicleTemplate: '河决原武，漫流漂没民庐。',
    execute: (world) => {
      world.regions.central.pressure += 25;
      world.regions.central.prosperity -= 15;
      world.macroStats.livelihood -= 10;
      return { headline: '黄河惊决', text: '浊浪排空，巡抚范廷玉与按察使飞章告急。' };
    }
  },
  {
    id: 'official_opens_granaries',
    category: 'realm',
    region: 'central',
    priority: 82,
    title: '循吏发仓 · 活民无数',
    newsTemplate: '【先斩后奏】巡抚范廷玉未候户部明旨，毅然启常平仓散粟救溺，中原士民感泣。',
    chronicleTemplate: '地方官发仓赈饥，全活无数。',
    execute: (world) => {
      world.regions.central.pressure -= 15;
      world.macroStats.livelihood += 8;
      return { headline: '先斩后奏', text: '百姓得生，立生祠敬颂青天之德。' };
    }
  },
  {
    id: 'corrupt_official_delays',
    category: 'realm',
    region: 'central',
    priority: 84,
    title: '赈款遭侵 · 饥民转徙',
    newsTemplate: '【河工侵帑】河道贪官隐匿灾情，侵吞修堤帑银，饥民流聚商道，群情汹汹。',
    chronicleTemplate: '河官隐灾侵饷，饥民流散。',
    execute: (world) => {
      world.regions.central.order -= 20;
      world.regions.central.pressure += 20;
      return { headline: '河工侵帑', text: '流殍转徙，台省御史飞劾地方官吏。' };
    }
  },
  {
    id: 'reclamation_harvest_bountiful',
    category: 'realm',
    region: 'central',
    priority: 78,
    title: '治河底绩 · 沃野重开',
    newsTemplate: '【河塞大通】河防大堤合龙，疏浚新渠灌溉万顷淤田，流民归耕，秋获大稔。',
    chronicleTemplate: '治水奏功，新辟沃田数千顷。',
    execute: (world) => {
      world.regions.central.prosperity += 15;
      world.regions.central.pressure = 10;
      return { headline: '治河底绩', text: '洪流平息，桑麻重茂，生民安居。' };
    }
  },
  {
    id: 'court_sends_investigator',
    category: 'realm',
    region: 'central',
    priority: 85,
    title: '钦差按问 · 铁腕惩贪',
    newsTemplate: '【钦差按狱】刑部左侍郎崔道通佩剑抵灾区，捕治贪官十四员，抄没家私充赈。',
    chronicleTemplate: '朝廷按治贪吏，法度肃然。',
    execute: (world) => {
      world.regions.central.order += 18;
      world.regions.central.pressure -= 10;
      return { headline: '钦差按狱', text: '豪贪震怖，民间称快，吏风一新。' };
    }
  },
  {
    id: 'disaster_pacified_hero',
    category: 'realm',
    region: 'central',
    priority: 80,
    title: '民颂丰碑 · 循吏擢升',
    newsTemplate: '【名臣奏绩】中原治水平定，士民万民伞迎送贤臣，帝降特旨超擢入京。',
    chronicleTemplate: '循吏擢升中枢，士庶怀德。',
    execute: (world) => {
      world.macroStats.authority += 6;
      return { headline: '名臣奏绩', text: '朝野颂扬天子明察，中原文气大定。' };
    }
  },
  {
    id: 'disaster_settled_harsh',
    category: 'realm',
    region: 'central',
    priority: 74,
    title: '乱息法严 · 遗痕犹在',
    newsTemplate: '【平靖流亡】灾区乱局平定，然田亩凋敝十毁其三，官府宽延钱粮三年以抚生民。',
    chronicleTemplate: '灾乱略定，蠲免逋租。',
    execute: (world) => {
      world.regions.central.order = 60;
      return { headline: '平靖流亡', text: '烟火重续，休养生息之策渐行。' };
    }
  },
  {
    id: 'silk_road_caravan_arrives',
    category: 'realm',
    region: 'west',
    priority: 72,
    title: '丝路驼铃 · 遐荒通商',
    newsTemplate: '【西陲归市】龟兹、大宛商客连袂入玉门关，进奉天马、明珠与异药，商税大增。',
    chronicleTemplate: '西域诸番纳贡互市，商路大通。',
    execute: (world) => {
      world.regions.west.prosperity += 12;
      world.macroStats.treasury += 6;
      return { headline: '西陲归市', text: '驼铃不绝，万国衣冠，四夷向化。' };
    }
  },
  {
    id: 'western_border_strife',
    category: 'realm',
    region: 'west',
    priority: 76,
    title: '诸胡构隙 · 驿路受阻',
    newsTemplate: '【西道梗阻】西陲部落为争夺水草绿洲兵戎相见，劫掠商旅，安西护军请旨提防。',
    chronicleTemplate: '西垂部落交攻，驿传不通。',
    execute: (world) => {
      world.regions.west.order -= 15;
      world.regions.west.pressure += 15;
      return { headline: '西道梗阻', text: '烽烟再起，丝路商贾暂滞凉州。' };
    }
  },

  // ====================== 【朝堂政要 · 庙算进退】 ======================
  {
    id: 'han_ce_requests_funds',
    category: 'court',
    region: 'north',
    priority: 84,
    title: '大将陈情 · 请增饷甲',
    newsTemplate: '【大将陈奏】韩策上表请发内帑三百万两修筑八达岭长墙、增置神机营火器。',
    chronicleTemplate: '韩策请增军资，中枢议度支。',
    execute: (world) => {
      const han = world.characterManager.get('han_ce');
      if (han) han.influence += 5;
      return { headline: '大将陈奏', text: '韩策奏疏言辞切切，六部百司就度支争执不下。' };
    }
  },
  {
    id: 'han_ce_dispute_court',
    category: 'court',
    region: 'central',
    priority: 86,
    title: '言官劾将 · 尾大不掉',
    newsTemplate: '【御史弹劾】副都御史裴简直谏大将韩策擅专军资、克扣客军，言辞峻切，朝堂震动。',
    chronicleTemplate: '御史劾韩策专擅，边庭不平。',
    execute: (world) => {
      world.characterManager.addRelationship('pei_jian', 'han_ce', 'rival');
      return { headline: '御史弹劾', text: '裴简引祖制侃侃而谈，边庭闻之，将弁多有愤言。' };
    }
  },
  {
    id: 'han_ce_loyal_defense',
    category: 'court',
    region: 'central',
    priority: 82,
    title: '边帅陈情 · 输心自明',
    newsTemplate: '【边帅自剖】韩策遣长子入宿卫为质，上表剖白心迹，言尽报国赤诚，帝心大慰。',
    chronicleTemplate: '韩策遣子入侍，剖白忠节。',
    execute: (world) => {
      const han = world.characterManager.get('han_ce');
      if (han) han.relationshipToEmperor = 'trusted';
      return { headline: '边帅自剖', text: '大将军遣子入朝，朝中清流攻讦之声顿弭。' };
    }
  },
  {
    id: 'han_ce_takes_office_calm',
    category: 'court',
    region: 'central',
    priority: 85,
    title: '韩策还京 · 参赞大政',
    newsTemplate: '【解佩入朝】韩策奉诏离北境还京，拜枢密使同平章事，石雄总领边塞兵权。',
    chronicleTemplate: '韩策解军柄入阁，边务均归中枢。',
    execute: (world) => {
      const han = world.characterManager.get('han_ce');
      if (han) {
        han.office = '枢密使 · 柱国';
        han.region = 'central';
        han.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 奉召还京，入阁总领枢机。`);
      }
      return { headline: '解佩入朝', text: '韩策安步就席，兵符入内府，中枢兵权安宁平稳。' };
    }
  },
  {
    id: 'border_troops_unrest',
    category: 'court',
    region: 'north',
    priority: 88,
    title: '边军鼓噪 · 挽留元帅',
    newsTemplate: '【军心不宁】北境诸营闻韩帅被召，万卒披甲聚辕门喧呼挽留，石雄按剑严厉弹压。',
    chronicleTemplate: '边军哗动留帅，副将石雄抚定。',
    execute: (world) => {
      world.regions.north.order -= 15;
      return { headline: '军心不宁', text: '石雄手刃鼓噪者三人，严令归营，朝野虚惊一场。' };
    }
  },
  {
    id: 'han_ce_pillar_of_state',
    category: 'court',
    region: 'central',
    priority: 80,
    title: '受爵封侯 · 名垂竹帛',
    newsTemplate: '【策勋进爵】帝推诚相与，诏封韩策为定远侯，赐铁券丹书，许世袭罔替。',
    chronicleTemplate: '大将军韩策加封定远侯，位极人臣。',
    execute: (world) => {
      const han = world.characterManager.get('han_ce');
      if (han) {
        han.office = '定远侯 · 上柱国';
        han.influence += 20;
      }
      return { headline: '策勋进爵', text: '金紫光禄，恩宠备至，韩氏一门荣登极贵。' };
    }
  },
  {
    id: 'han_ce_peaceful_retirement',
    category: 'court',
    region: 'central',
    priority: 76,
    title: '功成身退 · 乞骸告老',
    newsTemplate: '【大将致仕】老将韩策年过花甲，数上乞骸骨表，帝赐金帛别业，许以太保致仕。',
    chronicleTemplate: '太保韩策致仕归老，帝优诏抚慰。',
    execute: (world) => {
      const han = world.characterManager.get('han_ce');
      if (han) {
        han.office = '太保致仕';
        han.alive = false;
        han.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 功成致仕，优游故里。`);
      }
      return { headline: '大将致仕', text: '昔日名将归老西山，海内肃然称其知止。' };
    }
  },
  {
    id: 'han_ce_border_rift',
    category: 'court',
    region: 'north',
    priority: 85,
    title: '将门结党 · 各怀异心',
    newsTemplate: '【关防嫌隙】边关将帅多由韩氏亲旧所据，朝廷命官难问虚实，尾大之势已渐成。',
    chronicleTemplate: '将帅门党渐深，枢密莫制。',
    execute: (world) => {
      world.factions.military.influence += 15;
      return { headline: '关防嫌隙', text: '边镇渐成自立之风，中枢屡敕戒勉。' };
    }
  },
  {
    id: 'gentry_resist_reform',
    category: 'court',
    region: 'south',
    priority: 82,
    title: '名族结怨 · 阻挠清丈',
    newsTemplate: '【豪族抗法】江南世族暗嘱佃客抗税毁尺，谢承礼在京上疏斥沈恪妄改祖制生事。',
    chronicleTemplate: '江东士族抗逆新法，群起攻讦。',
    execute: (world) => {
      world.characterManager.addRelationship('xie_chengli', 'shen_ke', 'rival');
      return { headline: '豪族抗法', text: '清丈册籍在金陵被焚，沈恪拔剑怒斥士阀国蠹。' };
    }
  },
  {
    id: 'local_peasants_cheer',
    category: 'court',
    region: 'central',
    priority: 78,
    title: '均赋德政 · 万民乐业',
    newsTemplate: '【小民受赐】沈恪清出隐田三十万亩，小农均沾其利，逋欠尽消，河东民生大舒。',
    chronicleTemplate: '沈恪均田赋，民乐其平。',
    execute: (world) => {
      world.macroStats.livelihood += 8;
      const shen = world.characterManager.get('shen_ke');
      if (shen) shen.influence += 12;
      return { headline: '小民受赐', text: '百姓负土筑生祠，称沈恪为再生父母。' };
    }
  },
  {
    id: 'emperor_backs_shen',
    category: 'court',
    region: 'central',
    priority: 90,
    title: '御笔乾断 · 圣眷独隆',
    newsTemplate: '【力挺更张】皇帝留中群臣弹章，下特旨赐沈恪王命旗牌，令六道按察奉法唯谨。',
    chronicleTemplate: '帝赐沈恪王命旗牌，严诫群臣。',
    execute: (world) => {
      const shen = world.characterManager.get('shen_ke');
      if (shen) {
        shen.influence += 15;
        shen.relationshipToEmperor = 'favored';
      }
      return { headline: '力挺更张', text: '君臣相知，变法如燎原之火势不可挡。' };
    }
  },
  {
    id: 'shen_ke_suspended',
    category: 'court',
    region: 'central',
    priority: 84,
    title: '明哲保身 · 权且调停',
    newsTemplate: '【新法迁延】朝议纷腾难解，帝暂将沈恪改调修史，豪右名族弹冠相庆。',
    chronicleTemplate: '沈恪改调词林，新政中辍。',
    execute: (world) => {
      const shen = world.characterManager.get('shen_ke');
      if (shen) shen.office = '国子监祭酒';
      return { headline: '新法迁延', text: '沈恪奉旨闭门著书，长叹国运艰难。' };
    }
  },
  {
    id: 'shen_promoted_central',
    category: 'court',
    region: 'central',
    priority: 86,
    title: '简拔入相 · 主管户曹',
    newsTemplate: '【入阁总宪】沈恪因治绩卓异拜户部尚书，兼武英殿大学士，天下新政由其主持。',
    chronicleTemplate: '沈恪入阁拜相，推行新法。',
    execute: (world) => {
      const shen = world.characterManager.get('shen_ke');
      if (shen) {
        shen.office = '户部尚书 · 大学士';
        shen.region = 'central';
        shen.history.push(`${world.historyManager.getYearSeasonText(world.turn)} 擢拜中枢，执掌度支。`);
      }
      return { headline: '入阁总宪', text: '一代名臣登相位，锐意更化，天下风气大振。' };
    }
  },
  {
    id: 'shen_reform_success',
    category: 'court',
    region: 'central',
    priority: 92,
    title: '更化大定 · 府库红腐',
    newsTemplate: '【天下新风】一条鞭均田清法毕行，逋税荡涤，太仓粟陈陈相因，社稷根基磐固。',
    chronicleTemplate: '天下均税更化大成，民殷国富。',
    execute: (world) => {
      world.macroStats.treasury = Math.min(100, world.macroStats.treasury + 20);
      world.macroStats.livelihood = Math.min(100, world.macroStats.livelihood + 15);
      return { headline: '更化大定', text: '中兴治道成型，史家称一代良相。' };
    }
  },
  {
    id: 'shen_reform_aborted',
    category: 'court',
    region: 'central',
    priority: 80,
    title: '宿疴如故 · 贤相掩涕',
    newsTemplate: '【更化受挫】朋党交攻之下新政瓦解，旧章成例复行，天下赋税重归积弊。',
    chronicleTemplate: '新政罢废，复遵旧规。',
    execute: (world) => {
      world.factions.gentry.influence += 15;
      return { headline: '更化受挫', text: '豪强重新占田，变法大潮终化为一声长叹。' };
    }
  },
  {
    id: 'gu_yuan_donates_millions',
    category: 'court',
    region: 'south',
    priority: 80,
    title: '商贾输粮 · 万斛充饷',
    newsTemplate: '【巨贾助帑】两浙顾源认捐百万饷银解入国库，帝特降温旨嘉奖，赐穿斗牛锦袍。',
    chronicleTemplate: '商贾顾源输银百万充国用。',
    execute: (world) => {
      world.macroStats.treasury += 15;
      const gu = world.characterManager.get('gu_yuan');
      if (gu) gu.influence += 14;
      return { headline: '巨贾助帑', text: '金穴之富冠绝南邦，朝廷度支顿得宽舒。' };
    }
  },
  {
    id: 'salt_monopoly_granted',
    category: 'court',
    region: 'south',
    priority: 85,
    title: '特赐盐引 · 商帮独尊',
    newsTemplate: '【盐利倾朝】中枢准顾源承揽两淮引岸，商贾势力极盛，日进万金，朝官多所交结。',
    chronicleTemplate: '中枢予顾氏独榷两淮盐引。',
    execute: (world) => {
      world.factions.merchants.influence += 20;
      return { headline: '盐利倾朝', text: '顾氏商号遍布九州，盐务巨利半入私囊。' };
    }
  },
  {
    id: 'merchant_gentry_intermarry',
    category: 'court',
    region: 'south',
    priority: 76,
    title: '阀阅朱陈 · 士商一体',
    newsTemplate: '【姻连朱门】谢承礼之从女归于顾氏长房，江南门阀与豪商朱陈结好，声势震动公卿。',
    chronicleTemplate: '陈郡谢氏与商贾顾氏通婚结盟。',
    execute: (world) => {
      world.characterManager.addRelationship('xie_chengli', 'gu_yuan', 'in_law');
      return { headline: '姻连朱门', text: '冠盖云集六朝金粉，士大夫与金穴自此同体。' };
    }
  },
  {
    id: 'merchant_court_dependence',
    category: 'court',
    region: 'central',
    priority: 82,
    title: '仰给商货 · 泉贝之重',
    newsTemplate: '【财源倚商】边镇大军犒赏与京师百僚俸禄多需商帮调运兑现，商民直通内府。',
    chronicleTemplate: '国帑转输渐仰赖海商之调剂。',
    execute: (world) => {
      world.macroStats.authority -= 5;
      return { headline: '财源倚商', text: '商帮羽翼已丰，户部视其眼色行事。' };
    }
  },
  {
    id: 'gentry_merchant_coalition',
    category: 'court',
    region: 'south',
    priority: 80,
    title: '江表磐石 · 赋税自专',
    newsTemplate: '【东南联璧】门阀士族为商贾撑腰，豪商以金帛奉侍名门，东南百官莫敢轻捋其锋。',
    chronicleTemplate: '东南豪阀合流，势压州郡。',
    execute: (world) => {
      world.regions.south.prosperity += 10;
      return { headline: '东南联璧', text: '江表经济盘根错节，天下财税半出于此。' };
    }
  },
  {
    id: 'trade_prosperity_perpetual',
    category: 'court',
    region: 'south',
    priority: 85,
    title: '万舶云屯 · 海国大治',
    newsTemplate: '【梯航万国】市舶关税岁入逾四百万，南洋百国番客聚居泉浙，海防宁靖，四海称安。',
    chronicleTemplate: '海市大通，岁纳千万。',
    execute: (world) => {
      world.macroStats.treasury = Math.min(100, world.macroStats.treasury + 20);
      return { headline: '梯航万国', text: '开海之功垂诸后世，海防富庶兼济。' };
    }
  },
  {
    id: 'prince_tutor_assigned',
    category: 'court',
    region: 'central',
    priority: 86,
    title: '选置少傅 · 储宫定序',
    newsTemplate: '【辅导东宫】大学士受命总领东宫讲筵，为皇储讲授帝王治道与典章宪法。',
    chronicleTemplate: '帝命重臣入侍东宫，讲读经史。',
    execute: (world) => {
      return { headline: '辅导东宫', text: '少傅日侍讲读，东宫规行矩步，海内属望。' };
    }
  },
  {
    id: 'prince_first_memorial',
    category: 'court',
    region: 'central',
    priority: 85,
    title: '皇储进陈 · 独展机杼',
    newsTemplate: '【储君陈书】太子奉敕详阅关防章奏，上疏痛论军备与农桑互济之理，词气斐然。',
    chronicleTemplate: '皇储具折条陈天下大计。',
    execute: (world) => {
      world.macroStats.authority += 8;
      return { headline: '储君陈书', text: '天子展阅称善，传示内阁百官，朝野翕然归心。' };
    }
  },
  {
    id: 'prince_matures_loyal',
    category: 'court',
    region: 'central',
    priority: 90,
    title: '孝慈仁闻 · 储嗣磐石',
    newsTemplate: '【东宫笃诚】太子问安寝门无虚日，爱敬勋臣，抚绥下民，天下知有明主。',
    chronicleTemplate: '皇太子仁明有度，物望所归。',
    execute: (world) => {
      world.macroStats.court = 80;
      return { headline: '东宫笃诚', text: '宗庙磐石安稳，后顾无虞。' };
    }
  },
  {
    id: 'court_prince_rivalry',
    category: 'court',
    region: 'central',
    priority: 84,
    title: '交结外藩 · 圣心生疑',
    newsTemplate: '【东宫疑云】言官密参东宫近幸多与外臣交通往还，帝诏旨戒饬东宫官属，朝堂肃敛。',
    chronicleTemplate: '御前密戒东宫侍臣慎勿越制。',
    execute: (world) => {
      world.macroStats.court -= 12;
      return { headline: '东宫疑云', text: '天子戒饬东宫，群臣避席屏息。' };
    }
  },
  {
    id: 'heir_ready_for_throne',
    category: 'court',
    region: 'central',
    priority: 95,
    title: '大本已固 · 后继其昌',
    newsTemplate: '【元良备德】皇太子年长器成，谙熟六卿庶务，朝野中外敬奉如天柱，传序永安。',
    chronicleTemplate: '储君德化日昭，大统底定。',
    execute: (world) => {
      world.macroStats.authority = 85;
      return { headline: '元良备德', text: '天下归心，国家后继有人，亿万黎庶之幸。' };
    }
  },
  {
    id: 'heir_reconciled',
    category: 'court',
    region: 'central',
    priority: 80,
    title: '父子释嫌 · 骨肉如初',
    newsTemplate: '【天伦穆穆】太子夜侍寝门焚香祈祥，帝迎入赐坐共话家国，深嫌尽消。',
    chronicleTemplate: '帝与储君释嫌，亲笃如常。',
    execute: (world) => {
      return { headline: '天伦穆穆', text: '君臣父子怡然言欢，谗间者皆自伏诛。' };
    }
  },
  {
    id: 'mutual_impeachments_erupt',
    category: 'court',
    region: 'central',
    priority: 88,
    title: '朋党倾轧 · 奏牍交驰',
    newsTemplate: '【台阁交攻】主张更化与墨守旧制之臣连章互劾，科道喧哗，三日不闻民政。',
    chronicleTemplate: '朝臣互讦成风，台谏交攻。',
    execute: (world) => {
      world.macroStats.court -= 15;
      return { headline: '台阁交攻', text: '朱笔所向两皆不悦，朝廷纪纲大受耗损。' };
    }
  },
  {
    id: 'emperor_intervenes_purge',
    category: 'court',
    region: 'central',
    priority: 90,
    title: '独运乾断 · 惩治浮薄',
    newsTemplate: '【雷霆震怒】帝严斥群臣结党乱政，将两派跳梁言官各贬外任，朝廷复归严肃。',
    chronicleTemplate: '帝戒饬百僚，黜退浮躁朋党。',
    execute: (world) => {
      world.macroStats.court += 10;
      world.macroStats.authority += 8;
      return { headline: '雷霆震怒', text: '群臣战栗奉命，嚣喧浮华之气一空。' };
    }
  },
  {
    id: 'faction_temporary_truce',
    category: 'court',
    region: 'central',
    priority: 76,
    title: '辅臣弥缝 · 朝局稍安',
    newsTemplate: '【相臣周旋】中书令魏肃力主持重均势，各引一二大臣互任知政，纷争稍弭。',
    chronicleTemplate: '首辅魏肃调停朋党，台局粗安。',
    execute: (world) => {
      world.macroStats.court += 6;
      return { headline: '相臣周旋', text: '宰相宽和自持，各部案牍渐理。' };
    }
  },
  {
    id: 'court_clarified',
    category: 'court',
    region: 'central',
    priority: 84,
    title: '风宪澄清 · 万流景仰',
    newsTemplate: '【百僚率化】朝堂党论渐熄，公议归于务实，六曹尽职，政风严肃整齐。',
    chronicleTemplate: '中枢庶务平章，纪纲肃然。',
    execute: (world) => {
      world.macroStats.court = 75;
      return { headline: '百僚率化', text: '百僚恪勤奉法，朝政蔚然成风。' };
    }
  },
  {
    id: 'court_balanced',
    category: 'court',
    region: 'central',
    priority: 78,
    title: '兼听并行 · 和中立极',
    newsTemplate: '【持中守经】朝中虽有异见，皆能恪守臣节同舟共济，天子垂拱穆然。',
    chronicleTemplate: '群臣和衷共济，朝市宴然。',
    execute: (world) => {
      return { headline: '持中守经', text: '天下无事，政通人和。' };
    }
  },

  // ====================== 【宫闱秘录 · 帝王行止】 ======================
  {
    id: 'construct_celestial_palace',
    category: 'palace',
    region: 'central',
    priority: 82,
    title: '大营西苑 · 楼台干霄',
    newsTemplate: '【广厦连云】西苑太液池上广筑仙台三十六楹，中官督工日夜赶筑，火光照彻帝城。',
    chronicleTemplate: '帝大修西苑宫观，耗费钜万。',
    execute: (world) => {
      world.macroStats.treasury -= 16;
      world.factions.palace.influence += 12;
      return { headline: '广厦连云', text: '楼台崔嵬，工役辛苦，然帝心颇自矜傲。' };
    }
  },
  {
    id: 'austere_minister_remonstrates',
    category: 'palace',
    region: 'central',
    priority: 84,
    title: '谏官叩阙 · 泣血陈辞',
    newsTemplate: '【死谏苦谏】副都御史裴简伏阙泣奏，请罢不经道场、省徭役以宽民力，帝为之动容。',
    chronicleTemplate: '御史力谏省徭役，帝罢西苑工。',
    execute: (world) => {
      world.macroStats.livelihood += 6;
      world.macroStats.authority += 5;
      return { headline: '死谏苦谏', text: '天子自省撤罢奢费之役，海内传诵明君之美。' };
    }
  },
  {
    id: 'emperor_health_fused',
    category: 'palace',
    region: 'central',
    priority: 88,
    title: '金丹毒烈 · 起居失调',
    newsTemplate: '【丹毒反噬】帝服食方士所进金石神丹，夜不能寐，时发暴怒，太医入内诚惶诚恐。',
    chronicleTemplate: '帝服方药失和，性渐猜躁。',
    execute: (world) => {
      world.royalFamily.emperor.healthLevel = Math.max(1, world.royalFamily.emperor.healthLevel - 1);
      return { headline: '丹毒反噬', text: '圣体不安，御前服侍之人动辄得咎。' };
    }
  },
  {
    id: 'emperor_pursuit_abandoned',
    category: 'palace',
    region: 'central',
    priority: 78,
    title: '黜退方士 · 归崇王道',
    newsTemplate: '【弃绝方术】皇帝深悟长生杳茫，诏命斥退道人方客，毁撤醮坛，复崇先王之学。',
    chronicleTemplate: '帝放逐方士，省节内用。',
    execute: (world) => {
      world.macroStats.authority += 8;
      return { headline: '弃绝方术', text: '洗心更始，万邦属望，君德归正。' };
    }
  },
  {
    id: 'emperor_pursuit_consequence',
    category: 'palace',
    region: 'central',
    priority: 85,
    title: '晚岁沉疴 · 史册秉笔',
    newsTemplate: '【圣体衰笃】长期营建与金石燥烈终伤天和，皇帝晚年卧疾难起，史臣暗自垂笔。',
    chronicleTemplate: '帝晚岁笃疾，政令多出于内辅。',
    execute: (world) => {
      world.royalFamily.emperor.healthLevel = 1;
      return { headline: '圣体衰笃', text: '千秋万岁，人事有终，青史自当秉公裁断。' };
    }
  },
  {
    id: 'imperial_examination_held',
    category: 'court',
    region: 'central',
    priority: 76,
    title: '开科取士 · 鱼跃龙门',
    newsTemplate: '【恩科放榜】金榜题名三百贡士，新科进士簪花巡街，四海寒士皆感圣天子广开仕路。',
    chronicleTemplate: '策士临轩，取天下英才登用。',
    execute: (world) => {
      world.macroStats.court += 8;
      world.macroStats.authority += 6;
      return { headline: '恩科放榜', text: '英才辈出，天下文脉汇于中枢，后继栋梁渐出。' };
    }
  },
  {
    id: 'eunuch_corruption_exposed',
    category: 'palace',
    region: 'central',
    priority: 78,
    title: '内竖受赇 · 禁中震肃',
    newsTemplate: '【内廷惩弊】掌印太监汪成门下小珰私受外官黄金事发，帝下旨立斩首恶，严申内戒。',
    chronicleTemplate: '禁中惩治内侍贪墨，中外称厉。',
    execute: (world) => {
      world.factions.palace.influence -= 10;
      return { headline: '内廷惩弊', text: '宫掖戒饬，内官皆贴壁屏气，不敢妄干大政。' };
    }
  },
  {
    id: 'great_minister_passes_away',
    category: 'court',
    region: 'central',
    priority: 96,
    title: '社稷折冲 · 股肱老臣殂谢',
    newsTemplate: '【栋折榱崩】首辅魏肃溘然病逝于公署，享年六十八，帝痛辍朝三日，亲制挽联追赠太师。',
    chronicleTemplate: '首辅魏肃卒，中外哀悼，赠太师。',
    execute: (world) => {
      const chancellor = world.characterManager.get('wei_su');
      if (chancellor) chancellor.alive = false;
      return { headline: '股肱殂谢', text: '辅政二十年名相溘逝，门生旧故扶柩号哭，朝局洗牌在即。' };
    }
  }
];
