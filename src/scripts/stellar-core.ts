// Shared with the entrance so the About planet has the same changing stellar core.
export function stellarCoreShaders(projection:string):[string,string]{
 return [`attribute vec3 a_position;attribute vec2 a_uv;${projection}uniform vec2 u_angles;uniform float u_time,u_mode,u_transition;varying float v_light,v_depth;varying vec3 v_color;
 void main(){vec3 n=normalize(a_position);float t=u_time;float wave=.06*sin(n.x*7.+t*.63)+.045*cos(n.y*9.-t*.42)+.026*sin(n.z*12.+t*.71);vec3 p=n*(.54+wave)*(1.+smoothstep(.1,.75,u_transition)*1.65);float cy=cos(u_angles.y+t*.13),sy=sin(u_angles.y+t*.13);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);float cx=cos(u_angles.x),sx=sin(u_angles.x);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);v_depth=p.z;v_light=.5+.5*sin(n.y*9.+n.x*4.+t*.85);v_color=mix(vec3(.78),vec3(1.),v_light)*(.92+.08*sin(t*.85));gl_Position=project(p);gl_Position.y+=gl_Position.w*.035;gl_PointSize=u_dpr*(2.1+a_uv.x*1.85+pow(v_light,14.)*5.7)*(u_mode>1.5?2.7:1.);}`,`
 precision mediump float;uniform float u_alpha,u_mode;varying float v_light,v_depth;varying vec3 v_color;
 void main(){if(u_mode>.5&&u_mode<1.5){gl_FragColor=vec4(v_color,u_alpha*(.08+.14*v_light));return;}float d=length(gl_PointCoord-.5),glow=exp(-d*d*14.);float strength=u_mode>1.5?(.16+.18*v_light):(.6+.4*v_light);gl_FragColor=vec4(v_color,glow*u_alpha*strength*(v_depth>0.?1.:.4));}`];
}
