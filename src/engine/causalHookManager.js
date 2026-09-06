// 《一朝天子》Prototype 0.3 因果钩子管理器 (CausalHookManager)
// 记录玩家皇权决断所种下的因果Hook，在 2~20 轮之后长效影响事件概率与故事走向

export const CAUSAL_HOOKS_MAP = {
  han_ce_reinforced: { name: '北军扩充', desc: '帝曾大批增拨饷械与北军，边帅羽翼丰满。' },
  shen_ke_reform_enacted: { name: '均田变法', desc: '帝曾力排众议准沈恪清丈田亩，动摇缙绅根基。' },
  open_sea_trade: { name: '海禁大开', desc: '帝曾撤罢海防禁令，开启东南海运千帆之局。' },
  strict_anticorruption: { name: '铁腕惩贪', desc: '帝曾雷厉风行下诏狱治贪官，吏风肃敛。' },
  austere_policy: { name: '勤俭省役', desc: '帝曾节用爱民停罢工役，中枢崇尚恭俭。' },
  palace_construction_started: { name: '大兴土木', desc: '帝曾大修西苑宫观，耗费内帑巨万。' },
  foster_steppe_vassal: { name: '扶植归义王', desc: '帝曾收留乌桓二王子封王割地，以番御番。' },
  appoint_shen_ke_tutor: { name: '沈恪为帝师', desc: '帝曾选定沈恪辅导储君，储君学尚经世变法。' },
  summon_han_ce_capital: { name: '召大将入京', desc: '帝曾借参政之名收韩策边塞兵柄入阁。' },
  promote_shi_xiong: { name: '擢升宿卫大将', desc: '帝曾简拔青年将领石雄总领禁卫，分庭抗礼。' },
  royal_marriage_gentry: { name: '皇室结亲豪族', desc: '帝曾降嫁皇女于陈郡谢氏，士庶朱陈结好。' },
  general_amnesty_declared: { name: '大赦天下', desc: '帝曾颁诏大赦，中原草寇洗心，民颂仁厚。' },
  tax_relief_granted: { name: '蠲免田租', desc: '帝曾大减江淮租赋，小民感戴休养生息。' },
  imperial_exam_held: { name: '特科开榜', desc: '帝曾开特科拔擢寒素，天下布衣踊跃入仕。' },
  emperor_southern_tour: { name: '御驾南巡', desc: '帝曾乘龙舟南巡江表，巡抚按查东南。' },
  emperor_alchemy_fused: { name: '修醮求仙', desc: '帝曾沉迷方士吐纳还丹，深居西苑。' },
  imperial_autumn_hunt: { name: '木兰秋狝', desc: '帝曾扬威塞外大阅六军，武备整饬。' },
  imperial_bureaucratic_audit: { name: '京察澄清', desc: '帝曾雷霆整饬百僚风纪，黜落庸劣。' }
};

export class CausalHookManager {
  constructor() {
    this.hooks = []; // [{ id, turn, sourceAction, affectedCharacters, affectedThreads, triggers: [] }]
  }

  reset() {
    this.hooks = [];
  }

  // 种植因果
  addHook(hookId, turn, sourceAction = '', affectedCharacters = [], affectedThreads = []) {
    if (this.has(hookId)) return;

    this.hooks.push({
      id: hookId,
      name: CAUSAL_HOOKS_MAP[hookId] ? CAUSAL_HOOKS_MAP[hookId].name : hookId,
      turn,
      sourceAction,
      affectedCharacters,
      affectedThreads,
      triggeredEventsCount: 0,
      createdAtTurn: turn
    });
  }

  has(hookId) {
    return this.hooks.some(h => h.id === hookId);
  }

  get(hookId) {
    return this.hooks.find(h => h.id === hookId);
  }

  // 当后续事件受此 Hook 影响发生时，记录反馈
  recordTrigger(hookId, currentTurn, eventId) {
    const h = this.get(hookId);
    if (h) {
      h.triggeredEventsCount++;
      return {
        hookId: h.id,
        hookName: h.name,
        delayTurns: currentTurn - h.turn,
        plantedTurn: h.turn
      };
    }
    return null;
  }

  // 生成人物或局势的【何以至此】溯源链
  explainCausalChain(characterId, historyList = []) {
    const relevantHooks = this.hooks.filter(h => h.affectedCharacters.includes(characterId));
    const lines = [];

    relevantHooks.forEach(h => {
      lines.push(`第 ${h.turn} 季：皇帝下诏【${h.sourceAction || h.name}】，因而种下因由。`);
    });

    historyList.slice(-4).forEach(hist => {
      lines.push(hist);
    });

    return lines;
  }

  getAll() {
    return this.hooks;
  }

  restore(data) {
    this.hooks = Array.isArray(data) ? [...data] : [];
  }
}
