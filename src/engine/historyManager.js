// 史册编年史管理器：格式化编年史历史记录，生成简短历史条目
import { BALANCE } from '../data/balance.js';

export class HistoryManager {
  constructor(eraName = '永和') {
    this.eraName = eraName;
    this.entries = []; // [{ turn, year, season, title, text, deltaSummary }]
  }

  reset(eraName) {
    if (eraName) this.eraName = eraName;
    this.entries = [];
  }

  // 获取纪年文本，如 "永和二年 秋"
  getYearSeasonText(turn) {
    const year = Math.floor((turn - 1) / BALANCE.ROUNDS_PER_YEAR) + 1;
    const seasonIndex = (turn - 1) % BALANCE.ROUNDS_PER_YEAR;
    const season = BALANCE.SEASONS[seasonIndex];
    const yearChinese = this.toChineseNumber(year);
    return `${this.eraName}${yearChinese}年 ${season}`;
  }

  toChineseNumber(num) {
    const digits = ['零', '元', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return digits[num];
    if (num < 20) return '十' + (num % 10 === 0 ? '' : digits[num % 10]);
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return digits[tens] + '十' + (ones === 0 ? '' : digits[ones]);
  }

  // 记录开局登基
  recordCoronation() {
    this.entries.push({
      turn: 1,
      timeText: `${this.eraName}元年 春`,
      type: 'coronation',
      title: '新帝登基',
      text: '受命于天，践祚临轩。万邦来贺，天下尚安。'
    });
  }

  // 记录一轮的出牌与局势发展
  recordTurnEvent(turn, cardName, flavorText, delta, situationEventText = null) {
    const timeText = this.getYearSeasonText(turn);
    let shortText = flavorText;
    if (situationEventText) {
      shortText += ' ' + situationEventText;
    }

    // 控制文本在 50 字左右
    if (shortText.length > 60) {
      shortText = shortText.slice(0, 58) + '…';
    }

    this.entries.push({
      turn,
      timeText,
      type: 'action',
      title: `诏行【${cardName}】`,
      text: shortText,
      delta: { ...delta }
    });
  }

  // 记录重大危机发生或化解
  recordCrisis(turn, text) {
    const timeText = this.getYearSeasonText(turn);
    this.entries.push({
      turn,
      timeText,
      type: 'crisis',
      title: '天下震动',
      text
    });
  }

  // 记录终局
  recordEnding(turn, isVictory, reason) {
    const timeText = this.getYearSeasonText(turn);
    this.entries.push({
      turn,
      timeText,
      type: isVictory ? 'victory' : 'defeat',
      title: isVictory ? '江山暂安' : '王朝倾覆',
      text: isVictory ? '在位四十载四海晏然，终定一代治世基业。' : `国祚中断。${reason}。`
    });
  }

  getAllEntries() {
    return this.entries;
  }
}
