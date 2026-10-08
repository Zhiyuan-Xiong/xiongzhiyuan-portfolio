from pathlib import Path
import subprocess, json, shutil
from PIL import Image
root=Path(__file__).resolve().parent.parent
raw=root/'.cache/dating-figma/raw'
orig=Path(r'D:\aaa作品集\项目文件\建模-blind dating market festival')
out=root/'public/media/dating';out.mkdir(parents=True,exist_ok=True)
mapping={
 'hall':('1-2462-img1',1200),'factory':('1-2462-img2',1200),'gaze':('1-2462-img5',1200),'paradise':('1-2462-img6',1200),
 'center':('1-2462-imgRectangle5',1100),'mask':('1-2462-imgRectangle7',640),'glow':('1-2462-imgRectangle6',640),
 'ring':('1-2462-imgRectangle3',1200),'circle':('1-2462-imgRectangle2',1200),'additive-model':('1-2462-imgRectangle4',900),
 'hall-render':('1-2982-imgRectangle1',1920),'factory-render':('1-2982-imgRectangle8',1920),'carnival-render':('1-3132-imgRectangle1',1920),
 'roulette-render':('1-3132-imgRectangle8',1920),'gaze-render':('1-3622-imgRectangle1',1920),'paradise-render':('1-3622-imgRectangle7',1920),
 'furnace':('1-2982-imgRectangle12',960),'gears':('1-2982-imgRectangle13',960),'resume':('1-2982-imgRectangle9',700),
 'gramophone':('1-3132-imgRectangle7',700),'slot-machine':('1-3132-imgRectangle6',960),'roulette-clock':('1-3132-imgRectangle8',960),
 'reagents':('1-3132-imgRectangle2',700),'gaze-eye':('1-3622-imgRectangle2',960),'parents':('1-3622-imgRectangle3',700),
 'voices':('1-3622-imgRectangle5',960),'face-date':('1-3622-imgRectangle16',960),'love-game':('1-3622-imgRectangle11',960),'tea-party':('1-3622-imgRectangle10',960),
}
sizes={}
for key,(name,cap) in mapping.items():
 im=Image.open(raw/(name+'.png'));im.thumbnail((cap,cap));im.save(out/(key+'.webp'),quality=88,method=6);sizes[key]=im.size
for key,name in [('stage','stage.png'),('eyes','eyes.png'),('love-card','love card.png'),('television','televison.png'),('research-early-1','分析1.png'),('research-early-2','分析2.png')]:
 im=Image.open(orig/name);im.thumbnail((2400 if key.startswith('research') else 900,1800));im.save(out/(key+'.webp'),quality=90,method=6);sizes[key]=im.size
for i in range(2,14):
 p=raw/('1-3817-imgRectangle'+str(i)+'.png')
 if p.exists():
  im=Image.open(p);im.thumbnail((640,640));im.save(out/('story-'+str(i-1)+'.webp'),quality=85,method=6);sizes['story-'+str(i-1)]=im.size
for p in raw.glob('1-2462-*.svg'):
 shutil.copy2(p,out/p.name)
(out/'image-sizes.json').write_text(json.dumps(sizes),encoding='utf-8')
exe=root/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
for i in range(0,7):
 src=orig/('点开视频.mp4' if i==0 else '场景'+str(i)+'.mp4')
 name='hero' if i==0 else 'scene-'+str(i)
 args=[str(exe),'-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-an','-vf','scale=1920:-2' if i==0 else 'scale=1600:-2','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(out/(name+'.mp4'))]
 subprocess.run(args,check=True)
 subprocess.run([str(exe),'-hide_banner','-loglevel','error','-y','-ss','1.2','-i',str(src),'-frames:v','1','-vf','scale=1920:-2' if i==0 else 'scale=1280:-2',str(out/(name+'-poster.png'))],check=True)
 p=out/(name+'-poster.png');im=Image.open(p);im.save(out/(name+'-poster.webp'),quality=90,method=6);p.unlink()
 print(name,(out/(name+'.mp4')).stat().st_size,flush=True)
print('Prepared original images and seven video clips')
