/**
 * 非诉案件类
 * 处理非诉讼业务的特定逻辑
 */

const CaseType = require("../base/case-type");
const MaterialManager = require("../base/material-manager");
const AIEngine = require("../../core/ai-engine");

// 创建AI引擎实例
const aiEngine = new AIEngine();

class NonLitigationCase extends CaseType {
  /**
   * 构造函数
   *
   * @param {string} caseId - 案件ID
   * @param {string} caseName - 案件名称
   * @param {string} businessType - 业务类型（如：合同审查、法律咨询等）
   */
  constructor(caseId, caseName, businessType = "一般非诉") {
    super(caseId, caseName, "非诉");
    this.businessType = businessType;
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
        `开始分析非诉案件: ${this.caseName}, 分析类型: ${analysisType}`
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
        case "contract-review":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "非诉",
            "contract-review"
          );
          break;

        case "legal-consultation":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "非诉",
            "legal-consultation"
          );
          break;

        case "risk-assessment":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "非诉",
            "risk-assessment"
          );
          break;

        case "compliance-analysis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "非诉",
            "compliance-analysis"
          );
          break;

        default:
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "非诉",
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
   * 获取非诉案件特定的分析类型列表
   *
   * @returns {Array<string>} - 分析类型列表
   */
  getAnalysisTypes() {
    // 根据业务类型返回不同的分析类型列表
    const baseTypes = ["basic-analysis"];

    switch (this.businessType) {
      case "合同审查":
        return [
          "contract-review", // 合同审查
          "risk-assessment", // 风险评估
          ...baseTypes,
        ];

      case "法律咨询":
        return [
          "legal-consultation", // 法律咨询
          ...baseTypes,
        ];

      case "合规审查":
        return [
          "compliance-analysis", // 合规分析
          "risk-assessment", // 风险评估
          ...baseTypes,
        ];

      default:
        return [
          "contract-review", // 合同审查
          "legal-consultation", // 法律咨询
          "risk-assessment", // 风险评估
          "compliance-analysis", // 合规分析
          ...baseTypes,
        ];
    }
  }

  /**
   * 添加合同材料
   *
   * @param {string} contractName - 合同名称
   * @param {string} contractContent - 合同内容
   * @returns {Object|null} - 添加的合同对象或null
   */
  addContract(contractName, contractContent) {
    return this.materialManager.addMaterial(
      contractName,
      contractContent,
      "合同"
    );
  }

  /**
   * 添加咨询问题
   *
   * @param {string} questionTitle - 问题标题
   * @param {string} questionContent - 问题内容
   * @returns {Object|null} - 添加的问题对象或null
   */
  addConsultationQuestion(questionTitle, questionContent) {
    return this.materialManager.addMaterial(
      questionTitle,
      questionContent,
      "咨询问题"
    );
  }

  /**
   * 添加背景材料
   *
   * @param {string} materialName - 材料名称
   * @param {string} materialContent - 材料内容
   * @returns {Object|null} - 添加的材料对象或null
   */
  addBackgroundMaterial(materialName, materialContent) {
    return this.materialManager.addMaterial(
      materialName,
      materialContent,
      "背景材料"
    );
  }

  /**
   * 生成合同审查报告
   *
   * @returns {Promise<string>} - 合同审查报告内容
   */
  async generateContractReviewReport() {
    try {
      // 获取合同审查分析结果
      let contractReview = this.getAnalysisResult("contract-review");

      // 如果没有合同审查分析结果，先进行分析
      if (!contractReview) {
        contractReview = await this.analyzeCase("contract-review");
      }

      // 获取风险评估分析结果
      let riskAssessment = this.getAnalysisResult("risk-assessment");

      // 如果没有风险评估分析结果，先进行分析
      if (!riskAssessment) {
        riskAssessment = await this.analyzeCase("risk-assessment");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成合同审查报告
      const report = await aiEngine.analyze(
        this.caseName,
        [...materials, contractReview, riskAssessment],
        "非诉",
        "generate-contract-review-report"
      );

      // 保存合同审查报告
      this.materialManager.addMaterial("合同审查报告", report, "法律文书");

      return report;
    } catch (err) {
      console.error(`生成合同审查报告出错: ${err.message}`);
      throw err;
    }
  }

  /**
   * 生成法律意见书
   *
   * @returns {Promise<string>} - 法律意见书内容
   */
  async generateLegalOpinion() {
    try {
      // 根据业务类型选择不同的分析结果
      let primaryAnalysis;
      let analysisType;

      switch (this.businessType) {
        case "合同审查":
          analysisType = "contract-review";
          break;

        case "法律咨询":
          analysisType = "legal-consultation";
          break;

        case "合规审查":
          analysisType = "compliance-analysis";
          break;

        default:
          analysisType = "basic-analysis";
          break;
      }

      // 获取主要分析结果
      primaryAnalysis = this.getAnalysisResult(analysisType);

      // 如果没有主要分析结果，先进行分析
      if (!primaryAnalysis) {
        primaryAnalysis = await this.analyzeCase(analysisType);
      }

      // 获取风险评估分析结果
      let riskAssessment = this.getAnalysisResult("risk-assessment");

      // 如果没有风险评估分析结果，先进行分析
      if (!riskAssessment) {
        riskAssessment = await this.analyzeCase("risk-assessment");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成法律意见书
      const opinion = await aiEngine.analyze(
        this.caseName,
        [...materials, primaryAnalysis, riskAssessment],
        "非诉",
        "generate-legal-opinion"
      );

      // 保存法律意见书
      this.materialManager.addMaterial("法律意见书", opinion, "法律文书");

      return opinion;
    } catch (err) {
      console.error(`生成法律意见书出错: ${err.message}`);
      throw err;
    }
  }
}

module.exports = NonLitigationCase;
