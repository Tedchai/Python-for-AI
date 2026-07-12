/* =====================================================================
 * 可选的本地/线上服务器 — 零依赖（只用 Node 自带模块，Node ≥ 18）。
 *
 *   npm run serve           → http://localhost:3100
 *
 * 提供三样东西：
 *   1. 静态托管整个课件站（等价于任何静态服务器）
 *   2. /api/comments  — 每页评论（存到 data/comments.json）
 *   3. /api/assistant — 代码实验页的 AI 助教（需要 .env 里的 ANTHROPIC_API_KEY）
 *
 * 只想要静态页面（没有评论/助教）？不用这个文件也行：
 * 把整个目录放到 GitHub Pages / 任意静态托管即可，其余功能照常工作。
 * ===================================================================== */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 3100;

// ── .env（可选）──────────────────────────────────────────────────────
try {
  for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
} catch {}
const KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ASSISTANT_MODEL || "claude-sonnet-5";

// ── 评论存储：data/comments.json ─────────────────────────────────────
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "comments.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
let comments = [];
try { comments = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch {}
let saveTimer = null;
function saveComments() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => fs.writeFile(DB_FILE, JSON.stringify(comments, null, 1), () => {}), 200);
}

// ── 简易限流（每 IP 每分钟）─────────────────────────────────────────
const hits = new Map();
function rate(ip, max) {
  const now = Date.now();
  const a = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (a.length >= max) { hits.set(ip, a); return false; }
  a.push(now); hits.set(ip, a); return true;
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".ico": "image/x-icon", ".woff2": "font/woff2" };

function json(res, code, obj) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "";
    req.on("data", (c) => { b += c; if (b.length > 64 * 1024) { reject(new Error("too big")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch (e) { reject(e); } });
  });
}

// ── AI 助教：直接调 Anthropic Messages API ──────────────────────────
async function assistant(body) {
  if (!KEY) return "（AI 助教未配置 — 在 .env 里填 ANTHROPIC_API_KEY 后重启 server.js 即可启用。）";
  const action = String(body.action || "ask");
  const code = String(body.code || "").slice(0, 8000);
  const error = String(body.error || "").slice(0, 2000);
  const question = String(body.question || "").slice(0, 1000);
  const ask = {
    explain: "请逐段解释这段代码在做什么，用适合中学生的语言。",
    debug: "这段代码报错了。请找出原因，并给出改好的完整代码。",
    improve: "请给出 1-2 个具体的改进建议，并给出改进后的完整代码。",
    ask: question || "请解释这段代码。",
  }[action] || question;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 900,
      system: "你是课堂上的编程小助教，对象是没学过多少编程的中学生。回答简短、鼓励、分步骤；代码放在 ```python 代码块里；用学生提问的语言回答（中文提问用中文答）。",
      messages: [{ role: "user", content: `${ask}\n\n代码：\n\`\`\`python\n${code}\n\`\`\`${error ? `\n\n报错信息：\n${error}` : ""}` }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const j = await res.json();
  return (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim() || "(空回复)";
}

// ── 服务器 ───────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  try {
    // 评论 API
    if (u.pathname === "/api/comments" && req.method === "GET") {
      const deck = (u.searchParams.get("deck") || "").slice(0, 80);
      const slide = (u.searchParams.get("slide") || "").slice(0, 80);
      return json(res, 200, { comments: comments.filter((c) => c.deck === deck && c.slide === slide)
        .map(({ name, body, created }) => ({ name, body, created })) });
    }
    if (u.pathname === "/api/comments/counts") {
      const deck = (u.searchParams.get("deck") || "").slice(0, 80);
      const counts = {};
      for (const c of comments) if (c.deck === deck) counts[c.slide] = (counts[c.slide] || 0) + 1;
      return json(res, 200, { counts });
    }
    if (u.pathname === "/api/comments" && req.method === "POST") {
      if (!rate(ip, 10)) return json(res, 429, { error: "评论太快了，歇一分钟再发～" });
      const b = await readBody(req);
      const deck = String(b.deck || "").slice(0, 80), slide = String(b.slide || "").slice(0, 80);
      const name = (String(b.name || "").trim() || "匿名").slice(0, 40);
      const body = String(b.body || "").trim().slice(0, 2000);
      if (!deck || !slide || !body) return json(res, 400, { error: "内容不能为空" });
      comments.push({ deck, slide, name, body, ip, created: Date.now() });
      saveComments();
      return json(res, 200, { ok: true });
    }
    // AI 助教 API
    if (u.pathname === "/api/assistant" && req.method === "POST") {
      if (!rate(ip, 8)) return json(res, 429, { text: "问得太快了，稍等一下再问～" });
      const b = await readBody(req);
      return json(res, 200, { text: await assistant(b) });
    }
    if (u.pathname === "/healthz") return json(res, 200, { ok: true, assistant: !!KEY });

    // 静态文件
    let p = decodeURIComponent(u.pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(ROOT, path.normalize(p).replace(/^([/\\])+/, ""));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); return res.end("404 not found"); }
      res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
      res.end(buf);
    });
  } catch (e) {
    json(res, 500, { error: String(e.message || e) });
  }
}).listen(PORT, () => {
  console.log(`课件站已启动 → http://localhost:${PORT}`);
  console.log(`AI 助教：${KEY ? "已启用 (" + MODEL + ")" : "未配置（.env 填 ANTHROPIC_API_KEY 可启用）"}`);
});
