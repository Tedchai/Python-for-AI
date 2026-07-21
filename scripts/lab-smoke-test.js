"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
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
  console.log("CODE EXPERIMENTS: MANUAL — no Python executable found; set PYTHON to run lab smoke tests.");
  process.exit(0);
}

const decode = (text) => text
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'");

const failures = [];
const deferred = [];
let passed = 0;

for (let lesson = 1; lesson <= 15; lesson += 1) {
  const no = String(lesson).padStart(2, "0");
  const file = path.join(ROOT, `python-ai-en/lesson-${no}/index.html`);
  const html = fs.readFileSync(file, "utf8");
  const section = (html.match(/<section id="main-lab"[\s\S]*?<\/section>/) || [""])[0];
  const codeMatch = section.match(/<textarea class="code"[^>]*>([\s\S]*?)<\/textarea>/);
  const packages = ((section.match(/data-packages="([^"]*)"/) || ["", ""])[1] || "").split(",").filter(Boolean);
  if (!codeMatch) {
    failures.push(`Class ${no}: main lab code not found`);
    continue;
  }
  const code = decode(codeMatch[1]);
  const result = spawnSync(python.command, [...python.prefix, "-c", code], {
    encoding: "utf8",
    env: { ...process.env, MPLBACKEND: "Agg", PYTHONIOENCODING: "utf-8" },
    timeout: 30000,
  });
  if (result.status !== 0 && /ModuleNotFoundError/.test(result.stderr || "") && packages.length) {
    deferred.push(`Class ${no} (${packages.join(", ")})`);
  } else if (result.error || result.status !== 0) {
    failures.push(`Class ${no}: ${(result.stderr || result.error || "unknown error").toString().trim()}`);
  } else {
    passed += 1;
  }
}

if (failures.length) {
  console.error(`CODE EXPERIMENTS: FAIL (${failures.length}/15 labs failed)`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`CODE EXPERIMENTS: PASS (${passed} host-Python labs executed; ${deferred.length} package-dependent labs deferred)`);
  if (deferred.length) console.log(`  DEFERRED TO PYODIDE/BROWSER: ${deferred.join("; ")}`);
  console.log("BROWSER FUNCTION CHECKS: manual — verify Pyodide loading, Run, output, and error rendering in the browser.");
}
