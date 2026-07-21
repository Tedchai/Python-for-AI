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
  "Python Basics & Google Colab",
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

const catalogPath = path.join(ROOT, "catalog.json");
check(fs.existsSync(catalogPath), "catalog.json exists after build");
const catalog = JSON.parse(read("catalog.json"));
check(catalog.courses.length === 2, "Chinese and English course catalogs exist");

for (const course of catalog.courses) {
  check(course.decks.length === 15, `${course.id} contains 15 lessons`);
  check(JSON.stringify(course.decks.map((deck) => deck.title)) === JSON.stringify(expectedTitles), `${course.id} follows the approved 15-class order`);
  check(course.decks.every((deck) => /60/.test(deck.duration)), `${course.id} uses 60-minute lessons`);
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
    check(ids.length === 17, `${relative} contains 17 primary slides`);
    check(JSON.stringify(ids) === JSON.stringify(requiredSlideIds), `${relative} uses the shared 17-slide sequence`);
    check(html.includes("60-MINUTE PACING"), `${relative} declares 60-minute pacing`);
    check(!html.includes("120-MINUTE PACING") && !html.includes("2-HOUR PACING"), `${relative} contains no obsolete two-hour pacing`);
    check(html.includes('id="prediction-check"') && html.includes('id="main-lab"'), `${relative} includes a prediction check and main lab`);
    check(html.includes('id="project-connection"') && html.includes("Research Log"), `${relative} connects the lesson to research evidence`);
    check(html.includes('id="homework"') && /不得伪造|may not fabricate/.test(html), `${relative} includes homework and research-integrity guidance`);
    check(html.includes('id="homeBtn"') && html.includes('id="langBtn"'), `${relative} retains home and language controls`);
    check(html.includes("speechSynthesis") && html.includes("prof-quote"), `${relative} retains narration support`);
    generated.push({ folder, lesson, html, ids });
  }
}
check(generated.length === 30, "30 bilingual lesson decks were generated");

for (let lesson = 1; lesson <= 15; lesson += 1) {
  const zh = generated.find((deck) => deck.folder === "python-ai" && deck.lesson === lesson);
  const en = generated.find((deck) => deck.folder === "python-ai-en" && deck.lesson === lesson);
  check(zh && en && JSON.stringify(zh.ids) === JSON.stringify(en.ids), `Class ${lesson} bilingual slide IDs match`);
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
check(!/120分钟|120-minute|Kaggle四个Stage/.test(readme), "README contains no obsolete 120-minute course claim");

console.log(`\nCOURSE VALIDATION: ${failures.length ? "FAIL" : "PASS"} (${passed} checks passed)`);
if (failures.length) failures.forEach((message) => console.error(`  FAIL: ${message}`));
console.log("MANUAL BROWSER QA: verify Run/output/error behavior, responsive layout, narration, and comments in a real browser.");
console.log("SOURCE NOTE: generated site files are build artifacts and remain outside Git tracking.\n");
process.exitCode = failures.length ? 1 : 0;
