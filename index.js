/**
 * 法律工程系统 - 主入口文件
 */

const path = require("path");
const inquirer = require("inquirer");
const chalk = require("chalk");
const CommandRegistry = require("./src/commands");
const AIEngine = require("./src/core/ai-engine");
const ConfigManager = require("./src/core/config-manager");

// 案件类型导入
const CivilCase = require("./src/case-types/civil");
const CriminalCase = require("./src/case-types/criminal");
const AdministrativeCase = require("./src/case-types/administrative");
const NonLitigationCase = require("./src/case-types/non-litigation");

// 初始化核心组件
const commandRegistry = new CommandRegistry();
const aiEngine = new AIEngine();
const configManager = new ConfigManager();

commandRegistry.loadAllCommandModules();

function showWelcomeMessage() {
  console.log(chalk.cyan('\n⚖️  ' + chalk.bold('法律工程系统') + ' v2.0.0'));
  console.log(chalk.gray('━'.repeat(50)));
  showHelpMessage();
  console.log();
}

function showHelpMessage() {
  console.log(chalk.magenta('📁 案件管理'));
  console.log(chalk.white('  • ') + chalk.cyan('新建案件：') + '<案件名称> <案件类型>' + chalk.gray(' - 创建新案件'));
  console.log(chalk.white('  • ') + chalk.cyan('案件列表') + chalk.gray('                    - 查看所有案件'));
  console.log(chalk.white('  • ') + chalk.cyan('选择案件：') + '<案件名称>' + chalk.gray('        - 切换当前操作的案件'));
  
  console.log(chalk.magenta('🔍 案件操作'));
  console.log(chalk.white('  • ') + chalk.cyan('添加材料：') + '<材料名称> <材料内容>' + chalk.gray(' - 为当前案件添加材料'));
  console.log(chalk.white('  • ') + chalk.cyan('分析案件：') + '<分析类型>' + chalk.gray('        - 分析当前案件'));
  console.log(chalk.white('  • ') + chalk.cyan('识别争议焦点：') + '<案件名称>' + chalk.gray('    - 直接分析指定案件的争议焦点'));
  console.log(chalk.white('  • ') + chalk.cyan('诉讼策略：') + '<案件名称>' + chalk.gray('        - 为指定案件制定诉讼策略'));
  
  console.log(chalk.magenta('⚙️  系统命令'));
  console.log(chalk.white('  • ') + chalk.cyan('帮助') + chalk.gray('                     - 显示此帮助信息'));
  console.log(chalk.white('  • ') + chalk.cyan('退出') + chalk.gray('                     - 退出系统'));
  console.log(chalk.white('  • ') + chalk.yellow('Ctrl+C') + ' 或 ' + chalk.yellow('Ctrl+D') + chalk.gray('           - 快速退出'));
}

async function processCommand(input, context) {
  try {
    const lowerInput = input.trim().toLowerCase();
    if (lowerInput === "help" || lowerInput === "帮助" || lowerInput === "?") {
      showHelpMessage();
      return "";
    }

    if (lowerInput === "exit" || lowerInput === "退出" || lowerInput === "quit") {
      console.log(chalk.green("👋 感谢使用法律工程系统，再见！"));
      process.exit(0);
    }

    // 解析命令
    let command, args;
    const colonIndex = input.indexOf("：");
    const englishColonIndex = input.indexOf(":");

    if (colonIndex !== -1) {
      command = input.substring(0, colonIndex).trim();
      args = splitArgsSmartly(input.substring(colonIndex + 1).trim());
    } else if (englishColonIndex !== -1) {
      command = input.substring(0, englishColonIndex).trim();
      args = splitArgsSmartly(input.substring(englishColonIndex + 1).trim());
    } else {
      const parts = input.trim().split(/\s+/);
      command = parts[0];
      args = parts.slice(1);
    }

    // 命令映射
    const commandMap = {
      新建案件: "create_case", 创建案件: "create_case", 案件列表: "list_cases",
      选择案件: "switch_case", 切换案件: "switch_case", 添加材料: "add_material",
      分析案件: "analyze_case", 诉讼策略: "litigation_strategy", 制定诉讼策略: "litigation_strategy"
    };

    // 特殊处理识别争议焦点命令
    if (command === "识别争议焦点" || command === "争议焦点") {
      return await commandRegistry.executeCommand("analyze_case", ["识别争议焦点", ...args], context);
    }

    const cmdName = commandMap[command] || command;

    if (!commandRegistry.commands.has(cmdName)) {
      return `未找到命令: ${command}\n输入 "帮助" 查看可用命令`;
    }

    return await commandRegistry.executeCommand(cmdName, args, context);
  } catch (err) {
    return `命令执行出错: ${err.message}`;
  }
}

function splitArgsSmartly(input) {
  if (!input.includes(" ")) return [input];

  const caseTypes = ["民商事", "刑事", "行政", "非诉"];
  const words = input.split(" ");
  const lastWord = words[words.length - 1];

  if (caseTypes.includes(lastWord)) {
    return [words.slice(0, -1).join(" "), lastWord];
  }

  const firstSpaceIndex = input.indexOf(" ");
  return firstSpaceIndex !== -1
    ? [input.substring(0, firstSpaceIndex), input.substring(firstSpaceIndex + 1)]
    : [input];
}

async function startInteractiveMode(context) {
  showWelcomeMessage();

  // 设置快捷键支持
  process.on('SIGINT', () => {
    console.log(chalk.green('\n👋 感谢使用法律工程系统，再见！'));
    process.exit(0);
  });

  const promptUser = async () => {
    try {
      const { command } = await inquirer.prompt([{
        type: "input",
        name: "command",
        message: chalk.cyan('⚖️ ') + chalk.bold.green('法律工程') + chalk.white(' ❯ '),
        prefix: "",
      }]);

      if (command.trim()) {
        const result = await processCommand(command, context);
        if (result) console.log(result);
      }
      promptUser();
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        console.log(chalk.green('\n👋 感谢使用法律工程系统，再见！'));
        process.exit(0);
      }
      throw error;
    }
  };

  promptUser();
}

function createCaseObject(caseInfo, actualCaseName) {
  const caseClasses = {
    "民商事": CivilCase,
    "刑事": CriminalCase,
    "行政": AdministrativeCase,
    "非诉": NonLitigationCase
  };

  const CaseClass = caseClasses[caseInfo.type] || CivilCase;
  return new CaseClass(caseInfo.id, actualCaseName, caseInfo.type, caseInfo.businessType);
}

async function start() {
  console.log("法律工程系统启动中...");

  try {
    const context = {
      aiEngine,
      configManager,
      commandRegistry,
      currentCase: null,
      assistant: {
        createCase: (caseId, caseName, caseType, businessType) => {
          console.log(`创建案件: ${caseName} (${caseType})`);
          const caseObject = createCaseObject({
            id: caseId, type: caseType, businessType
          }, caseName);

          if (caseObject?.addTimelineEvent) {
            caseObject.addTimelineEvent("创建案件", `创建案件：${caseName}`);
          }
          return caseObject;
        },

        getCaseList: () => {
          const fs = require("fs");
          const path = require("path");

          try {
            const casesDir = path.join(process.cwd(), "cases");
            if (!fs.existsSync(casesDir)) return [];

            return fs.readdirSync(casesDir)
              .filter(name => {
                const fullPath = path.join(casesDir, name);
                return fs.statSync(fullPath).isDirectory() &&
                       name !== "案件模板" && !name.startsWith(".");
              })
              .map(name => {
                const caseName = name.startsWith("案件：") ? name.replace(/^案件：/, "") : name;
                const caseInfoPath = path.join(casesDir, name, "案件信息.json");

                try {
                  if (fs.existsSync(caseInfoPath)) {
                    const caseInfo = JSON.parse(fs.readFileSync(caseInfoPath, "utf8"));
                    return {
                      id: caseInfo.id || "unknown",
                      name: caseName,
                      type: caseInfo.type || "未知",
                      businessType: caseInfo.businessType || "",
                      createTime: caseInfo.createTime || "",
                      status: caseInfo.status || "进行中",
                    };
                  }
                } catch (e) {}

                return { id: "unknown", name: caseName, type: "未知" };
              });
          } catch (err) {
            console.error("获取案件列表出错:", err);
            return [];
          }
        },

        switchCase: (caseName) => {
          const fs = require("fs");
          const path = require("path");

          try {
            const casesDir = path.join(process.cwd(), "cases");
            if (!fs.existsSync(casesDir)) {
              throw new Error(`案例目录不存在: ${casesDir}`);
            }

            const allDirs = fs.readdirSync(casesDir);
            let foundCaseDir = allDirs.find(dir =>
              dir === caseName || dir === `案件：${caseName}` ||
              dir.includes(caseName) ||
              (dir.startsWith("案件：") && dir.substring(3).includes(caseName))
            );

            if (!foundCaseDir) {
              throw new Error(`找不到案件: ${caseName}`);
            }

            const caseFolderPath = path.join(casesDir, foundCaseDir);
            const caseInfoPath = path.join(caseFolderPath, "案件信息.json");

            let caseInfo;
            if (fs.existsSync(caseInfoPath)) {
              caseInfo = JSON.parse(fs.readFileSync(caseInfoPath, "utf8"));
            } else {
              const actualCaseName = foundCaseDir.startsWith("案件：")
                ? foundCaseDir.substring(3) : foundCaseDir;
              caseInfo = {
                id: "temp-" + Date.now(),
                name: actualCaseName,
                type: "民商事",
                businessType: "",
                createTime: new Date().toISOString(),
                status: "进行中",
              };
            }

            const actualCaseName = foundCaseDir.startsWith("案件：")
              ? foundCaseDir.substring(3) : foundCaseDir;

            const caseObject = createCaseObject(caseInfo, actualCaseName);
            context.currentCase = caseObject;

            if (caseObject?.addTimelineEvent) {
              caseObject.addTimelineEvent("切换案件", `切换到案件：${actualCaseName}`);
            }

            return caseObject;
          } catch (err) {
            console.error(`切换案件出错: ${err.message}`);
            throw err;
          }
        },
      },
    };

    const args = process.argv.slice(2);
    const command = args.join(" ");

    if (command) {
      console.log(`执行命令: ${command}`);
      const result = await processCommand(command, context);
      console.log(result);
    } else {
      await startInteractiveMode(context);
    }
  } catch (err) {
    console.error("系统启动出错:", err);
  }
}

if (require.main === module) {
  start();
}

module.exports = { commandRegistry, aiEngine, configManager, start };
