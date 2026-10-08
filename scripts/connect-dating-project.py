from pathlib import Path
root=Path.cwd()
base=root/'src/layouts/Base.astro'
s=base.read_text('utf-8').replace("import { name, ui,", "import ProjectPortal from '../components/ProjectPortal.astro';\nimport { name, ui,")
s=s.replace('spatial?: boolean }','spatial?: boolean; festival?: boolean }').replace('spatial=false }','spatial=false, festival=false }').replace('"has-portfolio-space": spatial','"has-portfolio-space": spatial, "has-festival":festival')
s=s.replace('    <script src="../scripts/site.ts"></script>',"    {(active==='home'||active==='explore'||active==='works')&&<ProjectPortal lang={lang}/>}\n    <script src=\"../scripts/site.ts\"></script>")
base.write_text(s,encoding='utf-8')
case=root/'src/pages/[lang]/work/[slug].astro'
s=case.read_text('utf-8').replace("import Artwork from","import DatingFestival from '../../../components/DatingFestival.astro';\nimport Artwork from")
s=s.replace('active="works">','active="works" festival={p.slug===\'dating-carnival\'}>')
s=s.replace('  <div class="container case-page">','  {p.slug===\'dating-carnival\' ? <DatingFestival lang={lang}/> : <div class="container case-page">')
s=s.replace('  </div>\n</Base>','  </div>}\n</Base>')
case.write_text(s,encoding='utf-8')
gallery=root/'src/scripts/work-gallery.ts'
s=gallery.read_text('utf-8').replace("tab.addEventListener('click', () => select(tab));","tab.addEventListener('click', () => { if(tab.dataset.galleryProject===selectedSlug){dispatchEvent(new CustomEvent('portfolio:preview',{detail:selectedSlug}));}else select(tab); });")
gallery.write_text(s,encoding='utf-8')
space=root/'src/scripts/portfolio-space.ts'
s=space.read_text('utf-8').replace("link.href=`/","link.href=`/")
needle="link.href=\x60/\x24{root!.dataset.lang}/work/\x24{item.slug}/\x60;"
s=s.replace(needle,needle+"\n    if(item.status==='published'){imageFrame.dataset.projectHref=link.href;imageFrame.setAttribute('role','link');imageFrame.tabIndex=0;imageFrame.setAttribute('aria-label',(root!.dataset.lang==='zh'?'查看作品：':'View project: ')+item.title);}else{delete imageFrame.dataset.projectHref;imageFrame.removeAttribute('role');imageFrame.tabIndex=-1;}")
s=s.replace("  closeButton.addEventListener('click',()=>closeProject());","  const enterSelected=()=>{if(imageFrame.dataset.projectHref)dispatchEvent(new CustomEvent('portfolio:enter-project',{detail:imageFrame.dataset.projectHref}));};\n  imageFrame.addEventListener('click',enterSelected);imageFrame.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();enterSelected();}});\n  closeButton.addEventListener('click',()=>closeProject());")
s=s.replace("const controls=[closeButton,...panel.querySelectorAll<HTMLAnchorElement>('a:not([hidden])')]","const controls=[closeButton,...(imageFrame.tabIndex===0?[imageFrame]:[]),...panel.querySelectorAll<HTMLAnchorElement>('a:not([hidden])')]")
space.write_text(s,encoding='utf-8')
css=root/'src/styles/project-portal.css'
s=css.read_text('utf-8')
fonts=(root/'src/styles/dating-festival.css').read_text('utf-8').split('.has-festival')[0]
s=fonts+s+"\n.project-preview.is-melting{animation:project-melt .8s ease both;pointer-events:none}\n"
css.write_text(s,encoding='utf-8')
mapfile=root/'src/components/FestivalMap.astro'
s=mapfile.read_text('utf-8').replace("base+'1-2462-imgGroup'+(2+i)+'.svg'","base+'1-2462-imgGroup'+(i===0?5:i===1?3:2)+'.svg'")
s=s.replace('<img class="map-glyph" src={base+\'1-2462-imgGroup\'+(i===0?5:i===1?3:2)+\'.svg\'} alt="" />','<img class:list={[\'map-glyph\',{\'map-heart-left\':i===1}]} src={base+\'1-2462-imgGroup\'+(i===0?5:i===1?3:2)+\'.svg\'} alt="" />{i===1&&<img class="map-glyph map-heart-right" src={base+\'1-2462-imgGroup4.svg\'} alt="" />}')
mapfile.write_text(s,encoding='utf-8')
page=root/'src/components/DatingFestival.astro'
s=page.read_text('utf-8')
start=s.find('<button type="button" data-hero-sound')
end=s.find('</button>',start)+len('</button>')
s=s[:start]+'<span>05s / LOOP</span>'+s[end:]
page.write_text(s,encoding='utf-8')
script=root/'src/scripts/dating-festival.ts'
s=script.read_text('utf-8')
s=s.replace(" const sound=document.querySelector<HTMLButtonElement>('[data-hero-sound]')!;\n","")
s='\n'.join(line for line in s.split('\n') if not line.startswith(" sound.addEventListener"))
script.write_text(s,encoding='utf-8')
print('Project page and both entry flows connected')
