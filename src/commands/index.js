/**
 * 命令系统入口
 * 提供可扩展的命令注册和执行机制
 */

const path = require("path");
const fs = require("fs");

// 命令处理器类
class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.commandGroups = new Map();
    this.commandsDir = __dirname;

    // 确保命令目录存在
    if (!fs.existsSync(this.commandsDir)) {
      fs.mkdirSync(this.commandsDir, { recursive: true });
    }
  }

  /**
   * 注册命令
   *
   * @param {string} name - 命令名称
   * @param {Function} handler - 命令处理函数
   * @param {string} group - 命令组（可选）
   * @param {string} description - 命令描述（可选）
   * @param {Array<string>} aliases - 命令别名列表（可选）
   */
  registerCommand(
    name,
    handler,
    group = "default",
    description = "",
    aliases = []
  ) {
    if (this.commands.has(name)) {
      console.warn(`命令 ${name} 已存在，将被覆盖`);
    }

    const command = {
      name,
      handler,
      group,
      description,
      aliases,
    };

    this.commands.set(name, command);

    // 注册别名
    aliases.forEach((alias) => {
      if (this.commands.has(alias)) {
        console.warn(`命令别名 ${alias} 已存在，将被覆盖`);
      }
      this.commands.set(alias, command);
    });

    // 添加到命令组
    if (!this.commandGroups.has(group)) {
      this.commandGroups.set(group, new Set());
    }
    this.commandGroups.get(group).add(name);
  }

  /**
   * 执行命令
   *
   * @param {string} name - 命令名称
   * @param {Array<string>} args - 命令参数
   * @param {Object} context - 执行上下文
   * @returns {Promise<any>} - 命令执行结果
   */
  async executeCommand(name, args = [], context = {}) {
    const command = this.commands.get(name);

    if (!command) {
      throw new Error(`未找到命令: ${name}`);
    }

    try {
      return await command.handler(args, context);
    } catch (err) {
      console.error(`执行命令 ${name} 出错:`, err);
      throw err;
    }
  }

  /**
   * 获取命令列表
   *
   * @param {string} group - 命令组（可选）
   * @returns {Array<Object>} - 命令列表
   */
  getCommands(group = null) {
    if (group) {
      if (!this.commandGroups.has(group)) {
        return [];
      }

      const groupCommands = [];
      this.commandGroups.get(group).forEach((name) => {
        const command = this.commands.get(name);
        if (command && command.name === name) {
          // 只返回主命令，不返回别名
          groupCommands.push({
            name: command.name,
            description: command.description,
            aliases: command.aliases,
          });
        }
      });

      return groupCommands;
    }

    const uniqueCommands = new Map();
    this.commands.forEach((command) => {
      if (!uniqueCommands.has(command.name)) {
        uniqueCommands.set(command.name, {
          name: command.name,
          description: command.description,
          group: command.group,
          aliases: command.aliases,
        });
      }
    });

    return Array.from(uniqueCommands.values());
  }

  /**
   * 获取命令组列表
   *
   * @returns {Array<string>} - 命令组列表
   */
  getCommandGroups() {
    return Array.from(this.commandGroups.keys());
  }

  /**
   * 加载命令模块
   *
   * @param {string} modulePath - 模块路径
   */
  loadCommandModule(modulePath) {
    try {
      const fullPath = path.isAbsolute(modulePath)
        ? modulePath
        : path.join(this.commandsDir, modulePath);
      const commandModule = require(fullPath);

      if (typeof commandModule.handler === "function") {
        // 如果是新的命令格式，直接注册
        this.registerCommand(
          commandModule.name,
          commandModule.handler,
          commandModule.group || "default",
          commandModule.description || "",
          commandModule.aliases || []
        );
      } else if (typeof commandModule.register === "function") {
        // 兼容旧的注册方式
        commandModule.register(this);
      } else {
        console.warn(`模块 ${modulePath} 没有 handler 或 register 方法`);
      }
    } catch (err) {
      console.error(`加载命令模块 ${modulePath} 出错:`, err);
    }
  }

  /**
   * 加载所有命令模块
   */
  loadAllCommandModules() {
    try {
      const files = fs.readdirSync(this.commandsDir);
      files.forEach((file) => {
        if (file.endsWith(".js") && file !== "index.js") {
          this.loadCommandModule(file);
        }
      });
    } catch (err) {
      console.error("加载命令模块出错:", err);
    }
  }
}

// 导出类而不是实例
module.exports = CommandRegistry;
