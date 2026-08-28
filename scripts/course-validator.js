"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const failures = [];
let passed = 0;
const cjkPattern = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/u;
const check = (condition, message) => {
  if (condition) passed += 1;
  else failures.push(message);
};
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const expectedTitles = [
  "Python Basics & Kaggle Notebook",
  "Python Control Structures",
  "Python Data Structures",
  "NumPy for Scientific Computing",
  "pandas for Data Analysis",
  "Data Cleaning",
  "Data Visualization",
  "Exploratory Data Analysis (EDA)",
  "Machine Learning with Scikit-learn",
  "Linear Regression",
  "Classification: Logistic Regression & KNN",
  "Decision Tree & Random Forest",
  "SVM & XGBoost",
  "AI Research Workflow",
  "Final AI Research Project",
];

const requiredSlideIds = [
  "title", "outcomes", "llm-bridge", "warmup", "concept-1", "concept-2",
  "syntax-pattern", "prediction-check",
  "guided-practice", "main-lab", "debug-routine", "project-connection",
  "challenge-ladder", "homework", "exit-ticket",
];

const llmBridgeChecks = {
  3: ["A prompt experiment is structured Python data", "documents/chapter2"],
  4: ["A toy token choice begins with a score vector", "documents/chapter5"],
  5: ["Prompt strategies become comparable when every trial is a row", "documents/chapter2"],
  6: ["Model training starts with auditable data cleaning", "documents/chapter4"],
  7: ["A prompt comparison needs a figure, not a favorite example", "documents/chapter2"],
  8: ["LLM errors need categories before they need explanations", "documents/chapter3"],
  9: ["An LLM safety classifier needs a baseline before a complex model", "documents/chapter10"],
  10: ["Inference latency is a measurable outcome, not a vague impression", "documents/chapter1"],
  11: ["Safe versus unsafe is a binary prediction with asymmetric errors", "documents/chapter10"],
  12: ["A decision tree can expose the rule behind a risk label", "documents/chapter10"],
  13: ["A stronger evaluator must use the same held-out safety cases", "documents/chapter6"],
  14: ["An LLM claim needs an ablation table, not one impressive answer", "documents/chapter2"],
  15: ["A final LLM project needs one question, one test set, and one auditable claim", "documents/chapter8"],
};

const liveClassTwoSlideIds = [
  "title", "outputs", "mental-model", "syntax-pattern", "teacher-demo",
  "code-trace", "prediction-check", "guided-lab", "mistake-clinic",
  "debug-routine", "project-brief", "project-lab", "concept-check",
  "evidence-handoff", "research-integrity", "homework", "exit-ticket",
];

const liveClassOneSlideIds = [
  "title", "outputs", "lesson-agenda",
  "concept-1", "concept-2", "syntax-pattern", "prediction-check",
  "teacher-demo", "dataset-context", "guided-lab", "rubric", "homework", "exit-ticket",
];

const catalogPath = path.join(ROOT, "catalog.json");
check(fs.existsSync(catalogPath), "catalog.json exists after build");
const catalog = JSON.parse(read("catalog.json"));
check(catalog.courses.length === 1, "The public catalog contains one English course");
check(catalog.courses[0] && catalog.courses[0].id === "python-ai-en", "The public catalog exposes only the English course");
check(!cjkPattern.test(read("catalog.json")), "The public catalog contains no Chinese characters");
check(!cjkPattern.test(read("index.html")), "The public home page contains no Chinese characters");

for (const course of catalog.courses) {
  check(course.decks.length === 15, `${course.id} contains 15 lessons`);
  check(JSON.stringify(course.decks.map((deck) => deck.title)) === JSON.stringify(expectedTitles), `${course.id} follows the approved 15-class order`);
  check(/60/.test(course.decks[0].duration), `${course.id} sets Class 1 to 60 minutes`);
  check(/120/.test(course.decks[1].duration), `${course.id} retains Class 2 at 120 minutes`);
  check(course.decks.slice(2).every((deck) => /60/.test(deck.duration)), `${course.id} retains 60-minute duration for Classes 3-15`);
}

const generated = [];
for (const folder of ["python-ai-en"]) {
  for (let lesson = 1; lesson <= 15; lesson += 1) {
    const no = String(lesson).padStart(2, "0");
    const relative = `${folder}/lesson-${no}/index.html`;
    check(fs.existsSync(path.join(ROOT, relative)), `${relative} exists`);
    if (!fs.existsSync(path.join(ROOT, relative))) continue;
    const html = read(relative);
    const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
    const liveClassOne = lesson === 1;
    const expanded = lesson === 2;
    const expectedIds = liveClassOne ? liveClassOneSlideIds : expanded ? liveClassTwoSlideIds : requiredSlideIds;
    check(ids.length === expectedIds.length, `${relative} contains ${expectedIds.length} primary slides`);
    check(JSON.stringify(ids) === JSON.stringify(expectedIds), `${relative} uses the approved slide sequence`);
    check(liveClassOne
      ? html.includes("60 minutes") && !html.includes("120-MINUTE PACING")
      : expanded
      ? !html.includes("120-MINUTE PACING") && !html.includes("60-MINUTE PACING")
      : !html.includes("120-MINUTE PACING") && !html.includes("60-MINUTE PACING"), `${relative} keeps timing in the catalog rather than student slides`);
    check(liveClassOne || (expanded ? !html.includes("60-MINUTE PACING") : !html.includes("120-MINUTE PACING")), `${relative} contains no conflicting pacing`);
    check(html.includes('id="prediction-check"') && html.includes((liveClassOne || expanded) ? 'id="guided-lab"' : 'id="main-lab"'), `${relative} includes a prediction check and guided lab`);
    check((liveClassOne ? html.includes('id="outputs"') : html.includes(expanded ? 'id="evidence-handoff"' : 'id="project-connection"')) && html.includes("Research Log"), `${relative} connects the lesson to research evidence`);
    check(html.includes('id="homework"') && (liveClassOne
      ? html.includes('id="rubric"')
      : expanded
      ? html.includes('id="research-integrity"') && /伪造结果|Fabricate results/.test(html)
      : /不得伪造|may not fabricate/.test(html)), `${relative} includes homework and research-integrity guidance`);
    check(html.includes('id="homeBtn"') && !html.includes('id="langBtn"'), `${relative} retains home navigation without a language switch`);
    check(!cjkPattern.test(html), `${relative} contains no Chinese characters`);
    check(!html.includes("商博老师") && !html.includes("Professor Shangbo"), `${relative} contains no other teacher attribution`);
    check(!html.includes("朗读这段话") && !html.includes("Read this aloud") && !html.includes("prof-quote"), `${relative} contains no quote-reading card`);
    if (liveClassOne || expanded) {
      check(html.includes("KAGGLE NOTEBOOK") && !/Google Colab|colab\.research\.google\.com/i.test(html), `${relative} uses Kaggle rather than Colab`);
      if (liveClassOne) {
        check(html.includes('class="lab"') && /BROWSER PYTHON DEMO|浏览器内 Python 演示/.test(html), `${relative} includes the approved browser Python warm-up`);
        check(/Saving, versioning, and submission still happen in Kaggle Notebook|正式保存、版本管理和提交仍在 Kaggle Notebook 完成/.test(html), `${relative} keeps the browser demo separate from Kaggle submission`);
        check(/No Python installation required/.test(html), `${relative} requires no local Python installation`);
        check(/Create or sign in with Google/.test(html), `${relative} supports guided Kaggle registration with a Google account`);
        check(/Pause screen sharing or recording/.test(html), `${relative} protects account details during registration`);
        check(html.includes('class="explain-lines"') && html.includes("Explain each line"), `${relative} includes the line-by-line explanation control`);
        check(html.includes('class="line-code-view"') && html.includes("renderLineWalkthrough"), `${relative} includes the offline line highlighter and explanation flow`);
        check(html.includes("Previous") && html.includes("Next") && html.includes("Back to editor"), `${relative} includes line walkthrough navigation`);
        check(html.includes('class="line-replay"') && html.includes("speakLineExplanation") && html.includes("Replay explanation"), `${relative} includes automatic spoken line explanations and replay control`);
        check(html.includes("Mira · Code coach") && html.includes("Built-in · instant") && html.includes("miraReply") && html.includes("Use this code"), `${relative} includes the built-in Mira code coach without a backend dependency`);
      } else {
        check(!html.includes('class="lab"') && !html.includes("BROWSER PYTHON DEMO"), `${relative} keeps practical work in Kaggle Notebook`);
        check(!ids.includes("dataset-context") && !ids.includes("warmup") && !ids.includes("one-twenty-minute-pacing"), `${relative} removes standalone context, warm-up, and pacing slides`);
        check(html.includes("Follow the branch selected by each reading") && html.includes("37.8") && html.includes("12.1"), `${relative} includes a concrete value-by-value code trace`);
        check(html.includes("Two missing characters break both boundary cases") && html.includes("15 → normal") && html.includes("35 → normal"), `${relative} includes an explicit boundary logic bug and fix`);
        check(html.includes("SyntaxError") && html.includes("NameError") && html.includes("lable"), `${relative} includes a reproducible two-step debugging example`);
        check(html.includes("14.9") && html.includes("35.1") && html.includes("normal rate"), `${relative} defines executable project acceptance tests`);
      }
    } else {
      const [bridgeTitle, sourcePath] = llmBridgeChecks[lesson];
      check(ids.includes("llm-bridge") && !ids.includes("lesson-agenda") && !ids.includes("sixty-minute-pacing") && !ids.includes("course-position"), `${relative} replaces process slides with one substantive LLM bridge`);
      check(html.includes(bridgeTitle), `${relative} includes the approved Lesson ${lesson} LLM knowledge point`);
      check(html.includes(sourcePath) && html.includes("[Sources]"), `${relative} retains the LLM topic source in speaker notes`);
      check(/independently authored/i.test(html), `${relative} states that the classroom example was independently authored`);
    }
    generated.push({ folder, lesson, html, ids });
  }
}
check(generated.length === 15, "15 English lesson decks were generated");

const englishLessonOne = generated.find((deck) => deck.folder === "python-ai-en" && deck.lesson === 1);
const narrationSourceDir = path.join(ROOT, "narration", "python-ai-en", "lesson-01", "audio");
const narrationOutputDir = path.join(ROOT, "python-ai-en", "lesson-01", "audio");
const narrationManifestPath = path.join(narrationSourceDir, "narration.json");
check(fs.existsSync(narrationManifestPath), "English Class 1 narration manifest exists in the versioned source directory");
if (englishLessonOne && fs.existsSync(narrationManifestPath)) {
  const narration = JSON.parse(fs.readFileSync(narrationManifestPath, "utf8"));
  const narratedIds = Object.keys(narration);
  check(englishLessonOne.ids.every((sid) => narratedIds.includes(sid)), "English Class 1 narration covers every live slide ID");
  for (const sid of englishLessonOne.ids) {
    const sourceMp3 = path.join(narrationSourceDir, `${sid}.mp3`);
    const outputMp3 = path.join(narrationOutputDir, `${sid}.mp3`);
    check(fs.existsSync(sourceMp3) && fs.statSync(sourceMp3).size > 0, `English Class 1 ${sid} source MP3 exists`);
    check(fs.existsSync(outputMp3) && fs.statSync(outputMp3).size === fs.statSync(sourceMp3).size, `English Class 1 ${sid} MP3 is copied into the built deck`);
    check(narration[sid] && Array.isArray(narration[sid].cues) && narration[sid].cues.length > 0, `English Class 1 ${sid} has synchronized caption cues`);
  }
}

const evidenceChecks = [
  [3, ["list", "dict", "set"]],
  [4, ["NumPy", "random"]],
  [5, ["pandas", "groupby"]],
  [6, ["clean", "decision"]],
  [7, ["Visualization", "three key plots"]],
  [8, ["EDA", "research question"]],
  [9, ["Scikit-learn", "Baseline"]],
  [10, ["Linear Regression", "MAE"]],
  [11, ["Logistic Regression", "KNN", "confusion matrix"]],
  [12, ["Decision Tree", "Random Forest", "Feature importance"]],
  [13, ["SVM", "XGBoost", "boosting"]],
  [14, ["AI Research Workflow", "project v1"]],
  [15, ["Final AI Research Project", "slide deck"]],
];
for (const [lesson, terms] of evidenceChecks) {
  const html = generated.find((deck) => deck.folder === "python-ai-en" && deck.lesson === lesson).html;
  terms.forEach((term) => check(html.toLowerCase().includes(term.toLowerCase()), `English Class ${lesson} includes ${term}`));
}

const readme = read("README.md");
check(expectedTitles.every((title) => readme.includes(title)), "README lists all approved lesson titles");
check(/25%;[\s\S]*25%;[\s\S]*30%;[\s\S]*20%/.test(readme), "README records the approved 25/25/30/20 assessment weights");
check(/Class 1[^.\n]*60 minutes/.test(readme), "README records the English 60-minute Class 1");
check(/Class 2[^.\n]*120 minutes/.test(readme), "README records the English 120-minute Class 2");
check(readme.includes("LLM_KNOWLEDGE_MAP_LESSONS_03_15.md"), "README links the Lesson 3-15 LLM knowledge map");

const llmMapPath = "LLM_KNOWLEDGE_MAP_LESSONS_03_15.md";
check(fs.existsSync(path.join(ROOT, llmMapPath)), `${llmMapPath} exists`);
if (fs.existsSync(path.join(ROOT, llmMapPath))) {
  const llmMap = read(llmMapPath);
  for (let lesson = 3; lesson <= 15; lesson += 1) {
    check(llmMap.includes(`| ${String(lesson).padStart(2, "0")} |`), `${llmMapPath} maps Lesson ${lesson}`);
  }
  check(/independently rewritten|independently authored/i.test(llmMap), `${llmMapPath} records the independent-rewrite boundary`);
  check(/No top-level license|no clear top-level license/i.test(llmMap), `${llmMapPath} records the unverified external license boundary`);
}

console.log(`\nCOURSE VALIDATION: ${failures.length ? "FAIL" : "PASS"} (${passed} checks passed)`);
if (failures.length) failures.forEach((message) => console.error(`  FAIL: ${message}`));
console.log("MANUAL BROWSER QA: verify Run/output/error behavior, responsive layout, narration, and comments in a real browser.");
console.log("SOURCE NOTE: generated site files are build artifacts and remain outside Git tracking.\n");
process.exitCode = failures.length ? 1 : 0;
