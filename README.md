# Python for AI Research

面向高中生与AI科研初学者的中英双语互动课程。课程从Python基础开始，逐步进入数据分析、机器学习评价与完整科研项目。

**在线课程：** [GitHub Pages](https://tedchai.github.io/Python-for-AI/)

## 课程特点

- 中文、英文各15节，每节约2小时
- 浏览器内Python实验（Pyodide），无需本地安装
- 随堂测验、分层挑战、Debug流程与项目作业
- 适配线上教学：聊天框、表单、麦克风、屏幕共享与教师巡检
- 每课支持上一课/下一课、指定页跳转、35页总览及中英文同页切换
- 高级算法为选讲；必修重点是会运行、会比较、会解释

## 15节课程路线

| 阶段 | 课次 | 内容 |
|---|---:|---|
| Python基础 | 1–4 | Colab、基础语法、控制流、函数、文件读写、科研数据结构 |
| 数据分析 | 5–8 | NumPy、pandas、数据清洗、可视化与EDA |
| 机器学习 | 9–10 | sklearn工作流、Baseline、模型评价与算法选择 |
| 科研项目 | 11–14 | 研究问题、数据处理、建模、评价与IMRaD报告 |
| 成果展示 | 15 | 最终报告、Notebook、PPT展示与Q&A |

完整课程大纲见 [docs/course-outline.docx](docs/course-outline.docx)。

## 本地运行

需要Node.js 18或更高版本。

```bash
npm run build
npm run serve
```

打开：

- 课程首页：`http://localhost:3100/`
- 中文第1课：`http://localhost:3100/python-ai/lesson-01/`
- English Class 01：`http://localhost:3100/python-ai-en/lesson-01/`

## 项目结构

```text
.
├── .github/workflows/   # GitHub Pages自动部署
├── assets/              # 全站样式与交互脚本
├── docs/                # 课程大纲等文档
├── python-ai/           # 中文生成页面
├── python-ai-en/        # 英文生成页面
├── build.js             # 课程内容与页面生成器
├── catalog.json         # 生成后的课程目录
├── server.js            # 本地服务、评论与可选AI助教
└── narrate.js           # 可选语音讲解生成器
```

## 修改课程

主要编辑入口是`build.js`。修改后运行：

```bash
npm run build
```

请同时检查：

1. 中文和英文标题、目标、实验与作业是否对应。
2. Notebook代码能否从上到下运行。
3. 线上互动是否不依赖学生结对。
4. 每课导航、Overview与语言切换是否正常。

## 部署

推送到`main`后，GitHub Actions会运行`node build.js`并发布GitHub Pages。仓库也包含Netlify、Vercel和Render配置。

评论、AI助教和自动语音讲解属于可选功能；未配置API密钥时，课程、测验、导航和浏览器Python实验仍可正常使用。

## English

This repository contains a bilingual 15-class online course for high-school students and beginning AI researchers. It covers Python, data analysis, introductory machine learning, research workflow, reproducibility, and a final project. Run `npm run build` and `npm run serve` for local development.

## License

MIT
