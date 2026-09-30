/*
 * ============================================================
 *  站点配置（可自行编辑）
 * ============================================================
 *  RELEASE_SOURCE    release 数据源：
 *                      - "gitcode"：调用 GitCode 公开接口获取最新发行版
 *                                    （GITCODE_TOKEN 为下载密钥，请妥善保管）
 *                      - "github" ：调用 GitHub Releases 公开接口
 *                      - "local"  ：仅使用下方 LOCAL_RELEASE 静态配置（离线兜底）
 * ============================================================
 */
window.SITE_CONFIG = {
  SITE_REPO: "hhuijk-hhuijkcom/hhuijk-cx",
  RELEASE_SOURCE: "gitcode",

  /*
   * GitCode 数据源配置：
   * GITCODE_TOKEN 是仓库的下载密钥（access_token），
   * 用于换取附件临时下载链接。请仅在私有仓库下载场景使用。
   */
  GITCODE_REPO: "hhuijk-hhuijkcom/hhuijk-cx",
  GITCODE_TOKEN: "X5Lrbh5s6bt59rzmkqWFCwwD",

  /*
   * 本地兜底版本信息：
   * 当 API 获取失败（密钥失效、仓库关闭、网络异常等）时，页面将展示以下内容。
   * 维护方法：跟随 Releases 发版，更新 LOCAL_RELEASE 与 LOCAL_ASSETS。
   */
  LOCAL_RELEASE: {
    tag: "v0.7.8",
    name: "v0.7.8",
    date: "2026-09-29",
    body: [
      "增加了lua文件检测（可以在dlc缺少时使用）缺少需要反馈bug"
    ].join("\n")
  },
  LOCAL_ASSETS: [
    {
      name: "hhuijkSetup-0.7.8.exe",
      browser_download_url: "https://gitcode.com/hhuijk-hhuijkcom/hhuijk-cx/releases/download/v0.7.8/hhuijkSetup-0.7.8.exe"
    }
  ]
};