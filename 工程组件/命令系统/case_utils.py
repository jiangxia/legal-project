#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
案件通用功能模块
"""

import os
import glob

def get_case_path(base_dir, cases_dir, case_name):
    """
    获取案件路径（支持多种目录命名格式）

    参数:
        base_dir: 法律工程系统根目录
        cases_dir: 案例目录
        case_name: 案件名称

    返回:
        str: 案件路径，如果找不到则返回None
    """
    # 尝试多种可能的路径格式
    possible_paths = [
        os.path.join(cases_dir, f"案件：{case_name}"),  # 带"案件："前缀
        os.path.join(cases_dir, case_name),            # 无前缀
        os.path.join(base_dir, "案例", case_name)      # 绝对路径
    ]

    for path in possible_paths:
        if os.path.isdir(path):
            return path

    return None

def list_cases(cases_dir):
    """
    列出所有案件

    参数:
        cases_dir: 案例目录
    """
    print("案件列表:")
    # 查找带"案件："前缀的目录
    case_dirs = glob.glob(os.path.join(cases_dir, "案件：*"))
    # 查找无前缀的目录（排除"案件："前缀的目录）
    direct_cases = [d for d in glob.glob(os.path.join(cases_dir, "*"))
                  if os.path.isdir(d) and not os.path.basename(d).startswith("案件：")]

    case_dirs.extend(direct_cases)

    if not case_dirs:
        print("  (暂无案件)")
        return

    for case_dir in case_dirs:
        case_name = os.path.basename(case_dir).replace("案件：", "")
        print(f"- {case_name}")

def select_case(base_dir, cases_dir, case_name):
    """
    选择案件

    参数:
        base_dir: 法律工程系统根目录
        cases_dir: 案例目录
        case_name: 案件名称

    返回:
        bool: 是否选择成功
    """
    if not case_name:
        print("错误: 缺少案件名称参数")
        return False

    case_dir = get_case_path(base_dir, cases_dir, case_name)

    if not case_dir:
        print(f"错误: 案件 \"{case_name}\" 不存在")
        return False

    print(f"已选择案件: \"{case_name}\"")
    print(f"案件路径: {case_dir}")
    print(f"请使用 cd \"{case_dir}\" 进入案件目录")
    return True
