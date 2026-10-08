from fontTools import subset
from pathlib import Path
root=Path(__file__).resolve().parent.parent
font_path=root / 'assets' / 'fonts' / 'NotoSansSC-VF.ttf'
texts=''.join(p.read_text(encoding='utf-8') for p in (root/'src').rglob('*') if p.is_file())
chars=''.join(set(texts))+''.join(chr(i) for i in range(32,127))
options=subset.Options()
options.flavor='woff2'
font=subset.load_font(str(font_path),options)
subsetter=subset.Subsetter(options=options)
subsetter.populate(text=chars)
subsetter.subset(font)
dest=root/'public'/'fonts'
dest.mkdir(parents=True,exist_ok=True)
subset.save_font(font,str(dest/'portfolio-sans.woff2'),options)
print('Local font subset prepared')
