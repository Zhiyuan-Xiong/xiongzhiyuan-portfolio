# 首页闪屏修复：2026-10-04

正式网址：https://xiongzhiyuan-portfolio.pages.dev/

生产版本：`2f0735c3-e5c1-44e8-a419-da35cd5f8f3d`（main）。版本快照：https://2f0735c3.xiongzhiyuan-portfolio.pages.dev/

用户录屏确认：上一版加载静帧包含 EUAN PLANET 标题，并有方形背景；它与 HTML 标题及旋转中的实时星球叠显，造成双标题、亮度变化及角度／大小切换。之前只调整分享封面和根地址并未解决这次运行时叠影。

本次取消入口静帧及其预载。入口只使用实时画布；WebGL 构建、贴图下载、解码、整体 GPU 上传和首个完整画面绘制完成后才标记 ready，以 350ms 淡入。图片壳不会逐块填充或提前露出；无 WebGL／加载失败时沿用独立 SVG 降级及可访问的进入链接。

16 张入口贴图按实际像素采样需求合成为 1024×1024 atlas，一次请求约 224 KiB。灰度使用与现有 shader 相同的 .299/.587/.114 权重。素材地址带内容哈希；源图变动时构建自动重生成。探索行星的封面在进入探索时才请求，避免与入口首帧竞争。

验证结果：

- Astro 类型诊断：103 个文件，0 错误、0 警告、0 提示。
- 本地构建及全站检查：42 页、5123 个链接／素材引用通过。
- 新增 `scripts/verify-entry-load.mjs`：使用真实渲染器和延迟网络／解码，验证解码前不能返回可显示的渲染器，所有贴图一起上传，以及下载失败走显式降级。已纳入 `pnpm test`。
- 本地重复刷新 3 次、正式地址重复刷新 2 次；标题始终只有一个，不含入口占位图片。
- 正式根地址及中英文首页均返回 200，atlas 预载和新脚本／样式／贴图共 5 个响应 SHA256 与本地构建一致。
- 正式桌面与 430×932 手机首屏验证通过，手机无横向溢出，浏览器无错误／警告；进入探索行为正常。

证据：`qa/public-launch/entry-flash-fixed.png`、`entry-flash-fixed-mobile.png`、`entry-flash-audit.json`、`entry-flash-fix-http.json`；用户录屏片段对照为 `reported-flash-frames.jpg`。
