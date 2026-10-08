from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import shutil
root=Path(__file__).resolve().parent.parent
orig=Path(r'C:\Users\24586\AppData\Local\Microsoft\Windows\Fonts')
dest=root/'assets/fonts/dating';dest.mkdir(parents=True,exist_ok=True)
mapping={'dating-title':'AA暗夜深渊(1).TTF','dating-english':'SAINTCARELL_PERSONAL_USE_ONLY.OTF','dating-body':'PINGFANG REGULAR.TTF','dating-medium':'PINGFANG MEDIUM.TTF'}
chars=''.join(p.read_text('utf-8') for p in (root/'src').rglob('*') if p.is_file())+''.join(chr(i) for i in range(32,127))
for name,filename in mapping.items():
 p=orig/filename;local=dest/filename;shutil.copy2(p,local) if not local.exists() else None
 options=subset.Options();options.flavor='woff2';options.layout_features=['*']
 font=subset.load_font(str(local),options)
 sub=subset.Subsetter(options=options);sub.populate(text=chars);sub.subset(font)
 out=root/'public/fonts'/str(name+'.woff2');subset.save_font(font,str(out),options)
 print(name,out.stat().st_size,flush=True)

