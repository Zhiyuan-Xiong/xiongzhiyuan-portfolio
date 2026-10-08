from pathlib import Path
from PIL import Image,ImageOps,ImageFilter,ImageDraw
import json
root=Path('.cache/sonic');target=Path('public/media/sonic');manifest=json.loads(Path('src/data/sonic-assets.json').read_text(encoding='utf-8-sig'));records=[]
def save(name,im,origin,diagram=False):
 im=im.convert('RGBA') if im.mode=='RGBA' else im.convert('RGB')
 if diagram:
  # Fade compression noise around paper black smoothly; keep labels, coloured strokes and embedded pictures.
  rgba=im.convert('RGBA');pix=rgba.load()
  for y in range(rgba.height):
   for x in range(rgba.width):
    r,g,b,a=pix[x,y]
    dark=max(r,g,b)
    if dark<18:pix[x,y]=(r,g,b,round(a*max(0,min(1,(dark-8)/10))))
  im=rgba
 for suffix,size in [('',2200),('-large',4096)]:
  render=ImageOps.contain(im,(min(size,im.width),min(size,im.height)))
  if render.size!=im.size:render=render.filter(ImageFilter.UnsharpMask(radius=.6,percent=65,threshold=3))
  render.save(target/(name+suffix+'.webp'),quality=95,method=5)
  if not suffix:manifest[name]={'src':'/media/sonic/'+name+'.webp','large':'/media/sonic/'+name+'-large.webp','width':render.width,'height':render.height,'diagram':diagram}
 records.append({'image':name,**origin,'pixels':list(im.size),'transparent_paper':diagram})
def crop(name,page,box,diagram=False):
 im=Image.open(root/f'original-{page:02}.png');r=tuple(round(n*(im.width/1200 if i%2==0 else im.height/675)) for i,n in enumerate(box));save(name,im.crop(r),{'pdf_page':page,'reference_crop':box},diagram)
plans=[
 ('design-approach',5,[35,297,1169,641]),
 ('prediction-board',3,[106,166,464,640],True),('prediction-flow',4,[35,314,1171,367],True),
 ('theory-board',6,[37,127,479,525],True),('sound-references',7,[74,204,1128,486]),('space-references',8,[74,204,1128,486]),
 ('time-experiment',10,[36,249,584,641]),('space-experiment',10,[618,173,1167,641]),
 ('iteration-overview',11,[37,138,1163,465],True),('iteration-one',12,[36,118,950,643],True),('iteration-two',13,[36,118,950,643],True),('iteration-three',14,[36,126,946,641],True),('iteration-three-states',14,[1052,139,1185,465],True),
 ('early-frame',15,[369,65,1165,641]),('sound-zones',16,[107,133,1101,607],True),('max-one',17,[36,108,1165,641]),('interaction-comparison',18,[36,140,1166,641]),
 ('iteration-four',19,[36,133,954,642],True),('first-full-scale',20,[369,65,1165,641]),('iteration-refinement',21,[36,270,1165,641],True),
 ('interaction-timeline',22,[34,131,1167,643],True),('components',23,[35,113,1168,642],True),('construction-board',24,[38,65,1167,641]),
 ('framework-built',25,[369,65,1165,641]),('framework-joint',25,[36,256,296,430]),('framework-detail',25,[36,465,296,641]),
 ('motor-system',26,[36,118,1167,282],True),('motor-production',26,[36,291,1167,641]),('audio-analysis',27,[35,146,1167,605],True),
 ('max-upgrade',28,[35,126,1040,643],True),('max-two',29,[35,108,1167,641]),('linked-states',30,[53,130,1149,601]),
]
for args in plans:crop(*args)
# Recreate the exact three-image showcase arrangements with their matching high-resolution originals.
photos=Path(r'D:\spacial illusion\P后的选图\P后的选图')
for page,name,files in [(31,'showcase-standby',['1.jpg','5.jpg','4.jpg']),(32,'showcase-elastic',['3.jpg','10.jpg',None]),(33,'showcase-motion',['6.jpg','11.jpg','8.jpg']),(34,'showcase-reference',['2.jpg','14.jpg','13.jpg'])]:
 native=Image.open(root/f'original-{page:02}.png');scale=native.width/1200;top=round(155*scale);im=native.crop((0,top,native.width,native.height)).convert('RGB')
 slots=[(0,1,739,520),(757,1,1200,251),(757,272,1200,520)]
 for filename,slot in zip(files,slots):
  if not filename:continue
  x0,y0,x1,y1=[round(v*scale) for v in slot];source=Image.open(photos/filename);tile=ImageOps.fit(source,(x1-x0,y1-y0),method=Image.Resampling.LANCZOS);im.paste(tile,(x0,y0))
 save(name,im,{'pdf_page':page,'reference_crop':[0,155,1200,675],'native_photo_replacements':files})
# Replace the cover with the same original selected photo, preserving the composition.
for name,path in [('hero',photos/'16.png'),('installation',photos/'7.jpg'),('framework-joint',Path(r'D:\spacial illusion\analysis final 分析图\5U4A6602.png')),('framework-detail',Path(r'D:\spacial illusion\analysis final 分析图\5U4A6599.png'))]:save(name,Image.open(path),{'native_file':str(path)})
for p in Path(r'D:\spacial illusion').rglob('5U4A5929.JPG'):
 save('physical-model',Image.open(p),{'native_file':str(p)});break
hero=Image.open(photos/'16.png')
for width in [640,1280,1920]:ImageOps.contain(hero,(width,width)).save(Path('public/images')/f'sonic-cover-{width}.webp',quality=92)
Path('src/data/sonic-assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(root/'extraction-manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
for group,start in enumerate(range(0,len(records),12)):
 batch=records[start:start+12];sheet=Image.new('RGB',(1600,4*253),'#111319');draw=ImageDraw.Draw(sheet)
 for i,r in enumerate(batch):
  p=target/(r['image']+'.webp');thumb=ImageOps.contain(Image.open(p).convert('RGBA'),(400,225));x=i%4*400;y=i//4*253;sheet.paste(thumb,(x+(400-thumb.width)//2,y+25),thumb);draw.text((x+8,y+7),r['image'],fill='white')
 sheet.save(root/f'crop-proof-{group+1}.jpg',quality=90)
print('Prepared',len(manifest),'Sonic images with complete diagram/collage crops and matching native photographs.')
