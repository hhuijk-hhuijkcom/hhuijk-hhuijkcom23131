const { test } = require('node:test');
const assert = require('node:assert');
const { parseHash, Router } = require('../js/router.js');

test('解析各路由', () => {
  assert.deepStrictEqual(parseHash(''), { view: 'home' });
  assert.deepStrictEqual(parseHash('#/'), { view: 'home' });
  assert.deepStrictEqual(parseHash('#/search'), { view: 'search' });
  assert.deepStrictEqual(parseHash('#/favorites'), { view: 'favorites' });
  assert.deepStrictEqual(parseHash('#/app/clipboard-pro'), { view: 'app', id: 'clipboard-pro' });
});

test('未知路由回退 notfound', () => {
  assert.deepStrictEqual(parseHash('#/xyz'), { view: 'notfound' });
});

test('Router 触发 handler 并支持注入导航', () => {
  let calls = [];
  const fakeWin = { hash: '' };
  const router = new Router(r => calls.push(r), fakeWin);
  router.start();
  router.navigate('#/app/json-hero');
  assert.deepStrictEqual(calls[0], { view: 'home' });
  assert.strictEqual(fakeWin.hash, '#/app/json-hero');
});