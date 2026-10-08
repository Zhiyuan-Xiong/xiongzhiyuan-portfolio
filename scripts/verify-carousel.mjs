import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=await fs.readFile('src/scripts/work-carousel.ts','utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
const {carouselDistance}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
for(const count of [1,2,10,30,100,300]){
 for(const position of [0,.001,1.4,count-.001,count,count+1.4,10000.7]){
  const distances=Array.from({length:count},(_,index)=>carouselDistance(index,position,count));
  assert(distances.every(d=>Number.isFinite(d)&&Math.abs(d)<=count/2));
  assert(distances.filter(d=>Math.abs(d)<3.7).length<=8,'Display window must stay bounded as projects grow');
  for(let i=0;i<count;i++)assert(Math.abs(carouselDistance(i,position+count,count)-distances[i])<1e-8,'Loop repeats without changing identity');
 }
 if(count>=10){
  for(const i of [0,1,2,count-1])assert(Math.abs(carouselDistance(i,count-.0001,count)-carouselDistance(i,count+.0001,count))<.001,'Visible cards must not jump at wrap');
 }
}
console.log('Carousel stays continuous with 1–300 projects; visible window never grows past eight cards.');
