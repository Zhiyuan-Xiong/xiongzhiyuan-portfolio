from pathlib import Path
from PIL import Image,ImageDraw
from urllib.request import urlopen,Request
from concurrent.futures import ThreadPoolExecutor
import json,subprocess,time
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(r'D:\aaa作品集\项目文件\建模-NO.3 post-digital species')
CACHE=ROOT/'.cache/species/figma';CACHE.mkdir(parents=True,exist_ok=True)
OUT=ROOT/'public/media/species';OUT.mkdir(parents=True,exist_ok=True)
urls=json.loads(r'''{"cover-model": "https://www.figma.com/api/mcp/asset/a7b07966-6c99-4233-9568-97fa05d2e162.png", "cover-background": "https://www.figma.com/api/mcp/asset/744eb756-274a-49fd-a3c2-9ca3db3d394d.png", "world-grid": "https://www.figma.com/api/mcp/asset/ce90b25c-8f87-4d64-b495-dd85c03b8215.png", "city": "https://www.figma.com/api/mcp/asset/9bfc5d16-9a5e-43d5-bb51-196ad549ad72.png", "death-model": "https://www.figma.com/api/mcp/asset/21238796-1ebb-4487-928e-97a4790ec4f9.png", "convert-model": "https://www.figma.com/api/mcp/asset/386cf6bf-b10a-46db-ab50-6d00e41bf315.png", "reborn-model": "https://www.figma.com/api/mcp/asset/4f12f2c3-612f-427b-9ee7-28f49cec0f08.png", "logo-number": "https://www.figma.com/api/mcp/asset/58c0a15a-3365-4e07-a243-5e68386aaca8.png", "logo-words": "https://www.figma.com/api/mcp/asset/d03363c6-36f7-4bcd-a753-c58f7a5a49bc.png", "archive-1": "https://www.figma.com/api/mcp/asset/8a0dc395-dbff-446a-9cbc-8bbeffe10cd2.png", "archive-2": "https://www.figma.com/api/mcp/asset/1c50c716-6221-417c-9385-a50771837694.png", "archive-3": "https://www.figma.com/api/mcp/asset/76983853-432a-4ec5-8c91-ca66e79edaa4.png", "archive-4": "https://www.figma.com/api/mcp/asset/67224940-0b0f-4348-8877-a5fa4ebc63c2.png", "archive-5": "https://www.figma.com/api/mcp/asset/7f6e58a1-9a46-4b21-9bef-c812b69a1b7e.png", "archive-6": "https://www.figma.com/api/mcp/asset/836f04de-bfb1-46e5-b257-2a3e9224bfcf.png", "archive-7": "https://www.figma.com/api/mcp/asset/814d5b43-5234-4685-9238-557fad147717.png", "cover-ornaments": "https://www.figma.com/api/mcp/asset/08df5a28-fdaa-4b94-9457-e27a16c7ca55.png", "convert-diagram-1": "https://www.figma.com/api/mcp/asset/b3c404bf-f8ac-44d2-ab29-839aa87deba1.png", "convert-diagram-2": "https://www.figma.com/api/mcp/asset/1338bc22-596d-433b-9b31-087781a0e592.png", "convert-diagram-3": "https://www.figma.com/api/mcp/asset/01fa5bda-b141-47e2-bf1b-ffb7668f19dd.png", "death-process-source": "https://www.figma.com/api/mcp/asset/4c4a659e-220e-4773-9673-1fdd4aca1099.png", "world-people": "https://www.figma.com/api/mcp/asset/03725c5d-be98-4015-b7d8-31e32a4bf9f0.png"}''')
def download(item):
 name,url=item
 if not url:raise ValueError('Missing asset: '+name)
 dest=CACHE/(name+'.png')
 if not dest.exists():
  for attempt in range(3):
   try:
    with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=70) as response:dest.write_bytes(response.read())
    break
   except Exception:
    if attempt==2:raise
    time.sleep(1)
 return name,Image.open(dest).size
for name,size in ThreadPoolExecutor(max_workers=6).map(download,urls.items()):print('Downloaded',name,size)
manifest={}
def save(name,im,maxwidth=2200,quality=90):
 im=im.convert('RGBA');im.thumbnail((maxwidth,maxwidth*3),Image.Resampling.LANCZOS)
 dest=OUT/(name+'.webp');im.save(dest,'WEBP',quality=quality,method=6)
 manifest[name]={'src':'/media/species/'+dest.name,'width':im.width,'height':im.height}
def local(name,filename,width=2200):save(name,Image.open(SOURCE/filename),width)
for name in urls:
 if name!='death-process-source':
  im=Image.open(OUT/'cover-ornaments.webp') if name=='cover-ornaments' and (OUT/'cover-ornaments.webp').exists() else Image.open(CACHE/(name+'.png'))
  if name.startswith('convert-diagram-'):im=im.crop((0,30,400,150))
  save(name,im,2600 if name.startswith('cover-') else 2200)
for name,filename,width in [('research','RESEARCH.png',2800),('world-identities','前期1.png',2200),('life-triangle','三角形.png',1400),('life-tree','过程.png',2800),('death-icon','小图.png',800),('convert-icon','小图2.png',800),('reborn-icon','小图3.png',800),('wreath','奠.png',1400),('specimen-1','xsm1.png',1100),('specimen-2','xsm2.png',1100),('old-process','design.png',2800),('laboratory-study','stage3.png',2300),('old-death-study','STAGE1.png',2600),('city-photo','Enscape_2024-10-09-22-18-05.png',1600)]:
 local(name,filename,width)
diagram=Image.open(CACHE/'death-process-source.png')
boxes=[(90,245,305,346),(335,245,550,346),(580,245,795,346),(90,446,305,714),(335,446,555,732),(580,446,795,732),(90,832,305,990),(335,832,550,990),(580,832,795,990)]
for i,box in enumerate(boxes,1):save('death-step-'+str(i),diagram.crop(box),1000)
# Exact source composition for responsive work-index and galaxy thumbnails.
cover=Image.new('RGBA',(1920,1080),'white')
bg=Image.open(CACHE/'cover-background.png').convert('RGBA');bg=bg.resize((1931,1091),Image.Resampling.LANCZOS);cover.alpha_composite(bg,(-5,-5))
orn=Image.open(OUT/'cover-ornaments.webp').convert('RGBA');orn=orn.resize((2123,900),Image.Resampling.LANCZOS);cover.alpha_composite(orn,(-101,90))
model=Image.open(CACHE/'cover-model.png').convert('RGBA');model=model.resize((1202,1202),Image.Resampling.LANCZOS);cover.alpha_composite(model,(360,55))
save('cover',cover,1920)
IMAGES=ROOT/'public/images'
for size in [640,1280,1920]:
 im=cover.copy();im.thumbnail((size,10000),Image.Resampling.LANCZOS);im.save(IMAGES/('species-cover-'+str(size)+'.webp'),'WEBP',quality=89,method=6)
dimpath=ROOT/'src/data/image-dimensions.json';dims=json.loads(dimpath.read_text(encoding='utf-8-sig'));dims['species-cover']={'width':1920,'height':1080};dimpath.write_text(json.dumps(dims,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(ROOT/'src/data/species-assets.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
# Preserve four original short films, with fast-start metadata and no silent audio stream.
ffmpeg=ROOT/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
for i,source in enumerate(sorted(SOURCE.glob('*.mp4')),1):
 dest=OUT/('scene-'+str(i)+'.mp4')
 if not dest.exists():
  subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-i',str(source),'-an','-vf','scale=1920:-2','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)],check=True)
 poster=OUT/('scene-'+str(i)+'-poster.webp')
 subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-ss','1','-i',str(dest),'-frames:v','1','-vf','scale=1280:-1',str(poster)],check=True)
 print('Prepared film',i,dest.stat().st_size)
# Asset inventory, including origin IDs, remains local.
(ROOT/'qa/species-sources.json').write_text(json.dumps({'figmaPage':'36:42011','oldSite':'https://xiongzhiyuan.cargo.site/no-3-post-digital-species','localFolder':str(SOURCE),'assets':urls},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
sheet=Image.new('RGB',(1000,((len(manifest)+3)//4)*170),'#e0e5ea');draw=ImageDraw.Draw(sheet)
for i,(name,asset) in enumerate(manifest.items()):
 im=Image.open(ROOT/('public'+asset['src'])).convert('RGBA');im.thumbnail((238,133));x=(i%4)*250+(250-im.width)//2;y=(i//4)*170+26;sheet.paste(im,(x,y),im);draw.text(((i%4)*250+7,(i//4)*170+8),name,fill='#202840')
sheet.save(ROOT/'.cache/species/prepared-contact.jpg',quality=92)
print('Species assets prepared:',len(manifest))

