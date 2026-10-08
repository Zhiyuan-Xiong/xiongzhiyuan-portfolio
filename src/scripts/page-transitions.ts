import { scenePixelRatio } from './render-budget';
import { createStarLayers } from './cached-star-field';
type Journey = { to: string; started: number; x: number; y: number };
const KEY='euan:page-journey-v1';
const prefetched=new Map<string,Promise<void>>();
const route=/^\/(?:zh|en)\/(?:$|(?:explore|works|about)\/?$|work\/[^/]+\/?$|sections\/[^/]+\/?$)/;
const smooth=(a:number,b:number,value:number)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);};
let stopTransitions=()=>{};
function pendingJourney():Journey|null{
  try{const trip=JSON.parse(sessionStorage.getItem(KEY)??'null') as Journey|null;if(trip&&Date.now()-trip.started<15000&&new URL(trip.to,location.origin).origin===location.origin)return trip;}catch{}
  return null;
}
function warmPage(url:URL):Promise<void>{
  const key=url.pathname+url.search;if(prefetched.has(key))return prefetched.get(key)!;
  const promise=(async()=>{try{
    const response=await fetch(key,{credentials:'same-origin'});if(!response.ok)return;
    const next=new DOMParser().parseFromString(await response.text(),'text/html');
    for(const source of next.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')){
      const href=new URL(source.getAttribute('href')!,url).href;
      if(document.querySelector(`link[href="${href}"]`))continue;
      const preload=document.createElement('link');preload.rel='prefetch';preload.as='style';preload.href=href;document.head.append(preload);
    }
    const sources=[...next.querySelectorAll<HTMLImageElement>('img[loading=eager]')].slice(0,4).map(image=>image.getAttribute('src')!);
    const space=next.querySelector<HTMLElement>('[data-portfolio-space]');
    if(space){
      const atlas=JSON.parse(space.dataset.atlas??'[]') as {src:string}[];sources.push(...atlas.map(image=>image.src));
      const planets=JSON.parse(space.dataset.scene??'[]') as {cover:string|null}[];sources.push(...planets.filter(p=>p.cover).map(p=>`/images/${p.cover}-640.webp`));
    }
    for(const src of new Set(sources)){const image=new Image();image.decoding='async';image.src=new URL(src,url).href;}
  }catch{}})();prefetched.set(key,promise);return promise;
}
export function initializePageTransitions(){
  stopTransitions();
  const canvas=document.querySelector<HTMLCanvasElement>('[data-page-nebula]');if(!canvas)return;
  const html=document.documentElement,events=new AbortController(),signal=events.signal,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const context=canvas.getContext('2d');let trip:Journey|null=null,frame=0,alive=true,navigating=false,revealing=0,last=0;
  let width=0,height=0,dpr=1,arrivalTimer=0,resetTimer=0;
  let seed=1827;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const stars=Array.from({length:1100},(_,i)=>{const r=Math.pow(random(),.68),angle=r*8.5+(i%3)*Math.PI*2/3+(random()-.5)*1.15;return{x:Math.cos(angle)*r,y:Math.sin(angle)*r,size:.35+random()*.9,a:.16+random()*.52,phase:random()*6.28};});
  const texture=document.createElement('canvas');texture.width=768;texture.height=512;
  const brush=texture.getContext('2d')!;brush.globalCompositeOperation='screen';
  for(let i=0;i<90;i++){const r=random(),angle=r*8.4+i%3*Math.PI*2/3,x=384+Math.cos(angle)*r*345,y=256+Math.sin(angle)*r*200,radius=30+random()*75;
    const fog=brush.createRadialGradient(x,y,0,x,y,radius);fog.addColorStop(0,'rgba(115,121,139,.19)');fog.addColorStop(.5,'rgba(68,76,97,.06)');fog.addColorStop(1,'rgba(45,51,72,0)');brush.fillStyle=fog;brush.fillRect(x-radius,y-radius,radius*2,radius*2);}
  let field:ReturnType<typeof createStarLayers>|undefined, trails:HTMLCanvasElement|undefined;
  function resize(){
    const nextDpr=scenePixelRatio(innerWidth,innerHeight,1.3);
    if(field&&width===innerWidth&&height===innerHeight&&dpr===nextDpr)return;
    width=innerWidth;height=innerHeight;dpr=nextDpr;canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);
    field=createStarLayers(stars.map(star=>({...star,r:star.size})),width,height,.69,.55,'211,220,239');
    trails=document.createElement('canvas');trails.width=field.layers[0].width;trails.height=field.layers[0].height;
    const ink=trails.getContext('2d')!,ratio=trails.width/field.width;
    ink.setTransform(ratio,0,0,ratio,trails.width/2,trails.height/2);ink.lineWidth=.65;
    for(const star of stars){const x=star.x*width*.69,y=star.y*height*.55;ink.strokeStyle=`rgba(207,218,237,${star.a*.31})`;ink.beginPath();ink.moveTo(x*.983,y*.983);ink.lineTo(x,y);ink.stroke();}
    canvas!.dataset.starRendering='cached';
  }
  function paint(now:number){
    frame=0;if(!alive||!trip||!context)return;
    if(last&&now-last<15){frame=requestAnimationFrame(paint);return;}last=now;
    const elapsed=(Date.now()-trip.started)/1000,spread=smooth(0,1.8,elapsed),departure=smooth(.04,.48,elapsed);
    const fade=revealing?1-smooth(0,.85,(now-revealing)/1000):1;
    const outgoing=html.dataset.navPhase==='departing';canvas!.style.opacity=String(fade*(outgoing?departure:1));
    context.setTransform(dpr,0,0,dpr,0,0);context.globalCompositeOperation='source-over';context.fillStyle='#080a10';context.fillRect(0,0,width,height);
    const cx=width*(trip.x+(0.5-trip.x)*spread*.3),cy=height*(trip.y+(0.5-trip.y)*spread*.3),zoom=1+spread*.95;
    context.save();context.translate(cx,cy);context.rotate(-.2+elapsed*.025);context.globalCompositeOperation='screen';
    context.globalAlpha=.85;context.drawImage(texture,-width*.68*zoom,-height*.56*zoom,width*1.36*zoom,height*1.12*zoom);
    context.globalAlpha=.32;context.rotate(.19);context.drawImage(texture,-width*.6*zoom,-height*.55*zoom,width*1.2*zoom,height*1.1*zoom);context.globalAlpha=1;
    if(field&&trails){
      context.rotate(elapsed*.025);
      const stretch=1+spread*.8,w=field.width*stretch,h=field.height*stretch;
      context.globalAlpha=spread;context.drawImage(trails,-w/2,-h/2,w,h);
      field.layers.forEach((layer,i)=>{context.globalAlpha=.82+.18*Math.sin(elapsed+i*Math.PI);context.drawImage(layer,-w/2,-h/2,w,h);});
      context.globalAlpha=1;
    }
    context.restore();
    if(revealing&&fade<.005){restore();return;}frame=requestAnimationFrame(paint);
  }
  function run(){if(context&&!frame){last=0;frame=requestAnimationFrame(paint);}}
  function restore(){clearTimeout(arrivalTimer);clearTimeout(resetTimer);cancelAnimationFrame(frame);frame=0;trip=null;navigating=false;revealing=0;html.dataset.navPhase='idle';document.body.inert=false;canvas!.style.opacity='0';dispatchEvent(new Event('portfolio:scene-resume'));}
  function reveal(){if(!alive)return;html.dataset.navPhase='revealing';revealing=performance.now();document.body.inert=false;run();if(!context)arrivalTimer=window.setTimeout(restore,850);}
  function arrive(next:Journey){
    trip=next;navigating=true;html.dataset.navPhase='arriving';html.style.setProperty('--nav-origin',`${next.x*100}% ${next.y*100}%`);document.body.inert=true;canvas!.style.opacity='1';resize();run();
    try{sessionStorage.removeItem(KEY);}catch{}
    const started=performance.now();
    const waitForScene=()=>{if(!alive)return;const space=document.querySelector<HTMLElement>('[data-portfolio-space]');const ready=!space||space.dataset.ready==='true'||space.dataset.rendering==='fallback';
      if((ready&&performance.now()-started>160)||performance.now()-started>2600){reveal();arrivalTimer=window.setTimeout(()=>{if(location.hash){document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant'});}else document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});},850);}
      else arrivalTimer=window.setTimeout(waitForScene,50);
    };waitForScene();
  }
  function destination(event:Event):HTMLAnchorElement|null{
    const target=event.target as HTMLElement;const link=target.closest<HTMLAnchorElement>('a[href]');if(!link||link.target==='_blank'||link.hasAttribute('download')||link.rel.split(' ').includes('external'))return null;
    const url=new URL(link.href,location.href);if(url.origin!==location.origin||!route.test(url.pathname)||url.pathname===location.pathname&&url.search===location.search)return null;
    // Their dedicated five-second film handoffs remain authoritative.
    if(link.matches('[data-case-link],[data-reveal-link],[data-preview-image-link]')&&/\/work\/(dating-carnival|nexus|poisonous-mushrooms|infinite-cosmos|earthquake|metamorphosis|bone-series)\/$/.test(url.pathname))return null;
    return link;
  }
  document.addEventListener('pointerover',event=>{const link=destination(event);if(link&&!reduced.matches)void warmPage(new URL(link.href));},{signal,passive:true});
  document.addEventListener('focusin',event=>{const link=destination(event);if(link&&!reduced.matches)void warmPage(new URL(link.href));},{signal});
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced.matches)return;
    const link=destination(event);if(!link)return;event.preventDefault();if(navigating)return;
    const url=new URL(link.href),origin=link.matches('[data-space-index-star]')?link.getBoundingClientRect():null;
    const x=origin?Math.max(.12,Math.min(.88,(origin.left+origin.width/2)/innerWidth)):.55,y=origin?Math.max(.15,Math.min(.85,(origin.top+origin.height/2)/innerHeight)):.5;
    trip={to:url.href,started:Date.now(),x,y};navigating=true;revealing=0;html.dataset.navPhase='departing';html.style.setProperty('--nav-origin',`${x*100}% ${y*100}%`);document.body.inert=true;
    const dialog=document.querySelector<HTMLDialogElement>('dialog[open]');dialog?.close();
    try{sessionStorage.setItem(KEY,JSON.stringify(trip));}catch{}
    resize();run();dispatchEvent(new Event('portfolio:scene-pause'));
    void Promise.all([new Promise(resolve=>setTimeout(resolve,620)),Promise.race([warmPage(url),new Promise(resolve=>setTimeout(resolve,850))])]).then(()=>{if(alive){location.assign(url.href);resetTimer=window.setTimeout(restore,6000);}});
  },{signal});
  addEventListener('resize',()=>{if(trip)resize();},{signal});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;},{signal});
  addEventListener('pageshow',event=>{if(event.persisted)restore();},{signal});
  const incoming=pendingJourney();
  if(incoming&&new URL(incoming.to).pathname===location.pathname&&!reduced.matches)arrive(incoming);else{html.dataset.navPhase='idle';canvas.style.opacity='0';}
  stopTransitions=()=>{alive=false;events.abort();clearTimeout(arrivalTimer);clearTimeout(resetTimer);cancelAnimationFrame(frame);document.body.inert=false;};
}
