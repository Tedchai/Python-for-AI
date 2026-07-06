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
        { id: "lesson-02", n: 2, title: "Python Control Flow", summary: "if / elif / else、for、while、break、continue。", tags: ["Class 02", "Control Flow"], status: "planned" },
        { id: "lesson-03", n: 3, title: "Python Functions", summary: "def、参数、return、keyword arguments、scope、docstring。", tags: ["Class 03", "Functions"], status: "planned" },
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
#commentBtn{position:fixed;right:16px;bottom:14px;z-index:60;background:var(--teal);color:#fff;border:none;border-radius:999px;padding:9px 15px;font-size:13px;font-weight:700;font-family:-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(15,157,176,.4)}
#commentBtn:hover{background:#0d8a9b}#commentBtn .cnum{background:#fff;color:var(--teal);border-radius:999px;padding:0 6px;margin-left:5px;font-size:11px}
#listenBtn{--p:0%;position:fixed;right:148px;bottom:14px;z-index:60;min-width:128px;justify-content:center;color:#fff;border:none;border-radius:999px;padding:9px 15px;font-size:13px;font-weight:700;font-family:-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(20,40,70,.34);display:none;align-items:center;gap:.45em;background:linear-gradient(to right,var(--teal) var(--p),var(--navy) var(--p));transition:background .15s linear}
#listenBtn:hover{filter:brightness(1.1)}
#listenBtn.playing{background:linear-gradient(to right,var(--coral) var(--p),#16406e var(--p))}
#listenBtn .li-ic{font-size:12px;line-height:1}#listenBtn .li-tx{font-variant-numeric:tabular-nums;font-size:11.5px;opacity:.92}
#ccBtn{position:fixed;right:286px;bottom:14px;z-index:60;background:var(--navy);color:#fff;border:none;border-radius:999px;padding:9px 12px;font-size:11.5px;font-weight:800;letter-spacing:.03em;font-family:-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(20,40,70,.34);display:none;opacity:.5}
#ccBtn:hover{opacity:.8}#ccBtn.on{opacity:1;background:var(--teal)}
#capBar{position:fixed;left:50%;bottom:58px;transform:translateX(-50%);max-width:70%;background:rgba(8,16,30,.88);color:#fff;padding:.4em 1em;border-radius:9px;font-size:13.5px;line-height:1.35;text-align:center;z-index:59;display:none;font-family:-apple-system,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)}
#commentPanel{position:fixed;right:16px;bottom:60px;width:340px;max-height:64vh;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 16px 44px rgba(20,40,70,.22);z-index:61;display:none;flex-direction:column;font-family:-apple-system,sans-serif;overflow:hidden}
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

<script src="${REVEAL}/dist/reveal.js"></script>
<script src="${REVEAL}/plugin/notes/notes.js"></script>
<script src="${PYODIDE}/pyodide.js"></script>
<script>
const DECK = ${JSON.stringify(deckId)};
Reveal.initialize({ hash:true, slideNumber:'c/t', controls:true, progress:true,
  width:1280, height:720, margin:0.04, transition:'slide',
  keyboardCondition:'focused', plugins:[ RevealNotes ] });

/* ---------- Shared audio player ----------
 * One audio element, already attached to the DOM (see markup above), reused
 * for every play. A bare detached Audio object is never used: on at least one
 * real browser/profile that made Chrome abort play() within milliseconds
 * ("interrupted because the media was removed from the document") — audio
 * never audibly played and the button silently reset to idle before anyone
 * noticed. Reusing an attached element avoids that path. */
const _audio=document.getElementById('narratorAudio');
let _btn=null,_playToken=0;
function fmtClock(s){ s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function resetListenUI(){ listenBtn.style.setProperty('--p','0%'); listenBtn.querySelector('.li-ic').textContent='▶'; listenBtn.querySelector('.li-tx').textContent='Listen'; }
function stopAudio(){
  _playToken++; // invalidate any in-flight play() for the old src
  _audio.pause(); _audio.currentTime=0; _audio.removeAttribute('src'); _audio.load();
  _audio.removeEventListener('timeupdate',onListenTimeupdate); // else it'd animate listenBtn during a .speak clip
  capBar.style.display='none';
  if(_btn){
    _btn.classList.remove('playing');
    if(_btn===listenBtn) resetListenUI();
    else if(_btn.querySelector('span')) _btn.querySelector('span').textContent=_btn.dataset.label||'Speak';
  }
  _btn=null;
}
document.addEventListener('click',function(e){
  const b=e.target.closest('.speak'); if(!b) return;
  if(_btn===b && !_audio.paused){ stopAudio(); return; }
  stopAudio();
  const token=_playToken;
  _btn=b; b.dataset.label=b.dataset.label||b.querySelector('span').textContent;
  b.classList.add('playing'); b.querySelector('span').textContent='Pause';
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
function _hashSid(s){ const t=((s&&s.textContent)||'').replace(/\s+/g,' ').trim().slice(0,400); let h=0; for(let i=0;i<t.length;i++){ h=(h*31+t.charCodeAt(i))|0; } return 'auto-'+(h>>>0).toString(36); }
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
    ${notes("用留言收集课堂反馈。如果是 GitHub Pages 静态部署，评论功能会降级；本地 server 或后端部署时可持久保存。")}`,
    "center", 'data-background-gradient="linear-gradient(135deg,#EEF4FA,#FFFFFF)"'));

  return S;
}

const DECK_BUILDERS = {
  "python-ai/lesson-01": { build: buildPythonClass01, title: "Class 01 · Python for AI Research" },
};

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
