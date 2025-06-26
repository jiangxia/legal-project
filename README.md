# 法律工程系统

## 📋 系统简介

法律工程系统是一套智能化的法律案件管理与分析平台，帮助法律从业者高效处理各类案件，提供从证据收集、争议焦点分析到诉讼策略制定的全流程支持。

## 🚀 快速开始

### 安装

```bash
# 安装依赖
npm install

# 启动系统
npm start
```

### 基本使用

系统支持两种使用方式：

#### 1. 交互式命令行

```bash
npm start
```

启动后，直接输入以下命令（无需任何前缀）：

```
新建案件：合同纠纷案件
查看案件列表
选择案件：合同纠纷案件
分析案件：争议焦点
```

#### 2. 直接命令

```bash
node index.js 新建案件：合同纠纷案件
node index.js 查看案件列表
```

## 📝 常用命令

```
新建案件：<案件名称> [案件类型]  # 创建新案件，类型可选：民商事/刑事/行政/非诉
选择案件：<案件名称>            # 切换当前操作的案件
添加材料：<材料名称> <材料内容>   # 为当前案件添加材料
分析案件：<分析类型>            # 分析当前案件，类型根据案件类型不同而不同
生成文书：<文书类型>            # 生成法律文书
帮助                         # 显示帮助信息
退出                         # 退出系统
```

## 🔧 系统架构

```
法律工程/
├── src/                          # 源代码目录
│   ├── core/                     # 核心引擎（原"核心引擎"）
│   │   ├── ai-engine.js
│   │   ├── config-manager.js
│   │   └── document-processor.js
│   ├── commands/                 # 命令处理器（原"工程组件/命令系统"）
│   │   ├── index.js
│   │   ├── analyze-case.js
│   │   ├── create-case.js
│   │   ├── litigation-strategy.js
│   │   └── ...
│   └── utils/                   # 工具函数
│       ├── case-utils.js
│       └── file-utils.js
├── prompts/                     # AI提示词库（原"工程组件/提示词"）
│   ├── civil/                   # 民商事提示词
│   │   ├── dispute-focus.json
│   │   └── litigation-strategy.json
│   ├── criminal/                # 刑事提示词
│   ├── administrative/          # 行政提示词
│   └── non-litigation/          # 非诉提示词
├── cases/                       # 案例数据（原"案例"）
│   ├── case-template/           # 案件模板
│   └── [具体案件目录]/
├── config/                      # 配置文件
├── docs/                        # 文档
├── index.js                     # 主入口文件
├── package.json
└── .gitignore
```

## 📞 获取帮助

如有任何问题，请直接在系统中输入"帮助"命令，或查阅相关文档。
仍有问题，请加 V：gz_mingyi
