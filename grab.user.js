// ==UserScript==
// @name         进度记录器 · 一键记小说/剧集
// @namespace    https://veryrandomjy-ops.github.io/progress-tracker
// @version      1.3
// @description  在小说/剧集/动漫页面右下角常驻「记进度」按钮，点一下把作品名+看到的位置发到进度记录器网页自动填好。
// @author       veryrandomjy-ops
// @match        *://*/*
// @icon         https://veryrandomjy-ops.github.io/progress-tracker/icon.svg
// @homepageURL  https://veryrandomjy-ops.github.io/progress-tracker/
// @updateURL    https://veryrandomjy-ops.github.io/progress-tracker/grab.user.js
// @downloadURL  https://veryrandomjy-ops.github.io/progress-tracker/grab.user.js
// @grant        GM_openInTab
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  var TARGET = "https://veryrandomjy-ops.github.io/progress-tracker/";

  // 避免重复注入（SPA 路由切换或多次执行）
  if (document.getElementById("ptGrabBtn")) return;

  var btn = document.createElement("button");
  btn.id = "ptGrabBtn";
  btn.textContent = "📌 记进度";
  btn.title = "把当前页的作品名和进度发到进度记录器（长按/右键可隐藏）";
  btn.style.cssText = [
    "position:fixed",
    "right:14px",
    "bottom:14px",
    "z-index:2147483647",
    "padding:9px 13px",
    "border:none",
    "border-radius:22px",
    "background:#2d6cdf",
    "color:#fff",
    "font-size:14px",
    "font-weight:600",
    "line-height:1",
    "box-shadow:0 2px 10px rgba(0,0,0,.35)",
    "cursor:pointer",
    "font-family:-apple-system,system-ui,'PingFang SC',sans-serif",
    "user-select:none"
  ].join(";");

  // 右键/长按收起按钮（避免遮挡页面）
  btn.oncontextmenu = function (e) {
    e.preventDefault();
    btn.style.display = "none";
  };

  // 可靠地把进度记录器页打开：
  // 1) 油猴原生 GM_openInTab —— 专为脚本开新标签设计，可靠且保留原页面
  // 2) 兜底：直接在当前标签页打开，保证一定生效（弹窗被拦时不会“点了没反应”）
  function gotoTracker(dest) {
    if (typeof GM_openInTab === "function") {
      try { GM_openInTab(dest, { active: true }); return; } catch (e) {}
    }
    location.href = dest;
  }

  // 从面包屑 / 书名链接 / meta 抓干净书名（起点、晋江、番茄等通用）
  function pickBookName() {
    var cand = [];
    var a = document.querySelector('a[href*="/book/"]');
    if (a && a.textContent) cand.push(a.textContent.trim());
    var bookSel = [".book-name", ".book-info .name", ".book-title", "[class*=\"bookName\"]",
                   ".header-book-name", ".breadcrumb a", ".crumbs a", ".book-info a"];
    for (var i = 0; i < bookSel.length; i++) {
      var e = document.querySelector(bookSel[i]);
      if (e && e.textContent) cand.push(e.textContent.trim());
    }
    var m = document.querySelector('meta[property="og:novel:book_name"]');
    if (m && m.content) cand.push(m.content.trim());
    m = document.querySelector('meta[property="og:title"]');
    if (m && m.content) cand.push(m.content.trim());
    for (var j = 0; j < cand.length; j++) {
      var c = cand[j].replace(/[《》〈〉()（）]/g, "").trim();
      if (c && !/首页|小说|分类|正文|目录|书库|读书|阅读/.test(c) && c.length < 40) return c;
    }
    return "";
  }

  btn.onclick = function () {
    var title = (document.title || "").trim();

    // 优先抓 h1（很多阅读页的章节标题就是 h1），否则退回 title
    var h1El = document.querySelector("h1");
    var h1 = h1El ? (h1El.innerText || h1El.textContent || "").trim() : "";

    // 常见章节标题选择器，再补一层章节名（含起点阅读器样式）
    var chapter = "";
    var sel = [
      ".chapter-title", ".chapterTitle", ".j-chapterName", ".read-title",
      ".title", "#chapter-title", "[class*='chapter']", "[class*='Chapter']",
      ".reader-chapter-title", "#j_chapterName", "h2.title", ".main-title", ".reader-title"
    ];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el) {
        var txt = (el.innerText || el.textContent || "").trim();
        if (txt && txt.length < 120) { chapter = txt; break; }
      }
    }

    var book = pickBookName();

    var data = {
      title: title,
      h1: h1,
      url: location.href,
      chapter: chapter,
      book: book
    };

    var enc = encodeURIComponent(JSON.stringify(data));
    // 用 URL 哈希（#import=）传参：纯客户端，不会被跳转/代理/GitHub Pages 丢弃查询串导致丢失
    var dest = TARGET + "#import=" + enc;

    // 即时反馈，确认点击已生效
    var old = btn.textContent;
    btn.textContent = "✓ 已发送";
    setTimeout(function () { btn.textContent = old; }, 1500);

    gotoTracker(dest);
  };

  var mount = document.body || document.documentElement;
  if (mount) { mount.appendChild(btn); }
})();
