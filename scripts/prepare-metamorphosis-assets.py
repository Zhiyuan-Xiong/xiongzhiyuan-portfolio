from pathlib import Path
from PIL import Image, ImageOps
import struct,random,math,gzip,json,subprocess

ROOT=Path(r'D:\aaa作品集\portfolio-site');SRC=Path(r'D:\skills portfolio');OUT=ROOT/'public/media/metamorphosis';OUT.mkdir(parents=True,exist_ok=True)
FF=ROOT/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';assets={};provenance=[]
def save(name,im,source):
 for suffix,limit in [('',2200),('-large',4962)]:
  output=ImageOps.contain(im,(min(limit,im.width),min(limit,im.height)),Image.Resampling.LANCZOS)
  output.save(OUT/(name+suffix+'.webp'),quality=95,method=5)
  if not suffix:assets[name]={'src':f'/media/metamorphosis/{name}.webp','large':f'/media/metamorphosis/{name}-large.webp','width':output.width,'height':output.height}
 provenance.append({'asset':name,'source':str(source),'size':im.size})
def crop(name,file,box):
 path=SRC/'final portfolio'/file;im=Image.open(path).crop(box);save(name,im,{'file':str(path),'bounds':box})
crop('original-visual','png-07.jpg',(0,0,4962,2295))
crop('operator-network','png-08.jpg',(116,241,4852,2227))
crop('development-sequence','png-08.jpg',(112,2440,4850,3425))
crop('live-network','png-09.jpg',(116,241,3306,1800))
crop('live-installation','png-09.jpg',(3566,652,4703,1385))
crop('reactive-sequence','png-09.jpg',(116,1865,4850,3395))
crop('source-model','png-07.jpg',(2838,2415,4848,3393))
save('liquid-background',Image.open(SRC/'bg.png').convert('RGB'),SRC/'bg.png')
poster=Image.open(ROOT/'.cache/metamorphosis/entry-2.png');save('transition-poster',poster,'1.mov / 0.6 seconds')
poster=Image.open(ROOT/'.cache/metamorphosis/film-2.png');save('hero-poster',poster,'TDMovieOut.0.mov / 6 seconds')
cover=Image.open(SRC/'final portfolio/png-07.jpg').crop((0,0,4962,2295))
for width in [640,1280,1920]:ImageOps.contain(cover,(width,width),Image.Resampling.LANCZOS).save(ROOT/'public/images'/f'metamorphosis-cover-{width}.webp',quality=93)
planet=ImageOps.grayscale(Image.open(ROOT/'.cache/metamorphosis/film-2.png')).convert('RGB');ImageOps.contain(planet,(1024,1024)).save(ROOT/'public/media/planet/metamorphosis-core.webp',quality=92)

# Sample the actual butterfly OBJ surface with a fixed seed.
vertices=[];triangles=[]
for line in (SRC/'model.obj').read_text(encoding='utf8',errors='replace').splitlines():
 if line.startswith('v '):vertices.append(tuple(map(float,line.split()[1:4])))
 if line.startswith('f '):
  ids=[int(s.split('/')[0])-1 for s in line.split()[1:]]
  triangles.extend((ids[0],ids[k],ids[k+1]) for k in range(1,len(ids)-1))
low=[min(v[i] for v in vertices) for i in range(3)];high=[max(v[i] for v in vertices) for i in range(3)];center=[(a+b)/2 for a,b in zip(low,high)];scale=1.8/max(b-a for a,b in zip(low,high))
normalized=[tuple((v[i]-center[i])*scale for i in range(3)) for v in vertices]
weights=[]
for ids in triangles:
 a,b,c=[normalized[i] for i in ids];u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)];weights.append(math.sqrt(sum(x*x for x in [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]])))
rng=random.Random(42);points=[]
for ids in rng.choices(triangles,weights=weights,k=48000):
 a,b,c=[normalized[i] for i in ids];u=math.sqrt(rng.random());v=rng.random();points.extend(a[i]*(1-u)+b[i]*u*(1-v)+c[i]*u*v for i in range(3))
with gzip.open(OUT/'butterfly-points.bin.gz','wb') as f:f.write(struct.pack('<%sf'%len(points),*points))
info={'src':'/media/metamorphosis/butterfly-points.bin.gz','pointCount':48000,'vertices':len(vertices),'triangles':len(triangles),'bounds':[low,high],'audio':{'analysis':'RMS','gain':5,'smoothingSeconds':.22,'scale':'1 + abs(audio)','source':'NewProject-pointcoud.toe'}}
(ROOT/'src/data/metamorphosis-interactive.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(ROOT/'src/data/metamorphosis-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(ROOT/'.cache/metamorphosis/extraction-manifest.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def run(args):subprocess.run([str(FF),'-hide_banner','-loglevel','error','-y',*args],check=True)
# Slow the supplied 2.167-second source into the established five-second portal.
run(['-i',str(SRC/'视频/1.mov'),'-vf','setpts=2.3076923*PTS,fps=30','-t','5','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'transition.mp4')])
run(['-i',str(SRC/'TDMovieOut.0.mov'),'-vf','fps=30','-an','-c:v','libx264','-preset','fast','-crf','23','-maxrate','6M','-bufsize','12M','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'hero.mp4')])
print('Prepared',len(assets),'complete figures, 48000 original-model points, five-second transition, and original output film.')

