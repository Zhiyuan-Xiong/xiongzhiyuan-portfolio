// Extract complete authored visual regions from the PDF's original page rasters.
// Masks exclude page prose; photographic panels and their white highlights stay intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const cache='.cache/alilaguna',output='public/media/alilaguna';
const manifestPath='src/data/alilaguna-assets.json';
const assets=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const provenance=JSON.parse(await fs.readFile(path.join(cache,'extraction-manifest.json'),'utf8'));
const paperFilter=`<filter id="paper" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -.333333 -.333333 -.333333 0 1"/><feComponentTransfer><feFuncA type="table" tableValues="0 .92 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"/></feComponentTransfer></filter>`;
const uri=buffer=>'data:image/png;base64,'+buffer.toString('base64');
const img=(buffer,x,y,w,h,extra='')=>`<image x="${x}" y="${y}" width="${w}" height="${h}" href="${uri(buffer)}" ${extra}/>`;
async function emit(name,svg,w,h,record){
 await fs.writeFile(path.join(cache,'transparent-svg',name+'-large.svg'),svg);
 const png=await sharp(Buffer.from(svg),{unlimited:true}).png().toBuffer();
 for(const [suffix,width] of [['',1800],['-large',4000]]){
  const dest=path.join(output,name+suffix+'.webp');
  const info=await sharp(png).resize({width,height:width,fit:'inside',withoutEnlargement:true}).webp({quality:96,alphaQuality:100}).toFile(dest);
  if(!suffix)assets[name]={src:'/media/alilaguna/'+name+'.webp',large:'/media/alilaguna/'+name+'-large.webp',width:info.width,height:info.height};
  const stats=await sharp(dest).stats();if(stats.channels[3]?.min!==0||stats.channels[3]?.max!==255)throw Error(name+' invalid transparency');
 }
 const idx=provenance.findIndex(x=>x.name===name);const entry={name,...record,output_pixels:[w,h]};if(idx>=0)provenance[idx]=entry;else provenance.push(entry);
 console.log(name,w,h);
}
async function crop(name,page,rect){
 const source=path.join(cache,`original-${String(page).padStart(2,'0')}.png`);
 const m=await sharp(source).metadata();const [l,t,r,b]=rect;
 const box={left:Math.round(l*m.width),top:Math.round(t*m.height),width:Math.round((r-l)*m.width),height:Math.round((b-t)*m.height)};
 const png=await sharp(source).extract(box).resize({width:4000,height:4000,fit:'inside',withoutEnlargement:true}).png().toBuffer();
 const {width:w,height:h}=await sharp(png).metadata();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>${paperFilter}<mask id="alpha" mask-type="alpha">${img(png,0,0,w,h,'filter="url(#paper)"')}</mask></defs>${img(png,0,0,w,h,'mask="url(#alpha)"')}</svg>`;
 await emit(name,svg,w,h,{source,normalized_crop:rect,reason:'Expanded artwork bounds include complete edges, arrows and labels.'});
}
await crop('journey-collage',2,[.405,.183,.978,.650]);
await crop('location-collage',4,[.024,.238,.245,.958]);
await crop('timeline-analysis',8,[.018,.150,.979,.801]);
// All four inset shots retain their complete original pixels. The tall background
// is extracted across the full page height, rather than the former narrow strip.
for(const [page,name] of [[9,'showcase-one'],[10,'showcase-two'],[11,'showcase-three']]){
 const source=path.join(cache,`original-${String(page).padStart(2,'0')}.png`);
 const png=await sharp(source).resize(4000,2250).png().toBuffer();const w=4000,h=2250;
 const panels=[[49,200,483,444],[516,200,950,444],[49,477,483,723],[516,477,950,723]];
 const protectedPanels=panels.map(([l,t,r,b])=>`<rect x="${l*2.5}" y="${t*2.5}" width="${(r-l)*2.5}" height="${(b-t)*2.5}" fill="white"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>${paperFilter}
 <linearGradient id="height" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".186" stop-color="white" stop-opacity="0"/><stop offset=".215" stop-color="white"/><stop offset=".818" stop-color="white"/><stop offset=".852" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient>
 <linearGradient id="right"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".595" stop-color="white" stop-opacity="0"/><stop offset=".619" stop-color="white"/><stop offset="1" stop-color="white"/></linearGradient>
 <mask id="art" mask-type="alpha"><rect width="${w}" height="${h}" fill="url(#height)"/><rect width="${w}" height="${h}" fill="url(#right)"/>${protectedPanels}</mask>
 <mask id="alpha" mask-type="alpha">${img(png,0,0,w,h,'filter="url(#paper)"')}<rect width="${w}" height="${h}" fill="url(#right)"/>${protectedPanels}</mask>
 </defs><g mask="url(#art)">${img(png,0,0,w,h,'mask="url(#alpha)"')}</g></svg>`;
 await emit(name,svg,w,h,{source,normalized_crop:[0,0,1,1],excluded:'Page title and paragraph areas only; four foreground panels and full-height right background retained.',protected_panels:panels});
}
// The three-dimensional space collage is one composition, not a grid of single
// images. Use its full source background and the two author-positioned insets.
{
 const source=String.raw`D:\music video 排版\排版素材\trainpaibanfinal.png`;
 const background=await sharp(source).resize(3840,2160).png().toBuffer();
 const page=path.join(cache,'original-07.png');const panelBoxes=[[49,184,583,473],[49,563,583,853]];
 let panels='';
 for(const [l,t,r,b] of panelBoxes){
  const png=await sharp(page).extract({left:l*5,top:t*5,width:(r-l)*5,height:(b-t)*5}).resize(Math.round((r-l)*2.4),Math.round((b-t)*2.4)).png().toBuffer();
  panels+=img(png,l*2.4,t*2.4,(r-l)*2.4,(b-t)*2.4);
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160"><defs><linearGradient id="fade"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".20" stop-color="white" stop-opacity=".08"/><stop offset=".39" stop-color="white" stop-opacity=".4"/><stop offset=".68" stop-color="white"/><stop offset="1" stop-color="white"/></linearGradient><mask id="fade-mask" mask-type="alpha"><rect width="3840" height="2160" fill="url(#fade)"/></mask></defs>${img(background,0,0,3840,2160,'mask="url(#fade-mask)"')}${panels}</svg>`;
 await emit('virtual-space-collage',svg,3840,2160,{source:[source,page],normalized_crop:null,composition:'Full native vertical-space artwork with the original two scene insets; page copy excluded.'});
}
// Restore photographic highlights. Transparency belongs to the surrounding
// artwork canvas, rather than white interior details of a photographed scene.
for(const [name,file] of [['vertical-space','trainpaibanfinal.png'],['river-vessel','boat1.png'],['flooded-carriage','traininside.png']]){
 const source=String.raw`D:\music video 排版\排版素材`+'\\'+file;
 const png=await sharp(source).png().toBuffer();const {width:w,height:h}=await sharp(png).metadata();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w+16}" height="${h+16}">${img(png,8,8,w,h)}</svg>`;
 await emit(name,svg,w+16,h+16,{source,normalized_crop:null,reason:'Native full photographic frame, transparent outer canvas; white image details preserved.'});
}
await fs.writeFile(manifestPath,JSON.stringify(assets,null,2)+'\n');
await fs.writeFile(path.join(cache,'extraction-manifest.json'),JSON.stringify(provenance,null,2)+'\n');
