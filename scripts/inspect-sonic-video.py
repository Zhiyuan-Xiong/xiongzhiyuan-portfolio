from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import subprocess,re,json
exe=Path('.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe')
srcs=[next(Path(r'D:\spacial illusion\submission').rglob('*Film.mp4.mp4')),Path(r'D:\spacial illusion\final\spatial illusion-无字幕.mp4')]
out=Path('.cache/sonic');info=[];sheet=Image.new('RGB',(1600,600),'#12121a');draw=ImageDraw.Draw(sheet)
for row,p in enumerate(srcs):
 result=subprocess.run([str(exe),'-hide_banner','-i',str(p)],capture_output=True,text=True,errors='replace');m=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',result.stderr);duration=sum(float(x)*z for x,z in zip(m.groups(),[3600,60,1])) if m else 0
 info.append({'source':str(p),'duration':duration,'bytes':p.stat().st_size,'metadata':result.stderr[:3000]})
 for j,t in enumerate([0,5,30,max(duration-4,0)]):
  target=out/f'film-{row}-{j}.jpg';subprocess.run([str(exe),'-hide_banner','-loglevel','error','-y','-ss',str(t),'-i',str(p),'-frames:v','1','-vf','scale=400:-2',str(target)],check=True)
  im=Image.open(target);thumb=ImageOps.contain(im,(400,240));x=j*400;y=row*300;sheet.paste(thumb,(x,y+30));draw.text((x+8,y+8),f'{row} / {t:.1f}s',fill='white')
(out/'video-inventory.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf8');sheet.save(out/'video-frames.jpg',quality=90)
print([(p['source'],p['duration'],round(p['bytes']/1e6,1)) for p in info])
