import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
// Exercise real renderers with a deterministic clock and counted canvas calls.
const events = new EventTarget(), documentEvents = new EventTarget(), callbacks = new Map();
let clock = 0, nextFrame = 0;
const observers = [];
class Canvas extends EventTarget {
  constructor() {
    super(); this.width=300; this.height=150; this.dataset={}; this.style={}; this.isConnected=true;
    this.box={left:0,top:0,width:1280,height:800}; this.parentElement={getBoundingClientRect:()=>this.box};
    const counts=this.counts={arcs:0,strokes:0,images:0,gradients:0,clears:0};
    this.ctx={canvas:this,setTransform(){},save(){},restore(){},translate(){},rotate(){},scale(){},beginPath(){},fill(){},fillRect(){},moveTo(){},lineTo(){},arc(){counts.arcs++;},stroke(){counts.strokes++;},drawImage(){counts.images++;},clearRect(){counts.clears++;},createRadialGradient(){counts.gradients++;return {addColorStop(){}};},createLinearGradient(){counts.gradients++;return {addColorStop(){}};}};
  }
  getContext(){return this.ctx;}
  getBoundingClientRect(){return this.box;}
}
const document={hidden:false,createElement:()=>new Canvas(),addEventListener:documentEvents.addEventListener.bind(documentEvents),removeEventListener:documentEvents.removeEventListener.bind(documentEvents)};
const media=Object.assign(new EventTarget(),{matches:false});
const sandbox={console,Math,URL,document,location:{href:'https://example.test/zh/works/'},devicePixelRatio:2,innerWidth:1280,innerHeight:800,performance:{now:()=>clock},matchMedia:()=>media,
  addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),
  requestAnimationFrame:callback=>{const id=++nextFrame;callbacks.set(id,callback);return id;},cancelAnimationFrame:id=>callbacks.delete(id),
  ResizeObserver:class {constructor(callback){this.callback=callback;observers.push(this);}observe(){}disconnect(){}},Path2D:class {addPath(){}}};
const modules=new Map();
function load(name){
  if(modules.has(name))return modules.get(name);
  const module={exports:{}};modules.set(name,module.exports);
  const source=fs.readFileSync(path.resolve('src/scripts',name+'.ts'),'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(js,{...sandbox,exports:module.exports,module,require:dependency=>load(dependency.replace('./',''))},{filename:name+'.js'});
  return module.exports;
}
function advance(frames=1){for(let i=0;i<frames;i++){clock+=1000/60;const pending=[...callbacks];callbacks.clear();for(const [,callback] of pending)callback(clock);}}
function dispatch(name){events.dispatchEvent(new Event(name));}
const sky=new Canvas(), nebula=load('gallery-nebula').createGalleryNebula(sky);
advance(60);
assert(sky.counts.images<=31*5,'Ambient sky must draw at most 31 frames per second');
assert.equal(sky.counts.arcs,0,'Running nebula must reuse stars, not rebuild paths');
assert.equal(sky.counts.gradients,0,'Running nebula must reuse tint gradients');
assert(sky.counts.images>0); const beforePause=sky.counts.images;
dispatch('portfolio:scene-pause');advance(60);assert.equal(sky.counts.images,beforePause,'Covered scene must stop rendering');
dispatch('portfolio:scene-resume');advance(2);assert(sky.counts.images>beforePause,'Closing overlay must resume animation');
document.hidden=true;documentEvents.dispatchEvent(new Event('visibilitychange'));assert.equal(callbacks.size,0);
document.hidden=false;documentEvents.dispatchEvent(new Event('visibilitychange'));advance(2);assert(callbacks.size>0);
nebula.dispose();assert.equal(callbacks.size,0);
const layer=new Canvas(), cloud=load('constellation-cloud').createConstellationCloud(layer);
assert.equal(callbacks.size,0,'Unselected constellation must have no idle animation loop');
const shape={querySelectorAll:()=>[{getAttribute:()=> 'M100 100 L300 200'}],getBoundingClientRect:()=>({left:300,top:120,width:400,height:400})};
cloud.select(shape,'160 169 185');advance(160);
assert.equal(layer.counts.strokes,0,'Moving glow must reuse the cached outline');
assert.equal(layer.counts.gradients,0,'Moving glow must reuse the cached light phases');
assert(layer.width*layer.height<1280*800,'Glow must rasterise only its local bounds');
const lightBeforePause=layer.counts.images;dispatch('pagehide');advance(60);assert.equal(layer.counts.images,lightBeforePause);
dispatch('pageshow');advance(2);assert(layer.counts.images>lightBeforePause,'History return must resume selected glow');
cloud.select(undefined,'160 169 185');assert.equal(callbacks.size,0);assert.equal(layer.width,1);
cloud.select(shape,'160 169 185');advance(2);cloud.dispose();assert.equal(callbacks.size,0);
console.log('Cached renderers stop under overlays and hidden tabs, resume on return, and perform no per-frame star/path/gradient rasterisation.');