/**
 * 创建案件功能模块
 */

const fs = require("fs");
const path = require("path");

/**
 * 创建新案件
 *
 * @param {string} baseDir - 法律工程系统根目录
 * @param {string} casesDir - 案例目录
 * @param {string} caseName - 案件名称
 * @returns {boolean} - 是否创建成功
 */
function createCase(baseDir, casesDir, caseName) {
  if (!caseName) {
    console.log("错误: 请提供案件名称");
    return false;
  }

  // 确保案例目录存在
  if (!fs.existsSync(casesDir)) {
    fs.mkdirSync(casesDir, { recursive: true });
  }

  const templateDir = path.join(casesDir, "案件：示例案件");
  const newCaseDir = path.join(casesDir, `案件：${caseName}`);

  // 检查目标目录是否已存在
  if (fs.existsSync(newCaseDir)) {
    console.log(`错误: 案件 "${caseName}" 已存在`);
    return false;
  }

  // 复制示例案件目录
  console.log(`正在创建案件: "${caseName}"...`);
  try {
    // 递归复制目录
    copyFolderRecursiveSync(templateDir, path.dirname(newCaseDir));

    // 重命名为新案件名
    fs.renameSync(
      path.join(path.dirname(newCaseDir), path.basename(templateDir)),
      newCaseDir
    );

    // 更新README.md文件
    const readmeFile = path.join(newCaseDir, "README.md");
    if (fs.existsSync(readmeFile)) {
      // 生成新的案件编号
      const caseId = `CASE${String(Math.floor(Date.now() / 1000)).slice(-6)}`;
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // 读取并替换README中的案件信息
      let content = fs.readFileSync(readmeFile, "utf-8");

      content = content.replace(/示例案件/g, caseName);
      content = content.replace(/CASE001/g, caseId);
      content = content.replace(/2023-06-25/g, currentDate);

      fs.writeFileSync(readmeFile, content, "utf-8");

      console.log("更新案件信息完成");
    }

    console.log(`✅ 案件 "${caseName}" 创建成功！`);
    console.log(`案件路径: ${newCaseDir}`);
    return true;
  } catch (e) {
    console.log(`创建案件失败: ${e.message}`);
    return false;
  }
}

/**
 * 递归复制文件夹
 *
 * @param {string} source - 源文件夹
 * @param {string} target - 目标文件夹
 */
function copyFolderRecursiveSync(source, target) {
  // 检查目标文件夹是否存在，不存在则创建
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // 获取源文件夹中的所有文件和子文件夹
  const files = fs.readdirSync(source);

  // 复制文件夹
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // 复制所有文件和子文件夹
  for (const file of files) {
    const currentSource = path.join(source, file);
    const currentTarget = path.join(targetFolder, file);

    if (fs.statSync(currentSource).isDirectory()) {
      // 递归复制子文件夹
      copyFolderRecursiveSync(currentSource, targetFolder);
    } else {
      // 复制文件
      fs.copyFileSync(currentSource, currentTarget);
    }
  }
}

module.exports = {
  createCase,
};
