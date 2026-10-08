# Earthquake: Data into Space / 地震：数据转译

The 11th portfolio project foregrounds Python, multimodal feature analysis, and explicit data-to-design rules. It is available at `/zh/work/earthquake/` and `/en/work/earthquake/`, and integrated into the project index and exploration galaxy.

## Sources and interpretation

- Source report: `D:/skills portfolio/final portfolio/2026_BARC0074_Xiong_Zhiyuan_Data Drive Report.pdf` (34 pages).
- Working sources: `D:/skills portfolio/jupyter-earthquake`.
- The image branch contains 240 cleaned images; the news branch contains 232 records. Final fusion exports 240 design samples; the spatial comparison uses 20 instances.
- Image/news analysis and the final fusion are distinct branches. The final notebook combines independently sampled seismic records, disaster text, and satellite-derived image features. It does not match all modalities to the same seismic event. Public copy makes this boundary explicit.
- Text polarity, emotion labels, and damage proxies are computational signals for generative design, rather than verified measurements of human emotion or structural damage.
- Only safe code excerpts and numerical sample fields are published. Raw notebooks, API credentials, student identifiers, submission pages, source filesystem paths, and complete PDF pages are excluded.

## Media and layout

`scripts/prepare-earthquake-assets.py` extracts native embedded report images, complete iteration views, and the eight-frame Processing sequence. Original analysis PNGs are used where available. Assets retain their proportions, with larger versions for the existing lightbox. The project uses a dark video opening followed by a cool white editorial case page.

- `hero.mp4`: eight seconds from `video rendering3`, 1920×1080; poster/cover from frame 121.
- `transition.mp4`: five seconds, 1280×720.
- `processing-demo.mp4`: first 720 complete source frames at 60 fps, exported at 30 fps, 12 seconds. The later truncated source frame is excluded.
- Public media live under `public/media/earthquake`; images and provenance are recorded in `src/data/earthquake-assets.json` and the private extraction manifest.

## Interactive data

The sample explorer reads 240 original `final_fusion_data.csv` rows from a sanitised numerical JSON. A scatter point, select menu, or previous/next control changes the magnitude, depth, geometry scale, vertical offset, fragmentation parameter, and material cluster. CSV download contains the same numerical sample subset. There is no continuous animation or new rendering dependency.

The explicit source rules include `scale = 1 + magnitude_norm * 4`, `z = -depth_norm`, geographic normalised x/y, semantic fragmentation, and fusion-cluster material selection.

## Galaxy, index, and handoff

The new asteroid, monochrome render atlas tile, and cool grey-blue constellation are driven by the project data. The constellation combines concentric seismic waves, a seismograph, fractures, and fragmented buildings. Existing all-work carousel, category layouts, background reveal, and project hover behaviour remain intact. The entry shares the existing five-second portal and transfers the already playing video into the case page. The data explorer is reinitialised after the handoff.

## Validation

- Type/content checks, complete site build, and local link/asset suite pass.
- Export validation covers all 240 samples, finite numbers, source mapping equations, five valid clusters, and the safe CSV schema.
- Browser QA: desktop sample selection, next/previous wrap, mobile 390×844 without horizontal overflow, 11-project index selection, and video handoff. Measured handoff duration: 5015 ms. The hero remains playing and the explorer responds after navigation. No browser errors or warnings were recorded.

## Native transparency

The five iteration renders and the spatial detail reuse their original PDF soft masks. Transparent WebP versions preserve model geometry, ground planes, thin lines, shadows, and glow. Page images and enlarged lightbox images reference the same alpha-preserving export. The preparation script keeps these assets in RGBA so subsequent builds retain transparency.
