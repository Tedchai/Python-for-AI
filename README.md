# Python for AI Research

面向 8–12 年级高中生、大学本科生与 AI 科研初学者的中英双语互动课程。第 1、2 课采用 120 分钟完整课堂设计，后续课程目前保留 60 分钟版本并逐步按同一标准扩充。课程把 Python 基础、数据处理、可视化、机器学习和最终 AI 科研项目连接成一条连续学习路径。

**在线课程：** [GitHub Pages](https://tedchai.github.io/Python-for-AI/)

## 课程主线

学生不是孤立地背语法或算法，而是在每节课保存一个可见成果，并逐步完成：

研究问题 → 数据集 → 数据处理 → 可视化与 EDA → 模型训练与比较 → 结果分析 → 报告、代码与 PPT 展示

完成课程后，学生应能提交：

- 一份可以从上到下运行的 notebook；
- 数据来源、变量字典和清洗决策记录；
- 3–5 张支持研究问题的核心图表；
- 回归、分类、树模型、SVM 与 XGBoost 的实验记录和公平比较；
- 一份短报告或论文草稿；
- 一份清楚说明问题、方法、结果、限制与下一步的展示 PPT。

## 五个阶段与 15 次课

| 阶段 | 课次 | 课程内容 | 课堂/课后成果 |
|---|---:|---|---|
| Python 基础入门 | 1 | Python Basics & Kaggle Notebook | 第一个可运行 notebook |
| Python 基础入门 | 2 | Python Control Structures | 数据判断与边界测试任务 |
| Python 基础入门 | 3 | Python Data Structures | 数据字典和样本记录表 |
| 数据处理与分析 | 4 | NumPy for Scientific Computing | 可复现模拟与统计计算 |
| 数据处理与分析 | 5 | pandas for Data Analysis | 真实数据基础统计摘要 |
| 数据处理与分析 | 6 | Data Cleaning | clean dataset 与清洗日志 |
| 数据可视化与 EDA | 7 | Data Visualization | 三张核心图和证据观察 |
| 数据可视化与 EDA | 8 | Exploratory Data Analysis (EDA) | 一页 EDA 小报告和研究问题 |
| 机器学习建模 | 9 | Machine Learning with Scikit-learn | 第一个 sklearn 模型与完整流程 |
| 机器学习建模 | 10 | Linear Regression | 连续值预测、指标表和误差图 |
| 机器学习建模 | 11 | Classification: Logistic Regression & KNN | 两个分类器和混淆矩阵 |
| 机器学习建模 | 12 | Decision Tree & Random Forest | 树/森林结果、重要性与过拟合检查 |
| 机器学习建模 | 13 | SVM & XGBoost | 至少三个模型的统一对比表 |
| AI 科研项目实战 | 14 | AI Research Workflow | 项目 v1：notebook、结果图和实验表 |
| AI 科研项目实战 | 15 | Final AI Research Project | 报告/论文、代码和 PPT 展示 |

## 课程时长与页面结构

第 1、2 课各包含 36 个主要页面，按照 120 分钟课堂组织，而不是把原有 17 页简单拉长。扩充内容包括：

1. 目标、成果、课堂主线和 120 分钟节奏；
2. Kaggle Notebook 打开、复制、运行、保存与版本管理；
3. 术语、心智模型和三个核心知识点；
4. 代码模式、完整示范、逐行追踪和 Prediction Check；
5. 两轮 Guided Practice 与 Kaggle Notebook Guided Lab；
6. 常见错误、固定 Debug 流程和独立 Checkpoint；
7. Project Plan、Project Brief、Kaggle Project Lab 与 20 分钟独立操作；
8. 分层挑战、Concept Check、Research Log 证据交接；
9. Notebook 整理、科研诚信、评价、作业、缓冲和 Exit Ticket。

第 1、2 课建议节奏：

- 0–10 分钟：目标、成果与 Kaggle 环境确认；
- 10–30 分钟：术语、心智模型和三个核心概念；
- 30–50 分钟：完整示范、代码追踪与预测；
- 50–70 分钟：两轮跟做和 Kaggle Guided Lab；
- 70–75 分钟：短休息；
- 75–105 分钟：项目计划、Kaggle Project Lab、20 分钟学生独立操作与教师巡检；
- 105–120 分钟：挑战、证据保存、Notebook 整理、评价和 Exit Ticket。

所有课堂代码操作以 Kaggle Notebook 为准。课件负责呈现知识、任务和检查点，不提供浏览器内 Run 按钮。第 3–15 课目前仍采用 17 页、60 分钟结构，后续可按相同的 120 分钟框架继续扩充。

## 教学与评价原则

- 每节课必须有一个可见成果、一个科研能力点和一个 Python/AI 工具训练。
- 每段代码都服务于数据、模型、实验记录或研究表达。
- 基础任务人人完成；进阶挑战只在基础成果完成后进行。
- 不以模型复杂或代码行数作为主要评价标准。
- 学生必须能解释自己提交的代码、图表和模型结果。
- 可以用 AI 解释概念、生成练习、辅助 debug 和润色表达，但不得伪造事实、引用、代码归属或实验结果。
- 外部数据必须记录来源、许可、访问日期、变量含义和使用限制。

课程评价建议：

- 每周课堂成果与 notebook：25%；
- 数据处理与 EDA：25%；
- 模型与实验：30%；
- 最终报告与展示：20%。

## 仓库结构

- `scripts/build.js`：课程页面、互动组件和15课内容母版；
- `scripts/course-validator.js`：课程结构和生成结果校验；
- `scripts/lab-smoke-test.js`：代表性浏览器实验静态检查；
- `scripts/server.js`：本地预览与服务端功能；
- `docs/`：课程大纲与配套视觉资料；
- `python-ai/`、`python-ai-en/`、`index.html`、`catalog.json`：构建生成文件，不提交到 Git。

## 本地运行

需要 Node.js 18 或更高版本：

```bash
npm run build
npm run validate
npm run serve
```

打开：

- 课程首页：`http://localhost:3100/`
- 中文第 1 课：`http://localhost:3100/python-ai/lesson-01/`
- English Class 01：`http://localhost:3100/python-ai-en/lesson-01/`

## 修改与发布

主要内容在 `scripts/build.js`。修改后运行 `npm run validate`，确认：

- 中文和英文均有 15 课；
- 课程顺序与五阶段大纲一致；
- 第 1、2 课各生成 36 个主要页面并标注 120 分钟节奏；
- 第 1、2 课的 Guided Lab 和 Project Lab 均以 Kaggle Notebook 为唯一运行环境；
- 第 3–15 课各生成 17 个主要页面并保留 60 分钟节奏；
- 页面包含 Prediction Check、科研项目连接、科研诚信、作业和 Exit Ticket；
- 课程导航、语言切换和返回主页功能仍然存在；逐页朗读暂未启用。

推送到 `main` 后，GitHub Actions 会构建并发布 GitHub Pages。

## English

This repository contains a bilingual 15-class Python for AI Research course. Classes 1 and 2 are expanded to 120 minutes and 36 slides each, with all practical work completed in Kaggle Notebook. Classes 3–15 currently retain the 60-minute structure and can be expanded through the same framework. Students move from Python foundations through data processing, visualization, EDA, regression, classification, tree models, SVM, and XGBoost before completing a reproducible AI research project with a report, code, figures, and presentation.

## License

MIT
