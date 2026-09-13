(function (global) {
  function parseHash(hash) {
    var h = String(hash || '').replace(/^#\/?/, '');
    if (!h) return { view: 'home' };
    var parts = h.split('/');
    if (parts[0] === 'app' && parts[1]) return { view: 'app', id: decodeURIComponent(parts[1]) };
    if (parts[0] === 'search') return { view: 'search' };
    if (parts[0] === 'favorites') return { view: 'favorites' };
    return { view: 'notfound' };
  }

  function Router(handler, win) {
    this._handler = handler;
    this._win = win || global;
  }

  // 读取当前 hash：优先真实 location，否则回退注入 win 的字符串 hash 字段（便于测试）
  Router.prototype._getHash = function () {
    return this._win.location ? this._win.location.hash : this._win.hash;
  };

  Router.prototype._setHash = function (path) {
    if (this._win.location) this._win.location.hash = path;
    else this._win.hash = path;
  };

  Router.prototype._onChange = function () {
    this._handler(parseHash(this._getHash()));
  };

  Router.prototype.start = function () {
    var self = this;
    this._handler(parseHash(this._getHash()));
    if (this._win.addEventListener) {
      this._win.addEventListener('hashchange', function () { self._onChange(); });
    }
  };

  Router.prototype.navigate = function (path) {
    this._setHash(path);
  };

  global.parseHash = parseHash;
  global.Router = Router;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseHash: parseHash, Router: Router };
  }
})(typeof window !== 'undefined' ? window : globalThis);