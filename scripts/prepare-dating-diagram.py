from pathlib import Path
import json,subprocess,concurrent.futures
from PIL import Image, ImageDraw
root=Path.cwd();source=root/'.cache/dating-diagram';target=root/'public/media/dating/diagram';target.mkdir(parents=True,exist_ok=True)
assets=json.loads((source/'assets.json').read_text('utf-8-sig'))
def fetch(asset):
 p=target/asset['name'];subprocess.run(['curl.exe','-sSfL','--max-time','40','-o',str(p),asset['url']],check=True)
 if not p.stat().st_size:raise ValueError('Empty '+p.name)
 if p.suffix=='.png':
  im=Image.open(p);return p.name,im.size
 return p.name,None
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(fetch,assets))
sizes={name:size for name,size in results if size};(target/'sizes.json').write_text(json.dumps(sizes),encoding='utf-8')
contact=Image.new('RGB',(1200,750),'#180606');draw=ImageDraw.Draw(contact)
for i,(name,size) in enumerate(results):
 if not size:continue
 im=Image.open(target/name).convert('RGBA');im.thumbnail((260,210));x=(i%4)*300;y=(i//4)*250
 contact.paste(im,(x+(300-im.width)//2,y),im);draw.text((x+12,y+220),name+' '+str(size),fill='white')
contact.save(source/'contact.jpg');print('Downloaded original diagram layers:',len(results));print(sizes)
