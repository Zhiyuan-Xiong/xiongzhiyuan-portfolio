from pathlib import Path
from PIL import Image,ImageOps,ImageFilter,ImageDraw
import json,subprocess
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'.cache/cosmos';OUT=ROOT/'public/media/cosmos';OUT.mkdir(parents=True,exist_ok=True)
FF=ROOT/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
records=json.loads((BASE/'sources.json').read_text(encoding='utf8'));assets={};provenance=[]
def save(name,im,origin,paper=False):
 im=im.convert('RGBA') if 'A' in im.getbands() else im.convert('RGB')
 for suffix,limit in [('',2200),('-large',4800)]:
  output=ImageOps.contain(im,(min(limit,im.width),min(limit,im.height)),method=Image.Resampling.LANCZOS)
  if output.size!=im.size:output=output.filter(ImageFilter.UnsharpMask(.6,65,3))
  output.save(OUT/(name+suffix+'.webp'),quality=94,method=5)
  if not suffix:assets[name]={'src':'/media/cosmos/'+name+'.webp','large':'/media/cosmos/'+name+'-large.webp','width':output.width,'height':output.height,'paper':paper}
 provenance.append({'name':name,**origin,'native_pixels':list(im.size)})
def crop(name,page,box,paper=True):
 im=Image.open(BASE/f'page-{page:02}-image-01.png');scale=im.width/1600;box=[round(v*scale) for v in box]
 save(name,im.crop(box),{'pdf_page':page,'crop_at_1600px':box},paper)
def native(name,index,paper=False):
 p=Path(records[index-1]['file']);save(name,Image.open(p),{'native_file':str(p)},paper)
for args in [('wasp-board',2,[37,195,712,466]),('cocoon-board',2,[37,513,712,778]),('weaverbird-board',2,[37,830,712,1095]),('model-assembly',2,[744,867,1564,1102]),('processing-code',3,[37,219,424,1094]),('processing-states',3,[460,219,826,1094]),('processing-energy',3,[843,219,1563,1094]),('multiverse-grid',4,[669,471,1563,1094])]:crop(*args)
for args in [('model-full',21,True),('model-front',22,True),('model-lines',15,True),('model-detail-one',19,True),('model-detail-two',20,True),('comfy-image-workflow',36,True),('comfy-video-workflow',37,True),('ai-outcome-one',25,False),('ai-outcome-two',24,False)]:native(*args)
hero=Path(r'D:\SKILLS CONCEPT\视频\Skills-infinite cosmos\Skills-infinite cosmos.mp4');processing=Path(r'D:\SKILLS CONCEPT\视频\processing video.mp4')
def run(args):subprocess.run([str(FF),'-hide_banner','-loglevel','error','-y',*args],check=True)
run(['-ss','10.2','-i',str(hero),'-frames:v','1',str(BASE/'cover-native.png')]);cover=Image.open(BASE/'cover-native.png').crop((850,130,3200,1452));save('cover',cover,{'video_file':str(hero),'frame_seconds':10.2,'crop':[850,130,3200,1452]})
for width in [640,1280,1920]:ImageOps.contain(cover,(width,width)).save(ROOT/'public/images'/f'cosmos-cover-{width}.webp',quality=92)
for src,name,time in [(hero,'hero-poster',0.5),(processing,'transition-poster',0.0)]:
 run(['-ss',str(time),'-i',str(src),'-frames:v','1','-vf','scale=1920:-2',str(BASE/(name+'.png'))]);save(name,Image.open(BASE/(name+'.png')),{'video_file':str(src),'frame_seconds':time})
# Keep source timing and aspect ratios. The transition is precisely the first five seconds.
for src,name,duration,vf in [(hero,'hero.mp4',15,'scale=1920:-2'),(processing,'transition.mp4',5,'scale=1280:-2'),(processing,'processing-demo.mp4',10,'scale=1280:-2')]:
 run(['-i',str(src),'-t',str(duration),'-vf',vf,'-r','30','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-threads','4','-movflags','+faststart',str(OUT/name)])
 print(name,(OUT/name).stat().st_size)
(ROOT/'src/data/cosmos-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n',encoding='utf8');(BASE/'extraction-manifest.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf8')
for start in range(0,len(assets),12):
 batch=list(assets.items())[start:start+12];sheet=Image.new('RGB',(1600,((len(batch)+3)//4)*265),'#e9e9ec');d=ImageDraw.Draw(sheet)
 for i,(name,a) in enumerate(batch):
  im=ImageOps.contain(Image.open(OUT/(name+'.webp')).convert('RGBA'),(390,230));x=i%4*400;y=i//4*265;sheet.paste(im,(x+(400-im.width)//2,y+28),im);d.text((x+8,y+7),name,fill='black')
 sheet.save(BASE/f'crop-proof-{start//12+1}.jpg',quality=92)
print('Prepared',len(assets),'complete image groups.')
