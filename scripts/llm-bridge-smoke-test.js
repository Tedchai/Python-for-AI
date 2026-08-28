#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PYTHON = process.env.PYTHON || "python";
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "python-ai-llm-bridges-"));
const failures = [];
const deferred = [];
let executed = 0;

function decodeHtml(text) {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

try {
  for (let lesson = 3; lesson <= 15; lesson += 1) {
    const lessonNo = String(lesson).padStart(2, "0");
    const htmlPath = path.join(ROOT, "python-ai-en", `lesson-${lessonNo}`, "index.html");
    const html = fs.readFileSync(htmlPath, "utf8");
    const section = html.match(/<section id="llm-bridge"[\s\S]*?<\/section>/);
    const code = section && section[0].match(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/);

    if (!code) {
      failures.push(`Lesson ${lessonNo}: no executable LLM Bridge code found`);
      continue;
    }

    const scriptPath = path.join(tempDir, `lesson-${lessonNo}.py`);
    fs.writeFileSync(scriptPath, `${decodeHtml(code[1]).trim()}\n`, "utf8");
    const syntax = spawnSync(PYTHON, ["-m", "py_compile", scriptPath], {
      encoding: "utf8",
      timeout: 30000,
    });
    if (syntax.error || syntax.status !== 0) {
      const detail = syntax.error ? syntax.error.message : (syntax.stderr || syntax.stdout).trim();
      failures.push(`Lesson ${lessonNo} syntax: ${detail}`);
      continue;
    }

    const result = spawnSync(PYTHON, [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, MPLBACKEND: "Agg" },
      timeout: 30000,
    });

    if (result.status !== 0 && /ModuleNotFoundError: No module named '(matplotlib|sklearn)'/.test(result.stderr || "")) {
      deferred.push(`Lesson ${lessonNo}`);
    } else if (result.error || result.status !== 0) {
      const detail = result.error ? result.error.message : (result.stderr || result.stdout).trim();
      failures.push(`Lesson ${lessonNo}: ${detail}`);
    } else {
      executed += 1;
      console.log(`PASS Lesson ${lessonNo}`);
    }
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`\nLLM BRIDGE CODE: FAIL (${failures.length} lesson(s))`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log(`\nLLM BRIDGE CODE: PASS (${executed} executed; ${deferred.length} dependency-dependent snippets syntax-checked)`);
if (deferred.length) {
  console.log(`  DEFERRED TO KAGGLE/PYODIDE: ${deferred.join(", ")} (matplotlib or scikit-learn unavailable in the bundled validation runtime)`);
}
