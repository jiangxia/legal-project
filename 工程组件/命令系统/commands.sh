#!/bin/bash

# 法律工程系统命令处理入口
# 该脚本处理从index.md调用的所有命令

# 获取当前脚本所在目录
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
BASE_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
CASES_DIR="$BASE_DIR/案例"

# 显示用法说明
show_usage() {
    echo "法律工程系统命令处理器"
    echo ""
    echo "用法:"
    echo "  ./commands.sh <命令> [参数...]"
    echo ""
    echo "可用命令:"
    echo "  create_case <案件名称>     - 创建新案件"
    echo "  list_cases                - 列出所有案件"
    echo "  select_case <案件名称>     - 选择并进入案件目录"
    echo "  analyze_evidence <案件名称> - 分析案件材料"
    echo "  identify_issues <案件名称>  - 识别争议焦点"
    echo "  generate_keywords <案件名称> - 生成检索关键词"
    echo "  start_lawyer_mode <案件名称> - 启动律师角色"
    echo "  generate_strategy <案件名称> - 生成诉讼策略"
    echo "  draft_document <文书类型> <案件名称> - 起草法律文书"
    echo ""
}

# 如果没有参数，显示用法说明
if [ $# -eq 0 ]; then
    show_usage
    exit 0
fi

# 获取命令名
COMMAND="$1"
shift  # 移除第一个参数（命令名）

# 确保案例目录存在
mkdir -p "$CASES_DIR"

# 根据命令名执行对应的脚本
case "$COMMAND" in
    "create_case")
        "$SCRIPT_DIR/create_case.sh" "$@"
        ;;
    "list_cases")
        # 列出所有案件目录
        echo "案件列表:"
        find "$CASES_DIR" -maxdepth 1 -type d -name "案件：*" | while read -r case_dir; do
            case_name=$(basename "$case_dir" | sed 's/案件：//')
            echo "- $case_name"
        done
        ;;
    "select_case")
        if [ $# -eq 0 ]; then
            echo "错误: 缺少案件名称参数"
            echo "用法: select_case <案件名称>"
            exit 1
        fi

        CASE_NAME="$1"
        CASE_DIR="$CASES_DIR/案件：$CASE_NAME"

        if [ ! -d "$CASE_DIR" ]; then
            echo "错误: 案件 \"$CASE_NAME\" 不存在"
            exit 1
        fi

        echo "已选择案件: \"$CASE_NAME\""
        echo "案件路径: $CASE_DIR"
        echo "请使用 cd \"$CASE_DIR\" 进入案件目录"
        ;;
    # 以下命令尚未实现，显示占位消息
    "analyze_evidence"|"identify_issues"|"generate_keywords"|"start_lawyer_mode"|"generate_strategy"|"draft_document")
        echo "命令 \"$COMMAND\" 尚未实现"
        echo "请在 \"$SCRIPT_DIR\" 目录中创建对应的实现脚本"
        ;;
    *)
        echo "错误: 未知命令 \"$COMMAND\""
        show_usage
        exit 1
        ;;
esac

exit 0
