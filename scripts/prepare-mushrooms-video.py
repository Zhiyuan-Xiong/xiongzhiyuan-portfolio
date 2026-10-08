from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
FFMPEG = ROOT / '.cache/python-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
SOURCES = Path(r'D:\aaa作品集\项目文件\毒蘑菇 music video\5秒版')
OUTPUT = ROOT / 'public/media/mushrooms'
OUTPUT.mkdir(parents=True, exist_ok=True)
clips = [SOURCES / name for name in ['01_毒蘑菇标题.mp4', '02_角色选择.mp4', '03_地图.mp4']]
for clip in clips:
    if not clip.is_file():
        raise FileNotFoundError(clip)

def run(arguments):
    subprocess.run([str(FFMPEG), '-hide_banner', '-loglevel', 'error', '-y', *arguments], check=True)

# Three half-second dissolves, including the map-to-title loop boundary.
# Trim the repeated opening half-second so the loop rejoins at the same title frame.
# The 13.5-second cyclic sequence is accelerated to exactly 10 seconds (300 frames).
filters = (
    '[0:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,split=2[title][repeat];'
    '[1:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB[character];'
    '[2:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB[map];'
    '[repeat]trim=duration=0.5,setpts=PTS-STARTPTS,fps=30,settb=AVTB[loop];'
    '[title][character]xfade=transition=fade:duration=0.5:offset=4.5,fps=30,settb=AVTB[first];'
    '[first][map]xfade=transition=fade:duration=0.5:offset=9,fps=30,settb=AVTB[second];'
    '[second][loop]xfade=transition=fade:duration=0.5:offset=13.5[cycle];'
    '[cycle]trim=start=0.5:end=14,setpts=(PTS-STARTPTS)*20/27,fps=30,tpad=stop_mode=clone:stop_duration=0.1,format=yuv420p[hero]'
)
run([
    '-i', str(clips[0]), '-i', str(clips[1]), '-i', str(clips[2]),
    '-filter_complex_threads', '2', '-filter_complex', filters, '-map', '[hero]', '-an',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '21', '-threads', '4',
    '-t', '10', '-movflags', '+faststart', str(OUTPUT / 'hero.mp4')
])
# Keep the supplied map entry at its original five-second speed and quality.
run(['-i', str(clips[2]), '-map', '0:v:0', '-c:v', 'copy', '-an', '-movflags', '+faststart', str(OUTPUT / 'transition.mp4')])
for source, name in [(clips[0], 'hero-poster.webp'), (clips[2], 'transition-poster.webp')]:
    run(['-ss', '0.5', '-i', str(source), '-frames:v', '1', '-vf', 'scale=1600:-1', '-c:v', 'libwebp', '-quality', '86', str(OUTPUT / name)])
for name in ['hero.mp4', 'transition.mp4']:
    result = subprocess.run([str(FFMPEG), '-hide_banner', '-i', str(OUTPUT / name)], capture_output=True, text=True, encoding='utf-8', errors='replace')
    print(name, (OUTPUT / name).stat().st_size, 'bytes')
    for line in result.stderr.splitlines():
        if 'Duration:' in line or 'Stream #' in line:
            print(line.strip())
