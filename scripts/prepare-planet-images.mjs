import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
// Rectangular finished scenes only: no irregular cutouts, analysis layouts, storyboards or clay renders.
const selection=[
 ['cosmos-energy','images/cosmos-cover-1280.webp',1.06,'无垠的宇宙 · 动态生成影像'],
 ['sonic-installation','images/sonic-cover-1280.webp',1.03,'声学弹性 · 装置实景'],
 ['stigma-scene','images/stigma-cover-1280.webp',1.06,'病名异化实验场 · 全景渲染'],
 ['nexus-observer','media/nexus/observer.webp',1.04,'NEXUS · 监察之眼'],
 ['dating-carnival','media/dating/carnival-render.webp',1.12,'相亲嘉年华 · 成品场景'],
 ['alilaguna-tunnel','media/alilaguna/planet-dark-tunnel.webp',.98,'Alilaguna · 深色镜像隧道'],
 ['skeleton-portrait','images/bone-cover-1280.webp',.9,'骨骸共生系统 · 金属首饰'],
 ['nexus-furnace','media/nexus/furnace.webp',1.04,'NEXUS · 能量熔炉细节'],
 ['stigma-room','images/stigma-space-1280.webp',1.04,'病名异化实验场 · 空间细节'],
 ['nexus-world','images/nexus-cover-1280.webp',1.15,'NEXUS · 机械文明全景'],
 ['dating-factory','media/dating/factory-render.webp',1.08,'相亲嘉年华 · 爱情工厂'],
 ['dating-gaze','media/dating/gaze-render.webp',1.05,'相亲嘉年华 · 凝视剧场'],
 ['mushrooms-world','media/restored/7edd1708-db29-43b2-b92f-09315964e0d3.webp',1.15,'毒蘑菇 · 完成版世界地图'],
 ['nexus-core','media/nexus/core.webp',1.03,'NEXUS · 情绪心脏细节'],
];
await mkdir(resolve(root,'public/media/planet'),{recursive:true});
const images=[];
for(const [id,source,exposure,label] of selection){
 const original=sharp(resolve(root,'public',source));const metadata=await original.metadata();
 await original.resize({width:960,height:960,fit:'inside',withoutEnlargement:true}).flatten({background:'#08080a'}).webp({quality:92,effort:5}).toFile(resolve(root,`public/media/planet/${id}.webp`));
 images.push({src:`/media/planet/${id}.webp`,aspect:metadata.width/metadata.height,exposure,label});
}
await writeFile(resolve(root,'src/data/planet-images.json'),JSON.stringify(images,null,2)+'\n');
console.log(`Prepared ${images.length} complete render images for EUAN PLANET.`);
