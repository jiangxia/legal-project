/**
 * AI分析引擎
 * 负责处理所有AI分析请求，统一管理提示词和结果处理
 */

const fs = require("fs");
const path = require("path");
const axios = require("axios");

class AIEngine {
  constructor() {
    this.promptsDir = path.join(__dirname, "..", "..", "prompts");
  }

  /**
   * 加载提示词
   *
   * @param {string} category - 提示词类别（如：民商事、刑事等）
   * @param {string} name - 提示词名称
   * @returns {object|null} - 提示词对象或null
   */
  loadPrompt(category, name) {
    try {
      const promptPath = path.join(this.promptsDir, category, `${name}.json`);

      // 检查JSON文件是否存在
      if (fs.existsSync(promptPath)) {
        const promptData = JSON.parse(fs.readFileSync(promptPath, "utf-8"));
        return promptData;
      }

      // 尝试加载MD文件（向后兼容）
      const mdPath = path.join(this.promptsDir, "..", category, "index.md");
      if (fs.existsSync(mdPath)) {
        const mdContent = fs.readFileSync(mdPath, "utf-8");
        return {
          title: `${category} ${name}`,
          originalContent: mdContent,
        };
      }

      console.log(`错误: 未找到提示词 ${category}/${name}`);
      return null;
    } catch (err) {
      console.log(`加载提示词出错: ${err.message}`);
      return null;
    }
  }

  /**
   * 分析案件材料
   *
   * @param {string} caseName - 案件名称
   * @param {Array<string>|string} materials - 案件材料列表或单个材料字符串
   * @param {string} promptCategory - 提示词类别
   * @param {string} promptName - 提示词名称
   * @returns {Promise<string>} - 分析结果
   */
  async analyze(caseName, materials, promptCategory, promptName) {
    console.log(`正在使用AI分析案件材料...`);

    try {
      // 加载提示词
      const promptData = this.loadPrompt(promptCategory, promptName);
      if (!promptData) {
        throw new Error(`未找到提示词: ${promptCategory}/${promptName}`);
      }

      // 准备提示词内容
      const promptContent = promptData.originalContent || 
        this._formatStructuredPrompt(promptData);

      // 准备请求内容 - 确保materials是数组
      let materialContent;
      if (Array.isArray(materials)) {
        materialContent = materials.join("\n\n--- 材料分隔线 ---\n\n");
      } else if (typeof materials === 'string') {
        materialContent = materials;
      } else {
        throw new Error('materials参数必须是数组或字符串');
      }

      // 构建请求体
      const prompt = `
你是一名${promptData.role || "资深法律专家"}，${promptData.description || ""}

${promptContent}

案件名称：${caseName}

以下是案件材料：
${materialContent}

请根据上述方法论，分析案件并给出结果。
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
      console.log(`正在分析案件，请稍候...`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟API调用延迟

      // 生成模拟结果
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const result = this._generateMockResult(
        caseName,
        promptName,
        currentDate
      );

      console.log("✅ AI分析完成");
      return result;
    } catch (e) {
      console.log(`AI分析出错: ${e.message}`);
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      return `
# ${caseName} 分析 (AI分析出错)

## 错误信息

${e.message}

## 基本信息
- 案件名称：${caseName}
- 分析日期：${currentDate}

请手动完成分析。
`;
    }
  }

  /**
   * 诉讼策略分析
   *
   * @param {Array<Object>} materials - 案件材料列表，每个对象包含name和content
   * @param {Object} caseInfo - 案件信息对象
   * @returns {Promise<string>} - 分析结果
   */
  async analyzeLitigationStrategy(materials, caseInfo) {
    console.log(`正在分析诉讼策略...`);

    try {
      // 加载提示词
      const promptData = this.loadPrompt("civil", "litigation-strategy");
      if (!promptData) {
        throw new Error(`未找到提示词: 民商事/litigation-strategy`);
      }

      // 准备提示词内容
      const promptContent =
        promptData.originalContent || JSON.stringify(promptData);

      // 准备材料内容
      const materialContent = materials
        .map((m) => `【${m.name}】\n${m.content}`)
        .join("\n\n--- 材料分隔线 ---\n\n");

      // 构建请求体
      const prompt = `
你是一名资深诉讼律师，擅长制定民商事案件的诉讼策略。

${promptContent}

案件名称：${caseInfo.name}
案件类型：${caseInfo.type}
${caseInfo.businessType ? `业务类型：${caseInfo.businessType}` : ""}

以下是案件材料：
${materialContent}

请根据上述材料，分析案情并制定详细的诉讼策略。请包含以下内容：
1. 案件评估摘要
2. 六维分析（事实维度、情感维度、风险维度、优势维度、创新维度、整合维度）
3. 法律分析（适用法条、构成要件分析、法律论证路径）
4. 诉讼策略建议（诉讼路径、举证策略、辩论重点）
5. 风险评估及应对措施
6. 和解方案
7. 时间线规划

请给出详细、专业、可操作的诉讼策略报告。
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
      console.log(`正在分析诉讼策略，请稍候...`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 模拟API调用延迟

      // 生成模拟结果
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const result = this._generateMockResult(
        caseInfo.name,
        "litigation-strategy",
        currentDate
      );

      console.log("✅ 诉讼策略分析完成");
      return result;
    } catch (e) {
      console.log(`诉讼策略分析出错: ${e.message}`);
      const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      return `
# ${caseInfo.name} 诉讼策略分析 (分析出错)

## 错误信息

${e.message}

## 基本信息
- 案件名称：${caseInfo.name}
- 案件类型：${caseInfo.type}
- 分析日期：${currentDate}

请手动完成诉讼策略分析。
`;
    }
  }

  /**
   * 格式化结构化提示词
   *
   * @private
   * @param {Object} promptData - 结构化提示词数据
   * @returns {string} - 格式化后的提示词内容
   */
  _formatStructuredPrompt(promptData) {
    let content = `# ${promptData.title || '法律分析方法论'}\n\n`;
    
    if (promptData.methodology) {
      content += '## 分析框架\n\n';
      
      Object.entries(promptData.methodology).forEach(([key, value]) => {
        const title = key.replace(/_/g, '：');
        content += `### ${title}\n`;
        
        Object.entries(value).forEach(([subKey, subValue]) => {
          content += `\n**${subKey}**\n`;
          if (Array.isArray(subValue)) {
            subValue.forEach(item => {
              content += `- ${item}\n`;
            });
          }
        });
        content += '\n';
      });
    }
    
    if (promptData.output_format) {
      content += '## 输出要求\n\n请按照以下格式输出分析结果：\n\n';
      
      Object.entries(promptData.output_format).forEach(([key, value]) => {
        if (key === '争议焦点总结') {
          content += `### ${key}\n${value}\n\n`;
        } else {
          const title = key.replace(/_/g, '：');
          content += `### ${title}\n`;
          if (Array.isArray(value)) {
            value.forEach(item => {
              content += `- ${item}：\n`;
            });
          }
          content += '\n';
        }
      });
    }
    
    return content;
  }

  /**
   * 生成模拟结果（仅用于开发测试）
   *
   * @private
   * @param {string} caseName - 案件名称
   * @param {string} analysisType - 分析类型
   * @param {string} date - 日期
   * @returns {string} - 模拟结果
   */
  _generateMockResult(caseName, analysisType, date) {
    if (analysisType === "dispute-focus") {
      return `
# ${caseName} 争议焦点分析

## 基本信息
- 案件名称：${caseName}
- 分析日期：${date}

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
    } else if (analysisType === "litigation-strategy") {
      return `
# ${caseName} 诉讼策略报告

## 案件评估摘要

本案为一起机动车交通事故责任纠纷案件，原告梁某、林某因交通事故受到人身伤害，起诉被告吴某（机动车驾驶人）、施工方（道路施工方）及保险公司，要求赔偿各项损失。案件争议焦点主要集中在事故责任划分、损害赔偿范围及数额、施工方安全保障义务履行情况，以及保险公司赔偿责任等方面。

## 六维分析

### 事实维度：客观事实梳理和证据评估

**关键事实梳理**：
1. 事故发生时间、地点：交通事故发生在被告施工方的道路施工区域附近
2. 当事人情况：原告梁某、林某为事故受害人；被告吴某为机动车驾驶人；被告施工方负责道路施工；被告保险公司为机动车交通事故责任强制保险提供方
3. 事故经过：被告吴某驾驶机动车行驶至施工路段时发生事故，导致原告受伤
4. 伤情情况：原告梁某、林某因事故受伤，产生医疗费、误工费、护理费等损失
5. 交警部门已作出交通事故认定书，对事故责任进行了初步认定

**证据评估**：
- 强证据：交通事故认定书、医疗诊断证明、医疗费发票、伤残鉴定意见、保险单
- 弱证据：证人证言、事故现场照片（如拍摄角度不佳或不清晰）
- 缺失证据：施工方施工许可证明、施工现场安全措施记录、行车记录仪视频（需补充）

### 情感维度：当事人需求和法庭情感因素

**当事人需求**：
- 委托人（原告）：希望获得全面合理的赔偿，尽快解决纠纷，减轻身体伤害和经济损失带来的压力
- 对方（被告）：吴某希望减轻赔偿责任；施工方可能否认安全保障义务；保险公司希望控制赔付范围

**法庭情感考量**：
- 法官通常会关注交通弱势群体的保护
- 对于道路施工安全责任问题，法院态度趋严
- 交通事故赔偿有较为成熟的司法实践，法官倾向于按照标准化流程处理

### 风险维度：不利因素和应对措施

**潜在风险**：
1. 原告可能部分负有事故责任，影响赔偿金额
2. 施工方可能提供证据证明已尽到安全警示义务
3. 部分损失项目如精神损害赔偿、后续治疗费用等可能难以全额支持
4. 被告之间可能互相推诿责任，延长诉讼周期

**应对措施**：
1. 提前准备应对原告可能存在的过错行为的解释
2. 调查收集施工现场缺乏足够警示标志的证据
3. 聘请专业鉴定机构对伤残情况及后续治疗需求进行评估
4. 明确各被告责任划分，针对性提出诉讼请求

### 优势维度：有利因素和法律支持

**有利因素**：
1. 交通事故认定书已经确认了基本事实和责任比例
2. 原告伤情明确，医疗证明和费用凭证完整
3. 机动车驾驶人对非机动车和行人承担更高注意义务
4. 道路施工方对道路安全负有特殊保障义务

**法律支持**：
1. 《民法典》第1176条：机动车发生交通事故造成损害的赔偿责任
2. 《民法典》第1213条：机动车交通事故责任
3. 《民法典》第1217条：道路管理人责任
4. 《道路交通安全法》第76条：交通事故损害赔偿
5. 《机动车交通事故责任强制保险条例》相关规定

### 创新维度：策略创新点和突破方向

**创新策略**：
1. 运用"共同危险行为"理论，主张施工方与驾驶人存在共同过错
2. 采用"分层索赔"策略：先确定基本赔偿，再分别向各被告主张差额部分
3. 引入道路交通安全专家证人，证明施工区域安全措施不足
4. 考虑公益诉讼配合模式，引入社会关注，促使施工方承担更多社会责任

**突破方向**：
1. 突破传统交警责任认定的局限性，扩大施工方的注意义务范围
2. 探索伤残康复期间的持续赔偿机制
3. 寻求法院支持更高标准的精神损害赔偿

### 整合维度：全局计划和控制方案

**诉讼整体规划**：
1. 第一阶段（1-2周）：深入调查取证，完善证据链条
2. 第二阶段（3-4周）：启动诉前调解程序，探索和解可能
3. 第三阶段（1-2个月）：提起诉讼，递交起诉状和证据
4. 第四阶段（3-6个月）：积极参与庭审，重点围绕责任划分和赔偿标准展开论证
5. 第五阶段：判决后执行或上诉准备

**团队分工**：
1. 主办律师：负责整体策略和庭审
2. 助理律师：负责证据收集和整理
3. 医疗顾问：评估伤情和后续治疗方案
4. 事故重建专家：分析事故原因和责任比例

## 法律分析

### 适用法条
1. 《民法典》第1176条：交通事故责任
2. 《民法典》第1213条：机动车交通事故责任
3. 《民法典》第1217条：道路管理人责任
4. 《道路交通安全法》第76条：交通事故损害赔偿
5. 《机动车交通事故责任强制保险条例》第21条、第22条：赔偿责任
6. 《最高人民法院关于审理道路交通事故损害赔偿案件适用法律若干问题的解释》相关条款

### 构成要件分析
1. 交通事故事实发生：有客观证据证明交通事故的发生
2. 人身损害结果：原告因事故受伤，产生各项损失
3. 因果关系：损害结果与交通事故之间存在直接因果关系
4. 责任主体确定：机动车驾驶人、道路施工方、保险公司
5. 过错认定：各方在事故中的过错程度及责任划分

### 法律论证路径
1. 论证机动车驾驶人的违章行为与事故之间的因果关系
2. 论证道路施工方未尽安全保障义务的具体表现
3. 明确保险公司在交强险限额内的无过错赔偿责任
4. 依据伤残等级和当地赔偿标准，明确各项损失的计算依据

## 诉讼策略建议

### 诉讼路径
1. 管辖选择：选择原告住所地或交通事故发生地法院
2. 程序选择：普通程序，由于案件涉及多方被告且损害程度较重
3. 诉讼请求：
   - 主请求：要求三被告连带赔偿医疗费、误工费、护理费、残疾赔偿金等各项损失
   - 保险公司在交强险责任限额内承担赔偿责任
   - 超出部分由其他被告按责任比例承担
   - 诉讼费用由被告承担

### 举证策略
1. 重点举证：
   - 交通事故认定书
   - 完整的就医记录和医疗费用凭证
   - 伤残鉴定报告
   - 施工现场安全措施不足的证据
   - 事故现场照片和视频
2. 质证重点：
   - 质疑施工方提供的安全措施证据的真实性和有效性
   - 强调驾驶人应当预见施工路段存在的危险
   - 重点关注伤残等级认定的客观性

### 辩论重点
1. 施工方的安全保障义务：论证施工方未设置足够警示标志
2. 驾驶人的注意义务：强调在施工路段应当减速慢行
3. 保险责任：明确交强险和商业险的赔偿范围
4. 损失计算：按照最新的人身损害赔偿标准主张权利

## 风险评估

### 法律风险
1. 原告行为可能被认定部分责任，影响赔偿比例
2. 施工方可能提供证据证明已尽到安全保障义务
3. 部分损失项目可能因证据不足被法院调减
4. 后续治疗费用的预估可能不被全部支持

### 应对措施
1. 针对原告可能的责任，准备充分的抗辩理由
2. 实地取证施工现场安全措施情况，收集施工规范标准
3. 聘请专业医疗鉴定机构进行伤情评估
4. 设计阶段性索赔策略，预留后续治疗费用请求空间

## 和解方案

### 可接受的和解条件
1. 最优方案：被告全额赔偿各项损失并承担后续治疗费用
2. 次优方案：基本损失获得全额赔偿，部分争议项目适当折让
3. 底线方案：获得80%的基本赔偿金额，重伤部分确保全额赔付

### 谈判策略
1. 突出伤情严重性和长期影响
2. 强调各被告的法律责任明确
3. 表明诉讼准备充分，胜诉把握较大
4. 适当让步非核心赔偿项目，坚守核心赔偿底线

## 时间线规划

1. 诉前准备阶段（1-2周）：
   - 完善医疗证据和损失证明
   - 收集施工现场安全措施证据
   - 准备伤残鉴定申请

2. 调解阶段（2-4周）：
   - 向被告发出调解邀请
   - 提出初步赔偿方案
   - 评估和解可能性

3. 起诉阶段（1个月）：
   - 准备起诉状和证据清单
   - 缴纳诉讼费用
   - 等待法院受理通知

4. 庭审阶段（3-6个月）：
   - 参与证据交换和质证
   - 申请伤残鉴定和损失评估
   - 针对性进行法庭辩论
   - 把握调解时机

5. 执行阶段（视情况而定）：
   - 判决生效后及时申请执行
   - 分别针对不同被告采取执行措施
   - 跟踪后续治疗和康复情况

---

本诉讼策略报告基于现有信息制定，随着案件进展和新证据出现，策略可能需要相应调整。建议与委托人保持密切沟通，及时更新诉讼策略。

报告日期：${date}
`;
    } else {
      return `
# ${caseName} 分析报告

## 基本信息
- 案件名称：${caseName}
- 分析类型：${analysisType}
- 分析日期：${date}

## 分析内容

这是一个模拟生成的分析报告，实际使用时将被替换为AI分析结果。

## 结论

根据案件材料分析，建议进一步收集证据，明确法律关系，制定有针对性的应对策略。

---

报告日期：${date}
`;
    }
  }
}

// 导出类而不是实例
module.exports = AIEngine;
