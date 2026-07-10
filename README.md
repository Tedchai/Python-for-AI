# Python for AI Research 互动网页课件

[English](#python-for-ai-research-interactive-web-deck)

这是一个面向 **Python for AI Research** 课程的互动网页课件仓库。课程从 Python 基础出发，逐步覆盖控制流、函数、列表、元组、字典等核心概念，并通过浏览器内 Python 实验、随堂测验和项目练习，把编程能力连接到 AI 科研入门场景。

本仓库同时提供中文和英文两套课程入口：

- 中文课程：`/python-ai/`
- English course: `/python-ai-en/`

在线部署入口：

- GitHub Pages: `https://tedchai.github.io/Python-for-AI/`

## 功能特点

- 互动网页课件：每节课都是可在浏览器中打开的演示页面。
- 随堂测验：学生可以在课件中直接答题并看到反馈。
- 浏览器 Python 实验：基于 Pyodide，无需本地安装 Python 即可运行练习代码。
- 中英文课程版本：`python-ai` 与 `python-ai-en` 分别维护中文和英文课件。
- 可选 AI 助教：配置 Anthropic API key 后，可在实验页启用代码答疑能力。
- 可选语音讲解：可用 `narrate.js` 为课件生成逐页讲解音频。
- 多平台部署：支持 GitHub Pages、Netlify、Vercel 和 Render。

## 课程内容

当前已生成前 6 节课程：

| 课次 | 中文标题 | English Title |
|---|---|---|
| 01 | 课程导入与第一个 Python Notebook | Course Introduction and Your First Python Notebook |
| 02 | Python Control Flow | Python Control Flow |
| 03 | Python Functions | Python Functions |
| 04 | Python Lists and 2D Lists | Python Lists and 2D Lists |
| 05 | Python Tuples and Unpacking | Python Tuples and Unpacking |
| 06 | Python Dictionaries and Word Frequency | Python Dictionaries and Word Frequency |

课程目录和首页信息由 `catalog.json` 与 `build.js` 生成。仓库中的课程规划目标是 15 节课，后续课程可继续在 `build.js` 中扩展并注册。

## 快速开始

需要 Node.js 18 或更高版本。

```bash
npm run build
npm run serve
```

启动后打开：

```text
http://localhost:3100/
http://localhost:3100/python-ai/lesson-01/
http://localhost:3100/python-ai-en/lesson-01/
```

本项目没有 npm 依赖包，`package.json` 中的脚本会直接调用仓库内的构建和服务文件。

## 常用命令

```bash
npm run build      # 重新生成首页和所有课件页面
npm run serve      # 启动本地服务器，默认端口 3100
npm run narrate    # 可选：生成语音讲解，需要额外配置
```

## 目录结构

```text
.
├── assets/                 # 全站 CSS 与前端交互脚本
├── data/                   # 本地评论等运行数据
├── python-ai/              # 中文课程生成页面
├── python-ai-en/           # 英文课程生成页面
├── 课件/                    # PowerPoint 原始课件
├── build.js                # 课程内容、组件与静态页面生成逻辑
├── catalog.json            # 课程目录数据
├── index.html              # 生成后的课程首页
├── narrate.js              # 可选语音讲解生成脚本
├── server.js               # 本地/Render 服务端，支持评论和 AI 助教
├── netlify.toml            # Netlify 静态部署配置
├── render.yaml             # Render 全功能服务部署配置
└── vercel.json             # Vercel 静态部署配置
```

## 编辑课程

主要编辑入口是 `build.js`：

- `CATALOG` 控制站点标题、课程列表、课程标题、标签和状态。
- `buildPythonClass01()` 到 `buildPythonClass06()` 生成当前中文课程页面。
- 英文课程页面位于 `python-ai-en/`，可通过构建流程继续维护。
- `DECK_BUILDERS` 注册哪些课程会被生成。

修改内容后运行：

```bash
npm run build
```

如果新增课程，请确保：

1. 在 `CATALOG` 中新增或更新对应 lesson。
2. 把课程状态设为 `"ready"`。
3. 在 `DECK_BUILDERS` 中注册对应构建函数。
4. 重新运行 `npm run build`。

## 可选 AI 功能

AI 助教和自动语音讲解需要 Anthropic API key。复制环境变量示例文件：

```bash
cp .env.example .env
```

然后填写：

```text
ANTHROPIC_API_KEY=sk-ant-...
```

说明：

- 不配置 key 时，课件、测验、导航和浏览器 Python 实验仍可正常使用。
- `server.js` 会在本地服务中启用评论与实验页 AI 助教。
- `narrate.js` 可生成逐页语音讲解。
- 静态托管平台如 GitHub Pages、Netlify、Vercel 不运行 Node 后端，因此评论和 AI 助教会自动降级或隐藏。

## 部署

### GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。在 GitHub 仓库中设置：

```text
Settings -> Pages -> Source -> GitHub Actions
```

之后每次 push 到 `main`，GitHub Actions 会自动运行 `node build.js` 并发布静态站点。

### Netlify

直接从 Git 导入仓库即可，`netlify.toml` 已配置：

```text
Build command: node build.js
Publish directory: .
```

### Vercel

导入项目即可，`vercel.json` 已配置：

```text
buildCommand: node build.js
outputDirectory: .
```

### Render

如果需要评论和 AI 助教等后端能力，可以使用 Render。仓库已提供 `render.yaml`：

- Build command: `node build.js`
- Start command: `node server.js`
- 可选环境变量：`ANTHROPIC_API_KEY`

## License

MIT

---

# Python for AI Research Interactive Web Deck

[简体中文](#python-for-ai-research-互动网页课件)

This repository contains an interactive web lecture deck for **Python for AI Research**. The course starts with Python fundamentals, then moves through control flow, functions, lists, tuples, dictionaries, browser-based coding labs, in-slide quizzes, and small research-oriented programming activities.

The repo includes both Chinese and English course paths:

- Chinese course: `/python-ai/`
- English course: `/python-ai-en/`

Live site:

- GitHub Pages: `https://tedchai.github.io/Python-for-AI/`

## Features

- Interactive browser-based lecture decks.
- In-slide quizzes with immediate feedback.
- Browser Python labs powered by Pyodide, with no local Python setup required.
- Chinese and English course versions.
- Optional AI teaching assistant for coding labs when an Anthropic API key is configured.
- Optional per-slide narration generated with `narrate.js`.
- Deployment-ready configuration for GitHub Pages, Netlify, Vercel, and Render.

## Course Content

The first 6 lessons are currently generated:

| Lesson | Title |
|---|---|
| 01 | Course Introduction and Your First Python Notebook |
| 02 | Python Control Flow |
| 03 | Python Functions |
| 04 | Python Lists and 2D Lists |
| 05 | Python Tuples and Unpacking |
| 06 | Python Dictionaries and Word Frequency |

The course roadmap targets a 15-class sequence. Additional lessons can be added in `build.js` and registered in `DECK_BUILDERS`.

## Quick Start

Requires Node.js 18 or newer.

```bash
npm run build
npm run serve
```

Then open:

```text
http://localhost:3100/
http://localhost:3100/python-ai/lesson-01/
http://localhost:3100/python-ai-en/lesson-01/
```

The project has no npm package dependencies. The npm scripts call the local build and server scripts directly.

## Scripts

```bash
npm run build      # Regenerate the home page and lesson pages
npm run serve      # Start the local server on port 3100 by default
npm run narrate    # Optional: generate narration audio after configuration
```

## Project Structure

```text
.
├── assets/                 # Shared CSS and client-side interaction scripts
├── data/                   # Runtime data such as local comments
├── python-ai/              # Generated Chinese course pages
├── python-ai-en/           # Generated English course pages
├── 课件/                    # Original PowerPoint decks
├── build.js                # Course content, components, and static page generation
├── catalog.json            # Course catalog data
├── index.html              # Generated course home page
├── narrate.js              # Optional narration generation script
├── server.js               # Local/Render backend for comments and AI assistant
├── netlify.toml            # Netlify static hosting config
├── render.yaml             # Render full server config
└── vercel.json             # Vercel static hosting config
```

## Editing Lessons

The main editing entry point is `build.js`:

- `CATALOG` controls the site title, course list, lesson metadata, tags, and status.
- `buildPythonClass01()` through `buildPythonClass06()` generate the current Chinese lessons.
- English pages are under `python-ai-en/` and can be maintained through the same build workflow.
- `DECK_BUILDERS` registers the lessons that should be generated.

After editing, run:

```bash
npm run build
```

When adding a new lesson:

1. Add or update the lesson in `CATALOG`.
2. Set its status to `"ready"`.
3. Register its build function in `DECK_BUILDERS`.
4. Run `npm run build`.

## Optional AI Features

The AI assistant and automatic narration require an Anthropic API key. Copy the example environment file:

```bash
cp .env.example .env
```

Then set:

```text
ANTHROPIC_API_KEY=sk-ant-...
```

Notes:

- Without a key, slides, quizzes, navigation, and browser Python labs still work.
- `server.js` enables comments and the coding-lab AI assistant when served locally or on Render.
- `narrate.js` can generate per-slide narration audio.
- Static hosts such as GitHub Pages, Netlify, and Vercel do not run the Node backend, so comments and the AI assistant degrade gracefully or stay hidden.

## Deployment

### GitHub Pages

The repo includes `.github/workflows/deploy-pages.yml`. In the GitHub repo settings, choose:

```text
Settings -> Pages -> Source -> GitHub Actions
```

Every push to `main` will run `node build.js` and publish the static site.

### Netlify

Import the repository from Git. `netlify.toml` already configures:

```text
Build command: node build.js
Publish directory: .
```

### Vercel

Import the project. `vercel.json` already configures:

```text
buildCommand: node build.js
outputDirectory: .
```

### Render

Use Render if you want backend-powered comments and the AI assistant. `render.yaml` configures:

- Build command: `node build.js`
- Start command: `node server.js`
- Optional environment variable: `ANTHROPIC_API_KEY`

## License

MIT
