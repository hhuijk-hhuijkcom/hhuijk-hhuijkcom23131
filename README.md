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
node --test tests/*.test.js
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