(function (global) {
  var store = new (global.Store)();
  var activeCategory = '全部';
  var bannerIndex = 0;
  var bannerTimer = null;

  var $ = function (sel) { return document.querySelector(sel); };

  function fmtCount(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + ' 万';
    return String(n);
  }

  function iconFor(app) { return app.icon; }

  function starHTML(r) {
    var s = '<span class="star">★</span> ' + r.toFixed(1);
    return s;
  }

  function badgePill(app) {
    var map = { featured: '精选', new: '新', hot: '热门' };
    var key = app.badge && map[app.badge] ? app.badge : null;
    return key ? ' <span class="badge-pill ' + key + '">' + map[key] + '</span>' : '';
  }

  function cardHTML(app, opts) {
    opts = opts || {};
    var unfav = opts.unfav
      ? '<button class="btn-remove" data-unfav="' + app.id + '">✕ 移除</button>'
      : '';
    return '<div class="card" data-id="' + app.id + '" data-route="app">' +
      '<div class="card-top">' +
        '<div class="card-icon">' + iconFor(app) + '</div>' +
        '<div><div class="card-name">' + app.name + badgePill(app) + '</div>' +
        '<div class="card-short">' + app.short + '</div></div>' +
      '</div>' +
      '<div class="card-meta"><span>' + starHTML(app.rating) + '</span><span>' + app.category + '</span>' + unfav + '</div>' +
    '</div>';
  }

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.add('hidden'); }, 1800);
  }

  function renderFavBadge() {
    var n = store.getFavorites().length;
    var b = $('#favBadge');
    b.textContent = n;
    b.classList.toggle('hidden', n === 0);
  }

  function bannerHTML(apps) {
    var app = apps[bannerIndex % apps.length];
    return '<div class="banner" data-id="' + app.id + '" data-route="app">' +
      '<div><h2>' + app.name + '</h2><p>' + app.short + '</p><p style="margin-top:14px">' +
      '<span class="btn" style="background:#fff;color:#4f6ef7">查看详情 →</span></p></div>' +
      '<div class="banner-dots">' + apps.map(function (a, i) {
        return '<span class="' + (i === bannerIndex % apps.length ? 'on' : '') + '"></span>';
      }).join('') + '</div></div>';
  }

  function rankList(apps) {
    return apps.map(function (app, i) {
      return '<div class="rank-row" data-id="' + app.id + '" data-route="app">' +
        '<span class="rank-num">' + (i + 1) + '</span>' +
        '<div class="card-icon" style="width:42px;height:42px;font-size:22px">' + iconFor(app) + '</div>' +
        '<div style="flex:1"><div class="card-name">' + app.name + '</div>' +
        '<div class="card-short">' + app.short + '</div></div>' +
        '<span class="star">★ ' + app.rating.toFixed(1) + '</span>' +
      '</div>';
    }).join('');
  }

  function chipHTML(active) {
    return CATEGORIES.map(function (c) {
      return '<span class="chip' + (c === active ? ' active' : '') + '" data-cat="' + c + '">' + c + '</span>';
    }).join('');
  }

  function renderHome() {
    var featured = APP_DATA.filter(function (a) { return a.featured; });
    var hot = APP_DATA.slice().sort(function (a, b) { return b.installs - a.installs; }).slice(0, 5);
    var filtered = activeCategory === '全部'
      ? APP_DATA
      : APP_DATA.filter(function (a) { return a.category === activeCategory; });
    var html =
      '<div>' + bannerHTML(featured.length ? featured : APP_DATA) + '</div>' +
      '<div class="section-title">✨ 精选应用</div>' +
      '<div class="hscroll">' + featured.map(cardHTML).join('') + '</div>' +
      '<div class="section-title">🔥 热门榜单</div>' +
      rankList(hot) +
      '<div class="section-title">🗂️ 全部应用</div>' +
      '<div class="chips">' + chipHTML(activeCategory) + '</div>' +
      '<div class="grid">' + (filtered.map(cardHTML).join('') || '<div class="empty">该分类暂无应用</div>') + '</div>';
    $('#app').innerHTML = html;
    renderFavBadge();
    syncNav();
  }

  function syncNav() {
    var path = location.hash.replace('#', '') || '/';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href').indexOf(path.replace('/app/', '/')) === 1);
    });
  }

  function startBanner() {
    clearInterval(bannerTimer);
    bannerTimer = setInterval(function () {
      bannerIndex++;
      renderHome();
    }, 4000);
  }

  function App() {}
  App.start = function () {
    var router = new (global.Router)(function (r) {
      clearInterval(bannerTimer);
      if (r.view === 'home') { renderHome(); startBanner(); }
      else if (r.view === 'search') { renderSearch(); }
      else if (r.view === 'app') { renderDetail(r.id); }
      else if (r.view === 'favorites') { renderFavorites(); }
      else { $('#app').innerHTML = '<div class="empty"><div class="big">🧭</div>页面不存在<br><a href="#/">返回首页</a></div>'; }
    });
    router.start();
    renderFavBadge();
    bindGlobalEvents();
  };

  function bindGlobalEvents() {
    document.addEventListener('click', function (e) {
      var fmem = e.target.closest('[data-unfav]');
      if (fmem) { store.removeFavorite(fmem.getAttribute('data-unfav')); toast('已从收藏移除'); renderFavorites(); return; }
      var card = e.target.closest('[data-route]');
      if (card) { location.hash = '#/app/' + card.getAttribute('data-id'); return; }
      var chip = e.target.closest('[data-cat]');
      if (chip) { activeCategory = chip.getAttribute('data-cat'); renderHome(); return; }
      var fav = e.target.closest('[data-fav]');
      if (fav) { toggleFav(fav.getAttribute('data-fav'), fav); }
      var his = e.target.closest('[data-his]');
      if (his) {
        var q = his.getAttribute('data-his');
        var input = $('#searchInput');
        if (input) { input.value = q; applySearch(q); }
        return;
      }
      if (e.target.closest('#clearHistory')) {
        store.clearHistory(); renderHistory(); return;
      }
    });
  }

  function matchApp(app, q) {
    q = String(q || '').toLowerCase().trim();
    if (!q) return true;
    var hay = [app.name, app.short, app.description, app.category].concat(app.tags).join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function renderSearch() {
    var html =
      '<h1 class="section-title">🔍 搜索应用</h1>' +
      '<div class="search-bar">' +
        '<input id="searchInput" type="search" placeholder="输入应用名、标签或关键词…" autocomplete="off">' +
      '</div>' +
      '<div class="chips">' + chipHTML(activeCategory) + '</div>' +
      '<div id="historyBox"></div>' +
      '<div id="searchResult"><div class="grid">' +
        APP_DATA.filter(function (a) { return activeCategory === '全部' || a.category === activeCategory; })
          .map(cardHTML).join('') +
      '</div></div>';
    $('#app').innerHTML = html;
    renderHistory();
    renderFavBadge();
    syncNav();
    var input = $('#searchInput');
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var q = input.value;
      timer = setTimeout(function () { applySearch(q); }, 200);
    });
  }

  function renderHistory() {
    var his = store.getHistory();
    if (!his.length) { $('#historyBox') && ($('#historyBox').innerHTML = ''); return; }
    $('#historyBox').innerHTML =
      '<div class="chips">' + his.map(function (h) {
        return '<span class="chip" data-his="' + h.replace(/"/g, '&quot;') + '">🕘 ' + h + '</span>';
      }).join('') +
      '<span class="chip" id="clearHistory">清空</span></div>';
  }

  function applySearch(q) {
    if (q.trim()) store.addHistory(q);
    var list = APP_DATA.filter(function (a) {
      return matchApp(a, q) && (activeCategory === '全部' || a.category === activeCategory);
    });
    $('#searchResult').innerHTML =
      list.length
        ? '<div class="grid">' + list.map(cardHTML).join('') + '</div>'
        : '<div class="empty"><div class="big">🤔</div>没有找到相关应用<br>换个关键词试试吧</div>';
    renderHistory();
  }

  function renderDetail(id) {
    var app = APP_DATA.filter(function (a) { return a.id === id; })[0];
    if (!app) {
      $('#app').innerHTML = '<div class="empty"><div class="big">🚫</div>应用未找到<br><a href="#/">返回首页</a></div>';
      return;
    }
    var fav = store.isFavorite(id);
    var related = APP_DATA.filter(function (a) { return a.id !== id && a.category === app.category; }).slice(0, 3);
    var html =
      '<div class="detail-hero">' +
        '<div class="detail-icon">' + iconFor(app) + '</div>' +
        '<div class="detail-info">' +
          '<h1>' + app.name + badgePill(app) + '</h1>' +
          '<div class="detail-meta">' + starHTML(app.rating) + ' · ' + fmtCount(app.installs) + ' 次获取 · v' + app.version + ' · ' + app.category + '</div>' +
          '<p>' + app.description + '</p>' +
          '<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">' +
            '<a class="btn btn-primary" href="' + app.url + '" target="_blank" rel="noopener">获取</a>' +
            '<button class="btn ' + (fav ? 'btn-ghost faved' : 'btn-ghost') + '" data-fav="' + app.id + '">' + (fav ? '♥ 已收藏' : '♡ 收藏') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="section-title">📸 应用截图</div>' +
      '<div class="hscroll">' + app.screenshots.map(function (s) {
        return '<div class="screenshot" style="background:' + s + ';flex:0 0 300px">' + app.icon + '</div>';
      }).join('') + '</div>' +
      (related.length ? '<div class="section-title">🧩 相关推荐</div><div class="grid">' +
        related.map(cardHTML).join('') + '</div>' : '') +
      '<footer>Web App Store · 纯前端演示站</footer>';
    $('#app').innerHTML = html;
    renderFavBadge();
    syncNav();
  }

  function renderFavorites() {
    var favs = store.getFavorites().map(function (id) {
      return APP_DATA.filter(function (a) { return a.id === id; })[0];
    }).filter(Boolean);
    var html =
      '<h1 class="section-title">💛 我的收藏</h1>' +
      (favs.length
        ? '<div class="grid">' + favs.map(function (a) { return cardHTML(a, { unfav: true }); }).join('') + '</div>'
        : '<div class="empty"><div class="big">💌</div>还没有收藏任何应用<br>点击卡片右下角 ♡ 即可收藏</div>');
    $('#app').innerHTML = html;
    renderFavBadge();
    syncNav();
  }

  function toggleFav(id, el) {
    var r = store.toggleFavorite(id);
    if (r.added) {
      if (el) { el.textContent = '♥ 已收藏'; el.classList.add('faved'); }
      toast('已加入收藏 ♥');
    } else {
      if (el) { el.textContent = '♡ 收藏'; el.classList.remove('faved'); }
      toast('已取消收藏');
    }
    renderFavBadge();
    if ((location.hash || '').indexOf('favorites') !== -1) { renderFavorites(); return; }
  }

  global.App = App;
  global.renderHome = renderHome;
  global.fmtCount = fmtCount;
  global.iconFor = iconFor;
  global.cardHTML = cardHTML;
  global.toast = toast;
  global.renderFavBadge = renderFavBadge;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { App.start(); });
    } else {
      App.start();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);