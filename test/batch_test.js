// 多种子多局连续自动化回归与流派倾向测试
import { GameState } from '../src/game.js';

// Mock localStorage
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

console.log('================ 运行 20 局多种子随机策略模拟 ================');

let victories = 0;
let defeats = 0;
const defeatReasons = {};
let totalTurnsAcrossGames = 0;

for (let i = 1; i <= 20; i++) {
  const seed = `batch_game_${i}_seed_${Math.floor(Math.random() * 100000)}`;
  const game = new GameState(seed);
  game.startNewGame(seed);
  game.godMode = false; // 正常胜负判定

  let turnsInGame = 0;
  while (!game.isGameOver && game.turn <= 40 && turnsInGame < 50) {
    turnsInGame++;
    
    // 启发式出牌策略模拟人类取舍：
    // 优先处理场上严重的危机/局势，否则根据当前最低属性出牌
    const hand = game.cardManager.hand;
    const sits = game.situationManager.getActive();
    const stats = game.stateManager.getStats();

    let chosenCard = hand[0];
    let chosenTarget = null;

    // 优先响应场上负面/危机局势
    const crisis = sits.find(s => s.category === 'crisis') || sits.find(s => s.category === 'negative');
    if (crisis) {
      const responder = hand.find(c => {
        if (c.targetTags && c.targetTags.some(t => crisis.responsiveTags.includes(t) || crisis.id === t)) return true;
        if (c.tags && c.tags.some(t => crisis.responsiveTags.includes(t))) return true;
        return false;
      });
      if (responder) {
        chosenCard = responder;
        chosenTarget = crisis.id;
      }
    } else {
      // 缺啥补啥
      const minStat = Object.entries(stats).sort((a, b) => a[1] - b[1])[0][0];
      const helper = hand.find(c => {
        if (minStat === 'treasury' && c.category === 'finance') return true;
        if (minStat === 'morale' && c.category === 'livelihood') return true;
        if (minStat === 'military' && c.category === 'military') return true;
        if (minStat === 'court' && c.category === 'politics') return true;
        return false;
      });
      if (helper) chosenCard = helper;
    }

    game.selectedCardId = chosenCard.id;
    game.selectedSituationId = chosenTarget;
    game.playSelectedCard();

    // 偶尔选择保留一张有用的牌
    if (game.cardManager.hand.length > 0 && Math.random() < 0.4) {
      game.toggleKeepCard(game.cardManager.hand[0].id);
    }

    game.adjournCourt();
  }

  totalTurnsAcrossGames += game.turn;

  if (game.gameOutcome === 'victory') {
    victories++;
    console.log(`第 ${i} 局 (${seed}): 胜利！存活 40 季。`);
  } else {
    defeats++;
    const reason = game.defeatReason || '未知原因';
    defeatReasons[reason] = (defeatReasons[reason] || 0) + 1;
    console.log(`第 ${i} 局 (${seed}): 失败。在第 ${game.turn} 季倾覆，原因: ${reason}`);
  }
}

console.log('\n================ 20 局模拟统计结果 ================');
console.log(`存活胜局: ${victories} / 20 (${(victories / 20 * 100).toFixed(1)}%)`);
console.log(`倾覆败局: ${defeats} / 20 (${(defeats / 20 * 100).toFixed(1)}%)`);
console.log(`平均存活季度: ${(totalTurnsAcrossGames / 20).toFixed(1)} 季`);
console.log('主要灭亡原因分布:', defeatReasons);
