/* hhuijk SYSTEM · 页面脚本 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var els = {};
  var latest = null;

  function $(id) { return document.getElementById(kebab(id)); }

  function kebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function splitLines(text) {
    return String(text || "").split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
  }

  function renderNotes() {
    var lines = splitLines(latest.body || "暂无更新说明。");
    if (els.releaseNotesBody) {
      els.releaseNotesBody.innerHTML = "";
      lines.forEach(function (line) {
        var p = document.createElement("p");
        p.textContent = line;
        els.releaseNotesBody.appendChild(p);
      });
    }
  }

  function renderList() {
    if (!els.releaseList) return;
    els.releaseList.innerHTML = "";
    var lines = splitLines(latest.body || "暂无详细说明。");
    var item = document.createElement("div");
    item.className = "release-item";
    lines.forEach(function (line) {
      var p = document.createElement("p");
      p.className = "ri-body";
      p.textContent = line;
      item.appendChild(p);
    });
    els.releaseList.appendChild(item);
  }

  function init() {
    ["releaseList", "releaseNotesBody"].forEach(function (id) {
      els[id] = $(id);
    });

    latest = cfg.LOCAL_RELEASE || { body: "" };

    renderNotes();
    renderList();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
