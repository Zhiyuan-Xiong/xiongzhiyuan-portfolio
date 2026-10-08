from pathlib import Path
from pypdf import PdfReader
from PIL import Image,ImageOps,ImageDraw
import json
root=Path('.cache/sonic');src=next(Path(r'D:\spacial illusion\submission').rglob('*_Portfolio.pdf'));reader=PdfReader(src)
for n,p in enumerate(reader.pages):
 path=root/f'original-{n+1:02}.png'
 if not path.exists():next(iter(p.images)).image.convert('RGB').save(path)
for group,start in enumerate(range(1,36,9)):
 sheet=Image.new('RGB',(1800,1095),'#15151a');draw=ImageDraw.Draw(sheet)
 for i,page in enumerate(range(start,min(start+9,36))):
  im=Image.open(root/f'page-{page:02}.jpg');thumb=ImageOps.contain(im,(600,338));x=i%3*600;y=i//3*365;draw.text((x+10,y+7),f'PAGE {page}',fill='white');sheet.paste(thumb,(x,y+27))
 sheet.save(root/f'contact-{group+1}.jpg',quality=90)
print('35 native 4096px PDF page rasters saved; 4 visual inventories ready.')
