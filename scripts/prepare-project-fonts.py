from pathlib import Path
from fontTools import subset
import shutil

root = Path(__file__).resolve().parent.parent
source = Path(r'C:\Users\24586\AppData\Local\Microsoft\Windows\Fonts')
archive = root / 'assets/fonts/project'
archive.mkdir(parents=True, exist_ok=True)
characters = ''.join(p.read_text('utf-8') for p in (root / 'src').rglob('*') if p.is_file())
characters += ''.join(chr(i) for i in range(32, 256))
for name, filename in {'dark-abyss': 'AA暗夜深渊(1).TTF', 'nexus-scotch': 'SCOTCH ROMAN MT.TTF', 'pingfang-portfolio-v2': 'PINGFANG REGULAR.TTF', 'pingfang-medium-v2': 'PINGFANG MEDIUM.TTF'}.items():
    local = archive / filename
    shutil.copy2(source / filename, local)
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    font = subset.load_font(str(local), options)
    selected = subset.Subsetter(options=options)
    selected.populate(text=characters)
    selected.subset(font)
    output = root / 'public/fonts' / (name + '.woff2')
    subset.save_font(font, str(output), options)
    print(name, output.stat().st_size, 'bytes', flush=True)
