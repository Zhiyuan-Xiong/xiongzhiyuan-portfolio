import { scenePixelRatio } from './render-budget';
import { stellarCoreShaders } from './stellar-core';
import entryAtlas from '../data/entry-atlas.json';
import { EXPLORE_FORMATION_MS, formationPosition, planetArrival, formationScale, formationSlots, formationMotionGLSL, type FormationSlot } from './explore-formation';
type ProjectNode = {entry?:FormationSlot;slug:string;title:string;cover:string|null;x:number;y:number;z:number;width:number;height:number;orbit:number;phase:number;speed:number;radius:number;color:[number,number,number]};
type Camera = {x:number;y:number;z:number};
type PlanetImage = {src:string;aspect:number;exposure:number;label:string};
type Mesh = {position:WebGLBuffer;uv:WebGLBuffer;surface?:WebGLBuffer;count:number;mode:number};
type Scene = {time:number;progress:number;formation:number;yaw:number;pitch:number;pointer:[number,number];camera:Camera;selected:number;focus:number;activated:number;activation:number;indexActivation:number;reveal:number;rect:[number,number,number,number];pointSize:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=(a:number,b:number,n:number)=>{const t=clamp((n-a)/(b-a),0,1);return t*t*(3-2*t);};
const hash=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const lensFor=(aspect:number)=>1.75*Math.min(1,aspect/1.45);
// Every visible planet and its accessible hit area follow the same entry orbit.
const planetPosition=(node:ProjectNode,state:Scene)=>formationPosition([Math.cos(node.phase)*node.orbit,Math.sin(node.phase)*node.orbit,-22],state.time,state.yaw+state.pointer[0]*.12,state.pitch+state.pointer[1]*.065,state.formation,node.speed,node.entry);
const sceneCamera=(state:Scene)=>{const t=smooth(0,1,state.progress),settle=smooth(.2,.92,state.formation);return {x:state.camera.x*t*settle,y:state.camera.y*t*settle,z:mix(27,mix(6,state.camera.z,settle),t)};};
const root=document.querySelector<HTMLElement>('[data-portfolio-space]');
async function createRenderer(canvas:HTMLCanvasElement,nodes:ProjectNode[],keys:PlanetImage[]){
 const context=canvas.getContext('webgl',{alpha:false,antialias:true,depth:false,powerPreference:'high-performance'});
 if(!context)return null;
 const gl:WebGLRenderingContext=context;
 function shader(type:number,source:string){const s=gl.createShader(type)!;gl.shaderSource(s,(type===gl.VERTEX_SHADER?'precision mediump float;':'')+source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)??'Shader failed');return s;}
 function program(vertex:string,fragment:string){const p=gl.createProgram()!,v=shader(gl.VERTEX_SHADER,vertex),f=shader(gl.FRAGMENT_SHADER,fragment);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)??'Shader link failed');return p;}
 const projection=`uniform float u_aspect,u_lens,u_dpr;uniform vec3 u_camera;uniform vec2 u_pointer;
 vec4 project(vec3 p){vec3 q=p-u_camera;q.x+=q.z*u_pointer.x*.016;q.y+=q.z*u_pointer.y*.012;float n=.07,f=140.;return vec4(q.x*u_lens/u_aspect,q.y*u_lens,(f+n)/(n-f)*q.z+2.*f*n/(n-f),-q.z);}`;
 const galaxyMotion=formationMotionGLSL;
 const orbVertex=`attribute vec3 a_position;attribute vec2 a_uv;attribute vec4 a_surface;varying vec4 v_surface;varying vec3 v_normal;${projection}uniform vec2 u_angles;uniform float u_transition,u_layer,u_time;varying vec2 v_uv;varying float v_depth,v_light;
 void main(){vec3 p=a_position;float swell=smoothstep(.12,.75,u_transition);p*=1.+swell*.2;p+=normalize(p)*sin(p.y*12.+u_transition*5.)*swell*.016;float spin=u_layer*(.38-u_time*.018+.06*sin(u_time*.09));float cy=cos(u_angles.y+spin),sy=sin(u_angles.y+spin);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);float tilt=u_angles.x+u_layer*.13*cos(u_time*.07);float cx=cos(tilt),sx=sin(tilt);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);float c=cos(-.12),s=sin(-.12);p=vec3(p.x*c-p.y*s,p.x*s+p.y*c,p.z);v_depth=p.z;v_light=.62+.38*max(0.,dot(normalize(p),normalize(vec3(-.5,.55,1.8))));v_uv=a_uv;v_surface=a_surface;v_normal=normalize(a_position);float lightCy=cos(spin-u_time*.13),lightSy=sin(spin-u_time*.13);v_normal=vec3(v_normal.x*lightCy+v_normal.z*lightSy,v_normal.y,-v_normal.x*lightSy+v_normal.z*lightCy);gl_Position=project(p);gl_Position.y+=gl_Position.w*.035;}`;
 const orbProgram=program(orbVertex,`precision highp float;uniform sampler2D u_texture;uniform float u_pass,u_alpha;uniform mediump float u_transition,u_time;varying mediump vec2 v_uv;varying mediump vec4 v_surface;varying mediump vec3 v_normal;varying mediump float v_depth,v_light;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 void main(){
  if(u_pass*v_depth<0.)discard;
  vec2 tile=vec2(mod(v_surface.z,4.),floor(v_surface.z/4.)),uv=clamp(v_uv,0.,1.);
  float melt=smoothstep(.24,.54,u_transition),phase=v_surface.z*1.713;
  vec2 flow=clamp(uv+vec2(sin(uv.y*17.+phase+u_transition*8.),cos(uv.x*13.-u_transition*6.))*melt*.13,.0,1.);
  // Pixel cells keep the original picture's aspect and gently change their brightness and aperture.
  vec2 grid=vec2(44.*v_surface.x,44.),cell=floor(flow*grid),local=fract(flow*grid)-.5;
  // Cover-fit each rectangular window by cropping its source, never by stretching it.
  vec2 crop=vec2(min(1.,v_surface.x/v_surface.w),min(1.,v_surface.w/v_surface.x));
  vec2 pictureUv=(clamp((cell+.5)/grid,vec2(.003),vec2(.997))-.5)*crop+.5;
  vec2 sampleUv=(tile+vec2(.006)+pictureUv*.988)/4.;
  vec4 art=texture2D(u_texture,sampleUv);float grey=dot(art.rgb,vec3(.299,.587,.114));
  grey=pow(grey,1.17)*v_surface.y;grey=mix(grey,floor(grey*14.+.5)/14.,.38);
  float wave=.5+.5*sin(cell.x*.12+cell.y*.16-u_time*.72+phase);
  float flicker=.5+.5*sin(u_time*.82+hash(cell+tile*31.)*6.28318);
  float halfSize=.435+.021*wave+.009*flicker;
  vec2 square=abs(local)-vec2(halfSize-.065);
  float distance=length(max(square,0.))+min(max(square.x,square.y),0.)-.065;
  float pixel=1.-smoothstep(-.023,.023,distance);
  float edge=smoothstep(.0,.013,uv.x)*smoothstep(.0,.013,uv.y)*(1.-smoothstep(.987,1.,uv.x))*(1.-smoothstep(.987,1.,uv.y));
  float grain=noise(cell*.095+tile*4.+vec2(u_transition*.7,-u_transition));
  float dissolve=smoothstep(melt-.08,melt+.08,grain);
  // A shared core rhythm casts a slow grey-white beam through the image shells.
  vec3 normal=normalize(v_normal),lamp=normalize(vec3(sin(u_time*.29),.26+.18*sin(u_time*.21),cos(u_time*.29)));
  float beam=pow(max(0.,dot(normal,lamp)),3.);
  float lightFlow=.5+.5*sin(atan(normal.z,normal.x)*3.+normal.y*4.-u_time*.62);
  float corePulse=.92+.08*sin(u_time*.85);
  float illumination=(.2*beam+.055*lightFlow)*corePulse;
  float border=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
  float transmitted=exp(-border*42.)*beam*.023;
  float light=min(.62,min(.58,grey*.72)*v_light*(.89+.075*wave+.035*flicker)*(1.+illumination)+transmitted);
  gl_FragColor=vec4(vec3(light),art.a*pixel*edge*u_alpha*dissolve*(v_depth>0.?.72:.18));
 }`);
 const wireProgram=program(orbVertex,`precision mediump float;uniform float u_pass,u_alpha,u_band;varying vec2 v_uv;varying float v_depth,v_light;
 void main(){if(u_pass*v_depth<0.)discard;float edge=mix(1.,smoothstep(0.,.18,v_uv.x)*(1.-smoothstep(.82,1.,v_uv.x)),u_band);gl_FragColor=vec4(vec3(.94),edge*u_alpha*(v_depth>0.?.56:.16));}`);
 const coreProgram=program(...stellarCoreShaders(projection));
 const fieldProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}${galaxyMotion}
 uniform float u_time,u_activation,u_reveal;uniform vec3 u_attractor;varying float v_light,v_soft;varying vec3 v_color;
 void main(){vec3 p=galaxy(a_position,u_time);p.xy*=mix(.88,1.,smoothstep(.42,.97,u_formation));
 vec2 delta=p.xy-u_attractor.xy;float distance=length(delta);vec2 outward=delta/max(distance,.01);
 float force=smoothstep(0.,.55,u_activation)*(1.-smoothstep(.3,.85,u_reveal));
 float wave=exp(-pow((distance-u_activation*7.)/1.6,2.));
 p.xy+=outward*force*(2.7*exp(-distance*distance/58.)+wave*.85);p.z-=force*exp(-distance*distance/40.)*.3;
 float depth=max(1.,u_camera.z-p.z);v_light=.3+a_uv.x*.7;v_soft=a_uv.y;float tint=sin(a_position.x*.27+a_position.y*.31);v_color=mix(vec3(.86,.89,.95),vec3(.93,.94,.97),tint*.5+.5);gl_Position=project(p);gl_PointSize=clamp(u_dpr*(28.+a_uv.x*33.+a_uv.y*100.)/depth,.7,9.);}`,`
 precision mediump float;uniform float u_alpha,u_time;varying float v_light,v_soft;varying vec3 v_color;
 void main(){float d=length(gl_PointCoord-.5);float glow=exp(-d*d*20.);float core=1.-smoothstep(.03,.48,d);float a=mix(core,glow,v_soft);float pulse=.87+.13*sin(u_time*.32+v_light*19.);gl_FragColor=vec4(v_color,a*v_light*u_alpha*pulse*mix(.85,.31,v_soft));}`);
 const skyProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;uniform vec2 u_pointer;uniform float u_dpr,u_time;varying float v_light;varying vec3 v_color;
 void main(){v_light=.14+a_uv.x*.65;v_color=mix(vec3(.84,.87,.94),vec3(.91,.92,.97),a_uv.y);gl_Position=vec4(a_position.xy+u_pointer*a_position.z*.007,0.,1.);gl_PointSize=u_dpr*(.9+a_uv.x*2.8);}`,`
 precision mediump float;uniform float u_time,u_alpha;varying float v_light;varying vec3 v_color;
 void main(){float d=length(gl_PointCoord-.5);float a=exp(-d*d*22.);gl_FragColor=vec4(v_color,a*v_light*(.83+.17*sin(u_time*.4+v_light*37.))*u_alpha);}`);
 const orbitProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}${galaxyMotion}uniform float u_time;varying vec2 v_path;void main(){v_path=a_uv;gl_Position=project(galaxy(a_position,u_time));}`,`
 precision mediump float;uniform float u_time,u_alpha;uniform vec3 u_color;varying vec2 v_path;
 void main(){float lead=pow(fract(v_path.x-u_time*.005),22.);float a=(.12+lead*.7)*v_path.y*u_alpha;gl_FragColor=vec4(u_color,a);}`);
 const arrivalTrailProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}${galaxyMotion}uniform float u_time,u_width;varying vec2 v_path;
 void main(){v_path=a_uv;vec3 p=a_position;p.xy+=normalize(p.xy)*u_width*a_uv.y*(.38+.62*(1.-a_uv.x));gl_Position=project(assembledGalaxy(p,u_time,-1.));}`,`
 precision mediump float;uniform float u_alpha;uniform vec3 u_color;varying vec2 v_path;
 void main(){float soft=exp(-v_path.y*v_path.y*4.5)*(1.-smoothstep(.75,1.,abs(v_path.y)));float tail=smoothstep(0.,.2,v_path.x)*pow(v_path.x,1.45);gl_FragColor=vec4(u_color,soft*tail*u_alpha);}`);
 const planetProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}uniform vec3 u_position;uniform highp float u_radius,u_formation,u_index;varying vec2 v_uv;
 void main(){v_uv=a_uv;float intro=1.-smoothstep(.38,.94,u_formation),turn=sin(u_index*1.7)*.32*intro;vec2 q=(a_uv*2.-1.)*vec2(1.+intro*.11,1.-intro*.13);vec3 p=u_position;p.xy+=mat2(cos(turn),sin(turn),-sin(turn),cos(turn))*q*u_radius*1.22;gl_Position=project(p);}`,`
 precision highp float;uniform sampler2D u_texture;uniform float u_time,u_index,u_has_texture,u_alpha,u_focus,u_activation,u_formation;uniform vec3 u_color;varying vec2 v_uv;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 void main(){vec2 q=(v_uv*2.-1.)*1.22;float r=length(q),angle=atan(q.y,q.x);float intro=1.-smoothstep(.38,.94,u_formation);float edge=.92+(.028*sin(angle*7.+u_index)+.035*sin(angle*11.-u_index*.7))*(1.-intro*.85);float halo=exp(-max(r-edge,0.)*12.)*.10*(1.-smoothstep(.9,1.22,r));
 float ignition=smoothstep(0.,.24,u_activation);vec3 glowColor=mix(u_color,vec3(.78,.83,.91),ignition*.85);if(r>edge){gl_FragColor=vec4(glowColor,halo*(1.+ignition*2.5)*u_alpha);return;}
 float z=sqrt(max(0.,1.-pow(r/edge,2.)));vec3 normal=normalize(vec3(q/edge,z));vec2 map=vec2(atan(normal.x,normal.z)/6.28318+.5+u_time*.013,asin(normal.y)/3.14159+.5);map.x=fract(map.x);
 float rock=noise(map*22.+u_index*2.7)*.55+noise(map*51.-u_time*.007)*.3+noise(map*111.)*.15;float pit=pow(1.-noise(map*35.+8.),3.);vec3 light=normalize(vec3(-.55,.45,.8));float lit=.15+.85*max(0.,dot(normal,light));
 vec3 art=texture2D(u_texture,map).rgb;float grey=dot(art,vec3(.299,.587,.114));art=mix(vec3(grey),art,.58);vec3 rockColor=mix(vec3(.19,.2,.23),u_color*.42,.5);vec3 base=mix(rockColor,art*.57,u_has_texture*.6);base*=.66+rock*.67-pit*.23;
 float rim=pow(1.-z,3.)*max(0.,dot(normal.xy,vec2(-.6,.8)));vec3 rgb=base*lit*1.25+u_color*rim*(.18+u_focus*.1)+u_color*.018;rgb+=vec3(.03)*pow(max(0.,dot(reflect(-light,normal),vec3(0.,0.,1.))),11.);
 vec3 polished=mix(vec3(.22,.24,.28),mix(vec3(grey),art,.24),u_has_texture*.62)*(.35+.65*lit);polished+=vec3(.19,.21,.25)*pow(max(0.,dot(reflect(-light,normal),vec3(0.,0.,1.))),24.)+vec3(.10,.12,.15)*rim;rgb=mix(rgb,polished,intro);
 rgb*=1.+ignition*.9;rgb+=vec3(.20,.23,.29)*ignition*(.35+lit*.5);rgb+=vec3(.65,.73,.87)*rim*ignition*.3;float a=1.-smoothstep(edge-.025,edge,r);gl_FragColor=vec4(rgb,a*u_alpha);}`);
 const activationRingProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}uniform vec3 u_attractor;uniform float u_radius,u_activation;varying vec2 v_uv;
 void main(){v_uv=a_uv;vec3 p=u_attractor;p.xy+=(a_uv*2.-1.)*u_radius*(1.55+u_activation*2.);gl_Position=project(p);}`,`
 precision mediump float;uniform float u_activation,u_alpha;varying vec2 v_uv;
 void main(){vec2 p=v_uv*2.-1.;float r=length(p),angle=atan(p.y,p.x);float line=exp(-pow((r-.73)/.0065,2.))*.85+exp(-pow((r-.96)/.004,2.))*.48;float haze=exp(-pow((r-.73)/.065,2.))*.08;float lead=.65+.35*pow(.5+.5*cos(angle-u_activation*7.),5.);float appear=smoothstep(0.,.14,u_activation);gl_FragColor=vec4(vec3(.76,.82,.91),(line*lead+haze)*appear*u_alpha);}`);
 const constellationProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}uniform vec3 u_attractor;uniform vec2 u_direction;varying vec2 v_uv;
 void main(){v_uv=a_uv;vec3 p=a_position;p.xy*=u_direction;gl_Position=project(u_attractor+p);gl_PointSize=u_dpr*(7.+a_uv.y*3.5);}`,`
 precision mediump float;uniform float u_activation,u_alpha,u_kind;varying vec2 v_uv;
 void main(){if(u_kind<.5){float growth=smoothstep(v_uv.x,v_uv.x+.15,u_activation);if(v_uv.y>growth)discard;float head=exp(-pow((v_uv.y-growth)/.1,2.));gl_FragColor=vec4(mix(vec3(.80,.84,.91),vec3(.95,.97,1.),head),(.85+head*.15)*u_alpha);}else{float arrive=smoothstep(v_uv.x,v_uv.x+.045,u_activation);float radius=length(gl_PointCoord-.5);float dot=1.-smoothstep(.16,.32,radius);float halo=exp(-radius*radius*14.)*.30;gl_FragColor=vec4(vec3(.93,.96,1.),(dot+halo)*arrive*u_alpha);}}`);
 const gatherProgram=program(`attribute vec3 a_position;attribute vec2 a_uv;${projection}${galaxyMotion}
 uniform float u_time,u_reveal,u_pointsize;uniform vec4 u_rect;varying vec2 v_uv;varying float v_progress;
 float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){float delay=noise(a_uv)*.16;float t=smoothstep(0.,1.,clamp((u_reveal-delay)/(1.-delay),0.,1.));vec4 from=project(galaxy(a_position,u_time));vec2 start=from.xy/max(1.,from.w);vec2 end=u_rect.xy+(a_uv*2.-1.)*u_rect.zw;vec2 delta=start-end;vec2 swirl=vec2(-delta.y,delta.x)*sin(t*3.14159)*.3;vec2 p=mix(start,end,t)+swirl*(1.-t);v_uv=vec2(a_uv.x,1.-a_uv.y);v_progress=t;gl_Position=vec4(p,0.,1.);gl_PointSize=mix(u_dpr*2.2,u_pointsize,t);}`,`
 precision mediump float;uniform sampler2D u_texture;uniform float u_alpha;varying vec2 v_uv;varying float v_progress;
 void main(){float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.2,.5,d);vec3 rgb=texture2D(u_texture,v_uv).rgb;vec3 color=mix(vec3(.85,.83,.9),rgb,smoothstep(.03,.78,v_progress));color+=rgb*.12*sin(v_progress*3.14159);gl_FragColor=vec4(color,a*u_alpha);}`);
 const backgroundProgram=program(`attribute vec3 a_position;varying vec2 v_uv;void main(){v_uv=a_position.xy*.5+.5;gl_Position=vec4(a_position,1.);}`,`
 precision highp float;varying mediump vec2 v_uv;uniform float u_time,u_progress,u_aspect,u_zoom,u_reveal,u_formation;uniform vec2 u_pointer,u_center;uniform vec3 u_tint;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 // Continuous gradient noise avoids hard cell-shaped islands in the warped nebula.
 vec2 gradient(vec2 p){vec3 h=fract(vec3(p.x,p.y,p.x)*vec3(.1031,.1030,.0973));h+=dot(h,h.yzx+33.33);vec2 v=fract((h.xx+h.yz)*h.zy)*2.-1.;return normalize(v+vec2(.0001));}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 fade=f*f*f*(f*(f*6.-15.)+10.);float n=mix(mix(dot(gradient(i),f),dot(gradient(i+vec2(1.,0.)),f-vec2(1.,0.)),fade.x),mix(dot(gradient(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(gradient(i+vec2(1.,1.)),f-vec2(1.,1.)),fade.x),fade.y);return .5+.5*n;}
 float fbm(vec2 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+3.1;a*=.5;}return f;}
 void main(){vec2 p=(v_uv-.5-u_center*.5)*vec2(u_aspect,1.)/u_zoom;float t=u_time*.023;vec2 g=mat2(.974,-.228,.228,.974)*p;g.y*=2.05;float r=length(g),a=atan(g.y,g.x);vec2 q=g*3.;vec2 flow=vec2(fbm(q+vec2(t,-t)),fbm(q+vec2(-t*.7,t)+4.));vec2 mouse=p-u_pointer*vec2(u_aspect,1.)*.5;q+=flow*2.8+u_pointer*.24*exp(-dot(mouse,mouse)*2.);
 float cloud=fbm(q+vec2(t*.4,-t*.6));float curl=sin(a*3.-r*10.+t*.7+flow.x*3.)*.5+.5;float envelope=exp(-r*r*1.65);float mist=(.10+pow(cloud,1.85)*.9)*envelope*(.6+curl*.4);float wisps=pow(fbm(q*1.9+flow*2.),2.6)*exp(-r*r*.48);float streams=pow(.5+.5*sin(a*4.-r*12.+cloud*5.+u_time*.035),5.)*wisps;
 vec3 coolMist=vec3(.30,.29,.34),silver=vec3(.29,.31,.35),coreTint=vec3(.48,.49,.53);vec3 hue=mix(coolMist,silver,smoothstep(-.4,.65,g.x+flow.x*.18));hue=mix(hue,coreTint,exp(-r*r*11.)*.65);float tintGrey=dot(u_tint,vec3(.299,.587,.114));hue=mix(hue,mix(vec3(tintGrey),u_tint,.12)*.48,u_reveal*.42);
 vec3 color=vec3(.007,.0075,.009)+hue*(mist*1.08+wisps*.47)+mix(vec3(.27,.28,.30),hue,.6)*streams*.32;float core=exp(-r*r*150.);color+=vec3(.68,.70,.76)*core*.11;float vignette=1.-smoothstep(.42,1.3,length((v_uv-.5)*vec2(u_aspect*.72,1.)));color*=.53+.47*vignette;color*=mix(.12,1.,smoothstep(.42,.97,u_formation));color+=hash(gl_FragCoord.xy)*.003;gl_FragColor=vec4(color,1.);}`);
 const ringProgram=program(`attribute vec3 a_position;varying vec2 v_uv;void main(){v_uv=a_position.xy*.5+.5;gl_Position=vec4(a_position,1.);}`,`
 precision mediump float;varying vec2 v_uv;uniform float u_aspect,u_transition,u_time;
 void main(){vec2 p=(v_uv-.5-vec2(0.,.0175))*vec2(u_aspect,1.);float a=atan(p.y,p.x),t=u_transition;float r=.29+pow(t,1.65)*2.1;float wave=sin(a*9.+u_time*1.8)*.013+sin(a*19.-u_time*2.)*.007;float d=abs(length(p)-r-wave);float ring=exp(-d*d/0.000035),haze=exp(-d*d/.0011)*.075;float envelope=smoothstep(.08,.3,t)*(1.-smoothstep(.72,1.,t));gl_FragColor=vec4(vec3(.77,.80,.88),(ring*.5+haze)*envelope);}`);
 function mesh(positions:number[],uvs:number[],mode:number,surfaces?:number[]):Mesh{const position=gl.createBuffer()!,uv=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,position);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,uv);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW);let surface:WebGLBuffer|undefined;if(surfaces){surface=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,surface);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(surfaces),gl.STATIC_DRAW);}return {position,uv,surface,count:positions.length/3,mode};}
 const mobile=matchMedia('(max-width:760px)').matches,starCount=mobile?19000:42000;
 const spherePoint=(lat:number,lon:number,r:number)=>[Math.cos(lat)*Math.sin(lon)*r,Math.sin(lat)*r,Math.cos(lat)*Math.cos(lon)*r];
 // Curved rectangular windows follow latitude and longitude rather than a tangent plane.
 function imageShell(indices:number[],radius:number,offset:number,extent:number,aspects:number[]){
  const positions:number[]=[],uvs:number[]=[],surfaces:number[]=[];
  for(let i=0;i<indices.length;i++){
   const id=indices[i],image=keys[id],aspect=aspects[i%aspects.length];
   const latitudeStep=Math.PI/9,longitudeStep=Math.PI/4;
   const latitude=Math.round(Math.asin(1-2*(i+.5)/indices.length)*.91/latitudeStep)*latitudeStep;
   const longitude=Math.round((i*2.399963+offset)/longitudeStep)*longitudeStep;
   const size=extent+hash(i+41+offset*77)*.14;
   let height=size/Math.sqrt(aspect),width=height*aspect/Math.cos(latitude);
   // Limit polar breadth, keeping the crop window's physical aspect unchanged.
   const shrink=Math.min(1,1.55/width,(Math.PI-2*Math.abs(latitude)-.22)/height);
   width*=shrink;height*=shrink;
   const windowAspect=width*Math.cos(latitude)/height;
   const r=radius+hash(i+14+offset*23)*.035,divisions=18;
   for(let y=0;y<divisions;y++)for(let x=0;x<divisions;x++)for(const k of [0,1,2,0,2,3]){
    const corner=[[x,y],[x,y+1],[x+1,y+1],[x+1,y]][k],fx=corner[0]/divisions,fy=corner[1]/divisions;
    positions.push(...spherePoint(latitude+(fy-.5)*height,longitude+(fx-.5)*width,r));
    uvs.push(fx,1-fy);surfaces.push(windowAspect,image.exposure,id,image.aspect);
   }
  }
  return mesh(positions,uvs,gl.TRIANGLES,surfaces);
 }
 const outerShell=imageShell(keys.map((_,i)=>i),1.09,0,.68,[1.7,1.05,1.9,.9,1.22,1.42,1.8,.95,1.65,1.2,2.,1.1]);
 const innerShell=imageShell([7,3,6,10,1,9,2,4,5],.82,1.28,.91,[1.25,1.85,.86,1.52,1.1,1.72,.92,1.65,1.18]);
 // Triangle ribbons give the outer graticule a reliable slightly thicker stroke on WebGL 1.
 const wirePositions:number[]=[],wireUvs:number[]=[],wireHalfWidth=.0019;
 function wireRibbon(latitude:number,longitude:number,parallel:boolean,segments:number){
  for(let i=0;i<segments;i++)for(const corner of [[0,0],[0,1],[1,1],[0,0],[1,1],[1,0]]){
   const t=(i+corner[0])/segments,cross=(corner[1]*2-1)*wireHalfWidth;
   const lat=parallel?latitude+cross:-Math.PI/2+t*Math.PI;
   const lon=parallel?t*Math.PI*2:longitude+cross/Math.max(.15,Math.cos(lat));
   wirePositions.push(...spherePoint(lat,lon,1.13));wireUvs.push(corner[1],t);
  }
 }
 for(let latitude=-2;latitude<=2;latitude++)wireRibbon(latitude*Math.PI/9,0,true,160);
 for(let longitude=0;longitude<8;longitude++)wireRibbon(0,longitude*Math.PI/4,false,110);
 const orbWire=mesh(wirePositions,wireUvs,gl.TRIANGLES);
 // A lighter inner graticule sits at the radius of the picture sheets and shares their rotation.
 const pictureWirePositions:number[]=[],pictureWireUvs:number[]=[];
 for(let latitude=-2;latitude<=2;latitude++)for(let j=0;j<144;j++)for(const k of [j,j+1]){
  pictureWirePositions.push(...spherePoint(latitude*Math.PI/12,k*Math.PI*2/144,1.065));pictureWireUvs.push(0,0);
 }
 for(let longitude=0;longitude<8;longitude++)for(let j=0;j<96;j++)for(const k of [j,j+1]){
  pictureWirePositions.push(...spherePoint(-Math.PI/2+k*Math.PI/96,longitude*Math.PI/4+Math.PI/16,1.065));pictureWireUvs.push(0,0);
 }
 const pictureWire=mesh(pictureWirePositions,pictureWireUvs,gl.LINES);
 const innerWirePositions:number[]=[],innerWireUvs:number[]=[];
 for(let latitude=-2;latitude<=2;latitude++)for(let j=0;j<120;j++)for(const k of [j,j+1]){
  innerWirePositions.push(...spherePoint(latitude*Math.PI/9,k*Math.PI*2/120,.86));innerWireUvs.push(0,0);
 }
 for(let longitude=0;longitude<8;longitude++)for(let j=0;j<84;j++)for(const k of [j,j+1]){
  innerWirePositions.push(...spherePoint(-Math.PI/2+k*Math.PI/84,longitude*Math.PI/4,.86));innerWireUvs.push(0,0);
 }
 const innerWire=mesh(innerWirePositions,innerWireUvs,gl.LINES);
 const corePositions:number[]=[],coreUvs:number[]=[];
 for(let i=0;i<(mobile?1500:2800);i++){const n=mobile?1500:2800,y=1-2*(i+.5)/n,a=i*2.399963,r=Math.sqrt(1-y*y);corePositions.push(Math.cos(a)*r,y,Math.sin(a)*r);coreUvs.push(hash(i+6321),0);}
 const corePoints=mesh(corePositions,coreUvs,gl.POINTS);
 const networkPositions:number[]=[],networkUvs:number[]=[];
 const networkCount=140,network:number[][]=[];
 for(let i=0;i<networkCount;i++){const y=1-2*(i+.5)/networkCount,a=i*2.399963,r=Math.sqrt(1-y*y);network.push([Math.cos(a)*r,y,Math.sin(a)*r]);}
 for(let i=0;i<network.length;i++)for(let j=i+1;j<network.length;j++){const a=network[i],b=network[j];if(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])<.34){networkPositions.push(...a,...b);networkUvs.push(0,0,0,0);}}
 const coreNetwork=mesh(networkPositions,networkUvs,gl.LINES);
 const fieldPositions:number[]=[],fieldUvs:number[]=[];
 for(let i=0;i<starCount;i++){const r=Math.pow(hash(i+311),.62)*23,arm=i%4,a=arm*Math.PI*.5+r*.26+(hash(i+991)-.5)*(.45+.043*r);fieldPositions.push(Math.cos(a)*r,Math.sin(a)*r,-22+(hash(i+283)-.5)*(.9+r*.08));fieldUvs.push(hash(i+754),hash(i+444)>.979?1:0);}
 for(let i=0;i<4400;i++){const r=Math.pow(hash(i+4215),1.4)*4.4,a=hash(i+7246)*Math.PI*2;fieldPositions.push(Math.cos(a)*r,Math.sin(a)*r,-22+(hash(i+7812)-.5)*1.5);fieldUvs.push(.4+hash(i+3712)*.6,hash(i+6421)>.89?1:0);}
 const fieldPoints=mesh(fieldPositions,fieldUvs,gl.POINTS);
 const skyPositions:number[]=[],skyUvs:number[]=[];
 for(let i=0;i<(mobile?550:1400);i++){skyPositions.push(hash(i+12191)*2-1,hash(i+78891)*2-1,hash(i+4412));skyUvs.push(Math.pow(hash(i+8786),2.5),hash(i+2751));}
 const skyPoints=mesh(skyPositions,skyUvs,gl.POINTS);
 const orbitNodes=nodes.filter((node,i)=>nodes.findIndex(other=>Math.abs(other.orbit-node.orbit)<.01)===i);
 const orbitMeshes=orbitNodes.map(node=>{const pos:number[]=[],uv:number[]=[];for(let j=0;j<320;j++){for(const k of [j,j+1]){const a=k/320*Math.PI*2;pos.push(Math.cos(a)*node.orbit,Math.sin(a)*node.orbit,-22);uv.push(k/320,1);}}return mesh(pos,uv,gl.LINES);});
 const arrivalTrails=nodes.map(node=>{const pos:number[]=[],uv:number[]=[];for(let j=0;j<64;j++)for(const [offset,side] of [[0,-1],[0,1],[1,1],[0,-1],[1,1],[1,-1]]){const t=(j+offset)/64,a=node.phase-.86*(1.-t);pos.push(Math.cos(a)*node.orbit,Math.sin(a)*node.orbit,-22);uv.push(t,side);}return mesh(pos,uv,gl.TRIANGLES);});
 const trailPos:number[]=[],trailUv:number[]=[];
 for(let i=0;i<35;i++){const r=4+hash(i+9155)*25,start=hash(i+1331)*Math.PI*2,extent=.04+hash(i+2159)*.14;for(let j=0;j<16;j++)for(const k of [j,j+1]){const a=start+extent*k/16;trailPos.push(Math.cos(a)*r,Math.sin(a)*r,-22+(hash(i+381)-.5)*3);trailUv.push(k/16,Math.pow(k/16,1.7));}}
 const trails=mesh(trailPos,trailUv,gl.LINES);
 const quad=mesh([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,1,0,1,1,0,1,1],gl.TRIANGLES);
 // Each project grows a different branched star figure from the selected planet.
 const constellationPatterns=[
  [[1.4,.8],[2.8,1.5],[4.2,1.1],[2.6,3.1],[1.4,3.7],[-1.5,.6],[-2.7,1.9],[-4.1,1.4]],
  [[1.3,1.0],[2.4,2.0],[3.8,2.2],[2.6,3.6],[1.2,3.4],[-1.7,-.4],[-3.,.3],[-4.,1.7]],
  [[1.6,.4],[2.8,1.2],[4.4,.9],[2.5,2.6],[3.2,3.7],[-1.3,1.2],[-2.2,2.4],[-3.8,2.9]],
  [[1.1,1.4],[2.5,1.8],[3.7,2.8],[2.1,3.1],[.8,3.8],[-1.5,.2],[-3.,-.8],[-4.2,.4]],
  [[1.7,.6],[3.1,.2],[4.0,1.6],[2.7,2.0],[3.6,3.5],[-1.2,1.3],[-2.8,2.1],[-3.6,3.4]],
  [[1.4,.9],[2.8,1.4],[4.2,2.3],[2.2,2.9],[.9,3.7],[-1.6,.8],[-2.9,1.8],[-3.2,3.1]],
  [[1.1,1.4],[2.3,2.1],[3.9,1.5],[2.6,3.6],[1.0,3.8],[-1.5,.9],[-3.,1.3],[-4.0,2.5]],
  [[1.6,.7],[3.0,1.6],[4.3,1.2],[2.6,2.8],[3.8,3.4],[-1.4,1.1],[-2.9,2.6],[-4.1,2.1]],
 ];
 const starLinks=[[0,1],[1,2],[2,3],[2,4],[4,5],[0,6],[6,7],[7,8]],starDepths=[0,1,2,3,3,4,1,2,3];
 const constellationMeshes=nodes.map((node,index)=>{
  const flip=1,scale=mobile?.76:1;
  const met=node.slug==='metamorphosis',quake=node.slug==='earthquake',sonic=node.slug==='sonic-elasticity',cosmos=node.slug==='infinite-cosmos';
  const pattern=met?[[1.2,1.0],[2.6,2.6],[2.5,.2],[1.4,-1.7],[-1.2,1.0],[-2.6,2.6],[-2.5,.2],[-1.4,-1.7]]:quake?[[1.4,.8],[2.0,1.5],[2.8,.9],[3.5,2.5],[4.1,1.7],[-1.1,1.3],[-2.1,.7],[-3.3,2.1]]:cosmos?[[1.4,.3],[2.5,1.4],[1.5,2.7],[-.2,2.4],[-1.5,1.4],[-2.8,2.6],[3.8,2.3],[1.,4.1]]:sonic?[[1.2,.6],[3.5,.6],[3.5,2.9],[1.2,2.9],[2.3,1.7],[4.6,1.7],[4.6,4.0],[2.3,4.0]]:constellationPatterns[index%constellationPatterns.length];
  const links=met?[[0,1],[1,2],[2,3],[3,0],[0,4],[4,3],[0,5],[5,6],[6,7],[7,0],[0,8],[8,7]]:quake?[[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[6,7],[7,8],[2,6]]:cosmos?[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[2,7],[3,8],[0,4]]:sonic?[[0,1],[1,2],[2,3],[3,4],[4,1],[1,5],[2,6],[3,7],[4,8],[5,6],[6,7],[7,8],[8,5]]:starLinks;
  const depths=met?[0,1,2,3,2,1,2,3,2]:quake?[0,1,2,3,4,5,1,2,3]:cosmos?[0,1,2,3,2,1,2,3,4]:sonic?[0,1,2,3,2,2,3,4,3]:starDepths;
  const points=[[0,0,0],...pattern.map(([x,y])=>[x*flip*scale,y*scale,.05])];
  const linePositions:number[]=[],lineUvs:number[]=[],pointPositions:number[]=[],pointUvs:number[]=[];
  for(const [from,to] of links){const phase=.08+(depths[to]-1)*.17;linePositions.push(...points[from],...points[to]);lineUvs.push(phase,0,phase,1);}
  points.forEach((point,i)=>{if(i===0)return;pointPositions.push(...point);pointUvs.push(.08+(depths[i]-1)*.17+.15,hash(index*19+i));});
  return {lines:mesh(linePositions,lineUvs,gl.LINES),stars:mesh(pointPositions,pointUvs,gl.POINTS)};
 });
 const gatherPositions:number[]=[],gatherUvs:number[]=[],gatherCols=mobile?108:192,gatherRows=Math.round(gatherCols*9/16);
 for(let y=0;y<gatherRows;y++)for(let x=0;x<gatherCols;x++){const id=y*gatherCols+x,index=Math.floor(hash(id+796)*starCount)*3;gatherPositions.push(...fieldPositions.slice(index,index+3));gatherUvs.push((x+.5)/gatherCols,(y+.5)/gatherRows);}
 const gatherPoints=mesh(gatherPositions,gatherUvs,gl.POINTS);
 const background=mesh([-1,-1,0,1,-1,0,-1,1,0,-1,1,0,1,-1,0,1,1,0],Array(12).fill(0),gl.TRIANGLES);
 const load=(key:string,size=640)=>new Promise<HTMLImageElement|null>(resolve=>{const image=new Image();image.onload=()=>image.decode().catch(()=>{}).then(()=>resolve(image));image.onerror=()=>resolve(null);image.src=key.startsWith('/')?key:`/images/${key}-${size}.webp`;});
 function texture(source:TexImageSource){const t=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
 const neutral=document.createElement('canvas');neutral.width=neutral.height=1;neutral.getContext('2d')!.fillRect(0,0,1,1);const blankTexture=texture(neutral),atlasTexture=texture(neutral);
 root!.dataset.atlasCount=String(keys.length);root!.dataset.imageShells='2';root!.dataset.imageWindows='21';root!.dataset.visualStyle='layered-monochrome-pixel';root!.dataset.imageMapping='latitude-longitude';root!.dataset.outerWire='ribbon';
 let atlasPromise:Promise<void>|null=null;
 const ensureAtlas=()=>atlasPromise??=(async()=>{
  const image=await load(entryAtlas.src);if(!image)throw new Error('Entry atlas could not load');
  gl.bindTexture(gl.TEXTURE_2D,atlasTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  root!.dataset.atlasLoaded=String(keys.length);
 })();
 const nodeTextures:(WebGLTexture|null)[]=nodes.map(()=>null);
 let planetsStarted=false;
 const ensurePlanetTextures=()=>{if(planetsStarted)return;planetsStarted=true;nodes.forEach((node,i)=>{if(node.cover)load(node.cover).then(image=>{if(image)nodeTextures[i]=texture(image);});});};
 if(root!.dataset.mode==='explore')ensurePlanetTextures();
 const upgradeTexture=(i:number)=>{if(!nodes[i].cover)return;load(nodes[i].cover!,1280).then(image=>{if(image){const old=nodeTextures[i];nodeTextures[i]=texture(image);if(old)gl.deleteTexture(old);}});};
 let upgraded=-1;const planetFocus=nodes.map(()=>0),quietMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const locations=new Map<WebGLProgram,Map<string,WebGLUniformLocation|null>>();
 const loc=(p:WebGLProgram,name:string)=>{if(!locations.has(p))locations.set(p,new Map());const map=locations.get(p)!;if(!map.has(name))map.set(name,gl.getUniformLocation(p,name));return map.get(name)!;};
 const float=(p:WebGLProgram,name:string,value:number)=>gl.uniform1f(loc(p,name),value);
 const attributes=new Map<WebGLProgram,Map<string,number>>();
 const attributeLocation=(p:WebGLProgram,name:string)=>{if(!attributes.has(p))attributes.set(p,new Map());const map=attributes.get(p)!;if(!map.has(name))map.set(name,gl.getAttribLocation(p,name));return map.get(name)!;};
 function bind(p:WebGLProgram,m:Mesh){gl.useProgram(p);const position=attributeLocation(p,'a_position'),uv=attributeLocation(p,'a_uv');if(position>=0){gl.bindBuffer(gl.ARRAY_BUFFER,m.position);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);}if(uv>=0){gl.bindBuffer(gl.ARRAY_BUFFER,m.uv);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);}const surface=attributeLocation(p,'a_surface');if(surface>=0&&m.surface){gl.bindBuffer(gl.ARRAY_BUFFER,m.surface);gl.enableVertexAttribArray(surface);gl.vertexAttribPointer(surface,4,gl.FLOAT,false,0,0);}}
 let dpr=1,aspect=1,quality=mobile?1:1.2,lost=false;
 const size=()=>{aspect=canvas.clientWidth/Math.max(canvas.clientHeight,1);dpr=scenePixelRatio(canvas.clientWidth,canvas.clientHeight,quality);const w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}};
 const resize=new ResizeObserver(size);resize.observe(canvas);size();
 const viewCamera=sceneCamera;
 const uniforms=(p:WebGLProgram,state:Scene,orb=false)=>{float(p,'u_aspect',aspect);float(p,'u_dpr',dpr);float(p,'u_lens',orb?2.16*Math.min(1,aspect/.85):lensFor(aspect));gl.uniform2f(loc(p,'u_pointer'),state.pointer[0],state.pointer[1]);const cam=orb?{x:0,y:0,z:mix(3.75,.22,smooth(0,.88,state.progress))}:viewCamera(state);gl.uniform3f(loc(p,'u_camera'),cam.x,cam.y,cam.z);float(p,'u_time',state.time);float(p,'u_transition',state.progress);float(p,'u_formation',state.formation);float(p,'u_orbitSpeed',1);gl.uniform2f(loc(p,'u_angles'),state.pitch+state.pointer[1]*.065,state.yaw+state.pointer[0]*.12+(orb?state.time*.048:0));};
 const entryUniforms=(p:WebGLProgram,node:ProjectNode)=>{const entry=node.entry!;float(p,'u_entryPhase',entry.phase);float(p,'u_entryRadius',entry.orbit);float(p,'u_entryOrder',entry.order);float(p,'u_entryCount',entry.count);float(p,'u_basePhase',node.phase);float(p,'u_baseRadius',node.orbit);};
 const draw=(state:Scene)=>{
  if(lost)return;if(state.progress<.55)void ensureAtlas().catch(()=>{});if(state.progress>.01)ensurePlanetTextures();const cam=viewCamera(state),lens=lensFor(aspect),depth=cam.z+22,tint=state.selected>=0?nodes[state.selected].color:[.6,.44,.76];
  if(state.selected>=0&&upgraded!==state.selected){upgraded=state.selected;upgradeTexture(upgraded);}
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);bind(backgroundProgram,background);float(backgroundProgram,'u_time',state.time);float(backgroundProgram,'u_progress',state.progress);float(backgroundProgram,'u_formation',state.formation);float(backgroundProgram,'u_aspect',aspect);float(backgroundProgram,'u_zoom',lens*23/depth);float(backgroundProgram,'u_reveal',state.reveal);gl.uniform2f(loc(backgroundProgram,'u_pointer'),state.pointer[0],state.pointer[1]);gl.uniform2f(loc(backgroundProgram,'u_center'),-cam.x*lens/depth/aspect-state.pointer[0]*.016*lens/aspect,-cam.y*lens/depth+state.pointer[1]*.012*lens);gl.uniform3f(loc(backgroundProgram,'u_tint'),tint[0],tint[1],tint[2]);gl.drawArrays(gl.TRIANGLES,0,background.count);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  bind(skyProgram,skyPoints);uniforms(skyProgram,state);float(skyProgram,'u_alpha',1);gl.drawArrays(gl.POINTS,0,skyPoints.count);
  bind(orbitProgram,trails);uniforms(orbitProgram,state);float(orbitProgram,'u_alpha',mix(.5,.82,smooth(.12,.6,state.progress))*(1-state.reveal*.7)*smooth(.55,.95,state.formation));gl.uniform3f(loc(orbitProgram,'u_color'),.74,.77,.83);gl.drawArrays(gl.LINES,0,trails.count);
  for(let i=0;i<orbitNodes.length;i++){bind(orbitProgram,orbitMeshes[i]);uniforms(orbitProgram,state);float(orbitProgram,'u_orbitSpeed',orbitNodes[i].speed);gl.uniform3f(loc(orbitProgram,'u_color'),.72,.76,.83);float(orbitProgram,'u_alpha',.70*smooth(.90,.995,state.formation)*(1-state.reveal*.75)*smooth(.12,.6,state.progress));gl.drawArrays(gl.LINES,0,orbitMeshes[i].count);}
  const arrivalTrailAlpha=smooth(.012,.09,state.formation)*(1-smooth(.58,.82,state.formation))*smooth(.12,.42,state.progress);
  if(arrivalTrailAlpha>.001)for(let i=0;i<nodes.length;i++){if(i%3!==0)continue;bind(arrivalTrailProgram,arrivalTrails[i]);uniforms(arrivalTrailProgram,state);float(arrivalTrailProgram,'u_orbitSpeed',nodes[i].speed);entryUniforms(arrivalTrailProgram,nodes[i]);float(arrivalTrailProgram,'u_width',nodes[i].radius*2.4);const color=nodes[i].color;gl.uniform3f(loc(arrivalTrailProgram,'u_color'),.44+color[0]*.16,.46+color[1]*.16,.52+color[2]*.16);float(arrivalTrailProgram,'u_alpha',arrivalTrailAlpha*planetArrival(nodes[i].entry!.order,nodes.length,state.formation)*.28);gl.drawArrays(gl.TRIANGLES,0,arrivalTrails[i].count);}
  bind(fieldProgram,fieldPoints);uniforms(fieldProgram,state);float(fieldProgram,'u_activation',state.activation);float(fieldProgram,'u_reveal',state.reveal);const attractor=state.activated>=0?planetPosition(nodes[state.activated],state):[0,0,-22];gl.uniform3f(loc(fieldProgram,'u_attractor'),attractor[0],attractor[1],attractor[2]);float(fieldProgram,'u_alpha',mix(.42,.79,smooth(.1,.85,state.progress))*smooth(.56,.985,state.formation)*(1-.65*smooth(0,.75,state.reveal)));gl.drawArrays(gl.POINTS,0,fieldPoints.count);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const activationAlpha=state.activated>=0?smooth(0.,.1,state.activation)*(1-smooth(.12,.50,state.reveal))*(1-smooth(0.,.2,state.indexActivation)):0;
  if(activationAlpha>.001){const shape=constellationMeshes[state.activated];const directionX=attractor[0]>cam.x?-1:1,directionY=attractor[1]>cam.y?-1:1;
   for(const [mesh,kind] of [[shape.lines,0],[shape.stars,1]] as const){bind(constellationProgram,mesh);uniforms(constellationProgram,state);gl.uniform3f(loc(constellationProgram,'u_attractor'),attractor[0],attractor[1],attractor[2]);gl.uniform2f(loc(constellationProgram,'u_direction'),directionX,directionY);float(constellationProgram,'u_activation',state.activation);float(constellationProgram,'u_alpha',activationAlpha);float(constellationProgram,'u_kind',kind);gl.drawArrays(mesh.mode,0,mesh.count);}
  }
  const planetOrder=nodes.map((_,i)=>i);if(state.formation<1)planetOrder.sort((a,b)=>planetPosition(nodes[a],state)[2]-planetPosition(nodes[b],state)[2]);
  for(const i of planetOrder){const node=nodes[i],p=planetPosition(node,state);planetFocus[i]=state.indexActivation>.01?0:quietMotion.matches?(state.focus===i?1:0):mix(planetFocus[i],state.focus===i?1:0,.09);bind(planetProgram,quad);uniforms(planetProgram,state);gl.uniform3f(loc(planetProgram,'u_position'),...p);gl.uniform3f(loc(planetProgram,'u_color'),...node.color);float(planetProgram,'u_radius',node.radius*formationScale(state.formation)*(1+planetFocus[i]*.12));float(planetProgram,'u_index',i);float(planetProgram,'u_focus',planetFocus[i]);float(planetProgram,'u_activation',Math.max(state.activated===i?state.activation:0,smooth(.04+i*.025,.46+i*.025,state.indexActivation)*.8));float(planetProgram,'u_alpha',smooth(.26,.60,state.progress)*planetArrival(node.entry!.order,nodes.length,state.formation)*(1-smooth(0,.4,state.reveal)));float(planetProgram,'u_has_texture',nodeTextures[i]?1:0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,nodeTextures[i]??blankTexture);gl.uniform1i(loc(planetProgram,'u_texture'),0);gl.drawArrays(gl.TRIANGLES,0,quad.count);}
  if(activationAlpha>.001){bind(activationRingProgram,quad);uniforms(activationRingProgram,state);gl.uniform3f(loc(activationRingProgram,'u_attractor'),attractor[0],attractor[1],attractor[2]);float(activationRingProgram,'u_radius',nodes[state.activated].radius);float(activationRingProgram,'u_activation',state.activation);float(activationRingProgram,'u_alpha',activationAlpha);gl.drawArrays(gl.TRIANGLES,0,quad.count);}
  const orbAlpha=1-smooth(.32,.54,state.progress);
  if(orbAlpha>.001){
   const sheets=(pass:number,shell:Mesh,layer:number,opacity=1)=>{bind(orbProgram,shell);uniforms(orbProgram,state,true);float(orbProgram,'u_layer',layer);float(orbProgram,'u_pass',pass);float(orbProgram,'u_alpha',orbAlpha*opacity);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlasTexture);gl.uniform1i(loc(orbProgram,'u_texture'),0);gl.drawArrays(gl.TRIANGLES,0,shell.count);};
   const wire=(pass:number,lines:Mesh=orbWire,opacity=1,layer=0)=>{bind(wireProgram,lines);uniforms(wireProgram,state,true);float(wireProgram,'u_layer',layer);float(wireProgram,'u_pass',pass);float(wireProgram,'u_alpha',orbAlpha*opacity);float(wireProgram,'u_band',lines.mode===gl.TRIANGLES?1:0);gl.drawArrays(lines.mode,0,lines.count);};
   wire(-1);wire(-1,pictureWire,.20);sheets(-1,outerShell,0);wire(-1,innerWire,.065,1);sheets(-1,innerShell,1,.82);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
   bind(coreProgram,coreNetwork);uniforms(coreProgram,state,true);float(coreProgram,'u_mode',1);float(coreProgram,'u_alpha',orbAlpha*1.05);gl.drawArrays(gl.LINES,0,coreNetwork.count);
   bind(coreProgram,corePoints);uniforms(coreProgram,state,true);
   float(coreProgram,'u_mode',2);float(coreProgram,'u_alpha',orbAlpha*.3);gl.drawArrays(gl.POINTS,0,corePoints.count);
   float(coreProgram,'u_mode',0);float(coreProgram,'u_alpha',orbAlpha*1.5);gl.drawArrays(gl.POINTS,0,corePoints.count);
   gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);sheets(1,innerShell,1,.82);wire(1,innerWire,.065,1);sheets(1,outerShell,0);wire(1,pictureWire,.20);wire(1);
  }
  if(state.progress>.01&&state.progress<.999){gl.blendFunc(gl.SRC_ALPHA,gl.ONE);bind(ringProgram,background);float(ringProgram,'u_aspect',aspect);float(ringProgram,'u_transition',state.progress);float(ringProgram,'u_time',state.time);gl.drawArrays(gl.TRIANGLES,0,background.count);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
  if(state.selected>=0&&state.reveal>.001&&nodeTextures[state.selected]){bind(gatherProgram,gatherPoints);uniforms(gatherProgram,state);float(gatherProgram,'u_reveal',state.reveal);float(gatherProgram,'u_alpha',smooth(0,.09,state.reveal)*(1-smooth(.86,1,state.reveal)));float(gatherProgram,'u_pointsize',state.pointSize*dpr*1.4);gl.uniform4f(loc(gatherProgram,'u_rect'),...state.rect);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,nodeTextures[state.selected]);gl.uniform1i(loc(gatherProgram,'u_texture'),0);gl.drawArrays(gl.POINTS,0,gatherPoints.count);}
 };
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;root!.dataset.ready='false';root!.dataset.rendering='fallback';});
 canvas.addEventListener('webglcontextrestored',()=>location.reload());
 // The entry must never expose empty image shells or partially filled textures.
 if(root!.dataset.mode==='intro')await ensureAtlas();
 return {draw,resize:size,dispose:()=>{lost=true;resize.disconnect();gl.getExtension('WEBGL_lose_context')?.loseContext();},reduceQuality:()=>{if(quality>.91){quality=.9;size();}},count:fieldPoints.count+skyPoints.count,gatherCols};
}

if(root){
  const canvas=root.querySelector<HTMLCanvasElement>('canvas')!,nodes=JSON.parse(root.dataset.scene!) as ProjectNode[],keys=JSON.parse(root.dataset.atlas!) as PlanetImage[];
  const entry=root.querySelector<HTMLElement>('[data-entry]')!,nav=root.querySelector<HTMLElement>('[data-space-navigation]')!,labels=root.querySelector<HTMLElement>('[data-space-projects]')!,footer=root.querySelector<HTMLElement>('[data-space-footer]')!;
  const projectElements=[...root.querySelectorAll<HTMLButtonElement>('[data-space-project]')];
  const indexStar=root.querySelector<HTMLAnchorElement>('[data-space-index-star]')!;
  const indexConstellation=root.querySelector<SVGSVGElement>('[data-index-constellation]')!;
  const indexRays=[...indexConstellation.querySelectorAll<SVGPathElement>('[data-index-ray]')],indexConnections=[...indexConstellation.querySelectorAll<SVGPathElement>('[data-index-connection]')];
  let indexOrder:number[]=[];
  const panel=root.querySelector<HTMLElement>('[data-space-reveal]')!,imageFrame=root.querySelector<HTMLElement>('[data-reveal-frame]')!,closeButton=root.querySelector<HTMLButtonElement>('[data-reveal-close]')!;
  const content=JSON.parse(root.querySelector('[data-reveal-content]')!.textContent!) as {slug:string;title:string;intro:string;keywords:string;status:string;cover:string|null}[];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),isMobile=matchMedia('(max-width:760px)').matches;
  const defaultZoom=isMobile?7:5,target:Camera={x:0,y:0,z:defaultZoom},camera={...target};
  const directExplore=root.dataset.mode==='explore';
  const previewValue=new URL(location.href).searchParams.get('formation-preview'),preview=previewValue!==null?clamp(Number(previewValue)||0,0,1):null;
  const state:Scene={time:preview===null?0:preview*EXPLORE_FORMATION_MS/1000,progress:directExplore?1:0,formation:reduced.matches?1:directExplore?preview??0:1,yaw:-.31,pitch:.23,pointer:[0,0],camera,selected:-1,focus:-1,activated:-1,activation:0,indexActivation:0,reveal:0,rect:[0,0,.5,.5],pointSize:4};
  let renderer:Awaited<ReturnType<typeof createRenderer>>=null,frame=0,last=0,elapsed=0,paused=false,lostFocus=false;
  let pointerTarget:[number,number]=[0,0],pointerDown=false,pointerX=0,pointerY=0,startX=0,startY=0,didDrag=false,dragEnded=-1000,pointerTime=0;
  let velocityX=0,velocityY=0,angularVelocity=0,tiltVelocity=0,focusIndex=-1;
  let transition:{start:number;from:number;to:number;push:boolean;duration:number}|null=null;
  let revealMotion:{start:number;from:number;to:number;duration:number}|null=null,previousView:Camera|null=null;
  let activationMotion:{start:number;from:number;to:number;duration:number}|null=null;
  let indexMotion:{start:number;from:number;to:number;duration:number}|null=null;
  let frames=0,frameTotal=0,lastPersist=0,rectDirty=true;
  let lastLabelLayout=0,lastLabelFocus=-1;
  const labelWidths=nodes.map(node=>[...node.title].reduce((width,char)=>width+(char.charCodeAt(0)>255?(isMobile?11:14):(isMobile?6:7)),22));
  let formationMotion:{start:number;from:number;duration:number}|null=null;
  const storageKey=`euan-galaxy-v2-${root.dataset.lang}`;
  try{const saved=JSON.parse(sessionStorage.getItem(storageKey)??'null');if(saved&&[saved.x,saved.y,saved.z].every(Number.isFinite)){target.x=camera.x=clamp(saved.x,-18,18);target.y=camera.y=clamp(saved.y,-12,12);target.z=camera.z=clamp(saved.z,-5,8);}}catch{}
  function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(previousView??camera));}catch{}}
  function refreshMode(){const p=state.progress;entry.hidden=p>.4;nav.hidden=p<.86;labels.hidden=p<.62;footer.hidden=p<.88;indexStar.hidden=p<.88;entry.style.opacity=String(1-smooth(0,.3,p));root!.dataset.mode=transition?'entering':p>.5?'explore':'intro';}
  function prepareEntry(){const slots=formationSlots(nodes,state.time,state.yaw);nodes.forEach((node,i)=>node.entry=slots[i]);}
 prepareEntry();
 function go(explore:boolean,push=true){if(transition)return;if(state.selected>=0){closeProject(true);}state.indexActivation=0;indexMotion=null;focusIndex=-1;state.activated=-1;state.activation=0;activationMotion=null;const start=performance.now();if(explore)prepareEntry();state.formation=explore&&!reduced.matches?0:1;formationMotion=explore&&!reduced.matches?{start:start+700,from:0,duration:EXPLORE_FORMATION_MS-700}:null;transition={start,from:state.progress,to:explore?1:0,push,duration:reduced.matches?100:explore?1000:1700};root!.dataset.mode='entering';schedule();}
  function finish(explore:boolean,push:boolean){transition=null;state.progress=explore?1:0;refreshMode();if(push){const next=explore?root!.dataset.explorePath!:root!.dataset.homePath!;if(location.pathname!==next)history.pushState({portfolioSpace:true},'',next);}document.title=(explore?(root!.dataset.lang==='zh'?'作品空间':'Explore'):(root!.dataset.lang==='zh'?'首页':'Home'))+' · EUAN PLANET';dispatchEvent(new Event('portfolio:state'));root!.querySelector('[data-space-announcement]')!.textContent=explore?(root!.dataset.lang==='zh'?'已进入 EUAN PLANET 星系。点击小行星展开作品；拖动、方向键与 Tab 可探索。':'EUAN PLANET entered. Select a planet to reveal its project. Drag, arrow keys and Tab explore the galaxy.'):'';}
  function measureReveal(){const r=imageFrame.getBoundingClientRect(),b=root!.getBoundingClientRect();state.rect=[((r.left-b.left+r.width/2)/b.width)*2-1,1-((r.top-b.top+r.height/2)/b.height)*2,r.width/b.width,r.height/b.height];state.pointSize=r.width/(renderer?.gatherCols??192);rectDirty=false;}
  function hoverIndex(active:boolean){
    if(state.selected>=0||transition||state.progress<.98||state.formation<.95)return;
    if(active){focusIndex=-1;state.activated=-1;state.activation=0;activationMotion=null;indexOrder=[];}
    if(reduced.matches){state.indexActivation=active?1:0;indexMotion=null;}
    else indexMotion={start:performance.now(),from:state.indexActivation,to:active?1:0,duration:active?1400:600};
    schedule();
  }
  function hoverProject(index:number){
    focusIndex=index;
    if(state.selected>=0||transition||state.progress<.98||state.formation<.95)return;
    if(index>=0&&state.indexActivation>0)hoverIndex(false);
    if(index<0){if(state.activated>=0)activationMotion={start:performance.now(),from:state.activation,to:0,duration:reduced.matches?100:600};}
    else if(state.activated!==index||activationMotion?.to===0){
      if(state.activated!==index)state.activation=0;
      state.activated=index;
      if(reduced.matches){state.activation=1;activationMotion=null;}else activationMotion={start:performance.now(),from:state.activation,to:1,duration:1400};
    }
    schedule();
  }
  function openProject(index:number){
    if(performance.now()-dragEnded<250||state.selected>=0||transition||state.formation<.95)return;
    state.indexActivation=0;indexMotion=null;
    const item=content[index],node=nodes[index];previousView={...camera};velocityX=velocityY=0;state.selected=index;state.reveal=0;if(state.activated!==index)state.activation=0;state.activated=index;activationMotion=reduced.matches?null:{start:performance.now(),from:state.activation,to:1,duration:350};if(reduced.matches)state.activation=1;root!.dataset.selected='true';panel.hidden=false;
    panel.querySelector('[data-reveal-title]')!.textContent=item.title;panel.querySelector('[data-reveal-intro]')!.textContent=item.intro;panel.querySelector('[data-reveal-keywords]')!.textContent=item.keywords;
    panel.querySelectorAll<HTMLImageElement>('[data-reveal-image]').forEach(image=>image.hidden=image.dataset.revealImage!==item.slug);
    const pending=panel.querySelector<HTMLElement>('[data-reveal-pending]')!;pending.hidden=Boolean(item.cover);pending.textContent=item.status==='progress'?(root!.dataset.lang==='zh'?'作品进行中':'WORK IN PROGRESS'):(root!.dataset.lang==='zh'?'作品资料整理中':'PROJECT MATERIAL COMING SOON');
    const link=panel.querySelector<HTMLAnchorElement>('[data-reveal-link]')!;link.hidden=item.status!=='published';link.href=`/${root!.dataset.lang}/work/${item.slug}/`;if(item.status==='published')dispatchEvent(new CustomEvent('portfolio:prepare-project',{detail:link.href}));
    if(item.status==='published'){imageFrame.dataset.projectHref=link.href;imageFrame.setAttribute('role','link');imageFrame.tabIndex=0;imageFrame.setAttribute('aria-label',(root!.dataset.lang==='zh'?'查看作品：':'View project: ')+item.title);}else{delete imageFrame.dataset.projectHref;imageFrame.removeAttribute('role');imageFrame.tabIndex=-1;}
    nav.inert=labels.inert=footer.inert=indexStar.inert=true;
    const position=planetPosition(node,state);target.x=position[0]*.42;target.y=position[1]*.42;target.z=3;
    panel.style.setProperty('--reveal-opacity','0');panel.style.setProperty('--image-opacity','0');closeButton.focus({preventScroll:true});rectDirty=true;
    revealMotion={start:performance.now(),from:0,to:1,duration:reduced.matches||!renderer?100:2400};schedule();
  }
  function completeClose(){const selected=state.selected;state.selected=-1;state.activated=-1;state.activation=0;activationMotion=null;state.reveal=0;revealMotion=null;root!.dataset.selected='false';panel.hidden=true;nav.inert=labels.inert=footer.inert=indexStar.inert=false;previousView=null;projectElements[selected]?.focus({preventScroll:true});save();}
  function closeProject(immediate=false){if(state.selected<0)return;if(previousView)Object.assign(target,previousView);if(immediate){completeClose();return;}const start=performance.now(),duration=reduced.matches?100:700;activationMotion={start,from:state.activation,to:0,duration};revealMotion={start,from:state.reveal,to:0,duration};schedule();}
  root.querySelectorAll<HTMLAnchorElement>('[data-enter]').forEach(link=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();if(performance.now()-dragEnded<250)return;go(true);}));
  root.querySelector('[data-space-return]')!.addEventListener('click',event=>{event.preventDefault();save();go(false);});
  indexStar.addEventListener('pointerenter',()=>hoverIndex(true));
  indexStar.addEventListener('pointerleave',()=>{if(!indexStar.matches(':focus-visible'))hoverIndex(false);});
  indexStar.addEventListener('focus',()=>{if(indexStar.matches(':focus-visible'))hoverIndex(true);});
  indexStar.addEventListener('blur',()=>{if(!indexStar.matches(':hover'))hoverIndex(false);});
  indexStar.addEventListener('click',event=>{if(performance.now()-dragEnded<250)event.preventDefault();else save();});
  root.querySelector('[data-space-reset]')!.addEventListener('click',event=>{event.preventDefault();target.x=target.y=0;target.z=defaultZoom;velocityX=velocityY=0;schedule();});
  root.querySelector('[data-space-pause]')!.addEventListener('click',event=>{paused=!paused;const button=event.currentTarget as HTMLButtonElement;button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',root!.dataset.lang==='zh'?(paused?'继续背景动效':'暂停背景动效'):(paused?'Resume ambient motion':'Pause ambient motion'));button.firstElementChild!.textContent=paused?'▷':'Ⅱ';schedule();});
  const enterSelected=()=>{if(imageFrame.dataset.projectHref)dispatchEvent(new CustomEvent('portfolio:enter-project',{detail:imageFrame.dataset.projectHref}));};
  imageFrame.addEventListener('click',enterSelected);imageFrame.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();enterSelected();}});
  closeButton.addEventListener('click',()=>closeProject());
  projectElements.forEach((element,i)=>{
    element.addEventListener('click',()=>openProject(i));
    element.addEventListener('pointerenter',()=>hoverProject(i));
    element.addEventListener('pointerleave',()=>{if(!element.matches(':focus-visible'))hoverProject(-1);});
    element.addEventListener('focus',()=>{if(element.matches(':focus-visible'))hoverProject(i);if(state.progress>.98&&state.selected<0){const b=element.getBoundingClientRect();if(b.left<20||b.right>root!.clientWidth-20||b.top<100||b.bottom>root!.clientHeight-80){const p=planetPosition(nodes[i],state);target.x=p[0]*.6;target.y=p[1]*.6;}}schedule();});
    element.addEventListener('blur',()=>{if(!element.matches(':hover'))hoverProject(-1);});
  });
  root.addEventListener('pointerdown',event=>{if(event.button!==0||transition||state.selected>=0||(event.target as HTMLElement).closest('.space-navigation,.space-pause,.space-enter,.space-index-star'))return;pointerDown=true;didDrag=false;startX=pointerX=event.clientX;startY=pointerY=event.clientY;pointerTime=performance.now();velocityX=velocityY=0;});
  root.addEventListener('pointermove',event=>{const rect=root!.getBoundingClientRect();pointerTarget=[(event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2];if(pointerDown){const now=performance.now(),dt=Math.max((now-pointerTime)/1000,.012),dx=event.clientX-pointerX,dy=event.clientY-pointerY;if(Math.hypot(event.clientX-startX,event.clientY-startY)>6){didDrag=true;root!.dataset.dragging='true';if(!root!.hasPointerCapture(event.pointerId))root!.setPointerCapture(event.pointerId);}if(didDrag){if(state.progress<.1){state.yaw+=dx*.004;state.pitch=clamp(state.pitch+dy*.0025,-1.1,1.1);angularVelocity=clamp(dx*.004/dt,-1,1);tiltVelocity=clamp(dy*.0025/dt,-.6,.6);}else{const scale=rect.height*.5*lensFor(rect.width/rect.height)/24,mx=-dx/scale,my=dy/scale;target.x=clamp(target.x+mx,-18,18);target.y=clamp(target.y+my,-12,12);velocityX=clamp(mx/dt,-10,10);velocityY=clamp(my/dt,-10,10);}}pointerX=event.clientX;pointerY=event.clientY;pointerTime=now;}schedule();});
  const release=(event:PointerEvent)=>{if(!pointerDown)return;pointerDown=false;root!.dataset.dragging='false';if(root!.hasPointerCapture(event.pointerId))root!.releasePointerCapture(event.pointerId);if(didDrag)dragEnded=performance.now();save();};
  root.addEventListener('pointerup',release);root.addEventListener('pointercancel',release);root.addEventListener('pointerleave',()=>{if(!pointerDown)pointerTarget=[0,0];});
  root.addEventListener('wheel',event=>{if(state.progress<.98||transition||state.selected>=0)return;event.preventDefault();target.z=clamp(target.z+event.deltaY*.006,-5,8);save();schedule();},{passive:false});
  root.addEventListener('keydown',event=>{
    if(state.selected>=0){if(event.key==='Escape'){event.preventDefault();closeProject();}if(event.key==='Tab'){const controls=[closeButton,...(imageFrame.tabIndex===0?[imageFrame]:[]),...panel.querySelectorAll<HTMLAnchorElement>('a:not([hidden])')],first=controls[0],lastControl=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();lastControl.focus();}else if(!event.shiftKey&&document.activeElement===lastControl){event.preventDefault();first.focus();}}return;}
    if(state.progress<.98||(event.target as HTMLElement).closest('.space-navigation'))return;
    const movement:Record<string,[number,number]>={ArrowLeft:[-1.1,0],ArrowRight:[1.1,0],ArrowUp:[0,1.1],ArrowDown:[0,-1.1]};if(movement[event.key]){event.preventDefault();target.x=clamp(target.x+movement[event.key][0],-18,18);target.y=clamp(target.y+movement[event.key][1],-12,12);schedule();}if(event.key==='Escape')go(false);if(event.key==='+'||event.key==='='){target.z=clamp(target.z-.8,-5,8);schedule();}if(event.key==='-'){target.z=clamp(target.z+.8,-5,8);schedule();}
  });
  function projectUI(){
    if(state.progress<.26)return;const projectedCamera=sceneCamera(state);const width=root!.clientWidth,height=root!.clientHeight,aspect=width/height,lens=lensFor(aspect),px=(state.pointer[0]+1)*width*.5,py=(1-state.pointer[1])*height*.5;
    const projected:{x:number;y:number;radius:number;shown:boolean;size:number}[]=[];
    for(let i=0;i<nodes.length;i++){
      const node=nodes[i],p=planetPosition(node,state),depth=projectedCamera.z-p[2],scale=height*.5*lens/depth,x=width*.5+(p[0]-projectedCamera.x-depth*state.pointer[0]*.016)*scale,y=height*.5-(p[1]-projectedCamera.y-depth*state.pointer[1]*.012)*scale;
      const near=Math.exp(-Math.pow(Math.hypot(x-px,y-py)/145,2)),shown=depth>2&&x>38&&x<width-38&&y>95&&y<height-85;
      const label=projectElements[i],size=clamp(node.radius*formationScale(state.formation)*scale*2.44,22,76);
      label.style.transform=`translate3d(${(x-36).toFixed(1)}px,${(y-36).toFixed(1)}px,0)`;label.style.opacity=String(shown?smooth(.42,.8,state.progress)*smooth(.76,.99,state.formation)*(.85+.15*(focusIndex===i?1:near)):0);label.dataset.active=String(state.activated===i&&state.activation>.01||state.indexActivation>.15+i*.025);label.style.pointerEvents=shown&&state.selected<0&&state.formation>.95?'auto':'none';label.tabIndex=shown&&state.formation>.95?0:-1;
      projected.push({x,y,radius:node.radius*scale,shown,size});
      label.style.setProperty('--planet-size',`${size.toFixed(1)}px`);label.style.setProperty('--label-top',`${(40+size*.48).toFixed(1)}px`);label.style.setProperty('--label-alpha',String(.75+.25*near));
    }
    // Dense future catalogues keep every planet accessible, with nearby titles revealed on hover.
    const labelNow=performance.now();
    if(nodes.length>12&&(labelNow-lastLabelLayout>180||lastLabelFocus!==focusIndex)){
      lastLabelLayout=labelNow;lastLabelFocus=focusIndex;
      const occupied:{left:number;right:number;top:number;bottom:number}[]=[];
      const order=nodes.map((_,i)=>i).sort((a,b)=>Number(b===focusIndex)-Number(a===focusIndex)||a-b);
      for(const i of order){const p=projected[i],box={left:p.x-labelWidths[i]/2-6,right:p.x+labelWidths[i]/2+6,top:p.y+4+p.size*.48-3,bottom:p.y+4+p.size*.48+21};
        const crowded=!p.shown||occupied.some(other=>box.left<other.right&&box.right>other.left&&box.top<other.bottom&&box.bottom>other.top);
        const value=String(crowded&&i!==focusIndex);if(projectElements[i].dataset.labelCrowded!==value)projectElements[i].dataset.labelCrowded=value;
        if(!crowded)occupied.push(box);
      }
    }
    // The clickable core lives at the same world-space origin as the galaxy.
    const coreDepth=projectedCamera.z+22,coreScale=height*.5*lens/coreDepth;
    const coreX=width*.5+(-projectedCamera.x-coreDepth*state.pointer[0]*.016)*coreScale,coreY=height*.5-(-projectedCamera.y-coreDepth*state.pointer[1]*.012)*coreScale;
    const coreShown=state.progress>.6&&state.formation>.015&&state.selected<0&&coreX>38&&coreX<width-38&&coreY>95&&coreY<height-85;
    indexStar.style.transform=`translate3d(${(coreX-38).toFixed(1)}px,${(coreY-38).toFixed(1)}px,0)`;
    indexStar.style.opacity=coreShown?String(smooth(.62,.82,state.formation)): '0';indexStar.style.pointerEvents=coreShown&&state.formation>.95?'auto':'none';indexStar.tabIndex=coreShown&&state.formation>.95?0:-1;
    root!.style.setProperty('--index-progress',String(smooth(0,1,state.indexActivation)));
    indexConstellation.style.opacity=String(smooth(0,.12,state.indexActivation));
    if(state.indexActivation>0){
      indexConstellation.setAttribute('viewBox',`0 0 ${width} ${height}`);
      if(!indexOrder.length)indexOrder=projected.map((p,i)=>({i,angle:Math.atan2(p.y-coreY,p.x-coreX)})).sort((a,b)=>a.angle-b.angle).map(p=>p.i);
      const edge=(a:{x:number;y:number},b:{x:number;y:number},radius:number)=>{const distance=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),amount=radius/distance;return {x:a.x+(b.x-a.x)*amount,y:a.y+(b.y-a.y)*amount};};
      const path=(a:{x:number;y:number},b:{x:number;y:number})=>`M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      const core={x:coreX,y:coreY};
      projected.forEach((p,i)=>{
        const end=edge(p,core,p.radius+3),start=edge(core,p,20);
        indexRays[i].setAttribute('d',path(start,end));
        indexRays[i].style.strokeDashoffset=String(1-smooth(i*.025,.46+i*.025,state.indexActivation));
      });
      indexOrder.forEach((node,i)=>{
        const a=projected[node],b=projected[indexOrder[(i+1)%indexOrder.length]];
        indexConnections[i].setAttribute('d',path(edge(a,b,a.radius+3),edge(b,a,b.radius+3)));
        indexConnections[i].style.strokeDashoffset=String(1-smooth(.38+i*.035,.74+i*.035,state.indexActivation));
      });
    }
    if(state.selected>=0){if(rectDirty)measureReveal();panel.style.setProperty('--reveal-opacity',String(smooth(.22,.65,state.reveal)));panel.style.setProperty('--image-opacity',String(smooth(.76,1,state.reveal)));panel.style.setProperty('--reveal-events',state.reveal>.6?'auto':'none');}
  }
  function tick(now:number){
    frame=0;if(document.hidden||lostFocus||!root!.isConnected)return;if(last&&now-last<1000/60-.5){frame=requestAnimationFrame(tick);return;}const rawDt=last?(now-last)/1000:1/60,dt=Math.min(rawDt,.045);last=now;
    if(!paused&&!reduced.matches&&preview===null){state.time+=dt;elapsed+=dt;}const easing=reduced.matches?1:1-Math.exp(-dt*5.5);const pointerScale=state.selected>=0?.15:1;state.pointer[0]+=(pointerTarget[0]*pointerScale-state.pointer[0])*easing;state.pointer[1]+=(pointerTarget[1]*pointerScale-state.pointer[1])*easing;
    if(!pointerDown){velocityX*=Math.exp(-dt*4.4);velocityY*=Math.exp(-dt*4.4);target.x=clamp(target.x+velocityX*dt,-18,18);target.y=clamp(target.y+velocityY*dt,-12,12);angularVelocity*=Math.exp(-dt*3.1);tiltVelocity*=Math.exp(-dt*3.8);if(state.progress<.1&&!reduced.matches&&!paused){state.yaw+=angularVelocity*dt;state.pitch=clamp(state.pitch+tiltVelocity*dt,-1.1,1.1);}}
    camera.x+=(target.x-camera.x)*easing;camera.y+=(target.y-camera.y)*easing;camera.z+=(target.z-camera.z)*easing;
    if(formationMotion){const t=clamp((now-formationMotion.start)/formationMotion.duration,0,1);state.formation=mix(formationMotion.from,1,t);if(t>=1)formationMotion=null;}
    const formationPhase=state.formation<.25?'orbits':state.formation<1?'unfurling':'settled';
    if(root!.dataset.formationPhase!==formationPhase)root!.dataset.formationPhase=formationPhase;
    if(transition){const t=clamp((now-transition.start)/transition.duration,0,1);state.progress=mix(transition.from,transition.to,t*t*(3-2*t));refreshMode();if(t>=1)finish(transition.to>0,transition.push);}
    if(activationMotion){const t=clamp((now-activationMotion.start)/activationMotion.duration,0,1);state.activation=mix(activationMotion.from,activationMotion.to,t);if(t>=1){if(activationMotion.to===0)state.activated=-1;activationMotion=null;}}
    if(indexMotion){const t=clamp((now-indexMotion.start)/indexMotion.duration,0,1);state.indexActivation=mix(indexMotion.from,indexMotion.to,t);if(t>=1)indexMotion=null;}
    const indexPhase=state.indexActivation<.001?'idle':indexMotion?.to===0?'retreat':state.indexActivation>.98?'formed':'growing';
    if(root!.dataset.indexActivationPhase!==indexPhase)root!.dataset.indexActivationPhase=indexPhase;
    const activationPhase=state.selected>=0?'reveal':state.activated<0?'idle':activationMotion?.to===0?'retreat':state.activation>.98?'formed':'growing';if(root!.dataset.activationPhase!==activationPhase)root!.dataset.activationPhase=activationPhase;
    if(revealMotion){const t=clamp((now-revealMotion.start)/revealMotion.duration,0,1);state.reveal=mix(revealMotion.from,revealMotion.to,t);if(t>=1){const closing=revealMotion.to===0;revealMotion=null;if(closing)completeClose();else root!.querySelector('[data-space-announcement]')!.textContent=content[state.selected].title+(root!.dataset.lang==='zh'?'，封面已展开。':' cover revealed.');}}
    if(renderer){projectUI();renderer.draw({...state,focus:focusIndex});}else if(state.selected>=0){panel.style.setProperty('--reveal-opacity','1');panel.style.setProperty('--image-opacity','1');panel.style.setProperty('--reveal-events','auto');}
    if(now-lastPersist>1500){save();lastPersist=now;}frames++;frameTotal+=rawDt;if(frameTotal>2){root!.dataset.fps=String(Math.round(frames/frameTotal));if(frames/frameTotal<38&&elapsed>5)renderer?.reduceQuality();frames=0;frameTotal=0;}
    const moving=Math.hypot(target.x-camera.x,target.y-camera.y,target.z-camera.z)>.01;
    if(!reduced.matches||pointerDown||transition||formationMotion||activationMotion||indexMotion||revealMotion||moving)frame=requestAnimationFrame(tick);
  }
  function schedule(){if(!frame&&!document.hidden&&!lostFocus&&root!.isConnected){last=0;frame=requestAnimationFrame(tick);}}
  addEventListener('resize',()=>{rectDirty=true;schedule();});
  addEventListener('popstate',()=>{if(!root!.isConnected)return;const explore=location.pathname===root!.dataset.explorePath;if(state.selected>=0)closeProject(true);if((state.progress>.5)!==explore)go(explore,false);else schedule();});
  reduced.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;save();}else schedule();});
  addEventListener('portfolio:scene-pause',()=>{cancelAnimationFrame(frame);frame=0;lostFocus=true;});
  addEventListener('portfolio:scene-resume',()=>{lostFocus=false;schedule();});
  addEventListener('portfolio:portal-start',()=>{cancelAnimationFrame(frame);frame=0;lostFocus=true;save();});
  addEventListener('portfolio:page-leave',()=>{cancelAnimationFrame(frame);frame=0;lostFocus=true;save();renderer?.dispose();});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;lostFocus=true;save();});
  addEventListener('pageshow',event=>{if(event.persisted){lostFocus=false;renderer?.resize();rectDirty=true;schedule();}});
  refreshMode();
  createRenderer(canvas,nodes,keys).then(result=>{renderer=result;if(result){if(directExplore&&preview===null&&!reduced.matches)formationMotion={start:performance.now(),from:0,duration:EXPLORE_FORMATION_MS};result.draw({...state,focus:focusIndex});root!.dataset.firstFrame='drawn';root!.dataset.ready='true';root!.dataset.rendering='webgl';root!.dataset.particleCount=String(result.count);}else{state.formation=1;root!.dataset.rendering='fallback';}schedule();}).catch(error=>{state.formation=1;root!.dataset.rendering='fallback';console.warn('Portfolio visual fallback:',error);schedule();});
}
export {};