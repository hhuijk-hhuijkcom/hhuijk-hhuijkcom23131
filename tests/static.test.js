const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('index.html 存在且结构完整', () => {
  assert.ok(html.includes('id="app"'));
  assert.ok(html.includes('id="topnav"'));
  assert.ok(html.includes('id="favBadge"'));
  assert.ok(html.includes('css/style.css'));
});

test('脚本加载顺序正确', () => {
  const iData = html.indexOf('js/data.js');
  const iStore = html.indexOf('js/store.js');
  const iRouter = html.indexOf('js/router.js');
  const iApp = html.indexOf('js/app.js');
  assert.ok(iData !== -1 && iStore !== -1 && iRouter !== -1 && iApp !== -1);
  assert.ok(iData < iStore && iStore < iRouter && iRouter < iApp);
});

test('css/style.css 存在', () => {
  const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
  for (const cls of ['.card', '.grid', '.banner', '.chip', '.btn', '.toast', '.empty', '.glass']) {
    assert.ok(css.includes(cls), `缺少样式类 ${cls}`);
  }
});