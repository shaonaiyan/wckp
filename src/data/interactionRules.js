// Prototype 0.2 核心交互规则矩阵 (Reaction Matrix / Interaction Rules)
// 数据驱动定义局势与卡牌标签/行为的碰撞评级、数值代价、后遗状态产出与历史文本

export const INTERACTION_RULES = {
  // ---------------- 1. 北境犯边 ----------------
  northern_incursion: {
    evaluate: (card, state, situation) => {
      // 武备迎击 (调兵北上 / 征募新军 / 整顿军备)
      if (card.tags.includes('military')) {
        const isDispatch = card.id === 'dispatch_troops_north';
        return {
          quality: 'excellent',
          situationDelta: isDispatch ? -2 : -1,
          statDelta: { military: 6, treasury: -10, morale: 2 },
          newResidue: 'weary_army',
          costPreview: '边患平息 · 代价：边军耗损产生【边军疲惫】',
          headline: '大军出塞击胡',
          historyText: isDispatch
            ? '帝遣精锐大军驰援塞北，大破胡骑前锋。边患顿解，然边军长途转战渐露疲色。'
            : '兵部调集关内宿卫进驻边关，烽燧坚固，敌骑引退，塞外暂宁。'
        };
      }

      // 外交讲和 (遣使议和 / 和亲息战)
      if (card.tags.includes('diplomacy')) {
        const isMarriage = card.id === 'peace_marriage';
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: -8, morale: isMarriage ? -6 : -2, court: 1 },
          newResidue: 'tribute_burden',
          costPreview: '换取边境数载和平 · 代价：输送金帛获【岁币压力】',
          headline: isMarriage ? '和亲车驾北行' : '塞外勘盟休兵',
          historyText: isMarriage
            ? '宗室女降嫁单于以换塞上宁息，关塞烽火暂息，但朝廷岁岁需输纳大宗岁币。'
            : '使臣据理力争勘定边塞疆界，胡酋受盟撤兵，边鄙换得数载喘息。'
        };
      }

      // 边境互市 (开放互市)
      if (card.tags.includes('trade')) {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 8, morale: 4, military: 1 },
          newResidue: 'border_market_boom',
          costPreview: '化干戈为商阜 · 获持续收益【边市繁荣】',
          headline: '开设长城榷场',
          historyText: '朝廷力排众议开设茶马互市，关市大启，胡商客旅争利，边尘因以化解。'
        };
      }

      // 财政筹饷 (加征赋税 / 挪借内帑)
      if (card.tags.includes('finance')) {
        return {
          quality: 'weak',
          situationDelta: -1,
          statDelta: { treasury: 10, morale: -4, military: 2 },
          newResidue: null,
          costPreview: '筹银解危 · 勉强支撑边防用款',
          headline: '调拨款项支应塞外',
          historyText: '朝廷急拨粮饷急济北塞，虽未直接退敌，三军得粮稳固关防。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 2. 黄河水患 ----------------
  yellow_river_flood: {
    evaluate: (card, state, situation) => {
      // 开仓赈济
      if (card.id === 'granary_relief') {
        const hasPlentiful = state.hasResidue && state.hasResidue('plentiful_granary');
        return {
          quality: 'excellent',
          situationDelta: hasPlentiful ? -3 : -2,
          statDelta: { treasury: -12, morale: 18, court: 2 },
          newResidue: hasPlentiful ? null : 'empty_granaries',
          removeResidue: hasPlentiful ? 'plentiful_granary' : null,
          costPreview: '饥民得生，水患大缓 · 代价：太仓空虚获【仓储空虚】',
          headline: '各府常平仓尽启赈民',
          historyText: '各州常平仓尽启放粮，沿河数十万饥民得免于难，骚动顿平，仓储几近一空。'
        };
      }

      // 兴修水利
      if (card.id === 'water_conservancy') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: -18, morale: 8, court: 2 },
          newResidue: 'solid_dykes',
          costPreview: '重金大治黄河 · 获长期效益【河防稳固】',
          headline: '大工告成河归故道',
          historyText: '工部督率大夫日夜赶筑石堤，合龙断流，大患终息，千里河防数载无虞。'
        };
      }

      // 征发民夫 (强力工役)
      if (card.id === 'conscript_labor') {
        return {
          quality: 'good',
          situationDelta: -2,
          statDelta: { treasury: -2, morale: -14, court: 2 },
          newResidue: 'heavy_labor',
          costPreview: '低耗帑银治水 · 代价：百姓怨声载道获【徭役沉重】',
          headline: '强征万夫抢筑险工',
          historyText: '差役雷厉抓丁数十万抢堵决口，险工告竣而万民劳苦，怨声载道。'
        };
      }

      // 蠲免田赋 / 抚慰
      if (card.tags.includes('relief')) {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: -10, morale: 14, court: 1 },
          newResidue: null,
          costPreview: '宽宥灾区赋税 · 稳定人心',
          headline: '下诏蠲免被灾州县',
          historyText: '诏蠲灾区粮税三年，饥民虽仍失田，感戴圣恩，相聚暴动之势大缓。'
        };
      }

      // 灾年强征赋税 (危险反噬)
      if (card.id === 'levy_taxes') {
        return {
          quality: 'dangerous',
          situationDelta: 0,
          statDelta: { treasury: 12, morale: -20, court: -4 },
          newResidue: 'deep_resentment',
          costPreview: '⚠ 严酷加税激化民怨 · 产生【积怨渐深】',
          headline: '灾荒加税激起民愤',
          historyText: '黄河泛滥之时犹下令催逼积赋，饥民嚎啕道路，四野揭竿反侧之意大炽！'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 3. 土地兼并 ----------------
  land_annexation: {
    evaluate: (card, state, situation) => {
      // 劝农垦荒 (解决失地)
      if (card.id === 'encourage_reclamation') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: -6, morale: 10, court: 2 },
          newResidue: 'rest_and_recuperate',
          costPreview: '以荒安民 · 招抚流民得【休养生息】',
          headline: '赐牛垦荒招抚流移',
          historyText: '官赐荒地免赋三年，大批失地饥黎得重归陇亩，兼并之害随之清解。'
        };
      }

      // 蠲免田赋
      if (card.id === 'tax_relief') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: -8, morale: 12, court: 1 },
          newResidue: null,
          costPreview: '轻省小农负担 · 减缓流徙',
          headline: '轻徭薄税保全下户',
          historyText: '减省小民丁粮，使贫农免于典卖祖业，兼并之势稍受羁縻。'
        };
      }

      // 整顿吏治 (清丈土地，抑豪强)
      if (card.tags.includes('reform')) {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: 6, morale: 8, court: -2 },
          newResidue: 'gentry_influence',
          costPreview: '清丈官私田籍 · 豪强反噬得【豪族声望】',
          headline: '核实鱼鳞图册',
          historyText: '官核田亩清理隐瞒漏税，赋税归公，但地方大族私结朋党伺隙生事。'
        };
      }

      // 抄没家产 (强制没收)
      if (card.tags.includes('purge')) {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 14, morale: 4, court: -5 },
          newResidue: 'court_terror',
          costPreview: '强籍豪强田产充公 · 招致【朝野震恐】',
          headline: '籍没兼并豪强家产',
          historyText: '下旨严惩兼并巨贾豪宗，家产籍公，民称快而官绅结舌。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 4. 权臣坐大 ----------------
  corrupt_minister: {
    evaluate: (card, state, situation) => {
      // 明升暗降 (温和削权)
      if (card.id === 'covert_demotion') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { court: 10, morale: 2, treasury: -2 },
          newResidue: null,
          costPreview: '温和削权 · 尊其虚号而夺其枢密实权',
          headline: '尊官优遇削夺实权',
          historyText: '进封权臣太保兼领太学，阴转机要兵符入内廷，中枢政争化于无形。'
        };
      }

      // 大索京师 (铁腕彻底打掉)
      if (card.id === 'capital_purge') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { court: 18, morale: -10, treasury: 6 },
          newResidue: 'court_terror',
          costPreview: '连夜搜捕全盘清洗 · 朝局暴涨但获【朝野震恐】',
          headline: '缇骑入相府连夜除党',
          historyText: '御林军围封私门，权相下诏狱按律明正典刑，其党羽尽诛，朝廷肃杀。'
        };
      }

      // 抄没家产
      if (card.id === 'confiscate_assets') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: 18, court: 12, morale: 4 },
          newResidue: null,
          costPreview: '抄籍贪蠹私财 · 巨款入太仓并挫其羽翼',
          headline: '抄籍权要亿万家资',
          historyText: '查抄权相私帑金银巨万，塞满通衢，朋党爪牙皆夺爵落职。'
        };
      }

      // 封赏群臣 (金帛安抚买和)
      if (card.id === 'reward_officials') {
        return {
          quality: 'weak',
          situationDelta: -1,
          statDelta: { treasury: -14, court: 6, morale: -2 },
          newResidue: null,
          costPreview: '金帛厚赐求安 · 糜耗帑银，治标不治本',
          headline: '金帛厚劳百官权要',
          historyText: '内帑重犒朝臣，相府暂且收敛威芒，然其势力根本未动分毫。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 5. 国库吃紧 ----------------
  empty_treasury: {
    evaluate: (card, state, situation) => {
      // 加征赋税
      if (card.id === 'levy_taxes') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: 22, morale: -10, court: 1 },
          newResidue: null,
          costPreview: '立解度支之急 · 民心有所下降',
          headline: '通谕各省加征关税商税',
          historyText: '行令征发商税田银，太仓见涨，度支燃眉之急顿然纾解。'
        };
      }

      // 挪借内帑 (借债)
      if (card.id === 'national_debt') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: 25, morale: -3, court: -4 },
          newResidue: 'heavy_debt',
          costPreview: '内帑大借富商 · 快速满库但背负【债台高筑】',
          headline: '大举挪借富室帑银',
          historyText: '借得富商银钱数十万两，解得眼前窘局，但月利沉重不可久恃。'
        };
      }

      // 开海通商
      if (card.id === 'open_sea_trade') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 14, morale: 3, court: 1 },
          newResidue: 'border_market_boom',
          costPreview: '开源聚财 · 市舶抽解得【边市繁荣】',
          headline: '市舶抽解关税大增',
          historyText: '海市繁盛，番商税入滚滚而至，国帑日渐活水常流。'
        };
      }

      // 裁减冗兵
      if (card.id === 'demobilize_troops') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 16, military: -8, morale: 2 },
          newResidue: null,
          costPreview: '节流裁饷 · 节省开支但削弱军势',
          headline: '清核营额停发冗饷',
          historyText: '裁汰挂名冗卒数万人，岁省军饷百余万，户部稍得喘息。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 6. 军饷拖欠 ----------------
  military_arrears: {
    evaluate: (card, state, situation) => {
      // 筹款发饷 (加税 / 借债)
      if (card.id === 'national_debt' || card.id === 'levy_taxes') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { military: 10, treasury: 6, morale: -4 },
          newResidue: card.id === 'national_debt' ? 'heavy_debt' : null,
          costPreview: '急发犒赏行粮 · 抚定三军怒火',
          headline: '足色银两运解各营',
          historyText: '足额犒赏发落军前，士卒领饷欢声震野，兵变危难化为乌有。'
        };
      }

      // 裁撤冗兵 (汰老留精)
      if (card.id === 'demobilize_troops') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 10, military: -6, court: 2 },
          newResidue: null,
          costPreview: '核简兵籍 · 削减虚额以清旧饷',
          headline: '汰减老弱聚饷给精锐',
          historyText: '裁去疲老虚额，以省下粮饷专养精锐，各营哗噪暂告平息。'
        };
      }

      // 封赏群臣 (优遇将领)
      if (card.id === 'reward_officials') {
        return {
          quality: 'weak',
          situationDelta: -1,
          statDelta: { treasury: -12, court: 6, military: 4 },
          newResidue: null,
          costPreview: '重赏武臣将领 · 抚慰军帅以弹压士卒',
          headline: '加封军将厚赐金帛',
          historyText: '先重赏帅臣武官，命其约束部署，喧哗稍敛而小卒犹多腹诽。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 7. 民怨四起 ----------------
  rising_discontent: {
    evaluate: (card, state, situation) => {
      // 开仓赈济
      if (card.id === 'granary_relief') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: -12, morale: 20, court: 1 },
          newResidue: 'empty_granaries',
          costPreview: '施粥安抚流民 · 代价：产生【仓储空虚】',
          headline: '开仓赈济平息暴民',
          historyText: '义仓广开赈给穷黎，乱民得食散归乡里，风潮遂息。'
        };
      }

      // 蠲免田赋
      if (card.id === 'tax_relief') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: -10, morale: 18, court: 2 },
          newResidue: 'rest_and_recuperate',
          costPreview: '除苛政让民利 · 获【休养生息】',
          headline: '宽恩大布除却杂派',
          historyText: '停除横征苛派，下诏安民，四郊欢呼，反抗之火油然熄灭。'
        };
      }

      // 大赦天下
      if (card.id === 'general_amnesty') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { morale: 14, court: -2, military: 0 },
          newResidue: null,
          costPreview: '下诏赦宥从乱者 · 瓦解聚众',
          headline: '赦书颁行不究从乱',
          historyText: '罪止首恶不究从贼，聚啸草寇多各散还家，民间暴戾为之一化。'
        };
      }

      // 武力坚决镇压 (征募新军 / 大索京师)
      if (card.tags.includes('force') || card.tags.includes('military')) {
        return {
          quality: 'good',
          situationDelta: -2,
          statDelta: { military: 2, morale: -16, court: 6 },
          newResidue: 'deep_resentment',
          costPreview: '官军血腥镇压 · 产生长期【积怨渐深】',
          headline: '官军进剿诛除乱党',
          historyText: '大兵开至铁血平叛，斩首数千，地方虽定然民间饮恨深沉。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 8. 吏治腐败 ----------------
  bureaucratic_corruption: {
    evaluate: (card, state, situation) => {
      // 整顿吏治
      if (card.id === 'rectify_governance') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { court: 6, morale: 8, treasury: 4 },
          newResidue: 'reform_talents',
          costPreview: '严考官箴激浊扬清 · 获【新政人才】',
          headline: '巡按四出考课天下守令',
          historyText: '罢黜贪渎长官百余人，公堂为之肃然，官箴复振，拔擢良吏成新政基石。'
        };
      }

      // 抄没家产
      if (card.id === 'confiscate_assets') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 16, court: 4, morale: 3 },
          newResidue: null,
          costPreview: '惩贪夺财 · 快速回补公帑',
          headline: '严捕巨贪籍没其私藏',
          historyText: '查处数名硕鼠，赃银如山充入太仓，宵小官僚稍见敛迹。'
        };
      }

      // 大索京师
      if (card.id === 'capital_purge') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { court: 14, morale: -8, treasury: 8 },
          newResidue: 'court_terror',
          costPreview: '铁腕清洗百司 · 产生【朝野震恐】',
          headline: '严旨雷厉断绝党羽',
          historyText: '下诏狱穷治贪网，牵连百司，官风顿肃而朝臣人人自危。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 9. 边将拥兵 ----------------
  warlord_buildup: {
    evaluate: (card, state, situation) => {
      // 下旨削藩
      if (card.id === 'curb_warlords') {
        const strongMilitary = state.military >= 50;
        return {
          quality: strongMilitary ? 'excellent' : 'dangerous',
          situationDelta: strongMilitary ? -3 : 0,
          statDelta: strongMilitary
            ? { court: 16, military: 4, morale: 2 }
            : { court: -12, military: -10, morale: -4 },
          newResidue: strongMilitary ? null : 'weary_army',
          costPreview: strongMilitary ? '雷霆削权收归兵印' : '⚠ 军力不足恐招藩镇激烈抗命反噬！',
          headline: strongMilitary ? '中使执节收夺边帅符节' : '边将拒命抗拒削权',
          historyText: strongMilitary
            ? '天子雷厉下敕收还节度印绶，骄将慑于天朝国威俯首受降，中央集权大振！'
            : '中使至营宣旨，边帅按剑抗礼拒命，朝廷颜面受损，帅府权势益横！'
        };
      }

      // 明升暗降
      if (card.id === 'covert_demotion') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { court: 8, military: 0, treasury: -2 },
          newResidue: null,
          costPreview: '调任京职 · 虚授上将散衔潜移部众',
          headline: '召大帅入中枢备顾命',
          historyText: '授大将同平章事调入枢密，潜分其牙兵于各州，藩镇渐失牙爪。'
        };
      }

      // 和亲 / 结纳抚慰 (外交类)
      if (card.tags.includes('diplomacy')) {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { court: 4, morale: 2, treasury: -6 },
          newResidue: null,
          costPreview: '联姻抚慰 · 结纳帅府以安人心',
          headline: '朝廷示恩结纳帅族',
          historyText: '结姻赐玉褒赏其功，骄藩心安，暂无窥伺中原称王之志。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 10. 商路受阻 ----------------
  trade_route_blocked: {
    evaluate: (card, state, situation) => {
      // 开放互市
      if (card.id === 'open_border_market') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: 8, morale: 4, court: 1 },
          newResidue: 'border_market_boom',
          costPreview: '引商化盗 · 获【边市繁荣】',
          headline: '辟设关市通融诸夷',
          historyText: '重辟关市分润利权，流寇无利自化为商旅，商道顿通。'
        };
      }

      // 调兵平贼
      if (card.tags.includes('military')) {
        return {
          quality: 'good',
          situationDelta: -2,
          statDelta: { military: 2, treasury: -6, morale: 2 },
          newResidue: null,
          costPreview: '出师剿寇 · 护送商旅',
          headline: '遣精骑肃清官道巨盗',
          historyText: '官军分道出击殄灭劫道悍寇，商旅畅行无阻，南北驿传渐复。'
        };
      }

      // 开海通商
      if (card.id === 'open_sea_trade') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 10, morale: 2 },
          newResidue: 'border_market_boom',
          costPreview: '陆阻海通 · 转向水运通商',
          headline: '转运水路改通海贸',
          historyText: '陆道多警转走海运漕道，货利转畅，关市税源顿复。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 11. 江南丰收 (机会局势) ----------------
  harvest_south: {
    evaluate: (card, state, situation) => {
      // 加税收财
      if (card.id === 'levy_taxes') {
        return {
          quality: 'excellent',
          situationDelta: -1, // 解除机会
          statDelta: { treasury: 26, morale: -3 },
          newResidue: null,
          costPreview: '丰年征税 · 国库巨幅充盈，民心微降',
          headline: '按亩纳银国库充溢',
          historyText: '岁稔民乐，顺势征解夏秋漕粮，太仓顿得数载积蓄，国富民安。'
        };
      }

      // 减税施恩
      if (card.id === 'tax_relief') {
        return {
          quality: 'excellent',
          situationDelta: -1,
          statDelta: { morale: 20, treasury: -4 },
          newResidue: 'rest_and_recuperate',
          costPreview: '让利于民 · 获长期增益【休养生息】',
          headline: '与民大休大养天下同欢',
          historyText: '天赐丰稔而朝廷宽宥租税，海内万民欢腾，四海祥和，民心深固。'
        };
      }

      // 储粮备荒
      if (card.id === 'store_grain') {
        return {
          quality: 'excellent',
          situationDelta: -1,
          statDelta: { treasury: -8, morale: 6 },
          newResidue: 'plentiful_granary',
          costPreview: '平价买粮入库 · 获得战略资产【粮储充足】',
          headline: '常平仓储新粟千万石',
          historyText: '朝廷平价收储秋米堆满各地大仓，天下从此有备无患！'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 12. 海贸兴起 (机会局势) ----------------
  thriving_sea_trade: {
    evaluate: (card, state, situation) => {
      // 开海通商
      if (card.id === 'open_sea_trade') {
        return {
          quality: 'excellent',
          situationDelta: -1,
          statDelta: { treasury: 14, morale: 6 },
          newResidue: 'border_market_boom',
          costPreview: '全力开放海禁 · 获长期利得【边市繁荣】',
          headline: '开洋弛禁巨舟集港',
          historyText: '沿海市舶司百尺巨舟云集，西洋货殖络绎，天朝声威远播重洋。'
        };
      }

      // 加征赋税 (抽税赚大钱)
      if (card.id === 'levy_taxes') {
        return {
          quality: 'excellent',
          situationDelta: -1,
          statDelta: { treasury: 24, morale: -2 },
          newResidue: null,
          costPreview: '抽分番货重税 · 一次性获大宗国库',
          headline: '抽舶课银太仓流金',
          historyText: '严加抽解泊税，海外珍宝尽入内帑，度支顿宽。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 13. 边境战争 (重大危机) ----------------
  border_war: {
    evaluate: (card, state, situation) => {
      // 调兵北上 / 征募新军
      if (card.tags.includes('military')) {
        return {
          quality: 'excellent',
          situationDelta: -1,
          statDelta: { military: 8, treasury: -16, morale: 4 },
          newResidue: 'weary_army',
          costPreview: '倾力决战塞外 · 极大耗费但扭转战局',
          headline: '三军决战歼敌数万',
          historyText: '精骑大出塞北决战，血战破敌中军大营，边患险势顿挫！'
        };
      }

      // 和亲 / 议和 (屈辱求全)
      if (card.tags.includes('diplomacy')) {
        return {
          quality: 'good',
          situationDelta: -2,
          statDelta: { treasury: -16, morale: -10, court: -2 },
          newResidue: 'tribute_burden',
          costPreview: '重资割舍媾和 · 产生沉重【岁币压力】',
          headline: '输金议和金鼓暂歇',
          historyText: '厚赂单于许以巨额年例，塞外狼烟暂退，朝野虽耻而国祚得存。'
        };
      }

      // 借债筹饷
      if (card.id === 'national_debt') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { treasury: 12, military: 4 },
          newResidue: 'heavy_debt',
          costPreview: '借饷支撑死撑战局',
          headline: '调聚商银支持行伍',
          historyText: '筹银发往军前死撑防线，阵势勉强维持不垮。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 14. 大规模民变 (重大危机) ----------------
  major_rebellion: {
    evaluate: (card, state, situation) => {
      // 开仓赈济
      if (card.id === 'granary_relief') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { treasury: -16, morale: 22, court: 4 },
          newResidue: 'empty_granaries',
          costPreview: '全力放粮招抚 · 代价：【仓储空虚】',
          headline: '大开太仓招抚流贼',
          historyText: '官设数千粥厂抚慰流民，从贼饥民争降，叛党声势瓦解大半！'
        };
      }

      // 军力铁血平叛
      if (card.tags.includes('military') || card.id === 'capital_purge') {
        return {
          quality: 'good',
          situationDelta: -2,
          statDelta: { military: 4, morale: -18, court: 6 },
          newResidue: 'deep_resentment',
          costPreview: '大兵血洗围剿 · 产生【积怨渐深】',
          headline: '官军合围连破叛首',
          historyText: '精甲合围斩杀贼帅数万，叛乱渐平，然中原凋敝骸骨成丘。'
        };
      }

      // 大赦天下
      if (card.id === 'general_amnesty') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { morale: 16, court: -2 },
          newResidue: null,
          costPreview: '赦宥群盗 · 分化瓦解',
          headline: '涣汗特赦叛众降者不杀',
          historyText: '颁恩免死，散其党羽，数万乱众各归里闾。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  },

  // ---------------- 15. 宫廷政争 (重大危机) ----------------
  court_intrigue: {
    evaluate: (card, state, situation) => {
      // 大索京师
      if (card.id === 'capital_purge') {
        return {
          quality: 'excellent',
          situationDelta: -2,
          statDelta: { court: 22, morale: -12, treasury: 8 },
          newResidue: 'court_terror',
          costPreview: '缇骑入殿血洗逆党 · 获【朝野震恐】',
          headline: '雷霆斩绝禁中变乱',
          historyText: '内廷逆党被宿卫斩杀殆尽，紫禁城血溅阶陛，皇权独揽中外肃然！'
        };
      }

      // 明升暗降
      if (card.id === 'covert_demotion') {
        return {
          quality: 'good',
          situationDelta: -1,
          statDelta: { court: 12, morale: 2 },
          newResidue: null,
          costPreview: '离间分化逆党盟誓',
          headline: '恩威并施分化两司',
          historyText: '下密敕分化枢密宿卫，除其羽翼，逼宫危局稍得缓释。'
        };
      }

      return { quality: 'none', applicability: false };
    }
  }
};
