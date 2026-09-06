// 《一朝天子》Prototype 0.3 朝野五大势力 (Factions)

export const FACTIONS = {
  civil: {
    id: 'civil',
    name: '文官',
    title: '文官清流',
    desc: '科举名臣、三省宰辅与言路御史，操持礼法度支与朝议。',
    initialInfluence: 65,
    getInfluenceText(inf) {
      if (inf >= 75) return '文教极盛，众卿擅议国政';
      if (inf >= 50) return '六官恪奉，百司规矩';
      if (inf >= 30) return '言路不畅，士气微弱';
      return '清议凋敝，百僚噤声';
    }
  },
  military: {
    id: 'military',
    name: '武将',
    title: '禁卫边将',
    desc: '京师宿卫与四方镇将，仗金甲弓矢，多怀开拓封侯之志。',
    initialInfluence: 55,
    getInfluenceText(inf) {
      if (inf >= 75) return '军威跋扈，边将各专征伐';
      if (inf >= 50) return '将校奋励，部伍整肃';
      if (inf >= 30) return '武备渐疲，将帅束手';
      return '边备解体，禁卫老弱';
    }
  },
  gentry: {
    id: 'gentry',
    name: '豪族',
    title: '郡望名族',
    desc: '历代仕宦门阀与地方土豪，广占良田、庇护隐户，势压州县。',
    initialInfluence: 50,
    getInfluenceText(inf) {
      if (inf >= 75) return '门阀盘根，公府莫敢轻发';
      if (inf >= 50) return '士绅守礼，输纳赋税';
      if (inf >= 30) return '田亩清丈，豪宗屏息';
      return '门阀破散，州县奉公';
    }
  },
  merchants: {
    id: 'merchants',
    name: '商人',
    title: '商贾行会',
    desc: '东南巨富、海商榷盐大贾，货通四海，手握国家关防榷课。',
    initialInfluence: 45,
    getInfluenceText(inf) {
      if (inf >= 75) return '金穴富国，通商干预榷税';
      if (inf >= 50) return '市舶通畅，关税充盈';
      if (inf >= 30) return '海禁严饬，商市平淡';
      return '商路梗绝，榷入大亏';
    }
  },
  palace: {
    id: 'palace',
    name: '内廷',
    title: '内侍内廷',
    desc: '司礼中官与御前近侍，掌宣密旨、掌管库藏，倚仗皇权阴庇。',
    initialInfluence: 40,
    getInfluenceText(inf) {
      if (inf >= 75) return '中官典兵，内批出入无忌';
      if (inf >= 50) return '恪守内训，谨慎供奉';
      if (inf >= 30) return '宫规严肃，禁绝外干';
      return '深宫肃静，绝无越制';
    }
  }
};
