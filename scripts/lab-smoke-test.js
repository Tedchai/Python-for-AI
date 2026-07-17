"use strict";

const { spawnSync } = require("child_process");
const course = require("./kaggle-course");

const candidates = [];
if (process.env.PYTHON) candidates.push({ command: process.env.PYTHON, prefix: [] });
if (process.platform === "win32") candidates.push({ command: "py", prefix: ["-3"] });
candidates.push({ command: "python", prefix: [] }, { command: "python3", prefix: [] });

let python = null;
for (const candidate of candidates) {
  const probe = spawnSync(candidate.command, [...candidate.prefix, "--version"], { encoding: "utf8" });
  if (!probe.error && probe.status === 0) {
    python = candidate;
    break;
  }
}

if (!python) {
  console.log("CODE EXPERIMENTS: MANUAL — no Python executable was found; set PYTHON to run file-free lab smoke tests.");
  process.exit(0);
}

const lessons = Object.values(course.en)
  .filter((lesson) => lesson.lessonType === "knowledge" && lesson.labRuntime === "browser")
  .sort((a, b) => Number(a.classNo) - Number(b.classNo));
const failures = [];
const skipped = [];
let passed = 0;
for (const lesson of lessons) {
  const result = spawnSync(python.command, [...python.prefix, "-c", lesson.labCode], {
    encoding: "utf8",
    env: { ...process.env, MPLBACKEND: "Agg", PYTHONIOENCODING: "utf-8" },
    timeout: 30000,
  });
  if (result.status !== 0 && /ModuleNotFoundError/.test(result.stderr || "") && lesson.requiredPackages.length) {
    skipped.push(`Class ${lesson.classNo} (${lesson.requiredPackages.join(", ")})`);
  } else if (result.error || result.status !== 0) {
    failures.push(`Class ${lesson.classNo}: ${(result.stderr || result.error || "unknown error").toString().trim()}`);
  } else {
    passed += 1;
  }
}

if (failures.length) {
  console.error(`CODE EXPERIMENTS: FAIL (${failures.length}/${lessons.length} file-free browser labs failed)`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`CODE EXPERIMENTS: PASS (${passed} file-free labs executed with host Python; ${skipped.length} package-dependent labs deferred)`);
  if (skipped.length) console.log(`  DEFERRED TO PYODIDE/BROWSER: ${skipped.join("; ")}`);
  console.log("BROWSER FUNCTION CHECKS: still manual — Pyodide package loading, Run button, output, and error UI require a real browser.");
}
