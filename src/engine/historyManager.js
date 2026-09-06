// 《一朝天子》Prototype 0.3 史册编年管理器 (HistoryManager)
// 忠实记录《实录》起居注，按时间归档天下大势、朝臣荣辱与天家春秋 (Section 56)

import { BALANCE } from '../data/balance.js';

export class HistoryManager {
  constructor(eraName = '永安') {
    this.eraName = eraName;
    this.entries = []; // [{ turn, year, season, timeText, type, title, text }]
  }

  reset(eraName = '永安') {
    this.eraName = eraName;
    this.entries = [];
  }

  getYear(turn) {
    return Math.floor((turn - 1) / BALANCE.ROUNDS_PER_YEAR) + 1;
  }

  getSeason(turn) {
    return BALANCE.SEASONS[(turn - 1) % BALANCE.ROUNDS_PER_YEAR];
  }

  toChineseNumber(num) {
    const digits = ['零', '元', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return digits[num];
    if (num < 20) return '十' + (num % 10 === 0 ? '' : digits[num % 10]);
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return digits[tens] + '十' + (ones === 0 ? '' : digits[ones]);
  }

  getYearSeasonText(turn, currentEra = null) {
    const era = currentEra || this.eraName;
    const year = this.getYear(turn);
    const season = this.getSeason(turn);
    const yearText = this.toChineseNumber(year);
    return `${era}${yearText}年 ${season}`;
  }

  recordCoronation(dynasty, era, age) {
    this.eraName = era;
    this.entries.push({
      turn: 1,
      year: 1,
      season: '春',
      timeText: `${era}元年 春`,
      type: 'succession',
      title: '先帝新丧 · 嗣皇帝登极',
      text: `${dynasty}先帝龙驭宾天，皇太子于太极殿即皇帝位，年二十九，受命于天，改元${era}。`
    });
  }

  recordPlayerAction(turn, proposalTitle, sourceDept, feedback, era = null) {
    const timeText = this.getYearSeasonText(turn, era);
    this.entries.push({
      turn,
      year: this.getYear(turn),
      season: this.getSeason(turn),
      timeText,
      type: 'action',
      title: `御批：${proposalTitle}`,
      text: `帝朱批【${proposalTitle}】(${sourceDept})。${feedback}`
    });
  }

  recordAdjourn(turn, era = null) {
    const timeText = this.getYearSeasonText(turn, era);
    this.entries.push({
      turn,
      year: this.getYear(turn),
      season: this.getSeason(turn),
      timeText,
      type: 'adjourn',
      title: '退朝无为 · 诸司奉例',
      text: '季内未降特旨，天子垂拱穆然，中枢六卿依律条公文循例行事。'
    });
  }

  recordWorldEvent(turn, headline, text, category = 'realm', era = null) {
    const timeText = this.getYearSeasonText(turn, era);
    this.entries.push({
      turn,
      year: this.getYear(turn),
      season: this.getSeason(turn),
      timeText,
      type: category,
      title: headline,
      text
    });
  }

  recordSuccession(turn, newEra, newName) {
    this.eraName = newEra;
    const timeText = this.getYearSeasonText(turn, newEra);
    this.entries.push({
      turn,
      year: this.getYear(turn),
      season: this.getSeason(turn),
      timeText,
      type: 'succession',
      title: `大统更始 · ${newEra}改元`,
      text: `皇嗣【${newName}】即大皇帝位，御皇极门受百官朝贺，颁恩诏大赦天下，宣布改元【${newEra}】。`
    });
  }

  getAllEntries() {
    return this.entries;
  }

  restore(data) {
    if (!data) return;
    this.eraName = data.eraName || '永安';
    this.entries = Array.isArray(data.entries) ? [...data.entries] : [];
  }
}
