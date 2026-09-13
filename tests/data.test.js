const { test } = require('node:test');
const assert = require('node:assert');
const { APP_DATA, CATEGORIES } = require('../js/data.js');

test('至少提供 12 个示例应用', () => {
  assert.ok(APP_DATA.length >= 12);
});

test('应用 id 全局唯一', () => {
  const ids = APP_DATA.map(a => a.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test('应用字段完整且类型正确', () => {
  for (const a of APP_DATA) {
    assert.ok(a.id && typeof a.id === 'string');
    assert.ok(a.name && typeof a.name === 'string');
    assert.ok(a.icon && typeof a.icon === 'string');
    assert.ok(CATEGORIES.slice(1).includes(a.category), `非法分类: ${a.category}`);
    assert.ok(typeof a.rating === 'number' && a.rating >= 0 && a.rating <= 5);
    assert.ok(Number.isInteger(a.installs) && a.installs >= 0);
    assert.ok(typeof a.url === 'string');
    assert.ok(Array.isArray(a.tags) && a.tags.every(t => typeof t === 'string'));
    assert.ok(Array.isArray(a.screenshots) && a.screenshots.length > 0);
    assert.ok(['featured', 'new', 'hot', 'none'].includes(a.badge || 'none'));
  }
});

test('CATEGORIES 首项为"全部"', () => {
  assert.strictEqual(CATEGORIES[0], '全部');
});