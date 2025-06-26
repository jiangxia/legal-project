/**
 * 争议焦点分析模块
 * 专门处理民商事案件的争议焦点分析
 */

const aiEngine = require("../core/ai-engine");

/**
 * 分析争议焦点
 *
 * @param {string} caseName - 案件名称
 * @param {Array<string>} materials - 案件材料列表
 * @returns {Promise<string>} - 分析结果
 */
async function analyzeDisputeFocus(caseName, materials) {
  try {
    console.log(`开始分析争议焦点: ${caseName}`);

    // 使用AI引擎进行分析
    const result = await aiEngine.analyze(
      caseName,
      materials,
      "民商事",
      "dispute-focus"
    );

    return result;
  } catch (err) {
    console.error(`分析争议焦点出错: ${err.message}`);
    throw err;
  }
}

/**
 * 提取争议焦点中的关键问题
 *
 * @param {string} disputeFocusResult - 争议焦点分析结果
 * @returns {Array<string>} - 关键问题列表
 */
function extractKeyIssues(disputeFocusResult) {
  try {
    // 查找"核心争议焦点："或"争议焦点总结"部分
    const focusSectionRegex =
      /(?:核心争议焦点[：:]\s*|争议焦点总结\s*\n+)([\s\S]+?)(?:\n\n|$)/i;
    const focusSection = disputeFocusResult.match(focusSectionRegex);

    if (!focusSection || !focusSection[1]) {
      // 如果找不到特定部分，尝试提取所有数字编号的行
      const numberedLines = disputeFocusResult.match(/\d+\.\s+[^\n]+/g);
      return numberedLines || [];
    }

    // 提取编号的问题
    const issues = focusSection[1].split(/\n+/).filter((line) => {
      return /^\d+\./.test(line.trim());
    });

    return issues.map((issue) => issue.trim());
  } catch (err) {
    console.error(`提取关键问题出错: ${err.message}`);
    return [];
  }
}

/**
 * 分析争议焦点的法律关系
 *
 * @param {string} disputeFocusResult - 争议焦点分析结果
 * @returns {Object} - 法律关系分析结果
 */
function analyzeLegalRelationship(disputeFocusResult) {
  try {
    // 提取法律关系部分
    const legalRelationRegex = /法律关系分析\s*\n+([\s\S]+?)(?:\n\n|##|$)/i;
    const legalRelationSection = disputeFocusResult.match(legalRelationRegex);

    if (!legalRelationSection || !legalRelationSection[1]) {
      return {
        mainRelationship: "未找到法律关系分析",
        parties: [],
        applicableLaws: [],
      };
    }

    const content = legalRelationSection[1];

    // 提取主要法律关系
    const mainRelationshipRegex = /主要法律关系是([^，。,]+)/i;
    const mainRelationshipMatch = content.match(mainRelationshipRegex);
    const mainRelationship = mainRelationshipMatch
      ? mainRelationshipMatch[1].trim()
      : "未明确";

    // 提取当事人
    const partiesRegex = /当事人[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|适用法律|$)/i;
    const partiesSection = content.match(partiesRegex);
    let parties = [];

    if (partiesSection && partiesSection[1]) {
      parties = partiesSection[1]
        .split(/\n+/)
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.trim().substring(1).trim());
    }

    // 提取适用法律
    const lawsRegex = /适用法律[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|$)/i;
    const lawsSection = content.match(lawsRegex);
    let applicableLaws = [];

    if (lawsSection && lawsSection[1]) {
      applicableLaws = lawsSection[1]
        .split(/\n+/)
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.trim().substring(1).trim());
    }

    return {
      mainRelationship,
      parties,
      applicableLaws,
    };
  } catch (err) {
    console.error(`分析法律关系出错: ${err.message}`);
    return {
      mainRelationship: "分析出错",
      parties: [],
      applicableLaws: [],
    };
  }
}

module.exports = {
  analyzeDisputeFocus,
  extractKeyIssues,
  analyzeLegalRelationship,
};
