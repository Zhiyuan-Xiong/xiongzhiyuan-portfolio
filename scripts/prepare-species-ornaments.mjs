import {writeFile,readFile} from 'node:fs/promises';
import sharp from '../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js';
const urls=["https://www.figma.com/api/mcp/asset/08c0114c-21f3-495d-8901-4117f76cb5e0.svg","https://www.figma.com/api/mcp/asset/911d5d54-b542-47b0-b853-a4a80a929ede.svg"];
const layers=[];
for(let i=0;i<urls.length;i++){
 let buf;try{buf=await readFile('.cache/species/figma/ornament-'+i+'.svg');}catch{const response=await fetch(urls[i]);if(!response.ok)throw new Error('Figma ornament download failed');buf=Buffer.from(await response.arrayBuffer());await writeFile('.cache/species/figma/ornament-'+i+'.svg',buf);}
 const meta=await sharp(buf).metadata();console.log('Ornament',i,meta.width,meta.height,meta.hasAlpha);
 const png=await sharp(buf).resize({height:900}).png().toBuffer();layers.push(png);
}
const sizes=await Promise.all(layers.map(x=>sharp(x).metadata()));console.log(sizes.map(x=>[x.width,x.height]));
const result=await sharp({create:{width:2123,height:900,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers.map((input,i)=>({input,left:i===0?1347:0,top:0}))).webp({quality:90}).toBuffer();
await writeFile('public/media/species/cover-ornaments.webp',result);
const path='src/data/species-assets.json',manifest=JSON.parse(await readFile(path,'utf8'));manifest['cover-ornaments']={src:'/media/species/cover-ornaments.webp',width:2123,height:900};await writeFile(path,JSON.stringify(manifest,null,2)+'\n');console.log('Transparent ornament pair',result.length);

