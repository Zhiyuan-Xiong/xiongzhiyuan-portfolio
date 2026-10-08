"""Extract intact artwork blocks, never whole portfolio pages, from the user's PDF."""
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
import json
root=Path('.cache/alilaguna'); target=Path('public/media/alilaguna'); target.mkdir(parents=True,exist_ok=True)
manifest={}; provenance=[]
def save(name,im,source,rect=None):
 im=im.convert('RGB') if im.mode not in ['RGB','RGBA'] else im
 hi=ImageOps.contain(im,(3600,3600)); hi.save(target/(name+'-large.webp'),quality=94,method=6)
 display=ImageOps.contain(im,(1800,1800));display.save(target/(name+'.webp'),quality=92,method=6)
 manifest[name]={'src':'/media/alilaguna/'+name+'.webp','large':'/media/alilaguna/'+name+'-large.webp','width':display.width,'height':display.height}
 provenance.append({'name':name,'source':str(source),'normalized_crop':rect,'original_pixels':list(im.size)})
def crop(name,page,rect):
 source=root/f'hi-{page:02}.jpg'; im=Image.open(source); box=tuple(round(v*(im.width if n%2==0 else im.height)) for n,v in enumerate(rect));save(name,im.crop(box),source,rect)
crop('cover-collage',1,[0,0,1,.802])
crop('inspiration-collage',2,[.025,.222,.381,.952])
crop('journey-collage',2,[.406,.192,.974,.640])
crop('metaphor-board',2,[.408,.731,.972,.950])
crop('reference-board',3,[.029,.130,.304,.948])
crop('narrative-map',3,[.330,.194,.974,.360])
crop('technical-map',3,[.330,.409,.974,.598])
crop('audio-analysis',3,[.331,.738,.974,.944])
crop('location-collage',4,[.026,.248,.241,.952])
crop('storyboard',4,[.267,.156,.972,.951])
crop('capture-process',5,[.028,.129,.326,.951])
crop('modelling-process',5,[.351,.129,.652,.951])
crop('editing-process',5,[.674,.129,.975,.951])
crop('version-one',6,[.029,.129,.973,.711])
crop('rejected-motifs',6,[.028,.761,.340,.949])
crop('timeline-analysis',8,[.026,.151,.975,.745])
# Each showcase retains the four-shot arrangement and the original background layer.
# Remove only the page title and explanatory paragraph areas.
for page,name in [(9,'showcase-one'),(10,'showcase-two'),(11,'showcase-three')]:crop(name,page,[.024,.216,.597,.810])
# Source-native authored collages and scene compositions, selected to support PDF sections.
assets=Path(r'D:\music video 排版\排版素材')
for name,src in [('vertical-space','trainpaibanfinal.png'),('river-vessel','boat1.png'),('flooded-carriage','traininside.png'),('wordmark','叠.png')]:save(name,Image.open(assets/src),assets/src)
# Source-native models stay together as a diptych, rather than isolated frame cards.
a=Image.open(assets/'traininside.png').convert('RGB');b=Image.open(assets/'boat1.png').convert('RGB');pair=Image.new('RGB',(3840,4370),'white');pair.paste(a,(0,0));pair.paste(b,(0,2210));save('virtual-diptych',pair,'traininside.png + boat1.png')
Path('src/data/alilaguna-assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
(root/'extraction-manifest.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf8')
cover=Image.open(root/'hi-01.jpg').crop((0,0,6000,round(3375*.802)))
for width in [640,1280,1920]:ImageOps.contain(cover,(width,9999)).save(Path('public/images')/f'alilaguna-cover-{width}.webp',quality=90,method=6)
p=Path('src/data/image-dimensions.json');sizes=json.loads(p.read_text(encoding='utf-8-sig'));sizes['alilaguna-cover']={'width':1280,'height':round(cover.height*1280/cover.width)};p.write_text(json.dumps(sizes,ensure_ascii=False,indent=2),encoding='utf8')
print('Extracted',len(manifest),'artwork blocks; preserved layouts; web + enlarged variants.')
