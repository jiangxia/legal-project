/**
 * 案件类型基类
 * 定义所有案件类型的通用接口和方法
 */

const path = require("path");
const fs = require("fs");
const aiEngine = require("../../core/ai-engine");
const documentProcessor = require("../../core/document-processor");

class CaseType {
  /**
   * 构造函数
   *
   * @param {string} caseId - 案件ID
   * @param {string} caseName - 案件名称
   * @param {string} caseType - 案件类型（如：民商事、刑事等）
   */
  constructor(caseId, caseName, caseType) {
    this.caseId = caseId;
    this.caseName = caseName;
    this.caseType = caseType;
    this.materials = [];
    this.analysisResults = {};
    this.parties = {
      plaintiffs: [],
      defendants: [],
      thirdParties: [],
    };
    this.timeline = [];

    // 案件目录路径
    this.caseFolderPath = path.join(process.cwd(), "案例", `案件：${caseName}`);

    // 数据目录路径（兼容旧版本）
    this.caseDataDir = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "cases",
      caseId
    );

    // 确保案件数据目录存在
    if (!fs.existsSync(this.caseDataDir)) {
      fs.mkdirSync(this.caseDataDir, { recursive: true });
    }

    // 加载案件数据
    this.loadCaseData();
  }

  /**
   * 添加案件材料
   *
   * @param {string} materialName - 材料名称
   * @param {string} materialContent - 材料内容
   * @param {string} materialType - 材料类型（证据、诉讼文书、法律法规、其他材料）
   * @returns {boolean} - 是否添加成功
   */
  addMaterial(materialName, materialContent, materialType = "其他材料") {
    try {
      const materialId = Date.now().toString();
      const materialObj = {
        id: materialId,
        name: materialName,
        content: materialContent,
        type: materialType,
        createdAt: new Date().toISOString(),
      };

      // 添加到材料列表
      this.materials.push(materialObj);

      // 确定保存路径
      let materialDir;

      // 新版目录结构
      if (fs.existsSync(this.caseFolderPath)) {
        // 根据材料类型确定保存目录
        const validTypes = ["证据", "诉讼文书", "法律法规", "其他材料"];
        const typePath = validTypes.includes(materialType)
          ? materialType
          : "其他材料";
        materialDir = path.join(this.caseFolderPath, "材料", typePath);

        // 确保目录存在
        if (!fs.existsSync(materialDir)) {
          fs.mkdirSync(materialDir, { recursive: true });
        }

        // 保存材料内容到文本文件
        const txtFileName = `${materialName.replace(
          /[\/\\:*?"<>|]/g,
          "_"
        )}.txt`;
        fs.writeFileSync(
          path.join(materialDir, txtFileName),
          materialContent,
          "utf8"
        );

        // 更新时间线
        this.addTimelineEvent(
          `添加材料：${materialName}`,
          `添加了${materialType}：${materialName}`
        );
      }

      // 同时保存到旧版数据目录（兼容性）
      const materialPath = path.join(
        this.caseDataDir,
        "materials",
        `${materialId}.json`
      );

      // 确保目录存在
      const materialDirOld = path.dirname(materialPath);
      if (!fs.existsSync(materialDirOld)) {
        fs.mkdirSync(materialDirOld, { recursive: true });
      }

      documentProcessor.saveToFile(materialPath, materialObj, true);

      // 更新案件信息
      this._updateCaseInfo();

      return true;
    } catch (err) {
      console.error(`添加案件材料出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 获取所有案件材料
   *
   * @param {string} materialType - 可选的材料类型过滤
   * @returns {Array} - 材料列表
   */
  getMaterials(materialType = null) {
    if (materialType) {
      return this.materials.filter((m) => m.type === materialType);
    }
    return this.materials;
  }

  /**
   * 获取案件信息
   *
   * @returns {Object} - 案件信息
   */
  getCaseInfo() {
    try {
      // 首先尝试从新版目录结构获取
      const newInfoPath = path.join(this.caseFolderPath, "案件信息.json");

      if (fs.existsSync(newInfoPath)) {
        return JSON.parse(fs.readFileSync(newInfoPath, "utf-8"));
      }

      // 然后尝试从旧版数据目录获取
      const infoPath = path.join(this.caseDataDir, "case-info.json");

      if (fs.existsSync(infoPath)) {
        return JSON.parse(fs.readFileSync(infoPath, "utf-8"));
      } else {
        const defaultInfo = {
          caseId: this.caseId,
          caseName: this.caseName,
          caseType: this.caseType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parties: {
            plaintiffs: [],
            defendants: [],
            thirdParties: [],
          },
          materials: [],
          analyses: [],
          timeline: [],
          status: "进行中",
          materialCount: 0,
          analysisCount: 0,
        };

        documentProcessor.saveToFile(infoPath, defaultInfo, true);
        return defaultInfo;
      }
    } catch (err) {
      console.error(`获取案件信息出错: ${err.message}`);
      return {
        caseId: this.caseId,
        caseName: this.caseName,
        caseType: this.caseType,
        error: err.message,
      };
    }
  }

  /**
   * 更新案件信息
   *
   * @private
   */
  _updateCaseInfo() {
    try {
      const info = this.getCaseInfo();

      const updatedInfo = {
        ...info,
        updatedAt: new Date().toISOString(),
        materialCount: this.materials.length,
        analysisCount: Object.keys(this.analysisResults).length,
        parties: this.parties,
        timeline: this.timeline,
      };

      // 保存到新版目录
      if (fs.existsSync(this.caseFolderPath)) {
        const newInfoPath = path.join(this.caseFolderPath, "案件信息.json");
        documentProcessor.saveToFile(newInfoPath, updatedInfo, true);
      }

      // 同时保存到旧版目录（兼容性）
      const infoPath = path.join(this.caseDataDir, "case-info.json");
      documentProcessor.saveToFile(infoPath, updatedInfo, true);
    } catch (err) {
      console.error(`更新案件信息出错: ${err.message}`);
    }
  }

  /**
   * 分析案件
   * 该方法需要被子类重写
   *
   * @param {string} analysisType - 分析类型
   * @returns {Promise<string>} - 分析结果
   */
  async analyzeCase(analysisType) {
    throw new Error("analyzeCase方法必须由子类实现");
  }

  /**
   * 保存分析结果
   *
   * @param {string} analysisType - 分析类型
   * @param {string} result - 分析结果
   * @returns {boolean} - 是否保存成功
   */
  saveAnalysisResult(analysisType, result) {
    try {
      // 添加到分析结果
      this.analysisResults[analysisType] = {
        type: analysisType,
        result: result,
        createdAt: new Date().toISOString(),
      };

      // 保存到新版目录
      if (fs.existsSync(this.caseFolderPath)) {
        // 根据分析类型确定保存目录
        let analysisSubDir = "其他分析";
        if (
          analysisType === "dispute-focus" ||
          analysisType.includes("争议焦点")
        ) {
          analysisSubDir = "争议焦点";
        } else if (
          analysisType === "litigation-strategy" ||
          analysisType.includes("诉讼策略")
        ) {
          analysisSubDir = "诉讼策略";
        } else if (analysisType.includes("风险")) {
          analysisSubDir = "风险评估";
        } else if (analysisType.includes("意见")) {
          analysisSubDir = "法律意见";
        }

        const analysisDir = path.join(
          this.caseFolderPath,
          "分析",
          analysisSubDir
        );
        if (!fs.existsSync(analysisDir)) {
          fs.mkdirSync(analysisDir, { recursive: true });
        }

        // 保存为Markdown文件
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const mdFilePath = path.join(
          analysisDir,
          `${analysisType}-${timestamp}.md`
        );
        fs.writeFileSync(mdFilePath, result, "utf-8");

        // 更新时间线
        this.addTimelineEvent(
          `分析：${analysisType}`,
          `完成了案件${analysisType}分析`
        );
      }

      // 同时保存到旧版目录（兼容性）
      const resultPath = path.join(
        this.caseDataDir,
        "analysis",
        `${analysisType}.json`
      );
      const resultDir = path.dirname(resultPath);

      if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir, { recursive: true });
      }

      fs.writeFileSync(
        resultPath,
        JSON.stringify(this.analysisResults[analysisType], null, 2),
        "utf-8"
      );

      // 更新案件信息
      this._updateCaseInfo();

      return true;
    } catch (err) {
      console.error(`保存分析结果出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 获取分析结果
   *
   * @param {string} analysisType - 分析类型
   * @returns {string|null} - 分析结果
   */
  getAnalysisResult(analysisType) {
    if (this.analysisResults[analysisType]) {
      return this.analysisResults[analysisType].result;
    }

    try {
      // 首先尝试从新版目录获取
      if (fs.existsSync(this.caseFolderPath)) {
        const analysisDir = path.join(this.caseFolderPath, "分析");
        if (fs.existsSync(analysisDir)) {
          // 遍历所有子目录
          const subDirs = ["争议焦点", "诉讼策略", "风险评估", "法律意见"];
          for (const subDir of subDirs) {
            const subDirPath = path.join(analysisDir, subDir);
            if (fs.existsSync(subDirPath)) {
              const files = fs.readdirSync(subDirPath);
              // 查找匹配的分析文件
              const matchingFile = files.find((file) =>
                file.startsWith(analysisType)
              );
              if (matchingFile) {
                const filePath = path.join(subDirPath, matchingFile);
                const content = fs.readFileSync(filePath, "utf-8");
                this.analysisResults[analysisType] = {
                  type: analysisType,
                  result: content,
                  createdAt: new Date().toISOString(),
                };
                return content;
              }
            }
          }
        }
      }

      // 然后尝试从旧版目录获取
      const resultPath = path.join(
        this.caseDataDir,
        "analysis",
        `${analysisType}.json`
      );

      if (fs.existsSync(resultPath)) {
        const resultData = JSON.parse(fs.readFileSync(resultPath, "utf-8"));
        this.analysisResults[analysisType] = resultData;
        return resultData.result;
      }
    } catch (err) {
      console.error(`获取分析结果出错: ${err.message}`);
    }

    return null;
  }

  /**
   * 获取所有分析结果
   *
   * @returns {Object} - 所有分析结果
   */
  getAllAnalysisResults() {
    try {
      // 首先尝试从新版目录获取
      if (fs.existsSync(this.caseFolderPath)) {
        const analysisDir = path.join(this.caseFolderPath, "分析");
        if (fs.existsSync(analysisDir)) {
          // 遍历所有子目录
          const subDirs = ["争议焦点", "诉讼策略", "风险评估", "法律意见"];
          for (const subDir of subDirs) {
            const subDirPath = path.join(analysisDir, subDir);
            if (fs.existsSync(subDirPath)) {
              const files = fs.readdirSync(subDirPath);
              // 处理每个分析文件
              files.forEach((file) => {
                if (file.endsWith(".md")) {
                  const analysisType = file.split("-")[0];
                  this.getAnalysisResult(analysisType);
                }
              });
            }
          }
        }
      }

      // 然后尝试从旧版目录获取
      const analysisDir = path.join(this.caseDataDir, "analysis");

      if (fs.existsSync(analysisDir)) {
        const files = fs.readdirSync(analysisDir);

        files.forEach((file) => {
          if (file.endsWith(".json")) {
            const analysisType = file.replace(".json", "");
            this.getAnalysisResult(analysisType);
          }
        });
      }

      return this.analysisResults;
    } catch (err) {
      console.error(`获取所有分析结果出错: ${err.message}`);
      return this.analysisResults;
    }
  }

  /**
   * 加载案件数据
   *
   * @returns {boolean} - 是否加载成功
   */
  loadCaseData() {
    try {
      // 加载案件信息
      const caseInfo = this.getCaseInfo();

      // 如果案件信息中有当事人和时间线数据，则加载
      if (caseInfo.parties) {
        this.parties = caseInfo.parties;
      }

      if (caseInfo.timeline) {
        this.timeline = caseInfo.timeline;
      }

      // 加载材料（优先从新版目录加载）
      this.materials = [];

      // 从新版目录加载
      if (fs.existsSync(this.caseFolderPath)) {
        const materialsDir = path.join(this.caseFolderPath, "材料");
        if (fs.existsSync(materialsDir)) {
          const materialTypes = ["证据", "诉讼文书", "法律法规", "其他材料"];

          for (const type of materialTypes) {
            const typeDir = path.join(materialsDir, type);
            if (fs.existsSync(typeDir)) {
              const files = fs.readdirSync(typeDir);

              files.forEach((file) => {
                if (file.endsWith(".txt")) {
                  const filePath = path.join(typeDir, file);
                  const content = fs.readFileSync(filePath, "utf-8");
                  const name = file.replace(/\.txt$/, "").replace(/_/g, " ");

                  this.materials.push({
                    id: Date.now() + Math.random().toString().substring(2, 8),
                    name: name,
                    content: content,
                    type: type,
                    createdAt: fs.statSync(filePath).birthtime.toISOString(),
                  });
                }
              });
            }
          }
        }
      }

      // 如果新版目录没有材料，则从旧版目录加载
      if (this.materials.length === 0) {
        const materialsDir = path.join(this.caseDataDir, "materials");

        if (fs.existsSync(materialsDir)) {
          const files = fs.readdirSync(materialsDir);

          this.materials = files
            .filter((file) => file.endsWith(".json"))
            .map((file) => {
              const filePath = path.join(materialsDir, file);
              return JSON.parse(fs.readFileSync(filePath, "utf-8"));
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
      }

      // 加载分析结果
      this.getAllAnalysisResults();

      return true;
    } catch (err) {
      console.error(`加载案件数据出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 获取案件类型特定的分析类型列表
   * 该方法需要被子类重写
   *
   * @returns {Array<string>} - 分析类型列表
   */
  getAnalysisTypes() {
    return ["基本分析"];
  }

  /**
   * 获取案件类型名称
   *
   * @returns {string} - 案件类型名称
   */
  getCaseTypeName() {
    return this.caseType;
  }

  /**
   * 添加当事人
   *
   * @param {string} name - 当事人姓名
   * @param {string} role - 当事人角色（原告、被告、第三人、被告人、被害人、证人等）
   * @param {Object} info - 当事人信息
   * @returns {boolean} - 是否添加成功
   */
  addParty(name, role, info = {}) {
    try {
      const party = {
        id: Date.now().toString(),
        name: name,
        role: role,
        info: info,
        createdAt: new Date().toISOString(),
      };

      // 根据角色添加到对应列表
      if (role === "原告" || role === "被害人") {
        this.parties.plaintiffs.push(party);
      } else if (role === "被告" || role === "被告人") {
        this.parties.defendants.push(party);
      } else {
        this.parties.thirdParties.push(party);
      }

      // 保存当事人信息到文件
      if (fs.existsSync(this.caseFolderPath)) {
        const partyDir = path.join(this.caseFolderPath, "当事人", role);
        if (!fs.existsSync(partyDir)) {
          fs.mkdirSync(partyDir, { recursive: true });
        }

        const partyFile = path.join(
          partyDir,
          `${name.replace(/[\/\\:*?"<>|]/g, "_")}.json`
        );
        fs.writeFileSync(partyFile, JSON.stringify(party, null, 2), "utf-8");
      }

      // 更新时间线
      this.addTimelineEvent(`添加当事人：${name}`, `添加了${role}：${name}`);

      // 更新案件信息
      this._updateCaseInfo();

      return true;
    } catch (err) {
      console.error(`添加当事人出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 添加时间线事件
   *
   * @param {string} title - 事件标题
   * @param {string} description - 事件描述
   * @param {Date} eventDate - 事件日期，默认为当前时间
   * @returns {boolean} - 是否添加成功
   */
  addTimelineEvent(title, description, eventDate = new Date()) {
    try {
      const event = {
        id: Date.now().toString(),
        title: title,
        description: description,
        date: eventDate.toISOString(),
        createdAt: new Date().toISOString(),
      };

      // 添加到时间线
      this.timeline.push(event);

      // 保存到文件
      if (fs.existsSync(this.caseFolderPath)) {
        const timelineDir = path.join(this.caseFolderPath, "时间线");
        if (!fs.existsSync(timelineDir)) {
          fs.mkdirSync(timelineDir, { recursive: true });
        }

        // 保存所有时间线事件
        const timelineFile = path.join(timelineDir, "时间线.json");
        fs.writeFileSync(
          timelineFile,
          JSON.stringify(this.timeline, null, 2),
          "utf-8"
        );

        // 生成时间线Markdown文件
        const timelineMd = this._generateTimelineMd();
        fs.writeFileSync(
          path.join(timelineDir, "时间线.md"),
          timelineMd,
          "utf-8"
        );
      }

      // 更新案件信息
      this._updateCaseInfo();

      return true;
    } catch (err) {
      console.error(`添加时间线事件出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 生成时间线Markdown
   *
   * @private
   * @returns {string} - 时间线Markdown内容
   */
  _generateTimelineMd() {
    // 按日期排序
    const sortedEvents = [...this.timeline].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let md = `# ${this.caseName} 案件时间线\n\n`;

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
}

module.exports = CaseType;
