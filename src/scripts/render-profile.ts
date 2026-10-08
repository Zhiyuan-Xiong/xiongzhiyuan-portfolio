// Opt-in local diagnostics; ordinary visits do not run this sampler.
export function measureRender(target: HTMLElement) {
  const enabled = new URL(location.href).searchParams.get('profile') === '1';
  let samples: number[] = [], previous = performance.now();
  return (started: number) => {
    if (!enabled) return;
    const now = performance.now(); samples.push(now - started);
    if (now - previous < 1000) return;
    const sorted = samples.slice().sort((a, b) => a - b);
    target.dataset.renderProfile = JSON.stringify({ draws: samples.length, meanMs: +(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2), p95Ms: +sorted[Math.floor((sorted.length - 1) * .95)].toFixed(2) });
    samples = []; previous = now;
  };
}
export function initializeFrameProfile() {
  if (new URL(location.href).searchParams.get('profile') !== '1') return;
  let frame = 0, previous = 0, samples: number[] = [], tasks = 0, taskMs = 0;
  const started = performance.now(), events = new AbortController();
  let observer: PerformanceObserver | undefined;
  if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
    observer = new PerformanceObserver(list => { if (performance.now() - started > 2000) for (const entry of list.getEntries()) { tasks++; taskMs += entry.duration; } });
    observer.observe({type:'longtask', buffered:false});
  }
  function tick(now: number) {
    if (previous && now - started > 2000) samples.push(now - previous);
    previous = now;
    if (samples.length >= 180) {
      const sorted = samples.slice().sort((a, b) => a - b);
      document.documentElement.dataset.frameProfile = JSON.stringify({frames:samples.length,fps:+(1000 * samples.length / samples.reduce((a,b)=>a+b,0)).toFixed(1),p95Ms:+sorted[Math.floor((sorted.length-1)*.95)].toFixed(1),longTasks:tasks,longTaskMs:+taskMs.toFixed(1)});
      samples = []; tasks = taskMs = 0;
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  const stop = () => { cancelAnimationFrame(frame); observer?.disconnect(); events.abort(); };
  addEventListener('portfolio:page-leave', stop, {signal:events.signal});
  addEventListener('pagehide', stop, {signal:events.signal});
}