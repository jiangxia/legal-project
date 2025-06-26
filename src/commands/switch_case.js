/**
 * 切换案件命令
 */

/**
 * 切换案件命令处理函数
 *
 * @param {Array<string>} args - 命令参数
 * @param {Object} context - 命令上下文
 * @returns {Promise<string>} - 命令执行结果
 */
async function handler(args, context) {
  try {
    if (args.length < 1) {
      return "参数不足，请提供案件ID。\n用法: /switch_case <案件ID>";
    }

    const caseId = args[0];

    // 切换案件
    const switchedCase = context.assistant.switchCase(caseId);

    return `已切换到案件: ${switchedCase.caseName}\n案件ID: ${caseId}\n案件类型: ${switchedCase.caseType}`;
  } catch (err) {
    console.error("切换案件出错:", err);
    return `切换案件出错: ${err.message}`;
  }
}

// 导出命令定义
module.exports = {
  name: "switch_case",
  aliases: ["切换案件", "select_case"],
  description: "切换当前操作的案件",
  usage: "/switch_case <案件ID>",
  examples: ["/switch_case 123e4567-e89b-12d3-a456-426614174000"],
  handler,
};
