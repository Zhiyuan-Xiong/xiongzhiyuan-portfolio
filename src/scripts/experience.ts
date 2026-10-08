const opener = document.querySelector<HTMLElement>('[data-opening]');
if (opener) {
  const ring = opener.querySelector<HTMLElement>('[data-category-ring]')!;
  const panels = [...opener.querySelectorAll<HTMLAnchorElement>('[data-orbit-panel]')];
  const links = [...opener.querySelectorAll<HTMLAnchorElement>('[data-section-preview]')];
  const label = opener.querySelector<HTMLElement>('[data-orbit-label]')!;
  let turn = 0;
  function rotate(index: number, updateUrl = false) {
    turn = index;
    const selected = ((index % panels.length) + panels.length) % panels.length;
    ring.style.setProperty('--ring-turn', `${-index * 72}deg`);
    panels.forEach((panel, i) => { panel.dataset.active = String(i === selected); panel.tabIndex = i === selected ? 0 : -1; });
    links.forEach((link, i) => { link.dataset.previewCurrent = String(i === selected); });
    label.textContent = panels[selected].querySelector('.orbit-panel-label')?.firstChild?.textContent ?? '';
    if (updateUrl) {
      const url = new URL(location.href);url.searchParams.set('category', panels[selected].href.split('/').filter(Boolean).at(-1)!);
      history.replaceState(null, '', url); dispatchEvent(new Event('portfolio:state'));
    }
  }
  panels.forEach((panel, index) => panel.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (index !== ((turn % panels.length) + panels.length) % panels.length) { event.preventDefault(); const diff = ((index - (((turn % panels.length) + panels.length) % panels.length) + panels.length) % panels.length); rotate(turn + (diff > panels.length / 2 ? diff - panels.length : diff), true); }
  }));
  links.forEach((link, index) => {
    const preview = () => { const diff = ((index - (((turn % panels.length) + panels.length) % panels.length) + panels.length) % panels.length); rotate(turn + (diff > panels.length / 2 ? diff - panels.length : diff)); };
    link.addEventListener('pointerenter', preview); link.addEventListener('focus', preview);
  });
  opener.querySelectorAll<HTMLButtonElement>('[data-orbit-step]').forEach(button => button.addEventListener('click', () => rotate(turn + Number(button.dataset.orbitStep), true)));
  const requested = new URL(location.href).searchParams.get('category');
  const first = panels.findIndex(panel => panel.href.split('/').filter(Boolean).at(-1) === requested);
  rotate(first < 0 ? 0 : first);
}
const projectBrowser = document.querySelector<HTMLElement>('[data-project-browser]');
if (projectBrowser) {
  const tabs = [...projectBrowser.querySelectorAll<HTMLButtonElement>('[data-project-select]')];
  const panels = [...projectBrowser.querySelectorAll<HTMLElement>('[data-project-panel]')];
  const atmospheres = [...projectBrowser.querySelectorAll<HTMLElement>('[data-project-atmosphere]')];
  const category = location.pathname.split('/').filter(Boolean).at(-1)!;
  function showProject(slug?: string | null, moveFocus = false) {
    const found = tabs.findIndex(tab => tab.dataset.projectSelect === slug);
    const selected = found < 0 ? 0 : found;
    const chosen = tabs[selected].dataset.projectSelect!;
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === selected)); tab.tabIndex = i === selected ? 0 : -1; });
    panels.forEach(panel => { panel.hidden = panel.dataset.projectPanel !== chosen; });
    atmospheres.forEach(atmosphere => { atmosphere.dataset.active = String(atmosphere.dataset.projectAtmosphere === chosen); });
    projectBrowser!.querySelector('[data-project-position]')!.textContent = String(selected + 1).padStart(2, '0');
    const announcement = projectBrowser!.querySelector('[data-project-announcement]');
    if (announcement) announcement.textContent = panels[selected].querySelector('h2')?.textContent ?? '';
    if (moveFocus) { tabs[selected].focus(); tabs[selected].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
    for (const link of projectBrowser!.querySelectorAll<HTMLAnchorElement>('[data-case-link]')) { const url = new URL(link.href); url.searchParams.set('category', category); link.href = url.pathname + url.search; }
    dispatchEvent(new Event('portfolio:state'));
  }
  function selectProject(index: number, focus = false) {
    const target = (index + tabs.length) % tabs.length;
    const url = new URL(location.href); url.searchParams.set('project', tabs[target].dataset.projectSelect!);
    if (url.href !== location.href) history.pushState(null, '', url);
    showProject(tabs[target].dataset.projectSelect, focus);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectProject(index));
    tab.addEventListener('keydown', event => {
      let next: number | undefined;
      if (event.key === 'ArrowRight') next = index + 1;
      else if (event.key === 'ArrowLeft') next = index - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectProject(next, true); }
    });
  });
  const restore = () => showProject(new URL(location.href).searchParams.get('project'));
  addEventListener('popstate', restore); restore();
}
export {};