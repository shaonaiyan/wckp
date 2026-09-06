// 自动化仿真测试脚本：验证40轮运行、边界约束、局势上限、随机复现、JSON导出与失败判定
import { GameState } from '../src/game.js';
import { CARDS } from '../src/data/cards.js';
import { SITUATIONS } from '../src/data/situations.js';
import { LONG_TERM_STATES } from '../src/data/states.js';
import { BALANCE } from '../src/data/balance.js';

// Mock localStorage for node environment
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

console.log('================ 开始《一朝天子》核心自动化验证 ================');
console.log(`配置检查：卡牌数 ${CARDS.length} 张，局势数 ${SITUATIONS.length} 个，长期状态数 ${Object.keys(LONG_TERM_STATES).length} 个。`);

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  }
}

// ---------------- 测试 1: 种子可复现性 ----------------
console.log('\n--- 测试 1: 种子可复现性 ---');
const seedTest = 'test_seed_abc123';
const gameA = new GameState(seedTest);
gameA.startNewGame(seedTest);
const initialHandA = gameA.cardManager.hand.map(c => c.id);
const initialStatsA = gameA.stateManager.getStats();

const gameB = new GameState(seedTest);
gameB.startNewGame(seedTest);
const initialHandB = gameB.cardManager.hand.map(c => c.id);
const initialStatsB = gameB.stateManager.getStats();

assert(JSON.stringify(initialHandA) === JSON.stringify(initialHandB), '相同 Seed 下初始 5 张手牌完全一致');
assert(JSON.stringify(initialStatsA) === JSON.stringify(initialStatsB), '相同 Seed 下初始四项属性完全一致');

// ---------------- 测试 2: 第一轮节奏验证 ----------------
console.log('\n--- 测试 2: 第一轮节奏验证 ---');
assert(gameA.turn === 1, '第一轮回合数为 1');
assert(gameA.situationManager.getActive().length === 1, '第一轮场上局势严格只有 1 个');
assert(gameA.situationManager.getActive()[0].id === 'harvest_south', '第一轮局势严格固定为【江南丰收】');
assert(gameA.cardManager.hand.length === 5, '第一轮手牌严格为 5 张');

// 验证防极端烂手规则：不能5张完全同类
const categories = new Set(gameA.cardManager.hand.map(c => c.category));
assert(categories.size >= 2, `首轮手牌种类数 >= 2 (实际: ${categories.size})`);

// ---------------- 测试 3: 出牌与保留牌机制 ----------------
console.log('\n--- 测试 3: 出牌与保留牌机制 ---');
const cardToPlay = gameA.cardManager.hand[0];
gameA.selectCard(cardToPlay.id);
const playResult = gameA.playSelectedCard();
assert(playResult.success, `成功打出手牌【${cardToPlay.name}】`);
assert(gameA.phase === 'POST_PLAY', '打牌后状态进入 POST_PLAY');
assert(gameA.cardManager.hand.length === 4, '打牌后剩余手牌为 4 张');

// 测试保留一张牌
const cardToKeep = gameA.cardManager.hand[0];
gameA.toggleKeepCard(cardToKeep.id);
assert(gameA.cardManager.keptCard && gameA.cardManager.keptCard.id === cardToKeep.id, '成功标记保留一张牌留待下朝');

// 退朝
gameA.adjournCourt();
assert(gameA.turn === 2, '退朝后进入第 2 季');
assert(gameA.phase === 'PLAY_CARD', '新一季状态切回 PLAY_CARD');
assert(gameA.cardManager.hand.length === 5, '补牌后总手牌恢复为 5 张');
const hasKept = gameA.cardManager.hand.some(c => c.id === cardToKeep.id && c.isKeptFromPrev);
assert(hasKept, '上一轮保留的牌成功继承到下一季手牌中');

// ---------------- 测试 4: 局势上限不超过 3 个，且处理替换/合并 ----------------
console.log('\n--- 测试 4: 局势上限与合并机制 ---');
gameA.situationManager.clearAll();
gameA.situationManager.addSituation('harvest_south');
gameA.situationManager.addSituation('northern_incursion');
gameA.situationManager.addSituation('yellow_river_flood');
assert(gameA.situationManager.getActive().length === 3, '添加3个局势后数量为 3');

// 尝试加入第4个负面局势
gameA.situationManager.addSituation('corrupt_minister');
assert(gameA.situationManager.getActive().length <= 3, '添加第4个局势后，场上局势严格不超过 3 个 (已替换正面局势)');

// ---------------- 测试 5: 完整40轮自动推演测试 (God Mode 跑满) ----------------
console.log('\n--- 测试 5: 完整 40 轮推演与数据约束检查 ---');
const simGame = new GameState('sim_40_turns');
simGame.startNewGame('sim_40_turns');
simGame.godMode = true; // 确保不因中途偶然失败中断，跑满40轮流程

let roundsCompleted = 0;
let nanDetected = false;
let outOfRangeDetected = false;
let situationOverflow = false;

while (!simGame.isGameOver && simGame.turn <= 40) {
  roundsCompleted++;

  // 检查属性范围与 NaN
  const stats = simGame.stateManager.getStats();
  for (const [k, v] of Object.entries(stats)) {
    if (isNaN(v)) nanDetected = true;
    if (v < 0 || v > 100) outOfRangeDetected = true;
  }

  // 检查局势数量
  if (simGame.situationManager.getActive().length > 3) {
    situationOverflow = true;
  }

  // 随机挑选一张手牌打出
  const hand = simGame.cardManager.hand;
  assert(hand.length > 0, `第 ${simGame.turn} 轮手牌不为空`);
  const card = hand[0];
  simGame.selectedCardId = card.id;

  // 若需要局势目标，选定场上首个局势
  const sits = simGame.situationManager.getActive();
  if (sits.length > 0) {
    simGame.selectedSituationId = sits[0].id;
  }

  simGame.playSelectedCard();

  // 偶尔保留一张牌
  if (simGame.cardManager.hand.length > 0 && Math.random() > 0.5) {
    simGame.toggleKeepCard(simGame.cardManager.hand[0].id);
  }

  // 退朝
  simGame.adjournCourt();
}

assert(roundsCompleted >= 40, `完整运行推演至第 40 轮 (实际运行: ${roundsCompleted} 轮)`);
assert(!nanDetected, '过程中未出现任何 NaN 数据');
assert(!outOfRangeDetected, '国家四维属性全程处于 0~100 合法区间');
assert(!situationOverflow, '场上局势数量全程严格不超过 3 个');
assert(simGame.isGameOver, '40 轮后游戏正常结束结算');
assert(simGame.gameOutcome === 'victory', '40 轮后触发江山暂安 (victory)');

// ---------------- 测试 6: 失败判定测试 ----------------
console.log('\n--- 测试 6: 失败判定测试 ---');
const defeatGame = new GameState('defeat_test');
defeatGame.startNewGame('defeat_test');
defeatGame.godMode = false;
// 人为使两个属性降为0
defeatGame.stateManager.treasury = 0;
defeatGame.stateManager.morale = 0;
const defeatResult = defeatGame.checkEndCondition();
assert(defeatResult === true, '双属性归零正确触发社稷倾覆');
assert(defeatGame.isGameOver === true && defeatGame.gameOutcome === 'defeat', '游戏状态标记为 defeat 失败');

// ---------------- 测试 7: 遥测数据报告与 JSON 导出结构验证 ----------------
console.log('\n--- 测试 7: 遥测数据报告与 JSON 导出结构验证 ---');
const jsonString = simGame.telemetryManager.exportJSON(
  simGame.cardManager.cardStats,
  simGame.situationManager.situationHistory,
  simGame.stateManager
);
assert(typeof jsonString === 'string' && jsonString.length > 500, '成功导出 JSON 字符串');

const parsed = JSON.parse(jsonString);
assert(parsed.metadata && parsed.metadata.seed === 'sim_40_turns', 'JSON 包含元数据与正确 Seed');
assert(parsed.summary && parsed.summary.totalTurnsSurviving === 40, 'JSON 包含汇总概况与40轮存活');
assert(parsed.cards_statistics && Object.keys(parsed.cards_statistics).length === CARDS.length, `卡牌统计覆盖全部 ${CARDS.length} 张牌`);
assert(parsed.situations_statistics && Object.keys(parsed.situations_statistics).length === SITUATIONS.length, `局势统计覆盖全部 ${SITUATIONS.length} 种局势`);
assert(Array.isArray(parsed.turns_log) && parsed.turns_log.length === 40, '每轮明细日志完整记录 40 轮');

// ---------------- 测试 8: 存档与读档恢复测试 ----------------
console.log('\n--- 测试 8: 存档与读档恢复测试 ---');
import { SaveManager } from '../src/engine/saveManager.js';
const testSaveGame = new GameState('save_seed');
testSaveGame.startNewGame('save_seed');
testSaveGame.turn = 15;
testSaveGame.stateManager.treasury = 42;
SaveManager.save(testSaveGame);

const restoredGame = new GameState();
const loadSuccess = restoredGame.loadFromSave();
assert(loadSuccess === true, '成功从 localStorage 恢复存档');
assert(restoredGame.turn === 15, '恢复的回合数正确 (15)');
assert(restoredGame.stateManager.treasury === 42, '恢复的国库数值正确 (42)');

console.log(`\n🎉 全部自动化验证完成：${passedTests}/${totalTests} 通过！`);
