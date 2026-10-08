# Portal visibility and explore update — 2026-10-03

## Confirmed cause

On the published Infinite Cosmos entry, the film was playing at 0.184 s with readyState 4, but its stage had computed opacity 0 and transform scale(0.28). The shared cosmos portal rule disabled the expansion animation without overriding the stage's hidden starting values. This affected Infinite Cosmos, Earthquake and Metamorphosis.

The shared stage now explicitly uses opacity 1, transform none and filter none. Its parent retains the 550 ms entrance fade; the existing film crossfade and same-element handoff remain intact.

## Browser verification

All three local portals showed opacity 1, transform none and playing videos with readyState 4 immediately after the click. Their mounted case heroes continued playing:

| Project | Total entry time | Hero readyState | Hero paused |
| --- | --- | --- | --- |
| Infinite Cosmos | 5070 ms | 4 | false |
| Metamorphosis | 5060 ms | 4 | false |
| Earthquake | 5092 ms | 4 | false |

No browser warning/error logs were reported by the checked local case and exploration tabs.

## Exploration

Existing complete orbital lines have higher alpha and a restrained silver-blue tint. Short background trails brighten only as the exploration opens. No extra particles or draw passes were added.

The central star core grows from 14 px to 22 px, with proportionate rays, halo and ring. Its existing world-space position and accessible target are preserved; constellation spokes start outside the enlarged core. Keyboard focus formed all 12 spokes, and the central link still points to /zh/works/. The settled local scene reported 60 fps.

## Checks

Astro check: 98 files, zero errors/warnings/hints. Static build: 42 pages. Existing tests passed, including animation lifecycle, media continuity, render budget, explore formation, carousel and 3915 local links/assets.

Source backups are in .cache/before-portal-visibility-2026-10-03 and .cache/before-explore-orbits-2026-10-03. Browser proof screenshots are in C:/Users/24586/Documents/ChatGPT/个人作品集/qa-portal-explore/.
