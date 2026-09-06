// 《一朝天子》Prototype 0.3 多种子多局连续演化与生命力回归测试
import { GameState } from '../src/game.js';

// Mock localStorage
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

console.log('================ 运行 Prototype 0.3 多局多种子王朝演变测试 ================');

let totalRuns = 20;
let totalQuartersSimulated = 0;
let totalSuccessions = 0;
let sumContinuityRates = 0;
let sumRecurrenceRates = 0;
let sumIsolatedRatios = 0;
let totalHooksPlanted = 0;

for (let i = 1; i <= totalRuns; i++) {
  const seed = `v03_dynasty_sim_${i}_${Math.floor(Math.random() * 100000)}`;
  const game = new GameState(seed);
  game.startNewGame(seed);

  const isPureSpectator = i <= 10;
  const targetQuarters = 40; // 10年 = 40季

  for (let q = 1; q <= targetQuarters; q++) {
    // 若皇帝驾崩，新皇自动承继大统
    if (game.world.isSuccessionPending) {
      game.continueSuccession();
      totalSuccessions++;
    }

    if (isPureSpectator) {
      // 纯旁观模式：完全不操作，退朝无为
      game.adjournCourt();
    } else {
      // 玩家决策模式：约 40% 概率朱批一份提案，60% 退朝无为
      if (Math.random() < 0.4 && game.world.proposalManager.currentProposals.length > 0) {
        const prop = game.world.proposalManager.currentProposals[0];
        game.selectProposal(prop.id);
        game.enactSelectedProposal();
      } else {
        game.adjournCourt();
      }
    }
  }

  const metrics = game.telemetryManager.calculateMetrics(game.world);
  totalQuartersSimulated += metrics.totalTurns;
  sumContinuityRates += parseFloat(metrics.storyContinuityRate) || 0;
  sumRecurrenceRates += parseFloat(metrics.characterRecurrenceRate) || 0;
  sumIsolatedRatios += parseFloat(metrics.isolatedRandomEventRatio) || 0;
  totalHooksPlanted += metrics.causalHooksPlanted;

  const modeStr = isPureSpectator ? '【纯旁观无为】' : '【天子御批】';
  console.log(`第 ${i} 局 ${modeStr} (${game.world.royalFamilyManager.emperor.dynasty} · ${game.world.turn}季): 故事连续率 ${metrics.storyContinuityRate}, 人物复现率 ${metrics.characterRecurrenceRate}, 孤立率 ${metrics.isolatedRandomEventRatio}`);
}

const avgContinuity = (sumContinuityRates / totalRuns).toFixed(1);
const avgRecurrence = (sumRecurrenceRates / totalRuns).toFixed(1);
const avgIsolated = (sumIsolatedRatios / totalRuns).toFixed(1);

console.log('\n================ Prototype 0.3 综合宏观统计结果 ================');
console.log(`总模拟局数: ${totalRuns} 局 (10局纯旁观 + 10局决策操作)`);
console.log(`累计推演季度: ${totalQuartersSimulated} 季 (约 ${Math.floor(totalQuartersSimulated / 4)} 载天家春秋)`);
console.log(`发生皇位继承: ${totalSuccessions} 次大统更始`);
console.log(`平均故事连续率 (Thread占比): ${avgContinuity}% (目标: > 20%)`);
console.log(`平均人物复现率 (熟悉名宿出镜): ${avgRecurrence}% (目标: > 35%)`);
console.log(`平均孤立事件率: ${avgIsolated}% (目标: < 5%)`);
console.log(`累计种植因果 Hook: ${totalHooksPlanted} 个`);
console.log('===============================================================');
