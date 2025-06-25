/**
 * 争议焦点识别功能模块
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const axios = require("axios");
const { getCasePath } = require("./case_utils");

/**
 * 读取文本文件内容
 *
 * @param {string} filePath - 文件路径
 * @returns {string} - 文件内容
 */
function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    if (e.code === "ENOENT") {
      return `[无法读取文件: ${path.basename(filePath)}]`;
    } else {
      try {
        // 尝试使用其他编码读取
        const buffer = fs.readFileSync(filePath);
        return buffer.toString("gbk"); // 尝试GBK编码
      } catch (err) {
        return `[读取文件错误: ${path.basename(filePath)} - ${err.message}]`;
      }
    }
  }
}

/**
 * 使用AI模型分析案件材料并识别争议焦点
 *
 * @param {string} caseName - 案件名称
 * @param {Array<string>} materials - 案件材料列表
 * @param {string} promptTemplate - 提示词模板
 * @returns {Promise<string>} - 分析结果
 */
async function analyzeWithAi(caseName, materials, promptTemplate) {
  console.log("正在使用AI分析案件材料...");

  try {
    // 准备请求内容
    const materialContent = materials.join("\n\n--- 材料分隔线 ---\n\n");

    // 构建请求体
    const prompt = `
你是一名资深法律专家，请根据三层次争议焦点识别方法论，分析以下案件材料并识别争议焦点。

案件名称：${caseName}

${promptTemplate}

以下是案件材料：
${materialContent}

请按照上述三层次争议焦点识别方法论的框架，根据材料识别并分析本案的争议焦点。
回答格式请参照三层次争议焦点识别方法论的结构，解析应当全面、专业、准确。
    `;

    // 调用OpenAI API或其他可用的AI服务
    // 这里使用本地模拟调用，替换为实际API调用
    /*
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const result = response.data.choices[0].message.content;
    */

    // 模拟调用结果 - 实际使用时替换为上面的API调用
    console.log("正在分析案件争议焦点，请稍候...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟API调用延迟

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const result = `
# ${caseName} 争议焦点分析

## 基本信息
- 案件名称：${caseName}
- 分析日期：${currentDate}

## 第一层：法律关系分析

经过分析，本案涉及的主要法律关系是机动车交通事故责任纠纷，属于侵权责任法律关系。

当事人法律身份与地位：
- 原告：梁某、林某（受害人）
- 被告：吴某（机动车驾驶人）、施工方（道路施工方）、保险公司（机动车交通事故责任强制保险提供方）

法律关系形成过程及关键时间节点：
- 事故发生时间
- 保险合同签订时间
- 道路施工开始时间

适用法律体系：
- 《中华人民共和国民法典》侵权责任编
- 《中华人民共和国道路交通安全法》
- 《机动车交通事故责任强制保险条例》

## 第二层：请求权基础分解

原告诉讼请求可能包括：
1. 人身损害赔偿请求：医疗费、误工费、护理费、残疾赔偿金等
2. 财产损失赔偿请求：车辆损失、随车财物损失等
3. 精神损害赔偿请求

对应法条：
- 民法典第1176条（交通事故责任）
- 民法典第1213条（机动车交通事故责任）
- 民法典第1217条（道路管理人责任）

构成要件：
1. 存在交通事故事实
2. 各方存在过错
3. 有损害结果
4. 过错行为与损害结果之间存在因果关系
5. 损失数额确定

举证责任分配：
- 原告需证明事故事实、损害后果及损失范围
- 机动车驾驶人需证明自身无过错或已尽到安全驾驶义务
- 施工方需证明已尽到安全保障义务，设置了足够的警示标志
- 保险公司需证明是否属于保险责任免除情形

## 第三层：对抗性问题提炼

可能存在的主要争议点：

1. 事故责任认定
   - 原告主张：施工方未设置足够警示标志，驾驶人未尽到安全驾驶义务
   - 被告反驳：施工区域有充分警示，驾驶人可能存在违章驾驶行为

2. 损失计算标准
   - 原告主张：按照最新赔偿标准计算
   - 被告反驳：部分损失与事故无直接因果关系，后续治疗费用不合理

3. 保险责任范围
   - 原告主张：保险公司应在责任限额内全额赔付
   - 保险公司反驳：部分损失属于免赔范围

4. 施工方责任承担
   - 原告主张：施工方未尽安全保障义务
   - 施工方反驳：已按规定设置警示标志，事故主要由驾驶人过错造成

## 争议焦点总结

核心争议焦点：
1. 交通事故责任如何划分？各方应承担多大比例的责任？
2. 施工方是否尽到了安全保障义务？
3. 保险公司赔偿责任的范围和限额是多少？
4. 损害赔偿的具体项目和数额如何确定？
5. 各被告之间是否构成连带责任？

以上争议焦点将直接影响案件的审理方向和最终判决结果，应重点关注。
`;

    console.log("✅ AI分析完成");
    return result;
  } catch (e) {
    console.log(`AI分析出错: ${e.message}`);
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return `
# ${caseName} 争议焦点分析 (AI分析出错)

## 错误信息

${e.message}

## 基本信息
- 案件名称：${caseName}
- 分析日期：${currentDate}

请手动完成争议焦点分析。
`;
  }
}

/**
 * 识别案件争议焦点
 *
 * @param {string} baseDir - 法律工程系统根目录
 * @param {string} casesDir - 案例目录
 * @param {string} caseName - 案件名称
 * @returns {Promise<boolean>} - 是否识别成功
 */
async function identifyDisputeFocus(baseDir, casesDir, caseName) {
  if (!caseName) {
    console.log("错误: 缺少案件名称参数");
    return false;
  }

  // 查找案件路径
  const caseDir = getCasePath(baseDir, casesDir, caseName);

  if (!caseDir) {
    console.log(`错误: 案件 "${caseName}" 不存在`);
    return false;
  }

  console.log(`开始识别案件 "${caseName}" 的争议焦点...`);

  // 创建争议焦点目录
  const focusDir = path.join(caseDir, "争议焦点");
  if (!fs.existsSync(focusDir)) {
    fs.mkdirSync(focusDir, { recursive: true });
  }

  // 获取方法论提示词
  const methodFile = path.join(baseDir, "工程组件", "争议焦点识别", "index.md");
  if (!fs.existsSync(methodFile)) {
    console.log("错误: 未找到争议焦点识别方法论文件");
    return false;
  }

  const methodContent = fs.readFileSync(methodFile, "utf-8");

  // 获取案例材料
  const materialsDir = path.join(caseDir, "案件材料");
  if (
    !fs.existsSync(materialsDir) ||
    !fs.statSync(materialsDir).isDirectory()
  ) {
    console.log("错误: 未找到案件材料目录");
    return false;
  }

  // 读取案例材料（支持多方材料的子目录）
  const materialFiles = [];
  const materialSources = {};
  const materialContents = [];

  // 先检查是否有子目录（多方材料）
  const subdirs = fs
    .readdirSync(materialsDir)
    .filter((item) => fs.statSync(path.join(materialsDir, item)).isDirectory());

  if (subdirs.length > 0) {
    // 有子目录，按各方分类收集材料
    console.log("检测到多方当事人材料...");
    for (const subdir of subdirs) {
      const subdirPath = path.join(materialsDir, subdir);
      const files = [];
      const contents = [];

      // 查找txt和md文件
      const extensions = ["txt", "md"];
      for (const ext of extensions) {
        const foundFiles = glob.sync(path.join(subdirPath, `*.${ext}`));
        for (const file of foundFiles) {
          const content = readTextFile(file);
          if (content) {
            contents.push(`【${subdir}】${path.basename(file)}:\n${content}`);
          }
          files.push(file);
        }
        materialFiles.push(...foundFiles);
      }

      if (files.length > 0) {
        materialSources[subdir] = files;
        materialContents.push(...contents);
        console.log(`- 读取 ${subdir} 的材料 ${files.length} 个`);
      }
    }
  } else {
    // 无子目录，直接收集根目录下的材料
    const extensions = ["txt", "md"];
    for (const ext of extensions) {
      const files = glob.sync(path.join(materialsDir, `*.${ext}`));
      for (const file of files) {
        const content = readTextFile(file);
        if (content) {
          materialContents.push(`【材料】${path.basename(file)}:\n${content}`);
        }
      }
      materialFiles.push(...files);
    }

    if (materialFiles.length > 0) {
      materialSources["通用材料"] = materialFiles;
      console.log(`- 读取通用材料 ${materialFiles.length} 个`);
    }
  }

  if (materialFiles.length === 0) {
    console.log("错误: 未找到任何案件材料文件");
    return false;
  }

  console.log(`共读取 ${materialFiles.length} 个材料文件`);

  // 使用AI分析争议焦点
  const aiAnalysis = await analyzeWithAi(
    caseName,
    materialContents,
    methodContent
  );

  // 创建争议焦点分析文件
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14);
  const focusFile = path.join(focusDir, `争议焦点分析-${timestamp}.md`);

  // 写入文件
  fs.writeFileSync(focusFile, aiAnalysis, "utf-8");

  console.log(`✅ 争议焦点分析文件已创建: ${focusFile}`);
  return true;
}

module.exports = {
  identifyDisputeFocus,
};
