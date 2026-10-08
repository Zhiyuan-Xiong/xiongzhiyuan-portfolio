import {prepareCase,handoffCase,handoffStillCase} from './case-handoff';

type PreviewProject={slug:string;title:string;intro:string;keywords:string;cover:string;alt:string};
const TOTAL_MS=5000,DEPARTURE_MS=550,FILM_START_MS=3700;
let disposePortal:()=>void=()=>{};
export function initializeProjectPortal(){
 disposePortal();
 const events=new AbortController(),signal=events.signal;
 const preview=document.querySelector<HTMLDialogElement>('[data-project-preview]');
 const portal=document.querySelector<HTMLElement>('[data-project-portal]');
 const nexusPortal=document.querySelector<HTMLElement>('[data-nexus-portal]');
 const mushroomsPortal=document.querySelector<HTMLElement>('[data-mushrooms-portal]');
 const cosmosPortal=document.querySelector<HTMLElement>('[data-cosmos-portal]');
 const metPortal=document.querySelector<HTMLElement>('[data-metamorphosis-portal]');
 const earthquakePortal=document.querySelector<HTMLElement>('[data-earthquake-portal]');
 const skeletonPortal=document.querySelector<HTMLElement>('[data-skeleton-portal]');
 if(!portal&&!nexusPortal&&!mushroomsPortal&&!cosmosPortal&&!earthquakePortal&&!metPortal&&!skeletonPortal)return;
 const records=JSON.parse(document.querySelector('[data-preview-content]')?.textContent??'[]') as PreviewProject[];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let entering=false,portalMeltFrame=0;
 let opener:HTMLElement|null=null;
 const projectUrl=(slug:string)=>{const url=new URL('/'+(document.body.dataset.lang??'zh')+'/work/'+slug+'/',location.origin);const cat=new URL(location.href).searchParams.get('category');if(cat)url.searchParams.set('category',cat);return url;};
 const until=(start:number,offset:number)=>new Promise<void>(resolve=>setTimeout(resolve,Math.max(0,start+offset-performance.now())));
 function drawGalaxy(){
  const canvas=preview!.querySelector('canvas')!,ctx=canvas.getContext('2d');if(!ctx)return;
  canvas.width=innerWidth;canvas.height=innerHeight;ctx.fillStyle='#080808';ctx.fillRect(0,0,canvas.width,canvas.height);
  let seed=731;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<1900;i++){const r=Math.sqrt(random()),angle=r*9+i%4*Math.PI*.5+(random()-.5)*.8;const x=canvas.width*.48+Math.cos(angle)*r*canvas.width*.62,y=canvas.height*.52+Math.sin(angle)*r*canvas.height*.8;ctx.fillStyle='rgba(215,215,210,'+(.04+random()*.24)+')';ctx.beginPath();ctx.arc(x,y,.2+random()*.8,0,Math.PI*2);ctx.fill();}
 }
 function warmDestination(url:URL,eager=false){
  const destination=url.pathname.endsWith('/work/dating-carnival/')?portal:url.pathname.endsWith('/work/nexus/')?nexusPortal:url.pathname.endsWith('/work/poisonous-mushrooms/')?mushroomsPortal:url.pathname.endsWith('/work/infinite-cosmos/')?cosmosPortal:url.pathname.endsWith('/work/earthquake/')?earthquakePortal:url.pathname.endsWith('/work/metamorphosis/')?metPortal:url.pathname.endsWith('/work/bone-series/')?skeletonPortal:null;
  if(!destination)return;
  if(eager||destination===skeletonPortal)for(const video of destination.querySelectorAll<HTMLVideoElement>('video')){
   const source=video.querySelector('source');if(source&&!source.getAttribute('src')){source.src=source.dataset.src!;video.preload='auto';video.load();}
  }
  void prepareCase(url);
 }
 function showPreview(slug:string){
  const item=records.find(p=>p.slug===slug);if(!item||!preview)return;
  opener=document.activeElement as HTMLElement;
  preview.querySelector('[data-preview-title]')!.textContent=item.title;
  preview.querySelector('[data-preview-intro]')!.textContent=item.intro;
  preview.querySelector('[data-preview-keywords]')!.textContent=item.keywords;
  const image=preview.querySelector<HTMLImageElement>('[data-preview-image]')!;image.src='/images/'+item.cover+'-1280.webp';image.alt=item.alt??item.title;
  for(const link of preview.querySelectorAll<HTMLAnchorElement>('[data-preview-link],[data-preview-image-link]'))link.href=projectUrl(slug).href;
  preview.querySelector('[data-preview-image-link]')!.setAttribute('aria-label',document.body.dataset.lang==='en'?'Open '+item.title:'进入'+item.title);
  warmDestination(projectUrl(slug));drawGalaxy();preview.showModal();dispatchEvent(new Event('portfolio:scene-pause'));document.body.classList.add('modal-open');
 }
 addEventListener('portfolio:preview',event=>showPreview((event as CustomEvent<string>).detail),{signal});
 addEventListener('portfolio:prepare-project',event=>warmDestination(new URL((event as CustomEvent<string>).detail,location.origin)),{signal});
 preview?.querySelector('[data-preview-close]')?.addEventListener('click',()=>preview.close());
 preview?.addEventListener('close',()=>{preview.inert=false;document.body.classList.remove('modal-open');if(!entering){dispatchEvent(new Event('portfolio:scene-resume'));opener?.focus({preventScroll:true});}});
 document.addEventListener('pointerover',event=>{
  const a=(event.target as HTMLElement).closest<HTMLAnchorElement>('[data-case-link],[data-reveal-link],[data-preview-image-link]');if(a)warmDestination(new URL(a.href));
 },{signal});
 function dissolve(duration:number){
  const displacement=document.querySelector('[data-portal-displacement]'),start=performance.now();
  function frame(now:number){const t=Math.min((now-start)/duration,1);displacement?.setAttribute('scale',String(t*t*(3-2*t)*90));if(t<1)portalMeltFrame=requestAnimationFrame(frame);else portalMeltFrame=0;}
  portalMeltFrame=requestAnimationFrame(frame);
 }
 function startFilm(video:HTMLVideoElement,rate=1){
  const reset=()=>{if(video.readyState>=1)video.currentTime=0;video.playbackRate=rate;};
  if(video.readyState>=1)reset();else video.addEventListener('loadedmetadata',reset,{once:true,signal});
  void video.play().catch(()=>{});
 }
 async function enterProject(url:URL){
  if(entering)return;
  const nexus=url.pathname.endsWith('/work/nexus/'),mushrooms=url.pathname.endsWith('/work/poisonous-mushrooms/'),cosmos=url.pathname.endsWith('/work/infinite-cosmos/'),quake=url.pathname.endsWith('/work/earthquake/'),met=url.pathname.endsWith('/work/metamorphosis/'),skeleton=url.pathname.endsWith('/work/bone-series/');
  const current=skeleton?skeletonPortal:nexus?nexusPortal:mushrooms?mushroomsPortal:cosmos?cosmosPortal:quake?earthquakePortal:met?metPortal:url.pathname.endsWith('/work/dating-carnival/')?portal:null;
  const filmStart=mushrooms||cosmos||quake||met?4250:FILM_START_MS;
  if(!current||reduce.matches){location.assign(url.href);return;}
  entering=true;const start=performance.now();warmDestination(url,true);
  document.body.classList.add('is-project-departing');dispatchEvent(new Event('portfolio:portal-start'));dispatchEvent(new Event('portfolio:scene-pause'));
  // The supplied map plays at its original speed during the five-second entry.
  // Start behind the outgoing view, then dissolve into the already-decoded hero.
  if(mushrooms||cosmos||quake||met||skeleton){
   current.hidden=false;current.classList.add('is-open','is-opening');
   startFilm(current.querySelector<HTMLVideoElement>(skeleton?'[data-skeleton-transition]':met?'[data-metamorphosis-transition]':quake?'[data-earthquake-transition]':cosmos?'[data-cosmos-transition]':'[data-mushrooms-transition]')!);
  }
  const oldDialog=preview?.open?preview:null;
  if(oldDialog){oldDialog.classList.add('is-melting');oldDialog.inert=true;}
  const displacement=document.querySelector('[data-melt-displacement]');
  function melt(now:number){const t=Math.min((now-start)/DEPARTURE_MS,1);displacement?.setAttribute('scale',String(t*t*65));if(t<1)portalMeltFrame=requestAnimationFrame(melt);}
  portalMeltFrame=requestAnimationFrame(melt);
  await until(start,DEPARTURE_MS);
  if(oldDialog){oldDialog.close();oldDialog.classList.remove('is-melting');}
  if(!mushrooms&&!cosmos&&!quake&&!met&&!skeleton){current.hidden=false;current.classList.add('is-open','is-opening');}
  if(skeleton){
   const film=current.querySelector<HTMLVideoElement>('[data-skeleton-transition]')!;
   await until(start,TOTAL_MS);
   // Let a cold connection finish the actual five-second clip before fading into the still case.
   if(!film.ended&&!film.error&&film.currentTime<4.95){
    await new Promise<void>(resolve=>{
     const finish=()=>{clearTimeout(timer);film.removeEventListener('ended',finish);film.removeEventListener('error',finish);resolve();};
     const timer=setTimeout(finish,2200);film.addEventListener('ended',finish,{once:true});film.addEventListener('error',finish,{once:true});
    });
   }
   film.pause();
   const quality=film.getVideoPlaybackQuality();
   await handoffStillCase(url,current,()=>{document.body.dataset.entryDurationMs=String(Math.round(performance.now()-start));document.body.dataset.entryFilmSeconds=String(film.currentTime);document.body.dataset.entryFilmFrames=String(quality.totalVideoFrames);document.body.dataset.entryFilmDropped=String(quality.droppedVideoFrames);initializeProjectPortal();});
   return;
  }
  const hero=current.querySelector<HTMLVideoElement>(met?'[data-metamorphosis-handoff]':nexus?'[data-nexus-handoff]':mushrooms?'[data-mushrooms-handoff]':quake?'[data-earthquake-handoff]':cosmos?'[data-cosmos-handoff]':'[data-portal-film]')!;
  if(nexus){
   const scan=current.querySelector<HTMLVideoElement>('[data-nexus-transition]')!;
   const scanRate=()=>{if(Number.isFinite(scan.duration))scan.playbackRate=Math.min(3.5,Math.max(1,scan.duration/((FILM_START_MS-DEPARTURE_MS)/1000)));};
   scan.addEventListener('loadedmetadata',scanRate,{once:true,signal});scanRate();startFilm(scan,scan.playbackRate);
  }
  await until(start,filmStart);
  startFilm(hero);
  current.style.setProperty('--handoff-duration',`${Math.max(300,start+TOTAL_MS-performance.now())}ms`);
  current.classList.add(nexus||mushrooms||cosmos||quake||met?'is-handoff':'is-film');dissolve(TOTAL_MS-filmStart);
  await until(start,TOTAL_MS);
  current.querySelector<HTMLVideoElement>('[data-nexus-transition],[data-mushrooms-transition],[data-cosmos-transition],[data-earthquake-transition],[data-metamorphosis-transition]')?.pause();
  await handoffCase(url,hero,()=>{document.body.dataset.entryDurationMs=String(Math.round(performance.now()-start));initializeProjectPortal();});
 }
 document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const a=(event.target as HTMLElement).closest<HTMLAnchorElement>('[data-case-link],[data-reveal-link],[data-preview-image-link]');if(!a||a.target==='_blank')return;
  const url=new URL(a.href);if(url.origin!==location.origin||!['dating-carnival','nexus','poisonous-mushrooms','infinite-cosmos','earthquake','metamorphosis','bone-series'].some(slug=>url.pathname.endsWith('/work/'+slug+'/')))return;
  event.preventDefault();void enterProject(url);
 },{signal});
 addEventListener('portfolio:enter-project',event=>void enterProject(new URL((event as CustomEvent<string>).detail,location.origin)),{signal});
 addEventListener('keydown',event=>{if(entering&&(event.key==='Tab'||event.key==='Enter'))event.preventDefault();},{signal});
 function restore(){
  cancelAnimationFrame(portalMeltFrame);portalMeltFrame=0;entering=false;document.body.classList.remove('is-project-departing');
  for(const node of [portal,nexusPortal,mushroomsPortal,cosmosPortal,earthquakePortal,metPortal,skeletonPortal]){node?.classList.remove('is-open','is-opening','is-film','is-handoff');if(node)node.hidden=true;node?.querySelectorAll('video').forEach(video=>video.pause());}
  document.querySelector('[data-portal-displacement]')?.setAttribute('scale','0');document.querySelector('[data-melt-displacement]')?.setAttribute('scale','0');preview?.classList.remove('is-melting');if(preview)preview.inert=false;
 }
 addEventListener('pageshow',event=>{if(event.persisted){restore();dispatchEvent(new Event('portfolio:scene-resume'));}},{signal});
 disposePortal=()=>{events.abort();cancelAnimationFrame(portalMeltFrame);};
}
initializeProjectPortal();
