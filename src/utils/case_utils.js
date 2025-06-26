/**
 * 案件通用功能模块
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

/**
 * 获取案件路径（支持多种目录命名格式）
 *
 * @param {string} baseDir - 法律工程系统根目录
 * @param {string} casesDir - 案例目录
 * @param {string} caseName - 案件名称
 * @returns {string|null} - 案件路径，如果找不到则返回null
 */
function getCasePath(baseDir, casesDir, caseName) {
  // 尝试多种可能的路径格式
  const possiblePaths = [
    path.join(casesDir, `案件：${caseName}`), // 带"案件："前缀
    path.join(casesDir, caseName), // 无前缀
    path.join(baseDir, "案例", caseName), // 绝对路径
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      return p;
    }
  }

  return null;
}

/**
 * 列出所有案件
 *
 * @param {string} casesDir - 案例目录
 */
function listCases(casesDir) {
  console.log("案件列表:");

  // 确保案例目录存在
  if (!fs.existsSync(casesDir)) {
    console.log("  (暂无案件)");
    return;
  }

  // 查找带"案件："前缀的目录
  const prefixedCases = glob
    .sync(path.join(casesDir, "案件：*"))
    .filter((p) => fs.statSync(p).isDirectory());

  // 查找无前缀的目录（排除"案件："前缀的目录）
  const directCases = glob
    .sync(path.join(casesDir, "*"))
    .filter(
      (p) =>
        fs.statSync(p).isDirectory() && !path.basename(p).startsWith("案件：")
    );

  const caseDirs = [...prefixedCases, ...directCases];

  if (caseDirs.length === 0) {
    console.log("  (暂无案件)");
    return;
  }

  for (const caseDir of caseDirs) {
    const caseName = path.basename(caseDir).replace("案件：", "");
    console.log(`- ${caseName}`);
  }
}

/**
 * 选择案件
 *
 * @param {string} baseDir - 法律工程系统根目录
 * @param {string} casesDir - 案例目录
 * @param {string} caseName - 案件名称
 * @returns {boolean} - 是否选择成功
 */
function selectCase(baseDir, casesDir, caseName) {
  if (!caseName) {
    console.log("错误: 缺少案件名称参数");
    return false;
  }

  const caseDir = getCasePath(baseDir, casesDir, caseName);

  if (!caseDir) {
    console.log(`错误: 案件 "${caseName}" 不存在`);
    return false;
  }

  console.log(`已选择案件: "${caseName}"`);
  console.log(`案件路径: ${caseDir}`);
  console.log(`请使用 cd "${caseDir}" 进入案件目录`);
  return true;
}

module.exports = {
  getCasePath,
  listCases,
  selectCase,
};
