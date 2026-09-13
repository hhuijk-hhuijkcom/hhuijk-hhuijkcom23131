const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const { Store } = require('../js/store.js');

function memoryStorage() {
  const map = new Map();
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: k => map.delete(k)
  };
}

let store, storage;
beforeEach(() => {
  storage = memoryStorage();
  store = new Store(storage);
});

test('收藏添加与查询', () => {
  store.addFavorite('a');
  store.addFavorite('a');
  assert.deepStrictEqual(store.getFavorites(), ['a']);
  assert.ok(store.isFavorite('a'));
  assert.ok(!store.isFavorite('b'));
});

test('收藏移除与切换', () => {
  store.addFavorite('a');
  const r1 = store.toggleFavorite('a');
  assert.strictEqual(r1.added, false);
  assert.deepStrictEqual(store.getFavorites(), []);
  const r2 = store.toggleFavorite('b');
  assert.strictEqual(r2.added, true);
  assert.ok(store.isFavorite('b'));
});

test('收藏持久化序列化', () => {
  store.addFavorite('x');
  const store2 = new Store(storage);
  assert.deepStrictEqual(store2.getFavorites(), ['x']);
});

test('搜索历史去重并限制 8 条', () => {
  for (let i = 0; i < 10; i++) store.addHistory('q' + i);
  store.addHistory('q5');
  const h = store.getHistory();
  assert.strictEqual(h.length, 8);
  assert.strictEqual(h[0], 'q5');
  store.clearHistory();
  assert.deepStrictEqual(store.getHistory(), []);
});

test('损坏的存储数据回退为空', () => {
  storage.setItem('ws.favorites', '{bad json');
  assert.deepStrictEqual(new Store(storage).getFavorites(), []);
});