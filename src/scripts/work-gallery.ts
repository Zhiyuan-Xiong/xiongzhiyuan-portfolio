import { createWorkCarousel } from './work-carousel';
import { createGalleryNebula } from './gallery-nebula';
import { createConstellationCloud } from './constellation-cloud';
const gallery = document.querySelector<HTMLElement>('[data-work-gallery]');
if (gallery) {
  const tabs = [...gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-project]')];
  const panels = [...gallery.querySelectorAll<HTMLElement>('[data-gallery-panel]')];
  const backgrounds = [...gallery.querySelectorAll<HTMLElement>('[data-gallery-background]')];
  const constellations = [...gallery.querySelectorAll<SVGElement>('[data-gallery-constellation]')];
  const idle = gallery.querySelector<HTMLElement>('[data-gallery-idle]')!;
  const categoryButtons = [...gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-category]')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const nebula = createGalleryNebula(gallery.querySelector<HTMLCanvasElement>('[data-gallery-nebula]')!);
  const cloud = createConstellationCloud(gallery.querySelector<HTMLCanvasElement>('[data-gallery-cloud]')!);
  const categories = categoryButtons.map(button => button.dataset.galleryCategory!);
  const carousel = createWorkCarousel(gallery, tabs, reduceMotion);
  const events = new AbortController(), signal = events.signal;
  let selectedSlug = '', settledTimer = 0;
  let visibleTabs: HTMLButtonElement[] = tabs;
  function render(scrollToSelected = false) {
    const url = new URL(location.href);
    const category = categories.includes(url.searchParams.get('category') ?? '') ? url.searchParams.get('category')! : 'all';
    categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galleryCategory === category)));
    visibleTabs = tabs.filter(tab => category === 'all' || tab.dataset.galleryCategories?.split(' ').includes(category));
    const selected = visibleTabs.find(tab => tab.dataset.galleryProject === url.searchParams.get('project'));
    const nextSlug = selected?.dataset.galleryProject ?? '';
    const changed = nextSlug !== selectedSlug;
    selectedSlug = nextSlug;
    tabs.forEach(tab => {
      tab.hidden = !visibleTabs.includes(tab);
      tab.setAttribute('aria-selected', String(tab === selected));
      tab.tabIndex = tab === (selected ?? visibleTabs[0]) ? 0 : -1;
    });
    carousel.update(category, selected);
    cloud.resize();
    idle.hidden = Boolean(selected);
    panels.forEach(panel => { panel.hidden = panel.dataset.galleryPanel !== selectedSlug; });
    if (changed) {
      clearTimeout(settledTimer);
      gallery!.dataset.selection = selected ? 'drawing' : 'none';
      backgrounds.forEach(background => {
        background.dataset.active = 'false';
        if (background.dataset.galleryBackground !== selectedSlug) return;
        const image = background.querySelector<HTMLImageElement>('[data-gallery-background-src]');
        if (!image) return;
        if (!image.getAttribute('src')) image.src = image.dataset.galleryBackgroundSrc!;
        const slug = selectedSlug;
        const reveal = () => { if (gallery!.isConnected && selectedSlug === slug) background.dataset.active = 'true'; };
        if (image.complete && image.naturalWidth) reveal(); else void image.decode().then(reveal).catch(() => {});
      });
      constellations.forEach(shape => { shape.dataset.active = String(shape.dataset.galleryConstellation === selectedSlug); });
      nebula.tint(selected?.dataset.galleryColor ?? '160 169 185');
      cloud.select(constellations.find(shape => shape.dataset.galleryConstellation === selectedSlug) as SVGSVGElement | undefined, selected?.dataset.galleryColor ?? '160 169 185');
      if (selected) settledTimer = window.setTimeout(() => { gallery!.dataset.selection = 'formed'; }, reduceMotion.matches ? 0 : 3500);
    }
    const index = selected ? visibleTabs.indexOf(selected) : -1;
    gallery!.querySelector('[data-gallery-position]')!.textContent = selected ? String(index + 1).padStart(2, '0') : '—';
    gallery!.querySelector('[data-gallery-total]')!.textContent = String(visibleTabs.length).padStart(2, '0');
    gallery!.querySelector<HTMLElement>('[data-gallery-progress]')!.style.setProperty('--progress', `${visibleTabs.length ? (index + 1) / visibleTabs.length * 100 : 0}%`);
    gallery!.querySelector('[data-gallery-announcement]')!.textContent = selected?.getAttribute('aria-label') ?? '';
    if (scrollToSelected && selected && category !== 'all') selected.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    if (selected) {
      const caseLink = panels.find(panel => panel.dataset.galleryPanel === selectedSlug)?.querySelector<HTMLAnchorElement>('[data-case-link]');
      if (caseLink) dispatchEvent(new CustomEvent('portfolio:prepare-project', { detail: caseLink.href }));
    }
    dispatchEvent(new Event('portfolio:state'));
  }
  function select(tab: HTMLButtonElement | undefined, focus = false) {
    if (!tab) return;
    const url = new URL(location.href);
    url.searchParams.set('project', tab.dataset.galleryProject!);
    if (url.href !== location.href) history.pushState(null, '', url);
    render(focus);
    if (focus) tab.focus({ preventScroll: true });
  }
  function step(delta: number, focus = false) {
    const index = visibleTabs.findIndex(tab => tab.dataset.galleryProject === selectedSlug);
    select(visibleTabs[index < 0 ? (delta > 0 ? 0 : visibleTabs.length - 1) : (index + delta + visibleTabs.length) % visibleTabs.length], focus);
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.dataset.galleryProject === selectedSlug) dispatchEvent(new CustomEvent('portfolio:preview', { detail: selectedSlug }));
      else select(tab);
    });
    tab.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1, true); }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); select(visibleTabs[event.key === 'Home' ? 0 : visibleTabs.length - 1], true); }
    });
  });
  gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-step]').forEach(button => button.addEventListener('click', () => step(Number(button.dataset.galleryStep), true)));
  categoryButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const category = button.dataset.galleryCategory!;
      const url = new URL(location.href);
      if (category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', category);
      const compatible = tabs.find(tab => tab.dataset.galleryProject === selectedSlug && (category === 'all' || tab.dataset.galleryCategories?.split(' ').includes(category)));
      if (!compatible) url.searchParams.delete('project');
      if (url.href === location.href) return;
      history.pushState(null, '', url); render(true);
    }, { signal });
  });
  addEventListener('popstate', () => { if (gallery.isConnected) render(true); }, { signal });
  addEventListener('portfolio:page-leave', () => { clearTimeout(settledTimer); events.abort(); carousel.dispose(); nebula.dispose(); cloud.dispose(); }, { once: true });
  render(true);
}
export {};
