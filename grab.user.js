// ==UserScript==
// @name         进度记录器 · 一键记小说/剧集
// @namespace    https://veryrandomjy-ops.github.io/progress-tracker
// @version      1.0
// @description  在小说/剧集/动漫页面右下角常驻「记进度」按钮，点一下把作品名+看到的位置发到进度记录器网页自动填好。
// @author       veryrandomjy-ops
// @match        *://*/*
// @icon         https://veryrandomjy-ops.github.io/progress-tracker/icon.svg
// @homepageURL  https://veryrandomjy-ops.github.io/progress-tracker/
// @updateURL    https://veryrandomjy-ops.github.io/progress-tracker/grab.user.js
// @downloadURL  https://veryrandomjy-ops.github.io/progress-tracker/grab.user.js
// @grant        none
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

  btn.onclick = function () {
    var title = (document.title || "").trim();

    // 优先抓 h1（很多阅读页的章节标题就是 h1），否则退回 title
    var h1El = document.querySelector("h1");
    var h1 = h1El ? (h1El.innerText || h1El.textContent || "").trim() : "";

    // 常见章节标题选择器，再补一层章节名
    var chapter = "";
    var sel = [
      ".chapter-title", ".chapterTitle", ".j-chapterName", ".read-title",
      ".title", "#chapter-title", "[class*='chapter']", "[class*='Chapter']"
    ];
    for (var i = 0; i < sel.length; i++) {
      var el = document.querySelector(sel[i]);
      if (el) {
        var txt = (el.innerText || el.textContent || "").trim();
        if (txt && txt.length < 120) { chapter = txt; break; }
      }
    }

    var data = {
      title: title,
      h1: h1,
      url: location.href,
      chapter: chapter
    };

    var enc = encodeURIComponent(JSON.stringify(data));
    var dest = TARGET + "?import=" + enc;

    // 优先新开标签页；被拦截则跳转当前页
    var w = window.open(dest, "_blank");
    if (!w) { location.href = dest; }
  };

  var mount = document.body || document.documentElement;
  if (mount) { mount.appendChild(btn); }
})();
