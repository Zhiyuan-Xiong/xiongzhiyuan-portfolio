from pathlib import Path
from PIL import Image,ImageOps,ImageFilter,ImageDraw
import json,csv,subprocess
ROOT=Path(r'D:\aaa作品集\portfolio-site');BASE=ROOT/'.cache/earthquake';OUT=ROOT/'public/media/earthquake';OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(r'D:\skills portfolio\jupyter-earthquake');NB=SRC/'jupyter-earthquake'
FF=ROOT/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
assets={};provenance=[]
def save(name,im,source,paper=False):
 im=im.convert('RGBA')
 transparent=name in {'extrusion','distribution','density','fragmentation','composition','spatial-detail'}
 if not transparent and im.getextrema()[-1][0]<255:
  bg=Image.new('RGBA',im.size,'white' if paper else 'black');bg.alpha_composite(im);im=bg
 if not transparent:im=im.convert('RGB')
 file_name=name+'-transparent' if transparent else name
 for suffix,limit in [('',2200),('-large',4800)]:
  output=ImageOps.contain(im,(min(limit,im.width),min(limit,im.height)),method=Image.Resampling.LANCZOS)
  if output.size!=im.size:output=output.filter(ImageFilter.UnsharpMask(.6,65,3))
  output.save(OUT/(file_name+suffix+'.webp'),quality=94,method=5,exact=transparent)
  if not suffix:assets[name]={'src':'/media/earthquake/'+file_name+'.webp','large':'/media/earthquake/'+file_name+'-large.webp','width':output.width,'height':output.height,'paper':paper,'transparent':transparent}
 provenance.append({'asset':name,'source':str(source),'pixels':list(im.size)})
def native(name,path,paper=False):save(name,Image.open(path),path,paper)
def pdf(name,page,index=1,paper=False):native(name,BASE/f'page-{page:02}-image-{index:02}.png',paper)
native('cover',SRC/'video rendering3/0121.png')
native('hero-poster',SRC/'video rendering3/0121.png')
native('transition-poster',SRC/'video rendering3/0001.png')
native('multi-instance',SRC/'rendering/1.png')
pdf('image-collection',4,1,True)
for name,file in [('image-brightness','brightness'),('image-edge','edge'),('image-damage','damage'),('image-clusters','cluster'),('image-pca','pca'),('detected-people','yolo_people'),('detected-objects','yolo_objects')]:native(name,NB/f'output_photos/analysis_images/{file}.png',True)
for name,file in [('news-keywords','keywords'),('news-sentiment','sentiment'),('news-clusters','cluster'),('news-pca','pca')]:native(name,NB/f'output/images/{file}.png',True)
for name,page in [('magnitude',15),('depth-magnitude',16),('fusion-clusters',17),('fusion-space',18),('fusion-emotion',19),('fusion-keywords',20)]:pdf(name,page,1,True)
for name,page,index in [('extrusion',24,1),('distribution',24,2),('density',25,3),('fragmentation',25,2),('composition',25,1)]:pdf(name,page,index)
pdf('blender-programming',28)
pdf('spatial-detail',33)
pdf('grid-light',30,1)
pdf('grid-development',30,2)
native('processing-poster',SRC/'processing/pointcloud/frames/earthquake_0181.png')
# Complete original eight-frame analysis, with source proportions preserved.
frames=[Image.open(BASE/f'page-32-image-{i:02}.png').convert('RGB') for i in range(1,9)]
board=Image.new('RGB',(2400,3200),'black')
for i,im in enumerate(frames):board.paste(im,(i%2*1200,i//2*800))
save('processing-sequence',board,'PDF page 32 / all eight native images')
# Only numerical design data is published; no local paths, account data, or raw news/tweets.
with (NB/'outputs/final_fusion_data.csv').open(encoding='utf-8-sig') as f:rows=list(csv.DictReader(f))
fields=['Magnitude','Depth','Latitude','Longitude','magnitude_norm','depth_norm','x','y','z','scale','fragmentation','rotation_chaos','material_index']
data=[]
for i,row in enumerate(rows):
 item={'index':i+1,'date':row['DateTime'][:10],'emotion':row['emotion_label'],'cluster':int(row['cluster_id'])}
 item.update({key:round(float(row[key]),7) for key in fields});data.append(item)
(ROOT/'src/data/earthquake-samples.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
with (OUT/'design-samples.csv').open('w',newline='',encoding='utf-8') as f:
 w=csv.DictWriter(f,fieldnames=list(data[0]));w.writeheader();w.writerows(data)
cover=Image.open(SRC/'video rendering3/0121.png').convert('RGB')
for width in [640,1280,1920]:ImageOps.contain(cover,(width,width)).save(ROOT/'public/images'/f'earthquake-cover-{width}.webp',quality=92)
# The entry sphere retains its monochrome, restrained translucency through its existing shader.
planet=ImageOps.grayscale(cover).convert('RGB');ImageOps.contain(planet,(1024,1024)).save(ROOT/'public/media/planet/earthquake-field.webp',quality=91)
def run(args):subprocess.run([str(FF),'-hide_banner','-loglevel','error','-y',*args],check=True)
seq=str(SRC/'video rendering3/%04d.png')
run(['-framerate','30','-start_number','1','-i',seq,'-frames:v','240','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-threads','4','-movflags','+faststart',str(OUT/'hero.mp4')])
run(['-framerate','30','-start_number','1','-i',seq,'-t','5','-vf','scale=1280:-2','-an','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-threads','4','-movflags','+faststart',str(OUT/'transition.mp4')])
# 720 complete frames; incomplete frame 723 is excluded.
run(['-framerate','60','-start_number','1','-i',str(SRC/'processing/pointcloud/frames/earthquake_%04d.png'),'-frames:v','360','-r','30','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-threads','4','-movflags','+faststart',str(OUT/'processing-demo.mp4')])
(ROOT/'src/data/earthquake-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(BASE/'extraction-manifest.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2),encoding='utf8')
for start in range(0,len(assets),12):
 batch=list(assets.items())[start:start+12];sheet=Image.new('RGB',(1600,((len(batch)+3)//4)*280),'#e5e5e5');d=ImageDraw.Draw(sheet)
 for i,(name,a) in enumerate(batch):
  im=ImageOps.contain(Image.open(ROOT/'public'/a['src'].lstrip('/')),(390,245));x=i%4*400;y=i//4*280;sheet.paste(im,(x+(400-im.width)//2,y+28));d.text((x+8,y+7),name,fill='black')
 sheet.save(BASE/f'asset-proof-{start//12+1}.jpg',quality=92)
print('Prepared',len(assets),'native figures;',len(data),'design samples; 3 local videos.')
