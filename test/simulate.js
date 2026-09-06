// Prototype 0.2 核心全量自动化验证脚本
import { GameState } from '../src/game.js';
import { CARDS } from '../src/data/cards.js';
import { SITUATIONS } from '../src/data/situations.js';
import { RESIDUES } from '../src/data/residues.js';
import { POLICIES } from '../src/data/policies.js';
import { BALANCE } from '../src/data/balance.js';
import { InteractionResolver } from '../src/engine/interactionResolver.js';

// Mock localStorage
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

console.log('================ 开始《一朝天子》Prototype 0.2 核心自动化验证 ================');
console.log(`配置检查：卡牌 ${CARDS.length} 张，局势 ${SITUATIONS.length} 种，后遗状态 ${Object.keys(RESIDUES).length} 种，年度国策 ${Object.keys(POLICIES).length} 种。`);

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

// ---------------- 测试 1: 真实实体牌库与无重复抽牌 ----------------
console.log('\n--- 测试 1: 真实实体牌库与无重复抽牌 ---');
const game = new GameState('seed_deck_test');
game.startNewGame('seed_deck_test');

assert(game.deckManager.hand.length === 5, '首轮手牌为 5 张');
assert(game.deckManager.drawPile.length === 19, '24张实体牌库抽5张后剩余19张 (24-5=19)');
const uniqueHandIds = new Set(game.deckManager.hand.map(c => c.id));
assert(uniqueHandIds.size === 5, '手牌中无同名牌重复');
assert(game.deckManager.handBeforePlay.length === 5, '出牌前完整快照包含 5 张手牌 (已修复 0.1 Telemetry 缺陷)');

// ---------------- 测试 2: 目标自动锁定与有效性判定 (Section 1) ----------------
console.log('\n--- 测试 2: 目标自动锁定与有效性判定 ---');
// 清空并只设置【北境犯边】
game.situationManager.clearAll();
game.situationManager.addSituation('northern_incursion');
game.deckManager.forceCardToHand('dispatch_troops_north');

// 玩家点击【调兵北上】
game.selectCard('dispatch_troops_north');
assert(game.selectedSituationId === 'northern_incursion', '唯一明显合法目标自动锁定为【北境犯边】');
assert(game.autoTargeted === true, '标记为自动索敌锁定 autoTargeted: true');

// 执行出牌
const playRes = game.playSelectedCard();
assert(playRes.success === true, '成功打出【调兵北上】');
assert(playRes.targetSituation && playRes.targetSituation.id === 'northern_incursion', '明确作用于【北境犯边】，杜绝语义落空');
assert(playRes.quality === 'excellent', '交互评级为 excellent (极有效)');
assert(game.residueManager.hasResidue('weary_army'), '成功种下因果：获得后遗状态【边军疲惫】');

// ---------------- 测试 3: 局势三阶段压力与放任离散后果 (Section 4 & 23) ----------------
console.log('\n--- 测试 3: 局势三阶段压力与放任离散后果 ---');
game.startNewGame('seed_neglect_test');
game.situationManager.clearAll();
game.situationManager.addSituation('northern_incursion');
const sit = game.situationManager.getActive()[0];
assert(sit.stage === 1, '局势初始阶段为 1 阶 (征兆)');

// 玩家打一张与北境无关的牌 (如劝农垦荒)，故意放任北境
game.deckManager.forceCardToHand('encourage_reclamation');
game.selectCard('encourage_reclamation');
game.playSelectedCard();

// 退朝，结算放任
game.adjournCourt();
const sitAfter = game.situationManager.getActive().find(s => s.id === 'northern_incursion');
assert(sitAfter && sitAfter.stage === 2, '未予处理导致【北境犯边】恶化至第 2 阶 (边关失守)');
assert(game.pendingNeglectLogs.length > 0, '生成放任恶化事件记录');

// 再次放任
game.deckManager.forceCardToHand('tax_relief');
game.selectCard('tax_relief');
game.playSelectedCard();
game.adjournCourt();
const sitAfter2 = game.situationManager.getActive().find(s => s.id === 'northern_incursion');
assert(sitAfter2 && sitAfter2.stage === 3, '连续放任导致【北境犯边】恶化至第 3 阶 (大战将起)');

// 第三次放任：触发危急突破升级为【边境战争】
game.deckManager.forceCardToHand('tax_relief');
game.selectCard('tax_relief');
game.playSelectedCard();
game.adjournCourt();
const hasBorderWar = game.situationManager.getActive().some(s => s.id === 'border_war');
assert(hasBorderWar === true, '放任到顶成功升级为重大危机【边境战争】');

// ---------------- 测试 4: 四大标准测试场景 (Section 35) ----------------
console.log('\n--- 测试 4: 四大标准预设场景测试 ---');

// Test A: 黄河水患
game.setupScenarioTestA();
assert(game.situationManager.getActive().length === 1 && game.situationManager.getActive()[0].id === 'yellow_river_flood', 'Test A: 场上仅有黄河水患');
assert(game.situationManager.getActive()[0].stage === 2, 'Test A: 黄河水患处于第 2 阶 (恶化)');
assert(game.deckManager.hand.some(c => c.id === 'granary_relief'), 'Test A: 手牌包含【开仓赈济】');
assert(game.deckManager.hand.some(c => c.id === 'water_conservancy'), 'Test A: 手牌包含【兴修水利】');
assert(game.deckManager.hand.some(c => c.id === 'conscript_labor'), 'Test A: 手牌包含【征发民夫】');

// 验证3种不同解法产出不同后遗状态
const evalRelief = InteractionResolver.analyzeCardOptions(CARDS.find(c => c.id === 'granary_relief'), game.stateManager, game.situationManager.getActive());
const evalWater = InteractionResolver.analyzeCardOptions(CARDS.find(c => c.id === 'water_conservancy'), game.stateManager, game.situationManager.getActive());
const evalLabor = InteractionResolver.analyzeCardOptions(CARDS.find(c => c.id === 'conscript_labor'), game.stateManager, game.situationManager.getActive());
assert(evalRelief.matches[0].evalResult.newResidue === 'empty_granaries', '开仓赈济代价为【仓储空虚】');
assert(evalWater.matches[0].evalResult.newResidue === 'solid_dykes', '兴修水利产出为【河防稳固】');
assert(evalLabor.matches[0].evalResult.newResidue === 'heavy_labor', '征发民夫代价为【徭役沉重】');

// Test B: 北境危机
game.setupScenarioTestB();
assert(game.situationManager.getActive()[0].id === 'northern_incursion' && game.situationManager.getActive()[0].stage === 3, 'Test B: 北境犯边处于第 3 阶 (危急)');
assert(game.deckManager.hand.some(c => c.id === 'dispatch_troops_north'), 'Test B: 包含武力牌');
assert(game.deckManager.hand.some(c => c.id === 'peace_marriage'), 'Test B: 包含外交牌');
assert(game.deckManager.hand.some(c => c.id === 'open_border_market'), 'Test B: 包含贸易牌');

// Test C: 双重危机
game.setupScenarioTestC();
assert(game.situationManager.getActive().length === 2, 'Test C: 场上同时存在水患与北境犯边');

// Test D: 盛世
game.setupScenarioTestD();
assert(game.situationManager.getActive().some(s => s.category === 'opportunity'), 'Test D: 场上存在绿色机会局势');

// ---------------- 测试 5: 年度定策 (Section 18) ----------------
console.log('\n--- 测试 5: 年度定策机制 ---');
game.startNewGame('policy_test');
game.turn = 4;
game.selectCard(game.deckManager.hand[0].id);
game.playSelectedCard();
game.adjournCourt(); // 第4季末
assert(game.phase === 'ANNUAL_POLICY', '第 4 季末正确切入 ANNUAL_POLICY 阶段等待定策');
const draft = game.policyManager.pendingOptions;
assert(draft && draft.length === 3, '成功生成 3 选 1 国策候选');

// 选定其中一个国策
const pickedPolicy = draft[0];
game.applyAnnualPolicySelection(pickedPolicy.id);
assert(game.policyManager.hasPolicy(pickedPolicy.id), `成功确立国策【${pickedPolicy.title}】`);
assert(game.turn === 5, '定策后正常推进至第 5 季');
assert(game.phase === 'PLAY_CARD', '阶段切回 PLAY_CARD');

// ---------------- 测试 6: 完整 40 轮连续真实对局 (AI启发式游玩) ----------------
console.log('\n--- 测试 6: 完整 40 轮连续推演与 Telemetry 0.2 验证 ---');
const simGame = new GameState('sim_game_v02');
simGame.startNewGame('sim_game_v02');
simGame.godMode = true; // 跑满40轮

let turnCounter = 0;
while (!simGame.isGameOver && simGame.turn <= 40 && turnCounter < 50) {
  turnCounter++;

  // 挑选最佳对局牌
  const hand = simGame.deckManager.hand;
  let bestCard = hand[0];
  let bestTarget = null;
  let bestQ = 'none';

  for (const c of hand) {
    const analysis = InteractionResolver.analyzeCardOptions(
      c,
      simGame.stateManager,
      simGame.situationManager.getActive(),
      simGame.policyManager,
      simGame.residueManager
    );
    if (analysis.bestQuality === 'excellent') {
      bestCard = c;
      bestTarget = analysis.autoTarget ? analysis.autoTarget.id : (analysis.validTargets[0] ? analysis.validTargets[0].id : null);
      bestQ = 'excellent';
      break;
    } else if (analysis.bestQuality === 'good' && bestQ !== 'excellent') {
      bestCard = c;
      bestTarget = analysis.autoTarget ? analysis.autoTarget.id : (analysis.validTargets[0] ? analysis.validTargets[0].id : null);
      bestQ = 'good';
    }
  }

  simGame.selectCard(bestCard.id);
  if (bestTarget) simGame.selectedSituationId = bestTarget;
  simGame.playSelectedCard();

  // 偶尔保留一张牌
  if (simGame.deckManager.hand.length > 0 && Math.random() < 0.3) {
    simGame.toggleKeepCard(simGame.deckManager.hand[0].id);
  }

  simGame.adjournCourt();

  // 若遇到年度定策自动选第一个
  if (simGame.phase === 'ANNUAL_POLICY') {
    const opts = simGame.policyManager.pendingOptions || simGame.policyManager.generateDraftOptions();
    simGame.applyAnnualPolicySelection(opts[0].id);
  }
}

assert(simGame.turn >= 40, `成功连续推演满 40 季 (实际: ${simGame.turn} 季)`);
assert(simGame.isGameOver === true && simGame.gameOutcome === 'victory', '40 季后判定江山暂安 (victory)');

// ---------------- 测试 7: Telemetry 0.2 导出与统计字段验证 ----------------
console.log('\n--- 测试 7: Telemetry 0.2 数据结构验证 ---');
const report = simGame.telemetryManager.generateFullReport(
  simGame.deckManager,
  simGame.situationManager,
  simGame.stateManager,
  simGame.residueManager,
  simGame.policyManager
);

assert(report.summary.meaningfulChoiceStats !== undefined, 'Telemetry 包含 Meaningful Choice 统计');
assert(report.summary.totalNeglectEscalations !== undefined, 'Telemetry 包含放任恶化次数统计');
assert(report.turns_log.length >= 40, '每季明细日志完整');
const firstLog = report.turns_log[0];
assert(Array.isArray(firstLog.hand_before_play) && firstLog.hand_before_play.length === 5, '首季 hand_before_play 完整记录 5 张牌');
assert(firstLog.interaction_quality !== undefined, '包含 interaction_quality 评级');
assert(firstLog.meaningful_choices !== undefined, '包含 meaningful_choices 选项统计');

// ---------------- 测试 8: 存档与 loadFromSave 恢复完整性验证 ----------------
console.log('\n--- 测试 8: 存档与 loadFromSave 恢复完整性验证 ---');
const saveGame = new GameState('save_test_seed');
saveGame.startNewGame('save_test_seed', '泰安');
saveGame.selectCard(saveGame.deckManager.hand[0].id);
saveGame.playSelectedCard();
saveGame.adjournCourt();

// 此时 saveGame 已进入 turn 2
assert(saveGame.turn === 2, '当前处于第 2 季');
const statsBeforeSave = saveGame.stateManager.getStats();
const handBeforeSave = [...saveGame.deckManager.hand.map(c => c.id)];

// 创建全新实例并从存档恢复
const restoredGame = new GameState();
const loadSuccess = restoredGame.loadFromSave();
assert(loadSuccess === true, 'loadFromSave() 成功返回 true');
assert(restoredGame.turn === 2, '成功恢复回合数 (turn === 2)');
assert(restoredGame.historyManager.eraName === '泰安', '成功恢复年号【泰安】');
assert(restoredGame.stateManager.treasury === statsBeforeSave.treasury, '成功恢复国库健康度');
assert(restoredGame.stateManager.morale === statsBeforeSave.morale, '成功恢复民心健康度');
assert(restoredGame.stateManager.military === statsBeforeSave.military, '成功恢复军势健康度');
assert(restoredGame.stateManager.court === statsBeforeSave.court, '成功恢复朝局健康度');
assert(restoredGame.deckManager.hand.length === 5, '成功恢复 5 张手牌');
assert(restoredGame.deckManager.hand.map(c => c.id).join(',') === handBeforeSave.join(','), '手牌内容与顺序完全一致');
assert(restoredGame.historyManager.getAllEntries().length === saveGame.historyManager.getAllEntries().length, '历史记录条数完整恢复');
assert(restoredGame.telemetryManager.turnLogs.length === saveGame.telemetryManager.turnLogs.length, '遥测日志完整恢复');

console.log(`\n🎉 全部 Prototype 0.2 核心自动化测试通过：${passedTests}/${totalTests} PASS！`);
