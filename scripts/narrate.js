/* =====================================================================
 * narrate.js — per-slide "professor presenting" narration for a deck.
 *
 *   npm run narrate -- [--deck python-ai/lesson-01] [--only <slug>] [--force]
 *
 * For every <section data-sid="…"> it:
 *   1. extracts the slide's visible text + presenter notes,
 *   2. asks Claude to write a short, first-person spoken lecture script
 *      (student-facing — NOT the stage-direction presenter notes),
 *   3. renders it to audio/<sid>.mp3 with edge-tts, along with per-sentence
 *      caption cues (start/end/text) captured from edge-tts's own word-
 *      boundary timing so captions never drift from the audio.
 *
 * Cached by a content hash in audio/narration.json, so re-running only
 * regenerates slides whose text actually changed. Audio is keyed by the
 * slide's STABLE slug, so reordering the deck never re-points narration.
 * ===================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const DECK = arg("--deck", "demo-course/lesson-01");
const ONLY = arg("--only", null);
const FORCE = process.argv.includes("--force");
const LANGUAGE = DECK.startsWith("python-ai-en/") ? "en" : DECK.startsWith("python-ai/") ? "zh" : "en";

// edge-tts 命令：pip install edge-tts 后一般直接在 PATH 里；也可用环境变量 EDGE_TTS 指定完整路径
const EDGE_TTS = process.env.EDGE_TTS || "edge-tts";
const EDGE_TTS_PYTHON = process.env.EDGE_TTS_PYTHON || (process.platform === "win32" ? "python" : "");
const DEFAULT_VOICE = LANGUAGE === "zh" ? "zh-CN-YunxiNeural" : "en-US-AndrewMultilingualNeural";
const VOICE = process.env.NARRATE_VOICE || DEFAULT_VOICE;
const RATE = process.env.NARRATE_RATE || (LANGUAGE === "zh" ? "-6%" : "-4%");
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const PROMPT_VERSION = "v2-natural-bilingual"; // bump to force a full re-narration

// ── env / key ────────────────────────────────────────────────────────
function loadEnv() {
  try {
    for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
}
loadEnv();
const KEY = process.env.Anthropic_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
if (!KEY) { console.error("No Anthropic API key in env (.env Anthropic_API_KEY)"); process.exit(1); }

// ── HTML helpers ─────────────────────────────────────────────────────
const decode = (s) => s
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
const stripTags = (s) => decode(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

function parseSlides(html) {
  const out = [];
  // data-sid may appear anywhere in the tag (sec() emits id="…" first)
  const re = /<section\b[^>]*\bdata-sid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
  let m;
  while ((m = re.exec(html))) {
    const sid = m[1];
    let inner = m[2];
    const notesM = inner.match(/<aside class="notes">([\s\S]*?)<\/aside>/);
    const notes = notesM ? stripTags(notesM[1]) : "";
    inner = inner.replace(/<aside class="notes">[\s\S]*?<\/aside>/, "");
    out.push({ sid, visible: stripTags(inner), notes });
  }
  return out;
}

// ── Claude: write the spoken lecture script ──────────────────────────
async function writeScript(slide) {
  const sys = LANGUAGE === "zh"
    ? "你是一位亲切、自然、有课堂感的大学老师，正在给青少年讲授 Python 与 AI。请把页面内容讲成自然的简体中文口语，而不是逐字念屏幕。每页说 3–5 句，约 70–130 个汉字；句子长短要有变化，可适度使用停顿、过渡语或一个简短问题。不要使用标题、Markdown、emoji 或舞台指令；不要说‘这一页’、‘幻灯片上’或‘大家可以看到’；不要朗读按钮、网址、代码、符号串和教师备注。直接面向学生讲解，只输出最终讲解词。"
    : "You are a warm, natural university instructor teaching Python and AI to teenage students. Turn the page content into spoken classroom English instead of reading the screen word for word. Use 3–5 sentences (about 45–80 words), varied sentence lengths, and an occasional short transition or question. No headings, markdown, emoji, or stage directions. Do not say 'this slide' or 'as you can see'. Do not read buttons, URLs, code, symbol strings, or presenter notes. Speak directly to the students and output only the final narration.";
  const user = LANGUAGE === "zh"
    ? `页面内容：\n${slide.visible || "（无文字）"}\n\n教师备注（只理解意图，不得照读）：\n${slide.notes || "（无）"}`
    : `PAGE CONTENT:\n${slide.visible || "(no text)"}\n\nPRESENTER NOTES (use only for intent; never read verbatim):\n${slide.notes || "(none)"}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 400, system: sys, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join(" ").trim();
  if (!text) throw new Error("empty narration");
  return text;
}

function srtTimeToSeconds(t) {
  const m = t.match(/(\d+):(\d+):(\d+)[.,](\d+)/);
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
}
function parseSrt(srt) {
  const cues = [];
  for (const block of srt.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [start, end] = timeLine.split("-->").map((s) => srtTimeToSeconds(s.trim()));
    const text = lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim();
    if (text) cues.push({ start, end, text });
  }
  return cues;
}

// Renders audio + word-synced captions in a single TTS pass so they never drift apart.
function tts(text, outPath) {
  const srtPath = outPath.replace(/\.mp3$/, ".srt");
  const command = EDGE_TTS_PYTHON || EDGE_TTS;
  const prefix = EDGE_TTS_PYTHON ? ["-m", "edge_tts"] : [];
  execFileSync(command, [...prefix, "--voice", VOICE, `--rate=${RATE}`, "--text", text, "--write-media", outPath, "--write-subtitles", srtPath], { stdio: "pipe" });
  const cues = parseSrt(fs.readFileSync(srtPath, "utf8"));
  fs.unlinkSync(srtPath); // captions live in narration.json; no need to keep the raw .srt
  return cues;
}

// ── main ─────────────────────────────────────────────────────────────
(async () => {
  const htmlPath = path.join(ROOT, DECK, "index.html");
  const audioDir = path.join(ROOT, "narration", DECK, "audio");
  const outputAudioDir = path.join(ROOT, DECK, "audio");
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(outputAudioDir, { recursive: true });
  const manifestPath = path.join(audioDir, "narration.json");
  const outputManifestPath = path.join(outputAudioDir, "narration.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  let slides = parseSlides(fs.readFileSync(htmlPath, "utf8"));
  if (ONLY) slides = slides.filter((s) => s.sid === ONLY);
  if (!slides.length) { console.error("No slides matched."); process.exit(1); }

  let made = 0, skipped = 0;
  for (const s of slides) {
    const hash = crypto.createHash("sha256").update(PROMPT_VERSION + "|" + LANGUAGE + "|" + VOICE + "|" + RATE + "|" + s.visible + "|" + s.notes).digest("hex").slice(0, 16);
    const mp3 = path.join(audioDir, s.sid + ".mp3");
    const outputMp3 = path.join(outputAudioDir, s.sid + ".mp3");
    const prev = manifest[s.sid];
    const upToDate = prev && prev.hash === hash && fs.existsSync(mp3) && Array.isArray(prev.cues);
    if (!FORCE && upToDate) { fs.copyFileSync(mp3, outputMp3); skipped++; continue; }
    process.stdout.write(`• ${s.sid} … `);
    try {
      // Reuse the cached script (no extra Claude call) when only captions are
      // missing on an otherwise up-to-date slide; audio+captions are always
      // re-rendered together in one TTS pass so timing can't drift.
      const reuseScript = !FORCE && prev && prev.hash === hash && prev.script;
      const script = reuseScript ? prev.script : await writeScript(s);
      const cues = tts(script, mp3);
      manifest[s.sid] = { hash, language: LANGUAGE, voice: VOICE, rate: RATE, script, cues, bytes: fs.statSync(mp3).size, model: MODEL };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      fs.copyFileSync(mp3, outputMp3);
      made++;
      console.log(`ok (${(manifest[s.sid].bytes / 1024 | 0)} KB, ${cues.length} cues)`);
    } catch (e) {
      console.log("FAIL " + e.message);
    }
  }
  fs.copyFileSync(manifestPath, outputManifestPath);
  console.log(`\nNarration done — ${made} generated, ${skipped} cached, ${slides.length} total.`);
})();
