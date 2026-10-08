// Presentation only: case content is still managed in projects.ts.
export type PlanetPlacement={x:number;y:number;z:number;width:number;height:number;orbit:number;phase:number;speed:number;radius:number;color:[number,number,number]};
const place=(orbit:number,phase:number,speed:number,radius:number,color:[number,number,number]):PlanetPlacement=>({x:Math.cos(phase)*orbit,y:Math.sin(phase)*orbit,z:-22,width:5.5,height:3.5,orbit,phase,speed,radius,color});
export const spacePlacements:Record<string,PlanetPlacement>={
 metamorphosis:place(18.2,.82,.57,.68,[.53,.73,.78]),
 earthquake:place(15.2,3.4,.72,.68,[.58,.65,.76]),
 'infinite-cosmos':place(16.3,1.15,.65,.68,[.68,.56,.81]),
 'sonic-elasticity':place(20.4,2.54,.50,.66,[.53,.60,.78]),
 'post-digital-species':place(10.3,4.25,.96,.73,[.55,.82,1]),
 stigma:place(8.8,2.75,1.12,.67,[.79,.51,.92]),
 'dating-carnival':place(11.6,5.3,.87,.78,[1,.65,.43]),
 'poisonous-mushrooms':place(14.5,.4,.73,.70,[.46,.73,.90]),
 fandazi:place(17.4,3.78,.62,.58,[.83,.75,.58]),
 alilaguna:place(19.2,6.1,.54,.63,[.61,.71,.84]),
 nexus:place(13.4,1.94,.79,.72,[.46,.83,.77]),
 'bone-series':place(21.8,4.84,.46,.75,[.88,.85,.94]),
};

// Shared lanes keep a readable rhythm; new projects get an available orbital slot.
export function orderedSpacePlacements(slugs:string[]):Record<string,PlanetPlacement>{
 const lanes:string[][]=[[],[],[]],capacity=[4,6,8];
 const known=slugs.filter(slug=>spacePlacements[slug]),added=slugs.filter(slug=>!spacePlacements[slug]);
 for(const slug of known){const radius=spacePlacements[slug].orbit;lanes[radius<12?0:radius<17?1:2].push(slug);}
 for(const slug of added){
  let lane=lanes.reduce((best,items,i)=>items.length/capacity[i]<lanes[best].length/capacity[best]?i:best,0);
  if(lanes[lane].length>=capacity[lane]){lane=lanes.length;lanes.push([]);capacity.push(8+lane*2);}
  lanes[lane].push(slug);
 }
 const result:Record<string,PlanetPlacement>={};
 lanes.forEach((items,lane)=>{
  items.sort((a,b)=>(spacePlacements[a]?.phase??slugs.indexOf(a))-(spacePlacements[b]?.phase??slugs.indexOf(b)));
  const offset=[2.7,.42,2.5][lane]??lane*.73;
  items.forEach((slug,index)=>{
   const source=spacePlacements[slug],orbit=lanes.length<=3?8.8+lane*5.8:6.8+lane*15.6/(lanes.length-1),phase=offset+index/items.length*Math.PI*2;
   result[slug]=place(orbit,phase,Math.max(.28,1.04-lane*.25),source?.radius??.68,source?.color??[.61,.68,.8]);
  });
 });
 return result;
}