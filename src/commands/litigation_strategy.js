/**
 * 诉讼策略命令
 */

const path = require("path");
const fs = require("fs");

/**
 * 诉讼策略命令处理函数
 *
 * @param {Array<string>} args - 命令参数
 * @param {Object} context - 命令上下文
 * @returns {Promise<string>} - 命令执行结果
 */
async function handler(args, context) {
  try {
    // 检查是否是"制定诉讼策略：<案件名称>"格式
    if (args.length > 0 && 
        (args[0] === "制定诉讼策略" || args[0] === "诉讼策略") &&
        args.length > 1) {
      const caseName = args.slice(1).join(" ");
      return await makeLitigationStrategy(caseName, context);
    }

    // 兼容旧格式
    if (args.length < 1) {
      return "参数不足，请提供案件名称。\n用法: 制定诉讼策略：<案件名称>";
    }

    const caseName = args.join(" ");
    return await makeLitigationStrategy(caseName, context);
  } catch (err) {
    console.error("诉讼策略分析出错:", err);
    return `诉讼策略分析出错: ${err.message}`;
  }
}

/**
 * 制定诉讼策略 - 直接分析指定案件的材料并生成策略
 *
 * @param {string} caseName - 案件名称
 * @param {Object} context - 命令上下文
 * @returns {Promise<string>} - 分析结果
 */
async function makeLitigationStrategy(caseName, context) {
  try {
    console.log(`制定诉讼策略，案件: ${caseName}`);
    const casesDir = path.join(process.cwd(), "cases");

    if (!fs.existsSync(casesDir)) {
      return `案例目录不存在: ${casesDir}`;
    }

    // 查找匹配的案件目录
    const foundCaseDir = findCaseDirectory(casesDir, caseName);
    if (!foundCaseDir) {
      return `未找到案件: ${caseName}\n请检查案件名称是否正确。`;
    }

    const caseFolderPath = path.join(casesDir, foundCaseDir);
    console.log(`找到案件目录: ${caseFolderPath}`);

    // 直接读取案件材料目录
    const materialsDir = path.join(caseFolderPath, "案件材料");
    if (!fs.existsSync(materialsDir)) {
      return `案件材料目录不存在: ${materialsDir}\n请确保案件目录中包含"案件材料"文件夹。`;
    }

    console.log(`正在读取案件材料目录: ${materialsDir}`);
    const materials = readMaterialsRecursively(materialsDir);

    if (materials.length === 0) {
      return `案件材料不足，无法制定诉讼策略。请在"案件材料"目录中添加相关文档。`;
    }

    console.log(`找到 ${materials.length} 个材料文件，开始AI分析...`);
    
    // 提取实际案件名称
    const actualCaseName = foundCaseDir.startsWith("案件：")
      ? foundCaseDir.substring(3)
      : foundCaseDir;

    // 使用AI引擎分析诉讼策略
    const result = await context.aiEngine.analyzeLitigationStrategy(
      materials,
      { name: actualCaseName, type: "民商事" }
    );

    // 保存分析结果到指定目录
    const analysisDir = path.join(caseFolderPath, "分析", "诉讼策略");
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `诉讼策略分析_${timestamp}.md`;
    const filePath = path.join(analysisDir, filename);
    
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`分析结果已保存到: ${filePath}`);

    return `诉讼策略制定完成！\n案件: ${actualCaseName}\n分析结果已保存到: ${filename}\n\n分析结果:\n${result}`;
  } catch (err) {
    console.error("诉讼策略制定出错:", err);
    return `诉讼策略制定出错: ${err.message}`;
  }
}

/**
 * 查找案件目录
 */
function findCaseDirectory(casesDir, caseName) {
  const allDirs = fs.readdirSync(casesDir).filter(item => {
    const itemPath = path.join(casesDir, item);
    return fs.statSync(itemPath).isDirectory() && item !== "案件模板";
  });

  // 完全匹配优先
  for (const dir of allDirs) {
    if (dir === caseName || dir === `案件：${caseName}`) {
      console.log(`找到完全匹配案件: ${dir}`);
      return dir;
    }
  }

  // 部分匹配
  for (const dir of allDirs) {
    if (dir.includes(caseName) || 
        (dir.startsWith("案件：") && dir.substring(3).includes(caseName))) {
      console.log(`找到部分匹配案件: ${dir}`);
      return dir;
    }
  }

  // 关键词匹配
  if (caseName.length > 2) {
    const keywords = caseName.split(/\s+/).filter(k => k.length > 1);
    for (const dir of allDirs) {
      if (keywords.some(keyword => 
          dir.includes(keyword) || 
          (dir.startsWith("案件：") && dir.substring(3).includes(keyword))
      )) {
        console.log(`找到关键词匹配案件: ${dir}`);
        return dir;
      }
    }
  }

  return null;
}

/**
 * 递归读取材料目录中的所有文档
 */
function readMaterialsRecursively(materialsDir) {
  const materials = [];
  const supportedExtensions = [".txt", ".md", ".doc", ".docx"];

  function readDirectory(dir, relativePath = "") {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          const newRelativePath = relativePath ? `${relativePath}/${item}` : item;
          readDirectory(itemPath, newRelativePath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (supportedExtensions.includes(ext)) {
            try {
              const content = fs.readFileSync(itemPath, "utf8");
              const materialName = relativePath ? `${relativePath}/${item}` : item;
              materials.push({
                name: materialName,
                content: content.trim()
              });
              console.log(`读取材料文件: ${materialName}`);
            } catch (e) {
              console.error(`读取文件失败 ${itemPath}: ${e.message}`);
            }
          }
        }
      }
    } catch (e) {
      console.error(`读取目录失败 ${dir}: ${e.message}`);
    }
  }

  readDirectory(materialsDir);
  return materials;
}

// 导出命令定义
module.exports = {
  name: "litigation_strategy",
  aliases: ["诉讼策略", "制定策略", "制定诉讼策略"],
  description: "为案件制定诉讼策略",
  usage: "制定诉讼策略：<案件名称>",
  examples: [
    "制定诉讼策略：张三诉李四合同纠纷案",
    "制定诉讼策略：交通事故纠纷",
  ],
  handler,
};
