# Lesson 3–15 大模型知识点映射

## 结论

`dive-into-llms` 适合作为教师自学与课程选题参考，但不适合把原始实验按章节直接搬给当前高中生课堂。本课程保留既有的 Python → 数据分析 → 机器学习 → 科研项目主线，每节只加入一个能够用当堂语法或模型完成的 **LLM Bridge**。

所有学生示例均为 independently authored / independently rewritten：不复制外部仓库的 PPT、图片、Notebook 或大段代码。课程只保留专题启发、来源链接和适龄化后的独立实验设计。

截至 2026-08-28，仓库主页的顶层文件列表未显示明确的 `LICENSE` 文件（No clear top-level license was verified），因此课程按“来源可阅读、转载授权未确认”处理：可以学习思想并注明来源，不把外部材料重新打包发布。

## 逐课映射

| Lesson | 现有基础知识 | 写入课程的 LLM 知识点 | 学生可运行或提交的证据 | 参考专题 | 本课不做 |
|---:|---|---|---|---|---|
| 03 | list、dict、set | Prompt、examples、response 是一条结构化实验记录 | 一个包含输入、示例、回复和理由的字典 | [Chapter 2 · 提示学习](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter2) | API Key、真实付费调用 |
| 04 | NumPy、数组、向量化 | 用候选 token 分数模拟概率与 `argmax` 选择 | 概率向量、最高分 token、总和检查 | [Chapter 5 · 模型水印](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter5) | 声称该玩具代码等同真实 LLM |
| 05 | pandas、groupby | 每个 Prompt 策略必须成为可比较的一行实验数据 | zero-shot / few-shot 的正确率与延迟表 | [Chapter 2 · 提示学习](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter2) | 编造 API 结果 |
| 06 | 缺失值、重复值、清洗日志 | 微调或推理数据中的重复 Prompt、缺失 Target 与数据泄漏 | 清洗前后行数和决策记录 | [Chapter 1 · 微调与部署](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter1)、[Chapter 4 · 数学推理](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter4) | 实际微调大模型 |
| 07 | matplotlib / seaborn | Prompt 比较必须用同一测试集展示准确率与成本 | 一张策略对比图和一句证据边界 | [Chapter 2 · 提示学习](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter2) | 用一条精彩回答代替总体结果 |
| 08 | EDA、分布、关系 | 先做 LLM 错误分类，再讨论可能原因 | factual / format / refusal / safety 错误统计 | [Chapter 3 · 知识编辑评估](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter3)、[Chapter 10 · 智能体安全](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter10) | 从相关性直接推断模型内部原因 |
| 09 | sklearn、baseline、train/test | 安全分类首先要超过最频繁类别基线 | baseline 分数和类别分布 | [Chapter 10 · 智能体安全](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter10) | 自动执行 Agent 行为 |
| 10 | Linear Regression、MAE | 在控制条件下分析输出长度与延迟的关系 | 斜率、预测值和适用范围 | [Chapter 1 · 微调与部署](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter1) | 把小样本斜率当通用规律 |
| 11 | Logistic Regression、KNN、confusion matrix | safe / unsafe 是错误代价不对称的二分类 | 混淆矩阵和漏报解释 | [Chapter 10 · 智能体安全](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter10) | 把课堂标签称为安全认证 |
| 12 | Decision Tree、Random Forest | 用树深度与特征重要性检查风险分类捷径 | 树深度、特征重要性和过拟合说明 | [Chapter 10 · 智能体安全](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter10) | 真实系统写入或权限操作 |
| 13 | SVM、XGBoost、公平比较 | 防御性 Evaluator 必须在同一 held-out 测试集比较 | 固定 split、标签、指标和模型结果 | [Chapter 6 · 越狱评估](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter6) | 越狱攻击执行与有害 Prompt 生成 |
| 14 | 科研流程、可复现性、限制 | Prompt ablation：一次只改变一个因素，并检查副作用 | 实验矩阵、准确率、格式错误与限制 | [Chapter 2 · 提示学习](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter2)、[Chapter 3 · 知识编辑评估](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter3) | 用单次成功支撑结论 |
| 15 | 最终项目、报告、演示 | 一个问题、一个测试集、一个指标、一个风险控制、一个可审计 Claim | 项目合同、Notebook、结果表、限制和报告 | [Chapter 2 · 提示学习](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter2)、[Chapter 8 · 多模态](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter8)、[Chapter 10 · 智能体安全](https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter10) | 模型权重训练、GUI 控制、RLHF 训练 |

## 教师自学顺序

1. **先学 Chapter 2：提示学习与思维链。** 这是最容易转化为课堂可测实验的章节；重点学习 zero-shot、few-shot、Prompt 变量与重复测试，不要求学生保存任何 API Key。
2. **再学 Chapter 1：微调与部署。** 先理解数据、训练/验证/预测和 Demo 部署的流程，不急于运行重训练。
3. **学习 Chapter 3：知识编辑。** 重点吸收可靠性、通用性、局部性等评价问题，而不是直接操作大模型权重。
4. **学习 Chapter 8：多模态模型。** 用于最终项目选题和评价框架；课堂只使用教师提供、无隐私风险的输入。
5. **学习 Chapter 10：智能体安全。** 把风险标签、交互记录和防御性评估嫁接到分类课程；不连接真实账户或系统权限。
6. **最后阅读 Chapter 4、5、6、7、9、11。** 数学微调、水印、越狱、隐写、GUI Agent、RLHF 属于专题扩展；当前课程只吸收可以安全降阶的概念，不照搬原实验。

## 写入课件的结构规则

- Lesson 3–15 每节保持 15 张主幻灯片。
- 删除单独的 Agenda、可见时间表和重复 Course Map。
- 新增一张 `llm-bridge`：必须包含一个具体概念、一段可运行代码、一个运行前预测问题、一个适用边界。
- 外部来源仅写入讲者备注的 `[Sources]` 区块；学生可见代码均为本课程独立编写。
- LLM 是现有 Python/数据/机器学习知识的应用场景，不替代本课核心技能。
