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

  function fmtDate(str) {
    if (!str) return "";
    var d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function splitLines(text) {
    return String(text || "").split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
  }

  function setText(id, value) {
    if (els[id]) els[id].textContent = value;
  }

  function renderReleaseInfo() {
    var tag = latest.tag || latest.name || "";
    setText("latestVersion", tag);
    setText("headerVersion", tag);
    setText("termVersion", tag);
    setText("statVersion", tag);
    setText("latestDate", latest.date ? "发布于 " + fmtDate(latest.date) : "版本信息暂未更新");
  }

  function renderNotes() {
    var lines = splitLines(latest.body || latest.name || "暂无更新说明。");
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
    var lines = splitLines(latest.body || "该版本暂无详细说明。");
    var item = document.createElement("div");
    item.className = "release-item";
    var mainRow = document.createElement("div");
    mainRow.className = "ri-main";
    var ver = document.createElement("span");
    ver.className = "ri-version";
    ver.textContent = latest.tag || latest.name || "";
    var date = document.createElement("span");
    date.className = "ri-date";
    date.textContent = fmtDate(latest.date);
    mainRow.appendChild(ver);
    mainRow.appendChild(date);
    item.appendChild(mainRow);
    lines.forEach(function (line) {
      var p = document.createElement("p");
      p.className = "ri-body";
      p.textContent = line;
      item.appendChild(p);
    });
    els.releaseList.appendChild(item);
  }

  function init() {
    ["latestVersion", "latestDate", "headerVersion", "termVersion",
     "statVersion", "releaseList", "releaseNotesBody"].forEach(function (id) {
      els[id] = $(id);
    });

    latest = cfg.LOCAL_RELEASE || { tag: "", name: "", date: "", body: "" };

    renderReleaseInfo();
    renderNotes();
    renderList();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
