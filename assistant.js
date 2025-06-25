#!/usr/bin/env node

/**
 * 法律工程系统 - 智能助手
 * 合并了command.sh和legal_assistant.py的功能
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawn } = require("child_process");
const { promisify } = require("util");
const which = require("which");

// 获取脚本所在目录
const BASE_DIR = path.dirname(require.resolve(__filename));
const COMMAND_SYSTEM_DIR = path.join(BASE_DIR, "工程组件", "命令系统");
const CASES_DIR = path.join(BASE_DIR, "案例"); // 新的案例目录

// 导入命令系统模块
let commandModule;
let COMMANDS_IMPORTED = false;

try {
  // 尝试导入命令系统模块
  commandModule = require(path.join(BASE_DIR, "工程组件", "命令系统"));
  COMMANDS_IMPORTED = true;
} catch (err) {
  console.log("警告: 无法导入命令系统模块，将使用内置函数");
  console.log(err.message);
}

// 清屏函数
function clearScreen() {
  process.stdout.write(
    process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H"
  );
}

// 显示所有指令
function showCommands() {
  console.log("法律工程系统 - 智能助手");
  console.log("=".repeat(50));
  console.log("可用指令:");
  console.log("  新建案件<案件名称>");
  console.log("  查看案件列表");
  console.log("  选择案件：<案件名称>");
  console.log("  分析案件材料：<案件名称>");
  console.log("  识别争议焦点<案件名称>");
  console.log("  生成检索关键词：<案件名称>");
  console.log("  启动律师角色：<案件名称>");
  console.log("  生成诉讼策略：<案件名称>");
  console.log("  起草<文书类型>：<案件名称>  (如: 起草起诉状：合同纠纷案件)");
  console.log("  启动服务器");
  console.log("  清屏");
  console.log("  退出");
  console.log("=".repeat(50));
}

// 启动服务器函数
async function startServer() {
  console.log("正在启动本地HTTP服务器...");
  console.log("服务器将在端口 8000 上运行");
  console.log("");
  console.log("请在浏览器中访问以下地址:");
  console.log("http://localhost:8000/工程组件/页面/index.html");
  console.log("");
  console.log("按 Ctrl+C 可停止服务器");
  console.log("-----------------------------------");

  // 尝试使用不同的命令启动HTTP服务器
  try {
    process.chdir(BASE_DIR);

    // 检查可用的命令
    const checkCommand = async (cmd) => {
      try {
        await promisify(which)(cmd);
        return true;
      } catch (e) {
        return false;
      }
    };

    if (await checkCommand("python3")) {
      const server = spawn("python3", ["-m", "http.server", "8000"], {
        stdio: "inherit",
      });
      await new Promise((resolve) => server.on("close", resolve));
    } else if (await checkCommand("python")) {
      const server = spawn("python", ["-m", "SimpleHTTPServer", "8000"], {
        stdio: "inherit",
      });
      await new Promise((resolve) => server.on("close", resolve));
    } else if (await checkCommand("npx")) {
      const server = spawn("npx", ["http-server", "-p", "8000"], {
        stdio: "inherit",
      });
      await new Promise((resolve) => server.on("close", resolve));
    } else if (await checkCommand("php")) {
      const server = spawn("php", ["-S", "localhost:8000"], {
        stdio: "inherit",
      });
      await new Promise((resolve) => server.on("close", resolve));
    } else {
      console.log("错误: 未找到可用的HTTP服务器");
      console.log("请安装Python、Node.js或PHP中的任意一个");
      return false;
    }
  } catch (e) {
    if (e.code !== "SIGINT") {
      console.log(`启动服务器失败: ${e.message}`);
      return false;
    }
    console.log("\n服务器已停止");
  }
  return true;
}

// 未实现的命令
function notImplemented(command, caseName = null) {
  console.log(`命令 "${command}" 尚未实现`);
  if (caseName) {
    console.log(`案件: "${caseName}"`);
  }
  console.log(`请在 "${COMMAND_SYSTEM_DIR}" 目录中创建对应的实现脚本`);
}

// 处理用户输入
async function processInput(userInput) {
  // 处理退出命令
  if (["退出", "exit", "quit", "q"].includes(userInput.toLowerCase())) {
    console.log("感谢使用法律工程系统，再见！");
    process.exit(0);
  }

  // 处理帮助命令
  if (["帮助", "help", "h", "?"].includes(userInput.toLowerCase())) {
    showCommands();
    return;
  }

  // 处理清屏命令
  if (["清屏", "clear", "cls"].includes(userInput.toLowerCase())) {
    clearScreen();
    showCommands();
    return;
  }

  // 启动服务器
  if (/启动服务器/.test(userInput)) {
    console.log("正在启动本地服务器...");
    await startServer();
    return;
  }

  // 处理新建案件指令
  let match = /新建案件(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 创建新案件 "${caseName}"`);
    if (COMMANDS_IMPORTED) {
      await commandModule.createCase(BASE_DIR, CASES_DIR, caseName);
    } else {
      notImplemented("新建案件", caseName);
    }
    return;
  }

  // 处理查看案件列表指令
  if (/查看案件列表/.test(userInput)) {
    console.log("执行: 查看案件列表");
    if (COMMANDS_IMPORTED) {
      commandModule.listCases(CASES_DIR);
    } else {
      notImplemented("查看案件列表");
    }
    return;
  }

  // 处理选择案件指令
  match = /选择案件：(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 选择案件 "${caseName}"`);
    if (COMMANDS_IMPORTED) {
      commandModule.selectCase(BASE_DIR, CASES_DIR, caseName);
    } else {
      notImplemented("选择案件", caseName);
    }
    return;
  }

  // 处理分析案件材料指令
  match = /分析案件材料：(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 分析案件材料 "${caseName}"`);
    notImplemented("分析案件材料", caseName);
    return;
  }

  // 处理识别争议焦点指令
  match = /识别争议焦点(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 识别争议焦点 "${caseName}"`);
    if (COMMANDS_IMPORTED) {
      await commandModule.identifyDisputeFocus(BASE_DIR, CASES_DIR, caseName);
    } else {
      notImplemented("识别争议焦点", caseName);
    }
    return;
  }

  // 处理生成检索关键词指令
  match = /生成检索关键词：(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 生成检索关键词 "${caseName}"`);
    notImplemented("生成检索关键词", caseName);
    return;
  }

  // 处理启动律师角色指令
  match = /启动律师角色：(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 启动律师角色 "${caseName}"`);
    notImplemented("启动律师角色", caseName);
    return;
  }

  // 处理生成诉讼策略指令
  match = /生成诉讼策略：(.*)/.exec(userInput);
  if (match) {
    const caseName = match[1];
    console.log(`执行: 生成诉讼策略 "${caseName}"`);
    notImplemented("生成诉讼策略", caseName);
    return;
  }

  // 处理起草法律文书指令
  match = /起草(.*?)：(.*)/.exec(userInput);
  if (match) {
    const docType = match[1];
    const caseName = match[2];
    console.log(`执行: 起草${docType} "${caseName}"`);
    notImplemented(`起草${docType}`, caseName);
    return;
  }

  // 如果没有匹配任何已知指令
  console.log(`无法识别的指令: ${userInput}`);
  console.log("请查看上面的可用指令列表");
}

// 处理命令行参数
function handleArgs() {
  if (process.argv.length > 2) {
    // 将所有参数合并为一个指令
    const userInput = process.argv.slice(2).join(" ");
    processInput(userInput);
    return true;
  }
  return false;
}

// 主函数
async function main() {
  // 如果有命令行参数，处理后退出
  if (handleArgs()) {
    return;
  }

  // 否则启动交互式模式
  clearScreen();
  console.log("=".repeat(50));
  console.log("欢迎使用法律工程系统");
  console.log("=".repeat(50));

  // 直接显示所有可用指令
  showCommands();

  // 创建readline接口
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "法律工程> ",
  });

  rl.on("line", async (line) => {
    try {
      const userInput = line.trim();
      if (userInput) {
        await processInput(userInput);
      }
    } catch (e) {
      console.log(`错误: ${e.message}`);
    }
    rl.prompt();
  }).on("close", () => {
    console.log("感谢使用法律工程系统，再见！");
    process.exit(0);
  });

  // 显示提示符
  rl.prompt();
}

// 启动程序
main().catch((err) => {
  console.error(`程序出错: ${err.message}`);
  process.exit(1);
});
