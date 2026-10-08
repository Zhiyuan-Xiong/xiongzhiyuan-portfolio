from pathlib import Path
import json,subprocess
from PIL import Image
root=Path.cwd();out=root/'public/media/nexus';out.mkdir(parents=True,exist_ok=True)
a=Path(r'D:\AAA找到工作\素材们\项目3');b=Path(r'D:\aaa作品集\项目文件\建模-Nexus_City of Wonders')
assets={'hero':b/'核心大图1.png','clay-side':b/'白膜展示2.png','clay-isometric':b/'白膜展示.png','concept-line':a/'草稿.png','characters':a/'图片转草稿.png','texture':a/'6e0f1b3a-0bc4-4e0f-a351-dde0b7373bfc.png','logo':a/'ChatGPT Image Jun 2, 2026, 09_10_47 PM.png','furnace':b/'渲染1.png','workshop':b/'渲染2.png','becoming':b/'渲染5.png','observer':b/'渲染3.png','core':b/'渲染7.png','devourer':b/'渲染6.png','characters-render':b/'渲染4.png'}
manifest={}
for key,p in assets.items():
 im=Image.open(p);im.thumbnail((2560,2000) if key=='hero' else (2000,1500));im.save(out/(key+'.webp'),quality=91,method=6)
 manifest[key]={'src':'/media/nexus/'+key+'.webp','width':im.width,'height':im.height}
 if key=='hero':
  for size in [640,1280,1920]:
   cp=Image.open(p);cp.thumbnail((size,size));cp.save(root/'public/images'/('nexus-cover-'+str(size)+'.webp'),quality=90,method=6)
(root/'src/data/nexus-assets.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
dims=json.loads((root/'src/data/image-dimensions.json').read_text('utf-8'));dims['nexus-cover']={'width':1280,'height':720};(root/'src/data/image-dimensions.json').write_text(json.dumps(dims,indent=2),encoding='utf-8')
exe=root/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
subprocess.run([str(exe),'-hide_banner','-loglevel','error','-y','-i',str(b/'Nexus—City of Wonders.mp4'),'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','fast','-crf','24','-maxrate','4M','-bufsize','8M','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(out/'film.mp4')],check=True)
print('NEXUS: 13 original images, 3 cover sizes, video',round((out/'film.mp4').stat().st_size/1024/1024,2),'MiB',flush=True)
