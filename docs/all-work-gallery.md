# Work index display modes

The default All work view places the project band centrally near the bottom, with larger circulating covers, its heading and project copy below, and a centred View project link. The category navigation starts on the left and displays every filter directly, without a dropdown; a thin illuminated underline marks the current category. The constellation grows centrally in the open upper area. It uses one real project button per project in a continuous perspective carousel. Each card keeps its project slug, panel relationship, image crop and project portal. The window stays a fixed size instead of reducing every thumbnail as projects are added. Cards outside the window stop receiving transforms and do not create persistent compositor layers.

Named categories use a filmstrip of equally sized 3:4 covers. Card dimensions stay independent of the filtered result count and do not grow on selection. Images use cover cropping without stretching. The category bar uses four-character Chinese names and corresponding English labels in equal-width slots. The large headings keep their existing typography; no case study, background nebula, constellation illustration, source colour or project entrance sequence was changed.

## Interaction

- The unselected all-work view drifts slowly through the collection without selecting a project.
- Hover or keyboard focus holds the flow. The motion button explicitly pauses or resumes it.
- Dragging browses and snaps to the closest card without changing selection or accidentally opening the preview.
- Selection brings the project forward, pauses automatic movement, and preserves the existing constellation draw, delayed blurred background and dimming of other thumbnails.
- Selecting the same project again opens the existing project preview. View project keeps the existing entry portal.
- Left/right, Home/End, browser history and category URL parameters keep working. Incompatible selections are cleared on filtering.
- Reduced motion starts paused; hidden documents and case handoffs stop the animation.

## Validation — 2026-10-02

- Astro check: no errors or warnings; two pre-existing hints in portfolio-space.ts.
- Static build: 38 pages; 3339 local links/assets checked.
- scripts/verify-carousel.mjs exercises wrapping and bounded windows at 1, 2, 10, 30, 100 and 300 projects. It is included in the site verification command.
- Browser: desktop/390×844 mobile, initial unselected state, automatic flow and pause, drag with no accidental selection, keyboard End, category strip and cleared incompatible selection, English UI and existing project preview.
- Online entry-preview: carousel loaded, selection and constellation/background state verified, no browser errors.

Production changes live in src/scripts/work-carousel.ts, src/scripts/work-gallery.ts, src/pages/[lang]/works.astro and src/styles/work-gallery.css. Preview screenshots are saved in qa/all-work-carousel-preview.png and qa/all-work-carousel-selected.png.
