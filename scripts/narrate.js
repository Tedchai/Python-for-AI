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

// edge-tts 命令：pip install edge-tts 后一般直接在 PATH 里；也可用环境变量 EDGE_TTS 指定完整路径
const EDGE_TTS = process.env.EDGE_TTS || "edge-tts";
const VOICE = process.env.NARRATE_VOICE || "en-US-AndrewMultilingualNeural"; // warm, mature; handles stray non-English terms
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const PROMPT_VERSION = "v1"; // bump to force a full re-narration

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
  const sys =
    "You are a warm, engaging university professor narrating one slide of a live class for teenage students. " +
    "Write what you would SAY out loud to present this slide — first person, spoken English, plain and vivid. " +
    "Rules: 3–5 sentences (about 45–80 words). No headings, no markdown, no emoji, no stage directions, " +
    "do not say 'this slide' or 'as you can see'. Do not read button labels, URLs, or code. " +
    "Speak directly to the students. Output ONLY the narration text.";
  const user =
    `SLIDE CONTENT (what's on screen):\n${slide.visible || "(no text)"}\n\n` +
    `PRESENTER NOTES (intent — rephrase for students, never read aloud verbatim):\n${slide.notes || "(none)"}`;
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
  execFileSync(EDGE_TTS, ["--voice", VOICE, "--text", text, "--write-media", outPath, "--write-subtitles", srtPath], { stdio: "pipe" });
  const cues = parseSrt(fs.readFileSync(srtPath, "utf8"));
  fs.unlinkSync(srtPath); // captions live in narration.json; no need to keep the raw .srt
  return cues;
}

// ── main ─────────────────────────────────────────────────────────────
(async () => {
  const htmlPath = path.join(ROOT, DECK, "index.html");
  const audioDir = path.join(ROOT, DECK, "audio");
  fs.mkdirSync(audioDir, { recursive: true });
  const manifestPath = path.join(audioDir, "narration.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

  let slides = parseSlides(fs.readFileSync(htmlPath, "utf8"));
  if (ONLY) slides = slides.filter((s) => s.sid === ONLY);
  if (!slides.length) { console.error("No slides matched."); process.exit(1); }

  let made = 0, skipped = 0;
  for (const s of slides) {
    const hash = crypto.createHash("sha256").update(PROMPT_VERSION + "|" + VOICE + "|" + s.visible + "|" + s.notes).digest("hex").slice(0, 16);
    const mp3 = path.join(audioDir, s.sid + ".mp3");
    const prev = manifest[s.sid];
    const upToDate = prev && prev.hash === hash && fs.existsSync(mp3) && Array.isArray(prev.cues);
    if (!FORCE && upToDate) { skipped++; continue; }
    process.stdout.write(`• ${s.sid} … `);
    try {
      // Reuse the cached script (no extra Claude call) when only captions are
      // missing on an otherwise up-to-date slide; audio+captions are always
      // re-rendered together in one TTS pass so timing can't drift.
      const reuseScript = !FORCE && prev && prev.hash === hash && prev.script;
      const script = reuseScript ? prev.script : await writeScript(s);
      const cues = tts(script, mp3);
      manifest[s.sid] = { hash, voice: VOICE, script, cues, bytes: fs.statSync(mp3).size, model: MODEL };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      made++;
      console.log(`ok (${(manifest[s.sid].bytes / 1024 | 0)} KB, ${cues.length} cues)`);
    } catch (e) {
      console.log("FAIL " + e.message);
    }
  }
  console.log(`\nNarration done — ${made} generated, ${skipped} cached, ${slides.length} total.`);
})();
