# 正式公开发布与首页修复：2026-10-04

正式求职链接：**https://xiongzhiyuan-portfolio.pages.dev/**

Cloudflare Pages 项目：`xiongzhiyuan-portfolio`；生产分支：`main`。

- 初次完整发布：`fbe01954-3318-404d-8504-38066f8e8e93`。
- 当前正式版本：`2f0735c3-e5c1-44e8-a419-da35cd5f8f3d`。
- 当前版本快照：https://2f0735c3.xiongzhiyuan-portfolio.pages.dev/

## 首页首屏

根地址直接返回 200 并呈现 EUAN PLANET 小星球，不再经过中文跳转页或 meta refresh。中文与英文入口仍保留在 `/zh/`、`/en/`；根地址的规范地址为 `/zh/`。

用户报告的闪现图与原链接分享封面一致；网页正文并没有插入该分享图。分享封面已改为真实星球画面，使用新的素材地址以避免旧图缓存。后续录屏暴露了入口静帧叠影，现已取消该静帧：全部贴图解码并绘好完整实时首帧后才显示。详见 `docs/entry-flash-fix-2026-10-04.md`。桌面及 430×932 手机视口已验证，浏览器无错误或警告。

截图：`qa/public-launch/final-home.png`、`final-home-mobile.png`、`mobile-index.png`。

## 发布检查

- 类型检查：103 个文件，0 错误、0 警告、0 提示。
- 静态构建：42 个 HTML 页面；站点地图列出 40 个双语内容页面。
- 本地检查：5123 个链接／素材引用；轮播规模、动画生命周期、性能预算及探索入场逻辑通过。
- 首次上线完整公网检查时间（UTC）：2026-10-03T23:48:43.443Z。
- 匿名访问：40 个双语内容页面、1001 个素材、31 个视频／下载文件，0 错误。
- 根地址返回 200；不存在的路径返回 404；canonical、双语 alternate、分享图、robots 与 sitemap 已核对。
- Cloudflare Pages 对 Range 请求可能返回完整文件和 200；校验器会比较完整 SHA256，而不是把它判为视频缺失。31 个媒体／下载响应均与构建文件一致。

详细结果：`.cache/public-launch/http-verification.json`；浏览器首页结果：`qa/public-launch/browser-audit.json`。

无垠的宇宙、蜕变的导入视频在正式网址上可播放并进入案例页，未出现黑屏；手机菜单、双语切换、索引与素材加载已验证。只上传生成的 `dist/`，原始素材、笔记、授权文件和缓存不会发布。

## 国内与海外访问检查

Globalping 对正式域名的 HTTPS `/zh/works/` 执行外部探测，证书校验开启。以下结果为 2026-10-03 23:35–23:38 UTC 的实测，不代表所有未来网络环境的保证。

| 网络 | 节点数 | 结果 | HTTP 总耗时 |
| --- | ---: | --- | --- |
| 大陆电信居民网络（广州、西安、桂林） | 3 | 全部 200、证书有效 | 683–712 ms |
| 大陆联通居民网络（长沙、南宁、北京） | 3 | 全部 200、证书有效 | 651–1057 ms |
| 大陆移动居民网络（台山、北京、上海） | 3 | 全部 200、证书有效 | 573–958 ms |
| 大陆其他节点 | 6 | 全部 200、证书有效 | 601–1252 ms |
| 英国 | 2 | 全部 200、证书有效 | 53–77 ms |
| 美国 | 2 | 全部 200、证书有效 | 290–293 ms |
| 新加坡 | 2 | 全部 200、证书有效 | 218–224 ms |
| 香港 | 2 | 全部 200、证书有效 | 248–254 ms |

23 个节点全部通过。原始测量保存在 `.cache/public-launch/regional-results.json` 和 `mainland-results.json`。测量 ID：`2uTuv0lD585TEBERb00021FeZ`、`2ORQdR7iJwSw8YxnO00021Fec`。

## 旧链接与后续发布

旧正式地址 `https://zhiyuan-portfolio.pages.dev/*` 已设置 301，保留路径转向新域名；旧中文索引和英文案例路径均已验证。旧 `entry-preview` 分支继续保留，不用于求职链接。

后续更新运行 `pnpm deploy`，按顺序进行 check、build、test、正式上传和公网校验；单独校验使用 `pnpm verify:public`。上传及公网验证优先使用项目旁缓存的官方 Node.js 22.23.3 LTS，未更改系统安装。初次大批量上传使用过低内存串行辅助入口；当前增量发布已通过标准官方 Wrangler 完成。

尚无独立域名。当前固定的 Pages 地址已通过上述跨地区实测，可用于作品集及简历链接。后续若绑定自有域名，需同步更新 canonical、分享地址、sitemap、校验器及旧链接跳转。

参考：[Cloudflare Pages 静态路由和响应](https://developers.cloudflare.com/pages/configuration/serving-pages/)、[Globalping](https://github.com/jsdelivr/globalping)。
