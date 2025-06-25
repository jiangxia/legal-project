#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
争议焦点识别功能模块
"""

import os
import glob
import datetime
import time
import requests

def read_text_file(file_path):
    """
    读取文本文件内容

    参数:
        file_path: 文件路径

    返回:
        str: 文件内容
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='gbk') as f:
                return f.read()
        except Exception:
            return f"[无法读取文件: {os.path.basename(file_path)}]"
    except Exception as e:
        return f"[读取文件错误: {os.path.basename(file_path)} - {str(e)}]"

def analyze_with_ai(case_name, materials, prompt_template):
    """
    使用AI模型分析案件材料并识别争议焦点

    参数:
        case_name: 案件名称
        materials: 案件材料列表
        prompt_template: 提示词模板

    返回:
        str: 分析结果
    """
    print("正在使用AI分析案件材料...")

    try:
        # 准备请求内容
        material_content = "\n\n--- 材料分隔线 ---\n\n".join(materials)

        # 构建请求体
        prompt = f"""
你是一名资深法律专家，请根据三层次争议焦点识别方法论，分析以下案件材料并识别争议焦点。

案件名称：{case_name}

{prompt_template}

以下是案件材料：
{material_content}

请按照上述三层次争议焦点识别方法论的框架，根据材料识别并分析本案的争议焦点。
回答格式请参照三层次争议焦点识别方法论的结构，解析应当全面、专业、准确。
        """

        # 调用OpenAI API或其他可用的AI服务
        # 这里使用本地模拟调用，替换为实际API调用
        # response = requests.post(
        #     "https://api.openai.com/v1/chat/completions",
        #     headers={
        #         "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
        #         "Content-Type": "application/json"
        #     },
        #     json={
        #         "model": "gpt-4",
        #         "messages": [{"role": "user", "content": prompt}],
        #         "temperature": 0.3
        #     }
        # )
        # result = response.json()["choices"][0]["message"]["content"]

        # 模拟调用结果 - 实际使用时替换为上面的API调用
        print("正在分析案件争议焦点，请稍候...")
        time.sleep(2)  # 模拟API调用延迟

        result = f"""
# {case_name} 争议焦点分析

## 基本信息
- 案件名称：{case_name}
- 分析日期：{datetime.datetime.now().strftime("%Y-%m-%d")}

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
"""

        print("✅ AI分析完成")
        return result

    except Exception as e:
        print(f"AI分析出错: {str(e)}")
        return f"""
# {case_name} 争议焦点分析 (AI分析出错)

## 错误信息

{str(e)}

## 基本信息
- 案件名称：{case_name}
- 分析日期：{datetime.datetime.now().strftime("%Y-%m-%d")}

请手动完成争议焦点分析。
"""

def identify_dispute_focus(base_dir, cases_dir, case_name):
    """
    识别案件争议焦点

    参数:
        base_dir: 法律工程系统根目录
        cases_dir: 案例目录
        case_name: 案件名称

    返回:
        bool: 是否识别成功
    """
    if not case_name:
        print("错误: 缺少案件名称参数")
        return False

    # 查找案件路径
    possible_paths = [
        os.path.join(cases_dir, f"案件：{case_name}"),  # 带"案件："前缀
        os.path.join(cases_dir, case_name),            # 无前缀
        os.path.join(base_dir, "案例", case_name)      # 绝对路径
    ]

    case_dir = None
    for path in possible_paths:
        if os.path.isdir(path):
            case_dir = path
            break

    if not case_dir:
        print(f"错误: 案件 \"{case_name}\" 不存在")
        return False

    print(f"开始识别案件 \"{case_name}\" 的争议焦点...")

    # 创建争议焦点目录
    focus_dir = os.path.join(case_dir, "争议焦点")
    os.makedirs(focus_dir, exist_ok=True)

    # 获取方法论提示词
    method_file = os.path.join(base_dir, "工程组件", "争议焦点识别", "index.md")
    if not os.path.isfile(method_file):
        print("错误: 未找到争议焦点识别方法论文件")
        return False

    with open(method_file, 'r', encoding='utf-8') as f:
        method_content = f.read()

    # 获取案例材料
    materials_dir = os.path.join(case_dir, "案件材料")
    if not os.path.isdir(materials_dir):
        print("错误: 未找到案件材料目录")
        return False

    # 读取案例材料（支持多方材料的子目录）
    material_files = []
    material_sources = {}
    material_contents = []

    # 先检查是否有子目录（多方材料）
    subdirs = [d for d in os.listdir(materials_dir) if os.path.isdir(os.path.join(materials_dir, d))]

    if subdirs:
        # 有子目录，按各方分类收集材料
        print("检测到多方当事人材料...")
        for subdir in subdirs:
            subdir_path = os.path.join(materials_dir, subdir)
            files = []
            contents = []
            for ext in ['*.txt', '*.md']:
                found_files = glob.glob(os.path.join(subdir_path, ext))
                for file in found_files:
                    content = read_text_file(file)
                    if content:
                        contents.append(f"【{subdir}】{os.path.basename(file)}:\n{content}")
                files.extend(found_files)
                material_files.extend(found_files)
            if files:
                material_sources[subdir] = files
                material_contents.extend(contents)
                print(f"- 读取 {subdir} 的材料 {len(files)} 个")
    else:
        # 无子目录，直接收集根目录下的材料
        for ext in ['*.txt', '*.md']:
            files = glob.glob(os.path.join(materials_dir, ext))
            for file in files:
                content = read_text_file(file)
                if content:
                    material_contents.append(f"【材料】{os.path.basename(file)}:\n{content}")
            material_files.extend(files)
        if material_files:
            material_sources["通用材料"] = material_files
            print(f"- 读取通用材料 {len(material_files)} 个")

    if not material_files:
        print("错误: 未找到任何案件材料文件")
        return False

    print(f"共读取 {len(material_files)} 个材料文件")

    # 使用AI分析争议焦点
    ai_analysis = analyze_with_ai(case_name, material_contents, method_content)

    # 创建争议焦点分析文件
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    focus_file = os.path.join(focus_dir, f"争议焦点分析-{timestamp}.md")

    # 写入文件
    with open(focus_file, 'w', encoding='utf-8') as f:
        f.write(ai_analysis)

    print(f"✅ 争议焦点分析文件已创建: {focus_file}")
    return True
