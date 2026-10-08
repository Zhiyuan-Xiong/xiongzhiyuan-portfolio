import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=process.cwd();
const names=['hero','physical-model','installation','design-approach','cognitive-framework'];
await mkdir(resolve(root,'public/media/sonic'),{recursive:true});
const manifest={};const previews=[];
for(let i=0;i<names.length;i++){
 const name=names[i],source=resolve(root,'assets/sonic-figma',name+'.png'),m=await sharp(source).metadata();
 const src='/media/sonic/'+name+'.webp',large='/media/sonic/'+name+'-large.webp';
 await sharp(source).resize({width:1920,withoutEnlargement:true}).webp({quality:90}).toFile(resolve(root,'public'+src));
 await sharp(source).resize({width:3000,withoutEnlargement:true}).webp({quality:95}).toFile(resolve(root,'public'+large));
 manifest[name]={src,large,width:m.width,height:m.height,source:'Figma / m6kZJJSAunYJhF5BWrur16'};
 previews.push({input:await sharp(source).resize(600,338,{fit:'contain',background:'#111116'}).jpeg().toBuffer(),left:i%2*600,top:Math.floor(i/2)*366+28});
 previews.push({input:Buffer.from(`<svg width="600" height="28"><rect width="600" height="28" fill="#16161e"/><text x="16" y="20" font-size="16" fill="white">${name} (${m.width} x ${m.height})</text></svg>`),left:i%2*600,top:Math.floor(i/2)*366});
 if(name==='hero')for(const width of [640,1280,1920])await sharp(source).resize({width}).webp({quality:90}).toFile(resolve(root,`public/images/sonic-cover-${width}.webp`));
 console.log(name,m.width,m.height);
}
await writeFile(resolve(root,'src/data/sonic-assets.json'),JSON.stringify(manifest,null,2)+'\n');
await sharp({create:{width:1200,height:1098,channels:3,background:'#111116'}}).composite(previews).jpeg({quality:88}).toFile(resolve(root,'qa/sonic-source-overview.jpg'));
