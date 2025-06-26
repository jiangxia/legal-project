/**
 * 列出案件命令
 */

/**
 * 列出案件命令处理函数
 *
 * @param {Array<string>} args - 命令参数
 * @param {Object} context - 命令上下文
 * @returns {Promise<string>} - 命令执行结果
 */
async function handler(args, context) {
  try {
    // 获取案件列表
    const caseList = context.assistant.getCaseList();

    if (caseList.length === 0) {
      return "当前没有任何案件，请先创建案件。";
    }

    // 构建返回信息
    let result = "案件列表:\n";
    result += "=".repeat(50) + "\n";

    caseList.forEach((caseItem, index) => {
      result += `${index + 1}. ID: ${caseItem.id}\n`;
      result += `   名称: ${caseItem.name}\n`;
      result += `   类型: ${caseItem.type}\n`;

      // 标记当前选中的案件
      if (context.currentCase && context.currentCase.caseId === caseItem.id) {
        result += "   [当前选中]\n";
      }

      result += "-".repeat(50) + "\n";
    });

    result += '\n使用 "/switch_case <案件ID>" 命令切换案件';

    return result;
  } catch (err) {
    console.error("列出案件出错:", err);
    return `列出案件出错: ${err.message}`;
  }
}

// 导出命令定义
module.exports = {
  name: "list_cases",
  aliases: ["案件列表", "cases"],
  description: "列出所有案件",
  usage: "/list_cases",
  examples: ["/list_cases"],
  handler,
};
