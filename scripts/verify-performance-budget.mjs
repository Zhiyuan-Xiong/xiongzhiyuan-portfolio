import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(name, globals) {
  const module = { exports: {} };
  const source = fs.readFileSync(`src/scripts/${name}.ts`, 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(js, { console, URL, AbortController, Event, Math, ...globals, module, exports: module.exports }, { filename: name });
  return module.exports;
}
const events = new EventTarget(), documentEvents = new EventTarget(), observers = [];
class Film extends EventTarget {
  constructor(automatic, top, paused = true) { super(); this.automatic = automatic; this.top = top; this.paused = paused; this.plays = 0; this.loads = 0; this.currentTime = 2.74; }
  getBoundingClientRect() { return { top: this.top, bottom: this.top + 400 }; }
  hasAttribute() { return !this.automatic; }
  matches() { return false; }
  querySelector() { return null; }
  play() { this.paused = false; this.plays++; this.dispatchEvent(new Event('play')); return Promise.resolve(); }
  pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
  load() { this.loads++; }
}
const hero = new Film(true, 0, false), inline = new Film(true, 1400), manual = new Film(false, 400);
const main = { querySelector: () => null, querySelectorAll: () => [hero, inline, manual] };
const document = { hidden: false, querySelector: () => main, body: { dataset: {} }, addEventListener: documentEvents.addEventListener.bind(documentEvents) };
load('dating-festival', { document, innerHeight: 720, addEventListener: events.addEventListener.bind(events), IntersectionObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } } });
const seen = (film, visible) => observers[0].callback([{ target: film, isIntersecting: visible }]);
assert.equal(hero.plays, 0, 'Already-playing portal hero must not restart');
assert.equal(hero.currentTime, 2.74); assert.equal(hero.loads, 0);
assert(inline.paused, 'Offscreen film must remain idle');
seen(hero, false); assert(hero.paused, 'Hero must pause after scroll');
seen(inline, true); assert(!inline.paused, 'Inline film must start on screen');
manual.play(); seen(manual, false); assert(manual.paused); seen(manual, true); assert(!manual.paused, 'User-started film must resume after returning');
manual.pause(); events.dispatchEvent(new Event('portfolio:scene-pause')); events.dispatchEvent(new Event('portfolio:scene-resume')); assert(manual.paused, 'Overlay close must preserve explicit user pause');
events.dispatchEvent(new Event('portfolio:scene-pause')); assert(inline.paused);
events.dispatchEvent(new Event('portfolio:scene-resume')); assert(!inline.paused);
document.hidden = true; documentEvents.dispatchEvent(new Event('visibilitychange')); assert(inline.paused);
document.hidden = false; documentEvents.dispatchEvent(new Event('visibilitychange')); assert(!inline.paused);
events.dispatchEvent(new Event('portfolio:page-leave')); assert(inline.paused); assert(observers[0].disconnected);

// Exercise the real particle renderer: driver lookups stabilise and unchanged model buffers stay on the GPU.
let uploads = 0, uniforms = 0, attributes = 0, handle = 0;
const constants = new Map();
const methods = { createProgram: () => ++handle, createShader: () => ++handle, createBuffer: () => ++handle, getShaderParameter: () => true, getProgramParameter: () => true,
  getUniformLocation: () => { uniforms++; return ++handle; }, getAttribLocation: () => { attributes++; return 1; }, bufferSubData: () => uploads++, getExtension: () => null };
const gl = new Proxy(methods, { get(object, name) { if (name in object) return object[name]; if (/^[A-Z_]+$/.test(name)) { if (!constants.has(name)) constants.set(name, ++handle); return constants.get(name); } return () => {}; } });
const canvas = { width: 0, height: 0, clientWidth: 800, getContext: () => gl, getBoundingClientRect: () => ({ width: 800, height: 500 }) };
const { createCosmosRenderer } = load('cosmos-renderer', { devicePixelRatio: 2 });
const points = new Float32Array(300); for (let i = 0; i < points.length; i++) points[i] = Math.sin(i) * .8;
const renderer = createCosmosRenderer(canvas, 'particles', points.buffer);
renderer.draw(0); const uniformCount = uniforms, attributeCount = attributes;
uploads = 0; for (let i = 0; i < 60; i++) renderer.draw(1 / 60);
assert.equal(uploads, 120, 'Idle model must upload only two moving trail buffers per frame');
assert.equal(uniforms, uniformCount, 'Uniform locations must be cached'); assert.equal(attributes, attributeCount, 'Attribute locations must be cached');
renderer.explode(); uploads = 0; renderer.draw(1 / 60); assert.equal(uploads, 4, 'Burst must update trails, positions and colour');
renderer.paused = true; uploads = 0; renderer.draw(0); assert.equal(uploads, 0, 'Paused interaction must upload nothing');
renderer.reset(); renderer.draw(0); assert.equal(uploads, 4, 'Reset must restore original geometry and trails');
renderer.dispose();
const { scenePixelRatio } = load('render-budget', { devicePixelRatio: 2 });
assert(3840 * 2160 * scenePixelRatio(3840, 2160) ** 2 <= 2_800_001);
assert.equal(scenePixelRatio(1280, 720), 1.4);
console.log('Media visibility, portal continuity, explicit pause, GPU buffer reuse, and 4K pixel budget verified.');
