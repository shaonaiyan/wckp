// 《一朝天子》Prototype 0.3 全量自动化验证与推演脚本
// 包含 100 季世界自然演化测试、20 季纯旁观验收、6 大标准场景验证与 Telemetry 0.3 统计

import { GameState } from '../src/game.js';
import { CHARACTER_TEMPLATES } from '../src/data/characterTemplates.js';
import { THREAD_TEMPLATES } from '../src/data/threadTemplates.js';
import { EVENT_TEMPLATES } from '../src/data/eventTemplates.js';
import { PROPOSAL_TEMPLATES } from '../src/data/proposalTemplates.js';
import { ROYAL_EVENTS } from '../src/data/royalEvents.js';
import { BALANCE } from '../src/data/balance.js';

// Mock localStorage for Node.js test environment
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

console.log('================ 开始《一朝天子》Prototype 0.3 核心自动化验证 ================');
console.log(`配置检查：人物模板 ${CHARACTER_TEMPLATES.length} 种，故事线程 ${Object.keys(THREAD_TEMPLATES).length} 条，世界事件 ${EVENT_TEMPLATES.length} 种，御前奏折 ${PROPOSAL_TEMPLATES.length} 种，皇室事件 ${ROYAL_EVENTS.length} 种。`);

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

// ---------------- 测试 1: 开局王朝构建与天家初始状态 ----------------
console.log('\n--- 测试 1: 开局王朝构建与天家初始状态 ---');
const game = new GameState('test_init_seed_03');
game.startNewGame('test_init_seed_03');

const emp = game.world.royalFamilyManager.emperor;
assert(emp && emp.age >= 26 && emp.age <= 34, `皇帝初始年龄在 26~34 岁之间 (实际: ${emp.age} 岁)`);
assert(emp.traits.length >= 1, `皇帝拥有初始性格特征: 【${emp.traits.join('、')}】`);
assert(game.world.royalFamilyManager.empress !== null, '开局生成正宫皇后');
assert(game.world.royalFamilyManager.getHeir() !== null, '开局预设皇长子储君');
assert(game.world.characterManager.getActive().length >= 6, `开局活跃朝野名宿不少于 6 人 (实际: ${game.world.characterManager.getActive().length} 人)`);
assert(game.world.proposalManager.currentProposals.length === 5, '首季御案呈送 5 份奏折');
assert(game.world.newsManager.currentHeadlines.length === 3, '首季呈现 3 条天下纪事头条');

// ---------------- 测试 2: 留中待议机制 (Section 60) ----------------
console.log('\n--- 测试 2: 留中待议机制 ---');
const propToKeep = game.world.proposalManager.currentProposals[0];
game.toggleKeepProposal(propToKeep.id);
assert(game.world.proposalManager.keptProposal && game.world.proposalManager.keptProposal.id === propToKeep.id, '成功将奏折标记为【留中待议】');

// 退朝进入下一季
game.adjournCourt();
assert(game.world.turn === 2, '成功退朝步入第 2 季');
assert(game.world.proposalManager.currentProposals.some(p => p.id === propToKeep.id), '留中待议的奏折成功保留在次季 5 份奏折中');

// ---------------- 测试 3: 朱批决策与 CausalHook 种植 (Section 61) ----------------
console.log('\n--- 测试 3: 朱批决策与 CausalHook 种植 ---');
if (!game.world.proposalManager.currentProposals.some(p => p.id === 'petition_han_ce_reinforce')) {
  const tmpl = PROPOSAL_TEMPLATES.find(p => p.id === 'petition_han_ce_reinforce');
  game.world.proposalManager.currentProposals[0] = { ...tmpl, isKept: false };
}
game.selectProposal('petition_han_ce_reinforce');
game.enactSelectedProposal();

assert(game.world.causalHookManager.has('han_ce_reinforced'), '朱批【请增北军三万】成功种植长效因果 Hook: han_ce_reinforced');
const han = game.world.characterManager.get('han_ce');
assert(han.influence > 68, `韩策影响力因增兵提升 (实际: ${han.influence})`);
assert(han.history.length >= 2, '韩策生平简史自动记录此次增兵诏书');

// ---------------- 测试 4: 核心验收测试 - 纯旁观 20 季度世界自运转 (Section 4 & 72 Test A) ----------------
console.log('\n--- 测试 4: 核心验收测试 - 纯旁观 20 季度世界自运转 (Test A) ---');
const spectatorMetrics = game.setupScenarioTestA();
console.log('旁观 20 季指标:', spectatorMetrics);

assert(spectatorMetrics.totalTurns >= 20, `连续纯旁观完成 20 季 (实际: ${spectatorMetrics.totalTurns} 季)`);
assert(spectatorMetrics.nonActionCount >= 20, '玩家连续 20 季度完全不操作无为退朝');
assert(parseFloat(spectatorMetrics.storyContinuityRate) > 0, `故事连续率大于 0 (实际: ${spectatorMetrics.storyContinuityRate})`);
assert(parseFloat(spectatorMetrics.characterRecurrenceRate) > 0, `人物复现率大于 0 (实际: ${spectatorMetrics.characterRecurrenceRate})`);
assert(parseFloat(spectatorMetrics.isolatedRandomEventRatio) < 20, `孤立随机事件率受控在 20% 以下 (实际: ${spectatorMetrics.isolatedRandomEventRatio})`);

// ---------------- 测试 5: Test B - 提拔名臣沈恪 (Section 72 Test B) ----------------
console.log('\n--- 测试 5: Test B - 提拔名臣沈恪 ---');
const testBMetrics = game.setupScenarioTestB();
const shenKe = game.world.characterManager.get('shen_ke');
assert(game.world.causalHookManager.has('shen_ke_reform_enacted'), '成功种植沈恪清丈因果 Hook');
assert(game.world.causalHookManager.has('appoint_shen_ke_tutor'), '成功种植沈恪帝师因果 Hook');
const heir = game.world.royalFamilyManager.getHeir();
assert(heir && heir.tutor === '沈恪', '皇太子讲官确立为沈恪');
assert(shenKe.history.length >= 3, '沈恪生平记载丰富真实');

// ---------------- 测试 6: Test C - 养大将韩策 (Section 72 Test C) ----------------
console.log('\n--- 测试 6: Test C - 养大将韩策 ---');
const testCMetrics = game.setupScenarioTestC();
const hanCe = game.world.characterManager.get('han_ce');
assert(game.world.causalHookManager.has('han_ce_reinforced'), '韩策获得大扩军支持');
assert(game.world.causalHookManager.has('summon_han_ce_capital'), '成功诏韩策还京入阁参政');
assert(hanCe.office.includes('枢密') || hanCe.office.includes('太保') || hanCe.office.includes('定远侯'), `韩策官职发生明显迁转: ${hanCe.office}`);

// ---------------- 测试 7: Test D - 完全昏君治世 (Section 72 Test D) ----------------
console.log('\n--- 测试 7: Test D - 完全昏君治世 ---');
const testDMetrics = game.setupScenarioTestD();
assert(game.world.causalHookManager.has('palace_construction_started'), '大修西苑神仙殿宇因果生效');
assert(game.world.causalHookManager.has('emperor_alchemy_fused'), '炼九转金丹因果生效');
assert(game.world.causalHookManager.has('emperor_southern_tour'), '御驾南巡因果生效');
const entriesD = game.world.historyManager.getAllEntries();
const hasHedonistEntry = entriesD.some(e => e.text.includes('西苑') || e.text.includes('金丹') || e.text.includes('南巡'));
assert(hasHedonistEntry, '史册起居注自然形成极具荒诞与文治趣味的帝王本纪记录');

// ---------------- 测试 8: Test E - 储君 15 年成长推演 (Section 72 Test E) ----------------
console.log('\n--- 测试 8: Test E - 储君 15 年成长推演 ---');
const testEMetrics = game.setupScenarioTestE();
const heirE = game.world.royalFamilyManager.getHeir();
assert(heirE.age >= 18, `储君经历 15 年后顺利弱冠成年 (实际: ${heirE.age} 岁)`);
assert(heirE.history.length >= 2, `储君拥有完整的开蒙受业与生平记录 (${heirE.history.length} 条)`);

// ---------------- 测试 9: Test F - 皇帝驾崩与大统继位 (Section 72 Test F) ----------------
console.log('\n--- 测试 9: Test F - 皇帝驾崩与大统继位 ---');
const testFMetrics = game.setupScenarioTestF();
assert(game.world.successionManager.pastEmperors.length >= 1, '成功生成先帝《本纪》史评');
const annals = game.world.successionManager.pastEmperors[0];
assert(annals.posthumousTitle !== '', `先帝获赐尊谥: 【${annals.posthumousTitle}】`);
assert(game.world.royalFamilyManager.emperor.generation === 2, '新君成功登基即位，进入第二代帝皇传序');
// 核心：继位不重置世界 (Section 10)
assert(game.world.characterManager.getActive().length >= 5, '先帝朝中重臣、故旧依然健在活跃');
assert(game.world.threadManager.getActiveThreads().length >= 1, '前朝的故事线程未被清空，自然在跨代演进');

// ---------------- 测试 10: 100 季连续全量世界自动化演化测试 ----------------
console.log('\n--- 测试 10: 100 季连续全量世界自动化演化测试 ---');
const longGame = new GameState('seed_long_100_run');
longGame.startNewGame('seed_long_100_run');

let turnsSurvived = 0;
while (longGame.world.turn < 100) {
  if (longGame.world.isSuccessionPending) {
    longGame.continueSuccession();
  }
  // 模拟真实玩家行为：偶尔批一份奏折，偶尔退朝无为
  if (Math.random() < 0.4 && longGame.world.proposalManager.currentProposals.length > 0) {
    const prop = longGame.world.proposalManager.currentProposals[0];
    longGame.selectProposal(prop.id);
    longGame.enactSelectedProposal();
  } else {
    longGame.adjournCourt();
  }
  turnsSurvived++;
}

assert(turnsSurvived >= 99, `成功连续演化满 100 季 (实际: ${longGame.world.turn} 季，跨越 ${Math.floor(longGame.world.turn/4)} 年)`);
const longMetrics = longGame.telemetryManager.calculateMetrics(longGame.world);
console.log('100 季全量演化指标:', longMetrics);
assert(longMetrics.totalEventsSimulated > 80, `总演变事件丰富达标 (总计: ${longMetrics.totalEventsSimulated} 个)`);
assert(parseFloat(longMetrics.storyContinuityRate) > 15, `长线故事连续率保持稳健 (${longMetrics.storyContinuityRate})`);

// ---------------- 测试 11: 存档与 loadFromSave 完整性恢复 ----------------
console.log('\n--- 测试 11: 存档与 loadFromSave 完整性恢复 ---');
const saveGame = new GameState('save_test_03');
saveGame.startNewGame('save_test_03');
saveGame.adjournCourt();
saveGame.adjournCourt();

const turnBefore = saveGame.world.turn;
const charCountBefore = saveGame.world.characterManager.characters.length;
const threadsBefore = saveGame.world.threadManager.activeThreads.length;

// 创建全新实例从存档恢复
const restoredGame = new GameState();
const loadOk = restoredGame.loadFromSave();

assert(loadOk === true, 'loadFromSave() 恢复成功返回 true');
assert(restoredGame.world.turn === turnBefore, `成功恢复当前季度 (turn === ${turnBefore})`);
assert(restoredGame.world.characterManager.characters.length === charCountBefore, '成功恢复完整人物生态池');
assert(restoredGame.world.threadManager.activeThreads.length === threadsBefore, '成功恢复完整故事线程');

console.log(`\n🎉 全部 Prototype 0.3 核心自动化验证通过：${passedTests}/${totalTests} PASS！`);
