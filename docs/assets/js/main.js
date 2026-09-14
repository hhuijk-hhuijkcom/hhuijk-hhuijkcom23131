/* hhuijk SYSTEM · 页面脚本 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var repo = cfg.SITE_REPO || "hhuijk-hhuijkcom/hhuijk-cx";
  var source = cfg.RELEASE_SOURCE || "github";

  var els = {};
  var latest = null;
  var assets = [];

  function kebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function $(id) { return document.getElementById(kebab(id)); }

  function esc(text) {
    var div = document.createElement("div");
    div.textContent = text == null ? "" : String(text);
    return div.innerHTML;
  }

  function fmtDate(str) {
    if (!str) return "";
    var d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function githubLatest() {
    var url = "https://api.github.com/repos/" + repo + "/releases/latest";
    return fetch(url, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      });
  }

  function useLocal() {
    latest = cfg.LOCAL_RELEASE || { tag: "v0.6.3", name: "v0.6.3", date: "", body: "" };
    assets = cfg.LOCAL_ASSETS || [];
  }

  function splitLines(text) {
    return String(text || "").split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
  }

  function setText(id, value) {
    if (els[id]) els[id].textContent = value;
  }

  function setValue(id, value) {
    if (els[id]) els[id].value = value;
  }

  function renderReleaseInfo() {
    var tag = latest.tag || latest.name || "";
    setText("latestVersion", tag);
    setText("headerVersion", tag);
    setText("sideVersion", tag);
    setText("noticeVersion", tag);
    setText("termVersion", tag);
    setText("latestDate", latest.date ? "发布于 " + fmtDate(latest.date) : "版本信息加载失败，请前往 Releases 查看");

    if (assets.length > 0) {
      var main = assets[0];
      setValue("mainDownloadName", main.name || "hhuijkSetup.exe");
      var btn = els.mainDownloadBtn;
      if (btn) {
        btn.href = main.browser_download_url || "#download";
        btn.download = main.name || "";
      }
      setText("downloadNote", "点击「开始下载」即可获取 " + (main.name || "安装程序") + "。");
      if (els.assetList) {
        els.assetList.innerHTML = "";
        assets.forEach(function (a) {
          var link = document.createElement("a");
          link.className = "asset-link";
          link.href = a.browser_download_url || "#";
          link.rel = "noopener";
          link.textContent = a.name || "下载";
          els.assetList.appendChild(link);
        });
      }
    } else {
      setText("downloadNote", "未找到下载资源，请前往 Releases 页面获取。");
      if (els.assetList) els.assetList.innerHTML = "<span>暂无可用资源</span>";
    }
  }

  function renderNotes() {
    var lines = splitLines(latest.body || latest.name || "查看 Releases 获取详细信息。");
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
    ["latestVersion", "latestDate", "downloadNote", "mainDownloadBtn",
     "mainDownloadName", "assetList", "headerVersion", "sideVersion",
     "noticeVersion", "termVersion", "releaseList", "releaseNotesBody",
     "allReleasesLink"].forEach(function (id) {
      els[id] = $(id);
    });

    if (els.allReleasesLink) {
      els.allReleasesLink.href = "https://github.com/" + repo + "/releases";
    }

    var done = function () {
      renderReleaseInfo();
      renderNotes();
      renderList();
    };

    if (source === "github") {
      githubLatest()
        .then(function (data) {
          latest = { tag: data.tag_name, name: data.name || data.tag_name, date: data.published_at, body: data.body };
          assets = (data.assets || []).map(function (a) {
            return { name: a.name, browser_download_url: a.browser_download_url };
          });
          done();
        })
        .catch(function () {
          useLocal();
          done();
        });
    } else {
      useLocal();
      done();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();