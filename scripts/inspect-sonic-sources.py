from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
out=Path('.cache/sonic');sources=list(Path(r'D:\spacial illusion\P后的选图\P后的选图').glob('*'))
sources+=[p for p in Path(r'D:\spacial illusion\analysis final 分析图').glob('*.png') if 'OBJ' not in str(p)]
for group,start in enumerate(range(0,len(sources),20)):
 batch=sources[start:start+20];sheet=Image.new('RGB',(1600,5*255),'#14151b');draw=ImageDraw.Draw(sheet)
 for i,p in enumerate(batch):
  if p.suffix.lower() not in ['.jpg','.jpeg','.png']:continue
  try:im=Image.open(p);thumb=ImageOps.contain(im,(400,225));x=i%4*400;y=i//4*255;sheet.paste(thumb,(x+(400-thumb.width)//2,y+25));draw.text((x+8,y+4),f'{start+i}: {p.stem}',fill='white')
  except Exception:pass
 sheet.save(out/f'sources-{group+1}.jpg',quality=88)
(out/'source-image-list.txt').write_text('\n'.join(str(p) for p in sources),encoding='utf8')
print(len(sources),'candidate sources inventoried')
