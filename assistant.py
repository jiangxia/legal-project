#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
法律工程系统 - 智能助手
合并了command.sh和legal_assistant.py的功能
"""

import os
import sys
import subprocess
import re
import time
import shutil
import datetime
import glob
import json
from pathlib import Path

# 获取脚本所在目录
BASE_DIR = os.path.dirname(os.path.realpath(__file__))
COMMAND_SYSTEM_DIR = os.path.join(BASE_DIR, "工程组件", "命令系统")
CASES_DIR = os.path.join(BASE_DIR, "案例")  # 新的案例目录

# 清屏函数
def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

# 显示所有指令
def show_commands():
    print("法律工程系统 - 智能助手")
    print("=" * 50)
    print("可用指令:")
    print("  新建案件<案件名称>")
    print("  查看案件列表")
    print("  选择案件：<案件名称>")
    print("  分析案件材料：<案件名称>")
    print("  识别争议焦点<案件名称>")
    print("  生成检索关键词：<案件名称>")
    print("  启动律师角色：<案件名称>")
    print("  生成诉讼策略：<案件名称>")
    print("  起草<文书类型>：<案件名称>  (如: 起草起诉状：合同纠纷案件)")
    print("  启动服务器")
    print("  清屏")
    print("  退出")
    print("=" * 50)

# 启动服务器函数
def start_server():
    print("正在启动本地HTTP服务器...")
    print("服务器将在端口 8000 上运行")
    print("")
    print("请在浏览器中访问以下地址:")
    print("http://localhost:8000/工程组件/页面/index.html")
    print("")
    print("按 Ctrl+C 可停止服务器")
    print("-----------------------------------")

    # 尝试使用Python启动HTTP服务器
    try:
        os.chdir(BASE_DIR)
        if shutil.which("python3"):
            subprocess.run(["python3", "-m", "http.server", "8000"])
        elif shutil.which("python"):
            subprocess.run(["python", "-m", "SimpleHTTPServer", "8000"])
        elif shutil.which("npx"):
            subprocess.run(["npx", "http-server", "-p", "8000"])
        elif shutil.which("php"):
            subprocess.run(["php", "-S", "localhost:8000"])
        else:
            print("错误: 未找到可用的HTTP服务器")
            print("请安装Python、Node.js或PHP中的任意一个")
            return False
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except Exception as e:
        print(f"启动服务器失败: {e}")
        return False
    return True

# 创建新案件
def create_case(case_name):
    if not case_name:
        print("错误: 请提供案件名称")
        return False

    # 确保案例目录存在
    os.makedirs(CASES_DIR, exist_ok=True)

    template_dir = os.path.join(CASES_DIR, "案件：示例案件")
    new_case_dir = os.path.join(CASES_DIR, f"案件：{case_name}")

    # 检查目标目录是否已存在
    if os.path.exists(new_case_dir):
        print(f"错误: 案件 \"{case_name}\" 已存在")
        return False

    # 复制示例案件目录
    print(f"正在创建案件: \"{case_name}\"...")
    try:
        shutil.copytree(template_dir, new_case_dir)

        # 更新README.md文件
        readme_file = os.path.join(new_case_dir, "README.md")
        if os.path.isfile(readme_file):
            # 生成新的案件编号
            case_id = f"CASE{str(int(time.time()))[-6:]}"
            current_date = datetime.datetime.now().strftime("%Y-%m-%d")

            # 读取并替换README中的案件信息
            with open(readme_file, 'r', encoding='utf-8') as f:
                content = f.read()

            content = content.replace("示例案件", case_name)
            content = content.replace("CASE001", case_id)
            content = content.replace("2023-06-25", current_date)

            with open(readme_file, 'w', encoding='utf-8') as f:
                f.write(content)

            print("更新案件信息完成")

        print(f"✅ 案件 \"{case_name}\" 创建成功！")
        print(f"案件路径: {new_case_dir}")
        return True

    except Exception as e:
        print(f"创建案件失败: {e}")
        return False

# 获取案件路径（支持多种目录命名格式）
def get_case_path(case_name):
    # 尝试多种可能的路径格式
    possible_paths = [
        os.path.join(CASES_DIR, f"案件：{case_name}"),  # 带"案件："前缀
        os.path.join(CASES_DIR, case_name),            # 无前缀
        os.path.join(BASE_DIR, "案例", case_name)      # 绝对路径
    ]

    for path in possible_paths:
        if os.path.isdir(path):
            return path

    return None

# 列出所有案件
def list_cases():
    print("案件列表:")
    # 查找带"案件："前缀的目录
    case_dirs = glob.glob(os.path.join(CASES_DIR, "案件：*"))
    # 查找无前缀的目录（排除"案件："前缀的目录）
    direct_cases = [d for d in glob.glob(os.path.join(CASES_DIR, "*"))
                  if os.path.isdir(d) and not os.path.basename(d).startswith("案件：")]

    case_dirs.extend(direct_cases)

    if not case_dirs:
        print("  (暂无案件)")
        return

    for case_dir in case_dirs:
        case_name = os.path.basename(case_dir).replace("案件：", "")
        print(f"- {case_name}")

# 选择案件
def select_case(case_name):
    if not case_name:
        print("错误: 缺少案件名称参数")
        return False

    case_dir = get_case_path(case_name)

    if not case_dir:
        print(f"错误: 案件 \"{case_name}\" 不存在")
        return False

    print(f"已选择案件: \"{case_name}\"")
    print(f"案件路径: {case_dir}")
    print(f"请使用 cd \"{case_dir}\" 进入案件目录")
    return True

# 识别案件争议焦点
def identify_dispute_focus(case_name):
    if not case_name:
        print("错误: 缺少案件名称参数")
        return False

    case_dir = get_case_path(case_name)

    if not case_dir:
        print(f"错误: 案件 \"{case_name}\" 不存在")
        return False

    print(f"开始识别案件 \"{case_name}\" 的争议焦点...")

    # 创建争议焦点目录
    focus_dir = os.path.join(case_dir, "争议焦点")
    os.makedirs(focus_dir, exist_ok=True)

    # 获取案例材料
    materials_dir = os.path.join(case_dir, "案件材料")
    if not os.path.isdir(materials_dir):
        print("错误: 未找到案件材料目录")
        return False

    # 读取案例材料（支持多方材料的子目录）
    material_files = []
    material_sources = {}

    # 先检查是否有子目录（多方材料）
    subdirs = [d for d in os.listdir(materials_dir) if os.path.isdir(os.path.join(materials_dir, d))]

    if subdirs:
        # 有子目录，按各方分类收集材料
        print("检测到多方当事人材料...")
        for subdir in subdirs:
            subdir_path = os.path.join(materials_dir, subdir)
            files = []
            for ext in ['*.txt', '*.md', '*.docx', '*.doc', '*.pdf']:
                found_files = glob.glob(os.path.join(subdir_path, ext))
                files.extend(found_files)
                material_files.extend(found_files)
            if files:
                material_sources[subdir] = files
                print(f"- 发现 {subdir} 的材料 {len(files)} 个")
    else:
        # 无子目录，直接收集根目录下的材料
        for ext in ['*.txt', '*.md', '*.docx', '*.doc', '*.pdf']:
            files = glob.glob(os.path.join(materials_dir, ext))
            material_files.extend(files)
        if material_files:
            material_sources["通用材料"] = material_files
            print(f"- 发现通用材料 {len(material_files)} 个")

    if not material_files:
        print("错误: 未找到任何案件材料文件")
        return False

    # 创建争议焦点分析文件
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    focus_file = os.path.join(focus_dir, f"争议焦点分析-{timestamp}.md")

    # 三层次争议焦点分析模板
    focus_template = """# {case_name} 争议焦点分析

## 基本信息
- 案件名称：{case_name}
- 分析日期：{current_date}

## 第一层：法律关系分析

此部分需要分析当事人之间的法律关系性质，确定适用的法律规范体系。

关注要点：
1. 当事人的法律身份与地位
2. 法律关系的形成过程和关键时间节点
3. 适用的法律体系（合同法、侵权法、物权法等）

## 第二层：请求权基础分解

此部分需要将原告诉讼请求对应到具体法条，并将法条拆解为构成要件。

操作路径：
1. 诉讼请求识别
2. 对应法条查找
3. 构成要件拆解
4. 证明事实对照
5. 举证责任分配

## 第三层：对抗性问题提炼

此部分需要把握双方当事人在事实认定和法律适用上的实质分歧。

分析步骤：
1. 研读对方当事人的答辩意见、抗辩理由及质证意见
2. 制作对照表，将原告主张、被告反驳及双方证据逐一对应
3. 分析对方是否提出积极抗辩事由
4. 检视双方在法律适用上是否存在理解分歧

## 案件材料清单

{materials_list}

## 多方诉辩意见对照表

{parties_table}

## 争议焦点总结

请根据案件材料完成上述三个层次的分析，并在此总结核心争议焦点。

"""

    # 生成材料列表（按来源分类）
    materials_list = ""

    for source, files in material_sources.items():
        materials_list += f"### {source}\n"
        for i, file in enumerate(files, 1):
            file_name = os.path.basename(file)
            materials_list += f"{i}. {file_name}\n"
        materials_list += "\n"

    # 生成多方诉辩意见对照表
    parties_table = """
| 争议点 | 原告方主张 | 被告方主张 | 相关证据 |
|--------|------------|------------|----------|
|        |            |            |          |
|        |            |            |          |
|        |            |            |          |
"""

    # 填充模板
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    focus_content = focus_template.format(
        case_name=case_name,
        current_date=current_date,
        materials_list=materials_list,
        parties_table=parties_table
    )

    # 写入文件
    with open(focus_file, 'w', encoding='utf-8') as f:
        f.write(focus_content)

    print(f"✅ 争议焦点分析文件已创建: {focus_file}")
    print("请按照三层次争议焦点识别方法论完成分析。")
    return True

# 未实现的命令
def not_implemented(command, case_name=None):
    print(f"命令 \"{command}\" 尚未实现")
    if case_name:
        print(f"案件: \"{case_name}\"")
    print(f"请在 \"{COMMAND_SYSTEM_DIR}\" 目录中创建对应的实现脚本")

# 处理用户输入
def process_input(user_input):
    # 处理退出命令
    if user_input.lower() in ["退出", "exit", "quit", "q"]:
        print("感谢使用法律工程系统，再见！")
        sys.exit(0)

    # 处理帮助命令
    if user_input.lower() in ["帮助", "help", "h", "?"]:
        show_commands()
        return

    # 处理清屏命令
    if user_input.lower() in ["清屏", "clear", "cls"]:
        clear_screen()
        show_commands()
        return

    # 启动服务器
    if re.match(r"启动服务器", user_input):
        print("正在启动本地服务器...")
        start_server()
        return

    # 处理新建案件指令
    match = re.match(r"新建案件(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 创建新案件 \"{case_name}\"")
        create_case(case_name)
        return

    # 处理查看案件列表指令
    if re.match(r"查看案件列表", user_input):
        print("执行: 查看案件列表")
        list_cases()
        return

    # 处理选择案件指令
    match = re.match(r"选择案件：(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 选择案件 \"{case_name}\"")
        select_case(case_name)
        return

    # 处理分析案件材料指令
    match = re.match(r"分析案件材料：(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 分析案件材料 \"{case_name}\"")
        not_implemented("分析案件材料", case_name)
        return

    # 处理识别争议焦点指令
    match = re.match(r"识别争议焦点(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 识别争议焦点 \"{case_name}\"")
        identify_dispute_focus(case_name)
        return

    # 处理生成检索关键词指令
    match = re.match(r"生成检索关键词：(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 生成检索关键词 \"{case_name}\"")
        not_implemented("生成检索关键词", case_name)
        return

    # 处理启动律师角色指令
    match = re.match(r"启动律师角色：(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 启动律师角色 \"{case_name}\"")
        not_implemented("启动律师角色", case_name)
        return

    # 处理生成诉讼策略指令
    match = re.match(r"生成诉讼策略：(.*)", user_input)
    if match:
        case_name = match.group(1)
        print(f"执行: 生成诉讼策略 \"{case_name}\"")
        not_implemented("生成诉讼策略", case_name)
        return

    # 处理起草法律文书指令
    match = re.match(r"起草(.*?)：(.*)", user_input)
    if match:
        doc_type = match.group(1)
        case_name = match.group(2)
        print(f"执行: 起草{doc_type} \"{case_name}\"")
        not_implemented(f"起草{doc_type}", case_name)
        return

    # 如果没有匹配任何已知指令
    print(f"无法识别的指令: {user_input}")
    print("请查看上面的可用指令列表")

# 处理命令行参数
def handle_args():
    if len(sys.argv) > 1:
        # 将所有参数合并为一个指令
        user_input = " ".join(sys.argv[1:])
        process_input(user_input)
        return True
    return False

# 主函数
def main():
    # 如果有命令行参数，处理后退出
    if handle_args():
        return

    # 否则启动交互式模式
    clear_screen()
    print("=" * 50)
    print("欢迎使用法律工程系统")
    print("=" * 50)

    # 直接显示所有可用指令
    show_commands()

    try:
        while True:
            try:
                user_input = input("\n法律工程> ").strip()
                if user_input:
                    process_input(user_input)
            except KeyboardInterrupt:
                print("\n输入 \"退出\" 退出系统")
                continue
            except Exception as e:
                print(f"错误: {e}")
    except SystemExit:
        pass

if __name__ == "__main__":
    main()
