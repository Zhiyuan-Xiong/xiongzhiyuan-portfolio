type Sample={Magnitude:number;Depth:number;scale:number;z:number;fragmentation:number;cluster:number};
let dispose:()=>void=()=>{};
export function initializeEarthquakeExplorer(){
 dispose();const root=document.querySelector<HTMLElement>('[data-quake-explorer]');if(!root)return;
 const events=new AbortController(),{signal}=events;
 const select=root.querySelector<HTMLSelectElement>('[data-quake-sample]')!;
 const samples=JSON.parse(root.querySelector('[data-quake-samples]')!.textContent!) as Sample[];
 const points=[...root.querySelectorAll<SVGCircleElement>('[data-quake-point]')];
 let index=0;
 function update(next:number){
  const previous=points[index];previous?.classList.remove('is-selected');previous?.setAttribute('r','3.8');
  index=(next+samples.length)%samples.length;select.value=String(index);
  const sample=samples[index],point=points[index];point?.classList.add('is-selected');point?.setAttribute('r','6');
  root!.querySelector('[data-quake-counter]')!.textContent=String(index+1).padStart(3,'0')+' / '+samples.length;
  for(const field of root!.querySelectorAll<HTMLElement>('[data-quake-value]')){
   const key=field.dataset.quakeValue as keyof Sample;field.textContent=sample[key].toFixed(key==='cluster'?0:key==='Magnitude'||key==='Depth'?1:3);
  }
 }
 select.addEventListener('change',()=>update(Number(select.value)),{signal});
 root.querySelector('[data-quake-prev]')!.addEventListener('click',()=>update(index-1),{signal});
 root.querySelector('[data-quake-next]')!.addEventListener('click',()=>update(index+1),{signal});
 root.querySelector('[data-quake-chart]')!.addEventListener('click',event=>{
  const circle=(event.target as Element).closest<SVGCircleElement>('[data-quake-point]');if(circle)update(Number(circle.dataset.quakePoint));
 },{signal});
 dispose=()=>events.abort();
}
