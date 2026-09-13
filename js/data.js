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