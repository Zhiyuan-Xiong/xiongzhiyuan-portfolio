from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
import json
root = Path(__file__).resolve().parent.parent
source = root / '.cache' / 'sources'
dest = root / 'public' / 'images'
dest.mkdir(parents=True, exist_ok=True)
mapping = {
    'stigma-cover': 'stigma-10.png', 'stigma-space': 'stigma-5.png', 'stigma-stream': 'stigma-18.png',
    'dating-cover': 'dating-1.png', 'dating-scene-a': 'dating-scenes-3.png', 'dating-scene-b': 'dating-scenes-8.png',
    'dating-gaze-finished': '../dating-figma/raw/1-3622-imgRectangle1.png',
    'mushrooms-cover': 'mushrooms-2.png', 'mushrooms-characters': 'mushrooms-7.png',
    'mushrooms-story-a': 'storyboard-1.png', 'mushrooms-story-b': 'storyboard-3.png',
}
dimensions={}
for name, filename in mapping.items():
    im = Image.open(source / filename).convert('RGB')
    for size in (640, 1280, 1920):
        out = im.copy()
        out.thumbnail((size, size * 2), Image.Resampling.LANCZOS)
        out.save(dest / f'{name}-{size}.webp', 'WEBP', quality=85, method=6)
        if size==1280: dimensions[name]={'width':out.width,'height':out.height}
(root/'src/data/image-dimensions.json').write_text(json.dumps(dimensions,indent=2),encoding='utf-8')
files = sorted([p for p in source.iterdir() if p.name.startswith(('dating-scenes-', 'storyboard-'))])
sheet = Image.new('RGB', (1200, ((len(files)+3)//4)*205), 'white')
d = ImageDraw.Draw(sheet)
for i, file in enumerate(files):
    im = Image.open(file).convert('RGB')
    im.thumbnail((285,170))
    x, y = (i%4)*300, (i//4)*205
    sheet.paste(im,(x+(290-im.width)//2,y))
    d.text((x+6,y+173),file.name,fill='black')
sheet.save(root / '.cache' / 'extra-contact-sheet.jpg')
print('Prepared',len(mapping),'image sets')
