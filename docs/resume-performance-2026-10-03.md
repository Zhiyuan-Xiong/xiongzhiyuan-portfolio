# Resume and site smoothness — 2026-10-03

Source: `D:/AAA找到工作/工作材料/熊志愿_简历_体验设计.pdf`. Extracted using pypdf and visually checked against a Poppler rendering. About now contains both schools and their dates/results/courses, all four projects and roles, internship, all six award entries, tools, contact details, and the supplied original CV. Chinese project dates and artist spelling follow the supplied resume. Partner-studio annual sales are clearly attributed to the studio. English copy is a faithful translation; its download is explicitly labelled as the Chinese original.

Changes:
- Native project videos pause offscreen, on hidden tabs and under image/diagram dialogs. Manual pause intent is retained. The playing hero transferred by the five-second entry is never sought or loaded again.
- Project interest prepares HTML/CSS; large portal films stream only when entry begins. Browser check: selecting Metamorphosis left all portal video sources unset.
- Ambient index/About nebula uses 30 draws per second, with elapsed-time motion. The foreground retains its existing animation. Entry/explore and the Processing viewer stop unnecessary rendering above 60Hz. Full-screen canvas backing stores have a 2.8-million-pixel budget on high-DPI / 4K screens.
- WebGL attribute/uniform locations are cached. Original Processing point positions/colours stay on the GPU until a burst or reset changes them. Moving trails use typed-array writes rather than temporary arrays for every vertex.
- Image and diagram dialogs pause covered 3D scenes/audio processing and resume visible content on close.

Validation:
- Astro check: zero errors/warnings/hints.
- Full static site build and all 42 pages / 3915 local links/assets verified.
- Real renderer lifecycle regression covers hidden tabs, scene overlays, history return and disposal. New regression verifies already-playing hero continuity, offscreen automatic/manual media, explicit user pause, GPU buffer updates and 4K allocation budget. Existing carousel (1–300 projects) and orbital formation (1–200 projects) checks pass.
- Same local IAB index at 1280×720, ?profile=1: sky 60 draws/s, mean 0.18ms before; 31 draws/s, mean 0.19ms after. Approximate CPU draw budget falls from 10.8 to 5.9ms/s. The browser reports 240Hz RAF; this is environment-specific and not an end-user FPS guarantee.
- Browser entry through index → Metamorphosis: 5082ms, playing hero readyState 4 after transfer. Hero paused when scrolled to audio interaction; demo signal responds (observed 0.254) with hero still paused.
- English and Chinese About pages inspected, English mobile at 390×844: no horizontal overflow; planet sits below intro on small screens and outside copy on desktop.
- Downloaded CV content is byte-identical to the supplied PDF (SHA-256 checked).
