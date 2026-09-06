// Prototype 0.2 多种子多局模拟与平衡性回归验证
import { GameState } from '../src/game.js';
import { InteractionResolver } from '../src/engine/interactionResolver.js';

// Mock localStorage
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

console.log('================ 运行 Prototype 0.2 多局多种子策略模拟 ================');

let victories = 0;
let defeats = 0;
const defeatReasons = {};
let totalTurns = 0;
let totalExcellentPlays = 0;
let totalGoodPlays = 0;
let totalWeakPlays = 0;
let totalNeglectEscalationsAll = 0;

for (let i = 1; i <= 20; i++) {
  const seed = `v02_sim_${i}_${Math.floor(Math.random() * 100000)}`;
  const game = new GameState(seed);
  game.startNewGame(seed);
  game.godMode = false;

  let turns = 0;
  while (!game.isGameOver && game.turn <= 40 && turns < 50) {
    turns++;

    // 启发式决策：优先寻找当前最高评级的应对
    const hand = game.deckManager.hand;
    let chosenCard = hand[0];
    let chosenTarget = null;
    let highestQualityScore = -10;

    for (const card of hand) {
      const analysis = InteractionResolver.analyzeCardOptions(
        card,
        game.stateManager,
        game.situationManager.getActive(),
        game.policyManager,
        game.residueManager
      );

      let score = 0;
      if (analysis.bestQuality === 'excellent') score = 30;
      else if (analysis.bestQuality === 'good') score = 20;
      else if (analysis.bestQuality === 'weak') score = 5;
      else score = 0;

      // 如果目标是重大危机或高阶段局势，加分
      if (analysis.autoTarget && analysis.autoTarget.stage >= 2) {
        score += 15 * analysis.autoTarget.stage;
      }

      if (score > highestQualityScore) {
        highestQualityScore = score;
        chosenCard = card;
        chosenTarget = analysis.autoTarget ? analysis.autoTarget.id : (analysis.validTargets[0] ? analysis.validTargets[0].id : null);
      }
    }

    game.selectCard(chosenCard.id);
    if (chosenTarget) game.selectedSituationId = chosenTarget;
    const playRes = game.playSelectedCard();

    if (playRes) {
      if (playRes.quality === 'excellent') totalExcellentPlays++;
      else if (playRes.quality === 'good') totalGoodPlays++;
      else totalWeakPlays++;
    }

    // 偶尔保留一张牌
    if (game.deckManager.hand.length > 0 && Math.random() < 0.3) {
      game.toggleKeepCard(game.deckManager.hand[0].id);
    }

    game.adjournCourt();

    // 年度定策
    if (game.phase === 'ANNUAL_POLICY') {
      const opts = game.policyManager.pendingOptions || game.policyManager.generateDraftOptions();
      game.applyAnnualPolicySelection(opts[0].id);
    }
  }

  totalTurns += game.turn;
  totalNeglectEscalationsAll += game.telemetryManager.totalNeglectEscalations;

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

console.log('\n================ Prototype 0.2 模拟统计结果 ================');
console.log(`存活胜局: ${victories} / 20 (${(victories / 20 * 100).toFixed(1)}%)`);
console.log(`倾覆败局: ${defeats} / 20 (${(defeats / 20 * 100).toFixed(1)}%)`);
console.log(`平均存活季度: ${(totalTurns / 20).toFixed(1)} 季`);
console.log(`总放任恶化次数: ${totalNeglectEscalationsAll} 次 (平均每局 ${(totalNeglectEscalationsAll / 20).toFixed(1)} 次)`);
console.log(`出牌评级分布: 极有效(★): ${totalExcellentPlays}, 有效(▲): ${totalGoodPlays}, 勉强/通用: ${totalWeakPlays}`);
console.log('失败灭亡原因分布:', defeatReasons);
