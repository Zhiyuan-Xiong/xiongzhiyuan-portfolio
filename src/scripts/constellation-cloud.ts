import { measureRender } from './render-profile';
// Thin line halo: bake the path and four light phases, then cross-fade bitmaps.
export function createConstellationCloud(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return {select: (_:SVGSVGElement|undefined,__:string)=>{},resize:()=>{},dispose:()=>{}};
  const context = ctx, recordRender = measureRender(canvas), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const bleed = 16, size = 600 + bleed * 2, container = canvas.parentElement!;
  const halo = document.createElement('canvas'); halo.width = halo.height = size;
  let shape: SVGSVGElement | undefined, color = [160,169,185], lights: HTMLCanvasElement[] = [];
  let frame = 0, alive = true, suspended = false, last = 0, time = 0, started = 0, width = 0, height = 0, dpr = 1;
  const ease = (n:number) => n*n*(3-2*n);
  function prepare() {
    const brush = halo.getContext('2d')!; brush.clearRect(0,0,size,size); lights = [];
    if (!shape) return;
    const outline = new Path2D();
    for (const path of shape.querySelectorAll<SVGPathElement>('.constellation-illustration path')) outline.addPath(new Path2D(path.getAttribute('d')!));
    brush.save(); brush.translate(bleed,bleed); brush.lineCap = brush.lineJoin = 'round';
    brush.strokeStyle = `rgba(${color.join(',')},.18)`; brush.lineWidth = 1.65; brush.filter = 'blur(.8px)'; brush.stroke(outline); brush.restore();
    lights = Array.from({length:4},(_,i) => {
      const layer = document.createElement('canvas'); layer.width = layer.height = size;
      const light = layer.getContext('2d')!, centre = 300 + Math.sin(i * Math.PI/2) * 230;
      light.translate(bleed,bleed);
      const sweep = light.createLinearGradient(centre-300,0,centre+300,600);
      sweep.addColorStop(0,`rgba(${color.join(',')},.025)`); sweep.addColorStop(.5,`rgba(${color.join(',')},.09)`); sweep.addColorStop(1,`rgba(${color.join(',')},.025)`);
      light.strokeStyle = sweep; light.lineWidth = 1.1; light.lineJoin = light.lineCap = 'round'; light.filter = 'blur(.5px)'; light.stroke(outline);
      return layer;
    });
    canvas.dataset.cloudStyle = 'line-halo'; canvas.dataset.cloudRendering = 'cached';
  }
  function measure() {
    if (!shape) {
      cancelAnimationFrame(frame); frame = 0; width = height = 0;
      canvas.width = canvas.height = 1; canvas.style.visibility = 'hidden'; return;
    }
    const box = container.getBoundingClientRect(), rect = shape.getBoundingClientRect(), scale = rect.width / 600;
    width = height = size * scale; dpr = Math.min(devicePixelRatio,1.25);
    canvas.style.inset = 'auto'; canvas.style.left = `${rect.left-box.left-bleed*scale}px`; canvas.style.top = `${rect.top-box.top-bleed*scale}px`;
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; canvas.style.visibility = 'visible';
    const pixels = Math.max(1,Math.round(width*dpr));
    if (canvas.width !== pixels || canvas.height !== pixels) canvas.width = canvas.height = pixels;
    schedule();
  }
  function draw(now:number) {
    frame = 0; if (!alive || !shape || !canvas.isConnected || document.hidden || suspended) return;
    // Growth stays at display cadence; the very slow light needs only 30 updates/s.
    const growing = now-started < 2100;
    if (last && now-last < (growing ? 15 : 30) && !reduced.matches) { schedule(); return; }
    const dt = last ? Math.min(.08,(now-last)/1000) : 1/60; last = now; if (!reduced.matches) time += dt;
    const renderStarted = performance.now();
    context.setTransform(dpr,0,0,dpr,0,0); context.clearRect(0,0,width,height);
    const growth = reduced.matches ? 1 : ease(Math.min(1,Math.max(0,(now-started)/2100)));
    const alpha = growth * (.82 + .05*Math.sin(time*.23));
    context.globalCompositeOperation = 'screen'; context.globalAlpha = alpha;
    context.drawImage(halo,0,0,width,height);
    const phase = time*.21/(Math.PI/2), index = Math.floor(phase)%lights.length, blend = ease(phase%1);
    context.globalAlpha = alpha * (1-blend); context.drawImage(lights[index],0,0,width,height);
    context.globalAlpha = alpha * blend; context.drawImage(lights[(index+1)%lights.length],0,0,width,height);
    context.globalAlpha = 1; recordRender(renderStarted);
    if (!reduced.matches) schedule();
  }
  function schedule() { if (alive && shape && !suspended && !frame && !document.hidden) frame = requestAnimationFrame(draw); }
  const pause = () => { suspended = true; cancelAnimationFrame(frame); frame = 0; };
  const resume = () => { suspended = false; last = 0; measure(); };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { last = 0; schedule(); } };
  const observer = new ResizeObserver(measure); observer.observe(container);
  document.addEventListener('visibilitychange',visibility); reduced.addEventListener('change',schedule);
  addEventListener('portfolio:scene-pause',pause); addEventListener('portfolio:scene-resume',resume);
  addEventListener('pagehide',pause); addEventListener('pageshow',resume); measure();
  return {
    resize: measure,
    select(next: SVGSVGElement|undefined,tint:string) {
      shape = next; color = tint.trim().split(/\s+/).map(Number); started = performance.now(); time = 0; prepare(); measure();
    },
    dispose() {
      alive = false; cancelAnimationFrame(frame); observer.disconnect(); lights = [];
      document.removeEventListener('visibilitychange',visibility); reduced.removeEventListener('change',schedule);
      removeEventListener('portfolio:scene-pause',pause); removeEventListener('portfolio:scene-resume',resume); removeEventListener('pagehide',pause); removeEventListener('pageshow',resume);
    }
  };
}