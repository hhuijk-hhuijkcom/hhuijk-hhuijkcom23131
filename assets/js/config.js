/*
 * ============================================================
 *  站点配置（可自行编辑）
 * ============================================================
 *  SITE_REPO          仓库路径（owner/repo），用于展示与生成链接
 *  GITHUB_PAGES      是否在 GitHub Pages 上部署
 *                      - 部署到 GitHub Pages 时，可开启该开关让页面
 *                        自动调用 GitHub Releases API 获取最新版本
 *  RELEASE_SOURCE    release 来源，切换 API 数据源：
 *                      - "github" ：调用 GitHub Releases 公开接口
 *                      - "atomgit"：调用 AtomGit Releases 公开接口
 *                      - "local"  ：仅使用下方 LOCAL_RELEASE 静态配置（离线兜底）
 * ============================================================
 */
window.SITE_CONFIG = {
  SITE_REPO: "hhuijk-hhuijkcom/hhuijk-cx",
  GITHUB_PAGES: true,
  RELEASE_SOURCE: "github",

  /*
   * 本地兜底版本信息：
   * 当 API 获取失败（仓库私有、网络异常等）时，页面将展示以下内容。
   * 维护方法：跟随 Releases 发版，更新 LOCAL_RELEASE 与 LOCAL_ASSETS。
   */
  LOCAL_RELEASE: {
    tag: "v0.6.3",
    name: "v0.6.3",
    date: "2026-09-08",
    body: [
      "- new: 新建文件 cxgx"
    ].join("\n")
  },
  LOCAL_ASSETS: [
    {
      name: "hhuijkSetup-0.6.3.exe",
      browser_download_url: "https://atomgit.com/hhuijk-hhuijkcom/hhuijk-cx/releases/download/v0.6.3/hhuijkSetup-0.6.3.exe"
    }
  ]
};