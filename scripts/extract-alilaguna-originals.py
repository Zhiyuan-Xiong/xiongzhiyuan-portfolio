import json,base64
from pathlib import Path
from PIL import Image,ImageOps
root=Path('.cache/alilaguna');out=Path('public/media/alilaguna');p=Path('src/data/alilaguna-assets.json');assets=json.loads(p.read_text(encoding='utf8'))
# The exported PDF consists of 8000x4500 page images. Extract their original raster data,
# rather than enlarging a screenshot or regenerating any authored composition.
from pypdf import PdfReader
import pypdf.filters
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=200_000_000
reader=PdfReader(r'D:\music video 排版\Alilaguna-portfolio.pdf')
for n,page in enumerate(reader.pages):
 data=next(iter(page.images)).data;(root/f'original-{n+1:02}.png').write_bytes(data)
manifest=json.loads((root/'extraction-manifest.json').read_text(encoding='utf8'))
for item in manifest:
 name=item['name'];rect=item['normalized_crop']
 if not rect:continue
 page=int(Path(item['source']).stem.split('-')[1]);im=Image.open(root/f'original-{page:02}.png');box=tuple(round(v*(im.width if i%2==0 else im.height)) for i,v in enumerate(rect))
 if name.startswith('showcase-'):box=(round(.024*im.width),round(.216*im.height),round(.980*im.width),round(.812*im.height))
 im=im.crop(box)
 for suffix,maxsize in [('',(1800,1800)),('-large',(4000,4000))]:
  render=ImageOps.contain(im,maxsize);render.save(out/(name+suffix+'.webp'),quality=95,method=6)
  if not suffix:assets[name]['width']=render.width;assets[name]['height']=render.height
# Transparent SVGs preserve the original raster exactly. A small native SVG filter masks
# only neutral paper whites; it does not recreate, segment, or alter the collage geometry.
for name,asset in assets.items():
 for key in ['src','large']:
  raster=Path('public'+asset[key]);encoded=base64.b64encode(raster.read_bytes()).decode('ascii');im=Image.open(raster);w,h=im.size
  svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><defs><filter id="paper" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.333333 -.333333 -.333333 0 1"/><feComponentTransfer><feFuncA type="table" tableValues="0 .92 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"/></feComponentTransfer></filter><mask id="white" mask-type="alpha"><image width="{w}" height="{h}" href="data:image/webp;base64,{encoded}" filter="url(#paper)"/></mask></defs><image width="{w}" height="{h}" href="data:image/webp;base64,{encoded}" mask="url(#white)"/></svg>'''
  path=raster.with_suffix('.svg');path.write_text(svg,encoding='utf8');asset[key]='/'+path.relative_to('public').as_posix()
# Selected native PNG wordmark keeps its own alpha, without the PDF paper mask.
word=Image.open(Path(r'D:\music video 排版\排版素材\叠.png')).convert('RGBA')
for suffix,width,key in [('',1800,'src'),('-large',4000,'large')]:
 im=ImageOps.contain(word,(width,width));dest=out/('wordmark'+suffix+'.webp');im.save(dest,quality=95);assets['wordmark'][key]='/'+dest.relative_to('public').as_posix()
p.write_text(json.dumps(assets,ensure_ascii=False,indent=2),encoding='utf8');print('Original 8000px source extraction + transparent SVG artwork created.')

