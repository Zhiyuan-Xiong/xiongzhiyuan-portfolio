from pathlib import Path
from PIL import Image,ImageDraw
import subprocess
root=Path.cwd();exe=root/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';out=root/'public/media/nexus';qa=root/'.cache/nexus'
inputs={'hero':Path(r'D:\c4d practice\梦想之城\fianl  渲染尝试1\试着渲染.mp4'),'transition':Path(r'D:\c4d practice\梦想之城\视频贴图2.mp4')}
thumbs=[]
for name,src in inputs.items():
 subprocess.run([str(exe),'-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-an','-vf','scale=1920:-2','-c:v','libx264','-preset','fast','-crf','23','-maxrate','5M','-bufsize','10M','-pix_fmt','yuv420p','-movflags','+faststart',str(out/(name+'.mp4'))],check=True)
 for second in [0.1,3,7]:
  frame=qa/(name+'-'+str(second)+'.png')
  subprocess.run([str(exe),'-hide_banner','-loglevel','error','-y','-ss',str(second),'-i',str(src),'-frames:v','1','-vf','scale=1280:-2',str(frame)],check=True)
  im=Image.open(frame)
  if second==0.1:im.save(out/(name+'-poster.webp'),quality=91,method=6)
  im.thumbnail((640,360));canvas=Image.new('RGB',(640,390),'#090909');canvas.paste(im,(0,0));ImageDraw.Draw(canvas).text((12,366),name+' / '+str(second)+' s',fill='white');thumbs.append(canvas)
 print(name,round((out/(name+'.mp4')).stat().st_size/1024/1024,2),'MiB',flush=True)
sheet=Image.new('RGB',(1920,780),'black')
for i,im in enumerate(thumbs):sheet.paste(im,((i%3)*640,(i//3)*390))
sheet.save(qa/'video-reference.jpg')
