import { scenePixelRatio } from './render-budget';
import { measureRender } from './render-profile';
import { createStarLayers } from './cached-star-field';
// Keep the same silver field, density and parallax, with cached stars and fog.
export function createGalleryNebula(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { tint: (_: string) => {}, dispose: () => {} };
  const context = ctx, recordRender = measureRender(canvas);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let seed = 731;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({ length: 1900 }, (_, i) => {
    const r = Math.pow(random(), .73), angle = r * 9 + i % 3 * Math.PI * 2 / 3 + (random() - .5) * 1.2;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, r: .3 + random() * 1.1, a: .12 + random() * .54, phase: random() * 6.28 };
  });
  const distant = Array.from({ length: 210 }, () => ({ x: random(), y: random(), r: random() * .9 + .2, a: random() * .4 + .12 }));
  const clouds = document.createElement('canvas'); clouds.width = 1024; clouds.height = 640;
  const cloud = clouds.getContext('2d')!; cloud.globalCompositeOperation = 'screen';
  for (let i = 0; i < 105; i++) {
    const r = random(), angle = r * 8.3 + i % 3 * Math.PI * 2 / 3;
    const x = 512 + Math.cos(angle) * r * 455, y = 320 + Math.sin(angle) * r * 240;
    const radius = 30 + random() * 95, gradient = cloud.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, i % 3 === 0 ? 'rgba(104,112,130,.12)' : 'rgba(93,96,116,.09)');
    gradient.addColorStop(.45, 'rgba(74,79,98,.055)'); gradient.addColorStop(1, 'rgba(45,52,70,0)');
    cloud.fillStyle = gradient; cloud.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const tintTexture = (color: string) => {
    const layer = document.createElement('canvas'); layer.width = layer.height = 256;
    const brush = layer.getContext('2d')!, glow = brush.createRadialGradient(128,128,0,128,128,128);
    glow.addColorStop(0,`rgba(${color},.08)`); glow.addColorStop(.35,`rgba(${color},.035)`); glow.addColorStop(1,`rgba(${color},0)`);
    brush.fillStyle = glow; brush.fillRect(0,0,256,256); return layer;
  };
  let width = 0, height = 0, dpr = 1, frame = 0, alive = true, suspended = false, last = 0, time = 0;
  const pointer = [0,0], pointerTarget = [0,0];
  let field: ReturnType<typeof createStarLayers> | undefined, color = '160,169,185';
  let currentGlow = tintTexture(color), previousGlow = currentGlow, tintBlend = 1;
  function resize() {
    const box = canvas.getBoundingClientRect(), nextDpr = scenePixelRatio(box.width,box.height);
    if (width === box.width && height === box.height && dpr === nextDpr) return;
    width = box.width; height = box.height; dpr = nextDpr;
    canvas.width = Math.max(1,Math.round(width * dpr)); canvas.height = Math.max(1,Math.round(height * dpr));
    field = createStarLayers(stars,width,height,.64,.49,'201,210,227');
    canvas.dataset.starRendering = 'cached'; schedule();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const move = (event: PointerEvent) => { pointerTarget[0] = (event.clientX / innerWidth - .5) * 16; pointerTarget[1] = (event.clientY / innerHeight - .5) * 12; schedule(); };
  addEventListener('pointermove',move,{passive:true});
  function paint(now: number) {
    frame = 0;
    if (!alive || !canvas.isConnected || document.hidden || suspended || !field) return;
    if (last && now - last < 1000/30 - .5 && !reduced.matches) { schedule(); return; }
    const dt = last ? Math.min(.06,(now - last) / 1000) : 1/60; last = now;
    if (!reduced.matches) time += dt;
    const follow = 1 - Math.exp(-dt * 1.07);
    for (let i = 0; i < 2; i++) pointer[i] += (pointerTarget[i] - pointer[i]) * follow;
    tintBlend = reduced.matches ? 1 : Math.min(1,tintBlend + (1-tintBlend) * (1-Math.exp(-dt*1.23)));
    if (tintBlend > .995) { tintBlend = 1; previousGlow = currentGlow; }
    const renderStarted = performance.now();
    context.setTransform(dpr,0,0,dpr,0,0); context.globalCompositeOperation = 'source-over';
    context.fillStyle = '#080a0f'; context.fillRect(0,0,width,height);
    context.save(); context.translate(width * .57 + pointer[0],height * .49 + pointer[1]);
    context.rotate(-.22 + Math.sin(time * .025) * .035); context.globalCompositeOperation = 'screen'; context.globalAlpha = .88;
    context.drawImage(clouds,-width * .7,-height * .56,width * 1.4,height * 1.12);
    context.globalAlpha = .24; context.rotate(.16 + time * .003);
    context.drawImage(clouds,-width * .63,-height * .55,width * 1.26,height * 1.1);
    const glowSize = Math.max(width,height) * .76;
    if (tintBlend < 1) { context.globalAlpha = 1-tintBlend; context.drawImage(previousGlow,-glowSize/2,-glowSize/2,glowSize,glowSize); }
    context.globalAlpha = tintBlend; context.drawImage(currentGlow,-glowSize/2,-glowSize/2,glowSize,glowSize);
    context.rotate(time * .008);
    field.layers.forEach((layer,i) => {
      context.globalAlpha = .8 + .2 * Math.sin(time * .7 + i * Math.PI);
      context.drawImage(layer,-field!.width/2,-field!.height/2,field!.width,field!.height);
    });
    context.restore(); context.globalAlpha = 1;
    for (const star of distant) { context.fillStyle = `rgba(207,216,230,${star.a})`; context.fillRect(star.x * width + pointer[0] * .3,star.y * height + pointer[1] * .3,star.r,star.r); }
    recordRender(renderStarted);
    if (!reduced.matches || tintBlend < 1) schedule();
  }
  function schedule() { if (!frame && alive && !suspended && !document.hidden) frame = requestAnimationFrame(paint); }
  const pause = () => { suspended = true; cancelAnimationFrame(frame); frame = 0; };
  const resume = () => { suspended = false; last = 0; schedule(); };
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { last = 0; schedule(); } };
  document.addEventListener('visibilitychange',visibility); reduced.addEventListener('change',schedule);
  addEventListener('portfolio:scene-pause',pause); addEventListener('portfolio:scene-resume',resume);
  addEventListener('pagehide',pause); addEventListener('pageshow',resume);
  resize();
  return {
    tint(value: string) {
      const next = value.trim().split(/\s+/).join(','); if (next === color) return;
      const snapshot = document.createElement('canvas'); snapshot.width = snapshot.height = 256;
      const brush = snapshot.getContext('2d')!; brush.globalAlpha = 1-tintBlend; brush.drawImage(previousGlow,0,0); brush.globalAlpha = tintBlend; brush.drawImage(currentGlow,0,0);
      previousGlow = snapshot; currentGlow = tintTexture(next); color = next; tintBlend = 0; schedule();
    },
    dispose() {
      alive = false; cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('pointermove',move);
      document.removeEventListener('visibilitychange',visibility); reduced.removeEventListener('change',schedule);
      removeEventListener('portfolio:scene-pause',pause); removeEventListener('portfolio:scene-resume',resume); removeEventListener('pagehide',pause); removeEventListener('pageshow',resume); field = undefined;
    }
  };
}