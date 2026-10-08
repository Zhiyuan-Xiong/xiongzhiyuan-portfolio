import {createCosmosRenderer,loadCosmosBuffer,type CosmosRenderer,type RenderMode} from './cosmos-renderer';
let active:HTMLElement|null=null;
let disposeAll:(()=>void)|null=null;
export function initializeCosmosInteractions(){
 const article=document.querySelector<HTMLElement>('.restored-case.cosmos');
 if(article===active)return;
 disposeAll?.();active=article;if(!article)return;
 const cleanups:(()=>void)[]=[];
 for(const root of article.querySelectorAll<HTMLElement>('[data-cosmos-viewer]')){
  const canvas=root.querySelector<HTMLCanvasElement>('canvas')!,status=root.querySelector<HTMLElement>('[data-viewer-status]')!;
  const mode=root.dataset.cosmosViewer as RenderMode,zh=document.documentElement.lang.startsWith('zh'),abort=new AbortController();
  const say=(cn:string,en:string)=>{status.textContent=zh?cn:en;};
  let renderer:CosmosRenderer|null=null,loading=false,dead=false,visible=false,raf=0,last=0,dirty=true,suspended=false;
  const touches=new Map<number,{x:number;y:number}>();let pinch=0;
  const buttons=[...root.querySelectorAll<HTMLButtonElement>('[data-viewer-action]')];
  const sync=()=>{if(!renderer)return;root.dataset.frames=String(renderer.frames);root.dataset.explosions=String(renderer.explosions);root.dataset.yaw=renderer.yaw.toFixed(3);root.dataset.distance=renderer.distance.toFixed(3);for(const b of buttons){const action=b.dataset.viewerAction;const pressed=action==='auto'?renderer.auto:action==='pause'?renderer.paused:action==='jitter'?renderer.jitter:action==='points'?renderer.points:undefined;if(pressed!==undefined)b.setAttribute('aria-pressed',String(pressed));}};
  function frame(now:number){raf=0;if(dead||!renderer||!visible||suspended||document.hidden)return;if(!dirty&&last&&now-last<1000/60-.5){raf=requestAnimationFrame(frame);return;}const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
   const moving=!renderer.paused&&(mode==='particles'||renderer.auto);
   if(dirty||moving){renderer.draw(dt);dirty=false;if(renderer.frames%30===0||!moving)sync();}
   if(moving)raf=requestAnimationFrame(frame);
  }
  function render(){dirty=true;if(!raf&&renderer&&visible&&!suspended&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}}
  async function load(){if(dead||renderer||loading)return;loading=true;root.dataset.state='loading';say('正在加载交互场景…','Loading the interactive scene…');try{
   const bytes=await loadCosmosBuffer(root.dataset.source!);if(dead)return;
   renderer=createCosmosRenderer(canvas,mode,bytes);if(matchMedia('(prefers-reduced-motion: reduce)').matches){renderer.auto=false;renderer.paused=mode==='particles';}
   renderer.draw(0);root.dataset.state='ready';canvas.setAttribute('aria-busy','false');buttons.forEach(b=>b.disabled=false);say(mode==='mesh'?'模型已就绪':'交互已就绪',mode==='mesh'?'Model ready':'Interaction ready');sync();render();
  }catch(error){if(dead)return;root.dataset.state='error';canvas.setAttribute('aria-busy','false');say('当前设备暂时无法显示交互，可查看下方高清图与演示影片。','This device cannot display the interaction. Explore the images and demonstration below.');console.warn('Cosmos viewer:',error);}finally{loading=false;}}
  const preloader=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){void load();preloader.disconnect();}},{rootMargin:'240px'});preloader.observe(root);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)render();else{cancelAnimationFrame(raf);raf=0;last=0;}},{threshold:.02});observer.observe(canvas);
  const resize=new ResizeObserver(()=>{renderer?.resize();render();});resize.observe(canvas);
  addEventListener('portfolio:scene-pause',()=>{suspended=true;cancelAnimationFrame(raf);raf=0;last=0;},{signal:abort.signal});
  addEventListener('portfolio:scene-resume',()=>{suspended=false;render();},{signal:abort.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else render();},{signal:abort.signal});
  canvas.addEventListener('pointerdown',e=>{if(!renderer)return;canvas.focus({preventScroll:true});if(e.button===2&&mode==='particles'){const r=canvas.getBoundingClientRect();renderer.explode((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);say('烟花扩散后将逐渐回弹','The burst gradually returns to the original form');sync();render();return;}if(e.button!==0)return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(touches.size===2){const [a,b]=[...touches.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);}canvas.classList.add('is-dragging');},{signal:abort.signal});
  canvas.addEventListener('pointermove',e=>{const previous=touches.get(e.pointerId);if(!previous||!renderer)return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const [a,b]=[...touches.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinch>0&&distance>0)renderer.distance=Math.max(2.4,Math.min(10,renderer.distance*pinch/distance));pinch=distance;}else{renderer.yaw+=(e.clientX-previous.x)*.007;renderer.pitch=Math.max(-1.45,Math.min(1.45,renderer.pitch+(e.clientY-previous.y)*.007));}sync();render();},{signal:abort.signal});
  const release=(e:PointerEvent)=>{touches.delete(e.pointerId);pinch=0;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(!touches.size)canvas.classList.remove('is-dragging');};
  canvas.addEventListener('pointerup',release,{signal:abort.signal});canvas.addEventListener('pointercancel',release,{signal:abort.signal});
  canvas.addEventListener('contextmenu',e=>e.preventDefault(),{signal:abort.signal});
  canvas.addEventListener('wheel',e=>{if(!renderer)return;e.preventDefault();renderer.distance=Math.max(2.4,Math.min(10,renderer.distance*Math.exp(e.deltaY*.001)));sync();render();},{passive:false,signal:abort.signal});
  function action(name:string){if(!renderer)return;
   if(name==='zoom-in')renderer.distance=Math.max(2.4,renderer.distance*.83);
   if(name==='zoom-out')renderer.distance=Math.min(10,renderer.distance*1.2);
   if(name==='reset'){renderer.reset();say('已恢复初始视角','Initial view restored');}
   if(name==='auto')renderer.auto=!renderer.auto;
   if(name==='pause')renderer.paused=!renderer.paused;
   if(name==='jitter')renderer.jitter=!renderer.jitter;
   if(name==='points')renderer.points=!renderer.points;
   if(name==='explode'){renderer.explode();say('烟花扩散后将逐渐回弹','The burst gradually returns to the original form');}
   if(name==='fullscreen'){if(document.fullscreenElement===root)void document.exitFullscreen();else void root.requestFullscreen().catch(()=>{});}
   sync();render();
  }
  for(const b of buttons)b.addEventListener('click',()=>action(b.dataset.viewerAction!),{signal:abort.signal});
  canvas.addEventListener('keydown',e=>{if(!renderer)return;const key=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown','+','=','-','r','j',' '].includes(key))e.preventDefault();else return;
   if(key==='arrowleft')renderer.yaw-=.12;if(key==='arrowright')renderer.yaw+=.12;if(key==='arrowup')renderer.pitch=Math.max(-1.45,renderer.pitch-.12);if(key==='arrowdown')renderer.pitch=Math.min(1.45,renderer.pitch+.12);
   if(key==='+'||key==='=')action('zoom-in');if(key==='-')action('zoom-out');if(key==='r')action('reset');if(key==='j'&&mode==='particles')action('jitter');if(key===' ')action(mode==='particles'?'pause':'auto');sync();render();
  },{signal:abort.signal});
  canvas.addEventListener('webglcontextlost',()=>{if(dead)return;cancelAnimationFrame(raf);raf=0;root.dataset.state='error';buttons.forEach(b=>b.disabled=true);say('交互场景已暂停，可刷新页面重新载入。','The interactive scene is unavailable. Reload to restore it.');},{signal:abort.signal});
  cleanups.push(()=>{dead=true;abort.abort();cancelAnimationFrame(raf);observer.disconnect();preloader.disconnect();resize.disconnect();renderer?.dispose();});
 }
 disposeAll=()=>{cleanups.forEach(fn=>fn());disposeAll=null;active=null;};
}
addEventListener('portfolio:page-leave',()=>disposeAll?.());

