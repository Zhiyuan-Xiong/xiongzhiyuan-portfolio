import { initializeFrameProfile } from './render-profile';
import { initializePageTransitions } from './page-transitions';
let stopSite:()=>void=()=>{};
export function initializeSite(){
stopSite();
initializePageTransitions();
initializeFrameProfile();
const events=new AbortController();
const lang=document.body.dataset.lang==='en' ? 'en' : 'zh';
const validCategories=['ux','3d','installation','video','visual'];
function currentCategory(){const path=location.pathname.split('/').filter(Boolean);const routeCategory=path[1]==='sections' ? path[2] : null;const value=routeCategory ?? new URL(location.href).searchParams.get('category');return value && validCategories.includes(value) ? value : 'all';}
function syncNavigation(){
  const category=currentCategory();
  for(const link of document.querySelectorAll<HTMLAnchorElement>('[data-language-link], [data-case-link], [data-back-link]')){
    const url=new URL(link.href);
    if(category!=='all')url.searchParams.set('category',category);else url.searchParams.delete('category');
    if(link.hasAttribute('data-back-link')){
      const path=location.pathname.split('/').filter(Boolean);
      if(path[1]==='work' && path[2])url.searchParams.set('project',path[2]);
    }
    if(link.hasAttribute('data-language-link')){
      url.hash=location.hash;
      const project=new URL(location.href).searchParams.get('project');
      if(project)url.searchParams.set('project',project);else url.searchParams.delete('project');
    }
    link.href=url.pathname+url.search+url.hash;
  }
}
function filterProjects(){
  const category=currentCategory();
  const cards=[...document.querySelectorAll<HTMLElement>('[data-library] [data-project]')];
  if(!cards.length){syncNavigation();return;}
  let visible=0,available=0;
  for(const card of cards){const show=category==='all'||card.dataset.categories?.split(' ').includes(category);card.hidden=!show;if(show){visible++;if(card.querySelector('a[data-case-link]'))available++;}}
  for(const filter of document.querySelectorAll<HTMLAnchorElement>('[data-filter]')){if(filter.dataset.filter===category)filter.setAttribute('aria-current','true');else filter.removeAttribute('aria-current');}
  const result=document.querySelector('[data-results]');
  if(result)result.textContent=lang==='zh' ? `共 ${visible} 个项目，${available} 个案例可阅读。` : `${visible} ${visible===1?'project':'projects'}, with ${available} ${available===1?'case study':'case studies'} available.`;
  syncNavigation();
}
for(const filter of document.querySelectorAll<HTMLAnchorElement>('[data-filter]'))filter.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();history.pushState(null,'',filter.href);filterProjects();});
addEventListener('popstate',filterProjects,{signal:events.signal});addEventListener('hashchange',syncNavigation,{signal:events.signal});addEventListener('portfolio:state',syncNavigation,{signal:events.signal});filterProjects();
const menu=document.querySelector<HTMLButtonElement>('.menu-button');
const nav=document.querySelector<HTMLElement>('#primary-nav');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('is-open',open);});
nav?.addEventListener('click',event=>{if((event.target as HTMLElement).closest('a'))closeMenu();});
addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}},{signal:events.signal});
const dialog=document.querySelector<HTMLDialogElement>('.lightbox');
let opener:HTMLButtonElement|null=null;
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-lightbox]'))button.addEventListener('click',()=>{
  if(!dialog)return;opener=button;dialog.classList.toggle('is-blended',button.dataset.blend==='screen');
  const img=dialog.querySelector('img')!;img.src=button.dataset.lightbox!;img.alt=button.dataset.alt??'';
  dialog.querySelector('figcaption')!.textContent=button.dataset.caption??'';
  dialog.showModal();document.body.classList.add('modal-open');dispatchEvent(new Event('portfolio:scene-pause'));
});
dialog?.querySelector('button')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
dialog?.addEventListener('close',()=>{document.body.classList.remove('modal-open');dispatchEvent(new Event('portfolio:scene-resume'));opener?.focus({preventScroll:true});});
let chapterObserver:IntersectionObserver|null=null;
const chapters=document.querySelectorAll<HTMLElement>('.case-section, #overview');
if(chapters.length&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){for(const a of document.querySelectorAll('.case-toc a')){if(a.getAttribute('href')===`#${entry.target.id}`)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');}}}}, {rootMargin:'-12% 0px -65% 0px',threshold:0});
  chapters.forEach(chapter=>observer.observe(chapter));chapterObserver=observer;
}
stopSite=()=>{events.abort();chapterObserver?.disconnect();};
}
initializeSite();

