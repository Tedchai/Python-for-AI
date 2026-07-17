"use strict";

const fs = require("fs");
const path = require("path");
const course = require("./kaggle-course");

const ROOT = path.resolve(__dirname, "..");
const failures = [];
const checks = [];
const pass = (message) => checks.push(message);
const assert = (condition, message) => condition ? pass(message) : failures.push(message);
const normalize = (value) => String(value || "").toLowerCase().replace(/[\s·、，,：:—–\-]/g, "");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

const byClassNumber = (a, b) => Number(a.classNo) - Number(b.classNo);
const zhLessons = Object.values(course.zh).sort(byClassNumber);
const enLessons = Object.values(course.en).sort(byClassNumber);
assert(zhLessons.length === 15, "15 Chinese lesson specifications exist");
assert(enLessons.length === 15, "15 English lesson specifications exist");

const stageNumbers = zhLessons.filter((lesson) => lesson.lessonType === "stage").map((lesson) => Number(lesson.classNo));
assert(JSON.stringify(stageNumbers) === JSON.stringify([4, 8, 12, 15]), "Stage lessons occur only in Classes 4, 8, 12, and 15");
assert(JSON.stringify(zhLessons.filter((lesson) => lesson.lessonType === "stage").map((lesson) => lesson.stageNumber)) === JSON.stringify([1, 2, 3, 4]), "Stage numbers are 1 through 4");

const requiredFields = ["classNo", "lessonType", "title", "subtitle", "duration", "objectives", "output", "projectAction", "paperEvidence", "slides", "teacherNotes", "starterCode", "requiredPackages", "challenge", "rubric", "homework"];
for (const lesson of [...zhLessons, ...enLessons]) {
  for (const field of requiredFields) assert(lesson[field] !== undefined && lesson[field] !== null, `Class ${lesson.classNo} ${field} is present`);
  assert(lesson.duration === 120, `Class ${lesson.classNo} duration is 120 minutes`);
  assert(lesson.output && lesson.projectAction && lesson.paperEvidence, `Class ${lesson.classNo} has output, project action, and paper evidence`);
  assert(lesson.slides.length >= 33 && lesson.slides.length <= 37, `Class ${lesson.classNo} schema has 33–37 slides`);
}

const requiredSlideIds = ["guided-practice-1", "guided-practice-2", "independent-work", "notebook-hygiene", "research-integrity", "homework"];
for (let index = 0; index < 15; index += 1) {
  const zh = zhLessons[index];
  const en = enLessons[index];
  const zhIds = zh.slides.map((slide) => slide.id);
  const enIds = en.slides.map((slide) => slide.id);
  assert(JSON.stringify(zhIds) === JSON.stringify(enIds), `Class ${zh.classNo} bilingual slide IDs and order match`);
  assert(new Set(zhIds).size === zhIds.length, `Class ${zh.classNo} slide IDs are unique`);
  requiredSlideIds.forEach((id) => assert(zhIds.includes(id), `Class ${zh.classNo} includes ${id}`));
}

const deckRecords = [];
for (const lang of ["zh", "en"]) {
  const folder = lang === "zh" ? "python-ai" : "python-ai-en";
  for (let lessonNo = 1; lessonNo <= 15; lessonNo += 1) {
    const padded = String(lessonNo).padStart(2, "0");
    const relative = `${folder}/lesson-${padded}/index.html`;
    assert(fs.existsSync(path.join(ROOT, relative)), `${relative} exists`);
    if (!fs.existsSync(path.join(ROOT, relative))) continue;
    const html = read(relative);
    const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
    assert(ids.length >= 33 && ids.length <= 37, `${relative} contains 33–37 slides`);
    assert(html.includes("120-MINUTE PACING"), `${relative} declares 120-minute pacing`);
    assert(/20-minute project studio|20分钟项目工作室|20 minutes independent revision|20分钟学生独立修改/.test(html), `${relative} includes about 20 minutes of independent work`);
    assert(/10 min review|10分钟巡检|Instructor 10 min|教师10分钟/.test(html), `${relative} includes about 10 minutes of instructor review`);
    assert(html.includes('id="notebook-hygiene"') && html.includes('id="homework"'), `${relative} includes notebook cleanup and submission`);
    assert(html.includes('id="research-integrity"'), `${relative} includes a research-integrity reminder`);
    const projectSection = (html.match(/<section id="project-lab"[\s\S]*?<\/section>/) || [""])[0];
    assert(projectSection.includes("KAGGLE NOTEBOOK CODE") || lessonNo === 4 || lessonNo === 8 || lessonNo === 12 || lessonNo === 15, `${relative} labels project-file code as Kaggle-only`);
    assert(!projectSection.includes('class="lab"'), `${relative} does not expose project-file code as a browser Run lab`);
    deckRecords.push({ lang, lessonNo, ids, html });
  }
}
assert(deckRecords.length === 30, "30 generated decks exist");
for (let lessonNo = 1; lessonNo <= 15; lessonNo += 1) {
  const zh = deckRecords.find((deck) => deck.lang === "zh" && deck.lessonNo === lessonNo);
  const en = deckRecords.find((deck) => deck.lang === "en" && deck.lessonNo === lessonNo);
  if (zh && en) assert(JSON.stringify(zh.ids) === JSON.stringify(en.ids), `Generated Class ${lessonNo} bilingual slide IDs match`);
}

const codeText = zhLessons.map((lesson) => [lesson.syntax, lesson.demo, lesson.labCode, lesson.projectCode].join("\n")).join("\n");
assert(!/(classification_report|confusion_matrix|LogisticRegression|SVC\(|XGB)/.test(codeText), "Core lesson code excludes classification and advanced-model APIs");
assert(course.regressionPolicy.split.includes("test_size=0.20") && course.regressionPolicy.split.includes("random_state=42"), "Regression policy fixes the 80/20 split and random state");
assert(course.regressionPolicy.baseline.includes('strategy="mean"'), "Regression policy fixes the mean DummyRegressor baseline");
assert(course.regressionPolicy.model === "LinearRegression" && course.regressionPolicy.metric === "mean_absolute_error", "Regression policy fixes LinearRegression and MAE");
assert(/Lower MAE is better/.test(course.regressionPolicy.interpretation), "Regression policy states that lower MAE is better");
assert(course.regressionPolicy.leakageRules.some((rule) => /test set/i.test(rule) && /cleaning/i.test(rule)), "Regression policy prohibits test-target leakage into cleaning");

for (const lesson of zhLessons.filter((item) => item.lessonType === "knowledge")) {
  assert(lesson.labRuntime === "browser", `Class ${lesson.classNo} micro-lab is marked for browser execution`);
  assert(!/\/kaggle\/input|read_csv\(/.test(lesson.labCode), `Class ${lesson.classNo} browser lab is file-free`);
  if (lesson.requiredPackages.includes("pandas")) assert(/import pandas/.test(lesson.labCode), `Class ${lesson.classNo} browser lab imports pandas explicitly`);
  if (lesson.requiredPackages.includes("matplotlib")) assert(/import matplotlib/.test(lesson.labCode), `Class ${lesson.classNo} browser lab imports matplotlib explicitly`);
  if (lesson.requiredPackages.includes("scikit-learn")) assert(/from sklearn/.test(lesson.labCode), `Class ${lesson.classNo} browser lab imports scikit-learn explicitly`);
}

const whitelistFields = ["datasetTitle", "kaggleUrl", "publisherAuthor", "originalSource", "license", "accessDate", "verificationDate", "fileName", "fileSize", "rows", "columns", "target", "allowedFeatures", "excludedFeatures", "missingSummary", "privacyEthics", "highSchoolSuitability", "verificationStatus"];
const allowedStatuses = new Set(["verified", "pending manual review", "rejected"]);
for (const dataset of course.whitelist) {
  whitelistFields.forEach((field) => assert(Object.prototype.hasOwnProperty.call(dataset, field), `${dataset.datasetTitle} includes ${field}`));
  assert(allowedStatuses.has(dataset.verificationStatus), `${dataset.datasetTitle} uses an allowed verification status`);
  if (dataset.verificationStatus === "pending manual review") assert(dataset.unknownFields && dataset.unknownFields.length > 0, `${dataset.datasetTitle} lists unknown fields`);
}

const readme = read("README.md");
const outlineSource = read("scripts/build_course_outline.py");
let readmeCursor = -1;
let outlineCursor = -1;
for (const lesson of zhLessons) {
  const title = normalize(lesson.title);
  const readmeIndex = normalize(readme).indexOf(title, readmeCursor + 1);
  const outlineIndex = normalize(outlineSource).indexOf(title, outlineCursor + 1);
  assert(readmeIndex > readmeCursor, `README preserves Class ${lesson.classNo} order`);
  assert(outlineIndex > outlineCursor, `Word-outline source preserves Class ${lesson.classNo} order`);
  readmeCursor = Math.max(readmeCursor, readmeIndex);
  outlineCursor = Math.max(outlineCursor, outlineIndex);
}
assert(!/(60[- ]minute|60分钟|22[- ]slide|22页)/i.test(readme + deckRecords.map((deck) => deck.html).join("")), "Current README and generated decks contain no obsolete 60-minute/22-slide claims");

console.log(`\nAUTOMATED STRUCTURE: ${failures.length ? "FAIL" : "PASS"} (${checks.length} checks passed)`);
if (failures.length) failures.forEach((message) => console.error(`  FAIL: ${message}`));
console.log("CODE EXPERIMENTS: static browser/Kaggle boundary and dependency checks completed; execute the representative labs separately.");
console.log("BROWSER FUNCTION CHECKS: manual — run, output, and error rendering must be tested in a real browser for both languages.");
console.log("MANUAL CONTENT SPOT-CHECK: manual — review Classes 1, 4, 9, and 15 for teachability and evidence quality.");
console.log("WORD VISUAL QA: manual — render the DOCX and inspect all pages for clipping, wrapping, and table layout.");
console.log("STILL MANUAL: Kaggle candidate facts, downloaded-file metadata, links, licenses, and per-course verification dates.");
console.log("NOTE: a structural PASS is not a complete pedagogical or publication-readiness review.\n");
process.exitCode = failures.length ? 1 : 0;
