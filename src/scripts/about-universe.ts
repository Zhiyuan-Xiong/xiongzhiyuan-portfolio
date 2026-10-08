import {createGalleryNebula} from './gallery-nebula';
import {stellarCoreShaders} from './stellar-core';
type Mesh={position:WebGLBuffer;uv:WebGLBuffer;count:number;mode:number};
const sphere=(lat:number,lon:number,r:number)=>[Math.cos(lat)*Math.sin(lon)*r,Math.sin(lat)*r,Math.cos(lat)*Math.cos(lon)*r];
const hash=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function createAboutPlanet(root:HTMLElement){
 const canvas=root.querySelector<HTMLCanvasElement>('.about-planet-canvas')!;
 const context=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,powerPreference:'low-power'});
 if(!context){root.dataset.rendering='fallback';return()=>{};}
 const gl=context,programs:WebGLProgram[]=[],buffers:WebGLBuffer[]=[],uniformCache=new Map<WebGLProgram,Map<string,WebGLUniformLocation|null>>();
 function shader(type:number,source:string){const shader=gl.createShader(type)!;gl.shaderSource(shader,(type===gl.VERTEX_SHADER?'precision mediump float;':'')+source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(message??'About shader failed');}return shader;}
 function program(vertex:string,fragment:string){const program=gl.createProgram()!,vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)??'About shader link failed');programs.push(program);return program;}
 // The diagonal axis is applied to every layer, including the shared entrance core.
 const projection=`uniform float u_aspect,u_lens,u_dpr;uniform vec3 u_camera;uniform vec2 u_pointer;
 vec4 project(vec3 p){float c=cos(-.38),s=sin(-.38);p.xy=mat2(c,s,-s,c)*p.xy;vec3 q=p-u_camera;float n=.07,f=40.;return vec4(q.x*u_lens/u_aspect,q.y*u_lens,(f+n)/(n-f)*q.z+2.*f*n/(n-f),-q.z);}`;
 const coreProgram=program(...stellarCoreShaders(projection));
 const shellProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}uniform float u_time,u_kind;varying vec2 v_uv;varying float v_depth,v_light;
 void main(){vec3 p=a_position;float a=u_time*.11,c=cos(a),s=sin(a);p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);float tilt=-.48+.06*sin(u_time*.08),ct=cos(tilt),st=sin(tilt);p=vec3(p.x,p.y*ct-p.z*st,p.y*st+p.z*ct);v_depth=p.z;v_uv=a_uv;vec3 lamp=normalize(vec3(sin(u_time*.24)*.6,.5,1.));v_light=.3+.7*pow(max(0.,dot(normalize(p),lamp)),1.7);gl_Position=project(p);gl_Position.y+=gl_Position.w*.035;gl_PointSize=u_dpr*(u_kind>2.5?4.5:2.);}`,`precision mediump float;uniform float u_time,u_kind,u_pass;varying vec2 v_uv;varying float v_depth,v_light;
 void main(){if(u_pass*v_depth<0.)discard;float flow=.65+.35*pow(.5+.5*sin(v_uv.y*6.28318-u_time*.36),9.);vec3 silver=mix(vec3(.38,.43,.52),vec3(.86,.89,.95),v_light);float alpha;
 if(u_kind>2.5){float d=length(gl_PointCoord-.5);alpha=exp(-d*d*19.)*.85;silver=vec3(.85,.9,1.);}else{float edge=smoothstep(0.,.15,v_uv.x)*(1.-smoothstep(.85,1.,v_uv.x));alpha=edge*(u_kind<.5?.82:u_kind<1.5?.23:.78)*flow*(v_depth>0.?1.:.28);}
 gl_FragColor=vec4(silver,alpha);}`);
 function mesh(positions:number[],uvs:number[],mode:number):Mesh{const position=gl.createBuffer()!,uv=gl.createBuffer()!;buffers.push(position,uv);gl.bindBuffer(gl.ARRAY_BUFFER,position);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,uv);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW);return{position,uv,count:positions.length/3,mode};}
 const attributes=new Map<WebGLProgram,Map<string,number>>();
 function attributeLocation(program:WebGLProgram,name:string){if(!attributes.has(program))attributes.set(program,new Map());const cache=attributes.get(program)!;if(!cache.has(name))cache.set(name,gl.getAttribLocation(program,name));return cache.get(name)!;}
 function bind(program:WebGLProgram,item:Mesh){gl.useProgram(program);for(const [name,buffer,size] of [['a_position',item.position,3],['a_uv',item.uv,2]] as [string,WebGLBuffer,number][]){const index=attributeLocation(program,name);if(index<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,size,gl.FLOAT,false,0,0);}}
 function uniform(program:WebGLProgram,name:string){let cache=uniformCache.get(program);if(!cache){cache=new Map();uniformCache.set(program,cache);}if(!cache.has(name))cache.set(name,gl.getUniformLocation(program,name));return cache.get(name)!;}
 const float=(program:WebGLProgram,name:string,value:number)=>gl.uniform1f(uniform(program,name),value);
 function settings(program:WebGLProgram){float(program,'u_time',time);float(program,'u_aspect',width/Math.max(1,height));float(program,'u_lens',2.08);float(program,'u_dpr',dpr*.76);float(program,'u_transition',0);gl.uniform3f(uniform(program,'u_camera'),0,0,4.55);gl.uniform2f(uniform(program,'u_pointer'),0,0);gl.uniform2f(uniform(program,'u_angles'),-.48,time*.11);}
 const corePositions:number[]=[],coreUvs:number[]=[],count=matchMedia('(max-width:760px)').matches?1100:1700;
 for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,a=i*2.399963,r=Math.sqrt(1-y*y);corePositions.push(Math.cos(a)*r,y,Math.sin(a)*r);coreUvs.push(hash(i+6321),0);}
 const core=mesh(corePositions,coreUvs,gl.POINTS),network:number[][]=[],networkPositions:number[]=[],networkUvs:number[]=[];
 for(let i=0;i<140;i++){const y=1-2*(i+.5)/140,a=i*2.399963,r=Math.sqrt(1-y*y);network.push([Math.cos(a)*r,y,Math.sin(a)*r]);}
 for(let i=0;i<140;i++)for(let j=i+1;j<140;j++){const a=network[i],b=network[j];if(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<.34){networkPositions.push(...a,...b);networkUvs.push(0,0,0,0);}}
 const coreNetwork=mesh(networkPositions,networkUvs,gl.LINES);
 const ribPositions:number[]=[],ribUvs:number[]=[],innerPositions:number[]=[],innerUvs:number[]=[];
 function ribbon(destination:number[],uvs:number[],parallel:boolean,value:number,start:number,end:number,radius:number,breadth:number,segments=90){
  for(let i=0;i<segments;i++)for(const [u,v] of [[0,0],[0,1],[1,1],[0,0],[1,1],[1,0]]){
   const t=(i+u)/segments,cross=(v*2-1)*breadth,angle=start+(end-start)*t;
   destination.push(...sphere(parallel?value+cross:angle,parallel?angle:value+cross/Math.max(.18,Math.cos(angle)),radius));uvs.push(v,t);
  }
 }
 // Open metallic ribs, interrupted at different latitudes, form a personal observatory shell.
 for(let lon=0;lon<7;lon++)for(let section=0;section<3;section++){
  const start=-1.26+section*.85+(lon%2)*.06,end=start+.69;
  ribbon(ribPositions,ribUvs,false,lon*Math.PI*2/7,start,end,1.06,.027,50);
 }
 for(const latitude of [-.63,0,.63])for(let arc=0;arc<4;arc++)ribbon(ribPositions,ribUvs,true,latitude,arc*Math.PI/2+.09,(arc+1)*Math.PI/2-.09,1.085,.012,64);
 for(let lon=0;lon<5;lon++)ribbon(innerPositions,innerUvs,false,lon*Math.PI*2/5,-1.5,1.5,.84,.002,90);
 for(const latitude of [-.48,.48])ribbon(innerPositions,innerUvs,true,latitude,0,Math.PI*2,.84,.002,140);
 const ribs=mesh(ribPositions,ribUvs,gl.TRIANGLES),inner=mesh(innerPositions,innerUvs,gl.TRIANGLES);
 const ringPositions:number[]=[],ringUvs:number[]=[],satellitePositions:number[]=[],satelliteUvs:number[]=[];
 // One narrow orbit, with three small moving lights and a fine offset rail.
 for(const radius of [1.52,1.56])for(let i=0;i<240;i++)for(const [u,v] of [[0,0],[0,1],[1,1],[0,0],[1,1],[1,0]]){const t=(i+u)/240,a=t*Math.PI*2,r=radius+(v*2-1)*.0065;ringPositions.push(Math.sin(a)*r,-.12,Math.cos(a)*r);ringUvs.push(v,t);}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3+.4;satellitePositions.push(Math.sin(a)*1.54,-.12,Math.cos(a)*1.54);satelliteUvs.push(.5,i/3);}
 const ring=mesh(ringPositions,ringUvs,gl.TRIANGLES),satellites=mesh(satellitePositions,satelliteUvs,gl.POINTS);
 let width=0,height=0,dpr=1,time=0,last=0,frame=0,alive=true,visible=true,lost=false,lastPattern=-1;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
 const patterns=[...root.querySelectorAll<SVGGElement>('[data-about-pattern]')];
 function constellation(){const index=Math.floor(time/14)%patterns.length;if(index===lastPattern)return;lastPattern=index;patterns.forEach((pattern,i)=>pattern.dataset.active=String(i===index));root.dataset.constellation=String(index);}
 function resize(){const box=canvas.getBoundingClientRect();if(width===box.width&&height===box.height&&dpr===Math.min(devicePixelRatio,1.5))return;width=box.width;height=box.height;dpr=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);schedule();}
 function shell(item:Mesh,kind:number,pass:number){bind(shellProgram,item);settings(shellProgram);float(shellProgram,'u_kind',kind);float(shellProgram,'u_pass',pass);gl.drawArrays(item.mode,0,item.count);}
 function draw(){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);shell(ring,2,-1);shell(satellites,3,-1);shell(ribs,0,-1);shell(inner,1,-1);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE);bind(coreProgram,coreNetwork);settings(coreProgram);float(coreProgram,'u_mode',1);float(coreProgram,'u_alpha',.68);gl.drawArrays(gl.LINES,0,coreNetwork.count);
  bind(coreProgram,core);settings(coreProgram);float(coreProgram,'u_mode',2);float(coreProgram,'u_alpha',.12);gl.drawArrays(gl.POINTS,0,core.count);float(coreProgram,'u_mode',0);float(coreProgram,'u_alpha',.68);gl.drawArrays(gl.POINTS,0,core.count);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);shell(inner,1,1);shell(ribs,0,1);shell(ring,2,1);shell(satellites,3,1);constellation();
 }
 function tick(now:number){frame=0;if(!alive||!visible||document.hidden||lost)return;if(last&&now-last<40&&!reduced.matches){schedule();return;}const dt=last?Math.min(.08,(now-last)/1000):0;last=now;if(!reduced.matches)time+=dt;else time=6;draw();root.dataset.ready='true';if(!reduced.matches)schedule();}
 function schedule(){if(alive&&visible&&!suspended&&!document.hidden&&!lost&&!frame)frame=requestAnimationFrame(tick);}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;schedule();}else{cancelAnimationFrame(frame);frame=0;}},{threshold:.02});intersection.observe(root);
 const pause=()=>{cancelAnimationFrame(frame);frame=0;};
 let suspended=false;
 addEventListener('portfolio:scene-pause',()=>{suspended=true;pause();},{signal:events.signal});
 addEventListener('portfolio:scene-resume',()=>{suspended=false;last=0;schedule();},{signal:events.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else{last=0;schedule();}},{signal:events.signal});reduced.addEventListener('change',()=>{last=0;schedule();},{signal:events.signal});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;pause();root.dataset.ready='false';root.dataset.rendering='fallback';},{signal:events.signal});
 canvas.addEventListener('webglcontextrestored',()=>{dispose();initializeAboutScene();},{signal:events.signal});
 addEventListener('pagehide',pause,{signal:events.signal});addEventListener('pageshow',()=>{last=0;resize();schedule();},{signal:events.signal});
 function dispose(){alive=false;pause();events.abort();observer.disconnect();intersection.disconnect();buffers.forEach(buffer=>gl.deleteBuffer(buffer));programs.forEach(program=>gl.deleteProgram(program));}
 root.dataset.rendering='webgl';root.dataset.core='entrance-shared';root.dataset.shell='segmented-observatory';resize();return dispose;
}
let stop=()=>{};
function initializeAboutScene(){stop();const sky=document.querySelector<HTMLCanvasElement>('[data-about-galaxy]'),planet=document.querySelector<HTMLElement>('[data-about-planet]');if(!sky||!planet)return;
 const nebula=createGalleryNebula(sky);let disposePlanet=()=>{};try{disposePlanet=createAboutPlanet(planet);}catch(error){planet.dataset.rendering='fallback';console.warn('About planet fallback:',error);}
 stop=()=>{nebula.dispose();disposePlanet();};addEventListener('portfolio:page-leave',stop,{once:true});
}
initializeAboutScene();
