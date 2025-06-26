/**
 * 文档处理器
 * 处理各种格式的文档，包括文本提取、格式转换等
 */

const fs = require("fs");
const path = require("path");

class DocumentProcessor {
  /**
   * 从文本文件中提取内容
   *
   * @param {string} filePath - 文件路径
   * @returns {string} - 文件内容
   */
  extractTextFromFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, "utf-8");
      return content;
    } catch (err) {
      console.error(`读取文件出错: ${err.message}`);
      return null;
    }
  }

  /**
   * 从文本中提取关键信息
   *
   * @param {string} text - 文本内容
   * @param {Array<string>} keywords - 关键词列表
   * @returns {Object} - 提取的关键信息
   */
  extractKeyInformation(text, keywords) {
    const result = {};

    keywords.forEach((keyword) => {
      // 简单的关键词匹配，实际应用中可以使用更复杂的正则表达式或NLP技术
      const regex = new RegExp(`${keyword}[：:](.*?)(?=\\n|$)`, "g");
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        result[keyword] = matches.map((match) => {
          return match.replace(new RegExp(`${keyword}[：:]\\s*`), "").trim();
        });
      } else {
        result[keyword] = [];
      }
    });

    return result;
  }

  /**
   * 将文本分段
   *
   * @param {string} text - 文本内容
   * @param {string} separator - 分隔符
   * @returns {Array<string>} - 分段后的文本数组
   */
  splitTextIntoSegments(text, separator = "\n\n") {
    return text
      .split(separator)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
  }

  /**
   * 将文本转换为结构化数据
   *
   * @param {string} text - 文本内容
   * @param {Object} schema - 数据结构模式
   * @returns {Object} - 结构化数据
   */
  textToStructuredData(text, schema) {
    const result = {};

    // 遍历schema中的每个字段
    Object.keys(schema).forEach((field) => {
      const fieldInfo = schema[field];
      const regex = new RegExp(fieldInfo.pattern, fieldInfo.flags || "g");
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        if (fieldInfo.multiple) {
          result[field] = matches.map((match) => {
            return fieldInfo.transform ? fieldInfo.transform(match) : match;
          });
        } else {
          result[field] = fieldInfo.transform
            ? fieldInfo.transform(matches[0])
            : matches[0];
        }
      } else {
        result[field] = fieldInfo.multiple ? [] : null;
      }
    });

    return result;
  }

  /**
   * 保存处理结果到文件
   *
   * @param {string} filePath - 文件路径
   * @param {string|Object} content - 要保存的内容
   * @param {boolean} isJson - 是否为JSON格式
   * @returns {boolean} - 是否保存成功
   */
  saveToFile(filePath, content, isJson = false) {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 保存内容
      const dataToSave = isJson ? JSON.stringify(content, null, 2) : content;
      fs.writeFileSync(filePath, dataToSave, "utf-8");

      console.log(`文件已保存: ${filePath}`);
      return true;
    } catch (err) {
      console.error(`保存文件出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 合并多个文档
   *
   * @param {Array<string>} filePaths - 文件路径数组
   * @param {string} outputPath - 输出文件路径
   * @returns {boolean} - 是否合并成功
   */
  mergeDocuments(filePaths, outputPath) {
    try {
      const contents = filePaths
        .map((filePath) => {
          const content = this.extractTextFromFile(filePath);
          return content
            ? `--- 来源: ${path.basename(filePath)} ---\n\n${content}`
            : "";
        })
        .filter((content) => content.length > 0);

      if (contents.length === 0) {
        throw new Error("没有有效的文档内容可合并");
      }

      const mergedContent = contents.join("\n\n" + "-".repeat(50) + "\n\n");
      return this.saveToFile(outputPath, mergedContent);
    } catch (err) {
      console.error(`合并文档出错: ${err.message}`);
      return false;
    }
  }
}

module.exports = new DocumentProcessor();
