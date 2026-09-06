// 《一朝天子》Prototype 0.3 四大地理区域配置 (Regions)

export const REGIONS = {
  north: {
    id: 'north',
    name: '北境',
    summary: '长城关塞，边将戍卒云集，扼天下戎马之咽喉。',
    focus: '军事 · 边患 · 边将',
    initialStats: { prosperity: 45, order: 65, pressure: 35 },
    getStatusText(stats) {
      if (stats.pressure >= 75) return '大虏犯边，羽书夜驰';
      if (stats.pressure >= 50) return '烽燧渐惊，部落暗聚';
      if (stats.order >= 70) return '塞防严整，胡骑远遁';
      return '边市粗开，士卒戒备';
    }
  },
  south: {
    id: 'south',
    name: '江南',
    summary: '水陆冲会，粮秣泉贝所出，衣冠士族盘根错节。',
    focus: '商业 · 粮食 · 豪族',
    initialStats: { prosperity: 75, order: 60, pressure: 25 },
    getStatusText(stats) {
      if (stats.pressure >= 70) return '豪族兼并，隐占赋税';
      if (stats.prosperity >= 75) return '商旅云集，岁入丰盈';
      if (stats.order < 40) return '江防废弛，盐枭啸聚';
      return '市井繁华，租税按期';
    }
  },
  central: {
    id: 'central',
    name: '中原',
    summary: '黄淮沃野，宗庙陵寝所在，天下生齿繁庶之基。',
    focus: '人口 · 农业 · 灾害',
    initialStats: { prosperity: 60, order: 70, pressure: 30 },
    getStatusText(stats) {
      if (stats.pressure >= 70) return '旱涝荐臻，流殍转徙';
      if (stats.prosperity >= 70) return '河渠无虞，四野丰熟';
      if (stats.order < 40) return '民有饥色，盗寇窃发';
      return '郡县平靖，编户粗安';
    }
  },
  west: {
    id: 'west',
    name: '西陲',
    summary: '极边商路，回易诸邦，群蛮杂处之重地。',
    focus: '商路 · 外交 · 边疆',
    initialStats: { prosperity: 50, order: 55, pressure: 30 },
    getStatusText(stats) {
      if (stats.pressure >= 70) return '驿道断绝，羁縻不靖';
      if (stats.prosperity >= 70) return '丝路大通，商驼络绎';
      if (stats.order >= 65) return '藩部受抚，遣子入质';
      return '商队通达，斥堠粗立';
    }
  }
};
