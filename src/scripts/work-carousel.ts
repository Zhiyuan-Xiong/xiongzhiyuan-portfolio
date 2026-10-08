// A finite set of real project buttons moves through an endless display window.
// No duplicate tabs: selection, history and project portals keep their original identity.
export function carouselDistance(index: number, position: number, count: number) {
  if (count < 2) return 0;
  return ((index - position + count / 2) % count + count) % count - count / 2;
}
export function createWorkCarousel(gallery: HTMLElement, tabs: HTMLButtonElement[], reduced: MediaQueryList) {
  const stage = gallery.querySelector<HTMLElement>('[data-gallery-tabs]')!;
  const toggle = gallery.querySelector<HTMLButtonElement>('[data-gallery-motion]')!;
  const zh = document.documentElement.lang.startsWith('zh');
  const events = new AbortController(), signal = events.signal;
  let active = false, alive = true, suspended = false, paused = reduced.matches, hovering = false, focused = false;
  let position = Math.min(2, tabs.length - 1), destination: number | null = null;
  let width = 800, cardWidth = 200, frame = 0, last = 0, selected = '';
  let drag: { id: number; x: number; y: number; position: number; moved: boolean } | null = null;
  let suppressClickUntil = 0;
  function syncControl() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', zh ? (paused ? '开始自动浏览作品' : '暂停自动浏览作品') : (paused ? 'Start automatic browsing' : 'Pause automatic browsing'));
    toggle.querySelector('[data-gallery-motion-icon]')!.textContent = paused ? '▷' : 'Ⅱ';
    toggle.querySelector('[data-gallery-motion-label]')!.textContent = zh ? (paused ? '自动浏览' : '暂停流动') : (paused ? 'Auto browse' : 'Pause flow');
    gallery.dataset.carouselMotion = paused ? 'paused' : 'playing';
  }
  function measure() {
    width = stage.clientWidth;
    cardWidth = Math.max(150, Math.min(width < 500 ? width * .5 : width * .27, 310, stage.clientHeight * .69));
    stage.style.setProperty('--carousel-card-width', `${cardWidth}px`);
    if (active) draw();
  }
  function draw() {
    if (!active) return;

    const span = width < 500 ? 2.9 : 3.7;
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i], d = carouselDistance(i, position, tabs.length), depth = Math.abs(d);
      const fade = Math.max(0, Math.min(1, (span - depth) / .85));
      if (fade === 0) {
        if (tab.dataset.carouselVisible !== 'false') { tab.dataset.carouselVisible = 'false'; tab.style.opacity = '0'; tab.style.pointerEvents = 'none'; }
        continue;
      }
      if (tab.dataset.carouselVisible !== 'true') tab.dataset.carouselVisible = 'true';
      const x = d * cardWidth * .94 / (1 + depth * .025);
      const y = depth * depth * 7 - (tab.dataset.galleryProject === selected ? 12 : 0);
      tab.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px),calc(-50% + ${y.toFixed(2)}px),${(-depth * cardWidth * .36).toFixed(2)}px) rotateY(${(-d * 12).toFixed(2)}deg) rotateZ(${(d * .55).toFixed(2)}deg)`;
      tab.style.opacity = String(fade * Math.max(.38, 1 - depth * .12));
      const zIndex = String(100 - Math.round(depth * 10));
      if (tab.style.zIndex !== zIndex) tab.style.zIndex = zIndex;
      const events = fade > .08 ? 'auto' : 'none';
      if (tab.style.pointerEvents !== events) tab.style.pointerEvents = events;
      // Invisible cards remain available to roving keyboard navigation and screen readers.
    }
  }
  function mayFlow() {
    return active && !suspended && !paused && !hovering && !focused && !drag && !document.hidden;
  }
  function run() { if (active && alive && !suspended && !frame && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } }
  function tick(now: number) {
    frame = 0;
    if (!active || !alive || suspended || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    if (destination !== null) {
      position += (destination - position) * (1 - Math.exp(-dt * 8));
      if (Math.abs(destination - position) < .002 || reduced.matches) { position = destination; destination = null; }
    } else if (mayFlow()) position += dt * .22;
    // Renormalise only at rest; wrapped distance is continuous through every loop seam.
    if (destination === null && !drag) position = ((position % tabs.length) + tabs.length) % tabs.length;
    draw();
    if (destination !== null || mayFlow()) frame = requestAnimationFrame(tick);
  }
  function centre(tab: HTMLButtonElement) {
    const i = tabs.indexOf(tab); if (i < 0) return;
    destination = position + carouselDistance(i, position, tabs.length);
    if (reduced.matches) { position = destination; destination = null; draw(); } else run();
  }
  function endDrag(event: PointerEvent, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved, id = drag.id; drag = null; stage.dataset.dragging = 'false';
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    if (moved) {
      suppressClickUntil = performance.now() + 450;
      destination = Math.round(position); run();
    }
    if (cancelled) suppressClickUntil = performance.now() + 450;
  }
  stage.addEventListener('pointerenter', () => { hovering = true; }, { signal });
  stage.addEventListener('pointerleave', () => { hovering = false; run(); }, { signal });
  stage.addEventListener('focusin', event => {
    focused = true;
    const tab = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-gallery-project]');
    if (active && tab) centre(tab);
  }, { signal });
  stage.addEventListener('focusout', event => { focused = stage.contains(event.relatedTarget as Node | null); if (!focused) run(); }, { signal });
  stage.addEventListener('pointerdown', event => {
    if (!active || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, position, moved: false };
  }, { signal });
  stage.addEventListener('pointermove', event => {
    if (!active || !drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      drag.moved = true; destination = null; paused = true; syncControl();
      stage.setPointerCapture(event.pointerId); stage.dataset.dragging = 'true';
    }
    if (drag.moved) { position = drag.position - dx / (cardWidth * .94); draw(); }
  }, { signal });
  addEventListener('pointerup', event => endDrag(event), { signal });
  addEventListener('pointercancel', event => endDrag(event, true), { signal });
  stage.addEventListener('lostpointercapture', () => { drag = null; stage.dataset.dragging = 'false'; }, { signal });
  stage.addEventListener('click', event => {
    if (active && performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, { signal, capture: true });
  stage.addEventListener('dragstart', event => { if (active) event.preventDefault(); }, { signal });
  toggle.addEventListener('click', () => { paused = !paused; syncControl(); run(); }, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else run(); }, { signal });
  reduced.addEventListener('change', () => { paused = reduced.matches; syncControl(); run(); }, { signal });
  const suspend = () => { suspended = true; cancelAnimationFrame(frame); frame = 0; };
  const resume = () => { suspended = false; measure(); run(); };
  addEventListener('portfolio:scene-pause', suspend, { signal });
  addEventListener('portfolio:scene-resume', resume, { signal });
  addEventListener('pagehide', suspend, { signal });
  addEventListener('pageshow', resume, { signal });
  const observer = new ResizeObserver(measure); observer.observe(stage);
  return {
    update(category: string, tab?: HTMLButtonElement) {
      const enabled = category === 'all', changed = enabled !== active || selected !== (tab?.dataset.galleryProject ?? '');
      selected = tab?.dataset.galleryProject ?? ''; active = enabled;
      gallery.dataset.layout = enabled ? 'carousel' : 'strip';
      gallery.style.setProperty('--project-count', String(tabs.filter(tab => !tab.hidden).length));
      toggle.hidden = !enabled;
      if (!enabled) {
        cancelAnimationFrame(frame); frame = 0; destination = null; drag = null;
        tabs.forEach(tab => { tab.style.removeProperty('transform'); tab.style.removeProperty('opacity'); tab.style.removeProperty('z-index'); tab.style.removeProperty('pointer-events'); delete tab.dataset.carouselVisible; });
        stage.style.removeProperty('--carousel-card-width'); stage.dataset.dragging = 'false';
      } else {
        if (changed) { paused = Boolean(tab) || reduced.matches; if (tab) centre(tab); }
        measure(); syncControl(); draw(); run();
      }
    },
    dispose() { alive = false; active = false; events.abort(); observer.disconnect(); cancelAnimationFrame(frame); }
  };
}
