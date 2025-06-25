#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
创建案件功能模块
"""

import os
import time
import shutil
import datetime

def create_case(base_dir, cases_dir, case_name):
    """
    创建新案件

    参数:
        base_dir: 法律工程系统根目录
        cases_dir: 案例目录
        case_name: 案件名称

    返回:
        bool: 是否创建成功
    """
    if not case_name:
        print("错误: 请提供案件名称")
        return False

    # 确保案例目录存在
    os.makedirs(cases_dir, exist_ok=True)

    template_dir = os.path.join(cases_dir, "案件：示例案件")
    new_case_dir = os.path.join(cases_dir, f"案件：{case_name}")

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
        print(f"创建案件失败: {str(e)}")
        return False
