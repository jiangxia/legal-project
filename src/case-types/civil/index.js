/**
 * 民商事案件类
 * 处理民商事案件的特定逻辑
 */

const CaseType = require("../base/case-type");
const MaterialManager = require("../base/material-manager");
const AIEngine = require("../../core/ai-engine");

// 创建AI引擎实例
const aiEngine = new AIEngine();

class CivilCase extends CaseType {
  /**
   * 构造函数
   *
   * @param {string} caseId - 案件ID
   * @param {string} caseName - 案件名称
   */
  constructor(caseId, caseName) {
    super(caseId, caseName, "民商事");
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
        `开始分析民商事案件: ${this.caseName}, 分析类型: ${analysisType}`
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
        case "dispute-focus":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "民商事",
            "dispute-focus"
          );
          break;

        case "litigation-strategy":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "民商事",
            "litigation-strategy"
          );
          break;

        case "evidence-analysis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "民商事",
            "evidence-analysis"
          );
          break;

        case "legal-basis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "民商事",
            "legal-basis"
          );
          break;

        default:
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "民商事",
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
   * 获取民商事案件特定的分析类型列表
   *
   * @returns {Array<string>} - 分析类型列表
   */
  getAnalysisTypes() {
    return [
      "dispute-focus", // 争议焦点
      "litigation-strategy", // 诉讼策略
      "evidence-analysis", // 证据分析
      "legal-basis", // 法律依据
      "basic-analysis", // 基本分析
    ];
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
   * 添加诉讼文书
   *
   * @param {string} documentName - 文书名称
   * @param {string} documentContent - 文书内容
   * @returns {Object|null} - 添加的文书对象或null
   */
  addLegalDocument(documentName, documentContent) {
    return this.materialManager.addMaterial(
      documentName,
      documentContent,
      "诉讼文书"
    );
  }

  /**
   * 生成起诉状
   *
   * @returns {Promise<string>} - 起诉状内容
   */
  async generateComplaint() {
    try {
      // 获取争议焦点分析结果
      let disputeFocus = this.getAnalysisResult("dispute-focus");

      // 如果没有争议焦点分析结果，先进行分析
      if (!disputeFocus) {
        disputeFocus = await this.analyzeCase("dispute-focus");
      }

      // 获取法律依据分析结果
      let legalBasis = this.getAnalysisResult("legal-basis");

      // 如果没有法律依据分析结果，先进行分析
      if (!legalBasis) {
        legalBasis = await this.analyzeCase("legal-basis");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成起诉状
      const complaint = await aiEngine.analyze(
        this.caseName,
        [...materials, disputeFocus, legalBasis],
        "民商事",
        "generate-complaint"
      );

      // 保存起诉状
      this.materialManager.addMaterial("起诉状", complaint, "诉讼文书");

      return complaint;
    } catch (err) {
      console.error(`生成起诉状出错: ${err.message}`);
      throw err;
    }
  }

  /**
   * 生成答辩状
   *
   * @returns {Promise<string>} - 答辩状内容
   */
  async generateDefense() {
    try {
      // 获取争议焦点分析结果
      let disputeFocus = this.getAnalysisResult("dispute-focus");

      // 如果没有争议焦点分析结果，先进行分析
      if (!disputeFocus) {
        disputeFocus = await this.analyzeCase("dispute-focus");
      }

      // 获取法律依据分析结果
      let legalBasis = this.getAnalysisResult("legal-basis");

      // 如果没有法律依据分析结果，先进行分析
      if (!legalBasis) {
        legalBasis = await this.analyzeCase("legal-basis");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成答辩状
      const defense = await aiEngine.analyze(
        this.caseName,
        [...materials, disputeFocus, legalBasis],
        "民商事",
        "generate-defense"
      );

      // 保存答辩状
      this.materialManager.addMaterial("答辩状", defense, "诉讼文书");

      return defense;
    } catch (err) {
      console.error(`生成答辩状出错: ${err.message}`);
      throw err;
    }
  }
}

module.exports = CivilCase;
