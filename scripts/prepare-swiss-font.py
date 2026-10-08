from pathlib import Path
from fontTools.ttLib import TTFont
import shutil
root=Path(__file__).resolve().parent.parent
source=Path(r'C:\Windows\Fonts\SWISSEL.TTF')
archive=root/'assets/fonts/project/SWISSEL.TTF'
shutil.copy2(source,archive)
font=TTFont(archive)
font.flavor='woff2'
font.save(root/'public/fonts/swiss-light.woff2')
print('Swiss Light WOFF2 saved to D:',(root/'public/fonts/swiss-light.woff2').stat().st_size,'bytes')
