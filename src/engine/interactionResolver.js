// Prototype 0.2 交互解析引擎 (InteractionResolver)
// 实现自动索敌、多目标判定、Reaction Matrix 评级计算、后遗状态产出与国策加成

import { INTERACTION_RULES } from '../data/interactionRules.js';
import { BALANCE } from '../data/balance.js';

export class InteractionResolver {
  // 预判卡牌在当前局势下的匹配情况与目标分析
  static analyzeCardOptions(card, stateManager, activeSituations, policyManager, residueManager) {
    if (!card || !activeSituations || activeSituations.length === 0) {
      return {
        hasTarget: false,
        validTargets: [],
        autoTarget: null,
        bestQuality: 'none',
        costPreview: card ? card.personality : ''
      };
    }

    const matches = [];

    for (const sit of activeSituations) {
      const sitRule = INTERACTION_RULES[sit.id];
      if (!sitRule || typeof sitRule.evaluate !== 'function') continue;

      const evalResult = sitRule.evaluate(card, stateManager, sit);
      if (evalResult && evalResult.applicability !== false && evalResult.quality !== 'none') {
        matches.push({
          situation: sit,
          evalResult
        });
      }
    }

    // 如果只有一个明显匹配目标，自动锁定 (Section 1)
    let autoTarget = null;
    if (matches.length === 1) {
      autoTarget = matches[0].situation;
    }

    let bestQuality = 'none';
    if (matches.length > 0) {
      // 找到最高评级
      const order = ['excellent', 'good', 'weak', 'dangerous'];
      for (const q of order) {
        if (matches.some(m => m.evalResult.quality === q)) {
          bestQuality = q;
          break;
        }
      }
    }

    return {
      hasTarget: matches.length > 0,
      validTargets: matches.map(m => m.situation),
      matches,
      autoTarget,
      bestQuality,
      costPreview: matches.length > 0 ? matches[0].evalResult.costPreview : (card.personality || '')
    };
  }

  // 执行卡牌生效解析
  static resolve(card, selectedSituationId, stateManager, situationManager, residueManager, policyManager) {
    const activeSits = situationManager.getActive();
    const analysis = this.analyzeCardOptions(card, stateManager, activeSits, policyManager, residueManager);

    let targetSituation = null;
    let autoTargeted = false;

    if (selectedSituationId) {
      targetSituation = activeSits.find(s => s.id === selectedSituationId);
    } else if (analysis.autoTarget) {
      targetSituation = analysis.autoTarget;
      autoTargeted = true;
    }

    let result = null;

    if (targetSituation) {
      const sitRule = INTERACTION_RULES[targetSituation.id];
      if (sitRule && typeof sitRule.evaluate === 'function') {
        result = sitRule.evaluate(card, stateManager, targetSituation);
      }
    }

    // 如果没有目标或卡牌属于通用独立施政
    if (!result || result.applicability === false || result.quality === 'none') {
      result = {
        quality: 'weak',
        situationDelta: 0,
        statDelta: { ...(card.baseCost || { treasury: 0, morale: 0, military: 0, court: 0 }) },
        newResidue: null,
        removeResidue: null,
        headline: `施行【${card.name}】`,
        historyText: card.fallbackFlavor || `${card.name}付诸施行，朝廷上下遵旨宣化。`,
        costPreview: card.personality
      };
      targetSituation = null;
    }

    // 应用国策 (Policy) 加成
    if (policyManager) {
      for (const tag of card.tags) {
        if (policyManager.hasTagBonus(tag)) {
          // 强化评级或产出
          if (result.quality === 'good') result.quality = 'excellent';
          if (result.statDelta.treasury && result.statDelta.treasury > 0) result.statDelta.treasury += 2;
          if (result.statDelta.morale && result.statDelta.morale > 0) result.statDelta.morale += 2;
          if (result.statDelta.military && result.statDelta.military > 0) result.statDelta.military += 2;
          if (result.statDelta.court && result.statDelta.court > 0) result.statDelta.court += 2;
        }
      }
    }

    // 应用后遗状态 (Residue) 惩罚/增益
    if (residueManager) {
      if (residueManager.hasResidue('weary_army') && card.tags.includes('military')) {
        if (result.quality === 'excellent') result.quality = 'good';
        if (result.statDelta.military) result.statDelta.military -= 2;
      }
      if (residueManager.hasResidue('empty_granaries') && card.tags.includes('relief')) {
        if (result.quality === 'excellent') result.quality = 'good';
        if (result.statDelta.morale) result.statDelta.morale -= 4;
      }
      if (residueManager.hasResidue('reform_talents') && card.tags.includes('reform')) {
        if (result.statDelta.court) result.statDelta.court += 3;
      }
    }

    // 1. 应用健康度属性变化
    stateManager.applyDelta(result.statDelta);

    // 2. 对局势施加影响
    let sitResolution = null;
    if (targetSituation) {
      sitResolution = situationManager.applySituationDelta(targetSituation.id, result.situationDelta || 0);
    }

    // 3. 处理后遗状态生成与清除
    let residueCreated = null;
    let residueRemoved = null;
    if (result.newResidue && residueManager) {
      residueCreated = residueManager.addResidue(result.newResidue);
    }
    if (result.removeResidue && residueManager) {
      residueRemoved = residueManager.removeResidue(result.removeResidue);
    }

    return {
      success: true,
      card,
      targetSituation,
      autoTargeted,
      quality: result.quality,
      situationDelta: result.situationDelta,
      statDelta: result.statDelta,
      newResidue: result.newResidue,
      residueCreated,
      residueRemoved,
      headline: result.headline,
      historyText: result.historyText,
      sitResolution
    };
  }
}
