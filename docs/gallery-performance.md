# Gallery and transition performance — 2026-10-02

The index, about background and route transition now reuse star bitmaps. The constellation halo reuses a baked outline and four cached light phases; the selected illustration still draws progressively in SVG.

- 1,900 gallery star paths and 1,100 transition star paths are baked once per viewport instead of every paint.
- Halo rendering is bounded to the selected SVG plus 16px bleed. At the measured desktop viewport it changed from 1,581 × 900 to 683 × 683 pixels (67% fewer pixels).
- Unselected projects have no background image `src`. The selected 1,280px background is decoded before the existing fade is revealed.
- Covered scenes stop their RAF loops during the preview dialog, project film and outbound route transition. Hidden tabs stop; closing an overlay and history return resume.
- Carousel DOM writes that do not change z-index or pointer events are skipped. The unused per-frame position dataset mutation has been removed.
- Galaxy movement renders at up to 60 updates/s; the slowly moving constellation halo renders at 30 updates/s after its initial growth.

Validation: TypeScript check, static build, 38-page/local-asset checks, continuous carousel tests at 1–300 projects, and renderer lifecycle tests. Browser checks cover category switching, selection, opening/closing a preview and navigation return.

Optional `?profile=1` exposes local canvas timings and a frame sampler. The initial browser sample measured gallery canvas paint CPU time at about 2.2ms; the optimized sample was about 0.3ms, but the second browser session was throttled and this is not a comparable FPS benchmark. Pixel/operation reductions above are directly verified; no universal FPS claim is made.