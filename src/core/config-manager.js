/**
 * 配置管理器
 * 负责加载、保存和管理系统配置
 */

const fs = require("fs");
const path = require("path");

class ConfigManager {
  constructor() {
    this.configDir = path.join(__dirname, "..", "config");
    this.configCache = {};

    // 确保配置目录存在
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * 加载配置文件
   *
   * @param {string} configName - 配置名称
   * @returns {Object} - 配置对象
   */
  loadConfig(configName) {
    try {
      // 如果缓存中有配置，则直接返回
      if (this.configCache[configName]) {
        return this.configCache[configName];
      }

      const configPath = path.join(this.configDir, `${configName}.json`);

      // 检查配置文件是否存在
      if (!fs.existsSync(configPath)) {
        console.log(`配置文件不存在: ${configName}，将创建默认配置`);
        return this._createDefaultConfig(configName);
      }

      // 读取配置文件
      const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      // 缓存配置
      this.configCache[configName] = configData;

      return configData;
    } catch (err) {
      console.error(`加载配置出错: ${err.message}`);
      return this._createDefaultConfig(configName);
    }
  }

  /**
   * 保存配置
   *
   * @param {string} configName - 配置名称
   * @param {Object} configData - 配置数据
   * @returns {boolean} - 是否保存成功
   */
  saveConfig(configName, configData) {
    try {
      const configPath = path.join(this.configDir, `${configName}.json`);

      // 保存配置文件
      fs.writeFileSync(
        configPath,
        JSON.stringify(configData, null, 2),
        "utf-8"
      );

      // 更新缓存
      this.configCache[configName] = configData;

      console.log(`配置已保存: ${configName}`);
      return true;
    } catch (err) {
      console.error(`保存配置出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 更新配置
   *
   * @param {string} configName - 配置名称
   * @param {Object} updates - 要更新的配置项
   * @returns {boolean} - 是否更新成功
   */
  updateConfig(configName, updates) {
    try {
      // 加载现有配置
      const currentConfig = this.loadConfig(configName);

      // 合并更新
      const updatedConfig = { ...currentConfig, ...updates };

      // 保存更新后的配置
      return this.saveConfig(configName, updatedConfig);
    } catch (err) {
      console.error(`更新配置出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 创建默认配置
   *
   * @private
   * @param {string} configName - 配置名称
   * @returns {Object} - 默认配置对象
   */
  _createDefaultConfig(configName) {
    let defaultConfig = {};

    // 根据不同的配置名称创建不同的默认配置
    switch (configName) {
      case "system":
        defaultConfig = {
          version: "1.0.0",
          dataDir: path.join(__dirname, "..", "data"),
          tempDir: path.join(__dirname, "..", "temp"),
          logLevel: "info",
          maxCaseHistorySize: 100,
          supportedCaseTypes: ["民商事", "刑事", "行政", "非诉"],
        };
        break;

      case "ai":
        defaultConfig = {
          provider: "openai",
          model: "gpt-4",
          apiKey: "",
          temperature: 0.3,
          maxTokens: 4000,
          timeout: 60000,
        };
        break;

      case "prompt":
        defaultConfig = {
          basePath: path.join(__dirname, "..", "工程组件", "提示词"),
          defaultCategory: "通用",
        };
        break;

      default:
        defaultConfig = {};
        break;
    }

    // 保存默认配置
    this.saveConfig(configName, defaultConfig);

    return defaultConfig;
  }

  /**
   * 获取所有可用的配置
   *
   * @returns {Array<string>} - 配置名称列表
   */
  getAllConfigs() {
    try {
      const files = fs.readdirSync(this.configDir);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""));
    } catch (err) {
      console.error(`获取配置列表出错: ${err.message}`);
      return [];
    }
  }

  /**
   * 删除配置
   *
   * @param {string} configName - 配置名称
   * @returns {boolean} - 是否删除成功
   */
  deleteConfig(configName) {
    try {
      const configPath = path.join(this.configDir, `${configName}.json`);

      // 检查配置文件是否存在
      if (!fs.existsSync(configPath)) {
        console.log(`配置文件不存在: ${configName}`);
        return false;
      }

      // 删除配置文件
      fs.unlinkSync(configPath);

      // 从缓存中删除
      delete this.configCache[configName];

      console.log(`配置已删除: ${configName}`);
      return true;
    } catch (err) {
      console.error(`删除配置出错: ${err.message}`);
      return false;
    }
  }
}

// 导出类而不是实例
module.exports = ConfigManager;
