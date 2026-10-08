import fs from 'node:fs/promises';import path from 'node:path';import sharp from 'sharp';
const archive='.cache/alilaguna/transparent-svg';let count=0;
for(const filename of await fs.readdir(archive)){
 if(!filename.endsWith('.svg'))continue;
 let source=await fs.readFile(path.join(archive,filename),'utf8');
 source=source.replace('0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.333333','0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -.333333');
 const match=source.match(/data:image\/webp;base64,([^\"]+)/);
 if(match){const png=await sharp(Buffer.from(match[1],'base64')).png().toBuffer();source=source.replaceAll(match[0],'data:image/png;base64,'+png.toString('base64'));}
 await fs.writeFile(path.join(archive,filename),source);
 const dest=path.join('public/media/alilaguna',filename.replace(/\.svg$/,'.webp'));
 await sharp(Buffer.from(source),{unlimited:true}).webp({quality:95,alphaQuality:100}).toFile(dest);
 const result=await sharp(dest).stats();if(result.channels[3].max<200||result.channels[3].min!==0){console.log(result.channels);throw new Error('Invalid alpha: '+filename);}
 count++;
}
console.log('Transparent artwork verified:',count,'files, visible pixels and transparent paper.');

