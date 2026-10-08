# 骨骸共生系统：液态生长导入视频

最终文件：`bone-liquid-15kf-12fps-5s.mp4`。

- 1920 × 1080，5.000 秒，12 fps，60 个实际播放帧。
- 15 张关键帧：`keyframes-15/00.png` 至 `14.png`。14 张由内置图像生成工具编辑，最后一张为用户原图的统一裁切。
- [15 帧一览](keyframes-15-contact-sheet.png)。[提示词](PROMPTS-15.md)。[元数据](manifest-15.json)。
- 鼻部、颈部和肩部首饰从液滴、液态骨架到实体；背景链条向身体生长并连接。人物与镜头保持固定，加入轻微的背景流动。
- 合成方法为 FFmpeg 的运动补偿插帧和轻微位移，输出 H.264、yuv420p、faststart；无音轨。
- 为减少胸部露出，所有帧使用相同的脸、颈部和肩部近景。新增帧没有重复裁切。

网站中的版本：`D:\aaa作品集\portfolio-site\public\media\skeleton\transition-liquid-v1.mp4`。从作品索引与探索页进入骨骸项目时播放；结束后以 450 ms 淡出衔接原有项目页。项目选择时提前加载这一段视频，播放期间暂停星河渲染，开场只做透明度淡入。

本地与线上浏览器验证：视频播放到 5.000 秒，60 帧，0 掉帧；项目页主图已解码，转场层正常移除。线上验证记录保存于 `qa/online-playback-result.json`。98 个源文件类型检查无错误，42 个页面与 3954 个本地链接/素材通过检查。浏览器中实际表现仍取决于设备和网络。

已发布：[骨骸项目索引入口](https://entry-preview.zhiyuan-portfolio.pages.dev/zh/works/?project=bone-series&category=3d)。发布版本：`https://9f716068.zhiyuan-portfolio.pages.dev`。点击「查看作品」播放转场；探索页的骨骸星球入口也已接入。

初始四锚点草稿文件保留用于对比；网页引用的是上述 15 关键帧、12 fps 的最终版本。
