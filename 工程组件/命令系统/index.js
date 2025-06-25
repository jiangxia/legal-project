/**
 * 法律工程系统 - 命令系统模块
 */

const { createCase } = require("./create_case");
const { identifyDisputeFocus } = require("./identify_disputes");
const { generateLitigationStrategy } = require("./litigation_strategy");
const { getCasePath, listCases, selectCase } = require("./case_utils");

module.exports = {
  createCase,
  identifyDisputeFocus,
  generateLitigationStrategy,
  getCasePath,
  listCases,
  selectCase,
};
