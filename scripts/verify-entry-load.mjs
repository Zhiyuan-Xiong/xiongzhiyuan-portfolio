import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Run the production renderer with delayed image/network decoding. It must not
// resolve an entry renderer while the image shells would still be empty.
const source = fs.readFileSync('src/scripts/portfolio-space.ts', 'utf8');
const rendererSource = source.slice(0, source.indexOf('\nif(root){')) + '\nexport { createRenderer };';
const js = ts.transpileModule(rendererSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const atlas = JSON.parse(fs.readFileSync('src/data/entry-atlas.json', 'utf8'));
const keys = JSON.parse(fs.readFileSync('src/data/planet-images.json', 'utf8'));
let requested = [], uploads = [], draws = 0, sequence = 0;
const root = { dataset: { mode: 'intro' } };
const gl = new Proxy({
  createShader: () => ++sequence, createProgram: () => ++sequence, createBuffer: () => ++sequence, createTexture: () => ++sequence,
  getShaderParameter: () => true, getProgramParameter: () => true,
  getUniformLocation: () => ++sequence, getAttribLocation: () => 0,
  texImage2D: (...args) => uploads.push(args.at(-1)), drawArrays: () => draws++, getExtension: () => null,
}, { get: (target, name) => name in target ? target[name] : /^[A-Z_]+$/.test(name) ? 1 : () => {} });
class DelayedImage {
  constructor() { this.decodePromise = new Promise(resolve => { this.finishDecode = resolve; }); }
  set src(value) { this.url = value; requested.push(this); }
  decode() { return this.decodePromise; }
}
const formationModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/scripts/explore-formation.ts', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, { module: formationModule, exports: formationModule.exports, Math });
const module = { exports: {} };
vm.runInNewContext(js, {
  module, exports: module.exports, console, Math, Float32Array,
  require: name => name === './render-budget' ? { scenePixelRatio: () => 1 }
    : name === './stellar-core' ? { stellarCoreShaders: () => ['vertex', 'fragment'] }
    : name === './explore-formation' ? formationModule.exports
    : name === '../data/entry-atlas.json' ? { default: atlas } : assert.fail(name),
  document: { querySelector: () => root, createElement: () => ({ getContext: () => ({ fillRect() {} }) }) },
  Image: DelayedImage, matchMedia: () => ({ matches: false }),
  ResizeObserver: class { observe() {} disconnect() {} },
});
const canvas = { clientWidth: 1280, clientHeight: 720, width: 0, height: 0, getContext: () => gl, addEventListener() {} };
const nodes = [{ slug: 'stigma', cover: 'stigma-cover', orbit: 12, phase: 0, speed: 1, radius: .5, color: [.5,.5,.5] }];
nodes[0].entry = formationModule.exports.formationSlots(nodes)[0];
let resolved = false;
const pending = module.exports.createRenderer(canvas, nodes, keys).then(renderer => { resolved = true; return renderer; });
await Promise.resolve();
assert.equal(requested.length, 1, 'Entry should load one atlas, without competing planet covers');
assert.equal(requested[0].url, atlas.src);
assert.equal(resolved, false, 'Slow network must not reveal empty shells');
assert.equal(draws, 0);
requested[0].onload(); await Promise.resolve();
assert.equal(resolved, false, 'Image load alone must not reveal an undecoded image');
requested[0].finishDecode();
const renderer = await pending;
assert.equal(root.dataset.atlasLoaded, String(keys.length));
assert.equal(uploads.filter(image => image instanceof DelayedImage).length, 1, 'All entry tiles must upload together');
renderer.draw({ time: 0, progress: 0, formation: 1, yaw: -.31, pitch: .23, pointer: [0,0], camera: {x:0,y:0,z:5}, selected: -1, focus: -1, activated: -1, activation: 0, indexActivation: 0, reveal: 0, rect: [0,0,.5,.5], pointSize: 4 });
assert(draws > 0, 'The ready renderer must draw a complete first frame');
assert.equal(requested.length, 1, 'Idle entry must not fetch unused project covers');
requested = []; root.dataset.mode = 'intro';
const failed = module.exports.createRenderer(canvas, nodes, keys);
requested[0].onerror();
await assert.rejects(failed, /Entry atlas could not load/, 'An unavailable atlas must use the explicit fallback');
console.log('Entry waits for network and decoding, uploads all tiles together, and never presents incomplete shells.');
