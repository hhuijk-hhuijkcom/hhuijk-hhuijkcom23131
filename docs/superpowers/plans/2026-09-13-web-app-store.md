# Web App Store 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建零依赖的 App Store 式网页应用商城静态站（首页/搜索/详情/收藏 + 收藏持久化）。

**Architecture:** 原生 SPA，单一 `index.html` 入口，`hash` 路由切换 4 个视图，数据为静态 `APP_DATA` 数组，收藏与搜索历史存 localStorage。每个 JS 文件浏览器端挂全局变量、Node 端 `module.exports` 以便用 `node --test` 测试纯逻辑；DOM/UI 部分用本地 HTTP 服务冒烟验证。

**Tech Stack:** 原生 HTML5 / CSS3 / Vanilla JS（ES6）；测试用 Node 18+ `node --test`（内置，零依赖）。

## Global Constraints

- 零第三方依赖、零构建步骤；不得新增 package.json 依赖
- 所有 JS 文件须同时兼容浏览器（挂 `window.xxx`）与 Node（`module.exports`）
- 数据字段必须符合设计文档 §5 的 `APP_DATA` 结构（id 唯一、category ∈ 工具|效率|娱乐|设计|教育|社交、rating 0-5）
- 不得包含任何破解/解锁授权相关功能代码；示例应用为通用工具/效率类
- 文案与代码注释使用中文；CSS 采用现代极简风（毛玻璃顶部导航、16px 圆角卡片、柔和阴影、auto-fill 响应式网格）
- localStorage 键名：`ws.favorites`（id 数组）、`ws.history`（最多 8 条）
- 所有提交信息遵循 conventional commits（feat:/fix:/docs:/test:）

---

### Task 1: 数据模型 data.js

**Files:**
- Create: `js/data.js`
- Test: `tests/data.test.js`

**Interfaces:**
- Produces: 全局常量 `APP_DATA`（数组）、`CATEGORIES`（数组）；Node 端 `module.exports = { APP_DATA, CATEGORIES }`

- [ ] **Step 1: 写失败测试**

创建 `tests/data.test.js`：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/data.test.js`
Expected: FAIL：`Cannot find module '../js/data.js'`

- [ ] **Step 3: 创建 js/data.js**

UMD 包装 + 12 个通用工具/效率/娱乐/设计/教育/社交类示例应用：

```js
(function (global) {
  var CATEGORIES = ['全部', '工具', '效率', '娱乐', '设计', '教育', '社交'];

  var APP_DATA = [
    {
      id: 'clipboard-pro', name: '剪贴板管家', icon: '📋', category: '工具',
      badge: 'featured', rating: 4.8, installs: 45200, version: '2.3.1',
      short: '跨设备剪贴板同步与历史管理',
      description: '剪贴板管家是开源的剪贴板增强工具，支持历史记录、固定常用条目、跨设备同步与敏感信息自动脱敏，适合高频复制粘贴的办公场景。',
      url: 'https://example.com/clipboard-pro',
      screenshots: ['linear-gradient(135deg,#667eea,#764ba2)'],
      tags: ['剪贴板', '同步', '办公'],
      featured: true
    },
    {
      id: 'json-hero', name: 'JSON 工具箱', icon: '🧩', category: '工具',
      badge: 'hot', rating: 4.7, installs: 38800, version: '3.1.0',
      short: '格式化、校验、转换一步到位',
      description: '在线 JSON 格式化与校验工具，支持压缩、转义、对比差异、树形浏览，大文件本地解析不上传，保障数据安全。',
      url: 'https://example.com/json-hero',
      screenshots: ['linear-gradient(135deg,#f093fb,#f5576c)'],
      tags: ['JSON', '开发', '在线工具'],
      featured: false
    },
    {
      id: 'timer-flow', name: '番茄时钟 Pro', icon: '🍅', category: '效率',
      badge: 'featured', rating: 4.9, installs: 61000, version: '1.8.2',
      short: '专注计时与任务拆分',
      description: '采用番茄工作法的专注计时器，支持自定义时长、任务提醒、每日专注统计，助你进入心流状态。',
      url: 'https://example.com/timer-flow',
      screenshots: ['linear-gradient(135deg,#43e97b,#38f9d7)'],
      tags: ['专注', '计时', 'GTD'],
      featured: true
    },
    {
      id: 'mind-map-go', name: '轻量脑图', icon: '🧠', category: '效率',
      badge: 'new', rating: 4.5, installs: 8200, version: '0.9.4',
      short: '快速搭建可导出的思维导图',
      description: '零广告的思维导图工具，支持 Markdown 速记、主题换肤、一键导出 PNG 与 Freemind 格式，适合头脑风暴与课程笔记。',
      url: 'https://example.com/mind-map-go',
      screenshots: ['linear-gradient(135deg,#fa709a,#fee140)'],
      tags: ['思维导图', '笔记', 'Markdown'],
      featured: false
    },
    {
      id: 'pixel-studio', name: '像素画板', icon: '🎨', category: '设计',
      badge: 'hot', rating: 4.6, installs: 23500, version: '2.0.0',
      short: '在线像素画与动图制作',
      description: '基于 Canvas 的像素画工具，支持图层、调色板、逐帧动画与 GIF 导出，上手简单，社区模板丰富。',
      url: 'https://example.com/pixel-studio',
      screenshots: ['linear-gradient(135deg,#a18cd1,#fbc2eb)'],
      tags: ['像素画', 'Canvas', '动画'],
      featured: false
    },
    {
      id: 'color-pick', name: '配色灵感库', icon: '🌈', category: '设计',
      badge: 'none', rating: 4.3, installs: 15600, version: '1.4.0',
      short: '千套配色方案一键复制',
      description: '收录上千套精选配色方案，支持色盲模拟预览、CSS 变量导出，帮助设计师与前端快速确定视觉基调。',
      url: 'https://example.com/color-pick',
      screenshots: ['linear-gradient(135deg,#fdcbf1,#e6dee9)'],
      tags: ['配色', '设计师', 'CSS'],
      featured: false
    },
    {
      id: 'quiz-arena', name: '趣味答题竞技场', icon: '🏆', category: '娱乐',
      badge: 'hot', rating: 4.4, installs: 29800, version: '1.2.0',
      short: '在线答题对战与排行榜',
      description: '休闲益智答题游戏，覆盖百科、影视、地理等题库，支持好友对战与周榜排行，碎片时间快乐涨知识。',
      url: 'https://example.com/quiz-arena',
      screenshots: ['linear-gradient(135deg,#f6d365,#fda085)'],
      tags: ['问答', '游戏', '休闲'],
      featured: false
    },
    {
      id: 'music-box', name: '白噪音助眠盒', icon: '🎵', category: '娱乐',
      badge: 'new', rating: 4.7, installs: 40200, version: '3.0.0',
      short: '雨声、海浪、篝火 48 种白噪音',
      description: '轻量白噪音播放器，支持多种音源混音、定时关闭与后台播放，助你入睡、专注或放松。',
      url: 'https://example.com/music-box',
      screenshots: ['linear-gradient(135deg,#84fab0,#8fd3f4)'],
      tags: ['白噪音', '助眠', '音乐'],
      featured: false
    },
    {
      id: 'phrase-buddy', name: '高频短语速记', icon: '✍️', category: '教育',
      badge: 'featured', rating: 4.6, installs: 18300, version: '2.1.0',
      short: '碎片时间积累英语高频短语',
      description: '基于间隔重复算法的高频短语学习工具，内置分级词库与发音示范，支持自定义学习计划与进度追踪。',
      url: 'https://example.com/phrase-buddy',
      screenshots: ['linear-gradient(135deg,#00c6fb,#005bea)'],
      tags: ['英语', '学习', '卡片'],
      featured: true
    },
    {
      id: 'code-battle', name: '算法闯关', icon: '⚔️', category: '教育',
      badge: 'none', rating: 4.5, installs: 12700, version: '1.7.0',
      short: '编程题解谜与思路解析',
      description: '面向初学者的算法闯关平台，题目由易到难并附逐步思路动画，注册可同步个人练习记录。',
      url: 'https://example.com/code-battle',
      screenshots: ['linear-gradient(135deg,#ff9a9e,#fecfef)'],
      tags: ['算法', '编程', '题库'],
      featured: false
    },
    {
      id: 'team-feed', name: '团队动态墙', icon: '👥', category: '社交',
      badge: 'none', rating: 4.2, installs: 9600, version: '1.3.0',
      short: '小组协作的轻量公告板',
      description: '适合小型团队的内部公告与动态聚合页面，支持 Markdown 发布、置顶与按标签归档，私有部署数据自主可控。',
      url: 'https://example.com/team-feed',
      screenshots: ['linear-gradient(135deg,#c471f5,#fa71cd)'],
      tags: ['团队', '协作', '公告'],
      featured: false
    },
    {
      id: 'meet-mate', name: '会议纪要助手', icon: '🗒️', category: '社交',
      badge: 'featured', rating: 4.8, installs: 27400, version: '2.2.0',
      short: '语音转写与待办分发',
      description: '面向线上会议的纪要工具，自动生成时间线、提取待办事项并一键分享给参会人，支持主流会议平台嵌入。',
      url: 'https://example.com/meet-mate',
      screenshots: ['linear-gradient(135deg,#30cfd0,#330867)'],
      tags: ['会议', '纪要', '语音'],
      featured: true
    }
  ];

  global.APP_DATA = APP_DATA;
  global.CATEGORIES = CATEGORIES;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_DATA, CATEGORIES };
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test tests/data.test.js`
Expected: PASS（4 个用例全部通过）

- [ ] **Step 5: 提交**

```bash
git add js/data.js tests/data.test.js
git commit -m "feat: add app data model with 12 sample apps"
```

---

### Task 2: 收藏/历史状态管理 store.js

**Files:**
- Create: `js/store.js`
- Test: `tests/store.test.js`

**Interfaces:**
- Consumes: 无（存储实现通过构造参数注入，浏览器默认 `window.localStorage`）
- Produces: `Store` 类，方法：
  - `getFavorites(): string[]`
  - `isFavorite(id): boolean`
  - `addFavorite(id): void`（重复添加忽略）
  - `removeFavorite(id): void`
  - `toggleFavorite(id): { added: boolean }`
  - `getHistory(): string[]`
  - `addHistory(q): void`（去重后插入头部，截断到 8 条）
  - `clearHistory(): void`

- [ ] **Step 1: 写失败测试**

创建 `tests/store.test.js`（用内存 Map 伪 localStorage）：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/store.test.js`
Expected: FAIL：`Cannot find module '../js/store.js'`

- [ ] **Step 3: 创建 js/store.js**

```js
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test tests/store.test.js`
Expected: PASS（5 个用例全部通过）

- [ ] **Step 5: 提交**

```bash
git add js/store.js tests/store.test.js
git commit -m "feat: add favorites and search history store"
```

---

### Task 3: hash 路由 router.js

**Files:**
- Create: `js/router.js`
- Test: `tests/router.test.js`

**Interfaces:**
- Produces: `parseHash(hash) -> { view: 'home'|'search'|'favorites'|'app'|'notfound', id?: string }`；`Router` 类：
  - `constructor(handler)`（handler 接收 parse 结果）
  - `start()`（监听 `hashchange` 并立即解析执行一次）
  - `navigate(path)`（设置 `location.hash`；可注入 window 以便测试）

- [ ] **Step 1: 写失败测试**

创建 `tests/router.test.js`：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/router.test.js`
Expected: FAIL：`Cannot find module '../js/router.js'`

- [ ] **Step 3: 创建 js/router.js**

```js
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

  Router.prototype._onChange = function () {
    this._handler(parseHash(this._win.location.hash));
  };

  Router.prototype.start = function () {
    var self = this;
    this._handler(parseHash(this._win.location.hash));
    if (this._win.addEventListener) {
      this._win.addEventListener('hashchange', function () { self._onChange(); });
    }
  };

  Router.prototype.navigate = function (path) {
    if (this._win.location) this._win.location.hash = path;
  };

  global.parseHash = parseHash;
  global.Router = Router;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseHash: parseHash, Router: Router };
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

注意：Task 3 的测试用 `fakeWin = { hash: '' }`，`parseHash` 与 `navigate` 均不依赖真实 location 对象，仅用字符串字段；`start()` 首次调用读取 `location.hash`，fakeWin 中存在该字段即可（无需真实事件触发，测试只断言首次执行）。

- [ ] **Step 4: 运行测试确认通过**

Run: `node --test tests/router.test.js`
Expected: PASS（3 个用例全部通过）

- [ ] **Step 5: 提交**

```bash
git add js/router.js tests/router.test.js
git commit -m "feat: add hash router and parseHash"
```

---

### Task 4: 入口 index.html 与全局样式 style.css

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Test: `tests/static.test.js`（校验 HTML 引用与关键类名，防手滑）

**Interfaces:**
- Produces: HTML 根容器结构（`#app`）、顶级导航（`#topnav`，含红点 `#favBadge`）、脚本加载顺序 data→store→router→app；CSS 类：`.card`、`.grid`、`.glass`、`.banner`、`.chip`、`.btn`、`.toast`、`.detail-hero`、`.empty`

- [ ] **Step 1: 写失败测试**

创建 `tests/static.test.js`：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/static.test.js`
Expected: FAIL：`ENOENT ... index.html`

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#f5f6fa">
  <title>Web App Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header id="topnav" class="glass">
    <div class="nav-inner">
      <a class="brand" href="#/">🛍️ Web App Store</a>
      <nav class="nav-links">
        <a href="#/" data-nav="home">首页</a>
        <a href="#/search" data-nav="search">搜索</a>
        <a href="#/favorites" data-nav="favorites">
          收藏 <span id="favBadge" class="badge hidden">0</span>
        </a>
      </nav>
    </div>
  </header>

  <main id="app" class="container"></main>

  <div id="toast" class="toast hidden"></div>

  <link rel="manifest" href="manifest.json">
  <script src="js/data.js"></script>
  <script src="js/store.js"></script>
  <script src="js/router.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建 css/style.css**

```css
:root {
  --bg: #f5f6fa;
  --card: #ffffff;
  --ink: #1c1e26;
  --muted: #7a7f8c;
  --accent: #4f6ef7;
  --radius: 16px;
  --shadow: 0 6px 24px rgba(28, 30, 38, .08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.6;
}
a { color: var(--accent); text-decoration: none; }

.glass {
  position: sticky; top: 0; z-index: 20;
  background: rgba(255, 255, 255, .72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(28, 30, 38, .06);
}
.nav-inner { max-width: 1080px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.brand { font-weight: 700; font-size: 18px; color: var(--ink); }
.nav-links { display: flex; gap: 18px; align-items: center; }
.nav-links a { color: var(--muted); font-weight: 500; }
.nav-links a.active { color: var(--accent); }
.badge {
  display: inline-block; min-width: 18px; padding: 0 5px; border-radius: 999px;
  background: #ef4444; color: #fff; font-size: 11px; line-height: 18px; text-align: center;
}
.hidden { display: none !important; }

.container { max-width: 1080px; margin: 0 auto; padding: 24px 20px 80px; }
.section-title { font-size: 20px; font-weight: 700; margin: 28px 0 14px; }

.banner { position: relative; border-radius: var(--radius); overflow: hidden; height: 220px; background: linear-gradient(135deg, #4f6ef7, #6a46e0); color: #fff; display: flex; align-items: center; padding: 0 36px; cursor: pointer; }
.banner h2 { font-size: 28px; margin-bottom: 6px; }
.banner p { opacity: .9; }
.banner-dots { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
.banner-dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.4); }
.banner-dots span.on { background: #fff; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.hscroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; }
.hscroll .card { flex: 0 0 260px; scroll-snap-align: start; }

.card {
  background: var(--card); border-radius: var(--radius); padding: 18px;
  box-shadow: var(--shadow); cursor: pointer; transition: transform .15s ease, box-shadow .15s ease;
}
.card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(28,30,38,.12); }
.card-top { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.card-icon { width: 52px; height: 52px; border-radius: 13px; font-size: 28px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #eef1fb, #f8f9fd); }
.card-name { font-weight: 600; font-size: 15px; display: flex; align-items: center; gap: 6px; }
.card-short { color: var(--muted); font-size: 13px; margin-bottom: 10px; }
.card-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); }
.star { color: #f5a623; }
.badge-pill { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #4f6ef7; color: #fff; }
.badge-pill.new { background: #22c55e; }
.badge-pill.hot { background: #ef4444; }

.chips { display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0; }
.chip { padding: 6px 14px; border-radius: 999px; background: var(--card); border: 1px solid rgba(28,30,38,.1); cursor: pointer; font-size: 13px; }
.chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.search-bar { display: flex; gap: 10px; margin: 18px 0 6px; }
.search-bar input { flex: 1; padding: 12px 18px; border-radius: 999px; border: 1px solid rgba(28,30,38,.12); background: var(--card); font-size: 15px; outline: none; }

.detail-hero { display: flex; gap: 22px; align-items: flex-start; padding: 28px; background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 18px; flex-wrap: wrap; }
.detail-icon { width: 92px; height: 92px; border-radius: 22px; font-size: 48px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#eef1fb,#f8f9fd); flex-shrink: 0; }
.detail-info { flex: 1; min-width: 240px; }
.detail-info h1 { font-size: 24px; }
.detail-meta { color: var(--muted); font-size: 14px; margin: 6px 0 12px; }
.screenshot { height: 180px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; }

.btn { display: inline-block; padding: 10px 22px; border-radius: 999px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-ghost { background: rgba(79,110,247,.1); color: var(--accent); }
.btn.faved { background: #ef4444; color: #fff; }

.rank-row { display: flex; gap: 14px; align-items: center; padding: 12px 16px; background: var(--card); border-radius: 14px; margin-bottom: 10px; cursor: pointer; box-shadow: var(--shadow); }
.rank-num { font-size: 20px; font-weight: 800; color: var(--accent); width: 30px; text-align: center; }

.empty { text-align: center; color: var(--muted); padding: 60px 0 40px; }
.empty .big { font-size: 44px; margin-bottom: 10px; }

.toast {
  position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%);
  background: rgba(28,30,38,.9); color: #fff; padding: 10px 22px; border-radius: 999px; font-size: 14px; z-index: 99;
  animation: fadeUp .25s ease;
}
@keyframes fadeUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }

footer { text-align: center; color: var(--muted); font-size: 13px; padding: 20px 0 30px; }

@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .banner { height: 170px; padding: 0 20px; }
  .detail-hero { padding: 20px; }
  .nav-links { gap: 12px; font-size: 14px; }
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `node --test tests/static.test.js`
Expected: PASS（3 个用例）

- [ ] **Step 6: 提交**

```bash
git add index.html css/style.css tests/static.test.js
git commit -m "feat: add app shell and global styles"
```

---

### Task 5: app.js 首页视图（Banner、精选、热门榜、分类 Tab、网格）

**Files:**
- Create: `js/app.js`
- Modify: `js/app.js`（后续任务在同一文件追加）

**Interfaces:**
- Consumes: `APP_DATA`、`CATEGORIES`、`Store`、`parseHash`/`Router`
- Produces: 全局 `renderHome()`、`App` 启动入口 `window.App.start()`；工具函数 `fmtCount(n)`、`iconFor(app)`、`cardHTML(app, fav)`、`toast(msg)`、`renderFavBadge()`

- [ ] **Step 1: 实现首页渲染（无需前置失败测试，UI 逻辑靠冒烟验证）**

创建 `js/app.js` 的公共部分与首页视图：

```js
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

  function cardHTML(app) {
    return '<div class="card" data-id="' + app.id + '" data-route="app">' +
      '<div class="card-top">' +
        '<div class="card-icon">' + iconFor(app) + '</div>' +
        '<div><div class="card-name">' + app.name + badgePill(app) + '</div>' +
        '<div class="card-short">' + app.short + '</div></div>' +
      '</div>' +
      '<div class="card-meta"><span>' + starHTML(app.rating) + '</span><span>' + app.category + '</span></div>' +
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
    bindGlobalEvents();
  };

  function bindGlobalEvents() {
    document.addEventListener('click', function (e) {
      var card = e.target.closest('[data-route]');
      if (card) { location.hash = '#/app/' + card.getAttribute('data-id'); return; }
      var chip = e.target.closest('[data-cat]');
      if (chip) { activeCategory = chip.getAttribute('data-cat'); renderHome(); return; }
      var fav = e.target.closest('[data-fav]');
      if (fav) { toggleFav(fav.getAttribute('data-fav'), fav); }
    });
  }
  // renderSearch / renderDetail / renderFavorites / toggleFav 在后续任务定义
  global.App = App;
  global.renderHome = renderHome;
  global.fmtCount = fmtCount;
  global.iconFor = iconFor;
  global.cardHTML = cardHTML;
  global.toast = toast;
  global.renderFavBadge = renderFavBadge;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 2: 冒烟启动验证**

Run: `python3 -m http.server 8000 --directory . & sleep 1 && curl -s http://localhost:8000/ | head -5 && curl -s http://localhost:8000/js/app.js | head -3`
Expected: HTTP 200，页面与脚本可访问。接着 Kill server。

- [ ] **Step 3: 提交**

```bash
git add js/app.js
git commit -m "feat: render home view with banner, featured, ranking and categories"
```

---

### Task 6: 搜索视图（实时过滤 + 历史）

**Files:**
- Modify: `js/app.js`（追加 `renderSearch` 及事件）
- Modify: `index.html` 无需改动（搜索视图动态渲染进 `#app`）

**Interfaces:**
- Consumes: `store.addHistory`、`store.getHistory`、`store.clearHistory`
- Produces: `renderSearch(q)`；搜索输入框 `id="searchInput"`，历史 chips 容器 `id="historyBox"`

- [ ] **Step 1: 在 js/app.js 追加搜索视图**

在 `bindGlobalEvents` 中补充搜索相关绑定，并追加：

```js
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
```

并在 `bindGlobalEvents` 的 click 处理器中追加：

```js
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
```

- [ ] **Step 2: 冒烟验证搜索页**

Run: `python3 -m http.server 8000 --directory . & sleep 1; curl -s "http://localhost:8000/#/search" -o /dev/null -w "%{http_code}\n"; kill %1`
Expected: HTTP 200。（交互项进入 Task 9 的最终浏览器冒烟清单，本步只确认服务可达。）

- [ ] **Step 3: 提交**

```bash
git add js/app.js
git commit -m "feat: add search view with live filter and history"
```

---

### Task 7: 详情视图

**Files:**
- Modify: `js/app.js`（追加 `renderDetail`、`toggleFav` 与相关推荐）

**Interfaces:**
- Consumes: `store.isFavorite/toggleFavorite`、`cardHTML`、`badgePill`
- Produces: 详情页要素 `data-fav="<id>"` 收藏按钮；`toggleFav(id, el)` 更新按钮态并 toast

- [ ] **Step 1: 在 js/app.js 追加详情视图**

```js
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
  }
```

- [ ] **Step 2: 支持详情页下拉重新绑定导航态后的 favBadge（在 App.start 后调用 renderFavBadge）**

在 `App.start` 的 `router.start()` 之后追加 `renderFavBadge();` 确保初次渲染同步。

- [ ] **Step 3: 冒烟验证详情路由**

Run: `python3 -m http.server 8000 --directory . & sleep 1; curl -s "http://localhost:8000/#/app/clipboard-pro" -o /dev/null -w "%{http_code}\n"; kill %1`
Expected: HTTP 200（JS 渲染需浏览器验证，进入 Task 9 清单）。

- [ ] **Step 4: 提交**

```bash
git add js/app.js
git commit -m "feat: add detail view with get/favorite actions"
```

---

### Task 8: 收藏视图

**Files:**
- Modify: `js/app.js`（追加 `renderFavorites`）

**Interfaces:**
- Consumes: `store.getFavorites`

- [ ] **Step 1: 在 js/app.js 追加收藏视图**

```js
  function renderFavorites() {
    var favs = store.getFavorites().map(function (id) {
      return APP_DATA.filter(function (a) { return a.id === id; })[0];
    }).filter(Boolean);
    var html =
      '<h1 class="section-title">💛 我的收藏</h1>' +
      (favs.length
        ? '<div class="grid">' + favs.map(cardHTML).join('') + '</div>'
        : '<div class="empty"><div class="big">💌</div>还没有收藏任何应用<br>点击卡片右下角 ♡ 即可收藏</div>');
    $('#app').innerHTML = html;
    renderFavBadge();
    syncNav();
  }
```

- [ ] **Step 2: 收藏视图支持卡片内直接移除**

在 `bindGlobalEvents` click 处理中追加：

```js
      var fmem = e.target.closest('[data-unfav]');
      if (fmem) { store.removeFavorite(fmem.getAttribute('data-unfav')); toast('已从收藏移除'); renderFavorites(); return; }
```

并在 `toggleFav` 之后执行：当当前路由为收藏页时，取消收藏后刷新视图：

```js
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
```

- [ ] **Step 3: 提交**

```bash
git add js/app.js
git commit -m "feat: add favorites view and inline removal"
```

---

### Task 9: manifest.json、README、完整冒烟验证

**Files:**
- Create: `manifest.json`
- Create: `README.md`（覆盖现有空 README）

- [ ] **Step 1: 创建 manifest.json**

```json
{
  "name": "Web App Store",
  "short_name": "AppStore",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#f5f6fa",
  "theme_color": "#4f6ef7",
  "icons": [{ "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛍️</text></svg>", "sizes": "any", "type": "image/svg+xml" }]
}
```

- [ ] **Step 2: 重写 README.md**

```markdown
# Web App Store

App Store 式网页应用商城，纯前端零依赖，展示与分发网页应用/工具程序。

## 功能

- 首页：精选 Banner、横滑推荐、热门榜单、分类筛选
- 搜索：关键词实时过滤，保留最近搜索历史
- 详情页：评分、版本、截图、相关推荐，"获取"跳转应用地址
- 收藏：localStorage 持久化，导航栏实时计数

## 运行

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 上架新应用

编辑 `js/data.js` 中的 `APP_DATA`，复制任一对象：
- `id` 必须全局唯一，作为详情页路由标识
- `url` 指向应用页面/下载地址
- `category` 取值：工具 | 效率 | 娱乐 | 设计 | 教育 | 社交
- 保存刷新即可预览

## 测试

```bash
node --test tests/
```

## 目录结构

```
index.html          入口
css/style.css       全局样式
js/data.js          应用数据（上架入口）
js/store.js         收藏/历史状态
js/router.js        hash 路由
js/app.js           视图渲染与交互
tests/              node --test 单元测试
```
```

- [ ] **Step 3: 完整单元测试**

Run: `node --test tests/`
Expected: 全部 PASS（数据 4 + 状态 5 + 路由 3 + 静态 3）

- [ ] **Step 4: 浏览器冒烟清单（手动，逐项核对）**

1. `python3 -m http.server 8000` 起服，打开 `http://localhost:8000/#/`
2. 首页 Banner 每 4 秒自动切换，点击跳详情
3. 分类 Tab 切换过滤生效
4. 搜索页输入关键字实时过滤；无结果显示空状态；历史 chips 可点回填，清空可清除
5. 详情页展示完整信息，"获取"新标签打开示例 URL；收藏按钮切换并出现 Toast
6. 刷新后收藏仍在；导航红点计数正确
7. 收藏页空状态与移除生效；直接访问 `#/app/not-exist` 显示"应用未找到"
8. 窗口缩窄至 375px，网格改 2 列、导航不溢出

- [ ] **Step 5: 提交**

```bash
git add manifest.json README.md
git commit -m "docs: add manifest, README and polish"
```

---

## Self-Review

**1. Spec 覆盖核对**
- F1 首页四区块 → Task 5
- F2 分类筛选与搜索 + 历史 → Task 5（chips）+ Task 6
- F3 详情页 → Task 7
- F4 收藏与红点 → Task 2 + Task 5（renderFavBadge）+ Task 8
- F5 空状态 → Task 6/7/8 空状态分支
- F6 响应式 → Task 4 媒体查询 + Task 9 清单第 8 项
- 文件结构与 manifest/README → Task 1-9 对应

**2. 占位符扫描**：无 TBD/TODO；所有代码均为完整实现。

**3. 类型一致性**：`Store` 方法名（getFavorites/isFavorite/toggleFavorite/addHistory/clearHistory）在 Task 2、app.js 调用处一致；`parseHash` 返回 `{view,id}` 与 Task 3 测试、Task 5 路由分发一致；`cardHTML/app.badge` 字段在 data.js 与渲染处一致。

**注意事项（跨任务传阅）**：Task 5 的 `bindGlobalEvents` 中调用的 `renderSearch/renderDetail/renderFavorites/toggleFav` 在后续任务追加，属同一文件内函数声明提升，可安全先定义后使用。