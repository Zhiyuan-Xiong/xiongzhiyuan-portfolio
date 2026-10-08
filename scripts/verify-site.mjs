import fs from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
const root=path.resolve('dist');
async function list(dir){const entries=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?list(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const files=await list(root);
const pages=files.filter(f=>f.endsWith('.html'));
let checked=0;
const failures=[];
const cache=new Map();
async function html(file){if(!cache.has(file))cache.set(file,await fs.readFile(file,'utf8'));return cache.get(file);}
for(const file of pages){
  const source=await html(file);
  const route='/'+path.relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');
  if(!source.includes('<html lang='))failures.push(`Missing language: ${route}`);
  for(const match of source.matchAll(/(?:href|src)="([^"]+)"/g)){
    const value=match[1].replaceAll('&amp;','&');
    if(/^(https?:|mailto:|tel:|data:)/.test(value))continue;
    const url=new URL(value,'https://portfolio.example'+route);
    let target=path.join(root,decodeURIComponent(url.pathname));
    if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
    try{await fs.access(target);checked++;}catch{failures.push(`${route}: missing ${value}`);continue;}
    if(url.hash&&target.endsWith('.html')){const id=decodeURIComponent(url.hash.slice(1));const page=await html(target);if(!page.includes(`id="${id}"`))failures.push(`${route}: missing anchor ${value}`);}
  }
  if(/figma\.com\/api\/mcp\/asset|\.cache\/|incoming\//.test(source))failures.push(`Source-only material in ${route}`);
}
for(const locale of ['zh','en'])for(const slug of ['stigma','dating-carnival','poisonous-mushrooms','alilaguna','nexus','bone-series','post-digital-species','sonic-elasticity','infinite-cosmos','earthquake','metamorphosis']){
  const caseFile=path.join(root,locale,'work',slug,'index.html');
  try{const source=await html(caseFile);if(!source.includes('case-toc')||!(source.includes('project-facts')||source.includes('restored-facts')||source.includes('festival-facts')))failures.push(`Incomplete case ${locale}/${slug}`);}catch{failures.push(`Missing case ${locale}/${slug}`);}
}
for(const slug of ['fandazi'])if(files.some(f=>f.includes(path.join('work',slug))))failures.push(`Draft has a public case: ${slug}`);
for(const locale of ['zh','en']){
 const sonic=await html(path.join(root,locale,'work','sonic-elasticity','index.html'));
 for(const id of ['prediction','research','experiments','iterations','interaction','construction','mechanism','sound-programming','experience'])if(!sonic.includes('id="'+id+'"'))failures.push('Missing Sonic chapter '+locale+'/'+id);
 if(/25056153|25130102|25166149|25097154|@ucl\.ac\.uk/.test(sonic))failures.push('Submission metadata in public Sonic page');
 if(!sonic.includes('installation-film.mp4'))failures.push('Missing local Sonic film');
 for(const page of ['works','explore'])if(!(await html(path.join(root,locale,page,'index.html'))).includes('sonic-elasticity'))failures.push('Missing Sonic in '+locale+'/'+page);
}
for(const locale of ['zh','en']){
 const cosmos=await html(path.join(root,locale,'work','infinite-cosmos','index.html'));
 for(const id of ['concept','parametric','hybrid-space','particle-interaction','generative-workflow','multiverse'])if(!cosmos.includes('id="'+id+'"'))failures.push('Missing Cosmos chapter '+locale+'/'+id);
 for(const mode of ['mesh','particles'])if(!cosmos.includes('data-cosmos-viewer="'+mode+'"'))failures.push('Missing interactive Cosmos viewer '+mode);
 for(const asset of ['hero.mp4','processing-demo.mp4','processing-code.webp','processing-states.webp','multiverse-grid.webp','comfy-image-workflow.webp','comfy-video-workflow.webp'])if(!cosmos.includes(asset))failures.push('Missing Cosmos media '+asset);
 for(const page of ['works','explore'])if(!(await html(path.join(root,locale,page,'index.html'))).includes('infinite-cosmos'))failures.push('Missing Cosmos in '+locale+'/'+page);
}
// Preserve the complete earthquake case and the source-derived numerical export.
for(const locale of ['zh','en']){
 const quake=await html(path.join(root,locale,'work','earthquake','index.html'));
 for(const id of ['data-workflow','image-analysis','text-analysis','fusion-analysis','design-mapping','spatial-generation','realtime'])if(!quake.includes('id="'+id+'"'))failures.push('Missing Earthquake chapter '+locale+'/'+id);
 for(const asset of ['hero.mp4','processing-demo.mp4','processing-sequence.webp','design-samples.csv'])if(!quake.includes(asset))failures.push('Missing Earthquake media '+asset);
 if(!quake.includes('data-quake-explorer')||[...quake.matchAll(/data-quake-point="/g)].length!==240)failures.push('Incomplete Earthquake sample explorer '+locale);
 if(/API_KEY|apiKey|25056153|25130102|25166149|25097154|\.ipynb/.test(quake))failures.push('Source-only metadata in public Earthquake case');
 for(const page of ['works','explore'])if(!(await html(path.join(root,locale,page,'index.html'))).includes('earthquake'))failures.push('Missing Earthquake in '+locale+'/'+page);
}
const quakeSamples=JSON.parse(await fs.readFile('src/data/earthquake-samples.json','utf8'));
if(quakeSamples.length!==240||new Set(quakeSamples.map(d=>d.index)).size!==240)failures.push('Missing or duplicated Earthquake samples');
for(const d of quakeSamples){
 if(!Object.values(d).every(v=>typeof v!=='number'||Number.isFinite(v))||d.cluster<0||d.cluster>4||Math.abs(d.scale-(1+d.magnitude_norm*4))>1e-6||Math.abs(d.z+d.depth_norm)>1e-6)failures.push('Invalid Earthquake parameter export '+d.index);
}
const quakeCsv=(await fs.readFile(path.join(root,'media/earthquake/design-samples.csv'),'utf8')).trim().split(/\r?\n/);
if(quakeCsv.length!==241||/text|caption|filename|api_key|path/i.test(quakeCsv[0]))failures.push('Incomplete or unsanitised numerical Earthquake download');
// The all-work layout uses one real tab per project; filtering keeps the original strip.
for(const locale of ['zh','en']){
 const gallery=await html(path.join(root,locale,'works','index.html'));
 const slugs=[...gallery.matchAll(/data-gallery-project="([^"]+)"/g)].map(match=>match[1]);
 const expectedCount=Number(gallery.match(/--project-count:(\d+)/)?.[1]);
 if(!expectedCount||slugs.length!==expectedCount||new Set(slugs).size!==slugs.length)failures.push('Duplicate or missing project tabs in '+locale+' index');
 for(const attribute of ['data-layout="carousel"','data-gallery-motion','data-gallery-browse-hint','gallery-card-caption'])if(!gallery.includes(attribute))failures.push('Missing circulating gallery UI '+attribute);
}
// Check that the transferred native geometry is complete and safe to index on the GPU.
const mesh=gunzipSync(await fs.readFile(path.join(root,'media/cosmos/rhino-mesh.bin.gz'))),vertices=mesh.readUInt32LE(8),indices=mesh.readUInt32LE(12);
if(mesh.readUInt32LE(0)!==0x4d534f43||mesh.readUInt32LE(4)!==1||vertices!==876646||indices!==1412168*3||mesh.length!==16+vertices*12+indices*4)failures.push('Incomplete Rhino geometry');
for(let i=16+vertices*12;i<mesh.length;i+=4)if(mesh.readUInt32LE(i)>=vertices){failures.push('Invalid Rhino triangle index');break;}
const particles=gunzipSync(await fs.readFile(path.join(root,'media/cosmos/processing-points.bin.gz')));
if(particles.length!==28026*12)failures.push('Incomplete Processing point cloud');
for(let i=0;i<particles.length;i+=4){const n=particles.readFloatLE(i);if(!Number.isFinite(n)||Math.abs(n)>.901){failures.push('Invalid Processing point');break;}}
// Metamorphosis uses the source-derived geometry and complete extracted figures.
for(const locale of ['zh','en']){
 const met=await html(path.join(root,locale,'work','metamorphosis','index.html'));
 for(const id of ['concept','operator-network','audio-interaction','development','live-performance'])if(!met.includes('id="'+id+'"'))failures.push('Missing Metamorphosis chapter '+locale+'/'+id);
 for(const asset of ['operator-network.webp','development-sequence.webp','reactive-sequence.webp','hero.mp4'])if(!met.includes(asset))failures.push('Missing Metamorphosis figure '+asset);
 if(!met.includes('data-met-interaction')||!met.includes('data-met-file')||!met.includes('data-met-action="microphone"'))failures.push('Missing audio interaction '+locale);
 if(/25056153|25130102|25166149|25097154|@ucl\.ac\.uk/.test(met))failures.push('Submission metadata in public Metamorphosis page');
 for(const page of ['works','explore'])if(!(await html(path.join(root,locale,page,'index.html'))).includes('metamorphosis'))failures.push('Missing Metamorphosis in '+locale+'/'+page);
}
const butterfly=gunzipSync(await fs.readFile(path.join(root,'media/metamorphosis/butterfly-points.bin.gz')));
if(butterfly.length!==48000*12)failures.push('Incomplete original butterfly surface');
for(let i=0;i<butterfly.length;i+=4)if(!Number.isFinite(butterfly.readFloatLE(i))||Math.abs(butterfly.readFloatLE(i))>.901){failures.push('Invalid butterfly coordinate');break;}
await import('./verify-entry-load.mjs');
await import('./verify-carousel.mjs');
await import('./verify-animation-lifecycle.mjs');
await import('./verify-performance-budget.mjs');
await import('./verify-explore-formation.mjs');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`Verified ${pages.length} pages and ${checked} local links/assets. Drafts remain unlinked.`);
