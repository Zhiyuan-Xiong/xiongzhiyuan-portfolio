// The opening is one coherent ring. Bodies enter its upper gate, then the ring opens into the galaxy.
export type SpacePoint = [number,number,number];
export type FormationSlot={phase:number;orbit:number;order:number;count:number};
export const EXPLORE_FORMATION_MS = 4200;
const TAU=Math.PI*2;
const smooth=(a:number,b:number,n:number)=>{const t=Math.max(0,Math.min(1,(n-a)/(b-a)));return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export function formationSlots(nodes:{phase:number;speed:number}[],time=0,yaw=-.31):FormationSlot[]{
 const count=nodes.length,slots:FormationSlot[]=new Array(count);
 const order=nodes.map((node,index)=>({index,angle:((node.phase+time*.032*node.speed+yaw*.28)%TAU+TAU)%TAU})).sort((a,b)=>a.angle-b.angle);
 order.forEach((node,rank)=>{slots[node.index]={phase:rank/count*TAU,orbit:16.8,order:count-1-rank,count};});
 return slots;
}
export function formationBlend(_radius:number,progress:number){return smooth(.56,.985,progress);}
export function formationSpin(progress:number,count:number){
 const n=Math.max(1,count),velocity=TAU/.34,start=Math.PI*.5-TAU*(n-1)/n-velocity*.012;
 if(progress<=.36)return start+velocity*progress;
 const atEnd=start+velocity*.36,end=Math.ceil(atEnd/TAU)*TAU,duration=2*(end-atEnd)/velocity,step=Math.min(progress-.36,duration);
 return atEnd+velocity*step-velocity*step*step/(2*duration);
}
export function planetArrival(order:number,count:number,progress:number){
 const start=.012+order/Math.max(1,count)*.34;
 return smooth(start,start+.032,progress);
}
export function formationPosition(point:SpacePoint,time:number,yaw:number,pitch:number,progress:number,speed=1,slot?:FormationSlot):SpacePoint{
 const [x,y,z]=point,radius=Math.hypot(x,y),basePhase=Math.atan2(y,x),blend=formationBlend(radius,progress);
 const entry=slot??{phase:basePhase,orbit:16.8,order:0,count:1},targetAngle=basePhase+time*.032*speed+yaw*.28;
 const delta=Math.atan2(Math.sin(targetAngle-entry.phase),Math.cos(targetAngle-entry.phase));
 const angle=entry.phase+formationSpin(progress,entry.count)+delta*blend,radial=mix(entry.orbit,radius,blend),rx=Math.cos(angle)*radial,ry=Math.sin(angle)*radial;
 const flatY=ry*mix(.66,Math.cos(1.08+pitch*.14),blend),tilt=mix(-.22,.23,blend);
 const approach=(1-planetArrival(entry.order,entry.count,progress))*5*(1-blend);
 return [rx*Math.cos(tilt)-flatY*Math.sin(tilt),rx*Math.sin(tilt)+flatY*Math.cos(tilt),-22+ry*mix(.22,.17,blend)+(z+22)*mix(.2,1,blend)-approach];
}
export function formationScale(progress:number){return mix(1.34,1,smooth(.60,.985,progress));}
export const formationMotionGLSL=`uniform vec2 u_angles;uniform float u_formation,u_orbitSpeed,u_entryPhase,u_entryRadius,u_entryOrder,u_entryCount,u_basePhase,u_baseRadius;
 vec3 galaxy(vec3 p,float t){float a=t*.032*u_orbitSpeed+u_angles.y*.28,c=cos(a),s=sin(a);vec2 v=mat2(c,s,-s,c)*p.xy;float y=v.y*cos(1.08+u_angles.x*.14);float ct=cos(.23),st=sin(.23);return vec3(v.x*ct-y*st,v.x*st+y*ct,p.z+v.y*.17);}
 float entrySpin(float progress){float tau=6.2831853,n=max(1.,u_entryCount),v=tau/.34,start=1.5707963-tau*(n-1.)/n-v*.012;if(progress<=.36)return start+v*progress;float atEnd=start+v*.36,end=ceil(atEnd/tau)*tau,duration=2.*(end-atEnd)/v,d=min(progress-.36,duration);return atEnd+v*d-v*d*d/(2.*duration);}
 vec3 assembledGalaxy(vec3 p,float t,float band){
  float radius=length(p.xy),blend=smoothstep(.56,.985,u_formation),phase=atan(p.y,p.x),offset=atan(sin(phase-u_basePhase),cos(phase-u_basePhase));
  float entryPhase=u_entryPhase+offset,targetPhase=phase+t*.032*u_orbitSpeed+u_angles.y*.28,delta=atan(sin(targetPhase-entryPhase),cos(targetPhase-entryPhase));
  float angle=entryPhase+entrySpin(u_formation)+delta*blend,radial=mix(u_entryRadius+radius-u_baseRadius,radius,blend),rx=cos(angle)*radial,ry=sin(angle)*radial;
  float y=ry*mix(.66,cos(1.08+u_angles.x*.14),blend),tilt=mix(-.22,.23,blend),start=.012+u_entryOrder/max(1.,u_entryCount)*.34,approach=(1.-smoothstep(start,start+.032,u_formation))*5.*(1.-blend);
  return vec3(rx*cos(tilt)-y*sin(tilt),rx*sin(tilt)+y*cos(tilt),-22.+ry*mix(.22,.17,blend)+(p.z+22.)*mix(.2,1.,blend)-approach);
 }`;
