/**
 * 行政案件类
 * 处理行政案件的特定逻辑
 */

const CaseType = require("../base/case-type");
const MaterialManager = require("../base/material-manager");
const AIEngine = require("../../core/ai-engine");

// 创建AI引擎实例
const aiEngine = new AIEngine();

class AdministrativeCase extends CaseType {
  /**
   * 构造函数
   *
   * @param {string} caseId - 案件ID
   * @param {string} caseName - 案件名称
   */
  constructor(caseId, caseName) {
    super(caseId, caseName, "行政");
    this.materialManager = new MaterialManager(caseId);
  }

  /**
   * 分析案件
   *
   * @param {string} analysisType - 分析类型
   * @returns {Promise<string>} - 分析结果
   */
  async analyzeCase(analysisType) {
    try {
      console.log(
        `开始分析行政案件: ${this.caseName}, 分析类型: ${analysisType}`
      );

      // 检查是否已有分析结果
      const existingResult = this.getAnalysisResult(analysisType);
      if (existingResult) {
        console.log(`已存在分析结果: ${analysisType}`);
        return existingResult;
      }

      // 获取所有材料内容
      const materials = this.materialManager.getAllMaterialContents();

      if (materials.length === 0) {
        throw new Error("没有可分析的材料");
      }

      // 根据分析类型调用不同的分析方法
      let result;

      switch (analysisType) {
        case "administrative-act-analysis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "行政",
            "administrative-act-analysis"
          );
          break;

        case "litigation-strategy":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "行政",
            "litigation-strategy"
          );
          break;

        case "legal-basis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "行政",
            "legal-basis"
          );
          break;

        case "procedure-review":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "行政",
            "procedure-review"
          );
          break;

        default:
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "行政",
            "basic-analysis"
          );
          break;
      }

      // 保存分析结果
      this.saveAnalysisResult(analysisType, result);

      return result;
    } catch (err) {
      console.error(`分析案件出错: ${err.message}`);
      throw err;
    }
  }

  /**
   * 获取行政案件特定的分析类型列表
   *
   * @returns {Array<string>} - 分析类型列表
   */
  getAnalysisTypes() {
    return [
      "administrative-act-analysis", // 行政行为分析
      "litigation-strategy", // 诉讼策略
      "legal-basis", // 法律依据
      "procedure-review", // 程序审查
      "basic-analysis", // 基本分析
    ];
  }

  /**
   * 添加行政决定材料
   *
   * @param {string} documentName - 文书名称
   * @param {string} documentContent - 文书内容
   * @returns {Object|null} - 添加的文书对象或null
   */
  addAdministrativeDecision(documentName, documentContent) {
    return this.materialManager.addMaterial(
      documentName,
      documentContent,
      "行政决定"
    );
  }

  /**
   * 添加证据材料
   *
   * @param {string} evidenceName - 证据名称
   * @param {string} evidenceContent - 证据内容
   * @returns {Object|null} - 添加的证据对象或null
   */
  addEvidence(evidenceName, evidenceContent) {
    return this.materialManager.addMaterial(
      evidenceName,
      evidenceContent,
      "证据"
    );
  }

  /**
   * 分析行政行为
   *
   * @returns {Promise<Object>} - 行政行为分析结果
   */
  async analyzeAdministrativeAct() {
    try {
      // 获取行政行为分析结果
      let actAnalysis = this.getAnalysisResult("administrative-act-analysis");

      // 如果没有行政行为分析结果，先进行分析
      if (!actAnalysis) {
        actAnalysis = await this.analyzeCase("administrative-act-analysis");
      }

      // 提取行政行为信息
      const actInfo = this._extractAdministrativeActInfo(actAnalysis);

      return actInfo;
    } catch (err) {
      console.error(`分析行政行为出错: ${err.message}`);
      throw err;
    }
  }

  /**
   * 提取行政行为信息
   *
   * @private
   * @param {string} actAnalysis - 行政行为分析结果
   * @returns {Object} - 提取的行政行为信息
   */
  _extractAdministrativeActInfo(actAnalysis) {
    try {
      // 提取行政行为类型
      const actTypeRegex =
        /行政行为类型[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const actTypeSection = actAnalysis.match(actTypeRegex);
      const actType =
        actTypeSection && actTypeSection[1]
          ? actTypeSection[1].trim()
          : "未明确";

      // 提取行政主体
      const subjectRegex = /行政主体[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const subjectSection = actAnalysis.match(subjectRegex);
      const subject =
        subjectSection && subjectSection[1]
          ? subjectSection[1].trim()
          : "未明确";

      // 提取程序合法性评估
      const procedureRegex =
        /程序[^：:]*合法性[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const procedureSection = actAnalysis.match(procedureRegex);
      let procedureLegality = [];

      if (procedureSection && procedureSection[1]) {
        procedureLegality = procedureSection[1]
          .split(/\n+/)
          .filter(
            (line) => line.trim().startsWith("-") || /^\d+\./.test(line.trim())
          )
          .map((line) => {
            // 移除前面的 "-" 或 "数字."
            return line.trim().replace(/^-\s*|^\d+\.\s*/, "");
          });
      }

      // 提取实体合法性评估
      const substantiveRegex =
        /实体[^：:]*合法性[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const substantiveSection = actAnalysis.match(substantiveRegex);
      let substantiveLegality = [];

      if (substantiveSection && substantiveSection[1]) {
        substantiveLegality = substantiveSection[1]
          .split(/\n+/)
          .filter(
            (line) => line.trim().startsWith("-") || /^\d+\./.test(line.trim())
          )
          .map((line) => {
            // 移除前面的 "-" 或 "数字."
            return line.trim().replace(/^-\s*|^\d+\.\s*/, "");
          });
      }

      return {
        actType,
        subject,
        procedureLegality,
        substantiveLegality,
      };
    } catch (err) {
      console.error(`提取行政行为信息出错: ${err.message}`);
      return {
        actType: "提取出错",
        subject: "提取出错",
        procedureLegality: [],
        substantiveLegality: [],
      };
    }
  }

  /**
   * 生成行政起诉状
   *
   * @returns {Promise<string>} - 行政起诉状内容
   */
  async generateAdministrativeComplaint() {
    try {
      // 获取行政行为分析结果
      let actAnalysis = this.getAnalysisResult("administrative-act-analysis");

      // 如果没有行政行为分析结果，先进行分析
      if (!actAnalysis) {
        actAnalysis = await this.analyzeCase("administrative-act-analysis");
      }

      // 获取法律依据分析结果
      let legalBasis = this.getAnalysisResult("legal-basis");

      // 如果没有法律依据分析结果，先进行分析
      if (!legalBasis) {
        legalBasis = await this.analyzeCase("legal-basis");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成行政起诉状
      const complaint = await aiEngine.analyze(
        this.caseName,
        [...materials, actAnalysis, legalBasis],
        "行政",
        "generate-administrative-complaint"
      );

      // 保存行政起诉状
      this.materialManager.addMaterial("行政起诉状", complaint, "诉讼文书");

      return complaint;
    } catch (err) {
      console.error(`生成行政起诉状出错: ${err.message}`);
      throw err;
    }
  }

  /**
   * 生成行政答辩状
   *
   * @returns {Promise<string>} - 行政答辩状内容
   */
  async generateAdministrativeDefense() {
    try {
      // 获取行政行为分析结果
      let actAnalysis = this.getAnalysisResult("administrative-act-analysis");

      // 如果没有行政行为分析结果，先进行分析
      if (!actAnalysis) {
        actAnalysis = await this.analyzeCase("administrative-act-analysis");
      }

      // 获取法律依据分析结果
      let legalBasis = this.getAnalysisResult("legal-basis");

      // 如果没有法律依据分析结果，先进行分析
      if (!legalBasis) {
        legalBasis = await this.analyzeCase("legal-basis");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成行政答辩状
      const defense = await aiEngine.analyze(
        this.caseName,
        [...materials, actAnalysis, legalBasis],
        "行政",
        "generate-administrative-defense"
      );

      // 保存行政答辩状
      this.materialManager.addMaterial("行政答辩状", defense, "诉讼文书");

      return defense;
    } catch (err) {
      console.error(`生成行政答辩状出错: ${err.message}`);
      throw err;
    }
  }
}

module.exports = AdministrativeCase;
