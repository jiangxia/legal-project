/**
 * 创建案件命令
 */

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { createGoalSettingContent } = require("../utils/goal_setting");

/**
 * 创建案件命令处理函数
 *
 * @param {Array<string>} args - 命令参数
 * @param {Object} context - 命令上下文
 * @returns {Promise<string>} - 命令执行结果
 */
async function handler(args, context) {
  try {
    if (args.length < 1) {
      return "参数不足，请提供案件名称。\n用法: /create_case <案件名称> [案件类型] [业务类型]";
    }

    const caseName = args[0];
    const caseType = args.length > 1 ? args[1] : "民商事";
    const businessType = args.length > 2 ? args[2] : null;

    // 验证案件类型
    const validCaseTypes = ["民商事", "刑事", "行政", "非诉"];
    if (!validCaseTypes.includes(caseType)) {
      return `不支持的案件类型: ${caseType}\n支持的案件类型: ${validCaseTypes.join(
        ", "
      )}`;
    }

    // 生成案件ID
    const caseId = uuidv4();

    // 创建案件目录结构
    const caseFolderName = `案件：${caseName}`;
    const caseFolderPath = path.join(process.cwd(), "cases", caseFolderName);

    // 创建案件目录
    try {
      // 确保案例目录存在
      const casesDir = path.join(process.cwd(), "cases");
      if (!fs.existsSync(casesDir)) {
        fs.mkdirSync(casesDir, { recursive: true });
      }

      // 检查模板目录是否存在
      const templatePath = path.join(process.cwd(), "cases", "案件模板");
      if (fs.existsSync(templatePath)) {
        // 使用模板创建案件目录结构
        console.log("使用案件模板创建目录结构...");
        copyFolderRecursiveSync(templatePath, casesDir, caseFolderName);
      } else {
        // 如果模板不存在，创建基本目录结构
        console.log("案件模板不存在，创建基本目录结构...");
        createBasicCaseStructure(caseFolderPath);
      }

      // 创建案件信息文件
      const caseInfo = {
        id: caseId,
        name: caseName,
        type: caseType,
        businessType: businessType || "",
        createTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
        parties: {
          plaintiffs: [], // 原告列表
          defendants: [], // 被告列表
          thirdParties: [], // 第三人列表
        },
        materials: [],
        analyses: [],
        timeline: [
          {
            id: Date.now().toString(),
            title: "创建案件",
            description: `创建案件：${caseName}`,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        status: "进行中", // 案件状态：进行中、已结案、中止
      };

      fs.writeFileSync(
        path.join(caseFolderPath, "案件信息.json"),
        JSON.stringify(caseInfo, null, 2),
        "utf8"
      );

      // 创建或更新案件说明文件
      const readmePath = path.join(caseFolderPath, "README.md");
      if (fs.existsSync(readmePath)) {
        // 如果已存在README，更新其内容
        let readmeContent = fs.readFileSync(readmePath, "utf8");
        readmeContent = readmeContent.replace(/# .*/, `# ${caseName}`);
        readmeContent = readmeContent.replace(
          /- 案件名称：.*/,
          `- 案件名称：${caseName}`
        );
        readmeContent = readmeContent.replace(
          /- 案件类型：.*/,
          `- 案件类型：${caseType}`
        );
        readmeContent = readmeContent.replace(
          /- 创建时间：.*/,
          `- 创建时间：${new Date().toLocaleString()}`
        );
        readmeContent = readmeContent.replace(
          /- 案件ID：.*/,
          `- 案件ID：${caseId}`
        );

        if (businessType) {
          if (readmeContent.includes("- 业务类型：")) {
            readmeContent = readmeContent.replace(
              /- 业务类型：.*/,
              `- 业务类型：${businessType}`
            );
          } else {
            // 在案件ID后面添加业务类型
            readmeContent = readmeContent.replace(
              /- 案件ID：.*\n/,
              `- 案件ID：${caseId}\n- 业务类型：${businessType}\n`
            );
          }
        }

        fs.writeFileSync(readmePath, readmeContent, "utf8");
      } else {
        // 如果不存在README，创建新的
        createReadmeFile(
          caseFolderPath,
          caseName,
          caseType,
          caseId,
          businessType
        );
      }

      // 创建目标设定文件
      const goalSettingPath = path.join(caseFolderPath, "目标设定.md");
      if (!fs.existsSync(goalSettingPath)) {
        const goalContent = createGoalSettingContent(caseName, caseType, businessType);
        fs.writeFileSync(goalSettingPath, goalContent, "utf8");
      }

      // 创建时间线目录和文件（如果不存在）
      const timelineDir = path.join(caseFolderPath, "时间线");
      if (!fs.existsSync(timelineDir)) {
        fs.mkdirSync(timelineDir, { recursive: true });

        // 创建默认时间线文件
        const defaultTimeline = [
          {
            id: Date.now().toString(),
            title: "创建案件",
            description: `创建案件：${caseName}`,
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];

        // 保存时间线JSON
        fs.writeFileSync(
          path.join(timelineDir, "时间线.json"),
          JSON.stringify(defaultTimeline, null, 2),
          "utf8"
        );

        // 生成时间线Markdown
        const timelineMd = generateTimelineMd(caseName, defaultTimeline);
        fs.writeFileSync(
          path.join(timelineDir, "时间线.md"),
          timelineMd,
          "utf8"
        );
      }
    } catch (err) {
      console.error("创建案件目录结构失败:", err);
      return `创建案件目录结构失败: ${err.message}`;
    }

    // 创建案件
    const newCase = context.assistant.createCase(
      caseId,
      caseName,
      caseType,
      businessType
    );

    return `案件创建成功！\n案件ID: ${caseId}\n案件名称: ${caseName}\n案件类型: ${caseType}${
      businessType ? "\n业务类型: " + businessType : ""
    }\n案件目录已创建: cases/${caseFolderName}/\n\n已按照模板创建案件目录结构，并生成目标设定文件。\n\n⚠️ 重要提醒：请立即查看并完善 '目标设定.md' 文件，明确案件目标和预期结果。AI助手将始终参考此文件内容进行案件分析和建议。`;
  } catch (err) {
    console.error("创建案件出错:", err);
    return `创建案件出错: ${err.message}`;
  }
}

/**
 * 递归复制文件夹
 *
 * @param {string} source - 源文件夹路径
 * @param {string} targetDir - 目标目录
 * @param {string} newFolderName - 新文件夹名称
 */
function copyFolderRecursiveSync(source, targetDir, newFolderName) {
  // 创建目标文件夹
  const targetFolderPath = path.join(targetDir, newFolderName);
  if (!fs.existsSync(targetFolderPath)) {
    fs.mkdirSync(targetFolderPath, { recursive: true });
  }

  // 读取源文件夹中的所有项目
  const items = fs.readdirSync(source);

  // 复制每个项目到目标文件夹
  for (const item of items) {
    // 忽略.DS_Store文件
    if (item === ".DS_Store") continue;

    const sourcePath = path.join(source, item);
    const targetPath = path.join(targetFolderPath, item);

    // 检查是否是目录
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      // 递归复制子目录
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      // 读取子目录中的所有项目
      const subItems = fs.readdirSync(sourcePath);
      for (const subItem of subItems) {
        if (subItem === ".DS_Store") continue;

        const subSourcePath = path.join(sourcePath, subItem);
        const subTargetPath = path.join(targetPath, subItem);

        const subStats = fs.statSync(subSourcePath);
        if (subStats.isDirectory()) {
          // 递归创建子目录
          if (!fs.existsSync(subTargetPath)) {
            fs.mkdirSync(subTargetPath, { recursive: true });
          }

          // 继续复制子目录的内容
          copyFolderContentsSync(subSourcePath, subTargetPath);
        } else {
          // 复制文件
          fs.copyFileSync(subSourcePath, subTargetPath);
        }
      }
    } else {
      // 复制文件（忽略README.md，因为我们会创建新的）
      if (item !== "README.md") {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }
}

/**
 * 复制文件夹内容
 *
 * @param {string} source - 源文件夹路径
 * @param {string} target - 目标文件夹路径
 */
function copyFolderContentsSync(source, target) {
  // 读取源文件夹中的所有项目
  const items = fs.readdirSync(source);

  // 复制每个项目到目标文件夹
  for (const item of items) {
    // 忽略.DS_Store文件
    if (item === ".DS_Store") continue;

    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);

    // 检查是否是目录
    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      // 递归复制子目录
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyFolderContentsSync(sourcePath, targetPath);
    } else {
      // 复制文件
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * 创建基本案件目录结构（当模板不存在时使用）
 *
 * @param {string} caseFolderPath - 案件文件夹路径
 */
function createBasicCaseStructure(caseFolderPath) {
  // 确保案件目录存在
  if (!fs.existsSync(caseFolderPath)) {
    fs.mkdirSync(caseFolderPath, { recursive: true });
  }

  // 创建基本目录结构
  const basicDirs = [
    "案件材料/原告",
    "案件材料/被告",
    "案件材料/第三人",
    "分析/争议焦点",
    "分析/诉讼策略",
    "分析/证据分析",
    "分析/案例研究",
    "文书",
    "庭审",
    "法律规范",
    "时间线",
  ];

  for (const dir of basicDirs) {
    const dirPath = path.join(caseFolderPath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

/**
 * 创建README文件
 *
 * @param {string} caseFolderPath - 案件文件夹路径
 * @param {string} caseName - 案件名称
 * @param {string} caseType - 案件类型
 * @param {string} caseId - 案件ID
 * @param {string} businessType - 业务类型（可选）
 */
function createReadmeFile(
  caseFolderPath,
  caseName,
  caseType,
  caseId,
  businessType
) {
  const readmeContent = `# ${caseName}

## 案件基本信息
- 案件名称：${caseName}
- 案件类型：${caseType}
${businessType ? `- 业务类型：${businessType}` : ""}
- 创建时间：${new Date().toLocaleString()}
- 案件ID：${caseId}

## 案件目录结构说明
- 案件材料/
  - 原告/ - 存放原告方提供的材料和证据
  - 被告/ - 存放被告方提供的材料和证据
  - 第三人/ - 存放第三人提供的材料和证据
- 分析/
  - 争议焦点/ - 存放案件争议焦点分析
  - 诉讼策略/ - 存放案件诉讼策略分析
  - 证据分析/ - 存放证据分析报告
  - 案例研究/ - 存放相关案例研究
- 文书/ - 存放各类法律文书
- 庭审/ - 存放庭审相关材料
- 法律规范/ - 存放案件相关法律法规
- 时间线/ - 存放案件进展时间线

## 操作指南
1. 使用"添加材料"命令添加案件材料
2. 使用"分析案件"命令分析案件争议焦点
3. 使用"诉讼策略"命令制定案件诉讼策略
4. 使用"添加当事人"命令添加案件当事人信息
`;

  fs.writeFileSync(
    path.join(caseFolderPath, "README.md"),
    readmeContent,
    "utf8"
  );
}

/**
 * 生成时间线Markdown
 *
 * @param {string} caseName - 案件名称
 * @param {Array} timeline - 时间线事件数组
 * @returns {string} - 时间线Markdown内容
 */
function generateTimelineMd(caseName, timeline) {
  // 按日期排序
  const sortedEvents = [...timeline].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let md = `# ${caseName} 案件时间线\n\n`;

  if (sortedEvents.length === 0) {
    md += "暂无事件记录\n";
    return md;
  }

  sortedEvents.forEach((event) => {
    const date = new Date(event.date);
    const dateStr = date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    md += `## ${dateStr} - ${event.title}\n\n`;
    md += `${event.description}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

// 导出命令定义
module.exports = {
  name: "create_case",
  aliases: ["新建案件", "new_case"],
  description: "创建新案件（默认类型：民商事）",
  usage: "/create_case <案件名称> [案件类型] [业务类型]",
  examples: [
    "/create_case 张三诉李四合同纠纷案",
    "/create_case 张三诉李四合同纠纷案 民商事",
    "/create_case 王五刑事案件 刑事",
    "/create_case 赵六诉某局行政处罚案 行政",
    "/create_case 孙七合同审查 非诉 合同审查",
  ],
  handler,
};
