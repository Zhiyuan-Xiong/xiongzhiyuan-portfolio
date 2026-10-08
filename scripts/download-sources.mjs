import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const assets = JSON.parse(await fs.readFile('.cache/asset-requests.json', 'utf8'));
await fs.mkdir('.cache/sources', { recursive: true });
let cursor=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<assets.length){const a=assets[cursor++];const target=path.join(root,'.cache/sources',a.name);try{if((await fs.stat(target)).size>0)continue;}catch{}const res=await fetch(a.url);if(!res.ok)throw new Error(`${a.name}: ${res.status}`);const data=Buffer.from(await res.arrayBuffer());await fs.writeFile(target,data);console.log(a.name, data.length);}}));
