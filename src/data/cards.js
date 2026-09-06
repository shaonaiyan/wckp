// 卡牌数据定义：27张首发卡牌
// 涵盖财政、民生、军事、外交、政治、国事六大类
export const CARDS = [
  // ----------------- 财政类 (Finance) -----------------
  {
    id: 'levy_taxes',
    name: '加征赋税',
    category: 'finance',
    tags: ['tax', 'finance', 'hardline'],
    description: '加征一季田赋商税，解国库燃眉之急。',
    effectDisplay: '国库：大幅↑  民心：小幅↓',
    baseEffect: { treasury: 16, morale: -9, military: 0, court: 0 },
    targetType: 'none',
    weight: 12,
    canHold: true,
    warningCondition: (situations) => situations.some(s => ['yellow_river_flood', 'land_annexation', 'rising_discontent', 'major_rebellion'].includes(s.id)),
    warningHint: '⚠ 灾荒与民怨期间加税，将严重激化百姓不满！',
    dynamicEffect: (state, targetSituation, prng, situations = []) => {
      const sitList = situations.length ? situations : (state.situations || []);
      const hasDisaster = sitList.some(s => ['yellow_river_flood', 'land_annexation', 'rising_discontent', 'major_rebellion'].includes(s.id));
      if (hasDisaster) {
        return {
          delta: { treasury: 16, morale: -18, military: 0, court: -3 },
          flavor: '苛政猛于虎。灾年加赋令饥民号泣道路，四野怨声载道。'
        };
      }
      return {
        delta: { treasury: 16, morale: -9, military: 0, court: 0 },
        flavor: '户部令下，各州县征解税银入京，国库顿见充盈。'
      };
    }
  },
  {
    id: 'tax_relief',
    name: '蠲免田赋',
    category: 'finance',
    tags: ['tax', 'relief', 'economy'],
    description: '下诏蠲免天下租赋一季，让利于民。',
    effectDisplay: '民心：大幅↑  国库：小幅↓',
    baseEffect: { treasury: -10, morale: 15, military: 0, court: 2 },
    targetType: 'none',
    weight: 10,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: -10, morale: 15, military: 0, court: 2 },
      flavor: '皇恩浩荡，除却苛捐杂税，万民山呼万岁。'
    })
  },
  {
    id: 'open_sea_trade',
    name: '开海通商',
    category: 'finance',
    tags: ['trade', 'reform', 'economy'],
    description: '弛禁开洋，准民间互市舟舶往来番邦。',
    effectDisplay: '国库：微幅↑  或获【海贸兴盛】',
    baseEffect: { treasury: 6, morale: 3, military: 0, court: -2 },
    targetType: 'none',
    weight: 9,
    canHold: true,
    dynamicEffect: (state, target, prng) => {
      const roll = prng.nextFloat();
      const gainState = roll < 0.65;
      return {
        delta: { treasury: 7, morale: 4, military: 0, court: -2 },
        addState: gainState ? 'thriving_sea_trade' : null,
        flavor: gainState
          ? '沿海市舶司市井喧嚣，千帆竞发。江南商贸渐成燎原之势。'
          : '海禁初启，番商虽有至者，关税收益尚在起步之中。'
      };
    }
  },
  {
    id: 'salt_tax_reform',
    name: '整顿盐铁',
    category: 'finance',
    tags: ['reform', 'salt', 'finance'],
    description: '清理盐引私枭，朝廷直掌官盐官铁利权。',
    effectDisplay: '国库：适度↑  朝局影响视吏治而定',
    baseEffect: { treasury: 11, morale: -2, military: 0, court: -3 },
    targetType: 'none',
    weight: 10,
    canHold: true,
    dynamicEffect: (state) => {
      if (state.court < 40) {
        return {
          delta: { treasury: 5, morale: -4, military: 0, court: -5 },
          flavor: '朝中党羽盘根错节，盐课巡按遇阻，查办所获寥寥，反激起权贵私议。'
        };
      }
      return {
        delta: { treasury: 12, morale: 0, military: 0, court: 2 },
        flavor: '严打私盐窝案，国税专营渐入正轨，太仓岁入颇丰。'
      };
    }
  },
  {
    id: 'national_debt',
    name: '挪借内帑',
    category: 'finance',
    tags: ['debt', 'emergency', 'finance'],
    description: '向晋徽大贾及皇亲重臣勒借银两，救一时之急。',
    effectDisplay: '立即国库：巨幅↑  获【债台高筑】',
    baseEffect: { treasury: 20, morale: -4, military: 0, court: -4 },
    targetType: 'none',
    weight: 8,
    canHold: true,
    dynamicEffect: (state) => {
      const debtCount = state.debtCount || 0;
      const penalty = debtCount * 4;
      return {
        delta: { treasury: Math.max(8, 20 - penalty), morale: -5, military: 0, court: -4 },
        addState: 'heavy_debt',
        incrementDebt: true,
        flavor: debtCount === 0
          ? '内帑与富商借款如数解入户部，眼前危局顿解，然日后连本带利难以善了。'
          : '再次借债已生龃龉，商贾借故推脱，朝廷信用大损，所借银两缩减。'
      };
    }
  },
  {
    id: 'confiscate_assets',
    name: '抄没家产',
    category: 'finance',
    tags: ['purge', 'finance', 'hardline'],
    description: '籍没贪官巨贾田产宅院，充公太仓。',
    effectDisplay: '国库：大幅↑  朝局：动荡  对腐败局势显效',
    baseEffect: { treasury: 15, morale: 2, military: 0, court: -8 },
    targetType: 'optional_situation',
    targetTags: ['corruption', 'politics', 'warlord'],
    weight: 9,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (target && ['corrupt_minister', 'bureaucratic_corruption', 'warlord_buildup'].includes(target.id)) {
        return {
          delta: { treasury: 18, morale: 6, military: 0, court: 5 },
          resolveAmount: 2,
          flavor: `抄没${target.name}党羽家产，金银珠宝塞满巷陌，朝野震悚，巨蠹伏诛。`
        };
      }
      return {
        delta: { treasury: 12, morale: -3, military: 0, court: -8 },
        flavor: '锦衣四出抄家，虽得浮财数箱，亦令京官人人自危，朝局动荡不安。'
      };
    }
  },

  // ----------------- 民生类 (Livelihood) -----------------
  {
    id: 'granary_relief',
    name: '开仓赈济',
    category: 'livelihood',
    tags: ['relief', 'agriculture', 'disaster'],
    description: '开各大常平仓、义仓，施粥施药安抚黎民。',
    effectDisplay: '民心：大幅↑  国库：下降  针对灾荒显效',
    baseEffect: { treasury: -12, morale: 16, military: 0, court: 0 },
    targetType: 'optional_situation',
    targetTags: ['disaster', 'discontent'],
    weight: 12,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (target && ['yellow_river_flood', 'rising_discontent', 'major_rebellion', 'land_annexation'].includes(target.id)) {
        return {
          delta: { treasury: -12, morale: 18, military: 0, court: 2 },
          resolveAmount: 2,
          flavor: `朝廷开仓放粮，灾民暂得喘息。${target.name}局势明显平息。`
        };
      }
      return {
        delta: { treasury: -10, morale: 14, military: 0, court: 0 },
        flavor: '广设粥厂赈济孤贫，恩泽及于穷壤，百姓无不感念天恩。'
      };
    }
  },
  {
    id: 'general_amnesty',
    name: '大赦天下',
    category: 'livelihood',
    tags: ['amnesty', 'court', 'livelihood'],
    description: '诞降纶音，罪非大辟者咸赦除之。',
    effectDisplay: '民心：适度↑  朝局影响视局势而定',
    baseEffect: { treasury: -2, morale: 12, military: -3, court: 2 },
    targetType: 'none',
    weight: 9,
    canHold: true,
    dynamicEffect: (state) => {
      if (state.court < 35) {
        return {
          delta: { treasury: -2, morale: 6, military: -4, court: -5 },
          flavor: '朝纲不振之时行大赦，宵小趁机横行，地方治安愈发涣散。'
        };
      }
      return {
        delta: { treasury: -2, morale: 12, military: -2, court: 3 },
        flavor: '诏书颁布四方，囹圄为之一空，黎民感泣，天下归心。'
      };
    }
  },
  {
    id: 'water_conservancy',
    name: '兴修水利',
    category: 'livelihood',
    tags: ['agriculture', 'disaster', 'engineering'],
    description: '征调民夫工部大员，疏浚故道修筑堤防。',
    effectDisplay: '国库：大幅↓  对水患极佳  平时获【水利修整】',
    baseEffect: { treasury: -14, morale: 4, military: 0, court: 2 },
    targetType: 'optional_situation',
    targetTags: ['disaster'],
    weight: 9,
    canHold: true,
    dynamicEffect: (state, target, prng, situations = []) => {
      const sitList = situations.length ? situations : (state.situations || []);
      const hasFlood = sitList.some(s => s.id === 'yellow_river_flood');
      if (hasFlood || (target && target.id === 'yellow_river_flood')) {
        return {
          delta: { treasury: -14, morale: 10, military: 0, court: 3 },
          resolveAmount: 2,
          flavor: '治河名臣督造大堤合龙，浑黄怒涛终归大壑，千里沃野免遭浸漫。'
        };
      }
      return {
        delta: { treasury: -13, morale: 4, military: 0, court: 2 },
        addState: 'waterworks_ready',
        flavor: '河防修筑坚固，陂塘灌溉畅通。获得【水利修整】，日后水患之害大减。'
      };
    }
  },
  {
    id: 'encourage_reclamation',
    name: '劝农垦荒',
    category: 'livelihood',
    tags: ['agriculture', 'economy', 'longterm'],
    description: '赐民耕牛铁器，免初垦荒地三年赋税。',
    effectDisplay: '短期消耗轻微  未来利于触发【江南丰收】',
    baseEffect: { treasury: -6, morale: 6, military: 0, court: 1 },
    targetType: 'none',
    weight: 9,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: -6, morale: 7, military: 0, court: 1 },
      flavor: '百姓荷锄开荒，阡陌纵横，荒野渐变熟地，农桑之基日渐敦实。'
    })
  },

  // ----------------- 军事类 (Military) -----------------
  {
    id: 'recruit_troops',
    name: '征募新军',
    category: 'military',
    tags: ['military', 'recruit'],
    description: '敕令各路招募骁勇壮丁，厉兵秣马。',
    effectDisplay: '军势：大幅↑  国库：下降  民心：小幅↓',
    baseEffect: { treasury: -12, morale: -5, military: 15, court: 1 },
    targetType: 'none',
    weight: 11,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: -12, morale: -5, military: 15, court: 1 },
      flavor: '招兵旗展，四方健儿应募入伍。京畿大营旗帜猎猎，声威复振。'
    })
  },
  {
    id: 'overhaul_armaments',
    name: '整顿军备',
    category: 'military',
    tags: ['military', 'reform', 'training'],
    description: '督造火器甲胄，简拔良将严明军纪。',
    effectDisplay: '军势：小幅↑  获短期【整军经武】增益',
    baseEffect: { treasury: -7, morale: 0, military: 7, court: 3 },
    targetType: 'none',
    weight: 10,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: -7, morale: 1, military: 8, court: 3 },
      addState: 'military_reformed',
      flavor: '兵部严查武备，器械坚利，校场操演步骑肃整。'
    })
  },
  {
    id: 'demobilize_troops',
    name: '裁撤冗兵',
    category: 'military',
    tags: ['military', 'economy', 'reform'],
    description: '核实兵籍裁汰老弱，削减饷银虚糜。',
    effectDisplay: '国库：大幅↑  军势：下降  民心：微升',
    baseEffect: { treasury: 13, morale: 3, military: -11, court: 2 },
    targetType: 'none',
    weight: 9,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: 13, morale: 3, military: -11, court: 2 },
      flavor: '遣散疲癃军伍，太仓每月省去巨额靡饷，唯边防宿卫稍见单薄。'
    })
  },
  {
    id: 'dispatch_troops_north',
    name: '调兵北伐',
    category: 'military',
    tags: ['military', 'border', 'war'],
    description: '调动精锐宿卫进驻边关，迎击来犯之敌。',
    effectDisplay: '针对边境/战争局势极强  平日收益较低',
    baseEffect: { treasury: -9, morale: -2, military: 5, court: 2 },
    targetType: 'optional_situation',
    targetTags: ['border', 'war'],
    weight: 10,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (target && ['northern_incursion', 'border_war'].includes(target.id)) {
        return {
          delta: { treasury: -10, morale: 4, military: 6, court: 3 },
          resolveAmount: 2,
          flavor: `大军驰抵北塞，烽火连营百里，${target.name}锋芒受挫，敌骑遁退数十里。`
        };
      }
      return {
        delta: { treasury: -9, morale: -3, military: 4, court: 1 },
        flavor: '三军劳师动众进屯边关，关外并无大警，靡费钱粮甚多。'
      };
    }
  },
  {
    id: 'military_farming',
    name: '军屯边务',
    category: 'military',
    tags: ['military', 'agriculture', 'longterm'],
    description: '令戍卒半耕半战，寓兵于农，自足粮秣。',
    effectDisplay: '军势：稳健↑  国库：微升  持续良性收益',
    baseEffect: { treasury: 4, morale: 3, military: 7, court: 2 },
    targetType: 'none',
    weight: 9,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: 4, morale: 3, military: 7, court: 2 },
      flavor: '塞外垦田数万亩，兵饷得给，烽堠坚固，边将士卒皆有安居之志。'
    })
  },

  // ----------------- 外交类 (Diplomacy) -----------------
  {
    id: 'peace_marriage',
    name: '和亲息战',
    category: 'diplomacy',
    tags: ['peace', 'border', 'diplomacy'],
    description: '封宗室女为公主远嫁单于，辅以丰厚岁币以缓边患。',
    effectDisplay: '大幅缓解边境/战争  国库轻耗  记于史册',
    baseEffect: { treasury: -8, morale: -4, military: 2, court: 0 },
    targetType: 'optional_situation',
    targetTags: ['border', 'war'],
    weight: 8,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (target && ['northern_incursion', 'border_war'].includes(target.id)) {
        return {
          delta: { treasury: -8, morale: -3, military: 2, court: 0 },
          resolveAmount: 2,
          flavor: `翠华南向北风吹。和亲车仗入塞外，${target.name}烽火暂熄，换得数年喘息之机。`
        };
      }
      return {
        delta: { treasury: -7, morale: -4, military: 0, court: 0 },
        flavor: '遣送金帛厚礼赐予番王，北鄙诸部稽首称善，息兵通好。'
      };
    }
  },
  {
    id: 'peace_envoy',
    name: '遣使议和',
    category: 'diplomacy',
    tags: ['peace', 'diplomacy'],
    description: '遣名臣持节出塞，与敌勘定疆界止战。',
    effectDisplay: '缓解战事  军势过弱时恐招致苛刻赔款',
    baseEffect: { treasury: -6, morale: 2, military: 0, court: 2 },
    targetType: 'optional_situation',
    targetTags: ['border', 'war'],
    weight: 8,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (state.military < 35) {
        return {
          delta: { treasury: -14, morale: -8, military: -3, court: -4 },
          resolveAmount: 1,
          flavor: '我军势单力薄，使臣在敌营备受屈辱，虽得媾和，却输纳岁币巨万。'
        };
      }
      return {
        delta: { treasury: -5, morale: 4, military: 0, court: 3 },
        resolveAmount: target ? 2 : 0,
        flavor: '使节据理力争，以天朝威德慑服敌帐，边尘暂息，缔结盟好。'
      };
    }
  },
  {
    id: 'open_border_market',
    name: '开放互市',
    category: 'diplomacy',
    tags: ['trade', 'border', 'diplomacy'],
    description: '于边关要冲开设榷场，以茶马换番货。',
    effectDisplay: '缓和边境  国库微升  民心融洽',
    baseEffect: { treasury: 7, morale: 5, military: 0, court: 1 },
    targetType: 'optional_situation',
    targetTags: ['border', 'economy'],
    weight: 9,
    canHold: true,
    dynamicEffect: (state, target) => {
      const hasBorder = target && ['northern_incursion', 'border_war'].includes(target.id);
      return {
        delta: { treasury: 7, morale: 5, military: 0, court: 1 },
        resolveAmount: hasBorder ? 1 : 0,
        flavor: '关市大启，胡商客旅接踵而至，烽燧之下化作繁华商阜。'
      };
    }
  },

  // ----------------- 政治类 (Politics) -----------------
  {
    id: 'reward_officials',
    name: '重赏百官',
    category: 'politics',
    tags: ['court', 'politics', 'pacify'],
    description: '大赉群公京官，赐蟒袍玉带加官晋爵。',
    effectDisplay: '朝局：大幅↑  国库：下降  多度使用收益递减',
    baseEffect: { treasury: -11, morale: -1, military: 0, court: 14 },
    targetType: 'none',
    weight: 10,
    canHold: true,
    dynamicEffect: (state) => {
      const rewardCount = state.rewardCount || 0;
      const courtGain = Math.max(5, 14 - rewardCount * 4);
      return {
        delta: { treasury: -11, morale: -1, military: 0, court: courtGain },
        incrementReward: true,
        flavor: rewardCount === 0
          ? '金帛厚赐百官，朝臣皆感天恩浩荡，争先颂德，朝堂暂息纷争。'
          : '屡施封赏令朝士胃口日大，百官视若寻常，朝局安抚之效渐见迟滞。'
      };
    }
  },
  {
    id: 'rectify_governance',
    name: '整饬吏治',
    category: 'politics',
    tags: ['reform', 'anti_corruption', 'politics'],
    description: '考课天下官吏，黜落贪墨不法之人。',
    effectDisplay: '化解腐败  短期朝局动荡  民心提升',
    baseEffect: { treasury: 4, morale: 8, military: 0, court: -4 },
    targetType: 'optional_situation',
    targetTags: ['corruption', 'politics'],
    weight: 10,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (target && ['bureaucratic_corruption', 'corrupt_minister'].includes(target.id)) {
        return {
          delta: { treasury: 6, morale: 10, military: 0, court: 2 },
          resolveAmount: 2,
          flavor: `御史铁面无私纠弹蠹民长官，${target.name}受重创，风气为之一肃。`
        };
      }
      return {
        delta: { treasury: 3, morale: 8, military: 0, court: -3 },
        flavor: '裁革贪墨杂差，朝臣虽人人侧目忧惧，民间却对天子清明交口称赞。'
      };
    }
  },
  {
    id: 'curb_warlords',
    name: '下旨削藩',
    category: 'politics',
    tags: ['warlord', 'centralization', 'hardline'],
    description: '收藩镇节度兵权，迁转骄兵悍将入京述职。',
    effectDisplay: '高风险高收益  专治【边将拥兵】',
    baseEffect: { treasury: -4, morale: 0, military: -5, court: 14 },
    targetType: 'optional_situation',
    targetTags: ['warlord'],
    weight: 8,
    canHold: true,
    dynamicEffect: (state, target) => {
      if (state.military < 45) {
        return {
          delta: { treasury: -8, morale: -5, military: -10, court: -10 },
          resolveAmount: 0,
          flavor: '朝廷威令不及藩镇，边将抗表拒命拥兵自保，朝局险象环生！'
        };
      }
      return {
        delta: { treasury: 0, morale: 2, military: 2, court: 16 },
        resolveAmount: target ? 3 : 1,
        flavor: '雷霆手腕收回节度兵符，桀骜边将俯首听命，中央皇权大振！'
      };
    }
  },
  {
    id: 'covert_demotion',
    name: '明升暗降',
    category: 'politics',
    tags: ['politics', 'tactics'],
    description: '虚尊权要为三公师保，阴夺其枢密实权。',
    effectDisplay: '平稳消解权争  朝局：稳健↑  副作用轻微',
    baseEffect: { treasury: -2, morale: 2, military: 0, court: 8 },
    targetType: 'optional_situation',
    targetTags: ['politics', 'corruption'],
    weight: 9,
    canHold: true,
    dynamicEffect: (state, target) => {
      return {
        delta: { treasury: -2, morale: 2, military: 0, court: 8 },
        resolveAmount: target ? 1 : 0,
        flavor: '旨下进封元老极品散阶，其爪牙实权无声无息剥离，内廷波澜不惊。'
      };
    }
  },
  {
    id: 'capital_purge',
    name: '大索京师',
    category: 'politics',
    tags: ['purge', 'hardline', 'politics'],
    description: '缇骑四出连夜搜捕异己，诏狱严刑拷讯反仄。',
    effectDisplay: '朝局：暴涨  民心：重挫  获【高压统治】',
    baseEffect: { treasury: 5, morale: -15, military: 0, court: 18 },
    targetType: 'optional_situation',
    targetTags: ['politics', 'crisis'],
    weight: 8,
    canHold: true,
    dynamicEffect: (state, target) => {
      return {
        delta: { treasury: 5, morale: -14, military: 0, court: 18 },
        resolveAmount: target ? 2 : 0,
        addState: 'authoritarian_rule',
        flavor: '京华夜闭九门，铁锁锒铛，逆党连根拔起。朝堂肃杀，万民结舌。'
      };
    }
  },

  // ----------------- 特殊/国事类 (Special / Construction) -----------------
  {
    id: 'build_palace',
    name: '营建离宫',
    category: 'special',
    tags: ['construction', 'palace', 'prestige'],
    description: '广征天下良木奇石，兴造九重天宇巍峨离宫。',
    effectDisplay: '消耗巨款  战略价值低  检验帝王自律',
    baseEffect: { treasury: -22, morale: -4, military: 0, court: 4 },
    targetType: 'none',
    weight: 7,
    canHold: true,
    warningCondition: (situations) => situations.some(s => ['yellow_river_flood', 'border_war', 'major_rebellion', 'dynasty_crisis'].includes(s.id)),
    warningHint: '⚠ 战乱与灾年大兴土木，将致天下离心！',
    dynamicEffect: (state, target, prng, situations = []) => {
      const sitList = situations.length ? situations : (state.situations || []);
      const inCrisis = sitList.some(s => ['yellow_river_flood', 'border_war', 'major_rebellion', 'dynasty_crisis'].includes(s.id));
      if (inCrisis) {
        return {
          delta: { treasury: -22, morale: -18, military: 0, court: 2 },
          flavor: '四海鼎沸之时仍大兴土木，万民指天痛骂，怨毒之声彻于九霄。'
        };
      }
      if (state.morale > 70) {
        return {
          delta: { treasury: -20, morale: -3, military: 0, court: 5 },
          flavor: '广厦千万间，雕梁画栋连云蔽日。天朝上国气象威仪万方。'
        };
      }
      return {
        delta: { treasury: -20, morale: -8, military: 0, court: 4 },
        flavor: '工役繁剧劳民伤财，太仓银两如水泻地，朝野叹息帝心难测。'
      };
    }
  },
  {
    id: 'worship_heaven',
    name: '郊祀祭天',
    category: 'special',
    tags: ['ceremony', 'morale', 'prestige'],
    description: '率百官登圜丘斋戒行礼，告天地祈风调雨顺。',
    effectDisplay: '民心：微升  朝局：肃穆  小概率感应祥瑞',
    baseEffect: { treasury: -5, morale: 8, military: 0, court: 5 },
    targetType: 'none',
    weight: 8,
    canHold: true,
    dynamicEffect: (state, target, prng) => {
      const lucky = prng.nextFloat() < 0.35;
      if (lucky) {
        return {
          delta: { treasury: -4, morale: 14, military: 2, court: 8 },
          flavor: '柴望告天，云雾顿开白鹤回翔。天下传为景星庆云之兆，民气大振。'
        };
      }
      return {
        delta: { treasury: -5, morale: 8, military: 0, court: 5 },
        flavor: '清庙肃穆，礼乐齐备。君臣肃立祭告昊天，四海归心。'
      };
    }
  },
  {
    id: 'imperial_examination',
    name: '开科取士',
    category: 'special',
    tags: ['education', 'reform', 'talent'],
    description: '诏设博学鸿词科，不论门第拔擢天下寒骏。',
    effectDisplay: '朝局/民心：稳步上升  获【新政人才】',
    baseEffect: { treasury: -6, morale: 7, military: 0, court: 6 },
    targetType: 'none',
    weight: 9,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: -6, morale: 7, military: 0, court: 6 },
      addState: 'reform_talents',
      flavor: '春闱放榜，天下士子尽入天子彀中。获得【新政人才】，改革类行事威力倍增。'
    })
  },
  {
    id: 'military_reform',
    name: '变法军制',
    category: 'special',
    tags: ['military', 'reform', 'longterm'],
    description: '更定行伍兵籍法式，仿立新制禁旅，汰换腐旧。',
    effectDisplay: '高额军费  军势长远改善  获【军制革新】',
    baseEffect: { treasury: -16, morale: -2, military: 14, court: 7 },
    targetType: 'none',
    weight: 8,
    canHold: true,
    dynamicEffect: (state) => ({
      delta: { treasury: -16, morale: -2, military: 14, court: 7 },
      addState: 'military_reformed',
      flavor: '推行新军营制，厉行步炮协同。获得【军制革新】，全军战力焕然一新！'
    })
  }
];
