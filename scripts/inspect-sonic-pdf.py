from pathlib import Path
from pypdf import PdfReader
import json
src=next(Path(r'D:\spacial illusion\submission').rglob('*_Portfolio.pdf'))
out=Path('.cache/sonic');out.mkdir(parents=True,exist_ok=True)
r=PdfReader(src)
info=[]
for i,p in enumerate(r.pages):
 text=p.extract_text() or ''
 (out/f'text-{i+1:02}.txt').write_text(text,encoding='utf8')
 imgs=[{'name':im.name,'width':im.image.width,'height':im.image.height} for im in p.images]
 info.append({'page':i+1,'width':float(p.mediabox.width),'height':float(p.mediabox.height),'text_length':len(text),'images':imgs})
(out/'inventory.json').write_text(json.dumps(info,indent=2),encoding='utf8')
(out/'all-text.txt').write_text('\n\n'.join('===== PAGE '+str(i+1)+' =====\n'+(p.extract_text() or '') for i,p in enumerate(r.pages)),encoding='utf8')
print(str(src));print('Pages:',len(r.pages));print(json.dumps(info[:3],indent=2))
