let activeCase: Element | null = null;
let stopCase: () => void = () => {};
export function initializeCaseMedia() {
  const main = document.querySelector('#main');
  if (main === activeCase) return;
  stopCase(); activeCase = main;
  if (!main) return;
  const events = new AbortController(), signal = events.signal, watchers: IntersectionObserver[] = [];
  const cover = main.querySelector('.restored-hero');
  if (cover) {
    const watcher = new IntersectionObserver(([entry]) => { document.body.dataset.caseScrolled = String(!entry.isIntersecting); });
    watcher.observe(cover); watchers.push(watcher);
  }
  // Background films follow visibility. Never seek/reload the hero transferred by the portal.
  const states = new Map<HTMLVideoElement, { visible: boolean; automatic: boolean; resume: boolean }>();
  let suspended = false, updating = false;
  const films = [...main.querySelectorAll<HTMLVideoElement>('.restored-hero video, [data-festival-hero], [data-species-video], video[controls]')];
  for (const video of films) {
    const box = video.getBoundingClientRect();
    const automatic = !video.hasAttribute('controls');
    states.set(video, { visible: box.bottom > 0 && box.top < innerHeight, automatic, resume: !video.paused });
    if (!automatic) {
      video.addEventListener('play', () => {
        states.get(video)!.resume = true;
        for (const [other, state] of states) if (other !== video && !state.automatic) { state.resume = false; other.pause(); }
      }, { signal });
      video.addEventListener('pause', () => { if (!updating && states.get(video)!.visible && !suspended && !document.hidden) states.get(video)!.resume = false; }, { signal });
    }
  }
  function syncMedia() {
    updating = true;
    for (const [video, state] of states) {
      const play = state.visible && !suspended && !document.hidden && (state.automatic || state.resume);
      if (play) {
        const source = video.querySelector<HTMLSourceElement>('source[data-src]');
        if (source?.dataset.src && !source.getAttribute('src')) { source.src = source.dataset.src; video.load(); }
        if (video.paused) void video.play().catch(() => {});
      } else if (!video.paused) video.pause();
    }
    updating = false;
  }
  if (films.length) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        states.get(video)!.visible = entry.isIntersecting;
        if (video.matches('[data-festival-hero]')) document.body.dataset.festivalScrolled = String(!entry.isIntersecting);
      }
      syncMedia();
    }, { threshold: .01 });
    films.forEach(video => observer.observe(video)); watchers.push(observer);
    document.addEventListener('visibilitychange', syncMedia, { signal });
    addEventListener('portfolio:scene-pause', () => { suspended = true; syncMedia(); }, { signal });
    addEventListener('portfolio:scene-resume', () => { suspended = false; syncMedia(); }, { signal });
    addEventListener('pagehide', () => { suspended = true; syncMedia(); }, { signal });
    addEventListener('pageshow', () => { suspended = false; syncMedia(); }, { signal });
    syncMedia();
  }
  main.querySelector<HTMLButtonElement>('[data-load-mv]')?.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://player.bilibili.com/player.html?bvid=BV1YzXkB3Exp&autoplay=1';
    frame.title = document.documentElement.lang === 'en' ? 'Poisonous Mushrooms — official music video' : '邓泽西《毒蘑菇》完整 MV';
    frame.allow = 'autoplay; fullscreen; picture-in-picture'; frame.allowFullscreen = true;
    main.querySelector('[data-mushroom-film]')?.replaceChildren(frame);
  }, { signal });
  main.querySelector('[data-load-film]')?.addEventListener('click', () => {
    const frame = document.createElement('iframe'); frame.src = 'https://www.youtube-nocookie.com/embed/ofMeZN49vNA?autoplay=1&rel=0';
    frame.title = document.body.dataset.lang !== 'en' ? '相亲营销嘉年华完整概念影片' : 'Blind Dating Market Festival concept film';
    frame.allow = 'autoplay; fullscreen; picture-in-picture'; frame.allowFullscreen = true;
    main.querySelector('[data-full-film]')?.replaceChildren(frame);
  }, { signal });
  const diagram = main.querySelector<HTMLElement>('[data-mechanism-figure]');
  if (diagram) {
    const dialog = diagram.querySelector<HTMLDialogElement>('[data-diagram-dialog]')!, expand = diagram.querySelector<HTMLButtonElement>('[data-diagram-expand]')!;
    expand.addEventListener('click', () => {
      const zoom = dialog.querySelector('[data-diagram-zoom]')!;
      if (!zoom.firstElementChild) zoom.append(diagram.querySelector('[data-diagram-stage]')!.cloneNode(true));
      dialog.showModal(); document.body.classList.add('modal-open'); dispatchEvent(new Event('portfolio:scene-pause'));
    }, { signal });
    dialog.querySelector('[data-diagram-close]')!.addEventListener('click', () => dialog.close(), { signal });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); dispatchEvent(new Event('portfolio:scene-resume')); expand.focus({ preventScroll: true }); }, { signal });
    dialog.addEventListener('click', event => { if ((event.target as HTMLElement).closest('a')) dialog.close(); }, { signal });
  }
  stopCase = () => { events.abort(); watchers.forEach(watcher => watcher.disconnect()); states.forEach((_, video) => video.pause()); activeCase = null; };
  addEventListener('portfolio:page-leave', stopCase, { signal, once: true });
}
initializeCaseMedia();
