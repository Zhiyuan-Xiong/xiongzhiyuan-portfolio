from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
source=Path(r'D:\AAA找到工作\素材们\项目2\高清6.png')
image=Image.open(source).convert('RGB')
for size in (640,1280,1920):
    out=image.copy()
    out.thumbnail((size,size*2),Image.Resampling.LANCZOS)
    out.save(root/'public/images'/f'species-cultivation-detail-{size}.webp','WEBP',quality=88,method=6)
dimpath=root/'src/data/image-dimensions.json'
dims=json.loads(dimpath.read_text(encoding='utf-8-sig'))
dims['species-cultivation-detail']={'width':1280,'height':720}
dimpath.write_text(json.dumps(dims,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Prepared responsive background from 高清6.png; aspect ratio preserved.')
