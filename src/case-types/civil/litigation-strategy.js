/**
 * 诉讼策略分析模块
 * 专门处理民商事案件的诉讼策略分析
 */

const aiEngine = require("../core/ai-engine");

/**
 * 分析诉讼策略
 *
 * @param {string} caseName - 案件名称
 * @param {Array<string>} materials - 案件材料列表
 * @param {string} disputeFocus - 争议焦点分析结果（可选）
 * @returns {Promise<string>} - 分析结果
 */
async function analyzeLitigationStrategy(
  caseName,
  materials,
  disputeFocus = null
) {
  try {
    console.log(`开始分析诉讼策略: ${caseName}`);

    // 如果有争议焦点分析结果，将其添加到材料中
    const allMaterials = disputeFocus
      ? [...materials, disputeFocus]
      : materials;

    // 使用AI引擎进行分析
    const result = await aiEngine.analyze(
      caseName,
      allMaterials,
      "民商事",
      "litigation-strategy"
    );

    return result;
  } catch (err) {
    console.error(`分析诉讼策略出错: ${err.message}`);
    throw err;
  }
}

/**
 * 提取诉讼策略中的关键建议
 *
 * @param {string} strategyResult - 诉讼策略分析结果
 * @returns {Array<string>} - 关键建议列表
 */
function extractKeyRecommendations(strategyResult) {
  try {
    // 查找"诉讼策略建议"或"策略建议"部分
    const recommendationSectionRegex =
      /(?:诉讼策略建议|策略建议)[：:]\s*\n+([\s\S]+?)(?:\n\n|##|$)/i;
    const recommendationSection = strategyResult.match(
      recommendationSectionRegex
    );

    if (!recommendationSection || !recommendationSection[1]) {
      // 如果找不到特定部分，尝试提取所有数字编号的行
      const numberedLines = strategyResult.match(/\d+\.\s+[^\n]+/g);
      return numberedLines || [];
    }

    // 提取编号的建议
    const recommendations = recommendationSection[1]
      .split(/\n+/)
      .filter((line) => {
        return /^\d+\./.test(line.trim());
      });

    return recommendations.map((recommendation) => recommendation.trim());
  } catch (err) {
    console.error(`提取关键建议出错: ${err.message}`);
    return [];
  }
}

/**
 * 提取诉讼策略中的风险评估
 *
 * @param {string} strategyResult - 诉讼策略分析结果
 * @returns {Object} - 风险评估结果
 */
function extractRiskAssessment(strategyResult) {
  try {
    // 提取风险评估部分
    const riskSectionRegex = /风险[^：:]*[：:]\s*\n+([\s\S]+?)(?:\n\n|##|$)/i;
    const riskSection = strategyResult.match(riskSectionRegex);

    if (!riskSection || !riskSection[1]) {
      return {
        legalRisks: [],
        countermeasures: [],
      };
    }

    const content = riskSection[1];

    // 提取法律风险
    const legalRisksRegex =
      /法律风险[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|应对措施|$)/i;
    const legalRisksSection = content.match(legalRisksRegex);
    let legalRisks = [];

    if (legalRisksSection && legalRisksSection[1]) {
      legalRisks = legalRisksSection[1]
        .split(/\n+/)
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.trim());
    }

    // 提取应对措施
    const countermeasuresRegex = /应对措施[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|$)/i;
    const countermeasuresSection = content.match(countermeasuresRegex);
    let countermeasures = [];

    if (countermeasuresSection && countermeasuresSection[1]) {
      countermeasures = countermeasuresSection[1]
        .split(/\n+/)
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.trim());
    }

    return {
      legalRisks,
      countermeasures,
    };
  } catch (err) {
    console.error(`提取风险评估出错: ${err.message}`);
    return {
      legalRisks: [],
      countermeasures: [],
    };
  }
}

/**
 * 生成诉讼时间线
 *
 * @param {string} strategyResult - 诉讼策略分析结果
 * @returns {Array<Object>} - 诉讼时间线
 */
function generateLitigationTimeline(strategyResult) {
  try {
    // 提取时间线部分
    const timelineSectionRegex =
      /时间线[^：:]*[：:]\s*\n+([\s\S]+?)(?:\n\n|##|$)/i;
    const timelineSection = strategyResult.match(timelineSectionRegex);

    if (!timelineSection || !timelineSection[1]) {
      return [];
    }

    const content = timelineSection[1];

    // 提取各个阶段
    const stages = content.split(/\n+/).filter((line) => {
      return /^\d+\./.test(line.trim());
    });

    // 解析每个阶段
    return stages.map((stage) => {
      const stageMatch = stage.match(
        /^\d+\.\s+([^（(]+)(?:[(（]([^)）]+)[)）])?:\s*(.*)/
      );

      if (!stageMatch) {
        return {
          name: stage.trim(),
          duration: "",
          tasks: [],
        };
      }

      const name = stageMatch[1] ? stageMatch[1].trim() : "";
      const duration = stageMatch[2] ? stageMatch[2].trim() : "";
      const tasksText = stageMatch[3] ? stageMatch[3].trim() : "";

      // 提取任务
      const tasks = tasksText
        .split(/[,，;；]/)
        .map((task) => task.trim())
        .filter((task) => task);

      return {
        name,
        duration,
        tasks,
      };
    });
  } catch (err) {
    console.error(`生成诉讼时间线出错: ${err.message}`);
    return [];
  }
}

module.exports = {
  analyzeLitigationStrategy,
  extractKeyRecommendations,
  extractRiskAssessment,
  generateLitigationTimeline,
};
