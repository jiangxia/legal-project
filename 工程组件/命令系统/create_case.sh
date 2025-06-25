#!/bin/bash

# 创建新案件命令实现
# 用法: ./create_case.sh "案件名称"

# 检查参数
if [ $# -ne 1 ]; then
    echo "错误: 请提供案件名称"
    echo "用法: ./create_case.sh \"案件名称\""
    exit 1
fi

# 获取参数
CASE_NAME="$1"
BASE_DIR="$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")"
CASES_DIR="$BASE_DIR/案例"
TEMPLATE_DIR="$CASES_DIR/案件：示例案件"
NEW_CASE_DIR="$CASES_DIR/案件：$CASE_NAME"

# 确保案例目录存在
mkdir -p "$CASES_DIR"

# 检查目标目录是否已存在
if [ -d "$NEW_CASE_DIR" ]; then
    echo "错误: 案件 \"$CASE_NAME\" 已存在"
    exit 1
fi

# 复制示例案件目录
echo "正在创建案件: \"$CASE_NAME\"..."
cp -r "$TEMPLATE_DIR" "$NEW_CASE_DIR"

# 更新README.md文件
README_FILE="$NEW_CASE_DIR/README.md"
if [ -f "$README_FILE" ]; then
    # 生成新的案件编号
    # 简单方式：使用当前时间戳最后6位
    CASE_ID="CASE$(date +%s | tail -c 7)"
    CURRENT_DATE=$(date +%Y-%m-%d)

    # 替换README中的案件信息
    sed -i.bak "s/示例案件/$CASE_NAME/g" "$README_FILE"
    sed -i.bak "s/CASE001/$CASE_ID/g" "$README_FILE"
    sed -i.bak "s/2023-06-25/$CURRENT_DATE/g" "$README_FILE"

    # 清理备份文件
    rm -f "$README_FILE.bak"

    echo "更新案件信息完成"
fi

echo "✅ 案件 \"$CASE_NAME\" 创建成功！"
echo "案件路径: $NEW_CASE_DIR"

# 更新主索引文件中的案件列表
# 此功能需要更复杂的实现，这里仅作为提示
echo "提示: 请手动更新index.md中的案件列表"

exit 0
