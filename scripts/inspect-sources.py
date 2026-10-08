from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
files=sorted((root/'.cache/sources').glob('*.png'))
font=ImageFont.truetype(str(root/'assets/fonts/NotoSansSC-VF.ttf'),18)
sheet=Image.new('RGB',(1200,((len(files)+3)//4)*215),'#f2f3f5')
d=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
 im=Image.open(f); print(f.name,im.size)
 im.thumbnail((286,170))
 if im.mode=='RGBA':
  bg=Image.new('RGBA',im.size,'#e7e7e7');bg.alpha_composite(im);im=bg.convert('RGB')
 x=(i%4)*300;y=(i//4)*215
 sheet.paste(im,(x+(300-im.width)//2,y))
 d.text((x+8,y+177),f.name,fill='#151515',font=font)
 d.text((x+8,y+195),str(Image.open(f).size),fill='#555555',font=font)
sheet.save(root/'.cache/source-contact-sheet.jpg')
