# Infinite Cosmos integration

Published preview: https://entry-preview.zhiyuan-portfolio.pages.dev/zh/work/infinite-cosmos/

## Source and extraction

- Portfolio source: D:\SKILLS CONCEPT\排版\Skills Portfolio Draft-T1-Zhiyuan Xiong.pdf
- Source images: D:\SKILLS CONCEPT\排版\素材
- Processing sketch and OBJ: D:\skills portfolio\源文件\Rhino-grasshopper-processing\processing
- Native Rhino file: D:\skills portfolio\源文件\Rhino-grasshopper-processing\rhino model\infinite cosmos.3dm
- Processing clip: first five seconds for the entry; full ten-second recording for the in-page demonstration.
- Skills-infinite cosmos: full fifteen-second hero loop, with its original composition and title.
- Complete authored diagram groups are cropped from native PDF raster images. Original high-resolution image files are preferred for model views, workflows and final images. Larger lightbox assets are included; no entire portfolio page is used as a case illustration.

Run scripts/prepare-cosmos-assets.py to regenerate images and video. Run scripts/prepare-cosmos-geometry.py to extract native render meshes and the Processing OBJ point cloud. Dot-source scripts/use-project.ps1 first; the geometry converter uses the official rhino3dm library in .cache/python-libs. Private source paths and checksums stay in the cache, outside the public site.

## Browser interaction

The mesh viewer contains 323 visible original model objects, 876,646 vertices and 1,412,168 triangles. Geometry is quantized and gzip-compressed without triangle decimation. Rhino coordinates are converted to Y-up. The source white/red material distinction is retained.

The Processing sketch is ported to a browser WebGL renderer using the original OBJ, approximately 28,000 sampled points, 160 growing trails, local red/blue bursts, damping and spring-back. The original PeasyCam library is replaced by browser orbit and zoom controls. Small jitter and vine noise are approximated in the WebGL port. It does not run the Java Processing runtime or live ComfyUI generation.

Viewers load when near the viewport. The mesh redraws on input unless auto rotation is enabled. Particle animation pauses offscreen and when the tab is hidden. Reduced-motion preferences initially pause animated particles. Both viewers release GPU resources on case handoff.

## Verification

- Astro check: no errors; two existing unused-variable hints in portfolio-space.ts.
- Build and link verification: 38 pages, 3339 local links/assets.
- Native mesh index bounds and all particle coordinates verified.
- Browser QA: model orbit, wheel/button zoom, reset, point-cloud toggle, keyboard rotation; particle button/right-click bursts, J toggle and pause.
- 390px layout: no horizontal overflow and model remains in frame.
- Five-second index-to-case entry measured 5015ms; the same playing hero element survives the handoff. Particle initialization after handoff verified.
- Published Cloudflare preview: f6194ab5. Both online viewers loaded successfully; hero duration 15 seconds.
- Proof images: qa/cosmos-model-preview.jpg and qa/cosmos-particles-preview.jpg.
