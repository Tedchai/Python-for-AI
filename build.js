/* =====================================================================
 * 互动网页课件模板 · Interactive Lecture Deck Template
 * 一条命令生成整站课件：课程目录 + reveal.js 幻灯片，内置
 * 随堂测验、浏览器内 Python 实验（Pyodide）、AI 代码助教、
 * 每页评论、可选的语音讲解。
 *
 *   node build.js        ← 生成/更新全部页面
 *
 * 套用方法见 README.md。要点：
 *   1. 改下面的 CATALOG（站点名、课程、每课标题）
 *   2. 复制 buildLesson01() 写你自己的课
 *   3. 在底部 DECK_BUILDERS 注册，deck 条目 status 改 "ready"
 * ===================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const W = (rel, html) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
  console.log("wrote", rel, "(" + html.length + " bytes)");
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- palette ----------
const C = {
  navy: "#0C2D52", navy2: "#12386A", blue: "#1769C0", teal: "#0F9DB0",
  tealBright: "#2BC4D4", coral: "#EE6B36", amber: "#F2A93B", green: "#1FA37A",
  red: "#C0392B", ink: "#21303F", muted: "#5E7183", line: "#D7E2EC",
  cloud: "#EEF4FA", cloud2: "#F6F9FC", white: "#FFFFFF",
};
// 可选：页面上的"支持/捐赠"按钮链接。留空 "" 则完全不显示该按钮。
const DONATE_URL = "";

// =====================================================================
// CATALOG
// =====================================================================
const CATALOG = {
  site: "Python for AI Research",
  logo: "AI",
  tagline: "互动网页课件 — 随堂测验 · 浏览器 Python 实验 · 每页留言 · 可选语音讲解",
  courses: [
    {
      id: "python-ai",
      title: "Python for AI Research",
      subtitle: "从 Python 基础、数据处理到 AI 科研项目展示的 15 节互动课程。",
      tags: ["Python", "AI Research", "MeritPoint"],
      accent: C.blue,
      decks: [
        { id: "lesson-01", n: 1, title: "课程导入与第一个 Python Notebook",
          summary: "课程规则、Google Classroom、Colab 入门、print、变量、数据类型、input、f-string 和 mini profile 小练习。",
          tags: ["Class 01", "Colab", "Python Basics", "Quiz", "Lab"],
          duration: "60 min", status: "ready" },
        { id: "lesson-02", n: 2, title: "Python Control Flow",
          summary: "条件判断、比较运算、for / while 循环、break / continue，以及评分/分类小程序。",
          tags: ["Class 02", "Control Flow", "Quiz", "Lab"],
          duration: "60-75 min", status: "ready" },
        { id: "lesson-03", n: 3, title: "Python Functions",
          summary: "def、函数调用、参数、return、keyword arguments、scope、docstring 和函数作业。",
          tags: ["Class 03", "Functions", "Quiz", "Lab"],
          duration: "60-75 min", status: "ready" },
        { id: "lesson-04", n: 4, title: "Python Lists and 2D Lists",
          summary: "list 索引、遍历、按 index 修改元素、二维列表和 nested loop。",
          tags: ["Class 04", "List", "2D List", "Quiz", "Lab"],
          duration: "60-75 min", status: "ready" },
        { id: "lesson-05", n: 5, title: "Python Tuples and Unpacking",
          summary: "tuple 的有序与不可变、count、更新策略、unpacking、星号解包和函数多返回值。",
          tags: ["Class 05", "Tuple", "Unpacking", "Quiz", "Lab"],
          duration: "60-75 min", status: "ready" },
        { id: "lesson-06", n: 6, title: "Python Dictionaries and Word Frequency",
          summary: "key-value 映射、get / keys / values / items、增改字典，以及词频统计小项目。",
          tags: ["Class 06", "Dictionary", "Project", "Quiz", "Lab"],
          duration: "60-75 min", status: "ready" },
      ],
    },
    {
      id: "python-ai-en",
      title: "Python for AI Research (English)",
      subtitle: "A 15-class Python-first path from coding basics to small AI research projects.",
      tags: ["Python", "AI Research", "English"],
      accent: C.blue,
      decks: [
        { id: "lesson-01", n: 1, title: "Course Introduction and Your First Python Notebook",
          summary: "Colab setup, print, variables, data types, input, f-strings, and a first learning profile notebook.",
          tags: ["Class 01", "Colab", "Python Basics", "Lab"],
          duration: "2 hours", status: "ready" },
        { id: "lesson-02", n: 2, title: "Python Control Flow",
          summary: "Conditions, comparisons, if / elif / else, for / while loops, break / continue, and rule-based classification.",
          tags: ["Class 02", "Control Flow", "Lab"],
          duration: "2 hours", status: "ready" },
        { id: "lesson-03", n: 3, title: "Python Functions",
          summary: "def, function calls, parameters, return values, scope, docstrings, and reusable helper functions.",
          tags: ["Class 03", "Functions", "Lab"],
          duration: "2 hours", status: "ready" },
        { id: "lesson-04", n: 4, title: "Python Lists and 2D Lists",
          summary: "Indexing, traversal, updating by index, nested lists, nested loops, and simple table-like data.",
          tags: ["Class 04", "Lists", "2D Lists", "Lab"],
          duration: "2 hours", status: "ready" },
        { id: "lesson-05", n: 5, title: "Python Tuples and Unpacking",
          summary: "Ordered immutable records, unpacking, tuple updates, starred unpacking, and multiple return values.",
          tags: ["Class 05", "Tuples", "Unpacking", "Lab"],
          duration: "2 hours", status: "ready" },
        { id: "lesson-06", n: 6, title: "Python Dictionaries and Word Frequency",
          summary: "Key-value mapping, get / keys / values / items, updating dictionaries, and a word-frequency mini project.",
          tags: ["Class 06", "Dictionaries", "Project", "Lab"],
          duration: "2 hours", status: "ready" },
      ],
    },
  ],
};

// =====================================================================
// SHARED CSS (index + course pages)
// =====================================================================
const siteCss = `
:root{--navy:${C.navy};--teal:${C.teal};--tealb:${C.tealBright};--coral:${C.coral};--amber:${C.amber};--ink:${C.ink};--muted:${C.muted};--line:${C.line};--cloud:${C.cloud};--cloud2:${C.cloud2};--white:#fff;--green:${C.green}}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{font-family:-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--ink);background:var(--cloud2);line-height:1.5}
a{color:var(--teal);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
header.site{background:linear-gradient(135deg,var(--navy),#16406e);color:#fff;padding:34px 0 30px}
header.site .wrap{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.logo{width:46px;height:46px;border-radius:11px;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.25)}
header.site h1{font-size:23px;margin:0;font-weight:700}
header.site p{margin:3px 0 0;color:#cfe0ef;font-size:14px}
.controls{margin:26px 0 8px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
#q{flex:1;min-width:240px;padding:13px 16px;border:1px solid var(--line);border-radius:11px;font-size:15px;background:#fff;box-shadow:0 1px 3px rgba(20,40,70,.05)}
#q:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 3px rgba(15,157,176,.15)}
.tags{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 22px}
.chip{font-size:12.5px;padding:6px 12px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--muted);cursor:pointer;user-select:none;transition:.12s}
.chip:hover{border-color:var(--teal);color:var(--teal)}.chip.on{background:var(--teal);border-color:var(--teal);color:#fff}
.count{color:var(--muted);font-size:13px;margin:0 0 14px}
.course{margin:30px 0 8px}.course h2{font-size:18px;margin:0 0 3px;color:var(--navy)}
.course .sub{color:var(--muted);font-size:14px;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:16px}
.card{display:block;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;transition:.14s;position:relative;overflow:hidden}
.card:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(20,40,70,.10);text-decoration:none;border-color:#bcd2e8}
.card .num{font-size:12px;font-weight:700;color:var(--teal);letter-spacing:1px}
.card h3{font-size:15.5px;margin:6px 0 8px;color:var(--navy);line-height:1.32}
.card p{font-size:13px;color:var(--muted);margin:0 0 12px;min-height:34px}
.card .ct{display:flex;gap:6px;flex-wrap:wrap}.ct .t{font-size:11px;color:var(--muted);background:var(--cloud);border-radius:6px;padding:2px 7px}
.card.ready .num::after{content:"● READY";float:right;color:var(--green);font-size:10px}
.card.planned{opacity:.6;pointer-events:none}.card.planned .num::after{content:"SOON";float:right;color:var(--muted);font-size:10px}
.empty{color:var(--muted);padding:40px 0;text-align:center}
footer.site{color:var(--muted);font-size:12.5px;text-align:center;padding:40px 0 30px}
.crumb{color:var(--muted);font-size:13px;margin:18px 0 0}.crumb a{color:var(--teal)}
.donate-btn{margin-left:auto;background:var(--coral);color:#fff!important;border-radius:999px;padding:9px 18px;font-size:13.5px;font-weight:700;text-decoration:none!important;box-shadow:0 4px 14px rgba(238,107,54,.35);white-space:nowrap}
.donate-btn:hover{background:#d85a28}
.main-btn{margin-left:auto;background:#fff;color:var(--teal)!important;border:1px solid rgba(255,255,255,.45);border-radius:999px;padding:9px 16px;font-size:13px;font-weight:700;text-decoration:none!important;white-space:nowrap}
.main-btn:hover{background:var(--cloud);text-decoration:none!important}
`;

function siteIndex() {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(CATALOG.site)}</title><meta name="description" content="${esc(CATALOG.tagline)}">
<link rel="stylesheet" href="assets/site.css"></head><body>
<header class="site"><div class="wrap"><div class="logo">${esc(CATALOG.logo || "AI")}</div>
<div><h1>${esc(CATALOG.site)}</h1><p>${esc(CATALOG.tagline)}</p></div>
${DONATE_URL ? `<a class="donate-btn" href="${DONATE_URL}" target="_blank" rel="noopener">♥ Donate</a>` : ""}</div></header>
<main class="wrap">
  <div class="controls"><input id="q" type="search" placeholder="Search courses & classes — e.g. ChatGPT, neural network, data…" autocomplete="off"></div>
  <div class="tags" id="tags"></div><p class="count" id="count"></p><div id="results"></div>
</main>
<footer class="site">${esc(CATALOG.site)}</footer>
<script>window.CATALOG=${JSON.stringify(CATALOG)};</script>
<script src="assets/site.js"></script></body></html>`;
}

const siteJs = `
(function(){
  var cat=window.CATALOG,q=document.getElementById('q'),tagsEl=document.getElementById('tags'),resEl=document.getElementById('results'),countEl=document.getElementById('count'),active=new Set();
  var items=[];cat.courses.forEach(function(co){(co.decks||[]).forEach(function(d){items.push({co:co,d:d,hay:((co.title+' '+(d.title||'')+' '+(d.summary||'')+' '+((d.tags||[]).join(' '))+' '+((co.tags||[]).join(' '))).toLowerCase())})})});
  var tagSet={};cat.courses.forEach(function(co){(co.tags||[]).forEach(function(t){tagSet[t]=1});(co.decks||[]).forEach(function(d){(d.tags||[]).forEach(function(t){tagSet[t]=1})})});
  Object.keys(tagSet).sort().forEach(function(t){var c=document.createElement('span');c.className='chip';c.textContent=t;c.onclick=function(){if(active.has(t)){active.delete(t);c.classList.remove('on')}else{active.add(t);c.classList.add('on')}render()};tagsEl.appendChild(c)});
  function matches(it){var s=q.value.trim().toLowerCase();if(s&&it.hay.indexOf(s)<0)return false;if(active.size){var dt=new Set([].concat(it.d.tags||[],it.co.tags||[]));for(var t of active){if(!dt.has(t))return false}}return true}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function render(){var shown=items.filter(matches);countEl.textContent=shown.length+' class'+(shown.length===1?'':'es')+(q.value||active.size?' match':' available');var html='';
    cat.courses.forEach(function(co){var ds=shown.filter(function(it){return it.co.id===co.id});if(!ds.length)return;
      html+='<section class="course"><h2>'+esc(co.title)+'</h2><p class="sub">'+esc(co.subtitle||'')+'</p><div class="grid">';
      ds.forEach(function(it){var d=it.d,ready=d.status==='ready',href=ready?co.id+'/'+d.id+'/':'#';
        html+='<a class="card '+(ready?'ready':'planned')+'" href="'+href+'"><div class="num">CLASS '+String(d.n).padStart(2,"0")+'</div><h3>'+esc(d.title||'')+'</h3><p>'+esc(d.summary||'')+'</p><div class="ct">'+(d.tags||[]).slice(0,4).map(function(t){return '<span class="t">'+esc(t)+'</span>'}).join('')+'</div></a>'});
      html+='</div></section>'});
    resEl.innerHTML=html||'<p class="empty">No classes match. Try a different search or clear the tags.</p>'}
  q.addEventListener('input',render);render();
})();`;

function courseIndex(co) {
  const cards = co.decks.map((d) => {
    const ready = d.status === "ready"; const href = ready ? d.id + "/" : "#";
    return `<a class="card ${ready ? "ready" : "planned"}" href="${href}"><div class="num">CLASS ${String(d.n).padStart(2, "0")}</div><h3>${esc(d.title)}</h3><p>${esc(d.summary || "")}</p><div class="ct">${(d.tags || []).slice(0, 4).map((t) => `<span class="t">${esc(t)}</span>`).join("")}</div></a>`;
  }).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(co.title)} — Merit Point Academy</title><link rel="stylesheet" href="../assets/site.css"></head><body>
<header class="site"><div class="wrap"><div class="logo">${esc(CATALOG.logo || "AI")}</div><div><h1>${esc(co.title)}</h1><p>${esc(co.subtitle || "")}</p></div>
<a class="main-btn" href="../">← Main Page</a>
${DONATE_URL ? `<a class="donate-btn" href="${DONATE_URL}" target="_blank" rel="noopener">♥ Donate</a>` : ""}</div></header>
<main class="wrap"><p class="crumb"><a href="../">← All courses</a></p><div class="grid" style="margin-top:22px">${cards}</div></main>
<footer class="site">${esc(co.title)}</footer></body></html>`;
}

// =====================================================================
// DECK CSS
// =====================================================================
const deckCss = `
:root{--navy:${C.navy};--navy2:${C.navy2};--blue:${C.blue};--teal:${C.teal};--tealb:${C.tealBright};--coral:${C.coral};--amber:${C.amber};--green:${C.green};--ink:${C.ink};--muted:${C.muted};--line:${C.line};--cloud:${C.cloud};--cloud2:${C.cloud2}}
.reveal{font-family:-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--ink);font-size:30px}
.reveal h1,.reveal h2,.reveal h3{font-family:Georgia,serif;color:var(--navy);text-transform:none;letter-spacing:0;font-weight:700;line-height:1.12}
.reveal h1{font-size:1.55em}.reveal h2{font-size:1.12em}.reveal h3{font-size:.9em}
.reveal .kicker{color:var(--teal);font-weight:700;letter-spacing:3px;font-size:.44em;text-transform:uppercase;margin-bottom:.35em;font-family:-apple-system,sans-serif}
.reveal section{text-align:left}.reveal section.center{text-align:center}
.reveal ul,.reveal ol{margin-left:1.05em}.reveal li{margin:.28em 0;font-size:.7em;line-height:1.38}
.reveal p{font-size:.74em;line-height:1.42}.reveal .lead{font-size:.82em}.reveal .muted{color:var(--muted)}
.reveal .callout{background:var(--cloud);border-left:6px solid var(--teal);border-radius:8px;padding:.45em .8em;margin-top:.5em;font-size:.7em}
.reveal .callout b{color:var(--teal)}
.reveal .pill{display:inline-block;background:#fff;border:1px solid var(--line);border-radius:999px;padding:.16em .7em;font-size:.55em;color:var(--navy);margin:.12em .18em}
.reveal .grid2{display:grid;grid-template-columns:1fr 1fr;gap:.65em}.reveal .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6em}
.reveal .box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:.6em .75em;box-shadow:0 4px 14px rgba(20,40,70,.06)}
.reveal .box h3{margin:.05em 0 .2em}.reveal .box p{font-size:.58em;margin:0}
.reveal .feature{display:inline-block;font-size:.55em;font-weight:700;color:#fff;background:var(--navy);border-radius:6px;padding:.1em .55em;margin-top:.25em}
.reveal .vid{display:grid;grid-template-columns:1.5fr 1fr;gap:1em;align-items:center}
.reveal .poster{border-radius:12px;height:2.7em;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.25em;text-align:center;box-shadow:0 8px 24px rgba(20,40,70,.18);position:relative}
.reveal .poster .play{position:absolute;width:1em;height:1em;border-radius:50%;background:rgba(255,255,255,.92);color:var(--navy);display:flex;align-items:center;justify-content:center;font-size:.5em}
.reveal .qr{width:1.6em;height:1.6em;border:1px solid var(--line);border-radius:8px;background:#fff;padding:4px}
.reveal .qrwrap{text-align:center;font-size:.5em;color:var(--muted)}.reveal .qrwrap a{color:var(--teal);word-break:break-all}
.reveal a.btn{display:inline-block;background:#fff;border:1px solid var(--teal);color:var(--teal);border-radius:8px;padding:.16em .7em;font-size:.58em;font-weight:600}
.reveal .src{font-size:.5em;color:var(--muted);margin-top:.5em}
.reveal blockquote{border:none;box-shadow:none;background:var(--cloud2);border-left:6px solid var(--teal);border-radius:8px;font-size:.76em;font-style:normal;width:100%;padding:.65em 1em}
.reveal .speak{cursor:pointer;display:inline-flex;align-items:center;gap:.4em;background:var(--teal);color:#fff;border:none;border-radius:999px;padding:.28em .85em;font-size:.52em;font-weight:700;font-family:-apple-system,sans-serif;box-shadow:0 4px 12px rgba(15,157,176,.3)}
.reveal .speak:hover{background:#0d8a9b}.reveal .speak.playing{background:var(--coral)}
.reveal .prof-quote{background:#fff;border:1px solid var(--line);border-left:6px solid var(--amber);border-radius:12px;padding:.55em .75em;margin-top:.55em;box-shadow:0 6px 18px rgba(20,40,70,.07)}
.reveal .prof-quote .label{font-size:.48em;color:var(--muted);font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.22em}
.reveal .prof-quote blockquote{margin:.12em 0;background:var(--cloud2);font-size:.68em}
.reveal .prof-quote .explain{font-size:.58em;color:var(--muted);margin:.45em 0 0}
.lang-en{display:none}
body.lang-en .lang-zh{display:none!important}
body.lang-en .lang-en{display:inline!important}
body.lang-en .prof-quote .lang-en{display:block!important}
body.lang-en .prof-quote .lang-zh{display:none!important}
/* timeline */
.reveal .tl{display:flex;gap:.4em;align-items:stretch;margin-top:.5em}
.reveal .tl .ev{flex:1;background:#fff;border:1px solid var(--line);border-top:4px solid var(--teal);border-radius:10px;padding:.45em .5em}
.reveal .tl .ev.winter{border-top-color:#7FA8D0}.reveal .tl .ev.boom{border-top-color:var(--coral)}
.reveal .tl .yr{font-family:Georgia,serif;font-weight:800;color:var(--navy);font-size:.72em}
.reveal .tl .ev b{font-size:.56em;color:var(--navy);display:block;margin:.1em 0}.reveal .tl .ev span{font-size:.5em;color:var(--muted);line-height:1.25;display:block}
/* flow steps */
.reveal .flow{display:flex;flex-wrap:wrap;gap:.4em;align-items:stretch}
.reveal .step{flex:1 1 0;min-width:2.3em;background:#fff;border:1px solid var(--line);border-radius:10px;padding:.38em .42em;position:relative}
.reveal .step .n{position:absolute;top:-.5em;left:-.3em;width:1em;height:1em;border-radius:50%;background:var(--teal);color:#fff;font-size:.5em;font-weight:800;display:flex;align-items:center;justify-content:center}
.reveal .step b{font-size:.56em;color:var(--navy);display:block;line-height:1.15}.reveal .step span{font-size:.48em;color:var(--muted)}
.reveal .step.loop{border-color:var(--coral);border-style:dashed}
/* prompt cards */
.reveal .prompt{background:#0f2742;color:#dfeaf6;border-radius:9px;padding:.4em .65em;font-family:Consolas,monospace;font-size:.54em;margin:.26em 0;line-height:1.38}
.reveal .prompt .you{color:var(--tealb);font-weight:700}
/* skills */
.reveal .skillcard{background:linear-gradient(135deg,#fff,var(--cloud));border:1px solid var(--line);border-radius:14px;padding:.65em .8em}
.reveal .skillcard .cn{font-size:.95em;color:var(--navy);font-weight:700;font-family:Georgia,serif}
/* QUIZ */
.reveal .quiz{background:#fff;border:1px solid var(--line);border-radius:14px;padding:.7em .85em;box-shadow:0 6px 18px rgba(20,40,70,.07);max-width:18em}
.reveal .quiz .qq{font-size:.72em;font-weight:600;color:var(--navy);margin:0 0 .5em}
.reveal .quiz .opt{display:block;width:100%;text-align:left;background:var(--cloud2);border:1px solid var(--line);border-radius:9px;padding:.4em .6em;margin:.25em 0;font-size:.6em;color:var(--ink);cursor:pointer;transition:.1s;font-family:-apple-system,sans-serif}
.reveal .quiz .opt:hover{border-color:var(--teal);background:#fff}
.reveal .quiz .opt.correct{background:#E6F4EE;border-color:var(--green);color:#0d6b4f;font-weight:600}
.reveal .quiz .opt.wrong{background:#FBEAE7;border-color:var(--coral);color:#a23c1c}
.reveal .quiz .opt[disabled]{cursor:default}
.reveal .quiz-exp{font-size:.56em;color:var(--muted);margin:.4em 0 0;display:none}
.reveal .quiz.answered .quiz-exp{display:block}
.reveal .quiz-badge{font-size:.5em;color:var(--teal);font-weight:700;letter-spacing:1px}
/* CODE LAB */
.reveal .lab{display:grid;grid-template-columns:1.55fr 1fr;gap:.6em;margin-top:.4em;height:11.2em}
.reveal .lab-main{display:flex;flex-direction:column;min-width:0}
.reveal .lab textarea.code{flex:1;width:100%;background:#0f2742;color:#e7f0fb;border:1px solid #21405f;border-radius:10px 10px 0 0;font-family:Consolas,"SF Mono",monospace;font-size:13px;line-height:1.4;padding:.5em .6em;resize:none;outline:none;tab-size:4}
.reveal .lab-bar{display:flex;align-items:center;gap:.4em;background:#11314f;border:1px solid #21405f;border-top:none;padding:.3em .4em;flex-wrap:wrap}
.reveal .lab-bar button{font-family:-apple-system,sans-serif;font-size:11px;font-weight:600;border:none;border-radius:7px;padding:.4em .7em;cursor:pointer}
.reveal .lab-bar .run{background:var(--green);color:#fff}.reveal .lab-bar .run:hover{background:#178a64}
.reveal .lab-bar .ai-explain,.reveal .lab-bar .ai-debug,.reveal .lab-bar .ai-improve{background:#1b3e5e;color:#cfe0ef}
.reveal .lab-bar .ai-explain:hover,.reveal .lab-bar .ai-debug:hover,.reveal .lab-bar .ai-improve:hover{background:#27557d}
.reveal .lab-status{font-size:10.5px;color:#9db8d6;margin-left:auto;font-family:-apple-system,sans-serif}
.reveal .lab pre.out{background:#08192b;color:#bfe3c7;border:1px solid #21405f;border-top:none;border-radius:0 0 10px 10px;margin:0;padding:.5em .6em;font-family:Consolas,monospace;font-size:11.5px;line-height:1.4;overflow:auto;min-height:2.4em;max-height:4.2em;white-space:pre-wrap}
.reveal .lab pre.out .err{color:#ff9b8a}
.reveal .assist{display:flex;flex-direction:column;background:linear-gradient(135deg,#fff,#f1f7fb);border:1px solid var(--line);border-radius:11px;overflow:hidden;min-width:0}
.reveal .assist-head{background:linear-gradient(90deg,#0F9DB0,#2BC4D4);color:#fff;font-size:12px;font-weight:700;padding:.45em .7em;font-family:-apple-system,sans-serif}
.reveal .assist-body{flex:1;overflow:auto;padding:.5em .65em;font-size:12px;line-height:1.46;color:var(--ink);font-family:-apple-system,sans-serif}
.reveal .assist-body p{font-size:12px;margin:.3em 0}.reveal .assist-body code{background:#eef3f8;border-radius:4px;padding:0 .25em;font-family:Consolas,monospace;font-size:11px}
.reveal .assist-body pre{background:#0f2742;color:#e7f0fb;border-radius:8px;padding:.5em .6em;font-size:11px;overflow:auto;white-space:pre}
.reveal .assist-body pre code{background:none;color:inherit}
.reveal .assist-body .apply{background:var(--teal);color:#fff;border:none;border-radius:6px;padding:.25em .6em;font-size:11px;font-weight:600;cursor:pointer;margin-top:.2em}
.reveal .assist-ask{display:flex;gap:.3em;border-top:1px solid var(--line);padding:.4em}
.reveal .assist-ask input{flex:1;border:1px solid var(--line);border-radius:7px;padding:.4em .5em;font-size:12px;font-family:-apple-system,sans-serif;outline:none}
.reveal .assist-ask button{background:var(--navy);color:#fff;border:none;border-radius:7px;padding:.4em .7em;font-size:12px;font-weight:600;cursor:pointer}
/* HEAP / TOP-K VISUALIZER */
.reveal .heapviz{margin-top:.35em;font-family:-apple-system,sans-serif}
.reveal .hv-top{display:grid;grid-template-columns:1.3fr 1fr;gap:14px}
.reveal .hv-code{background:#0f2742;border-radius:10px 10px 0 0;padding:8px 12px;border:1px solid #21405f;border-bottom:none}
.reveal .hv-code-title{color:#9db8d6;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;margin-bottom:4px}
.reveal .hv-code pre.hv-pre{margin:0;color:#e7f0fb;font-family:Consolas,"SF Mono",monospace;font-size:11.5px;line-height:1.5;max-height:150px;overflow:auto;white-space:pre}
.reveal .hv-info{background:#eef4fa;border:1px solid #21405f22;border-top:none;border-radius:0 0 10px 10px;padding:6px 12px;font-size:11px;color:var(--muted)}
.reveal .hv-panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 14px;display:flex;flex-direction:column;gap:6px}
.reveal .hv-panel label{font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin-top:4px}
.reveal .hv-panel label:first-child{margin-top:0}
.reveal .hv-row{display:flex;gap:6px}
.reveal .hv-input{flex:1;border:1px solid var(--line);border-radius:7px;padding:6px 9px;font-size:13px;font-family:-apple-system,sans-serif;min-width:0}
.reveal .hv-insert{background:var(--green);color:#fff;border:none;border-radius:7px;padding:6px 12px;font-size:12.5px;font-weight:700;cursor:pointer}
.reveal .hv-quick{display:flex;gap:5px;flex-wrap:wrap}
.reveal .hv-quick-btn{background:var(--cloud);border:1px solid var(--line);border-radius:7px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;color:var(--ink)}
.reveal .hv-quick-btn:hover{border-color:var(--teal);color:var(--teal)}
.reveal .hv-arr-now{background:var(--cloud2);border:1px solid var(--line);border-radius:7px;padding:6px 9px;font-family:Consolas,monospace;font-size:12.5px}
.reveal .hv-status,.reveal .hv-action{font-size:12px;color:var(--ink)}
.reveal .hv-frames-label{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin:10px 0 4px}
.reveal .hv-frames{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.reveal .hv-frame{flex:0 0 auto;min-width:150px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 8px;text-align:center}
.reveal .hv-frame-active{border-color:var(--teal);box-shadow:0 0 0 2px rgba(15,157,176,.18)}
.reveal .hv-frame-title{font-size:11px;font-weight:700;color:var(--navy)}
.reveal .hv-frame-desc{font-size:9.5px;color:var(--muted);min-height:1.6em;line-height:1.25;margin:2px 0}
.reveal .hv-tree-svg{width:100%;height:80px}
.reveal .hv-empty{color:var(--muted);font-size:10.5px;padding:20px 0}
.reveal .hv-node{fill:#D6ECEF;stroke:#0B7E8A;stroke-width:1.5}
.reveal .hv-node-hi{fill:#F2A93B;stroke:#c07f1a}
.reveal .hv-node-text{font-size:9px;font-weight:700;fill:#0C2D52;text-anchor:middle;font-family:-apple-system,sans-serif}
.reveal .hv-edge{stroke:#c7d6e4;stroke-width:1.5}
.reveal .hv-swap{stroke:#C0392B;stroke-width:2;stroke-dasharray:3,2}
.reveal .hv-arrs{display:flex;gap:8px;overflow-x:auto;margin-top:6px}
.reveal .hv-arr{flex:0 0 auto;min-width:150px;text-align:center;font-family:Consolas,monospace;font-size:11.5px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:5px 8px;color:var(--ink)}
.reveal .hv-arr-active{border-color:var(--teal)}
.reveal .hv-arr-hi{color:#C0392B;font-weight:700}
.reveal .hv-controls{display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap}
.reveal .hv-controls button{background:#fff;border:1px solid var(--line);border-radius:7px;padding:5px 10px;font-size:11.5px;font-weight:600;cursor:pointer;color:var(--ink);font-family:-apple-system,sans-serif}
.reveal .hv-controls button:hover{border-color:var(--teal);color:var(--teal)}
.reveal .hv-play{background:var(--teal)!important;color:#fff!important;border-color:var(--teal)!important}
.reveal .hv-speed-label{font-size:11px;color:var(--muted);margin-left:6px}
/* comments */
#homeBtn,#langBtn{position:fixed;top:14px;z-index:60;border-radius:999px;padding:8px 14px;font-size:12.5px;font-weight:800;font-family:-apple-system,sans-serif;text-decoration:none;box-shadow:0 6px 18px rgba(20,40,70,.24)}
#homeBtn{left:16px;background:#fff;color:var(--teal);border:1px solid var(--line)}
#homeBtn:hover{text-decoration:none;background:var(--cloud)}
#langBtn{left:132px;background:var(--navy);color:#fff;border:none;cursor:pointer}
#langBtn:hover{filter:brightness(1.1)}
#commentBtn{position:fixed;right:16px;top:14px;z-index:60;background:var(--teal);color:#fff;border:none;border-radius:999px;padding:9px 15px;font-size:13px;font-weight:700;font-family:-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(15,157,176,.4)}
#commentBtn:hover{background:#0d8a9b}#commentBtn .cnum{background:#fff;color:var(--teal);border-radius:999px;padding:0 6px;margin-left:5px;font-size:11px}
#listenBtn{--p:0%;position:fixed;right:148px;bottom:14px;z-index:60;min-width:128px;justify-content:center;color:#fff;border:none;border-radius:999px;padding:9px 15px;font-size:13px;font-weight:700;font-family:-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(20,40,70,.34);display:none;align-items:center;gap:.45em;background:linear-gradient(to right,var(--teal) var(--p),var(--navy) var(--p));transition:background .15s linear}
#listenBtn:hover{filter:brightness(1.1)}
#listenBtn.playing{background:linear-gradient(to right,var(--coral) var(--p),#16406e var(--p))}
#listenBtn .li-ic{font-size:12px;line-height:1}#listenBtn .li-tx{font-variant-numeric:tabular-nums;font-size:11.5px;opacity:.92}
#ccBtn{position:fixed;right:286px;bottom:14px;z-index:60;background:var(--navy);color:#fff;border:none;border-radius:999px;padding:9px 12px;font-size:11.5px;font-weight:800;letter-spacing:.03em;font-family:-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(20,40,70,.34);display:none;opacity:.5}
#ccBtn:hover{opacity:.8}#ccBtn.on{opacity:1;background:var(--teal)}
#capBar{position:fixed;left:50%;bottom:58px;transform:translateX(-50%);max-width:70%;background:rgba(8,16,30,.88);color:#fff;padding:.4em 1em;border-radius:9px;font-size:13.5px;line-height:1.35;text-align:center;z-index:59;display:none;font-family:-apple-system,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)}
#commentPanel{position:fixed;right:16px;top:60px;width:340px;max-height:64vh;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 16px 44px rgba(20,40,70,.22);z-index:61;display:none;flex-direction:column;font-family:-apple-system,sans-serif;overflow:hidden}
#commentPanel.open{display:flex}
#commentPanel .ph{background:var(--navy);color:#fff;padding:10px 14px;font-size:13px;font-weight:700;display:flex;justify-content:space-between;align-items:center}
#commentPanel .ph .x{cursor:pointer;opacity:.8}#commentPanel .ph .x:hover{opacity:1}
#commentList{flex:1;overflow:auto;padding:10px 14px}
#commentList .c{border-bottom:1px solid var(--cloud);padding:7px 0}#commentList .c:last-child{border:none}
#commentList .c .cn{font-size:12px;font-weight:700;color:var(--navy)}#commentList .c .ct{font-size:10px;color:var(--muted);margin-left:6px}
#commentList .c .cb{font-size:13px;color:var(--ink);margin-top:2px;white-space:pre-wrap;word-break:break-word}
#commentList .none{color:var(--muted);font-size:12.5px;text-align:center;padding:14px 0}
#commentForm{border-top:1px solid var(--line);padding:10px 12px;display:flex;flex-direction:column;gap:6px}
#commentForm input,#commentForm textarea{border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:13px;font-family:-apple-system,sans-serif;outline:none}
#commentForm textarea{resize:vertical;min-height:46px}
#commentForm .row{display:flex;gap:6px;align-items:center}
#commentForm button{background:var(--teal);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer}
#commentForm .msg{font-size:11px;color:var(--muted)}
/* donate */
#donateBtn{position:fixed;left:16px;top:14px;z-index:60;background:var(--coral);color:#fff;border-radius:999px;padding:8px 16px;font-size:12.5px;font-weight:700;font-family:-apple-system,sans-serif;text-decoration:none;box-shadow:0 6px 18px rgba(238,107,54,.4)}
#donateBtn:hover{background:#d85a28;text-decoration:none}
/* slide number: default bottom-right collides with the comment/listen/cc button row, so move it to bottom-left */
.reveal .slide-number{left:14px;right:auto;bottom:14px;z-index:58;background:rgba(255,255,255,.85);padding:2px 8px;border-radius:6px;color:var(--muted)}
body{display:block!important}
body.reveal-fallback{overflow:auto;background:#102f53;color:#fff}
body.reveal-fallback .reveal,body.reveal-fallback .slides{position:static!important;width:100%!important;height:auto!important;overflow:visible!important;transform:none!important}
body.reveal-fallback .slides section{position:static!important;display:none!important;width:auto!important;height:auto!important;min-height:100vh!important;padding:7vh 8vw!important;transform:none!important}
body.reveal-fallback .slides section.present,body.reveal-fallback .slides section:first-child{display:block!important}
`;

// =====================================================================
// SLIDE HELPERS
// =====================================================================
const grad = (a, b) => `background:linear-gradient(135deg,${a},${b})`;
const sec = (sid, inner, cls, bg) => `<section id="${sid}" data-sid="${sid}"${cls ? ` class="${cls}"` : ""}${bg ? ` ${bg}` : ""}>\n${inner}\n</section>`;

function quizSlide(sid, kicker, q, opts, correct, explain, notes) {
  const o = opts.map((t, i) => `<button class="opt" data-i="${i}">${esc(t)}</button>`).join("");
  return sec(sid, `<div class="kicker">${esc(kicker)}</div>
  <h2>Quick check <span class="quiz-badge">· tap an answer</span></h2>
  <div class="quiz" data-correct="${correct}">
    <p class="qq">${q}</p>
    <div class="opts">${o}</div>
    <p class="quiz-exp">${esc(explain)}</p>
  </div>
  <aside class="notes">${esc(notes || "")}</aside>`);
}

function videoSlide(sid, { era, title, feature, desc, link, qr, posterText, posterGrad }, notes) {
  return sec(sid, `<div class="kicker">AI ON SCREEN · ${era}</div>
  <h2>${esc(title)}</h2>
  <div class="vid" style="margin-top:.3em">
    <div><span class="feature">FEATURE: ${esc(feature)}</span>
      <p style="margin-top:.3em">${desc}</p>
      <a class="btn" href="${link}" target="_blank" rel="noopener">▶ Watch the clip</a></div>
    <div class="qrwrap"><div class="poster" style="${posterGrad}">${posterText}<div class="play">▶</div></div>
      ${qr ? `<img class="qr" src="assets/${qr}.png" alt="QR"><br>` : ""}<a href="${link}" target="_blank" rel="noopener">scan / tap to open</a></div>
  </div><aside class="notes">${esc(notes)}</aside>`);
}

function demoSlide(sid, { kicker, title, intro, prompts, link, linkLabel, qr }, notes) {
  const pl = prompts.map((p) => `<div class="prompt"><span class="you">You ▸</span> ${esc(p)}</div>`).join("");
  return sec(sid, `<div class="kicker">${esc(kicker)}</div>
  <h2>${esc(title)}</h2>
  <p class="lead" style="margin:.15em 0 .35em">${esc(intro)}</p>
  <div class="grid2" style="grid-template-columns:2.3fr 1fr;align-items:start">
    <div>${pl}</div>
    <div class="qrwrap" style="margin-top:.2em">${qr ? `<img class="qr" src="assets/${qr}.png" alt="QR"><br>` : ""}<a href="${link}" target="_blank" rel="noopener">${esc(linkLabel)}</a></div>
  </div><aside class="notes">${esc(notes)}</aside>`);
}

function labSlide(sid, kicker, title, intro, code, packages, notes) {
  return sec(sid, `<div class="kicker">${esc(kicker)}</div>
  <h2>${esc(title)}</h2>
  <p class="lead" style="margin:.1em 0 .25em">${intro}</p>
  <div class="lab" data-packages="${(packages || []).join(",")}">
    <div class="lab-main">
      <textarea class="code" spellcheck="false">${esc(code)}</textarea>
      <div class="lab-bar">
        <button class="run">▶ Run</button>
        <button class="ai-explain">✨ Explain</button>
        <button class="ai-debug">🐞 Debug</button>
        <button class="ai-improve">⚡ Improve</button>
        <span class="lab-status">Python loads on first Run</span>
      </div>
      <pre class="out">▶ Run the code to see the output here.</pre>
    </div>
    <div class="assist">
      <div class="assist-head">✨ AI Assistant</div>
      <div class="assist-body">Hi! Edit the code and hit <b>Run</b>. Stuck? I can <b>Explain</b>, <b>Debug</b>, or <b>Improve</b> it — or just ask me below.</div>
      <div class="assist-ask"><input class="ask-in" placeholder="Ask about this code…"><button class="ask-btn">Ask</button></div>
    </div>
  </div><aside class="notes">${esc(notes)}</aside>`);
}

function profQuote({ quoteZh, quoteEn, explainZh, explainEn }) {
  return `<div class="prof-quote">
    <div class="label"><span class="lang-zh">商博老师 · 朗读 / 解释</span><span class="lang-en">Professor Shangbo · Quote / Explanation</span></div>
    <blockquote>
      <span class="lang-zh">${esc(quoteZh)}</span>
      <span class="lang-en">${esc(quoteEn)}</span>
    </blockquote>
    <p class="explain">
      <span class="lang-zh">${esc(explainZh)}</span>
      <span class="lang-en">${esc(explainEn)}</span>
    </p>
    <button class="speak" data-text-zh="${esc(quoteZh + " " + explainZh)}" data-text-en="${esc(quoteEn + " " + explainEn)}">
      <span class="lang-zh">朗读这段话</span><span class="lang-en">Read this aloud</span>
    </button>
  </div>`;
}

function heapVizSlide(sid, kicker, title, intro, preset, notes) {
  return sec(sid, `<div class="kicker">${esc(kicker)}</div>
  <h2>${esc(title)}</h2>
  <p class="lead" style="margin:.1em 0 .25em">${intro}</p>
  <div class="heapviz" data-preset="${preset.join(",")}">
    <div class="hv-top">
      <div class="hv-code">
        <div class="hv-code-title">heapq · sift-up on insert</div>
        <pre class="hv-pre">def heappush_with_steps(self, val):
    self.heap.append(val)
    self._sift_up(len(self.heap) - 1)

def _sift_up(self, idx):
    while idx > 0:
        parent = (idx - 1) // 2
        if self.heap[parent] > self.heap[idx]:
            self.heap[parent], self.heap[idx] = \\
                self.heap[idx], self.heap[parent]
            idx = parent
        else:
            break</pre>
        <div class="hv-info">Min-heap property: every parent ≤ its children.</div>
      </div>
      <div class="hv-panel">
        <label>Insert value</label>
        <div class="hv-row"><input class="hv-input" type="number" placeholder="e.g., 7"><button class="hv-insert">Insert</button></div>
        <label>Quick insert</label>
        <div class="hv-quick"></div>
        <label>Current heap (array)</label>
        <div class="hv-arr-now">[]</div>
        <div class="hv-status"><b>Step:</b> <span class="hv-step">0 / 0</span></div>
        <div class="hv-action"><b>Action:</b> <span class="hv-action-text"></span></div>
      </div>
    </div>
    <div class="hv-frames-label">Heap as a binary tree</div>
    <div class="hv-frames"></div>
    <div class="hv-arrs"></div>
    <div class="hv-controls">
      <button type="button" class="hv-first">⏮ First</button>
      <button type="button" class="hv-prev">◀ Prev</button>
      <button type="button" class="hv-play">▶ Play</button>
      <button type="button" class="hv-next">Next ▶</button>
      <button type="button" class="hv-last">Last ⏭</button>
      <span class="hv-speed-label">Speed</span><input class="hv-speed" type="range" min="1" max="5" value="3">
    </div>
  </div>
  <aside class="notes">${esc(notes)}</aside>`);
}

// =====================================================================
// 示例课 LESSON 01 — 每种幻灯片组件的用法演示
//
// 套用三步：
//   1. 把这个函数整个复制一份，改名（如 buildLesson02），替换成你的内容
//   2. 在文件底部 DECK_BUILDERS 里注册它
//   3. 把 CATALOG 里对应 deck 条目的 status 改为 "ready"，运行 node build.js
//
// ⚠ 每页第一个参数是 sid（唯一英文短名）——它是这一页评论和语音的
//   "身份证"。定稿后不要改名，否则该页已有的评论/语音会对不上。
// =====================================================================
function buildLesson01() {
  const S = [];

  // ── 组件 1：标题页 ─────────────────────────────────────────────────
  // sec(sid, 内容HTML, 可选class, 可选背景)。"center" 让内容居中，
  // data-background-gradient 给整页加深色渐变（适合开头/结尾页）。
  S.push(sec("title", `<div class="kicker" style="color:#7fd3df">示例课程 · Lesson 01</div>
    <h1 style="color:#fff">网页课件模板<br>组件演示课</h1>
    <p style="color:#cfe0ef;margin-top:.5em">往后翻：一页演示一种组件，直接复制、改文字就能用。</p>
    <p style="color:#9db8d6;font-size:.58em;margin-top:1.1em">按 <b>S</b> 看讲稿 · <b>→</b> 下一页 · 💬 给任何一页留言</p>
    <aside class="notes">这里是"演讲者备注"（aside.notes）：写课上要说的话、提醒、参考答案。放映时按 S 打开演讲者视图就能看到；它也是自动语音讲解（narrate.js）的重要素材。</aside>`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  // ── 组件 2：概念卡片（grid3 + box + callout）───────────────────────
  S.push(sec("concept-cards", `<div class="kicker">组件 · 概念卡片</div>
    <h2>讲概念：三张卡片 + 一条要点</h2>
    <p class="lead" style="margin:0 0 .3em">.grid3 是三列卡片（.grid2 两列）；.box 是白色圆角卡；.callout 是底部的要点条。</p>
    <div class="grid3" style="margin-top:.3em">
      <div class="box"><h3 style="color:var(--navy)">第一点</h3><p>卡片里用 h3 做小标题，p 写正文。<b>加粗</b>关键词。</p></div>
      <div class="box"><h3 style="color:var(--teal)">第二点</h3><p>h3 的颜色可以换：navy / teal / coral，用来区分层次。</p></div>
      <div class="box"><h3 style="color:var(--coral)">第三点</h3><p>卡片会自动等高对齐，不用管排版。</p></div>
    </div>
    <div class="callout"><b>要点</b> — callout 用来放这一页最想让学生记住的一句话。</div>
    <aside class="notes">概念页的节奏：先一句导语（.lead），三张卡片分点讲，最后 callout 收束。</aside>`));

  // ── 组件 3：随堂测验 quizSlide ──────────────────────────────────────
  // quizSlide(sid, 左上角小字, 题目, [四个选项], 正确答案下标(从0起), 解析, 备注)
  // 学生点选项立刻显示对错和解析，不用任何后端。
  S.push(quizSlide("quiz-demo", "组件 · 随堂测验", "这套课件里，学生答题后会发生什么？",
    ["什么也不发生，要等老师公布答案", "立刻显示对错，并展开一段解析", "页面会跳转到别的网站", "必须登录才能作答"], 1,
    "点击即判分：选对变绿、选错变红，正确项高亮，下方自动展开解析 — 全部在浏览器本地完成。",
    "测验页穿插在概念之间用来保持注意力。correct 参数是下标：0=第一个选项。"));

  // ── 组件 4：故事页 + 语音按钮 ───────────────────────────────────────
  // blockquote 放故事/引文；.speak 按钮播放 audio/ 目录下的 mp3。
  // 生成音频（可选）：pip install edge-tts 后，例如
  //   edge-tts --voice zh-CN-YunxiNeural --text "你的文字" --write-media <deck目录>/audio/quote.mp3
  // 没有该 mp3 文件时按钮仍会显示，只是点了没声音 — 不影响其他功能。
  S.push(sec("story-speak", `<div class="kicker">组件 · 故事 + 语音</div>
    <h2>用一个故事开场</h2>
    <blockquote id="quote">好课常从一个真实的故事开始：一个悬念、一次失败、一个反转。<b>把故事写在这里</b>，再用下面的按钮配上朗读音频，学生课后也能"听"这一页。</blockquote>
    <div style="margin-top:.4em;display:flex;align-items:center;gap:1em">
      <button class="speak" data-audio="audio/quote.mp3">🔊 <span>朗读这段话</span></button>
      <span class="muted" style="font-size:.52em">神经语音 · 点击播放 / 暂停（需先用 edge-tts 生成 audio/quote.mp3）</span></div>
    <p class="src">.src 是灰色小字，放出处、补充说明。</p>
    <aside class="notes">整页自动讲解是另一件事：运行 node narrate.js 会给每一页生成"教授讲解"音频和字幕（需要 ANTHROPIC_API_KEY），页面右下角出现 Listen 按钮。</aside>`));

  // ── 组件 5：流程图（flow + step）───────────────────────────────────
  S.push(sec("flow-demo", `<div class="kicker">组件 · 流程图</div>
    <h2>讲步骤：带编号的流程卡</h2>
    <p class="lead" style="margin:0 0 .3em">.flow 里放若干 .step，.n 是圆形编号；加 class "loop" 会变成橙色虚线框（表示循环/重点步骤）。</p>
    <div class="flow" style="margin-top:.4em">
      <div class="step"><div class="n">1</div><b>第一步</b><span>每步一句话说明</span></div>
      <div class="step"><div class="n">2</div><b>第二步</b><span>卡片宽度自动平分</span></div>
      <div class="step"><div class="n">3</div><b>第三步</b><span>步骤数量不限</span></div>
      <div class="step loop"><div class="n">4</div><b>循环步骤</b><span>loop 样式 = 橙色虚线</span></div>
    </div>
    <div class="callout">适合讲方法论、实验流程、作业步骤。</div>
    <aside class="notes">流程卡也可以不带编号：去掉 .n 那个 div 即可（首页 hook 常这么用）。</aside>`));

  // ── 组件 6：时间线（tl + ev）───────────────────────────────────────
  S.push(sec("timeline-demo", `<div class="kicker">组件 · 时间线</div>
    <h2>讲历史：横向时间线</h2>
    <p class="lead">.tl 里放 .ev 事件卡：默认青色顶边；class "winter" 变灰蓝、"boom" 变橙色，用颜色讲起伏。</p>
    <div class="tl">
      <div class="ev"><div class="yr">起点</div><b>事件标题</b><span>一两句说明文字。</span></div>
      <div class="ev winter"><div class="yr">低谷</div><b>winter 样式</b><span>灰蓝顶边，讲"寒冬期"。</span></div>
      <div class="ev"><div class="yr">回升</div><b>又一个事件</b><span>默认青色顶边。</span></div>
      <div class="ev boom"><div class="yr">现在</div><b>boom 样式</b><span>橙色顶边，讲"爆发期"。</span></div>
    </div>
    <div class="callout">时间线天然带叙事感 — 适合课程第一课讲学科历史。</div>
    <aside class="notes">yr 不一定是年份，写阶段名也行。</aside>`));

  // ── 组件 7：视频/外链页 videoSlide ─────────────────────────────────
  // videoSlide(sid, {era: 左上角分类, title, feature: 黑标签, desc, link,
  //   qr: 二维码文件名(不带.png，放 assets/ 下；不需要就传 null),
  //   posterText: 海报大字, posterGrad: 海报渐变}, 备注)
  // 生成二维码（可选）：npm install qrcode 后
  //   npx qrcode -o <deck目录>/assets/qr-xxx.png "https://你的链接"
  S.push(videoSlide("video-demo", { era: "组件 · 视频 / 外链页", title: "放一段课堂视频或网页链接", feature: "海报 + 按钮 + 可选二维码",
    desc: `右边是纯 CSS 画的"海报"（不用真图片），左边写介绍。<b>link 可以是任何网址</b>：YouTube/B站视频、工具网站、文档。传了 qr 参数就会在海报下显示二维码，学生手机扫码直接打开。`,
    link: "https://revealjs.com/", qr: null, posterText: "你的<br>视频", posterGrad: grad("#1B2733", "#33506E") },
    "era 参数显示在左上角 kicker 里，用来给几段视频编组（比如 传统→现在→未来）。"));

  // ── 组件 8：现场演示页 demoSlide ───────────────────────────────────
  // demoSlide(sid, {kicker, title, intro, prompts: [提示词数组], link,
  //   linkLabel, qr(可为 null)}, 备注)
  // 深色的 .prompt 卡片用来展示"你要输入什么" — 演示 ChatGPT 等工具时特别好用。
  S.push(demoSlide("demo-prompts", { kicker: "组件 · 现场演示页", title: "演示 AI 工具：提示词卡片", intro: "把课上要现场输入的提示词一条条列出来，讲到哪条复制哪条 — 学生也能课后照着做。",
    prompts: ["把这段概念解释给一个 10 岁的孩子听，并各举一个例子。", "我对 ×× 感兴趣，帮我列 3 个可以动手验证的问题。", "把我上一个问题改写成：输入 → 输出 → 评估指标 的形式。"],
    link: "https://chatgpt.com/", linkLabel: "chatgpt.com", qr: null },
    "prompts 数组一行一条；link/linkLabel 是右侧的跳转链接；qr 传 null 就不显示二维码。"));

  // ── 组件 9：在线 Python 实验 labSlide ──────────────────────────────
  // labSlide(sid, kicker, 标题, 导语, python代码字符串, 依赖包数组, 备注)
  // 代码在学生浏览器里真实运行（Pyodide/WebAssembly），无需安装任何东西。
  // 依赖包数组如 ["numpy"] 会在首次运行时自动加载；纯 Python 传 []。
  // 右侧 AI 助教需要后端 /api/assistant（node server.js + ANTHROPIC_API_KEY）；
  // 纯静态托管时其他功能不受影响，助教会提示暂不可用。
  S.push(labSlide("lab-demo", "组件 · 在线 Python 实验", "学生在浏览器里跑真代码",
    `点 <b>▶ Run</b> 直接运行；改几个数字再跑一次 — 这就是课堂实验。右侧 AI 助教可以解释、找错、改进代码。`,
    `# 这段代码在你的浏览器里真实运行（首次运行需加载 Python，稍等几秒）
scores = [72, 85, 91, 68, 77, 95, 88]

average = sum(scores) / len(scores)
best = max(scores)

print("班级平均分:", round(average, 1))
print("最高分:", best)
print("高于平均分的人数:", sum(1 for s in scores if s > average))

# 试一试：改动 scores 里的数字，再点 Run
# 挑战：算出最低分和分数极差（最高 - 最低）
`, [],
    "纯 Python 秒开；要用 numpy/pandas 就把包名写进第 6 个参数的数组里（首次加载会多等几秒）。代码里留一个 挑战 让快的学生不闲着。"));

  // ── 组件 10：两列参考卡（词汇表 / 作业）────────────────────────────
  S.push(sec("reference-demo", `<div class="kicker">组件 · 参考卡片</div>
    <h2>词汇表 / 要点清单</h2>
    <div class="grid2" style="margin-top:.3em">
      <div class="box"><p><b>术语一</b> — 一句话定义，学生随时翻回来查。</p></div>
      <div class="box"><p><b>术语二</b> — .grid2 两列排布，适合 4–8 条。</p></div>
      <div class="box"><p><b>术语三</b> — 也可以放"作业清单"、"常见错误"。</p></div>
      <div class="box"><p><b>术语四</b> — 卡片数量为奇数时最后一格留空，无碍。</p></div>
    </div>
    <div style="margin-top:.3em">${["标签一", "标签二", "标签三"].map((t) => `<span class="pill">${t}</span>`).join("")}</div>
    <aside class="notes">.pill 是小胶囊标签，列工具名/关键词用。</aside>`));

  // ── 组件 11：金句页（引用 + 渐变背景）──────────────────────────────
  S.push(sec("line-to-remember", `<div class="kicker">组件 · 金句页</div>
    <h2 style="color:#fff">"把每节课最想留下的一句话，放在一整页上。"</h2>
    <p style="color:#cfe0ef;margin-top:.3em">— 出处写这里</p>
    <p style="color:#eaf2fb;font-size:.8em;margin-top:.5em">青色渐变背景 + 白字，全场只有这一句话。</p>
    <aside class="notes">金句页放在结尾前效果最好，也可以配一个 speak 按钮朗读。</aside>`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0B7E8A,#0F9DB0)"'));

  // ── 组件 12：结尾页 ────────────────────────────────────────────────
  S.push(sec("wrap-up", `<div class="kicker" style="color:#7fd3df">收尾</div>
    <h2 style="color:#fff">带走三件事</h2>
    <ul style="display:inline-block;text-align:left;color:#eaf2fb">
      <li>改 <b>CATALOG</b> → 写你的课程和课名</li>
      <li>复制 <b>buildLesson01()</b> → 换成你的内容</li>
      <li><b>node build.js</b> → 整站更新，发链接即上课</li></ul>
    <p style="color:#cfe0ef;margin-top:.6em"><b>退场券：</b>让学生在 💬 里留一个今天学到的东西 — 这就是你的课堂反馈。</p>
    <aside class="notes">深蓝渐变呼应标题页，首尾闭环。祝你做出自己的"会讲课的课件"！</aside>`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  // 保险丝：每页必须有唯一 sid（评论/语音的身份证），漏写或重复会在
  // 构建时直接报错，防止悄悄错位。请保留这段检查。
  const sids = S.map((h) => (h.match(/data-sid="([^"]+)"/) || [])[1]);
  const missing = sids.filter((x) => !x).length;
  const dupes = sids.filter((x, i) => x && sids.indexOf(x) !== i);
  if (missing || dupes.length) throw new Error(`Lesson01 sid check failed: ${missing} missing, dupes=[${[...new Set(dupes)].join(",")}]`);

  return S;
}

// =====================================================================
// DECK HTML  (reveal + pyodide + quizzes + labs + assistant + comments)
// =====================================================================
const REVEAL = "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0";
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full";

function deckHtml(deckId, title, slides) {
  const lessonId = deckId.split("/").pop();
  const altDeckUrl = deckId.startsWith("python-ai/")
    ? `../../python-ai-en/${lessonId}/`
    : `../../python-ai/${lessonId}/`;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${REVEAL}/dist/reveal.css">
<link rel="stylesheet" href="${REVEAL}/dist/theme/white.css">
<style>${deckCss}</style></head><body>
<div class="reveal"><div class="slides">
${slides.join("\n")}
</div></div>

${DONATE_URL ? `<a id="donateBtn" href="${DONATE_URL}" target="_blank" rel="noopener">♥ Donate</a>` : ""}
<!-- per-slide comments -->
<a id="homeBtn" href="../../">← Main</a>
<button id="langBtn" type="button" title="Switch Chinese / English">EN</button>
<audio id="narratorAudio" preload="none" style="display:none"></audio>
<div id="capBar"></div>
<button id="ccBtn" title="Toggle captions">CC</button>
<button id="listenBtn" title="Listen to this slide narrated"><span class="li-ic">▶</span><span class="li-tx">Listen</span></button>
<button id="commentBtn" title="Comment on this slide">💬 Comment<span class="cnum" id="cnum">0</span></button>
<div id="commentPanel">
  <div class="ph"><span id="cph">Comments</span><span class="x" id="cclose">✕</span></div>
  <div id="commentList"></div>
  <form id="commentForm">
    <div class="row"><input id="cname" placeholder="Your name (optional)" maxlength="40"></div>
    <textarea id="cbody" placeholder="Leave a comment or question about this slide…" maxlength="2000"></textarea>
    <div class="row"><button type="submit">Post</button><span class="msg" id="cmsg">Visible to your instructor &amp; classmates.</span></div>
  </form>
</div>

<script>
(function(){
  const langBtn=document.getElementById('langBtn');
  const ALT_DECK_URL=${JSON.stringify(altDeckUrl)};
  const requestedSlide=(location.search.slice(1).split('&').map((part)=>part.split('=')).find((pair)=>pair[0]==='slide')||[])[1];
  function slides(){ return [...document.querySelectorAll('.reveal .slides section')]; }
  function showRequestedSlide(){
    if(!requestedSlide) return;
    const all=slides();
    const target=all.find((slide)=>slide.id===requestedSlide||slide.dataset.sid===requestedSlide);
    if(!target) return;
    all.forEach((slide)=>{ slide.classList.remove('present'); slide.style.display='none'; });
    target.classList.add('present');
    target.style.display='block';
    location.hash='#/'+requestedSlide;
  }
  setTimeout(showRequestedSlide,0);
  setTimeout(showRequestedSlide,300);
  if(!langBtn) return;
  langBtn.textContent=${JSON.stringify(deckId.startsWith("python-ai-en/") ? "中文" : "EN")};
  function currentSlideIndex(){
    const slides=[...document.querySelectorAll('.reveal .slides section')];
    const hashPart=(location.hash.split('/')[1]||'').split('/')[0]||'';
    const hashIndex=Number(hashPart);
    if(Number.isFinite(hashIndex)&&slides[hashIndex]) return slides[hashIndex].id||slides[hashIndex].dataset.sid||hashIndex;
    if(hashPart){
      const sidIndex=slides.findIndex((slide)=>slide.id===hashPart||slide.dataset.sid===hashPart);
      if(sidIndex>=0) return hashPart;
    }
    if(typeof Reveal!=='undefined'&&Reveal.getIndices){
      const idx=Reveal.getIndices();
      if(idx&&typeof idx.h==='number'&&slides[idx.h]) return slides[idx.h].id||slides[idx.h].dataset.sid||idx.h;
    }
    const cur=typeof Reveal!=='undefined'&&Reveal.getCurrentSlide ? Reveal.getCurrentSlide() : document.querySelector('.slides > section.present');
    if(cur) return cur.id||cur.dataset.sid||Math.max(0, slides.indexOf(cur));
    return 0;
  }
  langBtn.addEventListener('click',function(){ const key=currentSlideIndex(); location.href=ALT_DECK_URL+'?slide='+key+'#/'+key; });
})();
</script>
<script src="${REVEAL}/dist/reveal.js"></script>
<script src="${REVEAL}/plugin/notes/notes.js"></script>
<script src="${PYODIDE}/pyodide.js"></script>
<script>
const DECK = ${JSON.stringify(deckId)};
if(!window.Reveal){
  document.body.classList.add('reveal-fallback');
  window.Reveal={
    initialize:function(){},
    on:function(ev,cb){ if(ev==='ready') setTimeout(cb,0); },
    getCurrentSlide:function(){ return document.querySelector('.slides section.present') || document.querySelector('.slides section'); }
  };
}
Reveal.initialize({ hash:true, slideNumber:'c/t', controls:true, progress:true,
  width:1280, height:720, margin:0.04, transition:'slide',
  keyboardCondition:'focused', plugins: window.RevealNotes ? [ RevealNotes ] : [] });
(function(){
  const requested=(location.search.slice(1).split('&').map((part)=>part.split('=')).find((pair)=>pair[0]==='slide')||[])[1];
  if(!requested) return;
  function goRequestedSlide(){
    const slides=[...document.querySelectorAll('.reveal .slides section')];
    const idx=slides.findIndex((slide)=>slide.id===requested||slide.dataset.sid===requested);
    if(idx>=0&&typeof Reveal!=='undefined'&&Reveal.slide) Reveal.slide(idx);
  }
  if(typeof Reveal!=='undefined'&&Reveal.on) Reveal.on('ready',goRequestedSlide);
  setTimeout(goRequestedSlide,250);
  setTimeout(goRequestedSlide,1000);
})();

/* ---------- Shared audio player ----------
 * One audio element, already attached to the DOM (see markup above), reused
 * for every play. A bare detached Audio object is never used: on at least one
 * real browser/profile that made Chrome abort play() within milliseconds
 * ("interrupted because the media was removed from the document") — audio
 * never audibly played and the button silently reset to idle before anyone
 * noticed. Reusing an attached element avoids that path. */
const _audio=document.getElementById('narratorAudio');
let _btn=null,_playToken=0,_utter=null;
function fmtClock(s){ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function resetListenUI(){ listenBtn.style.setProperty('--p','0%'); listenBtn.querySelector('.li-ic').textContent='▶'; listenBtn.querySelector('.li-tx').textContent='Listen'; }
function rememberSpeakLabels(b){
  if(b.dataset.labelReady) return;
  const zh=b.querySelector('.lang-zh'), en=b.querySelector('.lang-en'), first=b.querySelector('span');
  b.dataset.labelZh=zh?zh.textContent:(first?first.textContent:'Speak');
  b.dataset.labelEn=en?en.textContent:b.dataset.labelZh;
  b.dataset.labelReady='1';
}
function setSpeakButtonState(b,playing){
  const zh=b.querySelector('.lang-zh'), en=b.querySelector('.lang-en'), first=b.querySelector('span');
  if(zh) zh.textContent=playing?'暂停':b.dataset.labelZh;
  if(en) en.textContent=playing?'Pause':b.dataset.labelEn;
  if(!zh && !en && first) first.textContent=playing?'Pause':(b.dataset.labelZh||'Speak');
}
function stopAudio(){
  _playToken++; // invalidate any in-flight play() for the old src
  if(window.speechSynthesis){ window.speechSynthesis.cancel(); }
  _utter=null;
  _audio.pause(); _audio.currentTime=0; _audio.removeAttribute('src'); _audio.load();
  _audio.removeEventListener('timeupdate',onListenTimeupdate); // else it'd animate listenBtn during a .speak clip
  capBar.style.display='none';
  if(_btn){
    _btn.classList.remove('playing');
    if(_btn===listenBtn) resetListenUI();
    else if(_btn.querySelector('span')) setSpeakButtonState(_btn,false);
  }
  _btn=null;
}
document.addEventListener('click',function(e){
  const b=e.target.closest('.speak'); if(!b) return;
  if(_btn===b && (!_audio.paused || _utter)){ stopAudio(); return; }
  stopAudio();
  const token=_playToken;
  rememberSpeakLabels(b);
  _btn=b;
  b.classList.add('playing'); setSpeakButtonState(b,true);
  const lang=activeLang();
  const text=(lang==='en'?b.dataset.textEn:b.dataset.textZh)||b.dataset.text;
  if(text && window.speechSynthesis){
    _utter=new SpeechSynthesisUtterance(text);
    _utter.lang=lang==='en'?'en-US':'zh-CN';
    _utter.onend=function(){ if(token===_playToken) stopAudio(); };
    _utter.onerror=function(){ if(token===_playToken) stopAudio(); };
    window.speechSynthesis.speak(_utter);
    return;
  }
  _audio.src=b.dataset.audio;
  _audio.addEventListener('ended',stopAudio,{once:true});
  _audio.play().catch(function(){ if(token===_playToken) stopAudio(); });
});

/* ---------- Per-slide narration ("Listen") + captions ---------- */
const listenBtn=document.getElementById('listenBtn');
const ccBtn=document.getElementById('ccBtn');
const capBar=document.getElementById('capBar');
let _narrationData=null; // { [sid]: { script, cues:[{start,end,text}], ... } }
let _ccOn=localStorage.getItem('cc_captions')!=='0'; // on by default
function updateCcBtn(){ ccBtn.classList.toggle('on',_ccOn); ccBtn.title=_ccOn?'Captions on — click to hide':'Captions off — click to show'; }
async function loadNarrated(){
  try{ const r=await fetch('audio/narration.json',{cache:'no-cache'}); if(!r.ok) throw 0;
    _narrationData=await r.json(); }
  catch(e){ _narrationData={}; }
  updateCcBtn();
  updateListen();
}
function updateListen(){
  if(!_narrationData){ return; }
  const has=!!_narrationData[curSid];
  listenBtn.style.display=has?'inline-flex':'none';
  ccBtn.style.display=has?'inline-flex':'none';
  if(!has && _btn===listenBtn) stopAudio();
}
function cueAt(cues,t){ for(const c of cues) if(t>=c.start && t<c.end) return c; return null; }
function updateCaption(){
  const data=_narrationData && _narrationData[curSid];
  const cues=data && data.cues;
  if(!_ccOn || _btn!==listenBtn || !cues || !cues.length){ capBar.style.display='none'; return; }
  const cue=cueAt(cues,_audio.currentTime);
  if(cue){ capBar.textContent=cue.text; capBar.style.display='block'; }
  else capBar.style.display='none'; // brief gap between sentences
}
ccBtn.addEventListener('click',function(){
  _ccOn=!_ccOn; localStorage.setItem('cc_captions',_ccOn?'1':'0'); updateCcBtn(); updateCaption();
});
function onListenTimeupdate(){
  if(_audio.duration) listenBtn.style.setProperty('--p',(_audio.currentTime/_audio.duration*100)+'%');
  listenBtn.querySelector('.li-tx').textContent=fmtClock(_audio.currentTime)+' / '+fmtClock(_audio.duration);
  updateCaption();
}
listenBtn.addEventListener('click',function(){
  if(_btn===listenBtn && !_audio.paused){ stopAudio(); return; } // toggles play/stop even mid-buffer
  stopAudio();
  const token=_playToken;
  _btn=listenBtn;
  listenBtn.classList.add('playing');
  listenBtn.querySelector('.li-ic').textContent='⏹';
  listenBtn.querySelector('.li-tx').textContent='loading…';
  _audio.src='audio/'+encodeURIComponent(curSid)+'.mp3';
  _audio.addEventListener('timeupdate',onListenTimeupdate);
  _audio.addEventListener('ended',stopAudio,{once:true});
  _audio.play().catch(function(){
    if(token!==_playToken) return; // superseded by a newer click/stop — ignore
    _audio.removeEventListener('timeupdate',onListenTimeupdate);
    stopAudio();
    listenBtn.querySelector('.li-tx').textContent='tap to retry';
    setTimeout(resetListenUI,2200);
  });
});

/* ---------- Quizzes ---------- */
document.addEventListener('click',function(e){
  const opt=e.target.closest('.quiz .opt'); if(!opt) return;
  const quiz=opt.closest('.quiz'); if(quiz.classList.contains('answered')) return;
  const correct=parseInt(quiz.dataset.correct,10);
  quiz.querySelectorAll('.opt').forEach(function(o){o.setAttribute('disabled','');});
  const chosen=parseInt(opt.dataset.i,10);
  quiz.querySelectorAll('.opt')[correct].classList.add('correct');
  if(chosen!==correct) opt.classList.add('wrong');
  quiz.classList.add('answered');
});

/* ---------- Heap / Top-K insertion visualizer ---------- */
function hvState(el){
  if(!el._hv){ el._hv={ frames:[{heap:[],action:'Ready. Insert a value to see the animation.',hi:[]}], cur:0, playing:false, timer:null }; }
  return el._hv;
}
function hvTree(arr,hi){
  if(!arr.length) return '<div class="hv-empty">(empty)</div>';
  const W=200,H=140; const depthOf=(i)=>Math.floor(Math.log2(i+1)); const maxDepth=depthOf(arr.length-1);
  const nodes=arr.map(function(v,i){ const d=depthOf(i); const levelStart=Math.pow(2,d)-1; const pos=i-levelStart; const cnt=Math.pow(2,d);
    return { i:i, v:v, x:((pos+0.5)/cnt)*W, y:16+d*((H-24)/Math.max(1,maxDepth)) }; });
  let svg='<svg viewBox="0 0 '+W+' '+(H+16)+'" class="hv-tree-svg">';
  nodes.forEach(function(n){ if(n.i===0) return; const p=nodes[Math.floor((n.i-1)/2)];
    svg+='<line x1="'+p.x+'" y1="'+p.y+'" x2="'+n.x+'" y2="'+n.y+'" class="hv-edge"/>'; });
  (hi||[]).forEach(function(pair){ if(pair.length===2 && nodes[pair[0]] && nodes[pair[1]]){
    svg+='<line x1="'+nodes[pair[0]].x+'" y1="'+nodes[pair[0]].y+'" x2="'+nodes[pair[1]].x+'" y2="'+nodes[pair[1]].y+'" class="hv-swap"/>'; } });
  const hiIdx=(hi||[]).flat();
  nodes.forEach(function(n){ const isHi=hiIdx.indexOf(n.i)>-1;
    svg+='<circle cx="'+n.x+'" cy="'+n.y+'" r="13" class="hv-node'+(isHi?' hv-node-hi':'')+'"/><text x="'+n.x+'" y="'+(n.y+4)+'" class="hv-node-text">'+n.v+'</text>'; });
  return svg+'</svg>';
}
function hvRender(el){
  const st=hvState(el);
  el.querySelector('.hv-arr-now').textContent='['+st.frames[st.cur].heap.join(', ')+']';
  el.querySelector('.hv-step').textContent=st.cur+' / '+(st.frames.length-1);
  el.querySelector('.hv-action-text').textContent=st.frames[st.cur].action;
  const framesEl=el.querySelector('.hv-frames'), arrsEl=el.querySelector('.hv-arrs');
  framesEl.innerHTML=''; arrsEl.innerHTML='';
  st.frames.forEach(function(f,idx){
    const hiIdx=(f.hi||[]).flat();
    const card=document.createElement('div'); card.className='hv-frame'+(idx===st.cur?' hv-frame-active':'');
    card.innerHTML='<div class="hv-frame-title">Step '+idx+'</div><div class="hv-frame-desc">'+(idx===0?'(empty)':f.action)+'</div>'+hvTree(f.heap,f.hi);
    framesEl.appendChild(card);
    const a=document.createElement('div'); a.className='hv-arr'+(idx===st.cur?' hv-arr-active':'');
    a.innerHTML='['+f.heap.map(function(v,i){ return hiIdx.indexOf(i)>-1?'<span class="hv-arr-hi">'+v+'</span>':v; }).join(', ')+']';
    arrsEl.appendChild(a);
  });
  const active=framesEl.querySelector('.hv-frame-active');
  if(active) active.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
}
function hvInsert(el,val){
  const st=hvState(el);
  if(st.cur!==st.frames.length-1) st.frames=st.frames.slice(0,st.cur+1); // drop redo history on a fresh insert
  const heap=st.frames[st.frames.length-1].heap.slice();
  const idx=heap.length; heap.push(val);
  let i=idx, hi=[[idx,idx]];
  while(i>0){ const p=Math.floor((i-1)/2);
    if(heap[p]>heap[i]){ const t=heap[p]; heap[p]=heap[i]; heap[i]=t; hi=[[p,i]]; i=p; } else break; }
  st.frames.push({ heap:heap, action:'Insert '+val+' at index '+idx, hi:hi });
  st.cur=st.frames.length-1; hvRender(el);
}
function hvGoto(el,idx){ const st=hvState(el); st.cur=Math.max(0,Math.min(st.frames.length-1,idx)); hvRender(el); }
function hvStop(el){ const st=hvState(el); if(st.timer){ clearInterval(st.timer); st.timer=null; } st.playing=false;
  const b=el.querySelector('.hv-play'); if(b) b.textContent='▶ Play'; }
function hvPlay(el){ const st=hvState(el); if(st.playing){ hvStop(el); return; }
  if(st.cur>=st.frames.length-1) hvGoto(el,0);
  st.playing=true; const b=el.querySelector('.hv-play'); if(b) b.textContent='⏸ Pause';
  const speed=parseInt(el.querySelector('.hv-speed').value,10)||3, delay=Math.max(280,1300-speed*220);
  st.timer=setInterval(function(){ if(st.cur>=st.frames.length-1){ hvStop(el); return; } hvGoto(el,st.cur+1); },delay);
}
document.addEventListener('click',function(e){
  const hv=e.target.closest('.heapviz'); if(!hv) return;
  if(e.target.closest('.hv-insert')){ const inp=hv.querySelector('.hv-input'); const v=parseInt(inp.value,10);
    if(!isNaN(v)){ hvStop(hv); hvInsert(hv,v); inp.value=''; } }
  else if(e.target.closest('.hv-quick-btn')){ hvStop(hv); hvInsert(hv,parseInt(e.target.closest('.hv-quick-btn').dataset.v,10)); }
  else if(e.target.closest('.hv-first')){ hvStop(hv); hvGoto(hv,0); }
  else if(e.target.closest('.hv-prev')){ hvStop(hv); hvGoto(hv,hvState(hv).cur-1); }
  else if(e.target.closest('.hv-next')){ hvStop(hv); hvGoto(hv,hvState(hv).cur+1); }
  else if(e.target.closest('.hv-last')){ hvStop(hv); hvGoto(hv,hvState(hv).frames.length-1); }
  else if(e.target.closest('.hv-play')){ hvPlay(hv); }
});
document.addEventListener('keydown',function(e){
  if(e.target.classList&&e.target.classList.contains('hv-input')&&e.key==='Enter'){
    e.preventDefault(); const hv=e.target.closest('.heapviz'); const v=parseInt(e.target.value,10);
    if(!isNaN(v)){ hvStop(hv); hvInsert(hv,v); e.target.value=''; }
  }
});
document.querySelectorAll('.heapviz').forEach(function(hv){
  const preset=(hv.dataset.preset||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
  const q=hv.querySelector('.hv-quick');
  preset.forEach(function(v){ const b=document.createElement('button'); b.type='button'; b.className='hv-quick-btn'; b.dataset.v=v; b.textContent=v; q.appendChild(b); });
  hvRender(hv);
});

/* ---------- Pyodide code labs ---------- */
let _py=null,_pyLoading=null;
async function getPy(statusEl){
  if(_py) return _py;
  if(!_pyLoading){ if(statusEl)statusEl.textContent='Loading Python…';
    _pyLoading=loadPyodide({indexURL:'${PYODIDE}/'}); }
  _py=await _pyLoading; return _py;
}
function labOf(el){ return el.closest('.lab'); }
async function runLab(lab){
  const code=lab.querySelector('.code').value;
  const out=lab.querySelector('.out'); const status=lab.querySelector('.lab-status');
  out.textContent=''; out.classList.remove('has-err'); lab.dataset.lastError='';
  try{
    const py=await getPy(status);
    const pkgs=(lab.dataset.packages||'').split(',').map(s=>s.trim()).filter(Boolean);
    if(pkgs.length){ status.textContent='Loading '+pkgs.join(', ')+'…'; await py.loadPackage(pkgs); }
    status.textContent='Running…';
    let buf='';
    py.setStdout({batched:(s)=>{buf+=s+'\\n';}});
    py.setStderr({batched:(s)=>{buf+=s+'\\n';}});
    await py.runPythonAsync(code);
    out.textContent=buf||'(no output — add a print(...) )';
    status.textContent='✓ done';
  }catch(err){
    const msg=(err&&err.message)?err.message:String(err);
    out.innerHTML='<span class="err">'+msg.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</span>';
    lab.dataset.lastError=msg; status.textContent='✗ error — try 🐞 Debug';
  }
}
/* very small markdown -> html for assistant replies */
function mdToHtml(md){
  const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  let html=''; const parts=md.split(/\`\`\`/);
  parts.forEach(function(p,i){
    if(i%2===1){ const code=p.replace(/^python\\n?/i,''); html+='<pre data-code="'+encodeURIComponent(code.trim())+'"><code>'+esc(code.trim())+'</code></pre>'+
      '<button class="apply">↧ Use this code</button>'; }
    else { let t=esc(p).replace(/\\*\\*(.+?)\\*\\*/g,'<b>$1</b>').replace(/\`(.+?)\`/g,'<code>$1</code>').replace(/\\n{2,}/g,'</p><p>').replace(/\\n/g,'<br>'); if(t.trim())html+='<p>'+t+'</p>'; }
  });
  return html;
}
async function askAssistant(lab,action,question){
  const body=lab.querySelector('.assist-body');
  body.innerHTML='<p class="muted">✨ Thinking…</p>';
  try{
    const r=await fetch('/api/assistant',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({action:action,question:question||'',code:lab.querySelector('.code').value,error:lab.dataset.lastError||''})});
    const j=await r.json();
    body.innerHTML=mdToHtml(j.text||'(no response)');
  }catch(e){ body.innerHTML='<p class="muted">Assistant unavailable right now. Try again shortly.</p>'; }
}
document.addEventListener('click',function(e){
  const t=e.target;
  if(t.closest('.lab .run')){ runLab(labOf(t.closest('.run'))); }
  else if(t.closest('.lab .ai-explain')){ askAssistant(labOf(t.closest('.ai-explain')),'explain'); }
  else if(t.closest('.lab .ai-debug')){ askAssistant(labOf(t.closest('.ai-debug')),'debug'); }
  else if(t.closest('.lab .ai-improve')){ askAssistant(labOf(t.closest('.ai-improve')),'improve'); }
  else if(t.closest('.lab .ask-btn')){ const lab=labOf(t.closest('.ask-btn')); const inp=lab.querySelector('.ask-in'); if(inp.value.trim()){ askAssistant(lab,'ask',inp.value.trim()); inp.value=''; } }
  else if(t.classList&&t.classList.contains('apply')){ const pre=t.previousElementSibling; const lab=t.closest('.lab'); if(pre&&lab){ lab.querySelector('.code').value=decodeURIComponent(pre.dataset.code); } }
});
/* Tab key inserts spaces in code editors; keep typing inside textareas from triggering reveal nav */
document.addEventListener('keydown',function(e){
  const ta=e.target;
  if(ta.classList&&ta.classList.contains('code')&&e.key==='Tab'){ e.preventDefault(); const s=ta.selectionStart,en=ta.selectionEnd; ta.value=ta.value.slice(0,s)+'    '+ta.value.slice(en); ta.selectionStart=ta.selectionEnd=s+4; }
},true);
/* allow Enter to submit the assistant question */
document.addEventListener('keydown',function(e){ if(e.target.classList&&e.target.classList.contains('ask-in')&&e.key==='Enter'){ e.preventDefault(); const lab=labOf(e.target); if(e.target.value.trim()){ askAssistant(lab,'ask',e.target.value.trim()); e.target.value=''; } } });

/* ---------- Per-slide comments ---------- */
const btn=document.getElementById('commentBtn'),panel=document.getElementById('commentPanel'),
  listEl=document.getElementById('commentList'),cnum=document.getElementById('cnum'),
  cph=document.getElementById('cph'),form=document.getElementById('commentForm');
let counts={}, curSid='title';
// Comment identity = the slide's stable data-sid slug. Never positional:
// a positional key would re-point old comments to a different slide whenever
// the deck is reordered. Every slide is built with a sid (asserted at build);
// the content-hash fallback below stays position-independent just in case.
function _hashSid(s){ const t=((s&&s.textContent)||'').replace(/\\s+/g,' ').trim().slice(0,400); let h=0; for(let i=0;i<t.length;i++){ h=(h*31+t.charCodeAt(i))|0; } return 'auto-'+(h>>>0).toString(36); }
function sidOf(){ const s=Reveal.getCurrentSlide(); if(s&&s.dataset.sid) return s.dataset.sid; console.warn('slide has no data-sid; using content-hash key'); return _hashSid(s); }
function fmtTime(ts){ const d=new Date(ts); return d.toLocaleDateString()+' '+d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
function escc(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
async function loadCounts(){ try{ const r=await fetch('/api/comments/counts?deck='+encodeURIComponent(DECK)); const j=await r.json(); counts=j.counts||{}; updateBadge(); }catch(e){} }
function updateBadge(){ cnum.textContent=counts[curSid]||0; }
async function loadComments(){ listEl.innerHTML='<div class="none">Loading…</div>';
  try{ const r=await fetch('/api/comments?deck='+encodeURIComponent(DECK)+'&slide='+encodeURIComponent(curSid)); const j=await r.json();
    const cs=j.comments||[]; counts[curSid]=cs.length; updateBadge();
    listEl.innerHTML=cs.length?cs.map(c=>'<div class="c"><span class="cn">'+escc(c.name)+'</span><span class="ct">'+fmtTime(c.created)+'</span><div class="cb">'+escc(c.body)+'</div></div>').join(''):'<div class="none">No comments yet — be the first!</div>';
  }catch(e){ listEl.innerHTML='<div class="none">Could not load comments.</div>'; }
}
function openPanel(){ curSid=sidOf(); cph.textContent='Comments · '+curSid; panel.classList.add('open'); loadComments(); }
btn.onclick=function(){ panel.classList.contains('open')?panel.classList.remove('open'):openPanel(); };
document.getElementById('cclose').onclick=function(){ panel.classList.remove('open'); };
form.onsubmit=async function(e){ e.preventDefault();
  const name=document.getElementById('cname').value, body=document.getElementById('cbody').value.trim();
  const msg=document.getElementById('cmsg'); if(!body){ msg.textContent='Write something first.'; return; }
  msg.textContent='Posting…';
  try{ const r=await fetch('/api/comments',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({deck:DECK,slide:curSid,name:name,body:body})});
    const j=await r.json(); if(j.ok){ document.getElementById('cbody').value=''; msg.textContent='Posted! Thanks.'; loadComments(); } else { msg.textContent=j.error||'Could not post.'; }
  }catch(e){ msg.textContent='Network error — try again.'; }
};
Reveal.on('slidechanged',function(){ stopAudio(); curSid=sidOf(); updateBadge(); updateListen(); if(panel.classList.contains('open')){ cph.textContent='Comments · '+curSid; loadComments(); } });
Reveal.on('ready',function(){ curSid=sidOf(); loadCounts(); loadNarrated(); });
</script>
</body></html>`;
}

// =====================================================================
// DECK REGISTRY — 注册表
//   CATALOG 里每个 status:"ready" 的 deck 都要在这里有一行：
//   "<课程id>/<deck id>": { build: 你的构建函数, title: "浏览器标签页标题" }
// =====================================================================
function buildPythonClass01() {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const bullets = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const codeHello = `# Class 01
print("Hello, AI Research!")
print("My first Python notebook is running.")`;
  const codeProfile = `name = input("Name: ")
age = int(input("Age: "))
topic = input("Research interest: ")
hours = float(input("Weekly study hours: "))

print(f"{name}, age {age}, wants to study {topic}.")
print(f"Next week goal: {hours + 1} hours.")`;

  S.push(sec("title", `<div class="kicker" style="color:#7fd3df">MERITPOINT ACADEMY / CLASS 01</div>
    <h1 style="color:#fff">Python for<br>AI Research</h1>
    <p style="color:#cfe0ef;margin-top:.45em">课程导入与第一个 Python Notebook</p>
    <div class="grid2" style="grid-template-columns:1.05fr .95fr;align-items:center;margin-top:.8em">
      <div>
        <span class="pill" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.24)">当堂产出：首个可运行 Notebook</span>
        <p style="color:#9db8d6;font-size:.58em;margin-top:1em">按 S 看讲稿 · 右下角留言 · Python lab 可直接运行</p>
      </div>
      <img src="assets/course-overview.png" alt="Python for AI Research course overview" style="width:100%;max-height:430px;object-fit:contain;border-radius:10px;background:#fff;padding:10px">
    </div>
    ${notes("开场目标：让学生知道这不是单纯语法课，而是用代码逐步完成可展示的 AI 科研项目。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  S.push(sec("goals", `<div class="kicker">TODAY</div>
    <h2>今天这节课要完成三件事</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><span class="feature">1</span><h3>了解课程</h3><p>知道 15 节课怎样从 Python 走到 AI 科研项目。</p></div>
      <div class="box"><span class="feature" style="background:var(--green)">2</span><h3>明确提交方式</h3><p>了解作业要求、提交节奏和 AI 使用规范。</p></div>
      <div class="box"><span class="feature" style="background:var(--amber)">3</span><h3>写出代码</h3><p>在浏览器或 Colab 里运行第一个 Python notebook。</p></div>
    </div>
    <div class="callout"><b>课堂节奏：</b>说明规则 -> 现场演示 -> 跟做练习 -> 提交一个小成果</div>
    ${notes("这一页用于建立预期：不是听完课就结束，每节课都要有一个可以提交的小成果。")}`));

  S.push(sec("instructor-learning", `<div class="kicker">FROM QIN REFERENCE · LEARNING MODE</div>
    <h2>先认识这门课的学习方式</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><h3>老师怎么教</h3>${bullets(["每节课都有可见产出", "少背概念，多做练习", "用真实代码训练科研表达"])}</div>
      <div class="box"><h3>学生怎么学</h3>${bullets(["课堂跟做，不怕报错", "先预测，再运行", "能解释自己的代码最重要"])}</div>
      <div class="box"><h3>遇到报错</h3><p>报错不是失败，而是 Python 正在告诉你下一步要检查哪里。</p></div>
    </div>
    <div class="callout"><b>口令：</b>Read -> Predict -> Run -> Explain</div>
    ${notes("补入秦教授 Class 01 参考 deck 的学习方式页：强调跟做、预测、运行和解释。")}`));

  S.push(sec("learning-mode", `<div class="kicker">HOW WE LEARN</div>
    <h2>先认识这门课的学习方式</h2>
    <div class="grid3" style="margin-top:.6em">
      <div class="skillcard"><div class="cn">少背概念</div><p>先跑起来，再解释为什么。</p></div>
      <div class="skillcard"><div class="cn">小步提交</div><p>每节课都有一个可见产出。</p></div>
      <div class="skillcard"><div class="cn">能讲清楚</div><p>能解释自己的代码比复制答案更重要。</p></div>
    </div>
    <blockquote>课堂里遇到报错很正常。关键不是不出错，而是能读懂、定位、修正。</blockquote>
    ${notes("提醒学生：代码错误不是失败，而是学习材料。后面遇到报错时，教师可以公开示范如何读错误信息。")}`));

  S.push(sec("course-map", `<div class="kicker">15-CLASS ROADMAP</div>
    <h2>15 节课会完成一个完整 AI 科研闭环</h2>
    <div class="tl">
      <div class="ev"><div class="yr">1-4</div><b>Python 基础入门</b><span>notebook、控制流、函数、数据结构</span></div>
      <div class="ev winter"><div class="yr">5-7</div><b>数据处理与分析</b><span>NumPy、pandas、清洗与变量说明</span></div>
      <div class="ev"><div class="yr">8</div><b>可视化与 EDA</b><span>核心图表、观察和初步结论</span></div>
      <div class="ev boom"><div class="yr">9-13</div><b>机器学习建模</b><span>baseline、模型训练、评价指标</span></div>
      <div class="ev"><div class="yr">14-15</div><b>AI 科研项目实战</b><span>报告、PPT、展示与反思</span></div>
    </div>
    ${notes("这一页解释课程结构，让学生知道每个阶段的产出如何连接到最终项目。")}`));

  S.push(sec("deliverables", `<div class="kicker">OUTPUTS</div>
    <h2>每节课都有一个可以提交的小成果</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><span class="n">1</span><b>第一个 notebook</b><span>变量、print、注释、输入输出</span></div>
      <div class="step"><span class="n">2</span><b>评分/分类小程序</b><span>if、for、while、逻辑判断</span></div>
      <div class="step"><span class="n">3</span><b>函数 + 文件输出</b><span>参数、返回值、简单文件读写</span></div>
      <div class="step"><span class="n">4</span><b>样本记录表</b><span>list、dict、set、基础统计</span></div>
      <div class="step loop"><span class="n">5+</span><b>AI 科研项目</b><span>数据、建模、报告、展示</span></div>
    </div>
    <div class="callout"><b>作业原则：</b>能运行、能解释、能按时提交。</div>
    ${notes("如果学生问评分标准，强调持续产出和最终项目都重要。")}`));

  S.push(sec("grading", `<div class="kicker">GRADING</div>
    <h2>评分标准看重持续产出和最终项目</h2>
    <div class="grid2" style="margin-top:.65em">
      <div class="box"><h3>35% 周度作业</h3><p>每节课的小成果、notebook 是否能运行、是否按时提交。</p></div>
      <div class="box"><h3>20% 数据部分</h3><p>数据来源、变量说明、清洗记录、EDA 图表和观察。</p></div>
      <div class="box"><h3>25% 建模部分</h3><p>模型选择、baseline 对比、评价指标和结果解释。</p></div>
      <div class="box"><h3>20% 期末展示</h3><p>报告/PPT 是否清楚，是否能说明限制和改进方向。</p></div>
    </div>
    ${notes("这一页可以快速讲，不要停留太久；重点是让学生知道平时作业不能拖到最后。")}`));

  S.push(quizSlide("ai-policy-quiz", "AI USE POLICY",
    "下面哪一种 AI 使用方式最符合这门课的要求？",
    [
      "直接让 AI 写完作业，自己不运行也不解释",
      "用 AI 帮忙理解报错，但提交前自己运行并解释代码",
      "复制同学代码，再让 AI 改变量名"
    ],
    1,
    "可以使用 AI 帮助理解和调试，但最终 notebook 必须能运行，并且你要能解释关键代码。",
    "这里引导学生建立 AI 使用边界：AI 是学习助手，不是替代提交者。"));

  S.push(sec("classroom", `<div class="kicker">SETUP</div>
    <h2>加入 Google Classroom</h2>
    <div class="flow" style="margin-top:.65em">
      <div class="step"><span class="n">1</span><b>打开</b><span>classroom.google.com</span></div>
      <div class="step"><span class="n">2</span><b>点击 +</b><span>Join class</span></div>
      <div class="step"><span class="n">3</span><b>输入班级码</b><span>kday73zp</span></div>
      <div class="step"><span class="n">4</span><b>确认栏目</b><span>Classwork / Assignments / Materials</span></div>
    </div>
    <div class="callout"><b>提交提醒：</b>作业统一交到 Google Classroom 的 Classwork -> Assignments。</div>
    ${notes("如果学生已经加入，可以让他们帮助旁边同学。教师确认大家都能看到课程主页。")}`));

  S.push(sec("colab", `<div class="kicker">COLAB</div>
    <h2>Google Colab 是我们的云端 Python 教室</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box">${bullets(["不用安装 Python", "浏览器里写代码", "文件存在 Google Drive", "方便提交 notebook 链接"])}</div>
      <div class="box">${bullets(["新建 notebook", "重命名为 Class01_FirstNotebook", "运行第一个 code cell", "从上到下重新运行检查"])}</div>
    </div>
    <p class="src">课堂演示地址：colab.research.google.com</p>
    ${notes("先演示一个最小 notebook：新建、重命名、插入 code cell、运行。")}`));

  S.push(labSlide("hello-lab", "PYTHON LAB", "第一段 Python：让程序说话",
    "先不用安装任何软件，直接在这一页运行 Python。改掉文字，再点 Run。",
    codeHello, [], "让学生先预测输出，再运行。然后把第二行文字改成自己的英文或中文句子。"));

  S.push(sec("print-practice", `<div class="kicker">FROM QIN REFERENCE · PRINT</div>
    <h2>print() 的括号里放什么，就显示什么</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>先预测输出</h3><pre style="font-size:.6em"><code>print("Python")
print(2026)
print("AI" + " Research")</code></pre></div>
      <div class="box"><h3>再运行验证</h3>${bullets(["会出现几行输出？", "字符串拼接后是什么？", "数字和文字显示有什么区别？"])}</div>
    </div>
    <div class="callout"><b>小习惯：</b>每段代码运行前，先在脑子里预测一次输出。</div>
    ${notes("来自秦教授 Class 01 参考 deck 的 print 练习页。")}`));

  S.push(sec("string-number-trap", `<div class="kicker">FROM QIN REFERENCE · COMMON ERROR</div>
    <h2>字符串要加引号，数字不用加引号</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>可以运行</h3><pre style="font-size:.62em"><code>print("hello")
print(100)
print(3.14)</code></pre></div>
      <div class="box"><h3>会报错</h3><pre style="font-size:.62em"><code>print(hello)</code></pre><p>Python 会以为 <code>hello</code> 是变量名，而不是文字。</p></div>
    </div>
    ${notes("补入参考 deck 的字符串/数字常见错误页，适合现场制造并解释 NameError。")}`));

  S.push(sec("variables", `<div class="kicker">PYTHON BASICS</div>
    <h2>变量像一个有名字的盒子</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><h3>name</h3><p>保存文字：<code>"Lina"</code></p></div>
      <div class="box"><h3>age</h3><p>保存整数：<code>16</code></p></div>
      <div class="box"><h3>hours</h3><p>保存小数：<code>3.5</code></p></div>
    </div>
    <div class="callout"><b>关键句：</b>变量名帮助我们在后面的代码中再次使用这个值。</div>
    ${notes("强调变量不是数学里的未知数，而是程序里的命名存储。")}`));

  S.push(quizSlide("types-quiz", "DATA TYPES",
    "如果代码是 age = input(\"Age: \")，那么 age 默认是什么类型？",
    ["int", "float", "str"],
    2,
    "input() 读到的内容默认是字符串 str。要做数学计算，需要 int(age) 或 float(age)。",
    "这道题为 mini profile 中的 int(input(...)) 做铺垫。"));

  S.push(labSlide("profile-lab", "PYTHON LAB", "Mini profile：输入、类型转换与 f-string",
    "这个小程序会询问姓名、年龄、研究兴趣和每周学习时间，然后生成一段自我介绍。",
    codeProfile, [], "提醒学生：age 使用 int，hours 使用 float。让他们把输出句子改得更自然。"));

  S.push(sec("debug", `<div class="kicker">DEBUGGING MINDSET</div>
    <h2>报错不是终点，是线索</h2>
    <div class="grid2" style="margin-top:.65em">
      <div class="box"><h3>先读最后一行</h3><p>通常最后一行告诉你错误类型和最直接原因。</p></div>
      <div class="box"><h3>再看行号</h3><p>定位是哪一行触发了问题，不要全篇乱改。</p></div>
      <div class="box"><h3>小步重跑</h3><p>一次只改一个地方，确认修复是否有效。</p></div>
      <div class="box"><h3>能解释再提交</h3><p>修好代码后，说清楚为什么错、怎么改。</p></div>
    </div>
    ${notes("可以现场故意制造一个 ValueError 或 SyntaxError，让学生按这四步找线索。")}`));

  S.push(sec("homework", `<div class="kicker">HOMEWORK</div>
    <h2>课后作业：变量与输出练习</h2>
    <div class="grid2" style="grid-template-columns:1.2fr .8fr;margin-top:.65em">
      <div class="box">${bullets([
        "完成 8-10 个变量与输出练习",
        "至少包含 str、int、float、bool 三类数据",
        "至少写 3-5 行 print 输出",
        "加入 2-3 行注释说明代码意图",
        "从上到下重新运行，确认没有错误"
      ])}</div>
      <div class="box"><h3>提交位置</h3><p>Google Classroom -> Classwork -> Class 01 Assignment</p><h3>提交内容</h3><p>Google Colab notebook 链接</p></div>
    </div>
    ${notes("最后确认学生知道在哪里交作业，以及 notebook 链接权限需要可访问。")}`));

  S.push(sec("exit-ticket", `<div class="kicker">EXIT TICKET</div>
    <h2>离开教室前，完成一个小检查</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="skillcard"><div class="cn">我能运行</div><p>运行 hello lab 或 Colab 第一段代码。</p></div>
      <div class="skillcard"><div class="cn">我能修改</div><p>把变量值改成自己的信息。</p></div>
      <div class="skillcard"><div class="cn">我能解释</div><p>说出 print、变量、input 的作用。</p></div>
    </div>
    <div class="callout"><b>留言任务：</b>点右下角 Comment，写下今天最清楚的一点，或一个还没解决的问题。</div>
    ${profQuote({
      quoteZh: "第一段代码不需要很长；它只需要证明一件事：你可以让计算机听懂你的指令。",
      quoteEn: "Your first program does not need to be long; it only needs to prove one thing: you can make the computer understand your instructions.",
      explainZh: "今天的重点不是背语法，而是建立信心：能运行、能修改、能解释，就是进入 Python 的第一步。",
      explainEn: "The point today is not memorizing syntax. It is building confidence: run it, change it, and explain it."
    })}
    ${notes("用留言收集课堂反馈。如果是 GitHub Pages 静态部署，评论功能会降级；本地 server 或后端部署时可持久保存。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

function buildPythonClass02() {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const bullets = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const codeCoin = `cents = 87

quarters = cents // 25
left_after_quarters = cents % 25
dimes = left_after_quarters // 10
pennies = left_after_quarters % 10

print(f"Input: {cents} cents")
print(f"{quarters} quarters")
print(f"{dimes} dime(s)")
print(f"{pennies} pennies")`;
  const codeClassify = `numbers = [5, -2, 0]

for number in numbers:
    if number > 0:
        label = "positive"
    elif number < 0:
        label = "negative"
    else:
        label = "zero"
    print(f"{number}: {label}")`;
  const codeLoop = `scores = [42, 50, 67, 81, 93]

for score in scores:
    if score < 50:
        grade = "fail"
    elif score < 70:
        grade = "pass"
    elif score < 90:
        grade = "good"
    else:
        grade = "excellent"
    print(f"{score} -> {grade}")

print("Odd numbers from 0 to 9:")
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)`;

  S.push(sec("class02-title", `<div class="kicker">PYTHON FOR AI RESEARCH · CLASS 02</div>
    <h1 style="color:#fff">Python<br>Control Flow</h1>
    <p style="color:#cfe0ef;margin-top:.45em">条件判断、循环与程序选择路径</p>
    <div class="grid3" style="margin-top:1em">
      <div class="skillcard"><div class="cn">判断</div><p>if / elif / else</p></div>
      <div class="skillcard"><div class="cn">重复</div><p>for / while / range</p></div>
      <div class="skillcard"><div class="cn">控制</div><p>break / continue</p></div>
    </div>
    <p style="color:#9db8d6;font-size:.58em;margin-top:1em">按 S 看讲稿 · 右下角留言 · Python lab 可直接运行</p>
    ${notes("第 2 课核心：让学生从顺序执行转向选择执行。保持先预测、再运行、再解释的节奏。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  S.push(sec("class02-goals", `<div class="kicker">TODAY'S OUTPUT</div>
    <h2>今天完成一个会做判断的小程序</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><span class="feature">1</span><h3>预测路径</h3><p>能说出条件为 True / False 时哪几行会执行。</p></div>
      <div class="box"><span class="feature" style="background:var(--green)">2</span><h3>写出分支</h3><p>用 if / elif / else 完成二分类或三分类。</p></div>
      <div class="box"><span class="feature" style="background:var(--amber)">3</span><h3>写出循环</h3><p>用 for / while 减少重复，并控制何时停止。</p></div>
    </div>
    <div class="callout"><b>课堂产出：</b>硬币兑换、正负数判断、循环打印和一个评分/分类练习。</div>
    ${notes("明确产出后，学生会更容易理解每个语法点服务于什么任务。")}`));

  S.push(labSlide("coin-lab", "WARM-UP LAB", "87 cents：// 和 % 的真实用途",
    "先预测 quarters、dimes、pennies 的数量，再运行代码验证。",
    codeCoin, [], "用第 1 课的整除和取余引出控制流：程序需要根据余数继续做下一步。"));

  S.push(sec("coin-discussion", `<div class="kicker">FROM QIN REFERENCE · ASSIGNMENT DISCUSSION</div>
    <h2>硬币找零：quotient 和 remainder 配合工作</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>Quarters</b><span><code>quarters = cents // 25</code></span></div>
      <div class="step"><div class="n">2</div><b>Left over</b><span><code>cents = cents % 25</code></span></div>
      <div class="step"><div class="n">3</div><b>Dimes</b><span><code>dimes = cents // 10</code></span></div>
      <div class="step loop"><div class="n">4</div><b>Repeat</b><span>每种硬币都重复“最多几个 + 剩多少”</span></div>
    </div>
    <div class="callout"><b>关键模型：</b><code>//</code> 问“最多能拿几个”；<code>%</code> 问“拿完以后还剩多少”。</div>
    ${notes("源 deck 前 2-9 页逐步展开 coin change，这里合并成一页清晰模型。")}`));

  S.push(sec("if-mental-model", `<div class="kicker">IF STATEMENT</div>
    <h2>if 让程序选择是否进入一个代码块</h2>
    <div class="flow" style="margin-top:.7em">
      <div class="step"><div class="n">1</div><b>Evaluate</b><span>条件表达式得到 True 或 False</span></div>
      <div class="step"><div class="n">2</div><b>Enter or skip</b><span>True 执行缩进代码块，False 跳过</span></div>
      <div class="step"><div class="n">3</div><b>Continue</b><span>代码块结束后继续往下走</span></div>
    </div>
    <pre style="font-size:.48em;margin-top:.7em"><code>if number &gt; 0:
    print("positive")
print("always runs")</code></pre>
    ${notes("强调缩进是 Python 的结构，不是排版。让学生用手指出哪些行属于 if。")}`));

  S.push(sec("if-syntax-anatomy", `<div class="kicker">FROM QIN REFERENCE · IF SYNTAX</div>
    <h2>if statement 的语法拆解</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>if</h3><p>告诉 Python：接下来要做一次条件判断。</p></div>
      <div class="box"><h3>condition</h3><p>必须能算出 <code>True</code> 或 <code>False</code>。</p></div>
      <div class="box"><h3>:</h3><p>冒号表示 header 结束，下一行进入代码块。</p></div>
    </div>
    <pre style="font-size:.52em;margin-top:.65em"><code>if number &gt; 0:
    print("positive")</code></pre>
    ${notes("源 deck 10-12 页逐步标注 if / condition / body / colon。")}`));

  S.push(sec("boolean-expressions", `<div class="kicker">BOOLEAN EXPRESSIONS</div>
    <h2>条件表达式的结果只有 True 或 False</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>比较</h3><p><code>x &gt; 0</code>, <code>x == 10</code>, <code>x != 0</code></p></div>
      <div class="box"><h3>组合</h3><p><code>and</code> 两边都要 True；<code>or</code> 至少一个 True。</p></div>
      <div class="box"><h3>取反</h3><p><code>not finished</code> 把 True/False 反过来。</p></div>
    </div>
    <div class="callout"><b>调试技巧：</b>不确定条件是否成立时，先 <code>print(condition)</code>。</div>
    ${notes("把源 deck 的 Boolean expression 说明展开成可操作的调试方法。")}`));

  S.push(quizSlide("indent-quiz", "INDENTATION",
    "在 Python 里，哪件事决定一行代码是否属于 if 代码块？",
    ["括号数量", "缩进层级", "变量名长度", "代码颜色"],
    1,
    "Python 用缩进表示代码块。缩进不同，程序逻辑就可能完全不同。",
    "可以现场把 print('always runs') 缩进进去，再让学生预测输出变化。"));

  S.push(sec("branching", `<div class="kicker">IF / ELIF / ELSE</div>
    <h2>多分支判断：只选择一条路径</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>二分支</h3>${bullets(["if 条件成立：走第一条路", "否则 else：走备用路线", "适合 pass / fail、yes / no"])}</div>
      <div class="box"><h3>多分支</h3>${bullets(["先检查 if", "再逐个检查 elif", "都不满足时走 else", "适合 positive / negative / zero"])}</div>
    </div>
    <div class="callout"><b>口诀：</b>从上到下检查，遇到第一个 True 就执行，然后离开整组分支。</div>
    ${notes("用 number = 5、-2、0 三个例子，让学生分别说出路径。")}`));

  S.push(sec("elif-ladder", `<div class="kicker">FROM QIN REFERENCE · MULTIPLE ALTERNATIVES</div>
    <h2>elif ladder：多条路里只走一条</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>if</b><span>先检查最重要或最具体的条件</span></div>
      <div class="step"><div class="n">2</div><b>elif</b><span>前面没命中，再检查下一种情况</span></div>
      <div class="step"><div class="n">3</div><b>else</b><span>所有条件都不满足时的默认出口</span></div>
    </div>
    <pre style="font-size:.5em;margin-top:.65em"><code>if score &gt;= 90:
    grade = "A"
elif score &gt;= 80:
    grade = "B"
else:
    grade = "Needs practice"</code></pre>
    ${notes("源 deck 25-27 页强调多分支选择，这里转成 grading 场景。")}`));

  S.push(sec("conditional-expression", `<div class="kicker">FROM QIN REFERENCE · ONE-LINE IF</div>
    <h2>简单赋值可以写成 conditional expression</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>普通写法</h3><pre style="font-size:.54em"><code>if score &gt;= 60:
    result = "pass"
else:
    result = "retry"</code></pre></div>
      <div class="box"><h3>一行写法</h3><pre style="font-size:.54em"><code>result = "pass" if score &gt;= 60 else "retry"</code></pre><p>适合非常短、非常清楚的选择。</p></div>
    </div>
    <div class="callout"><b>课堂建议：</b>初学时先写普通 if/else；看懂以后再用一行写法。</div>
    ${notes("源 deck 28-29 页讲 one-line if/conditional assignment。")}`));

  S.push(labSlide("classify-lab", "PYTHON LAB", "正数、负数、零：三分类判断",
    "改动 numbers 列表里的值，观察每个输入如何走到不同分支。",
    codeClassify, [], "这里避免 input，让浏览器实验可以直接运行。学生可以把列表改成自己的测试值。"));

  S.push(sec("range-model", `<div class="kicker">FOR LOOP</div>
    <h2>for loop 适合已知次数或已知序列</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>range(5)</h3><p>0, 1, 2, 3, 4</p></div>
      <div class="box"><h3>range(-10, 11)</h3><p>-10 到 10，包含 -10，不包含 11</p></div>
      <div class="box"><h3>range(0, 10, 2)</h3><p>0, 2, 4, 6, 8</p></div>
    </div>
    <div class="callout"><b>stop 不包含：</b>这是 range 最常见的边界错误。</div>
    ${notes("让学生先写出 range(-10, 11) 的第一个和最后一个数字，再运行验证。")}`));

  S.push(sec("for-syntax-anatomy", `<div class="kicker">FROM QIN REFERENCE · FOR LOOP SYNTAX</div>
    <h2>for loop 的语法拆解</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>loop variable</h3><p><code>for number in numbers</code> 里的 <code>number</code> 每次接住一个值。</p></div>
      <div class="box"><h3>sequence</h3><p>可以是 <code>range(...)</code>、list、string 或其他可遍历对象。</p></div>
      <div class="box"><h3>body</h3><p>缩进部分会对每个值执行一次。</p></div>
    </div>
    <pre style="font-size:.52em;margin-top:.65em"><code>for number in [2, 4, 6]:
    print(number * 10)</code></pre>
    ${notes("源 deck 31 之后逐步进入 for loop，这里补充 syntax anatomy。")}`));

  S.push(sec("remove-repetition", `<div class="kicker">FROM QIN REFERENCE · WHY LOOPS</div>
    <h2>loop 的价值：去掉重复代码</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>重复写法</h3><pre style="font-size:.54em"><code>print(scores[0])
print(scores[1])
print(scores[2])</code></pre></div>
      <div class="box"><h3>循环写法</h3><pre style="font-size:.54em"><code>for score in scores:
    print(score)</code></pre><p>数据多一百个，也不用多写一百行。</p></div>
    </div>
    <div class="callout"><b>判断标准：</b>看到相似代码重复三次，就应该想想能不能用 loop。</div>
    ${notes("源 deck 48 页强调 loops remove repetitive code。")}`));

  S.push(sec("accumulator-pattern", `<div class="kicker">LOOP PATTERN</div>
    <h2>accumulator：循环里逐步累加结果</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>Initialize</b><span><code>total = 0</code></span></div>
      <div class="step"><div class="n">2</div><b>Update</b><span><code>total += score</code></span></div>
      <div class="step"><div class="n">3</div><b>Use result</b><span><code>average = total / len(scores)</code></span></div>
    </div>
    <div class="callout"><b>常见用途：</b>sum、count、maximum、minimum 都是 accumulator pattern。</div>
    ${notes("补足 for loop 从打印走向统计的关键模式。")}`));

  S.push(quizSlide("range-quiz", "RANGE",
    "list(range(0, 5)) 的结果是什么？",
    ["[0, 1, 2, 3, 4]", "[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4, 5]", "[5]"],
    0,
    "range 的 stop 是 exclusive，不包含 5。",
    "如果学生混淆，可以和切片、半开区间做类比。"));

  S.push(sec("while-model", `<div class="kicker">WHILE LOOP</div>
    <h2>while 适合“不知道要重复几次”的任务</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>for</h3>${bullets(["遍历已知序列", "通常知道循环范围", "例如检查 scores 列表"])}</div>
      <div class="box"><h3>while</h3>${bullets(["只要条件为 True 就继续", "适合输入验证", "必须设计终止条件"])}</div>
    </div>
    <pre style="font-size:.46em;margin-top:.6em"><code>count = 3
while count &gt; 0:
    print(count)
    count -= 1</code></pre>
    ${notes("无限循环是重点风险：每次讲 while 都要问，这个条件什么时候会变成 False？")}`));

  S.push(sec("while-checklist", `<div class="kicker">FROM QIN REFERENCE · WHILE LOOP</div>
    <h2>写 while loop 前先检查三件事</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>Start</h3><p>循环开始前，控制变量是什么？</p></div>
      <div class="box"><h3>Stop</h3><p>什么条件下应该停止？条件写反了吗？</p></div>
      <div class="box"><h3>Update</h3><p>循环体里有没有改变控制变量？</p></div>
    </div>
    <pre style="font-size:.52em;margin-top:.65em"><code>count = 3
while count &gt; 0:
    print(count)
    count -= 1</code></pre>
    ${notes("源 deck 56 之后进入 while loop，这里提炼成 checklist。")}`));

  S.push(sec("break-continue", `<div class="kicker">BREAK / CONTINUE</div>
    <h2>两个词，控制循环的节奏</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.7em">
      <div class="box"><h3>break</h3><p>提前结束整个循环。常用于“已经找到了，不用继续”。</p></div>
      <div class="box"><h3>continue</h3><p>跳过当前这一轮剩下的代码，直接进入下一轮。</p></div>
    </div>
    <div class="callout"><b>课堂问法：</b>它是离开整个循环，还是只跳过这一次？</div>
    ${notes("用 0-9 只打印奇数的例子解释 continue；用找到第一个合格分数解释 break。")}`));

  S.push(labSlide("grading-lab", "PYTHON LAB", "评分/分类程序：分支 + 循环",
    "这是本课作业的雏形。改分数、改等级边界，再运行观察输出。",
    codeLoop, [], "让学生选择成绩、风险、温度或学习时间建议作为作业主题。"));

  S.push(sec("class02-homework", `<div class="kicker">HOMEWORK</div>
    <h2>课后作业：写一个简单评分/分类程序</h2>
    <div class="grid2" style="grid-template-columns:1.15fr .85fr;margin-top:.65em">
      <div class="box">${bullets([
        "必须包含至少一个 if / elif / else",
        "至少测试 3 个不同输入，并保留输出结果",
        "主题可以是成绩等级、风险等级、温度分类或学习时间建议",
        "写 3-5 句话解释你的判断规则",
        "说明哪些边界输入最容易出错"
      ])}</div>
      <div class="box"><h3>检查重点</h3><p>边界是否清楚，例如 50 分到底算 pass 还是 fail。</p><h3>提交</h3><p>Google Classroom -> Classwork -> Assignments</p></div>
    </div>
    ${notes("强调边界测试：刚好等于阈值的输入最能暴露逻辑问题。")}`));

  S.push(sec("class02-exit", `<div class="kicker">EXIT TICKET</div>
    <h2>离开前确认三件事</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="skillcard"><div class="cn">我能预测</div><p>判断 True / False 后程序走哪条路。</p></div>
      <div class="skillcard"><div class="cn">我能循环</div><p>用 range 或列表让代码重复执行。</p></div>
      <div class="skillcard"><div class="cn">我能控制</div><p>说出 break 和 continue 的区别。</p></div>
    </div>
    <div class="callout"><b>留言任务：</b>点右下角 Comment，写一个今天最容易混淆的边界情况。</div>
    ${profQuote({
      quoteZh: "程序的分支像一次选择：先问清楚条件，再让代码沿着唯一的路径走下去。",
      quoteEn: "A branch in a program is a choice: ask the condition clearly, then let the code follow one path.",
      explainZh: "判断题、循环题最容易错在边界。每写一个条件，都要测试刚好等于阈值的情况。",
      explainEn: "Most control-flow bugs live at the boundary. Whenever you write a condition, test the exact cutoff."
    })}
    ${notes("收集学生对 range 边界、elif 顺序、while 终止条件的困惑。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

function buildPythonClass03() {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const bullets = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const codeGreet = `def greet(name):
    print(f"Hello, {name}!")

greet("Sponge Bob")
greet("AI researcher")`;
  const codeReturn = `def add_numbers(num_1, num_2):
    result = num_1 + num_2
    return result

total = add_numbers(3, 5)
print(f"Sum: {total}")`;
  const codePrice = `def calculate_price(item: str, quantity: int, price: float) -> float:
    """Return the total price for an item order."""
    total = quantity * price
    return total

apple_total = calculate_price(item="apple", quantity=3, price=0.5)
orange_total = calculate_price(quantity=7, item="orange", price=1.2)

print(f"Apple total: \${apple_total:.2f}")
print(f"Orange total: \${orange_total:.2f}")`;

  S.push(sec("class03-title", `<div class="kicker">PYTHON FOR AI RESEARCH · CLASS 03</div>
    <h1 style="color:#fff">Python<br>Functions</h1>
    <p style="color:#cfe0ef;margin-top:.45em">把重复逻辑封装成可以复用的工具</p>
    <div class="grid3" style="margin-top:1em">
      <div class="skillcard"><div class="cn">定义</div><p>def + 函数名</p></div>
      <div class="skillcard"><div class="cn">传入</div><p>parameters / arguments</p></div>
      <div class="skillcard"><div class="cn">传回</div><p>return value</p></div>
    </div>
    <p style="color:#9db8d6;font-size:.58em;margin-top:1em">按 S 看讲稿 · 右下角留言 · Python lab 可直接运行</p>
    ${notes("第 3 课的主线：函数不是新语法炫技，而是给一段逻辑命名、复用、测试。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  S.push(sec("class03-goals", `<div class="kicker">TODAY'S OUTPUT</div>
    <h2>今天把重复代码变成函数</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><span class="feature">1</span><h3>能定义</h3><p>写出 def function_name(parameters): 的基本结构。</p></div>
      <div class="box"><span class="feature" style="background:var(--green)">2</span><h3>能调用</h3><p>用 arguments 传入不同值，让同一函数处理多种情况。</p></div>
      <div class="box"><span class="feature" style="background:var(--amber)">3</span><h3>能返回</h3><p>用 return 把计算结果交回调用处。</p></div>
    </div>
    <div class="callout"><b>课堂产出：</b>greet、add_numbers、calculate_price，以及一个自己的可复用函数。</div>
    ${notes("把成果讲清楚：学生最后不是只会背 def，而是能封装一个小任务。")}`));

  S.push(sec("why-functions", `<div class="kicker">WHY FUNCTIONS</div>
    <h2>函数解决三个真实问题</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="box"><h3>减少重复</h3><p>同一段逻辑不用复制很多遍。</p></div>
      <div class="box"><h3>命名逻辑</h3><p>函数名告诉别人这段代码想做什么。</p></div>
      <div class="box"><h3>方便测试</h3><p>给不同输入，观察输出是否符合预期。</p></div>
    </div>
    <div class="callout"><b>关键句：</b>函数是“给一组步骤起名字”。</div>
    ${notes("可以展示重复 print 或重复计算，再问：哪一块值得封装？")}`));

  S.push(sec("function-purpose", `<div class="kicker">FROM QIN REFERENCE · FUNCTION IDEA</div>
    <h2>function 是一组完成特定任务的语句</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="box"><h3>Group</h3><p>把几行相关代码放在一起。</p></div>
      <div class="box"><h3>Task</h3><p>每个函数最好只完成一个清楚任务。</p></div>
      <div class="box"><h3>Name</h3><p>函数名应该让人猜到它会做什么。</p></div>
    </div>
    <div class="callout"><b>判断标准：</b>如果你能用一句动词短语描述它，就适合做成函数。</div>
    ${notes("源 deck 第 2 页定义 functions；这里转成学生可用的判断标准。")}`));

  S.push(sec("function-syntax", `<div class="kicker">FUNCTION SYNTAX</div>
    <h2>函数定义后不会自动运行</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>定义</h3><pre style="font-size:.68em"><code>def greet(name):
    print(f"Hello, {name}!")</code></pre></div>
      <div class="box"><h3>调用</h3><pre style="font-size:.68em"><code>greet("Sponge Bob")</code></pre></div>
    </div>
    <div class="callout"><b>常见错误：</b>只写了函数定义，但忘记在下面调用。</div>
    ${notes("分清 define 和 call。定义像写菜谱，调用才是真的做菜。")}`));

  S.push(sec("function-header-parts", `<div class="kicker">FROM QIN REFERENCE · FUNCTION HEADER</div>
    <h2>函数 header 的每一部分都有作用</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>def</h3><p>创建函数的关键字。</p></div>
      <div class="box"><h3>function_name</h3><p>用 snake_case 命名，例如 <code>calculate_total</code>。</p></div>
      <div class="box"><h3>(parameters):</h3><p>括号接收输入，冒号打开函数体。</p></div>
    </div>
    <pre style="font-size:.52em;margin-top:.65em"><code>def function_name(parameters):
    function_body</code></pre>
    ${notes("源 deck 3-11 页逐项标注 def/name/parentheses/parameters/colon/body。")}`));

  S.push(sec("snake-case", `<div class="kicker">NAMING</div>
    <h2>函数名用 snake_case，并说清楚动作</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>不够清楚</h3><pre style="font-size:.62em"><code>def do_it(x):
    ...</code></pre><p>别人不知道它做什么。</p></div>
      <div class="box"><h3>更清楚</h3><pre style="font-size:.62em"><code>def calculate_average(scores):
    ...</code></pre><p>动作和输入都写在名字里。</p></div>
    </div>
    <div class="callout"><b>科研代码习惯：</b>变量名和函数名本身就是说明文字。</div>
    ${notes("源 deck 第 6 页强调 snake case；这里补成命名规范页。")}`));

  S.push(labSlide("greet-lab", "PYTHON LAB", "第一个自定义函数：greet",
    "改名字、增加一次调用，观察同一个函数如何复用。",
    codeGreet, [], "让学生增加第三个 greet 调用，并把函数名改成更具体的名字。"));

  S.push(quizSlide("call-quiz", "CALLING FUNCTIONS",
    "如果只写 def greet(name): 但没有写 greet(\"Mia\")，会发生什么？",
    ["函数会自动运行一次", "不会输出任何东西", "Python 一定报错", "变量 name 会变成全局变量"],
    1,
    "函数定义只是把步骤保存起来；调用函数时，函数体才会执行。",
    "这道题帮助学生区分函数定义和函数调用。"));

  S.push(sec("built-in-vs-custom", `<div class="kicker">FROM QIN REFERENCE · CALLING FUNCTIONS</div>
    <h2>调用函数：内置函数和自定义函数规则一样</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>Built-in</h3><pre style="font-size:.62em"><code>print("Hello World")
input("Enter your name: ")</code></pre><p>Python 已经准备好的函数。</p></div>
      <div class="box"><h3>Custom</h3><pre style="font-size:.62em"><code>def greet(name):
    print(f"Hello, {name}!")

greet("Mia")</code></pre><p>我们自己定义，也用括号调用。</p></div>
    </div>
    ${notes("源 deck 13-16 页从 print/input 过渡到自定义函数调用。")}`));

  S.push(sec("params-args", `<div class="kicker">PARAMETERS VS ARGUMENTS</div>
    <h2>parameters 是占位名，arguments 是具体值</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.7em">
      <div class="box"><h3>定义时</h3><p><code>def add_numbers(num_1, num_2):</code></p><p><b>num_1</b> 和 <b>num_2</b> 是 parameters。</p></div>
      <div class="box"><h3>调用时</h3><p><code>add_numbers(3, 5)</code></p><p><b>3</b> 和 <b>5</b> 是 arguments。</p></div>
    </div>
    <div class="callout"><b>课堂问法：</b>这个名字是在函数定义里出现，还是调用时传进去？</div>
    ${notes("中文里都叫参数容易混淆，建议用“占位名/具体值”解释。")}`));

  S.push(sec("parameter-binding", `<div class="kicker">FROM QIN REFERENCE · PARAMETER BINDING</div>
    <h2>调用时，argument 会临时交给 parameter</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>Call</b><span><code>greet("Sponge Bob")</code></span></div>
      <div class="step"><div class="n">2</div><b>Bind</b><span><code>name = "Sponge Bob"</code> 只在函数这次运行里成立</span></div>
      <div class="step"><div class="n">3</div><b>Run body</b><span><code>print(f"Hello, {name}!")</code></span></div>
    </div>
    <div class="callout"><b>重点：</b>同一个函数下次调用时，parameter 可以接住另一个 argument。</div>
    ${notes("源 deck 17-20 页用 greet(name) 展示 parameter/argument 绑定。")}`));

  S.push(sec("positional-arguments", `<div class="kicker">FROM QIN REFERENCE · POSITIONAL ARGUMENTS</div>
    <h2>positional arguments 按位置对应</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>定义</h3><pre style="font-size:.62em"><code>def describe_student(name, topic):
    print(name, topic)</code></pre></div>
      <div class="box"><h3>调用</h3><pre style="font-size:.62em"><code>describe_student("Mia", "AI")
describe_student("AI", "Mia")</code></pre><p>顺序变了，含义就变了。</p></div>
    </div>
    ${notes("源 deck 36 之后讲 positional arguments；这里把风险讲清楚。")}`));

  S.push(sec("return-model", `<div class="kicker">RETURN</div>
    <h2>return 把结果交回调用处</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>Call</b><span>add_numbers(3, 5)</span></div>
      <div class="step"><div class="n">2</div><b>Compute</b><span>函数内部算出 result = 8</span></div>
      <div class="step"><div class="n">3</div><b>Return</b><span>把 8 交回外部变量 total</span></div>
    </div>
    <div class="callout"><b>return 不等于 print：</b>print 是显示；return 是把值传回去。</div>
    ${notes("这是本课最容易混淆的地方。反复用“屏幕输出”和“交回结果”区分。")}`));

  S.push(labSlide("return-lab", "PYTHON LAB", "add_numbers：保存返回值再输出",
    "把 3 和 5 改成别的数字，再新增一次调用。",
    codeReturn, [], "让学生先删掉 print 观察没有输出，再把返回值存入变量。"));

  S.push(quizSlide("return-quiz", "RETURN",
    "下面哪句话最准确？",
    ["return 会把结果显示到屏幕上", "print 会把值传回调用处", "return 把结果传回调用处，print 只是显示", "return 后面的同级代码一定继续执行"],
    2,
    "return 的作用是把值交回调用处；print 的作用是显示文本。return 后同级代码不会继续执行。",
    "如果时间允许，现场在 return 后加一行 print，验证它不会执行。"));

  S.push(sec("return-vs-output", `<div class="kicker">FROM QIN REFERENCE · RETURN VALUES</div>
    <h2>return value 可以继续参与后面的计算</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>只 print</h3><p>结果显示在屏幕上，但外部变量拿不到这个值。</p></div>
      <div class="box"><h3>return</h3><p>结果交回调用处，可以存入变量、继续计算、写入报告。</p></div>
    </div>
    <pre style="font-size:.52em;margin-top:.65em"><code>score = add_numbers(42, 8)
if score &gt;= 50:
    print("pass")</code></pre>
    ${notes("源 deck 23 之后进入 return value；这里强调科研 notebook 里返回值还能继续被分析。")}`));

  S.push(sec("keyword-args", `<div class="kicker">KEYWORD ARGUMENTS</div>
    <h2>关键字参数让调用更清楚，也更不怕顺序错</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>positional</h3><pre style="font-size:.62em"><code>calculate_price("apple", 3, 0.5)</code></pre><p>短，但读者需要记住顺序。</p></div>
      <div class="box"><h3>keyword</h3><pre style="font-size:.62em"><code>calculate_price(item="apple", quantity=3, price=0.5)</code></pre><p>长一点，但含义更清楚。</p></div>
    </div>
    ${notes("用 calculate_price 演示：顺序传错时可能不报错，但结果错，这比报错更危险。")}`));

  S.push(sec("type-hints", `<div class="kicker">FROM QIN REFERENCE · TYPE HINTS</div>
    <h2>type hints 让函数输入输出更容易读</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>没有提示</h3><pre style="font-size:.62em"><code>def calculate_price(item, quantity, price):
    return quantity * price</code></pre></div>
      <div class="box"><h3>有提示</h3><pre style="font-size:.62em"><code>def calculate_price(item: str, quantity: int, price: float) -> float:
    return quantity * price</code></pre></div>
    </div>
    <div class="callout"><b>注意：</b>type hints 默认不是强制检查，而是给人、编辑器和工具看的说明。</div>
    ${notes("源 deck 54 页提到 PEP 484 和 type hints，这里用 calculate_price 连接。")}`));

  S.push(labSlide("price-lab", "PYTHON LAB", "calculate_price：type hints + docstring",
    "观察 type hints、docstring 和 keyword arguments 如何让函数更容易读。",
    codePrice, [], "提醒学生：type hints 是给人和工具看的提示，Python 默认不会强制检查。"));

  S.push(sec("scope-docstring", `<div class="kicker">SCOPE + DOCSTRING</div>
    <h2>函数内部变量通常只在函数内部有效</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>scope</h3>${bullets(["函数内创建的变量是 local", "外部直接访问通常会 NameError", "返回值是更清楚的数据出口"])}</div>
      <div class="box"><h3>docstring</h3>${bullets(["写在函数开头的三引号字符串", "说明函数做什么", "说明输入和返回值"])}</div>
    </div>
    <div class="callout"><b>好函数：</b>名字清楚，输入清楚，返回清楚，说明清楚。</div>
    ${notes("scope 不必讲太深，重点是为什么函数内部变量不能随便在外面用。")}`));

  S.push(sec("scope-three-levels", `<div class="kicker">FROM QIN REFERENCE · SCOPE</div>
    <h2>Python 变量有不同的作用范围</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>local</h3><p>函数内部创建，只在函数内部直接使用。</p></div>
      <div class="box"><h3>global</h3><p>函数外部创建，整个文件都能看到。</p></div>
      <div class="box"><h3>nonlocal</h3><p>嵌套函数里才常见，本课只做认识。</p></div>
    </div>
    <div class="callout"><b>初学建议：</b>尽量用 parameters 输入，用 return 输出，少依赖 global。</div>
    ${notes("源 deck 69 之后讲 local/global/nonlocal；这里保留实用层级。")}`));

  S.push(sec("docstring-anatomy", `<div class="kicker">FROM QIN REFERENCE · DOCSTRING</div>
    <h2>docstring 是函数自带的说明书</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>写在哪里</h3><pre style="font-size:.58em"><code>def add_numbers(a, b):
    """Return the sum of two numbers."""
    return a + b</code></pre></div>
      <div class="box"><h3>写什么</h3>${bullets(["函数做什么", "重要参数代表什么", "返回值是什么", "特殊限制或假设"])}</div>
    </div>
    ${notes("源 deck 95 页讲 docstring，这里变成可直接模仿的写法。")}`));

  S.push(sec("function-practice-bank", `<div class="kicker">FROM QIN REFERENCE · PRACTICE</div>
    <h2>函数练习库：选一个写进 notebook</h2>
    <div class="grid3" style="margin-top:.7em">
      <div class="box"><h3>rectangle_area</h3><p>输入 length 和 width，return 面积。</p></div>
      <div class="box"><h3>is_even</h3><p>输入一个整数，return True 或 False。</p></div>
      <div class="box"><h3>classify_score</h3><p>输入分数，return 等级或建议。</p></div>
    </div>
    <div class="callout"><b>提交要求：</b>至少调用 3 次，每次用不同 arguments。</div>
    ${notes("源 deck 84-95 有多个练习页，这里整理成选择菜单。")}`));

  S.push(sec("class03-homework", `<div class="kicker">HOMEWORK</div>
    <h2>课后作业：新增一个自己的函数</h2>
    <div class="grid2" style="grid-template-columns:1.15fr .85fr;margin-top:.65em">
      <div class="box">${bullets([
        "新增一个函数，例如 calculate_average、classify_score 或 calculate_study_goal",
        "函数至少有 1 个参数，并至少调用 3 次",
        "至少一次把返回值存入变量，再输出解释性句子",
        "写 3-5 句话说明参数、返回值和封装理由",
        "可选：把一次结果写入 class03_result.txt"
      ])}</div>
      <div class="box"><h3>提交检查</h3><p>notebook 能从上到下运行；函数名、参数名能看出含义。</p><h3>重点</h3><p>能解释 return 和 print 的区别。</p></div>
    </div>
    ${notes("如果时间不足，File I/O 只做预告，不要挤占函数核心练习。")}`));

  S.push(sec("class03-exit", `<div class="kicker">EXIT TICKET</div>
    <h2>离开前确认三句话</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="skillcard"><div class="cn">我能定义</div><p>写出一个带参数的函数。</p></div>
      <div class="skillcard"><div class="cn">我能调用</div><p>传入不同 arguments 测试函数。</p></div>
      <div class="skillcard"><div class="cn">我能返回</div><p>把 return value 存入变量。</p></div>
    </div>
    <div class="callout"><b>留言任务：</b>点右下角 Comment，写一句“return 和 print 的区别”。</div>
    ${profQuote({
      quoteZh: "函数的价值不只是少写几行代码，而是给一个想法取名字，让它可以被反复使用。",
      quoteEn: "The value of a function is not just fewer lines of code; it gives an idea a name so we can reuse it.",
      explainZh: "当你能解释参数是什么、return 交回什么，你就不只是在运行代码，而是在设计代码。",
      explainEn: "When you can explain the parameters and the return value, you are not just running code; you are designing it."
    })}
    ${notes("用留言快速检查本课最关键误区。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

function buildPythonClass04() {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const bullets = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const codeScores = `scores = [85, 88, 92, 76, 90]

print("Original scores:", scores)

for i in range(len(scores)):
    scores[i] += 5

print("After curve:", scores)
print("Average:", sum(scores) / len(scores))`;
  const codeMatrix = `matrix = [
    [85, 88, 92],
    [76, 90, 84],
    [91, 87, 95],
]

for row_index in range(len(matrix)):
    row = matrix[row_index]
    print(f"Student {row_index + 1}: {row}")
    for score in row:
        print("  score:", score)

print("First student's second score:", matrix[0][1])`;
  const codeRoster = `students = ["Alice", "Bob", "Charlie", "Diana"]
scores = [85, 88, 92, 76]

for i in range(len(students)):
    print(f"{students[i]}: {scores[i]}")

target = "Bob"
for i in range(len(students)):
    if students[i] == target:
        scores[i] = 99

print("Updated scores:")
for i in range(len(students)):
    print(f"{students[i]}: {scores[i]}")`;

  S.push(sec("class04-title", `<div class="kicker">PYTHON FOR AI RESEARCH · CLASS 04</div>
    <h1 style="color:#fff">Lists and<br>2D Lists</h1>
    <p style="color:#cfe0ef;margin-top:.45em">用索引、循环和嵌套结构管理一组数据</p>
    <div class="grid3" style="margin-top:1em">
      <div class="skillcard"><div class="cn">访问</div><p>list[index]</p></div>
      <div class="skillcard"><div class="cn">修改</div><p>range(len(...))</p></div>
      <div class="skillcard"><div class="cn">嵌套</div><p>2D list + nested loop</p></div>
    </div>
    <p style="color:#9db8d6;font-size:.58em;margin-top:1em">按 S 看讲稿 · 右上角留言 · Python lab 可直接运行</p>
    ${notes("本课来自 Python Structure 课件的 list 部分。目标不是背方法，而是能用 list 表示一组学生、分数或实验记录。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  S.push(sec("class04-goals", `<div class="kicker">TODAY'S OUTPUT</div>
    <h2>今天把一组数据变成可处理的结构</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><span class="feature">1</span><h3>能访问</h3><p>用 index 读出 list 中的指定元素。</p></div>
      <div class="box"><span class="feature" style="background:var(--green)">2</span><h3>能遍历</h3><p>用 for-each 或 index loop 扫过每个元素。</p></div>
      <div class="box"><span class="feature" style="background:var(--amber)">3</span><h3>能建模</h3><p>用 2D list 表示表格型数据。</p></div>
    </div>
    <div class="callout"><b>课堂产出：</b>成绩列表加分、学生成绩表、二维成绩矩阵。</div>
    ${notes("先让学生理解 list 是“多个值放在一个变量里”，再进入二维结构。")}`));

  S.push(sec("list-index", `<div class="kicker">LIST INDEX</div>
    <h2>list 的每个元素都有位置编号</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.7em">
      <div class="box"><h3>数据</h3><pre style="font-size:.65em"><code>numbers = [1, 3, 5, 7, 9]</code></pre></div>
      <div class="box"><h3>索引</h3><p><code>numbers[0]</code> 是 1，<code>numbers[4]</code> 是 9。</p><p>Python 从 0 开始计数。</p></div>
    </div>
    <div class="callout"><b>常见错误：</b>最后一个元素不是 <code>numbers[5]</code>，而是 <code>numbers[4]</code>。</div>
    ${notes("用手指表格位置，让学生先预测 numbers[2] 是什么。")}`));

  S.push(quizSlide("list-index-quiz", "LIST INDEX",
    "numbers = [1, 3, 5, 7, 9]，numbers[2] 的值是什么？",
    ["1", "3", "5", "7"],
    2,
    "索引从 0 开始，所以 index 2 对应第三个元素 5。",
    "这道题检查学生是否还在用 1-based counting。"));

  S.push(sec("loop-two-ways", `<div class="kicker">LOOP TWO WAYS</div>
    <h2>遍历 list 有两种常用方式</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>for-each</h3><pre style="font-size:.58em"><code>for number in numbers:
    print(number)</code></pre><p>适合只读取每个值。</p></div>
      <div class="box"><h3>index loop</h3><pre style="font-size:.58em"><code>for i in range(len(numbers)):
    print(numbers[i])</code></pre><p>适合需要位置或要修改元素。</p></div>
    </div>
    ${notes("强调 for number in numbers 修改的是临时变量，不会自动改原 list。")}`));

  S.push(labSlide("score-curve-lab", "PYTHON LAB", "成绩列表：按 index 给每个分数加 5",
    "先运行，再把加分规则改成 +10 或只给低于 80 分的同学加分。",
    codeScores, [], "这是 list 修改的核心练习：要改原 list，通常需要 index。"));

  S.push(sec("foreach-trap", `<div class="kicker">COMMON TRAP</div>
    <h2>for-each 里的变量不是原列表格子</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>看起来像修改</h3><pre style="font-size:.58em"><code>for score in scores:
    score += 5</code></pre><p>只改了临时变量 score。</p></div>
      <div class="box"><h3>真正修改 list</h3><pre style="font-size:.58em"><code>for i in range(len(scores)):
    scores[i] += 5</code></pre><p>通过 index 写回原来的位置。</p></div>
    </div>
    <div class="callout"><b>判断标准：</b>等号左边是不是 <code>scores[i]</code>？</div>
    ${notes("这部分来自原课件中 number *= 2 但原 list 不变的动画。")}`));

  S.push(sec("two-d-list", `<div class="kicker">2D LIST</div>
    <h2>二维 list 可以表示表格</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>结构</h3><pre style="font-size:.58em"><code>matrix = [
    [85, 88, 92],
    [76, 90, 84],
    [91, 87, 95],
]</code></pre></div>
      <div class="box"><h3>访问</h3>${bullets(["matrix[0] 是第一行", "matrix[0][1] 是第一行第二个值", "外层循环走行，内层循环走列"])}</div>
    </div>
    ${notes("把二维 list 连接到成绩表、实验记录、图片像素或表格数据。")}`));

  S.push(labSlide("matrix-lab", "PYTHON LAB", "二维成绩表：nested loop",
    "运行后观察外层 row 和内层 score 的顺序。再新增一名学生的一行成绩。",
    codeMatrix, [], "让学生说清楚 row_index、row、score 三个变量分别代表什么。"));

  S.push(quizSlide("matrix-quiz", "2D LIST",
    "matrix[0][1] 表示什么？",
    ["第 0 行第 1 列，也就是第一行第二个元素", "第 1 行第 0 列", "整个第一行", "整个第二列"],
    0,
    "二维 list 的访问顺序通常是 row 再 column：matrix[row][column]。",
    "用表格坐标帮助学生理解。"));

  S.push(labSlide("roster-lab", "PYTHON LAB", "学生名单 + 分数：list 的局限",
    "这个练习故意用两个 list 管理学生和分数。第 6 课会用 dictionary 改得更自然。",
    codeRoster, [], "为 dictionary 做铺垫：用 list 查找 Bob 需要循环，不够直接。"));

  S.push(sec("class04-homework", `<div class="kicker">HOMEWORK</div>
    <h2>课后作业：用 list 管理一组成绩</h2>
    <div class="grid2" style="grid-template-columns:1.15fr .85fr;margin-top:.65em">
      <div class="box">${bullets([
        "创建一个至少 5 个分数的 list",
        "打印每个分数和平均分",
        "用 index loop 修改原 list 中的至少 2 个元素",
        "创建一个 2D list，表示至少 3 名学生的多次成绩",
        "写 3-5 句话解释什么时候需要 index"
      ])}</div>
      <div class="box"><h3>检查重点</h3><p>你的代码是否真的修改了原 list，而不是只修改临时变量。</p><h3>提交</h3><p>Colab notebook 链接。</p></div>
    </div>
    ${notes("作业可以要求学生截图输出，也可以让 notebook 保留运行结果。")}`));

  S.push(sec("class04-exit", `<div class="kicker">EXIT TICKET</div>
    <h2>离开前确认三件事</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="skillcard"><div class="cn">我能读</div><p>用 index 访问 list 元素。</p></div>
      <div class="skillcard"><div class="cn">我能改</div><p>用 index loop 修改原 list。</p></div>
      <div class="skillcard"><div class="cn">我能嵌套</div><p>用 2D list 表示表格。</p></div>
    </div>
    <div class="callout"><b>留言任务：</b>写一句：什么时候用 for-each，什么时候用 index loop？</div>
    ${profQuote({
      quoteZh: "list 让我们把很多值放在一起；index 让我们精确地指向其中一个位置。",
      quoteEn: "A list lets us keep many values together; an index lets us point to one exact position.",
      explainZh: "只读取时可以 for-each；需要改原列表、需要位置、需要二维表格时，index loop 更清楚。",
      explainEn: "Use for-each when you only read values. Use an index loop when position or updating the original list matters."
    })}
    ${notes("收集学生对 for-each 和 index loop 的理解。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

function buildPythonClass05() {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const bullets = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const codeTupleBasics = `colors = ("red", "green", "blue")

print(colors)
print(type(colors))
print("First color:", colors[0])
print("How many red?", colors.count("red"))

# Try uncommenting this line:
# colors[0] = "yellow"`;
  const codeUnpack = `person = ("Alice", 30, "New York")
name, age, city = person
print(f"Name: {name}, Age: {age}, City: {city}")

numbers = (1, 2, 3, 4, 5)
start, *middle, end = numbers
print("start:", start)
print("middle:", middle)
print("end:", end)`;
  const codeReturnTuple = `def divide_with_remainder(a: int, b: int) -> tuple[int, int]:
    quotient = a // b
    remainder = a % b
    return quotient, remainder

q, r = divide_with_remainder(17, 5)
print(f"Quotient: {q}, Remainder: {r}")

result = divide_with_remainder(23, 4)
print("Raw tuple:", result)`;

  S.push(sec("class05-title", `<div class="kicker">PYTHON FOR AI RESEARCH · CLASS 05</div>
    <h1 style="color:#fff">Tuples and<br>Unpacking</h1>
    <p style="color:#cfe0ef;margin-top:.45em">用不可变结构保存稳定记录，并让函数返回多个值</p>
    <div class="grid3" style="margin-top:1em">
      <div class="skillcard"><div class="cn">不可变</div><p>immutable</p></div>
      <div class="skillcard"><div class="cn">解包</div><p>name, age = record</p></div>
      <div class="skillcard"><div class="cn">返回</div><p>return q, r</p></div>
    </div>
    <p style="color:#9db8d6;font-size:.58em;margin-top:1em">按 S 看讲稿 · 右上角留言 · Python lab 可直接运行</p>
    ${notes("本课来自 Python Structure 的 tuple 部分。重点是 tuple 为什么存在，以及它和 list 的不同。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  S.push(sec("class05-goals", `<div class="kicker">TODAY'S OUTPUT</div>
    <h2>今天用 tuple 表示稳定记录</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><span class="feature">1</span><h3>能区分</h3><p>说清 list mutable、tuple immutable。</p></div>
      <div class="box"><span class="feature" style="background:var(--green)">2</span><h3>能解包</h3><p>把 tuple 中的元素直接赋给多个变量。</p></div>
      <div class="box"><span class="feature" style="background:var(--amber)">3</span><h3>能返回</h3><p>让函数用 tuple 返回多个结果。</p></div>
    </div>
    <div class="callout"><b>课堂产出：</b>学生记录 tuple、星号解包、除法函数返回商和余数。</div>
    ${notes("把 tuple 连接到稳定记录、坐标、函数返回值等真实使用场景。")}`));

  S.push(sec("tuple-model", `<div class="kicker">TUPLE MODEL</div>
    <h2>tuple 是有序、可索引、不可变的序列</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>像 list</h3>${bullets(["有顺序", "可以用 index 访问", "可以切片", "可以遍历"])}</div>
      <div class="box"><h3>不像 list</h3>${bullets(["创建后不能直接改某个元素", "更适合稳定记录", "常用于函数多返回值"])}</div>
    </div>
    <pre style="font-size:.52em;margin-top:.65em"><code>colors = ("red", "green", "blue")</code></pre>
    ${notes("不要只讲“括号”，要强调 tuple 的设计意图：稳定、不随便变。")}`));

  S.push(labSlide("tuple-basics-lab", "PYTHON LAB", "tuple 基础：访问、count、不可变",
    "运行后取消最后一行注释，观察 tuple 不能直接修改元素的报错。",
    codeTupleBasics, [], "让学生把 colors 改成自己的三项稳定记录，例如坐标或学生信息。"));

  S.push(quizSlide("tuple-quiz", "IMMUTABLE",
    "colors = ('red', 'green', 'blue')，下面哪行会报错？",
    ["print(colors[0])", "colors.count('red')", "colors[0] = 'yellow'", "len(colors)"],
    2,
    "tuple 是 immutable，不能用 index 直接改某个元素。",
    "这道题区分访问和修改。"));

  S.push(sec("update-tuples", `<div class="kicker">UPDATE TUPLES</div>
    <h2>tuple 不能原地改，但可以创建新的 tuple</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><h3>拼接</h3><p><code>colors + ('yellow',)</code></p></div>
      <div class="box"><h3>转 list</h3><p><code>list(colors)</code> 改完再 <code>tuple(...)</code></p></div>
      <div class="box"><h3>重新赋值</h3><p>变量可以指向一个新的 tuple。</p></div>
    </div>
    <div class="callout"><b>注意：</b>单元素 tuple 要写 <code>('yellow',)</code>，逗号很重要。</div>
    ${notes("原课件对 yellow 单元素 tuple 有多个反例，课堂上可以现场运行对比。")}`));

  S.push(sec("unpacking", `<div class="kicker">UNPACKING</div>
    <h2>tuple unpacking 让记录更容易读</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>记录</h3><pre style="font-size:.58em"><code>person = ("Alice", 30, "New York")</code></pre></div>
      <div class="box"><h3>解包</h3><pre style="font-size:.58em"><code>name, age, city = person</code></pre><p>变量数量要和元素数量对应。</p></div>
    </div>
    ${notes("强调 unpacking 是按位置对应，不是按变量名对应。")}`));

  S.push(labSlide("unpacking-lab", "PYTHON LAB", "unpacking 与星号解包",
    "改 person 和 numbers，观察普通解包与 *middle 的结果。",
    codeUnpack, [], "让学生解释 middle 为什么是 list，而不是 tuple。"));

  S.push(quizSlide("unpack-quiz", "UNPACKING",
    "name, age, city = ('Alice', 30, 'New York') 中，age 得到什么？",
    ["Alice", "30", "New York", "整个 tuple"],
    1,
    "unpacking 按位置赋值，第二个变量 age 得到第二个元素 30。",
    "检查学生是否理解位置对应。"));

  S.push(sec("tuple-return", `<div class="kicker">RETURN VALUES</div>
    <h2>tuple 很适合函数返回多个结果</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>Compute</b><span>计算 quotient 和 remainder</span></div>
      <div class="step"><div class="n">2</div><b>Return</b><span><code>return quotient, remainder</code></span></div>
      <div class="step"><div class="n">3</div><b>Unpack</b><span><code>q, r = divide(...)</code></span></div>
    </div>
    <div class="callout"><b>Python 习惯：</b>多个返回值其实常常是一个 tuple。</div>
    ${notes("连接第 3 课 return：这次 return 的不是一个数，而是一组结果。")}`));

  S.push(labSlide("return-tuple-lab", "PYTHON LAB", "函数返回商和余数",
    "运行后换几组数字，再把返回值 unpack 到不同变量名。",
    codeReturnTuple, [], "让学生比较 q, r = ... 和 result = ... 两种写法。"));

  S.push(sec("when-tuple", `<div class="kicker">WHEN TO USE TUPLE</div>
    <h2>什么时候应该考虑 tuple？</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="box"><h3>稳定记录</h3><p>坐标、日期、学生基本信息等不希望被随便改的数据。</p></div>
      <div class="box"><h3>函数返回</h3><p>一个函数自然产生多个相关结果。</p></div>
      <div class="box"><h3>字典 key</h3><p>tuple 不可变，所以可以作为 dictionary key。</p></div>
    </div>
    ${notes("预告 dictionary：key 必须是 immutable，tuple 可以当 key，list 不可以。")}`));

  S.push(sec("class05-homework", `<div class="kicker">HOMEWORK</div>
    <h2>课后作业：用 tuple 表示稳定记录</h2>
    <div class="grid2" style="grid-template-columns:1.15fr .85fr;margin-top:.65em">
      <div class="box">${bullets([
        "创建至少 3 个学生记录 tuple，例如 (name, age, topic)",
        "对其中一个记录做 unpacking，并输出自然语言句子",
        "写一个函数返回两个相关结果，并 unpack 返回值",
        "至少演示一次 tuple 不能直接修改元素的报错或说明",
        "写 3-5 句话说明 list 和 tuple 的选择标准"
      ])}</div>
      <div class="box"><h3>检查重点</h3><p>能不能解释 immutable，以及为什么 return 多个值时 tuple 很自然。</p><h3>提交</h3><p>Colab notebook 链接。</p></div>
    </div>
    ${notes("作业不要过度强调复杂方法，重点是数据结构选择。")}`));

  S.push(sec("class05-exit", `<div class="kicker">EXIT TICKET</div>
    <h2>离开前确认三句话</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="skillcard"><div class="cn">我能区分</div><p>list 可变，tuple 不可变。</p></div>
      <div class="skillcard"><div class="cn">我能解包</div><p>按位置把元素赋给变量。</p></div>
      <div class="skillcard"><div class="cn">我能返回</div><p>用 tuple 返回多个结果。</p></div>
    </div>
    <div class="callout"><b>留言任务：</b>写一个你认为适合用 tuple 的数据例子。</div>
    ${profQuote({
      quoteZh: "tuple 像一张稳定的小卡片：顺序重要，内容不该被随手改掉。",
      quoteEn: "A tuple is like a small stable card: the order matters, and the contents should not be casually changed.",
      explainZh: "当数据代表坐标、记录或函数多个返回值时，不可变反而是一种保护。",
      explainEn: "For coordinates, records, or multiple return values, immutability is not a limitation; it is protection."
    })}
    ${notes("检查学生能否把 tuple 用到真实场景。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

function buildPythonClass06() {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const bullets = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const codeStudents = `students = {
    "Alice": 85,
    "Bob": 88,
    "Charlie": 78,
    "Diana": 92,
}

print("Bob's score:", students["Bob"])
print("Eve's score:", students.get("Eve", "not found"))

students["Eve"] = 86
students["Bob"] = 99

for name, score in students.items():
    print(f"{name}: {score}")`;
  const codeInventory = `inventory = {}

def add_item(name: str, quantity: int) -> None:
    inventory[name] = quantity

def update_item(name: str, quantity: int) -> None:
    if name in inventory:
        inventory[name] = quantity
    else:
        print(f"{name} is not in inventory yet.")

def print_inventory() -> None:
    for name, quantity in inventory.items():
        print(f"{name}: {quantity}")

add_item("notebook", 12)
add_item("pen", 30)
update_item("pen", 25)
print_inventory()`;
  const codeWordFrequency = `def word_frequency(text: str) -> dict[str, int]:
    cleaned = text.lower()
    for mark in [".", "!", "?", ","]:
        cleaned = cleaned.replace(mark, "")

    counts = {}
    for word in cleaned.split():
        if word not in counts:
            counts[word] = 1
        else:
            counts[word] += 1
    return counts

sample = "The quick brown fox jumps over the lazy dog. The dog barked!"
print(word_frequency(sample))`;

  S.push(sec("class06-title", `<div class="kicker">PYTHON FOR AI RESEARCH · CLASS 06</div>
    <h1 style="color:#fff">Dictionaries and<br>Word Frequency</h1>
    <p style="color:#cfe0ef;margin-top:.45em">用 key-value 映射快速查找、更新和统计</p>
    <div class="grid3" style="margin-top:1em">
      <div class="skillcard"><div class="cn">映射</div><p>key -> value</p></div>
      <div class="skillcard"><div class="cn">访问</div><p>[] / get()</p></div>
      <div class="skillcard"><div class="cn">项目</div><p>word frequency</p></div>
    </div>
    <p style="color:#9db8d6;font-size:.58em;margin-top:1em">按 S 看讲稿 · 右上角留言 · Python lab 可直接运行</p>
    ${notes("本课来自 Python Structure 的 dictionary 部分。核心问题：如何不用循环就直接通过名字找到值。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));

  S.push(sec("class06-goals", `<div class="kicker">TODAY'S OUTPUT</div>
    <h2>今天用 dictionary 做快速查找和统计</h2>
    <div class="grid3" style="margin-top:.65em">
      <div class="box"><span class="feature">1</span><h3>能建表</h3><p>把 name 和 score 组成 key-value 映射。</p></div>
      <div class="box"><span class="feature" style="background:var(--green)">2</span><h3>能更新</h3><p>添加新 key，或修改已有 value。</p></div>
      <div class="box"><span class="feature" style="background:var(--amber)">3</span><h3>能统计</h3><p>用 dictionary 统计每个单词出现次数。</p></div>
    </div>
    <div class="callout"><b>课堂产出：</b>学生成绩字典、Inventory Manager、Word Frequency 函数。</div>
    ${notes("把 dictionary 的价值放在“查找 Bob 的成绩”这个痛点上。")}`));

  S.push(sec("why-dict", `<div class="kicker">WHY DICTIONARY</div>
    <h2>list of tuples 能做，但查找不方便</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>list of tuples</h3><pre style="font-size:.54em"><code>students = [
    ("Alice", 85),
    ("Bob", 88),
]</code></pre><p>找 Bob 要循环。</p></div>
      <div class="box"><h3>dictionary</h3><pre style="font-size:.54em"><code>students = {
    "Alice": 85,
    "Bob": 88,
}</code></pre><p><code>students["Bob"]</code> 直接找到。</p></div>
    </div>
    ${notes("这是原课件从 list/tuple 过渡到 dictionary 的关键逻辑。")}`));

  S.push(sec("dict-model", `<div class="kicker">KEY-VALUE PAIRS</div>
    <h2>dictionary 存的是 key -> value</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="box"><h3>key</h3><p>用于查找，必须唯一，通常是 string、number、tuple。</p></div>
      <div class="box"><h3>value</h3><p>真正保存的数据，可以是数字、文字、list、dict 等。</p></div>
      <div class="box"><h3>mapping</h3><p>通过 key 直接定位 value。</p></div>
    </div>
    <div class="callout"><b>注意：</b>list 是 mutable，不能作为 dictionary key。</div>
    ${notes("连接上一课 tuple：tuple 可以当 key，是因为它 immutable。")}`));

  S.push(quizSlide("dict-key-quiz", "DICTIONARY KEY",
    "下面哪个通常不能作为 dictionary key？",
    ["'Alice'", "42", "(1, 2)", "[1, 2]"],
    3,
    "list 是 mutable，不能作为 key；string、number、tuple 通常可以。",
    "检查学生是否理解 key 的不可变要求。"));

  S.push(labSlide("students-dict-lab", "PYTHON LAB", "学生成绩字典：访问、添加、更新、遍历",
    "运行后新增一个学生，再改一个学生的分数。",
    codeStudents, [], "让学生比较 [] 和 get()：找不到 key 时表现不同。"));

  S.push(sec("dict-views", `<div class="kicker">KEYS / VALUES / ITEMS</div>
    <h2>三种视角看同一个 dictionary</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="box"><h3>keys()</h3><p>只看所有 key，例如学生姓名。</p></div>
      <div class="box"><h3>values()</h3><p>只看所有 value，例如所有分数。</p></div>
      <div class="box"><h3>items()</h3><p>同时拿到 key 和 value，最适合遍历。</p></div>
    </div>
    <pre style="font-size:.5em;margin-top:.65em"><code>for name, score in students.items():
    print(name, score)</code></pre>
    ${notes("原课件强调 dict_keys/dict_values 是特殊 view，可以转成 list。课堂上不必展开太深。")}`));

  S.push(sec("update-dict", `<div class="kicker">UPDATE DICTIONARY</div>
    <h2>添加和更新都像给 key 赋值</h2>
    <div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">
      <div class="box"><h3>添加</h3><pre style="font-size:.62em"><code>students["Eve"] = 86</code></pre><p>如果 key 不存在，就新增。</p></div>
      <div class="box"><h3>更新</h3><pre style="font-size:.62em"><code>students["Bob"] = 99</code></pre><p>如果 key 已存在，就改 value。</p></div>
    </div>
    ${notes("对比 list 修改要靠 index，dictionary 修改靠 key。")}`));

  S.push(labSlide("inventory-lab", "PYTHON LAB", "Inventory Manager：字典小工具",
    "这个练习把 add、update、print 三个函数组合起来。",
    codeInventory, [], "这是从 dictionary 操作到小项目的过渡。"));

  S.push(sec("word-frequency-plan", `<div class="kicker">PROJECT THINKING</div>
    <h2>词频统计为什么适合 dictionary？</h2>
    <div class="flow" style="margin-top:.75em">
      <div class="step"><div class="n">1</div><b>Clean</b><span>小写化，去掉标点</span></div>
      <div class="step"><div class="n">2</div><b>Split</b><span>把句子拆成 words</span></div>
      <div class="step"><div class="n">3</div><b>Count</b><span>word 作为 key，次数作为 value</span></div>
    </div>
    <div class="callout"><b>核心判断：</b>如果 word 不在字典里，新增为 1；否则次数 +1。</div>
    ${notes("这是原课件最后的 word frequency practice，适合作为本节课最终产出。")}`));

  S.push(labSlide("word-frequency-lab", "PYTHON LAB", "Word Frequency：统计每个单词出现次数",
    "运行后换一段自己的句子，再观察结果字典。",
    codeWordFrequency, [], "快的学生可以加入更多标点、排序输出或忽略常见停用词。"));

  S.push(quizSlide("word-frequency-quiz", "WORD FREQUENCY",
    "在词频统计里，dictionary 的 key 最适合存什么？",
    ["每个单词", "每个单词出现次数", "整段原文", "标点符号"],
    0,
    "key 用来查找，词频统计里最自然的 key 是 word，value 是 count。",
    "用这题检查 key-value 的建模能力。"));

  S.push(sec("class06-homework", `<div class="kicker">HOMEWORK</div>
    <h2>课后作业：完成一个 dictionary 小项目</h2>
    <div class="grid2" style="grid-template-columns:1.15fr .85fr;margin-top:.65em">
      <div class="box">${bullets([
        "选择 Inventory Manager 或 Word Frequency",
        "必须创建并更新至少一个 dictionary",
        "必须使用 keys、values 或 items 中至少一个方法",
        "至少写一个函数封装主要逻辑",
        "写 3-5 句话解释 key 和 value 分别代表什么"
      ])}</div>
      <div class="box"><h3>加分挑战</h3><p>Word Frequency 结果按次数从高到低输出；Inventory Manager 支持删除物品。</p><h3>提交</h3><p>Colab notebook 链接。</p></div>
    </div>
    ${notes("作业应让学生说明数据结构选择，而不是只提交代码。")}`));

  S.push(sec("class06-exit", `<div class="kicker">EXIT TICKET</div>
    <h2>离开前确认三件事</h2>
    <div class="grid3" style="margin-top:.75em">
      <div class="skillcard"><div class="cn">我能建模</div><p>把问题转成 key-value。</p></div>
      <div class="skillcard"><div class="cn">我能更新</div><p>添加或修改 dictionary。</p></div>
      <div class="skillcard"><div class="cn">我能统计</div><p>用 dictionary 做词频计数。</p></div>
    </div>
    <div class="callout"><b>留言任务：</b>写一个现实中适合用 dictionary 表示的数据。</div>
    ${profQuote({
      quoteZh: "dictionary 的核心问题是：我已经知道 key，怎样最快找到它对应的 value？",
      quoteEn: "The central question of a dictionary is: if I know the key, how quickly can I find its value?",
      explainZh: "从学生到分数、商品到库存、单词到次数，key-value 是把现实问题变成数据结构的桥。",
      explainEn: "From students to scores, items to inventory, and words to counts, key-value pairs turn real problems into data structures."
    })}
    ${notes("收集学生是否理解 dictionary 的场景：名字到分数、商品到库存、单词到次数。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

const syncedZhLessons = {
  "01": {
    classNo: "01",
    title: "Python for AI Research",
    subtitle: "Colab、print、变量、input 和第一个可运行 notebook",
    output: "完成并提交一个 Python 学习档案 notebook。",
    skills: ["运行真实 Python 代码", "读懂变量和输出", "做一次有意义的修改"],
    concepts: [
      ["print", "把结果显示出来，让人能读懂程序在做什么。"],
      ["变量", "用有意义的名字保存一个值，后面可以重复使用。"],
      ["input", "从用户那里读取文字，需要计算时再做类型转换。"],
    ],
    vocab: [["Notebook", "混合代码、输出和说明的文档。"], ["Variable", "保存值的名字。"], ["f-string", "把变量嵌入文字的写法。"]],
    syntax: `name = "Lina"
age = 16
print(f"{name} is {age} years old.")`,
    demo: `name = "Mia"
topic = "AI research"
hours = 3

print(f"{name} is learning Python for {topic}.")
print(f"Next week goal: {hours + 1} hours.")`,
    labTitle: "Profile Builder",
    labIntro: "修改变量值，运行代码，观察 f-string 如何把变量组合成句子。",
    labCode: `name = "Lina"
grade = 10
interest = "computer vision"
weekly_hours = 4

print(f"My name is {name}.")
print(f"I am in grade {grade}.")
print(f"I want to explore {interest}.")
print(f"This week I will study Python for {weekly_hours} hours.")`,
    projectTitle: "My Python Learning Profile",
    projectInput: "姓名、年级、研究兴趣、每周学习时间。",
    projectProcess: "用变量保存输入，需要数字时转换类型。",
    projectOutput: "打印清楚的学习档案和下周目标。",
    projectCode: `name = input("Name: ")
grade = input("Grade: ")
interest = input("AI or data interest: ")
hours = float(input("Weekly Python hours: "))

print("---- Learning Profile ----")
print(f"Student: {name}, grade {grade}")
print(f"Interest: {interest}")
print(f"Next week goal: {hours + 1} hours")`,
    quiz1: ["name = \"Alex\" 之后，name 里保存的值是什么？", ["Alex", "name", "一个数字"], 0, "等号右边的值会保存到左边的变量名中。"],
    quiz2: ["input() 默认返回什么类型？", ["str", "int", "float"], 0, "input() 返回字符串；需要数学计算时再用 int() 或 float()。"],
    mistakes: [["缺少引号", "文字值需要引号。"], ["变量拼错", "topic 和 topics 是两个不同名字。"], ["没有重跑", "修改后要从上到下运行 notebook。"]],
    homework: ["完成 starter task", "加入一个自己的扩展", "从上到下运行所有 cells", "写 3-5 句话解释代码", "提交 Colab notebook 链接"],
    line: "先运行，再修改，最后能解释。",
  },
  "02": {
    classNo: "02",
    title: "Python Control Flow",
    subtitle: "条件、分支、循环和程序路径选择",
    output: "完成一个会根据规则做判断的小程序。",
    skills: ["预测 True / False 路径", "写出 if / elif / else", "用 for / while 减少重复"],
    concepts: [["条件表达式", "结果只有 True 或 False。"], ["分支", "根据条件选择一条代码路径。"], ["循环", "让同一段逻辑重复执行。"]],
    vocab: [["Boolean", "True 或 False 的值。"], ["Branch", "程序选择的一条路径。"], ["Loop", "重复执行的代码结构。"]],
    syntax: `score = 86
if score >= 90:
    label = "excellent"
elif score >= 70:
    label = "good"
else:
    label = "practice more"
print(label)`,
    demo: `numbers = [5, -2, 0]

for number in numbers:
    if number > 0:
        label = "positive"
    elif number < 0:
        label = "negative"
    else:
        label = "zero"
    print(f"{number}: {label}")`,
    labTitle: "Score Classifier",
    labIntro: "修改分数列表，观察不同条件路径如何影响输出。",
    labCode: `scores = [42, 50, 67, 81, 93]

for score in scores:
    if score < 50:
        grade = "fail"
    elif score < 70:
        grade = "pass"
    elif score < 90:
        grade = "good"
    else:
        grade = "excellent"
    print(f"{score} -> {grade}")`,
    projectTitle: "Rule-Based Classifier",
    projectInput: "一组分数、价格、年龄或测量值。",
    projectProcess: "用 if / elif / else 写出清楚规则，用循环处理每个值。",
    projectOutput: "输出每个输入对应的分类标签。",
    projectCode: `values = [12, 25, 40, 65]

for value in values:
    if value < 20:
        label = "low"
    elif value < 50:
        label = "medium"
    else:
        label = "high"
    print(value, "->", label)`,
    quiz1: ["Python 用什么决定一行是否属于 if 代码块？", ["括号", "缩进", "颜色"], 1, "Python 用缩进表示代码块。"],
    quiz2: ["for loop 最适合做什么？", ["重复处理一组值", "只显示标题", "删除 notebook"], 0, "for loop 让同一段逻辑依次处理多个值。"],
    mistakes: [["漏写冒号", "if / elif / else 行末需要冒号。"], ["缩进不一致", "同一代码块要保持相同缩进。"], ["边界条件漏掉", "检查等于阈值时走哪条路。"]],
    homework: ["完成一个分类小程序", "至少包含 3 条规则", "至少处理 5 个输入", "解释一个边界条件", "提交 notebook 链接"],
    line: "控制流让程序不只会往下走，还会做选择。",
  },
  "03": {
    classNo: "03",
    title: "Python Functions",
    subtitle: "命名逻辑、复用代码、返回结果",
    output: "写出并调用一个可复用的 helper function。",
    skills: ["定义函数", "传入参数", "返回结果"],
    concepts: [["def", "创建一个带名字的代码块。"], ["参数", "函数运行时需要的输入。"], ["return", "把结果交还给调用者。"]],
    vocab: [["Call", "运行一个函数。"], ["Parameter", "函数定义中的输入名字。"], ["Scope", "变量有效的范围。"]],
    syntax: `def add_bonus(score, bonus):
    return score + bonus

print(add_bonus(85, 5))`,
    demo: `def greet(name):
    return f"Hello, {name}!"

students = ["Ava", "Ben", "Mia"]
for student in students:
    print(greet(student))`,
    labTitle: "Helper Function Builder",
    labIntro: "把重复逻辑放进函数，再用不同输入调用它。",
    labCode: `def study_message(name, topic, hours):
    return f"{name} will study {topic} for {hours} hours."

print(study_message("Lina", "Python", 3))
print(study_message("Marco", "data", 4))`,
    projectTitle: "Reusable Score Helper",
    projectInput: "学生姓名、原始分数和加分规则。",
    projectProcess: "用函数封装计算和格式化输出。",
    projectOutput: "返回可读的结果句子。",
    projectCode: `def final_score(raw_score, bonus):
    score = raw_score + bonus
    if score > 100:
        score = 100
    return score

print(final_score(88, 7))
print(final_score(98, 5))`,
    quiz1: ["函数里的 return 有什么作用？", ["打印标题", "把结果返回给调用处", "停止电脑"], 1, "return 会把结果交还给调用函数的那一行。"],
    quiz2: ["什么时候值得写函数？", ["有重复逻辑时", "只写一次 print 时", "不想命名变量时"], 0, "函数适合封装会重复使用的逻辑。"],
    mistakes: [["忘记调用", "定义函数不会自动运行。"], ["参数数量不对", "调用时要匹配需要的参数。"], ["print 和 return 混淆", "print 显示结果，return 传回结果。"]],
    homework: ["写 2 个函数", "每个函数至少调用 2 次", "至少一个函数有 return", "写 docstring 或注释", "提交 notebook 链接"],
    line: "函数把一段会重复的想法变成工具。",
  },
  "04": {
    classNo: "04",
    title: "Python Lists and 2D Lists",
    subtitle: "用索引、循环和嵌套结构管理多项数据",
    output: "完成一个 list / 2D list 数据表小练习。",
    skills: ["访问 list 元素", "遍历并修改", "理解 2D list"],
    concepts: [["List", "按顺序保存多个值。"], ["Index", "元素在 list 中的位置，从 0 开始。"], ["2D List", "list 里面再放 list，像表格。"]],
    vocab: [["Append", "在末尾添加元素。"], ["Traversal", "逐个访问元素。"], ["Nested loop", "循环里面再写循环。"]],
    syntax: `scores = [85, 88, 92]
scores.append(95)
for score in scores:
    print(score)`,
    demo: `table = [
    ["Ava", 85],
    ["Ben", 92],
    ["Mia", 88],
]

for row in table:
    print(row[0], row[1])`,
    labTitle: "Score List Analyzer",
    labIntro: "修改分数列表，计算平均分和最高分。",
    labCode: `scores = [85, 88, 92, 76, 90]

total = 0
for score in scores:
    total = total + score

average = total / len(scores)
print("Average:", round(average, 1))
print("Best:", max(scores))`,
    projectTitle: "Mini Grade Table",
    projectInput: "若干学生姓名和分数。",
    projectProcess: "用 2D list 保存表格，用 nested loop 或索引读取。", 
    projectOutput: "输出每个学生和班级统计。",
    projectCode: `students = [
    ["Ava", 85],
    ["Ben", 92],
    ["Mia", 88],
]

for row in students:
    name = row[0]
    score = row[1]
    print(f"{name}: {score}")`,
    quiz1: ["scores[0] 访问的是哪个元素？", ["第一个", "第二个", "最后一个"], 0, "Python list 的索引从 0 开始。"],
    quiz2: ["2D list 适合表示什么？", ["表格数据", "单个数字", "一个布尔值"], 0, "2D list 可以表示行和列。"],
    mistakes: [["索引越界", "最后一个索引是 len(list)-1。"], ["修改副本", "确认你修改的是原 list。"], ["嵌套层级混乱", "先取 row，再取 row 里的元素。"]],
    homework: ["创建一个 2D list", "至少 4 行数据", "用循环输出每行", "计算一个统计值", "解释索引如何工作"],
    line: "list 让一组数据有顺序，2D list 让数据像表格。",
  },
  "05": {
    classNo: "05",
    title: "Python Tuples and Unpacking",
    subtitle: "用不可变记录和解包表达结构化数据",
    output: "完成一个 tuple record 与 unpacking 练习。",
    skills: ["创建 tuple", "理解不可变", "使用 unpacking"],
    concepts: [["Tuple", "有顺序、不可变的记录。"], ["Unpacking", "一次把多个位置的值取出来。"], ["Multiple return", "函数可以返回多个相关结果。"]],
    vocab: [["Immutable", "创建后不能直接修改。"], ["Record", "一组固定字段。"], ["Starred unpacking", "用 * 接收剩余值。"]],
    syntax: `student = ("Ava", 10, "AI")
name, grade, topic = student
print(name, topic)`,
    demo: `def min_max(values):
    return min(values), max(values)

low, high = min_max([4, 9, 2, 7])
print(low, high)`,
    labTitle: "Tuple Record Reader",
    labIntro: "用 tuple 保存固定记录，再用 unpacking 读出字段。",
    labCode: `records = [
    ("Ava", 10, "vision"),
    ("Ben", 11, "robotics"),
    ("Mia", 10, "language"),
]

for name, grade, topic in records:
    print(f"{name} studies {topic} in grade {grade}.")`,
    projectTitle: "Research Team Records",
    projectInput: "成员姓名、年级、研究兴趣。",
    projectProcess: "用 tuple 表示固定字段，用 unpacking 读取。",
    projectOutput: "生成团队成员简介。",
    projectCode: `team = [
    ("Lina", "data cleaning", 3),
    ("Marco", "visualization", 2),
    ("Nora", "modeling", 4),
]

for name, task, hours in team:
    print(f"{name}: {task}, {hours} hours")`,
    quiz1: ["tuple 和 list 最大区别之一是什么？", ["tuple 不可变", "tuple 不能保存文字", "list 没有顺序"], 0, "tuple 是不可变的有序结构。"],
    quiz2: ["name, age = person 这种写法叫？", ["unpacking", "looping", "rounding"], 0, "把 tuple/list 中的位置值拆到多个变量里。"],
    mistakes: [["尝试直接修改 tuple", "需要创建新的 tuple。"], ["解包数量不匹配", "变量数量要和元素数量匹配。"], ["字段顺序忘记", "固定记录要写清字段含义。"]],
    homework: ["创建 tuple records", "至少使用一次 unpacking", "写一个返回多个值的函数", "解释为什么用 tuple", "提交 notebook 链接"],
    line: "tuple 适合保存字段固定、不该随意改动的记录。",
  },
  "06": {
    classNo: "06",
    title: "Python Dictionaries and Word Frequency",
    subtitle: "用 key-value 映射表示现实数据并做统计",
    output: "完成一个 dictionary 或词频统计小项目。",
    skills: ["创建 key-value 映射", "更新 dictionary", "统计词频"],
    concepts: [["Key", "用来查找 value 的名字。"], ["Value", "key 对应的数据。"], ["items()", "同时遍历 key 和 value。"]],
    vocab: [["Mapping", "从 key 到 value 的关系。"], ["Lookup", "根据 key 找 value。"], ["Frequency", "某个词出现的次数。"]],
    syntax: `scores = {"Ava": 85, "Ben": 92}
scores["Mia"] = 88
for name, score in scores.items():
    print(name, score)`,
    demo: `text = "ai helps ai research"
counts = {}

for word in text.split():
    counts[word] = counts.get(word, 0) + 1

print(counts)`,
    labTitle: "Dictionary Builder",
    labIntro: "添加和修改 key-value，观察 dictionary 如何组织数据。",
    labCode: `inventory = {
    "notebook": 12,
    "marker": 8,
    "laptop": 3,
}

inventory["marker"] = inventory["marker"] + 2
inventory["charger"] = 5

for item, count in inventory.items():
    print(f"{item}: {count}")`,
    projectTitle: "Word Frequency Counter",
    projectInput: "一段英文或中文分词后的文字。",
    projectProcess: "用 dictionary 记录每个词出现次数。",
    projectOutput: "输出词频表。",
    projectCode: `text = "python ai python data ai python"
counts = {}

for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, count in counts.items():
    print(word, count)`,
    quiz1: ["dictionary 最适合表示什么关系？", ["key 到 value", "只有一个数字", "没有名字的顺序"], 0, "dictionary 用 key 快速找到对应 value。"],
    quiz2: ["counts.get(word, 0) 的 0 表示什么？", ["找不到 key 时的默认值", "删除 key", "停止循环"], 0, "如果 word 不存在，就从 0 开始计数。"],
    mistakes: [["key 拼写不一致", "同义但不同拼写会变成不同 key。"], ["覆盖旧值", "更新前确认是否需要累加。"], ["遍历方式混淆", "keys、values、items 各有用途。"]],
    homework: ["选择库存或词频项目", "创建并更新 dictionary", "使用 keys / values / items 至少一个", "用函数封装主要逻辑", "解释 key 和 value 的含义"],
    line: "dictionary 的核心问题是：我知道 key，怎样最快找到 value？",
  },
};

function buildSyncedChineseLesson(spec) {
  const S = [];
  const notes = (text) => `<aside class="notes">${esc(text)}</aside>`;
  const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const box3 = (items) => items.map(([h, p], i) => `<div class="box"><span class="feature"${i === 1 ? ' style="background:var(--green)"' : i === 2 ? ' style="background:var(--amber)"' : ""}>${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("");

  S.push(sec("title", `<div class="kicker" style="color:#7fd3df">PYTHON FOR AI RESEARCH / CLASS ${spec.classNo}</div>
    <h1 style="color:#fff">${esc(spec.title)}</h1>
    <p style="color:#cfe0ef;margin-top:.45em">${esc(spec.subtitle)}</p>
    <div class="grid3" style="margin-top:1em">${spec.skills.map((s) => `<div class="skillcard"><div class="cn">${esc(s.split(/[，,]/)[0])}</div><p>${esc(s)}</p></div>`).join("")}</div>
    <aside class="notes">中文 35 页同步版，页码与英文课件对齐，方便中英切换。</aside>`, "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));
  S.push(sec("outputs", `<div class="kicker">TODAY'S OUTPUT</div><h2>${esc(spec.output)}</h2><div class="grid3" style="margin-top:.65em">${box3([["理解", "能用自己的话解释今天的 Python 概念。"], ["练习", "运行并修改课堂示例代码。"], ["提交", "完成一个整洁 notebook，并加入一个小扩展。"]])}</div>${notes("先给出本节课可见产出。")}`));
  S.push(sec("two-hour-pacing", `<div class="kicker">2-HOUR PACING</div><h2>讲解、跟做、独立挑战、提交</h2><div class="flow" style="margin-top:.75em"><div class="step"><span class="n">0-20</span><b>Warm-up</b><span>预测、运行、讨论。</span></div><div class="step"><span class="n">20-55</span><b>Demo</b><span>完整看一遍思路。</span></div><div class="step"><span class="n">55-90</span><b>Guided lab</b><span>修改代码并观察输出。</span></div><div class="step loop"><span class="n">90-120</span><b>Challenge</b><span>构建、解释、提交。</span></div></div>${notes("用于管理两小时课堂节奏。")}`));
  S.push(sec("recap", `<div class="kicker">RECAP</div><h2>这节课放在课程里的位置</h2><p class="lead">我们用一个 Python 技能连接到后续 AI 科研项目：先写清楚代码，再解释结果。</p><div class="callout"><b>Python-first reminder:</b> 每节课都先把一个代码能力练扎实。</div>${notes("把今天内容连接到 15 节课路线。")}`));
  S.push(sec("warmup", `<div class="kicker">WARM-UP</div><h2>先预测，再运行</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em"><div class="box"><h3>学生动作</h3>${list(["先猜输出", "改一个小地方", "重新运行并比较"])}</div><div class="box"><h3>教师提问</h3>${list(["你预期输出是什么？", "哪一行最可能出错？", "第一步会改哪里？"])}</div></div>${notes("预测让学生主动阅读代码。")}`));
  S.push(sec("vocabulary", `<div class="kicker">VOCABULARY</div><h2>今天要会用的三个词</h2><div class="grid3" style="margin-top:.65em">${box3(spec.vocab)}</div>${notes("给学生解释代码的语言。")}`));
  S.push(sec("mental-model", `<div class="kicker">MENTAL MODEL</div><h2>先理解模型，再记语法</h2><div class="callout"><b>核心模型：</b>${esc(spec.concepts.map((c) => c[0]).join("、"))} 是今天的三块拼图；先知道它们各自解决什么问题。</div>${notes("用心智模型降低语法记忆负担。")}`));
  spec.concepts.forEach(([name, desc], i) => S.push(sec(`concept-${i + 1}`, `<div class="kicker">CONCEPT ${i + 1}</div><h2>${esc(name)}</h2><p class="lead">${esc(desc)}</p><div class="callout"><b>说给同学听：</b>如果有人缺课，你会怎样用一句话解释 ${esc(name)}？</div>${notes("短暂停顿，让学生口头解释。")}`)));
  S.push(sec("syntax-pattern", `<div class="kicker">SYNTAX PATTERN</div><h2>今天的 Python 模式</h2><pre style="font-size:.52em;max-height:430px;overflow:auto"><code>${esc(spec.syntax)}</code></pre><div class="callout"><b>运行前先读：</b>找出输入、处理和输出。</div>${notes("先读结构，再运行。")}`));
  S.push(sec("teacher-demo", `<div class="kicker">TEACHER DEMO</div><h2>先看一次完整流程</h2><pre style="font-size:.52em;max-height:430px;overflow:auto"><code>${esc(spec.demo)}</code></pre>${notes("先整体运行，再逐行解释。")}`));
  S.push(sec("trace-table", `<div class="kicker">TRACE THE CODE</div><h2>每一行运行后发生了什么？</h2><div class="grid3" style="margin-top:.65em">${box3([["Before", "这一行运行前有哪些值？"], ["During", "创建或改变了什么？"], ["After", "输出是否符合预测？"]])}</div>${notes("训练调试和阅读代码能力。")}`));
  S.push(quizSlide("prediction-quiz", "PREDICTION CHECK", spec.quiz1[0], spec.quiz1[1], spec.quiz1[2], spec.quiz1[3], "快速形成性检查。"));
  S.push(sec("guided-practice-1", `<div class="kicker">GUIDED PRACTICE 1</div><h2>小改动，然后重新运行</h2><div class="box">${list(["只改一个变量或一条规则", "重新运行并观察变化", "把变化说给旁边同学听"])}</div>${notes("一次只做一个小改动。")}`));
  S.push(sec("guided-practice-2", `<div class="kicker">GUIDED PRACTICE 2</div><h2>解释你的修改</h2><div class="grid3" style="margin-top:.65em"><div class="skillcard"><div class="cn">改了什么</div><p>指出具体代码行。</p></div><div class="skillcard"><div class="cn">输出变化</div><p>观察运行结果。</p></div><div class="skillcard"><div class="cn">为什么</div><p>解释背后的规则。</p></div></div>${notes("每次修改都要能解释。")}`));
  S.push(labSlide("guided-lab", "PYTHON LAB", spec.labTitle, spec.labIntro, spec.labCode, [], "两小时课堂的主要跟做实验。"));
  S.push(sec("mistake-clinic", `<div class="kicker">MISTAKE CLINIC</div><h2>今天最常见的错误</h2><div class="grid3" style="margin-top:.65em">${box3(spec.mistakes)}</div>${notes("把错误正常化，并给出修复路线。")}`));
  S.push(sec("debug-routine", `<div class="kicker">DEBUG ROUTINE</div><h2>读错误、定位、隔离、重跑</h2><div class="flow" style="margin-top:.75em"><div class="step"><span class="n">1</span><b>Read</b><span>读最后一行错误。</span></div><div class="step"><span class="n">2</span><b>Locate</b><span>找到行号。</span></div><div class="step"><span class="n">3</span><b>Isolate</b><span>测试最小片段。</span></div><div class="step loop"><span class="n">4</span><b>Rerun</b><span>从上到下重跑。</span></div></div>${notes("每周重复这个调试流程。")}`));
  S.push(sec("pair-programming", `<div class="kicker">PAIR PROGRAMMING</div><h2>Driver 写代码，Navigator 读逻辑</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em"><div class="box"><h3>Driver</h3><p>输入并运行代码。</p></div><div class="box"><h3>Navigator</h3><p>预测输出并检查逻辑。</p></div></div><div class="callout"><b>5 分钟后交换角色。</b></div>${notes("保持课堂参与度。")}`));
  S.push(sec("mini-project-brief", `<div class="kicker">MINI PROJECT</div><h2>${esc(spec.projectTitle)}</h2><div class="grid3" style="margin-top:.65em">${box3([["Input", spec.projectInput], ["Process", spec.projectProcess], ["Output", spec.projectOutput]])}</div>${notes("把项目都讲成 input -> process -> output。")}`));
  S.push(labSlide("mini-project-lab", "PYTHON LAB", `${spec.projectTitle} Starter`, "从这里开始，再在自己的 notebook 里扩展。", spec.projectCode, [], "独立项目 starter。"));
  S.push(sec("test-cases", `<div class="kicker">TEST CASES</div><h2>不要只测一个例子</h2><div class="grid3" style="margin-top:.65em">${box3([["普通情况", "一个典型输入。"], ["边界情况", "刚好在阈值附近。"], ["自定义情况", "你自己的例子。"]])}</div>${notes("测试能避免碰巧正确。")}`));
  S.push(sec("challenge-ladder", `<div class="kicker">CHALLENGE LADDER</div><h2>每个人至少完成 Level 1</h2><div class="flow" style="margin-top:.75em"><div class="step"><span class="n">1</span><b>Level 1</b><span>完成基础版并能运行。</span></div><div class="step"><span class="n">2</span><b>Level 2</b><span>修改数据并加入一个扩展。</span></div><div class="step"><span class="n">3</span><b>Level 3</b><span>加入测试并解释变化。</span></div></div>${notes("让不同速度的学生都有任务。")}`));
  S.push(quizSlide("concept-check", "CONCEPT CHECK", spec.quiz2[0], spec.quiz2[1], spec.quiz2[2], spec.quiz2[3], "独立练习前的理解检查。"));
  S.push(sec("independent-work", `<div class="kicker">INDEPENDENT WORK</div><h2>构建你自己的版本</h2><div class="callout"><b>规则：</b>不要只复制 starter code；至少做一个有意义的修改，并解释它。</div>${notes("这是主要独立练习时间。")}`));
  S.push(sec("explain-code", `<div class="kicker">EXPLAIN YOUR CODE</div><h2>先运行，再解释</h2><div class="grid3" style="margin-top:.65em"><div class="skillcard"><div class="cn">What</div><p>它做什么？</p></div><div class="skillcard"><div class="cn">Why</div><p>为什么这样写？</p></div><div class="skillcard"><div class="cn">Change</div><p>你改了哪里？</p></div></div>${notes("解释也是作业的一部分。")}`));
  S.push(sec("notebook-hygiene", `<div class="kicker">NOTEBOOK HYGIENE</div><h2>提交前整理 notebook</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em"><div class="box"><h3>Code</h3>${list(["从上到下能运行", "变量名可读", "删掉无关草稿", "输出清楚"])}</div><div class="box"><h3>Notes</h3>${list(["2-3 句 Markdown 说明", "解释输入和输出", "标出自己的扩展", "写一个问题"])}</div></div>${notes("预留整理时间。")}`));
  S.push(sec("ai-helper", `<div class="kicker">AI AS STUDY HELPER</div><h2>用 AI 学 Python，不是跳过 Python</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em"><div class="box"><h3>好用法</h3>${list(["像初学者一样解释这个错误", "给我一道类似练习题", "先给提示，不要直接给答案"])}</div><div class="box"><h3>避免</h3>${list(["直接写完整作业", "改同学代码当成自己的", "提交自己不能解释的代码"])}</div></div>${notes("让 AI 使用服务于学习。")}`));
  S.push(sec("rubric", `<div class="kicker">RUBRIC</div><h2>这次作业怎么评价</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em"><div class="box"><h3>40% 能运行</h3><p>notebook 从上到下能跑通。</p></div><div class="box"><h3>25% 能解释</h3><p>能说清关键代码。</p></div><div class="box"><h3>20% 有扩展</h3><p>有一个自己的有意义修改。</p></div><div class="box"><h3>15% 整洁</h3><p>结构清楚，输出可读。</p></div></div>${notes("明确期待。")}`));
  S.push(sec("homework", `<div class="kicker">HOMEWORK</div><h2>完成 mini project notebook</h2><div class="box">${list(spec.homework)}</div>${notes("作业要可完成，但不能只是复制。")}`));
  S.push(sec("submission-checklist", `<div class="kicker">SUBMISSION CHECKLIST</div><h2>提交前确认</h2><div class="grid3" style="margin-top:.65em"><div class="skillcard"><div class="cn">Run</div><p>所有 cells 都能运行。</p></div><div class="skillcard"><div class="cn">Share</div><p>链接权限可访问。</p></div><div class="skillcard"><div class="cn">Explain</div><p>说明文字清楚。</p></div></div>${notes("减少坏链接和无法运行的提交。")}`));
  S.push(sec("exit-ticket", `<div class="kicker">EXIT TICKET</div><h2>一个清楚点，一个问题</h2><div class="callout"><b>留言任务：</b>写下你现在最清楚的一点，以及还想问的一个问题。</div>${notes("收集快速反馈。")}`, "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));
  S.push(sec("line-to-remember", `<div class="kicker" style="color:#7fd3df">LINE TO REMEMBER</div><h2 style="color:#fff">${esc(spec.line)}</h2><p style="color:#cfe0ef;margin-top:.5em">Python skill first, AI project later.</p>${notes("一句话收束。")}`, "center", 'data-background-gradient="linear-gradient(135deg,#0B7E8A,#0F9DB0)"'));
  S.push(sec("buffer", `<div class="kicker">BUFFER / CATCH-UP</div><h2>最后几分钟这样用</h2><div class="grid3" style="margin-top:.65em">${box3([["需要帮助", "展示最后一行错误。"], ["快完成了", "向同伴解释代码。"], ["提前完成", "完成 Level 3 并写改进想法。"]])}</div>${notes("两小时课堂的收尾缓冲页。")}`));
  return S;
}

const { lessons: mappedLessons } = require("./curriculum-mapped");

const localeText = {
  zh: {
    source: "秦教授原始材料", outcome: "本节课产出", map: "知识点地图", demo: "教师示范",
    predict: "先预测输出，再运行代码，并逐行解释状态如何变化。", lab: "课堂 Python 实验",
    labIntro: "先运行 starter，再修改数据或规则，最后解释输出为什么改变。", practice: "分层练习",
    levels: [["Level 1 · 复现", "不看答案重新写出核心示例。"], ["Level 2 · 修改", "改变数据、边界或参数并验证结果。"], ["Level 3 · 迁移", "把同一知识点用于一个新场景。"]],
    homework: "课后任务", exit: "离开前，你应该能做到", close: "把语法变成可解释、可测试的研究工具。",
  },
  en: {
    source: "Professor Qin source", outcome: "Today's outcome", map: "Concept map", demo: "Teacher demo",
    predict: "Predict the output first, then run the code and explain each state change.", lab: "In-browser Python lab",
    labIntro: "Run the starter, change data or rules, and explain why the output changes.", practice: "Challenge ladder",
    levels: [["Level 1 · Rebuild", "Recreate the core example without the answer."], ["Level 2 · Modify", "Change data, boundaries, or parameters and verify the result."], ["Level 3 · Transfer", "Apply the same idea to a new context."]],
    homework: "Homework", exit: "Before leaving, you should be able to", close: "Turn syntax into an explainable, testable research tool.",
  },
};

function buildMappedLesson(record, lang) {
  const spec = record[lang];
  const ui = localeText[lang];
  const S = [];
  const notes = (t) => `<aside class="notes">${esc(t)}</aside>`;
  const cards = (items) => items.map(([h, p], i) => `<div class="box"><span class="feature"${i === 1 ? ' style="background:var(--green)"' : i === 2 ? ' style="background:var(--amber)"' : ""}>${i + 1}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("");
  const packages = record.n <= 2 ? ["pandas", "numpy"] : [];

  S.push(sec("title", `<div class="kicker" style="color:#7fd3df">PYTHON FOR AI RESEARCH / CLASS ${String(record.n).padStart(2, "0")}</div><h1 style="color:#fff">${esc(spec.title)}</h1><p style="color:#cfe0ef;margin-top:.45em">${esc(spec.summary)}</p><div class="callout" style="margin-top:1em"><b>${esc(ui.source)}:</b> ${esc(record.source)} · ${esc(record.sourcePages)}</div>${notes(`${ui.source}: ${record.source}, ${record.sourcePages}.`)}`, "center", 'data-background-gradient="linear-gradient(135deg,#0C2D52,#16406e)"'));
  S.push(sec("outcome", `<div class="kicker">${esc(ui.outcome)}</div><h2>${esc(spec.outcome)}</h2><div class="grid3" style="margin-top:.75em">${cards(ui.levels)}</div>${notes(spec.outcome)}`));
  S.push(sec("source-map", `<div class="kicker">SOURCE COVERAGE</div><h2>${esc(ui.map)}</h2><div class="grid2" style="grid-template-columns:1fr 1fr;margin-top:.65em">${spec.topics.map(([h,p]) => `<div class="box"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}</div>${notes(`This lesson covers ${record.source} ${record.sourcePages}.`)}`));
  spec.topics.forEach(([h, p], i) => S.push(sec(`concept-${i + 1}`, `<div class="kicker">CONCEPT ${i + 1}</div><h2>${esc(h)}</h2><p class="lead">${esc(p)}</p><div class="callout"><b>Explain:</b> ${esc(lang === "zh" ? "用一个自己的例子说明这个概念。" : "Explain this concept with an example of your own.")}</div>${notes(p)}`)));
  S.push(sec("teacher-demo", `<div class="kicker">${esc(ui.demo)}</div><h2>${esc(spec.title)}</h2><pre style="font-size:.52em;max-height:430px;overflow:auto"><code>${esc(spec.demo)}</code></pre><div class="callout"><b>Predict → Run → Explain:</b> ${esc(ui.predict)}</div>${notes(ui.predict)}`));
  S.push(quizSlide("concept-check", "CONCEPT CHECK", spec.quiz[0], spec.quiz[1], spec.quiz[2], spec.quiz[3], spec.quiz[3]));
  S.push(labSlide("guided-lab", "PYTHON LAB", ui.lab, ui.labIntro, spec.lab, packages, ui.labIntro));
  S.push(sec("practice", `<div class="kicker">PRACTICE</div><h2>${esc(ui.practice)}</h2><div class="grid3" style="margin-top:.75em">${cards(ui.levels)}</div>${notes(ui.practice)}`));
  S.push(sec("debug", `<div class="kicker">DEBUG ROUTINE</div><h2>Read → Locate → Isolate → Rerun</h2><div class="flow" style="margin-top:.75em"><div class="step"><span class="n">1</span><b>Read</b><span>Read the final error line.</span></div><div class="step"><span class="n">2</span><b>Locate</b><span>Find the failing line.</span></div><div class="step"><span class="n">3</span><b>Isolate</b><span>Test the smallest example.</span></div><div class="step loop"><span class="n">4</span><b>Rerun</b><span>Run top to bottom.</span></div></div>${notes("Use the same debugging routine every week.")}`));
  S.push(sec("homework", `<div class="kicker">${esc(ui.homework)}</div><h2>${esc(spec.title)}</h2><div class="box"><p class="lead">${esc(spec.homework)}</p></div><div class="callout"><b>Submission:</b> runnable notebook + short explanation + test evidence.</div>${notes(spec.homework)}`));
  S.push(sec("exit", `<div class="kicker">EXIT TICKET</div><h2>${esc(ui.exit)}</h2><div class="grid3" style="margin-top:.75em">${cards([[spec.topics[0][0], spec.topics[0][1]], [spec.topics[1][0], spec.topics[1][1]], [spec.topics.at(-1)[0], spec.topics.at(-1)[1]]])}</div>${notes(spec.outcome)}`, "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));
  S.push(sec("close", `<div class="kicker" style="color:#7fd3df">LINE TO REMEMBER</div><h2 style="color:#fff">${esc(ui.close)}</h2><p style="color:#cfe0ef;margin-top:.5em">${esc(spec.outcome)}</p>${notes(ui.close)}`, "center", 'data-background-gradient="linear-gradient(135deg,#0B7E8A,#0F9DB0)"'));
  return S;
}

const mappedCatalog = (lang) => mappedLessons.map((record) => {
  const spec = record[lang];
  return { id: `lesson-${String(record.n).padStart(2, "0")}`, n: record.n, title: spec.title, summary: spec.summary,
    tags: [`Class ${String(record.n).padStart(2, "0")}`, record.source.replace(/\.(pdf|ppsx)$/i, ""), "Quiz", "Lab"], duration: "2 hours", status: "ready" };
});
CATALOG.courses.find((course) => course.id === "python-ai").decks = mappedCatalog("zh");
CATALOG.courses.find((course) => course.id === "python-ai-en").decks = mappedCatalog("en");

const DECK_BUILDERS = {};
mappedLessons.forEach((record) => {
  const lessonId = `lesson-${String(record.n).padStart(2, "0")}`;
  DECK_BUILDERS[`python-ai/${lessonId}`] = { build: () => buildMappedLesson(record, "zh"), title: `Class ${record.n} · ${record.zh.title}` };
  DECK_BUILDERS[`python-ai-en/${lessonId}`] = { build: () => buildMappedLesson(record, "en"), title: `Class ${record.n} · ${record.en.title}` };
});

// =====================================================================
// WRITE
// =====================================================================
W("assets/site.css", siteCss);
W("assets/site.js", siteJs);
W("index.html", siteIndex());
W("catalog.json", JSON.stringify(CATALOG, null, 2));

let deckCount = 0;
CATALOG.courses.forEach((co) => {
  W(co.id + "/index.html", courseIndex(co));
  (co.decks || []).forEach((d) => {
    if (d.status !== "ready") return;
    const key = co.id + "/" + d.id;
    const entry = DECK_BUILDERS[key];
    if (!entry) { console.warn("⚠ no DECK_BUILDERS entry for ready deck:", key); return; }
    const slides = entry.build();
    W(key + "/index.html", deckHtml(key, entry.title, slides));
    console.log("  →", slides.length, "slides in", key);
    deckCount++;
  });
});
console.log("\nDONE — " + deckCount + " deck(s) built.");
