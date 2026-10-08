import {initializeMetamorphosisInteraction} from './metamorphosis-interaction';
import {initializeEarthquakeExplorer} from './earthquake-explorer';
import {initializeCosmosInteractions} from './cosmos-interactions';
import {initializeSite} from './site';
import {initializeCaseMedia} from './dating-festival';

const pages=new Map<string,Promise<Document|null>>();
const styles=new Map<string,Promise<void>>();
let mountedPath='';

// Load the destination while its entry sequence is running, without changing the current view.
export function prepareCase(url:URL):Promise<Document|null>{
 const key=url.pathname+url.search;
 if(pages.has(key))return pages.get(key)!;
 const pending=(async()=>{
  try{
   const response=await fetch(key,{credentials:'same-origin'});
   if(!response.ok)return null;
   const next=new DOMParser().parseFromString(await response.text(),'text/html');
   const loads:Promise<void>[]=[];
   for(const source of next.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')){
    const href=new URL(source.getAttribute('href')!,url).href;
    if([...document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].some(link=>link.href===href))continue;
    if(!styles.has(href)){
     styles.set(href,new Promise<void>(resolve=>{
      const link=document.createElement('link');link.rel='stylesheet';link.href=href;
      const timer=setTimeout(resolve,6000);
      link.onload=link.onerror=()=>{clearTimeout(timer);resolve();};document.head.append(link);
     }));
    }
    loads.push(styles.get(href)!);
   }
   for(const image of next.querySelectorAll<HTMLImageElement>('img[loading=eager]')){
    const preload=new Image();preload.src=new URL(image.getAttribute('src')!,url).href;
   }
   await Promise.all(loads);
   void document.fonts.load('400 48px FestivalTitle','相亲机械文明计划').catch(()=>{});
   void document.fonts.load('400 24px NexusEnglish','NEXUS').catch(()=>{});
   return next;
  }catch{return null;}
 })();
 pages.set(key,pending);return pending;
}

// Move the playing media element itself into the case: no navigation snapshot, decoder restart or seek.
export async function handoffCase(url:URL,film:HTMLVideoElement,onMounted:()=>void){
 const next=await prepareCase(url);
 const content=next?document.importNode(next.body,true):null;
 const target=content?.querySelector<HTMLVideoElement>('[data-festival-hero],.restored-hero video');
 if(!next||!content||!target){location.assign(url.href);return;}
 for(const script of content.querySelectorAll('script'))if(script.type!=='application/json')script.remove();
 const targetAttributes=[...target.attributes].map(attribute=>[attribute.name,attribute.value]);
 for(const attribute of [...film.attributes])if(!target.hasAttribute(attribute.name))film.removeAttribute(attribute.name);
 for(const [name,value] of targetAttributes)film.setAttribute(name,value);
 target.replaceWith(film);
 mountCase(url,next,content,onMounted);
 void film.play().catch(()=>{});
 document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});
 pages.delete(url.pathname+url.search);
}
// A still-image case retains the completed entry layer until the destination is decoded.
export async function handoffStillCase(url:URL,overlay:HTMLElement,onMounted:()=>void){
 const next=await prepareCase(url);
 const content=next?document.importNode(next.body,true):null;
 const image=content?.querySelector<HTMLImageElement>('.restored-hero-main');
 if(!next||!content||!image){location.assign(url.href);return;}
 for(const script of content.querySelectorAll('script'))if(script.type!=='application/json')script.remove();
 await Promise.race([image.decode().catch(()=>{}),new Promise<void>(resolve=>setTimeout(resolve,1200))]);
 overlay.classList.remove('is-opening');
 mountCase(url,next,content,onMounted,overlay);
 await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
 overlay.classList.add('is-case-arriving');
 await new Promise<void>(resolve=>setTimeout(resolve,450));
 overlay.remove();
 document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});
 pages.delete(url.pathname+url.search);
}

function mountCase(url:URL,next:Document,content:HTMLElement,onMounted:()=>void,overlay?:HTMLElement){
 dispatchEvent(new Event('portfolio:page-leave'));
 document.documentElement.lang=next.documentElement.lang;
 document.title=next.title;
 const alternate=next.head.querySelector<HTMLLinkElement>('link[rel=alternate]');
 if(alternate){const current=document.head.querySelector<HTMLLinkElement>('link[rel=alternate]');current?.setAttribute('href',alternate.getAttribute('href')!);current?.setAttribute('hreflang',alternate.hreflang);}
 for(const name of ['description','theme-color']){
  const content=next.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;
  if(content)document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.setAttribute('content',content);
 }
 for(const attribute of [...document.body.attributes])document.body.removeAttribute(attribute.name);
 for(const attribute of [...next.body.attributes])document.body.setAttribute(attribute.name,attribute.value);
 document.body.replaceChildren(...content.childNodes,...(overlay?[overlay]:[]));
 if(url.href!==location.href)history.pushState({portfolioCase:true},'',url.href);
 mountedPath=url.pathname;
 scrollTo({top:0,left:0,behavior:'instant'});
 initializeSite();initializeCaseMedia();initializeCosmosInteractions();initializeEarthquakeExplorer();initializeMetamorphosisInteraction();onMounted();
}
addEventListener('popstate',()=>{
 if(mountedPath&&location.pathname!==mountedPath)location.reload();
});
