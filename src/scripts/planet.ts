type Mesh = { position: WebGLBuffer; uv: WebGLBuffer; count: number; mode: number };
async function startPlanet(element: HTMLElement) {
  const canvas = element.querySelector<HTMLCanvasElement>('canvas')!;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!gl) return;
  const vertexSource = `
    attribute vec3 a_position;attribute vec2 a_uv;
    uniform vec3 u_angles;uniform float u_aspect;
    varying vec2 v_uv;varying float v_light;
    void main(){
      vec3 p=a_position;
      float cy=cos(u_angles.y),sy=sin(u_angles.y);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
      float cx=cos(u_angles.x),sx=sin(u_angles.x);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
      float cz=cos(u_angles.z),sz=sin(u_angles.z);p=vec3(p.x*cz-p.y*sz,p.x*sz+p.y*cz,p.z);
      v_light=.48+.52*max(0.,dot(normalize(p),normalize(vec3(-.4,.6,1.6))));v_uv=a_uv;
      float z=p.z-3.5;float n=.1;float f=10.;
      gl_Position=vec4(p.x*2.6/u_aspect,p.y*2.6,(f+n)/(n-f)*z+2.*f*n/(n-f),-z);
    }`;
  const fragmentSource = `
    precision mediump float;varying vec2 v_uv;varying float v_light;
    uniform sampler2D u_texture;uniform int u_mode;
    void main(){
      if(u_mode==0){gl_FragColor=vec4(vec3(.085,.105,.09)*v_light,1.);}
      else if(u_mode==1){gl_FragColor=vec4(.52,.61,.51,.23*v_light);}
      else{vec3 c=texture2D(u_texture,v_uv).rgb;float grey=dot(c,vec3(.299,.587,.114));c=mix(vec3(grey),c,.22);gl_FragColor=vec4(c*v_light,1.);}
    }`;
  function shader(type: number, source: string) {
    const result = gl!.createShader(type)!;gl!.shaderSource(result,source);gl!.compileShader(result);
    if (!gl!.getShaderParameter(result, gl!.COMPILE_STATUS)) { gl!.deleteShader(result);throw new Error('Planet shader could not compile'); }
    return result;
  }
  const program = gl.createProgram()!;
  const vertex = shader(gl.VERTEX_SHADER, vertexSource), fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  gl.deleteShader(vertex);gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const position = gl.getAttribLocation(program,'a_position'), uv = gl.getAttribLocation(program,'a_uv');
  const angleUniform = gl.getUniformLocation(program,'u_angles'), aspectUniform = gl.getUniformLocation(program,'u_aspect'), modeUniform = gl.getUniformLocation(program,'u_mode');
  const point = (lat: number, lon: number, radius = 1): number[] => [Math.cos(lat)*Math.sin(lon)*radius, Math.sin(lat)*radius, Math.cos(lat)*Math.cos(lon)*radius];
  function mesh(positions: number[], coords: number[], mode: number): Mesh {
    const pos = gl!.createBuffer()!, tex = gl!.createBuffer()!;
    gl!.bindBuffer(gl!.ARRAY_BUFFER,pos);gl!.bufferData(gl!.ARRAY_BUFFER,new Float32Array(positions),gl!.STATIC_DRAW);
    gl!.bindBuffer(gl!.ARRAY_BUFFER,tex);gl!.bufferData(gl!.ARRAY_BUFFER,new Float32Array(coords),gl!.STATIC_DRAW);
    return { position: pos, uv: tex, count: positions.length/3, mode };
  }
  const bodyPositions: number[] = [], bodyUV: number[] = [];
  for (let row=0;row<36;row++) for(let col=0;col<64;col++) {
    const corners = [[row,col],[row+1,col],[row+1,col+1],[row,col+1]];
    for(const index of [0,1,2,0,2,3]) { const [r,c]=corners[index];bodyPositions.push(...point(-Math.PI/2+r*Math.PI/36,c*Math.PI*2/64,.989));bodyUV.push(0,0); }
  }
  const wirePositions: number[] = [], wireUV: number[] = [];
  for(let lat=-6;lat<=6;lat++) for(let j=0;j<96;j++) { wirePositions.push(...point(lat*Math.PI/14,j*Math.PI*2/96,1.012),...point(lat*Math.PI/14,(j+1)*Math.PI*2/96,1.012));wireUV.push(0,0,0,0); }
  for(let lon=0;lon<20;lon++) for(let j=0;j<64;j++) { wirePositions.push(...point(-Math.PI/2+j*Math.PI/64,lon*Math.PI/10,1.012),...point(-Math.PI/2+(j+1)*Math.PI/64,lon*Math.PI/10,1.012));wireUV.push(0,0,0,0); }
  const patchPositions: number[] = [], patchUV: number[] = [];
  for(let row=0;row<4;row++) for(let col=0;col<8;col++) {
    for(let y=0;y<6;y++) for(let x=0;x<6;x++) {
      const corners=[[x,y],[x,y+1],[x+1,y+1],[x+1,y]];
      for(const index of [0,1,2,0,2,3]) {
        const [cx,cy]=corners[index],fx=cx/6,fy=cy/6;
        patchPositions.push(...point(-.78+row*.52+(fy-.5)*.45,col*Math.PI/4+(fx-.5)*.69));
        patchUV.push((col+.025+fx*.95)/8,(row+.025+(1-fy)*.95)/4);
      }
    }
  }
  const body=mesh(bodyPositions,bodyUV,gl.TRIANGLES), wire=mesh(wirePositions,wireUV,gl.LINES), patches=mesh(patchPositions,patchUV,gl.TRIANGLES);
  const keys=['stigma-cover','dating-cover','mushrooms-cover','dating-scene-a','mushrooms-story-b','stigma-space','mushrooms-characters','dating-scene-b'];
  const images=await Promise.all(keys.map(key=>new Promise<HTMLImageElement|null>(resolve=>{ const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=`/images/${key}-640.webp`; })));
  const atlas=document.createElement('canvas');atlas.width=2048;atlas.height=1024;const ctx=atlas.getContext('2d')!;
  const words=['DESIGN','CONTEXT','FORM','INTERACT','VISION','MAKE','EXPLORE','STORIES'];
  for(let row=0;row<4;row++)for(let col=0;col<8;col++) {
    const x=col*256,y=row*256,index=row*8+col;ctx.save();ctx.beginPath();ctx.rect(x,y,256,256);ctx.clip();ctx.fillStyle='#222723';ctx.fillRect(x,y,256,256);
    const image=images[(col+row*3)%images.length];
    if(image&&(col+row)%4!==0) {
      const crop=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-crop)/2,(image.height-crop)/2,crop,crop,x,y,256,256);
      ctx.fillStyle='rgba(13,20,15,.25)';ctx.fillRect(x,y,256,256);ctx.fillStyle='#ecf1e5';ctx.font='500 14px system-ui';ctx.fillText('XZ / '+String(index+1).padStart(2,'0'),x+18,y+27);
    } else {
      ctx.strokeStyle='#6d7666';ctx.lineWidth=.7;for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(x+18,y+45+j*38);ctx.lineTo(x+238,y+45+j*38);ctx.stroke();}
      ctx.fillStyle='#d9e1d3';ctx.font='400 112px system-ui';ctx.fillText(String(col+1).padStart(2,'0'),x+11,y+156);
      ctx.font='500 24px system-ui';ctx.fillText(words[(col+row)%8],x+18,y+210);ctx.font='400 11px system-ui';ctx.fillText('XIONG ZHIYUAN / PORTFOLIO',x+18,y+233);
    }
    ctx.restore();
  }
  const texture=gl.createTexture()!;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program,'u_texture'),0);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  let spin=-.52,tilt=.27,targetTilt=.27,targetSpin=0,offset=0,last=0,lastDraw=0,frame=0,visible=true,lost=false;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){const ratio=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(canvas.clientWidth*ratio);canvas.height=Math.round(canvas.clientHeight*ratio);gl!.viewport(0,0,canvas.width,canvas.height);gl!.uniform1f(aspectUniform,canvas.width/Math.max(1,canvas.height));}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function drawMesh(item: Mesh, mode: number){gl!.uniform1i(modeUniform,mode);gl!.bindBuffer(gl!.ARRAY_BUFFER,item.position);gl!.enableVertexAttribArray(position);gl!.vertexAttribPointer(position,3,gl!.FLOAT,false,0,0);gl!.bindBuffer(gl!.ARRAY_BUFFER,item.uv);gl!.enableVertexAttribArray(uv);gl!.vertexAttribPointer(uv,2,gl!.FLOAT,false,0,0);gl!.drawArrays(item.mode,0,item.count);}
  function draw(){gl!.clearColor(0,0,0,0);gl!.clear(gl!.COLOR_BUFFER_BIT|gl!.DEPTH_BUFFER_BIT);gl!.uniform3f(angleUniform,tilt,spin+offset,-.14);drawMesh(body,0);drawMesh(patches,2);drawMesh(wire,1);}
  function tick(time: number){frame=0;if(!visible||document.hidden||lost)return;const delta=last?Math.min(time-last,70):0;last=time;if(!motion.matches){spin+=delta*.00018;tilt+=(targetTilt-tilt)*.065;offset+=(targetSpin-offset)*.065;}if(time-lastDraw>32){draw();lastDraw=time;}if(!motion.matches)frame=requestAnimationFrame(tick);}
  function schedule(){if(!frame&&visible&&!document.hidden&&!lost){last=0;frame=requestAnimationFrame(tick);}}
  element.addEventListener('pointermove',event=>{if(motion.matches||event.pointerType==='touch')return;const rect=element.getBoundingClientRect();targetTilt=.27+(event.clientY-rect.top-rect.height/2)/rect.height*.35;targetSpin=(event.clientX-rect.left-rect.width/2)/rect.width*.45;});
  element.addEventListener('pointerleave',()=>{targetTilt=.27;targetSpin=0;});
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.05});intersection.observe(element);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});motion.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;schedule();});
  canvas.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(frame);element.dataset.ready='false';});
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();});
  addEventListener('pageshow',event=>{if(event.persisted){observer.observe(canvas);intersection.observe(element);visible=true;resize();schedule();}});
  draw();element.dataset.ready='true';schedule();
}
for(const planet of document.querySelectorAll<HTMLElement>('[data-planet]'))startPlanet(planet).catch(()=>{planet.dataset.ready='false';});
export {};