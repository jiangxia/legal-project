/**
 * AI助手指令配置
 */

/**
 * 获取案件目标设定提醒指令
 * @param {string} casePath - 案件路径
 * @returns {string} - AI指令文本
 */
function getGoalSettingReminder(casePath) {
  return `
🎯 **重要提醒 - 目标导向处理**

在处理本案件的任何问题时，请务必：

1. **首先查看目标设定文件**：${casePath}/目标设定.md
2. **确保所有分析和建议都围绕既定目标展开**
3. **在提供建议时明确说明如何服务于案件目标**
4. **如发现目标设定不完整，提醒用户完善**

请始终保持结果导向，让每一个分析和建议都有助于实现案件目标。
`;
}

/**
 * 获取案件分析的标准提示
 * @param {Object} caseInfo - 案件信息
 * @returns {string} - 分析提示文本
 */
function getCaseAnalysisPrompt(caseInfo) {
  return `
在分析本案件时，请按以下框架进行：

1. **目标对照**：当前分析如何服务于既定目标
2. **策略一致性**：建议是否符合总体策略方向
3. **风险评估**：对目标实现的影响程度
4. **行动建议**：具体的下一步操作建议
5. **进度评估**：距离目标实现的进展情况

案件基本信息：
- 案件名称：${caseInfo.name}
- 案件类型：${caseInfo.type}
- 业务类型：${caseInfo.businessType || '未指定'}
`;
}

module.exports = {
  getGoalSettingReminder,
  getCaseAnalysisPrompt
};