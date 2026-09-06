// Prototype 0.2 史册因果编年史管理器 (HistoryManager)
// 记录清晰的因果链条：原因 / 局势背景 → 圣意决断 → 产生后果与后遗状态

import { BALANCE } from '../data/balance.js';

export class HistoryManager {
  constructor(eraName = '永和') {
    this.eraName = eraName;
    this.entries = []; // [{ turn, timeText, title, text, type, tag }]
  }

  reset(eraName) {
    if (eraName) this.eraName = eraName;
    this.entries = [];
  }

  getYearSeasonText(turn) {
    const year = Math.floor((turn - 1) / BALANCE.ROUNDS_PER_YEAR) + 1;
    const season = BALANCE.SEASONS[(turn - 1) % BALANCE.ROUNDS_PER_YEAR];
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

  recordCoronation() {
    this.entries.push({
      turn: 1,
      timeText: `${this.eraName}元年 春`,
      type: 'coronation',
      title: '新帝践祚',
      text: '受命于天，临御万邦。天下尚安，江南岁稔，朝臣待敕。'
    });
  }

  // 记录出牌因果链 (原因 → 行为 → 后果)
  recordCausalAction(turn, situationName, cardName, historyText, residueName = null) {
    const timeText = this.getYearSeasonText(turn);
    let fullText = '';
    if (situationName) {
      fullText = `针对【${situationName}】，帝诏行【${cardName}】。${historyText}`;
    } else {
      fullText = `帝行【${cardName}】。${historyText}`;
    }

    if (residueName) {
      fullText += ` 因而种下【${residueName}】之因。`;
    }

    this.entries.push({
      turn,
      timeText,
      type: 'action',
      title: situationName ? `应对【${situationName}】` : `诏行【${cardName}】`,
      text: fullText
    });
  }

  // 记录放任恶化
  recordNeglect(turn, situationName, stageText, historyText) {
    const timeText = this.getYearSeasonText(turn);
    this.entries.push({
      turn,
      timeText,
      type: 'neglect',
      title: `【${situationName}】放任恶化`,
      text: `朝廷此前未予处置，【${situationName}】已由${stageText}。${historyText}`
    });
  }

  // 记录年度定策
  recordPolicy(turn, policyName, desc) {
    const timeText = this.getYearSeasonText(turn);
    this.entries.push({
      turn,
      timeText,
      type: 'policy',
      title: `朝议定策：${policyName}`,
      text: `岁末召群臣合议，定国策为【${policyName}】。${desc}`
    });
  }

  // 记录终局
  recordEnding(turn, isVictory, reason) {
    const timeText = this.getYearSeasonText(turn);
    this.entries.push({
      turn,
      timeText,
      type: isVictory ? 'victory' : 'defeat',
      title: isVictory ? '江山暂安' : '社稷倾覆',
      text: isVictory ? '在位四十载四海宴然，终成一代治世令主。' : `国祚中绝。${reason}。`
    });
  }

  getAllEntries() {
    return this.entries;
  }
}
