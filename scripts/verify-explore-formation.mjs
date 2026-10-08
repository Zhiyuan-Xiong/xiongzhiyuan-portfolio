import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const read=async file=>{
 const source=await fs.readFile(file,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
};
const {formationPosition,formationBlend,formationSlots,formationSpin,planetArrival,formationScale,EXPLORE_FORMATION_MS}=await read('src/scripts/explore-formation.ts');
const {orderedSpacePlacements,spacePlacements}=await read('src/data/space.ts');
assert(EXPLORE_FORMATION_MS<=5000);
for(const count of [1,10,20,60,100,200]){
 const slugs=[...Object.keys(spacePlacements)].slice(0,count);
 while(slugs.length<count)slugs.push('future-project-'+slugs.length);
 const placements=orderedSpacePlacements(slugs),slots=formationSlots(Object.values(placements),8.3,-.31),rings=new Map();let nodeIndex=0;assert.equal(Object.keys(placements).length,count);
 for(const [slug,node] of Object.entries(placements)){
  assert(slugs.includes(slug));assert(node.orbit<=22.401);assert(node.radius>0);assert(node.speed>0);
  assert(Math.abs(Math.hypot(node.x,node.y)-node.orbit)<1e-9);
  const ring=rings.get(node.orbit)??[];ring.push(node.phase);rings.set(node.orbit,ring);
  const slot=slots[nodeIndex++],point=[node.x,node.y,-22],time=8.3,yaw=-.31,pitch=.23,a=time*.032*node.speed+yaw*.28;
  const rx=point[0]*Math.cos(a)-point[1]*Math.sin(a),ry=point[0]*Math.sin(a)+point[1]*Math.cos(a),fy=ry*Math.cos(1.08+pitch*.14);
  const expected=[rx*Math.cos(.23)-fy*Math.sin(.23),rx*Math.sin(.23)+fy*Math.cos(.23),-22+ry*.17];
  const last=formationPosition(point,time,yaw,pitch,1,node.speed,slot);
  last.forEach((value,i)=>assert(Math.abs(value-expected[i])<1e-9,'The settled galaxy must preserve the prior transform'));
  let previous=formationPosition(point,time,yaw,pitch,0,node.speed,slot),blend=0;
  for(let step=1;step<=720;step++){
   const progress=step/720,next=formationPosition(point,time,yaw,pitch,progress,node.speed,slot),nextBlend=formationBlend(node.orbit,progress);
   assert(next.every(Number.isFinite));assert(nextBlend>=blend);assert(Math.hypot(...next.map((v,i)=>v-previous[i]))<1,'No jump at an entry stage boundary');
   previous=next;blend=nextBlend;
  }
 }
 for(const phases of rings.values()){
  phases.sort((a,b)=>a-b);const gap=Math.PI*2/phases.length;
  for(let i=0;i<phases.length-1;i++)assert(Math.abs(phases[i+1]-phases[i]-gap)<1e-9,'Planet spacing must remain regular as projects are added');
 }
 for(let i=0;i<count;i++){assert.equal(planetArrival(i,count,0),0);assert.equal(planetArrival(i,count,1),1);}
 assert(planetArrival(0,count,.18)>=planetArrival(count-1,count,.18));
}
// Regression: all ten bodies must stay separated while a different orbital plane unfolds.
const current=Object.values(orderedSpacePlacements(Object.keys(spacePlacements))),currentSlots=formationSlots(current);
// Every birth comes through the same upper gate, and the first complete arrangement is an annulus.
const entryAngles=[];
currentSlots.forEach(slot=>{const start=.012+slot.order/slot.count*.34;const angle=slot.phase+formationSpin(start,slot.count);assert(Math.abs(angle-Math.PI*.5)<1e-9,'Bodies enter from the same upper gate');assert.equal(formationBlend(20,.5),0);entryAngles.push(slot.phase);});
entryAngles.sort((a,b)=>a-b);for(let i=1;i<entryAngles.length;i++)assert(Math.abs(entryAngles[i]-entryAngles[i-1]-Math.PI*2/current.length)<1e-9,'The opening ring must have evenly spaced planets');
for(let step=0;step<=120;step++){
 const progress=step/120,t=progress*EXPLORE_FORMATION_MS/1000;
 const smooth=(a,b,n)=>{const v=Math.max(0,Math.min(1,(n-a)/(b-a)));return v*v*(3-2*v);};
 const cameraZ=6-smooth(.2,.92,progress);
 const screen=current.map((node,index)=>{const p=formationPosition([node.x,node.y,-22],t,-.31,.23,progress,node.speed,currentSlots[index]),scale=720*.5*1.75/(cameraZ-p[2]);return {x:p[0]*scale,y:p[1]*scale,r:node.radius*formationScale(progress)*scale*1.11};});
 for(let i=0;i<screen.length;i++)for(let j=i+1;j<screen.length;j++){const a=screen[i],b=screen[j];assert(Math.hypot(a.x-b.x,a.y-b.y)>a.r+b.r+5,'Entry planets must not overlap');}
}
console.log('Explore entry stays continuous, shares its final transform, admits planets through one ring gate and spaces 1–200 projects on bounded orbital lanes.');