# Python for AI Research

面向高中生与 AI 科研初学者的中英双语互动课程。课程以教师审核的 Kaggle 表格数据项目为主线，让学生在学习 Python、pandas、基础可视化和入门机器学习的过程中，逐步完成一个可复现的研究项目。

课程最终成果不是“保证发表的论文”，而是：

- 一份可以从上到下运行的 Kaggle Notebook；
- 一份清洗后的项目数据和处理日志；
- 3–5 张核心图表；
- 一个 DummyRegressor baseline 和一个 LinearRegression 模型；
- 一张使用 MAE 的模型评价表；
- 一篇 4–6 页、可以继续修改的 Draft Paper；
- 一份 5–8 页项目展示和后续 AI 论文课程修改清单。

**在线课程：** [GitHub Pages](https://tedchai.github.io/Python-for-AI/)

## 课程设计原则

- 15 次课，每次 120 分钟；75–105 分钟为 Kaggle 项目工作室，其中约 20 分钟用于学生独立操作，约 10 分钟用于教师巡检、个别反馈和统一纠错。
- 学生可以选择研究主题，但数据集、任务类型和技术范围由教师审核。
- 第一期开设统一的表格回归路径：DummyRegressor + LinearRegression + MAE。
- 每节只讲 1–2 个核心知识点，并直接应用到学生自己的 Kaggle 项目。
- 高级 NumPy、复杂模型、调参、SVM、XGBoost 和深度学习仅作为选讲。
- 论文中的方法、数字和图表必须能够追溯到项目 Notebook。
- Python 课程交付可信初稿；后续 AI 论文课负责文献、实验、引用和多轮修改。

## 15 节课程路线

| 节次 | 课程内容 | 项目成果 |
|---:|---|---|
| 1 | Kaggle、Notebook 与 Python 入门 | 项目 Notebook v0 |
| 2 | 条件、循环与数据质量 | 数据检查规则 |
| 3 | 函数、list 与 dict | Stage 1 项目卡模板 |
| 4 | **Stage 1：Kaggle 选题与项目启动** | 问题、链接、许可、数据字典、Notebook v1 |
| 5 | pandas 读取、查看与筛选 | Data Overview |
| 6 | 数据清洗与决策日志 | clean.csv、cleaning_log.csv |
| 7 | 可视化、简单统计与数据观察 | 三张图和三条观察 |
| 8 | **Stage 2：数据处理与 EDA 检查点** | 清洁数据、EDA、修订后的问题 |
| 9 | 特征、目标、训练集与 Baseline | DummyRegressor 与 baseline MAE |
| 10 | 一个简单模型：线性回归 | LinearRegression 与预测结果 |
| 11 | MAE、错误分析与公平比较 | 两行模型评价表和错误分析 |
| 12 | **Stage 3：建模与结果检查点** | 可复现模型证据包 |
| 13 | 从代码到 Method 与 Results | Method、Results、Limitations 初稿 |
| 14 | Draft Paper 写作工作坊 | 4–6 页 Draft Paper v1 和 PPT 初稿 |
| 15 | **Stage 4：Draft Paper 展示与 AI 论文课衔接** | Draft Paper v2、Notebook、PPT、修改清单 |

课程采用“3 节共同技能 + 1 个项目 Stage”的穿插结构。由于总课次为 15，最后一个周期使用 2 节论文准备课加 Stage 4。

## 仓库与重构边界

本仓库已经包含 15 套中文、15 套英文 Reveal.js 课件，以及共享生成器、Pyodide 浏览器实验、课程导航、语言切换、测验、讲者备注、项目页、Word 大纲与 GitHub Pages 部署。当前工作属于结构化重构，不是从零重做，也不是手工维护 1050 个页面。

- 保留现有技术栈、视觉系统、导航与互动组件；课程事实以 `scripts/kaggle-course.js` 为共享来源。
- 中文和英文共用课程编号、课型、Stage、时长、产出、项目动作、论文证据、页面 ID、页面类型与顺序；主要英文内容由明确的双语字段提供，不依赖批量字符串替换。
- 知识课与 Stage 检查课使用两类模板。Stage 课可把概念页替换为研究问题检查、学生代码解释、教师反馈、修改记录和 Stage Rubric，但仍保持 33–37 页及稳定的跨语言页面 ID。
- 浏览器 Pyodide 实验只用于无文件的小型语法、追踪、DataFrame、调试与 MAE 练习；完整数据读取、项目文件和最终输出只在 Kaggle Notebook 运行。
- 构建成功只说明文件生成成功，不代表内容已完成教学审查、浏览器实测或 Word 视觉质检。

## Kaggle 候选登记表

第一期只允许从教师最终确认的数据集中选择。下列条目目前均为 `pending manual review`，不应在完成文件名、文件大小、字段、缺失值、来源和许可证复核之前称为正式白名单：

1. [Student Performance (Multiple Linear Regression)](https://www.kaggle.com/datasets/nikhil7280/student-performance-multiple-linear-regression) — `pending manual review`；页面可确认作者、合成数据说明、10,000 行、目标与许可说明，CSV 文件名、大小及缺失值摘要仍待确认。
2. [Student Academic Performance Dataset](https://www.kaggle.com/datasets/aryancodes12fyds/student-academic-performance-dataset) — `pending manual review`；页面可确认 250 行、12 列、CC0、CSV 名称和无缺失说明，发布者显示名、精确字段名和 CSV 独立大小仍待确认。
3. [Energy Consumption Dataset - Linear Regression](https://www.kaggle.com/datasets/govindaramsriram/energy-consumption-dataset-linear-regression) — `pending manual review`；页面可确认作者、回归主题和 CC BY 4.0，来源、文件、规模与缺失值仍待确认。
4. [Study Hours and Student Scores for Linear Regression](https://www.kaggle.com/datasets/douaabennoune/study-hours-student-scores-for-linear-regression) — `pending manual review`；页面可确认作者、100 行、2 列、随机生成与 CC0，CSV 文件名、大小和缺失值仍待确认。

完整字段记录位于 `scripts/kaggle-course.js`。每期开课前必须更新核验日期，并重新确认页面可访问性、原始来源、发布者、许可证、文件名、文件大小、行列数、目标、允许/排除字段、缺失值、隐私伦理与高中适配性。学生必须在 Notebook 和 Draft Paper 中记录数据集 URL、许可证和访问日期。

## 每节课的 35 页、120 分钟模板

每节网页课件统一为 35 页教学主线，新增页面用于有效练习和项目推进，不重复堆叠知识点：

1. 标题与两个技能；
2. 当堂产出；
3. 三块课堂Agenda；
4. 120分钟节奏与短休息；
5. 前置复习；
6. Kaggle与Draft Paper位置；
7. 学生数据字段情境；
8. Warm-up；
9. 两个术语；
10–12. 两个核心概念；
13–15. Python模式、教师演示和代码追踪；
16. Prediction Check；
17–18. 两轮Guided Practice；
19. Guided Lab；
20–21. 常见错误和固定调试流程；
22. 独立检查点；
23. 项目四行计划；
24–25. Kaggle项目任务与Starter；
26. 20分钟独立项目工作室；
27. Challenge Ladder；
28. Concept Check；
29. Notebook到Draft Paper证据交接；
30. Notebook整理；
31. AI使用与科研诚信；
32. Rubric；
33. 作业与提交检查；
34. Buffer/Catch-up；
35. Exit Ticket。

Stage 1–4（第 4、8、12、15 课）使用检查课模板：Stage 目标、当前材料、Review Criteria、学生代码解释、教师追问、项目风险、修改时间、Stage Rubric、提交检查和下一 Stage Gate。Stage 课不必重复所有概念页，但必须保留当堂产出、项目位置、学生工作时间、教师 Review、Notebook 整理、科研诚信、论文证据与 Exit Ticket。

## 固定回归技术路径

第一期必修路径固定为：

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
baseline = DummyRegressor(strategy="mean")
model = LinearRegression()
mae = mean_absolute_error(y_test, predictions)
```

较低 MAE 更好；Baseline 与线性模型必须使用同一拆分和同一指标。测试集不参与训练、特征选择、清洗决定或目标值填补。优先使用少量数值特征；若必须使用类别字段，只采用教师提供的固定预处理。核心课程不用 `model.score()`，不用分类代码或混淆矩阵，也不把回归系数解释为因果。

## Draft Paper 标准

Draft Paper 建议控制在 4–6 页，包含：

1. Title
2. Abstract
3. Introduction
4. Research Question
5. Dataset and Variables
6. Data Processing
7. Method
8. Results
9. Discussion
10. Limitations
11. Conclusion
12. References
13. Kaggle Dataset 与 Notebook 链接

合格标准是结构完整、数据来源清楚、代码可以复现、数字与 Notebook 一致、学生能够解释，并且结论不超过数据能够支持的范围。

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

## 修改与验证

主要课程数据位于 `scripts/kaggle-course.js`，网页生成与课堂模板位于 `scripts/build.js`。修改后运行 `npm run validate`。自动校验覆盖双语课次、页数、跨语言页面 ID、120 分钟、Stage 位置与编号、产出/项目动作/论文证据、练习与独立时间、Notebook 整理、科研诚信、固定回归栈、README 顺序和 Word 大纲源顺序。

以下工作仍需人工完成：浏览器 Run/输出/报错实测；第 1、4、9、15 课教学抽查；Kaggle 文件与许可核验；Word 全页视觉检查。结构校验通过不等于完整教学审查通过。

人工检查还包括：

1. 中文和英文是否保持相同的 15 节顺序与 35 页结构；
2. Stage 是否位于第 4、8、12、15 节；
3. 每节是否只包含两个核心概念；
4. Kaggle 动作和 Draft Paper 去向是否明确；
5. Notebook 代码能否从上到下理解和运行；
6. 课程导航、语言切换和 Overview 是否正常。

推送到 `main` 后，GitHub Actions 会构建并发布 GitHub Pages。生成的 `python-ai/`、`python-ai-en/`、`index.html` 和 `catalog.json` 不提交到 Git。

## English

This repository contains a bilingual, Kaggle-centered, 15-class Python research course for high-school students. Students choose from an instructor-maintained candidate registry only after manual pre-class verification, apply a shared Python workflow to their own topic, and finish with a runnable notebook, model evidence, a 4–6 page Draft Paper, and a handoff plan for a follow-on AI paper-writing course.

## License

MIT
