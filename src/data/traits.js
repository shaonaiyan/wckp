// 《一朝天子》Prototype 0.3 人物性格与关系标签 (Traits & Relations)

export const CHARACTER_TRAITS = {
  upright: {
    id: 'upright',
    name: '刚直',
    desc: '秉公不阿，疾恶如仇，敢于直言批鳞。',
    preferredActions: ['impeach', 'reform', 'refuse_bribe'],
    tendency: '言官御史多出此辈，常与权门结怨'
  },
  tactful: {
    id: 'tactful',
    name: '圆滑',
    desc: '深谙官场进退，善弥缝群臣，不立危墙。',
    preferredActions: ['compromise', 'form_alliance', 'seek_promotion'],
    tendency: '朝中和事老，长于调停但鲜有担当'
  },
  ambitious: {
    id: 'ambitious',
    name: '野心',
    desc: '志在青云开府，广植党羽，不甘居人之下。',
    preferredActions: ['expand_army', 'request_title', 'recommend_follower'],
    tendency: '若假以权柄则成藩镇或权臣，需恩威并济'
  },
  devoted: {
    id: 'devoted',
    name: '忠谨',
    desc: '奉公守节，克己奉君，夙夜不敢有怠。',
    preferredActions: ['diligent_duty', 'guard_heir', 'expose_plot'],
    tendency: '社稷砥柱，不易受私利动摇'
  },
  martial: {
    id: 'martial',
    name: '尚武',
    desc: '好谈兵甲，果敢狠厉，信奉金戈立威。',
    preferredActions: ['petition_war', 'border_patrol', 'train_troops'],
    tendency: '边将骄悍多出此性，极力主伐'
  },
  benevolent: {
    id: 'benevolent',
    name: '宽仁',
    desc: '矜恤民力，敦厚待下，厌事刑杀征敛。',
    preferredActions: ['famine_relief', 'plead_clemency', 'ease_tax'],
    tendency: '深受百姓爱戴，然失之于姑息'
  },
  mercantile: {
    id: 'mercantile',
    name: '重利',
    desc: '算度分文，通商殖产，唯利是图。',
    preferredActions: ['expand_trade', 'secure_monopoly', 'donate_funds'],
    tendency: '巨商豪贾与榷盐使多出此流，善聚敛'
  },
  incorruptible: {
    id: 'incorruptible',
    name: '清廉',
    desc: '两袖清风，食粝衣布，一介不取于公帑。',
    preferredActions: ['audit_treasury', 'live_austere', 'spurn_gifts'],
    tendency: '民颂青天，然下属多苦其察察'
  },
  extravagant: {
    id: 'extravagant',
    name: '奢靡',
    desc: '喜陈服玩，好治楼台，宴饮无节。',
    preferredActions: ['build_palace', 'host_banquet', 'solicit_rewards'],
    tendency: '耗费国币，常迎合上意求宠'
  },
  reforming: {
    id: 'reforming',
    name: '改革',
    desc: '痛陈旧弊，锐意更张，不惜决裂旧贵。',
    preferredActions: ['enact_new_policy', 'check_gentry', 'reorganize_system'],
    tendency: '大变法之推手，极易招致朋党围攻'
  },
  conservative: {
    id: 'conservative',
    name: '保守',
    desc: '恪遵典宪祖制，戒惧轻浮，持重守成。',
    preferredActions: ['defend_tradition', 'oppose_reform', 'counsel_patience'],
    tendency: '旧家重臣之本色，抗拒变法'
  },
  suspicious: {
    id: 'suspicious',
    name: '多疑',
    desc: '窥察幽微，深惧遭陷，不易以至诚交人。',
    preferredActions: ['spy_colleague', 'withhold_trust', 'plant_doubt'],
    tendency: '密探爪牙善用其隙，易构大狱'
  }
};

export const RELATION_TYPES = {
  close: { id: 'close', label: '亲近', desc: '相交莫逆，情谊深厚' },
  alliance: { id: 'alliance', label: '同盟', desc: '唇齿相依，进退一致' },
  mentor_student: { id: 'mentor_student', label: '师生', desc: '受业传道，荣辱相关' },
  rival: { id: 'rival', label: '政敌', desc: '政见冰炭，势难两全' },
  patron: { id: 'patron', label: '恩主', desc: '受其拔擢，倚为门下' },
  in_law: { id: 'in_law', label: '姻亲', desc: '朱陈结好，宗支通婚' },
  hostile: { id: 'hostile', label: '敌视', desc: '嫌隙入骨，势成水火' }
};
