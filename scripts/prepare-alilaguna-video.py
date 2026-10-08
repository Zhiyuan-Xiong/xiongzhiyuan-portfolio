from pathlib import Path
import subprocess
root=Path.cwd();exe=root/'.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe';out=root/'public/media/alilaguna';source=Path(r'D:\music video 排版\排版预览\作业final\alilaguna-music video.mp4')
def run(args):subprocess.run([str(exe),'-hide_banner','-loglevel','error','-y',*args],check=True)
run(['-i',str(source),'-map','0:v:0','-map','0:a:0?','-vf','scale=1600:-2','-c:v','libx264','-preset','fast','-crf','23','-maxrate','1250k','-bufsize','2500k','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',str(out/'music-video.mp4')])
run(['-ss','22','-i',str(source),'-t','12','-an','-vf','scale=1920:-2','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'hero-loop.mp4')])
print('Full film and hero loop encoded:',[(p.name,round(p.stat().st_size/1024/1024,2)) for p in out.glob('*.mp4')])
