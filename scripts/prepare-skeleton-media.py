from pathlib import Path
from PIL import Image
import json
root=Path.cwd();src=Path(r'D:\AAA找到工作\素材们\项目4');out=root/'public/media/skeleton';out.mkdir(parents=True,exist_ok=True)
files={'hero':src/'主图.png','body-render':src/'渲染图.png','spines':src/'guanzi.png','portrait':src/'2.png','logo':root/'assets/skeleton/spring-logo-transparent-v1.png'}
for i in range(1,20):
 name=f'首饰{i}.png' if i<15 else f'首饰{i}png.png'
 files[f'piece-{i:02d}']=src/name
manifest={}
for key,p in files.items():
 im=Image.open(p)
 if key=='logo':
  assert im.mode=='RGBA' and im.getchannel('A').getextrema()[0]==0, 'Logo needs actual transparency'
 im.thumbnail((2560,1600) if key in ['hero','body-render'] else (1600,1600))
 name=key+'-white' if key in ['hero','body-render'] else key
 im.save(out/(name+'.webp'),quality=94,method=6)
 manifest[key]={'src':'/media/skeleton/'+name+'.webp','width':im.width,'height':im.height}
 if key=='hero':
  for size in [640,1280,1920]:
   image=Image.open(p);image.thumbnail((size,size));image.save(root/'public/images'/f'bone-cover-white-{size}.webp',quality=91,method=6)
(root/'src/data/skeleton-assets.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
dims=json.loads((root/'src/data/image-dimensions.json').read_text('utf-8'));dims['bone-cover-white']={'width':1280,'height':720};(root/'src/data/image-dimensions.json').write_text(json.dumps(dims,indent=2),encoding='utf-8')
print('Prepared',len(manifest),'assets; logo alpha:',Image.open(files['logo']).getchannel('A').getextrema(),flush=True)
