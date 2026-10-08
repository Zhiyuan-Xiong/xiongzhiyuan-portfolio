from pathlib import Path
import json, subprocess, concurrent.futures
from PIL import Image,ImageDraw,ImageFont
root=Path.cwd();cache=root/'.cache/dating-figma';raw=cache/'raw'
data=json.loads((cache/'contexts.json').read_text('utf-8'))
def download(a):
 p=raw/(a['frame'].replace(':','-')+'-'+a['key']+Path(a['url']).suffix)
 if not p.exists() or p.stat().st_size==0:
  subprocess.run(['curl.exe','-sSfL','--max-time','45','-o',str(p),a['url']],check=True)
 if p.stat().st_size==0: raise RuntimeError('Empty asset '+p.name)
 return p.name
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: done=list(pool.map(download,data['assets']))
subprocess.run(['curl.exe','-sSfL','--max-time','45','-o',str(cache/'research-reference.png'),'https://www.figma.com/api/mcp/asset/2a7e61dc-bdee-488c-8749-31c69e30d7a5.png'],check=True)
imgs=[]
for p in raw.glob('*.png'):
 im=Image.open(p);imgs.append((p,im.copy(),im.size))
out=Image.new('RGB',(1200,180*((len(imgs)+4)//5)), '#181818');draw=ImageDraw.Draw(out);font=ImageFont.truetype(str(root/'assets/fonts/NotoSansSC-VF.ttf'),12)
for i,(p,im,size) in enumerate(imgs):
 im.thumbnail((220,135));x=i%5*240;y=i//5*180
 out.paste(im,(x+(240-im.width)//2,y),im if im.mode=='RGBA' else None)
 draw.text((x+3,y+139),p.name,font=font,fill='white')
 draw.text((x+3,y+160),str(size),font=font,fill='gray')
out.save(cache/'figma-contact.jpg');print('Saved',len(done),'original assets')
