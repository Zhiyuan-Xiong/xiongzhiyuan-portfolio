from pathlib import Path
import shutil
root = Path(__file__).resolve().parent.parent
source = root / 'public/resume/zhiyuan-experience-2026.pdf'
if not source.exists():
    raise SystemExit('Missing supplied experience-design CV. Restore the original; do not generate an outdated replacement.')
shutil.copy2(source, root / 'public/resume/zhiyuan-zh.pdf')
print('Restored Chinese CV from the supplied original. English About uses the same Chinese source download.')
