"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const failures = [];
let passed = 0;
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
  "title", "outcomes", "lesson-agenda", "sixty-minute-pacing", "course-position",
  "warmup", "concept-1", "concept-2", "syntax-pattern", "prediction-check",
  "guided-practice", "main-lab", "debug-routine", "project-connection",
  "challenge-ladder", "homework", "exit-ticket",
];

const expandedFoundationSlideIds = [
  "title", "outputs", "lesson-agenda", "one-twenty-minute-pacing", "prerequisite-recap",
  "course-position", "dataset-context", "warmup", "vocabulary", "mental-model",
  "concept-1", "concept-2", "concept-3", "syntax-pattern", "teacher-demo",
  "code-trace", "prediction-check", "guided-practice-1", "guided-practice-2",
  "guided-lab", "mistake-clinic", "debug-routine", "checkpoint", "project-plan",
  "project-brief", "project-lab", "independent-work", "challenge-ladder",
  "concept-check", "evidence-handoff", "notebook-hygiene", "research-integrity",
  "rubric", "homework", "buffer-catchup", "exit-ticket",
];

const catalogPath = path.join(ROOT, "catalog.json");
check(fs.existsSync(catalogPath), "catalog.json exists after build");
const catalog = JSON.parse(read("catalog.json"));
check(catalog.courses.length === 2, "Chinese and English course catalogs exist");

for (const course of catalog.courses) {
  check(course.decks.length === 15, `${course.id} contains 15 lessons`);
  check(JSON.stringify(course.decks.map((deck) => deck.title)) === JSON.stringify(expectedTitles), `${course.id} follows the approved 15-class order`);
  check(course.decks.slice(0, 2).every((deck) => /120/.test(deck.duration)), `${course.id} expands Classes 1-2 to 120 minutes`);
  check(course.decks.slice(2).every((deck) => /60/.test(deck.duration)), `${course.id} retains 60-minute duration for Classes 3-15`);
}

const generated = [];
for (const folder of ["python-ai", "python-ai-en"]) {
  for (let lesson = 1; lesson <= 15; lesson += 1) {
    const no = String(lesson).padStart(2, "0");
    const relative = `${folder}/lesson-${no}/index.html`;
    check(fs.existsSync(path.join(ROOT, relative)), `${relative} exists`);
    if (!fs.existsSync(path.join(ROOT, relative))) continue;
    const html = read(relative);
    const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
    const expanded = lesson <= 2;
    const expectedIds = expanded ? expandedFoundationSlideIds : requiredSlideIds;
    check(ids.length === expectedIds.length, `${relative} contains ${expectedIds.length} primary slides`);
    check(JSON.stringify(ids) === JSON.stringify(expectedIds), `${relative} uses the approved slide sequence`);
    check(html.includes(expanded ? "120-MINUTE PACING" : "60-MINUTE PACING"), `${relative} declares the approved lesson pacing`);
    check(expanded ? !html.includes("60-MINUTE PACING") : !html.includes("120-MINUTE PACING"), `${relative} contains no conflicting pacing`);
    check(html.includes('id="prediction-check"') && html.includes(expanded ? 'id="guided-lab"' : 'id="main-lab"'), `${relative} includes a prediction check and guided lab`);
    check(html.includes(expanded ? 'id="evidence-handoff"' : 'id="project-connection"') && html.includes("Research Log"), `${relative} connects the lesson to research evidence`);
    check(html.includes('id="homework"') && (expanded
      ? html.includes('id="research-integrity"') && /伪造结果|Fabricate results/.test(html)
      : /不得伪造|may not fabricate/.test(html)), `${relative} includes homework and research-integrity guidance`);
    check(html.includes('id="homeBtn"') && html.includes('id="langBtn"'), `${relative} retains home and language controls`);
    check(!html.includes("商博老师") && !html.includes("Professor Shangbo"), `${relative} contains no other teacher attribution`);
    check(!html.includes("朗读这段话") && !html.includes("Read this aloud") && !html.includes("prof-quote"), `${relative} contains no quote-reading card`);
    if (expanded) {
      check(html.includes("KAGGLE NOTEBOOK") && !/Google Colab|colab\.research\.google\.com/i.test(html), `${relative} uses Kaggle rather than Colab`);
      check(!html.includes('class="lab"') && !html.includes("BROWSER / PYODIDE"), `${relative} keeps all practical work in Kaggle Notebook`);
    }
    generated.push({ folder, lesson, html, ids });
  }
}
check(generated.length === 30, "30 bilingual lesson decks were generated");

for (let lesson = 1; lesson <= 15; lesson += 1) {
  const zh = generated.find((deck) => deck.folder === "python-ai" && deck.lesson === lesson);
  const en = generated.find((deck) => deck.folder === "python-ai-en" && deck.lesson === lesson);
  check(zh && en && JSON.stringify(zh.ids) === JSON.stringify(en.ids), `Class ${lesson} bilingual slide IDs match`);
}

const englishLessonOne = generated.find((deck) => deck.folder === "python-ai-en" && deck.lesson === 1);
const narrationSourceDir = path.join(ROOT, "narration", "python-ai-en", "lesson-01", "audio");
const narrationOutputDir = path.join(ROOT, "python-ai-en", "lesson-01", "audio");
const narrationManifestPath = path.join(narrationSourceDir, "narration.json");
check(fs.existsSync(narrationManifestPath), "English Class 1 narration manifest exists in the versioned source directory");
if (englishLessonOne && fs.existsSync(narrationManifestPath)) {
  const narration = JSON.parse(fs.readFileSync(narrationManifestPath, "utf8"));
  const narratedIds = Object.keys(narration);
  check(JSON.stringify(narratedIds.sort()) === JSON.stringify([...englishLessonOne.ids].sort()), "English Class 1 narration covers every slide ID exactly once");
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
  [7, ["Visualization", "三张核心图"]],
  [8, ["EDA", "研究问题"]],
  [9, ["Scikit-learn", "Baseline"]],
  [10, ["Linear Regression", "MAE"]],
  [11, ["Logistic Regression", "KNN", "confusion matrix"]],
  [12, ["Decision Tree", "Random Forest", "Feature importance"]],
  [13, ["SVM", "XGBoost", "boosting"]],
  [14, ["AI Research Workflow", "项目v1"]],
  [15, ["Final AI Research Project", "PPT"]],
];
for (const [lesson, terms] of evidenceChecks) {
  const html = generated.find((deck) => deck.folder === "python-ai" && deck.lesson === lesson).html;
  terms.forEach((term) => check(html.toLowerCase().includes(term.toLowerCase()), `Chinese Class ${lesson} includes ${term}`));
}

const readme = read("README.md");
check(expectedTitles.every((title) => readme.includes(title)), "README lists all approved lesson titles");
check(/25%；[\s\S]*25%；[\s\S]*30%；[\s\S]*20%/.test(readme), "README records the approved 25/25/30/20 assessment weights");
check(/第 1、2 课[^。\n]*120 分钟/.test(readme), "README records the expanded 120-minute Classes 1-2");
check(/Classes 1 and 2[^.\n]*120 minutes/.test(readme), "README records the English 120-minute Classes 1-2");

console.log(`\nCOURSE VALIDATION: ${failures.length ? "FAIL" : "PASS"} (${passed} checks passed)`);
if (failures.length) failures.forEach((message) => console.error(`  FAIL: ${message}`));
console.log("MANUAL BROWSER QA: verify Run/output/error behavior, responsive layout, narration, and comments in a real browser.");
console.log("SOURCE NOTE: generated site files are build artifacts and remain outside Git tracking.\n");
process.exitCode = failures.length ? 1 : 0;
