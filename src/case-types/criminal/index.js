/**
 * 刑事案件类
 * 处理刑事案件的特定逻辑
 */

const CaseType = require("../base/case-type");
const MaterialManager = require("../base/material-manager");
const AIEngine = require("../../core/ai-engine");

// 创建AI引擎实例
const aiEngine = new AIEngine();

class CriminalCase extends CaseType {
  /**
   * 构造函数
   *
   * @param {string} caseId - 案件ID
   * @param {string} caseName - 案件名称
   */
  constructor(caseId, caseName) {
    super(caseId, caseName, "刑事");
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
        `开始分析刑事案件: ${this.caseName}, 分析类型: ${analysisType}`
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
        case "crime-analysis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "刑事",
            "crime-analysis"
          );
          break;

        case "defense-strategy":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "刑事",
            "defense-strategy"
          );
          break;

        case "evidence-evaluation":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "刑事",
            "evidence-evaluation"
          );
          break;

        case "sentencing-analysis":
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "刑事",
            "sentencing-analysis"
          );
          break;

        default:
          result = await aiEngine.analyze(
            this.caseName,
            materials,
            "刑事",
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
   * 获取刑事案件特定的分析类型列表
   *
   * @returns {Array<string>} - 分析类型列表
   */
  getAnalysisTypes() {
    return [
      "crime-analysis", // 罪名分析
      "defense-strategy", // 辩护策略
      "evidence-evaluation", // 证据评估
      "sentencing-analysis", // 量刑分析
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
   * 添加案卷材料
   *
   * @param {string} documentName - 文书名称
   * @param {string} documentContent - 文书内容
   * @returns {Object|null} - 添加的文书对象或null
   */
  addCaseFile(documentName, documentContent) {
    return this.materialManager.addMaterial(
      documentName,
      documentContent,
      "案卷材料"
    );
  }

  /**
   * 分析罪名
   *
   * @returns {Promise<Object>} - 罪名分析结果
   */
  async analyzeCrime() {
    try {
      // 获取罪名分析结果
      let crimeAnalysis = this.getAnalysisResult("crime-analysis");

      // 如果没有罪名分析结果，先进行分析
      if (!crimeAnalysis) {
        crimeAnalysis = await this.analyzeCase("crime-analysis");
      }

      // 提取罪名信息
      const crimeInfo = this._extractCrimeInfo(crimeAnalysis);

      return crimeInfo;
    } catch (err) {
      console.error(`分析罪名出错: ${err.message}`);
      throw err;
    }
  }

  /**
   * 提取罪名信息
   *
   * @private
   * @param {string} crimeAnalysis - 罪名分析结果
   * @returns {Object} - 提取的罪名信息
   */
  _extractCrimeInfo(crimeAnalysis) {
    try {
      // 提取可能的罪名
      const possibleCrimesRegex =
        /可能的罪名[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const possibleCrimesSection = crimeAnalysis.match(possibleCrimesRegex);
      let possibleCrimes = [];

      if (possibleCrimesSection && possibleCrimesSection[1]) {
        possibleCrimes = possibleCrimesSection[1]
          .split(/\n+/)
          .filter(
            (line) => line.trim().startsWith("-") || /^\d+\./.test(line.trim())
          )
          .map((line) => {
            // 移除前面的 "-" 或 "数字."
            return line.trim().replace(/^-\s*|^\d+\.\s*/, "");
          });
      }

      // 提取构成要件
      const elementsRegex = /构成要件[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const elementsSection = crimeAnalysis.match(elementsRegex);
      let elements = [];

      if (elementsSection && elementsSection[1]) {
        elements = elementsSection[1]
          .split(/\n+/)
          .filter(
            (line) => line.trim().startsWith("-") || /^\d+\./.test(line.trim())
          )
          .map((line) => {
            // 移除前面的 "-" 或 "数字."
            return line.trim().replace(/^-\s*|^\d+\.\s*/, "");
          });
      }

      // 提取法条依据
      const legalBasisRegex = /法条依据[^：:]*[：:]\s*([\s\S]+?)(?:\n\n|##|$)/i;
      const legalBasisSection = crimeAnalysis.match(legalBasisRegex);
      let legalBasis = [];

      if (legalBasisSection && legalBasisSection[1]) {
        legalBasis = legalBasisSection[1]
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
        possibleCrimes,
        elements,
        legalBasis,
      };
    } catch (err) {
      console.error(`提取罪名信息出错: ${err.message}`);
      return {
        possibleCrimes: [],
        elements: [],
        legalBasis: [],
      };
    }
  }

  /**
   * 生成辩护词
   *
   * @returns {Promise<string>} - 辩护词内容
   */
  async generateDefensePlea() {
    try {
      // 获取罪名分析结果
      let crimeAnalysis = this.getAnalysisResult("crime-analysis");

      // 如果没有罪名分析结果，先进行分析
      if (!crimeAnalysis) {
        crimeAnalysis = await this.analyzeCase("crime-analysis");
      }

      // 获取辩护策略分析结果
      let defenseStrategy = this.getAnalysisResult("defense-strategy");

      // 如果没有辩护策略分析结果，先进行分析
      if (!defenseStrategy) {
        defenseStrategy = await this.analyzeCase("defense-strategy");
      }

      // 获取所有材料
      const materials = this.materialManager.getAllMaterialContents();

      // 使用AI生成辩护词
      const defensePlea = await aiEngine.analyze(
        this.caseName,
        [...materials, crimeAnalysis, defenseStrategy],
        "刑事",
        "generate-defense-plea"
      );

      // 保存辩护词
      this.materialManager.addMaterial("辩护词", defensePlea, "诉讼文书");

      return defensePlea;
    } catch (err) {
      console.error(`生成辩护词出错: ${err.message}`);
      throw err;
    }
  }
}

module.exports = CriminalCase;
