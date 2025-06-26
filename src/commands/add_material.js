/**
 * 添加案件材料命令
 */

/**
 * 添加案件材料命令处理函数
 *
 * @param {Array<string>} args - 命令参数
 * @param {Object} context - 命令上下文
 * @returns {Promise<string>} - 命令执行结果
 */
async function handler(args, context) {
  try {
    if (!context.currentCase) {
      return "当前没有选择案件，请先选择或创建一个案件。";
    }

    if (args.length < 2) {
      return "参数不足，请提供材料名称和材料内容。\n用法: /add_material <材料名称> <材料内容>";
    }

    const materialName = args[0];
    const materialContent = args.slice(1).join(" ");

    // 添加材料
    await context.currentCase.addMaterial(materialName, materialContent);

    return `材料添加成功！\n案件: ${context.currentCase.caseName}\n材料名称: ${materialName}\n材料内容长度: ${materialContent.length} 字符`;
  } catch (err) {
    console.error("添加材料出错:", err);
    return `添加材料出错: ${err.message}`;
  }
}

// 导出命令定义
module.exports = {
  name: "add_material",
  aliases: ["添加材料", "add_doc"],
  description: "向当前案件添加材料",
  usage: "/add_material <材料名称> <材料内容>",
  examples: [
    "/add_material 起诉状 原告张三，男，1990年1月1日出生...",
    "/add_material 证据1 合同签订于2022年3月15日，双方约定...",
  ],
  handler,
};
