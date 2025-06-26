/**
 * 法律工程系统 - 主入口文件
 * 基于CDT框架优化的版本
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

// CDT优化：简化命令结构，渐进式信息披露
function showHelpMessage(context = null) {
  console.log(chalk.magenta('📁 基础操作'));
  console.log(chalk.white('  • ') + chalk.cyan('新案件') + chalk.gray('  - 创建新案件 (新案件：名称 类型)'));
  console.log(chalk.white('  • ') + chalk.cyan('看案件') + chalk.gray('  - 查看所有案件'));
  console.log(chalk.white('  • ') + chalk.cyan('选案件') + chalk.gray('  - 切换案件 (选案件：名称)'));
  
  console.log(chalk.magenta('🔍 案件分析'));
  console.log(chalk.white('  • ') + chalk.cyan('加材料') + chalk.gray('  - 添加案件材料 (加材料：名称 内容)'));
  console.log(chalk.white('  • ') + chalk.cyan('找焦点') + chalk.gray('  - 识别争议焦点 (找焦点：案件名)'));
  console.log(chalk.white('  • ') + chalk.cyan('定策略') + chalk.gray('  - 制定诉讼策略 (定策略：案件名)'));
  
  console.log(chalk.magenta('⚙️  系统'));
  console.log(chalk.white('  • ') + chalk.cyan('帮助') + chalk.gray('    - 显示详细帮助'));
  console.log(chalk.white('  • ') + chalk.yellow('Ctrl+C') + chalk.gray(' - 快速退出'));
  
  // CDT优化：上下文智能提示
  const tip = getContextualTip(context);
  if (tip) {
    console.log('\n' + tip);
  }
}

// CDT优化：上下文感知提示
function getContextualTip(context) {
  if (!context) return null;
  
  if (!context.currentCase) {
    return chalk.blue('💡 建议：先创建或选择一个案件 (新案件 或 看案件)');
  }
  
  if (context.currentCase.materials?.length === 0) {
    return chalk.blue('💡 建议：添加案件材料后再进行分析 (加材料)');
  }
  
  return chalk.blue('💡 可以进行争议焦点分析或制定诉讼策略 (找焦点 或 定策略)');
}

function showDetailedHelp() {
  console.log(chalk.blue.bold('\n详细帮助指南'));
  console.log(chalk.gray('━'.repeat(40)));
  
  console.log(chalk.yellow('\n基础操作：'));
  console.log('  新案件：合同纠纷 民商事');
  console.log('  看案件');
  console.log('  选案件：合同纠纷');
  
  console.log(chalk.yellow('\n案件分析：'));
  console.log('  加材料：起诉状 原告张三...');
  console.log('  找焦点：合同纠纷');
  console.log('  定策略：合同纠纷');
  
  console.log(chalk.yellow('\n快捷键：'));
  console.log('  Ctrl+C - 退出系统');
  console.log('  帮助 - 显示基础帮助');
  console.log('  详助 - 显示详细帮助');
}

// CDT优化：错误预防与智能建议
function validateCommand(command, args, context) {
  const warnings = [];
  
  if ((command === "找焦点" || command === "定策略") && !context.currentCase && args.length === 0) {
    warnings.push("⚠️ 需要指定案件名称或先选择案件");
  }
  
  if (command === "加材料" && !context.currentCase) {
    warnings.push("⚠️ 需要先选择案件");
  }
  
  return warnings;
}

async function processCommand(input, context) {
  try {
    const lowerInput = input.trim().toLowerCase();
    if (lowerInput === "help" || lowerInput === "帮助" || lowerInput === "?") {
      showHelpMessage(context);
      return "";
    }

    if (lowerInput === "详助" || lowerInput === "详细帮助") {
      showDetailedHelp();
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

    // CDT优化：简化命令映射
    const commandMap = {
      // 简化的中文短命令
      新案件: "create_case", 新建案件: "create_case", 创建案件: "create_case",
      看案件: "list_cases", 案件列表: "list_cases",
      选案件: "switch_case", 选择案件: "switch_case", 切换案件: "switch_case",
      加材料: "add_material", 添加材料: "add_material",
      找焦点: "analyze_case", 识别争议焦点: "analyze_case", 争议焦点: "analyze_case",
      定策略: "litigation_strategy", 诉讼策略: "litigation_strategy", 制定诉讼策略: "litigation_strategy"
    };

    // CDT优化：错误预防
    const warnings = validateCommand(command, args, context);
    if (warnings.length > 0) {
      return warnings.join('\n') + '\n\n' + getContextualTip(context);
    }

    // 特殊处理争议焦点命令
    if (command === "找焦点" || command === "识别争议焦点" || command === "争议焦点") {
      // 如果没有参数且有当前案件，使用当前案件
      if (args.length === 0 && context.currentCase) {
        args = [context.currentCase.caseName];
      }
      return await commandRegistry.executeCommand("analyze_case", ["识别争议焦点", ...args], context);
    }

    // 特殊处理策略命令
    if (command === "定策略" || command === "诉讼策略" || command === "制定诉讼策略") {
      // 如果没有参数且有当前案件，使用当前案件
      if (args.length === 0 && context.currentCase) {
        args = [context.currentCase.caseName];
      }
      return await commandRegistry.executeCommand("litigation_strategy", args, context);
    }

    const cmdName = commandMap[command] || command;

    if (!commandRegistry.commands.has(cmdName)) {
      const suggestions = getSimilarCommands(command, Object.keys(commandMap));
      if (suggestions.length > 0) {
        return `未找到命令: ${command}\n💡 您是否想要执行: ${suggestions.join(", ")}\n\n输入 "帮助" 查看可用命令`;
      }
      return `未找到命令: ${command}\n输入 "帮助" 查看可用命令`;
    }

    const result = await commandRegistry.executeCommand(cmdName, args, context);
    
    // CDT优化：成功反馈和下一步建议
    if (result && !result.includes("出错")) {
      const nextTip = getNextStepTip(cmdName, context);
      if (nextTip) {
        return result + '\n\n' + nextTip;
      }
    }
    
    return result;
  } catch (err) {
    return `命令执行出错: ${err.message}\n\n💡 输入 "帮助" 查看可用命令`;
  }
}

// CDT优化：智能下一步建议
function getNextStepTip(command, context) {
  switch(command) {
    case "create_case":
      return chalk.blue('💡 下一步：添加案件材料 (加材料：材料名称 材料内容)');
    case "add_material":
      return chalk.blue('💡 下一步：分析争议焦点 (找焦点) 或制定诉讼策略 (定策略)');
    case "analyze_case":
      return chalk.blue('💡 下一步：制定诉讼策略 (定策略)');
    default:
      return null;
  }
}

// CDT优化：相似命令建议
function getSimilarCommands(input, commands) {
  return commands.filter(cmd => 
    cmd.includes(input) || input.includes(cmd) || 
    getLevenshteinDistance(input, cmd) <= 2
  ).slice(0, 3);
}

function getLevenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
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
      // CDT优化：动态提示符显示当前状态
      const currentCaseInfo = context.currentCase 
        ? chalk.green(`[${context.currentCase.caseName}]`) + ' '
        : '';
      
      const { command } = await inquirer.prompt([{
        type: "input",
        name: "command",
        message: chalk.cyan('⚖️ ') + currentCaseInfo + chalk.bold.green('法律工程') + chalk.white(' ❯ '),
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