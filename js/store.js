(function (global) {
  var KEY_FAV = 'ws.favorites';
  var KEY_HIS = 'ws.history';
  var MAX_HIS = 8;

  function Store(storage) {
    this._s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  }

  Store.prototype._read = function (key, fallback) {
    try {
      var raw = this._s && this._s.getItem(key);
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return Array.isArray(val) ? val : fallback;
    } catch (e) {
      return fallback;
    }
  };

  Store.prototype._write = function (key, val) {
    if (this._s) this._s.setItem(key, JSON.stringify(val));
  };

  Store.prototype.getFavorites = function () {
    return this._read(KEY_FAV, []);
  };

  Store.prototype.isFavorite = function (id) {
    return this.getFavorites().indexOf(id) !== -1;
  };

  Store.prototype.addFavorite = function (id) {
    var list = this.getFavorites();
    if (list.indexOf(id) === -1) {
      list.push(id);
      this._write(KEY_FAV, list);
    }
  };

  Store.prototype.removeFavorite = function (id) {
    this._write(KEY_FAV, this.getFavorites().filter(function (x) { return x !== id; }));
  };

  Store.prototype.toggleFavorite = function (id) {
    if (this.isFavorite(id)) {
      this.removeFavorite(id);
      return { added: false };
    }
    this.addFavorite(id);
    return { added: true };
  };

  Store.prototype.getHistory = function () {
    return this._read(KEY_HIS, []);
  };

  Store.prototype.addHistory = function (q) {
    var qq = String(q || '').trim();
    if (!qq) return;
    var list = this.getHistory().filter(function (x) { return x !== qq; });
    list.unshift(qq);
    this._write(KEY_HIS, list.slice(0, MAX_HIS));
  };

  Store.prototype.clearHistory = function () {
    this._write(KEY_HIS, []);
  };

  global.Store = Store;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Store: Store };
  }
})(typeof window !== 'undefined' ? window : globalThis);