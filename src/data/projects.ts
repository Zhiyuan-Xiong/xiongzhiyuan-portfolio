import {metamorphosis} from './metamorphosis';
import {earthquake} from './earthquake';
import {cosmos} from './cosmos';
import {sonic} from './sonic';
import {alilaguna} from './alilaguna';
import {species} from './species';
import {skeleton,skeletonPieces} from './skeleton';
import {nexus,nexusScenes} from './nexus';
import { festival, scenes as datingScenes } from './dating-festival';
import { c, type Copy, type Category } from './site';
export interface Figure { image: string; alt: Copy; caption: Copy; portrait?: boolean }
export interface Section { id: string; title: Copy; paragraphs?: Copy[]; points?: { title: Copy; text: Copy }[]; figures?: Figure[] }
export interface Project {
  slug: string; title: Copy; subtitle: Copy; description: Copy; categories: Category[];
  status: 'published' | 'progress' | 'pending'; kind: Copy; year?: string; cover?: string; coverAlt?: Copy; background?: string;
  featured?: boolean; role?: Copy; stage?: Copy; deliverables?: Copy; overview?: Copy;
  sections?: Section[]; video?: string;
}
export const projects: Project[] = [
  {
    slug: 'stigma', title: c('病名异化实验场', 'The Big Bang Stigma'), subtitle: c('一次关于标签、身体与观看的交互体验', 'An interactive exploration of labels, bodies, and the gaze'),
    description: c('将疾病污名的研究转译为一条跨越身份生成、求职与直播表演的交互路径。', 'Translating research on illness stigma into an interactive journey through identity, recruitment, and livestream performance.'),
    categories: ['installation', 'ux', '3d'], status: 'published', kind: c('XR／交互体验 · 协作项目', 'XR / Interaction · Collaborative project'), year: '2024', featured: true,
    background: 'stigma-space', cover: 'stigma-cover', coverAlt: c('紫粉色虚拟表演空间，中央人物被舞台与观众视线包围。', 'A pink and purple virtual performance space with a figure at its centre.'),
    role: c('交互体验与视觉设计（协作项目）', 'Interaction and visual design within a collaborative project'),
    stage: c('研究、XR 体验设计与装置原型', 'Research, XR experience design, and installation prototypes'),
    deliverables: c('体验路径、交互机制、虚拟场景与直播视觉', 'Experience journey, interaction mechanisms, virtual environments, and livestream visuals'),
    overview: c('疾病如何从一个人的处境，变成社会评价中的标签？项目围绕污名化、娱乐化与浪漫化三个层面，用连续的交互情境呈现标签如何形成，并影响个体的机会与自我表达。', 'How does an illness become a social label? This project explores stigmatisation, entertainment, and romanticisation through connected scenarios that reveal how labels shape opportunity and self-expression.'),
    sections: [
      { id: 'question', title: c('01　问题与目标', '01　Question & intent'), paragraphs: [c('研究材料关注疾病在就业、社交媒体与流行文化中的呈现。同一个标签可能在求职时成为障碍，在直播中被当作表演素材，也可能被包装成一种审美符号。', 'The research examines representations of illness in employment, social media, and popular culture. A label may become a barrier in recruitment, material for a performance, or an aesthetic symbol.'), c('设计目标是让参与者体验这些评价机制之间的联系，而不只是观看一组关于污名的说明。项目中的身份与评分属于叙事情境，不承担医学诊断功能。', 'The aim is to let participants experience connections between these judgements. Identities and scores are elements of the narrative, rather than medical assessments.')] },
      { id: 'research', title: c('02　从研究到体验结构', '02　From research to experience'), points: [
        { title: c('污名化', 'Stigmatisation'), text: c('把个体简化为疾病标签，观察标签如何影响招聘判断。', 'Reduce an individual to a label and explore how that label influences recruitment decisions.') },
        { title: c('娱乐化', 'Entertainment'), text: c('把身体与行为变成观看、指令与评分的对象。', 'Turn bodies and behaviour into objects of viewing, instruction, and rating.') },
        { title: c('浪漫化', 'Romanticisation'), text: c('将过程数据转化为审美化的身份肖像，反观这种包装。', 'Turn accumulated data into an aesthetic portrait and question the packaging of identity.') },
      ] },
      { id: 'decisions', title: c('03　关键交互决策', '03　Key interaction decisions'), paragraphs: [c('用一条连续路径连接不同媒介。前一环节生成的身份与行为信息，成为下一环节的输入，让标签的影响累积，而不是每个场景重新开始。', 'A continuous journey connects different media. Identity and behaviour from one stage feed into the next, so the effects of a label accumulate.')], points: [
        { title: c('身份生成', 'Identity generation'), text: c('以问卷与面部输入作为身份生成的设计入口，形成虚构角色档案。', 'Questionnaire and facial inputs form the proposed entry point for generating a fictional profile.') },
        { title: c('虚拟求职', 'Virtual recruitment'), text: c('通过词语选择、时间压力与带偏见的评分规则，把抽象的招聘判断变成可感知的反馈。', 'Word selection, time pressure, and biased scoring make abstract recruitment judgements tangible.') },
        { title: c('直播表演', 'Livestream performance'), text: c('设计观众指令、评价与身体反馈之间的关系，探索 Kinect 与压力输入的可能性。', 'Design relationships between audience instructions, ratings, and bodily feedback, exploring Kinect and pressure inputs.') },
        { title: c('身份肖像', 'Identity portrait'), text: c('让积累的信息进入最终视觉结果，呈现一个人被观看和重构的过程。', 'Carry accumulated information into the final visual result, revealing how a person is viewed and reconstructed.') },
      ] },
      { id: 'visuals', title: c('04　场景与视觉原型', '04　Environments & visual prototypes'), figures: [
        { image: 'stigma-cover', alt: c('虚拟直播表演舞台的全景。', 'An overview of the virtual livestream performance stage.'), caption: c('表演空间：用舞台、尺度与色彩强调身体被观看的处境。', 'Performance space: stage, scale, and colour emphasise the body as an object of observation.') },
        { image: 'stigma-space', alt: c('紫色虚拟环境中的人物与空间。', 'A figure within a purple virtual environment.'), caption: c('虚拟场景探索：让情境从屏幕界面延伸到空间体验。', 'Virtual environment exploration extends the scenario beyond a screen.') },
        { image: 'stigma-stream', alt: c('项目中的竖屏直播界面视觉。', 'The vertical livestream interface visual developed for the project.'), caption: c('直播视觉：将空间表演与界面中的观看关系连接。', 'Livestream visual: connecting spatial performance with interface-mediated viewing.'), portrait: true },
      ] },
      { id: 'reflection', title: c('05　验证与反思', '05　Validation & reflection'), paragraphs: [c('当前材料展示了研究转译、交互方案与视觉原型。它们说明设计如何把社会议题变成可体验的机制，但尚不足以证明参与者态度发生了改变。', 'The available material documents research translation, interaction concepts, and visual prototypes. These show how a social question can become an experience, but do not establish a change in participants’ attitudes.'), c('下一步需要验证：参与者能否理解环节之间的数据关系，评分是否被理解为对偏见的呈现，以及退出与说明是否足够清晰。对敏感议题的表达，也需要邀请不同背景的参与者反馈。', 'Future evaluation should examine whether participants understand connections between stages, recognise scoring as a portrayal of bias, and can clearly exit or find explanations. Feedback from people with different backgrounds is also essential.')] },
    ],
  },
  {
    slug: 'dating-carnival', title: festival.title, subtitle: c('把相亲市场的规则变成可探索的叙事空间', 'Turning the rules of a dating market into an explorable narrative'),
    description: c('通过六个相连的场景，探索信息包装、条件匹配与社会评价如何影响亲密关系。', 'Six connected scenes explore how self-presentation, conditional matching, and social judgement shape intimate relationships.'),
    categories: ['installation', '3d', 'ux'], status: 'published', kind: c('交互叙事／三维空间', 'Interactive narrative / 3D environments'), year: '2024', featured: true,
    background: 'dating-gaze-finished', cover: 'dating-cover', coverAlt: c('红色机械嘉年华场景，装置与游乐设施组成相亲市场。', 'A red mechanical carnival where installations and rides form a dating market.'),
    role: c('交互叙事、场景与视觉设计', 'Interactive narrative, environment, and visual design'), stage: c('概念设计、场景可视化与概念影像', 'Concept design, environment visualisation, and concept film'),
    deliverables: c('研究梳理、六个场景、选择与反馈机制、概念视觉', 'Research synthesis, six scenes, choice and feedback mechanisms, and concept visuals'),
    overview: festival.overview,
    sections: [
      {id:'research',title:c('研究背景','Background'),paragraphs:festival.background.map(x=>x.text)},
      {id:'mechanisms',title:c('设计推演','Development'),points:festival.mechanisms},
      ...datingScenes.map(scene=>({id:scene.id,title:scene.title,paragraphs:[scene.summary],points:scene.parts.map(part=>({title:part.title,text:part.text}))})),
      {id:'concept-film',title:c('概念影片','Concept Film'),paragraphs:[festival.film]},
    ],
  },
  {
    slug: 'poisonous-mushrooms', title: c('《毒蘑菇》', 'Poisonous Mushrooms'), subtitle: c('从音乐叙事到游戏世界的视觉延伸', 'From music narrative to an extended game world'),
    description: c('为邓泽西的 MV 参与前期概念、场景与分镜设计，并将视觉世界延伸至宣传小游戏。', 'Contributing concept, environment, and storyboard design to Deng Zexi’s music video, with a visual extension into a promotional mini-game.'),
    categories: ['video', 'visual', 'ux'], status: 'published', kind: c('音乐影像／商业协作', 'Music video / Commercial collaboration'), featured: true,
    background: 'mushrooms-story-b', cover: 'mushrooms-cover', coverAlt: c('蘑菇森林构成的游戏开始画面，中央显示毒蘑菇标题。', 'A mushroom forest forms the game start screen, with the title at its centre.'),
    role: c('前期概念、场景与分镜；宣传小游戏玩法与视觉资产；参与调色与视觉统一', 'Early concept, environments, and storyboards; promotional mini-game gameplay and assets; contribution to grading and visual consistency'),
    stage: c('MV 已发布；本页展示个人参与部分', 'Music video released; this case documents my contributions'),
    deliverables: c('概念方案、叙事分镜、游戏界面与视觉资产', 'Concept direction, narrative storyboards, game interface, and visual assets'),
    overview: c('邓泽西的官方 MV，以一位职场女性进入奇幻游戏世界并成为蘑菇女巫为线索。我参与前期整体概念、场景与分镜设计，并设计用于宣传的小游戏玩法与视觉资产。', 'Deng Zexi’s official music video follows an office worker into a fantasy game world, where she becomes a mushroom witch. I contributed the early concept, environments, and storyboards, and designed gameplay and visual assets for a promotional mini-game.'),
    video: 'https://www.bilibili.com/video/BV1YzXkB3Exp/',
    sections: [
      { id: 'concept', title: c('01　概念与目标', '01　Concept & intent'), paragraphs: [c('用“进入游戏”连接现实职场与奇幻世界，让音乐中的态度通过角色、空间与情节得到表达。经典绘画的视觉引用，成为画面构成与情绪的素材。', 'Entering a game connects office life with a fantasy world, allowing the music’s attitude to emerge through characters, spaces, and events. References to classical paintings inform composition and mood.')], points: [
        { title: c('游戏化叙事', 'Game narrative'), text: c('以进入、探索、对抗与返回组织影像，而不是只串联独立画面。', 'Entry, exploration, confrontation, and return organise the film as a connected journey.') },
        { title: c('视觉再创作', 'Visual reinterpretation'), text: c('在绘画参考、数字绘制与场景设计之间建立一致的视觉语言。', 'Build a consistent language across painting references, digital artwork, and environments.') },
        { title: c('宣传体验延伸', 'Promotional extension'), text: c('让观众在小游戏中继续接触 MV 的角色与世界。', 'Let audiences encounter the video’s characters and world through a mini-game.') },
      ] },
      { id: 'storyboard', title: c('02　叙事与分镜', '02　Narrative & storyboards'), paragraphs: [c('叙事由扭曲的职场开始，经过进入世界、森林探索与规则冲突，再到女巫觉醒、对话反击、掌控世界与返回现实。分镜把这些转折落实到镜头、人物与空间关系。', 'The story moves from a distorted office into a new world, forest exploration, and conflict with its rules, followed by the witch’s awakening, rebuttal, control, and return. Storyboards translate these changes into shots and relationships between figures and spaces.')], figures: [
        { image: 'mushrooms-story-a', alt: c('毒蘑菇项目的叙事分镜与概念画面。', 'A storyboard and concept frame from Poisonous Mushrooms.'), caption: c('前期视觉材料：探索场景构成与角色在空间中的关系。', 'Early visual material exploring composition and the character’s place in the environment.') },
        { image: 'mushrooms-story-b', alt: c('已发布 MV 中的蘑菇森林画面。', 'The mushroom forest in the released music video.'), caption: c('已发布 MV 画面：从前期叙事与概念走向协作完成的影像。', 'Released MV frame: early narrative and concepts become a collaboratively produced film.') },
      ] },
      { id: 'game', title: c('03　小游戏与视觉资产', '03　Mini-game & visual assets'), paragraphs: [c('宣传小游戏沿用 MV 的蘑菇森林世界，包含开始画面与角色选择等视觉资产。玩法设计与界面视觉相互配合，让影像中的世界进入可参与的情境。', 'The promotional mini-game carries over the mushroom forest world, with assets including a start screen and character selection. Gameplay and interface visuals extend the film into a participatory setting.')], figures: [
        { image: 'mushrooms-cover', alt: c('毒蘑菇小游戏开始界面。', 'The start screen of the Poisonous Mushrooms mini-game.'), caption: c('开始界面：沿用世界观，同时提供直接的参与入口。', 'Start screen: keeping the world’s visual language with a direct entry point.') },
        { image: 'mushrooms-characters', alt: c('四个蘑菇角色的选择界面。', 'A selection interface with mushroom characters.'), caption: c('角色选择：将叙事角色转化为界面中的可选择对象。', 'Character selection transforms narrative figures into choices within the interface.'), portrait: true },
      ] },
      { id: 'process', title: c('04　制作与协作', '04　Production & collaboration'), paragraphs: [c('前期使用数字绘画与 AI 辅助探索构图，结合 Photoshop、Procreate 的修整与细化，将不同来源的视觉素材统一到项目语言中。后期参与调色与视觉一致性的调整。', 'Early digital painting and AI-assisted composition exploration were refined in Photoshop and Procreate to bring different visual sources into one language. I also contributed to grading and visual consistency.'), c('MV 是协作成果。本案例重点展示我的概念、分镜与小游戏工作，完整制作信息以公开视频的署名为准。', 'The music video is a collaborative outcome. This case focuses on my concept, storyboard, and mini-game work; full production credits are provided with the published video.')] },
      { id: 'reflection', title: c('05　成果与反思', '05　Outcomes & reflection'), paragraphs: [c('影像已公开发布，概念与视觉资产也形成了从 MV 到小游戏的延伸。现有材料不足以把播放量或传播效果归因于个人设计，因此这里以可展示的产出说明贡献。', 'The video has been publicly released, with concepts and assets extending into a mini-game. The available evidence does not attribute audience reach to individual design decisions, so the case demonstrates contributions through tangible outputs.'), c('这次实践让我关注：视觉统一需要在前期建立规则，也需要在跨媒介制作中持续维护；界面与影像虽然观看方式不同，仍可以共享角色、色彩与叙事线索。', 'This work highlights the need to establish visual rules early and maintain them across media. Interfaces and films have different viewing patterns, but can share characters, colour, and narrative cues.')] },
    ],
  },
  { slug: 'fandazi', title: c('饭搭子', 'FanDazi'), subtitle: c('UX／产品设计', 'UX / Product design'), description: c('项目进行中。完成后补充问题定义、用户流程与原型。', 'In progress. The problem framing, user flows, and prototype will be added when ready.'), categories: ['ux'], status: 'progress', kind: c('UX／产品设计', 'UX / Product design'), featured: true },
  {slug:'alilaguna',title:alilaguna.title,subtitle:alilaguna.subtitle,
    description:c('将伦敦地铁转化为当代冥界渡船，以实拍、数字特效与三维空间展开现实与冥河之间的旅程。','London’s subway becomes a contemporary ferry to the underworld, merging live-action, digital effects, and 3D spaces in a journey between reality and Styx.'),
    categories:['video'],status:'published',kind:c('概念音乐影像 · 协作项目','Conceptual music video · Collaborative project'),cover:'alilaguna-cover',background:'alilaguna-cover',
    coverAlt:c('地铁、扶梯、时钟与重叠圆形构成的 ALILAGUNA 完整概念拼贴。','An ALILAGUNA concept collage of subway structures, escalators, clocks, and overlapping circles.'),
    role:c('影像导演：拍摄、剪辑、调色、VFX 与排版','Image director: filming, editing, colour grading, VFX, and layout'),stage:c('已完成概念音乐影像','Completed conceptual music video'),
    deliverables:c('完整 MV、概念拼贴、音乐分析、十二格分镜与制作过程','Full music video, concept collages, music analysis, twelve-shot storyboard, and production studies'),
    overview:alilaguna.introduction,video:'https://youtu.be/iQDMCwT_wTY',
    sections:alilaguna.chapters.filter(x=>!['iteration','reflection'].includes(x.id)).map(x=>({id:x.id,title:x.label})),
  },
  {
    slug:'nexus',title:nexus.title,subtitle:nexus.subtitle,
    description:c('以工业流水线构建一个自我复制的机械文明，在六个生产空间中展开关于创造、服从与循环的叙事。','A self-replicating mechanical civilisation built around an assembly line, unfolding a narrative of creation, obedience, and circulation across six production spaces.'),
    categories:['3d'],status:'published',kind:c('叙事向概念游戏场景设计','Narrative-driven concept game environment design'),cover:'nexus-cover',background:'nexus-cover',
    coverAlt:c('青绿色金属机械文明场景，流水线连接六个生产装置。','A teal metallic mechanical civilisation with six production systems connected by an assembly line.'),
    role:c('概念场景、三维建模与渲染','Concept environments, 3D modelling, and rendering'),stage:c('概念设计与场景影像呈现','Concept design and environment visualisation'),
    deliverables:c('世界观、机械角色、模块化场景、白模、渲染与场景影片','Worldbuilding, mechanical characters, modular environments, clay studies, renders, and environment film'),
    overview:nexus.worldview[0],sections:nexusScenes.map(scene=>({id:scene.id,title:scene.title,paragraphs:[scene.text]})),
  },
  {slug:'bone-series',title:skeleton.title,subtitle:skeleton.subtitle,
    description:c('为 SPRING 品牌设计视觉识别与骨骸系列首饰，将骨骼结构转化为 choker、项链与戒指。','Visual identity and skeletal jewellery for SPRING, translating anatomical forms into chokers, necklaces, and rings.'),
    categories:['3d','visual'],status:'published',kind:c('品牌视觉／3D 首饰设计','Brand visual identity / 3D jewellery design'),cover:'bone-cover-white',background:'bone-cover-white',
    coverAlt:c('佩戴银色骨骸首饰的深色人体模型，额部展示戒指，颈部与胸前展示首饰。','A dark mannequin wearing silver skeletal jewellery, with a ring displayed on the forehead and jewellery at the neck and chest.'),
    role:c('品牌视觉、Logo 设计与骨骸系列 3D 打印首饰开发','Brand visual identity, logo design, and 3D-printed Skeleton Collection jewellery development'),
    stage:c('品牌视觉、首饰造型与三维可视化','Brand identity, jewellery forms, and 3D visualisation'),
    deliverables:c('SPRING 字标、品牌视觉、首饰造型与佩戴渲染','SPRING wordmark, brand visuals, jewellery forms, and on-body renders'),
    overview:skeleton.introduction[0],sections:skeletonPieces.map(piece=>({id:'piece-'+piece.number,title:piece.name,paragraphs:[piece.description]})),
  },
  {
    slug:'post-digital-species',title:species.title,subtitle:species.subtitle,
    description:c('将数字遗产、资源循环与生物培育连接为死亡、转化、重生的三阶段未来世界。','Digital inheritance, resource circulation, and biological cultivation connect death, conversion, and rebirth in a speculative future world.'),
    categories:['3d','visual'],status:'published',kind:c('未来概念世界观／三维场景设计','Future concept worldbuilding / 3D environment design'),cover:'species-cover',background:'species-cultivation-detail',
    coverAlt:c('冰蓝色透明生物培育装置，两侧围绕着数字挽歌与生物纹样。','An icy-blue transparent cultivation installation framed by digital memorial and biological ornaments.'),
    role:c('概念世界观、三维场景与视觉设计','Concept worldbuilding, 3D environments, and visual design'),
    stage:c('概念设计、三维模型与场景影像','Concept design, 3D models, and environment films'),
    deliverables:c('未来设定、研究图、三阶段概念模型、数字葬礼流程、物种档案与四段场景影片','Future setting, research boards, three-stage concept models, digital funeral flow, species archives, and four scene films'),
    overview:species.introduction[0],
    sections:[{id:'worldview',title:c('数字永生的世界','Digital immortality'),paragraphs:species.introduction},{id:'research',title:c('研究与构想','Research & concept'),paragraphs:[species.research,species.triangle,species.tree]},{id:'death',title:c('死亡','Death'),paragraphs:[species.death]},{id:'convert',title:c('转化','Convert'),paragraphs:[species.convert]},{id:'reborn',title:c('重生','Reborn'),paragraphs:[species.reborn]},{id:'archives',title:c('新物种与档案','Species & archives'),paragraphs:[species.archives]},{id:'extension',title:c('世界观延展','World extension'),paragraphs:species.extension}]
  },
  {
    slug:'sonic-elasticity',title:sonic.title,subtitle:sonic.subtitle,
    description:c('以弹性立方体、四声道声场与受控的同步和偏离，探索空间知觉如何被建立与重构。','An elastic cube and four-channel soundscape explore how spatial perception is constructed and reshaped through controlled synchronisation and deviation.'),
    categories:['installation'],status:'published',kind:c('Bartlett School 设计项目 · 协作装置','Bartlett School design project · Collaborative installation'),year:'2025–26',cover:'sonic-cover',background:'sonic-cover',featured:true,
    coverAlt:c('蓝紫色暗室中的双层弹性立方体，四个音箱围绕着中心参与者。','A nested elastic cube in a blue-violet dark room, with four speakers surrounding a participant at its centre.'),
    role:c('装置设计与制作（协作项目）','Installation design and fabrication within a collaborative project'),stage:c('研究、模型迭代、实体装置与视听编程','Research, model iterations, physical installation, and audiovisual programming'),
    deliverables:c('知觉实验、四轮迭代、结构模型、Max/MSP 与 Arduino 联动、装置影像','Perceptual experiments, four iterations, structural models, Max/MSP and Arduino integration, and installation film'),overview:sonic.introduction,
    sections:sonic.chapters.map(chapter=>({id:chapter.id,title:chapter.label})),
  },
  {
    slug:'infinite-cosmos',title:cosmos.title,subtitle:cosmos.subtitle,
    description:c('将参数化模型转化为可交互的点云，并通过生成式影像演化为不断变化的多元宇宙。','Parametric geometry becomes an interactive point cloud and evolves through generative moving images into a changing multiverse.'),
    categories:['3d','installation','video'],status:'published',kind:c('参数化空间／创意编程／生成影像','Parametric space / Creative coding / Generative film'),year:'2025',cover:'cosmos-cover',background:'cosmos-cover',featured:true,
    coverAlt:c('深色宇宙中彩色粒子与生长轨迹围绕概念模型扩散。','Coloured particles and growing trails spread around a conceptual model in a dark cosmos.'),
    role:c('参数化建模、交互编程与生成影像设计','Parametric modelling, interaction programming, and generative image design'),stage:c('概念模型、粒子交互与生成影像','Conceptual model, particle interaction, and generative film'),
    deliverables:c('参数化分析、Rhino 模型、Processing 粒子交互、ComfyUI 工作流与动态影像','Parametric studies, Rhino model, Processing particle interaction, ComfyUI workflows, and moving images'),overview:cosmos.introduction,
    sections:cosmos.chapters.map(chapter=>({id:chapter.id,title:chapter.label})),
  },
  {
    slug:'earthquake',title:earthquake.title,subtitle:earthquake.subtitle,
    description:c('以 Python 连接图像、文本与地震记录，将多源数据转化为空间生成规则和动态行为。','Python connects images, text, and seismic records, translating multimodal data into spatial generation rules and dynamic behaviour.'),
    categories:['3d','installation'],status:'published',kind:c('Bartlett School 设计项目 · 数据驱动设计','Bartlett School design project · Data-driven design'),year:'2025–26',cover:'earthquake-cover',background:'earthquake-cover',featured:true,
    coverAlt:c('深色空间中数据生成的建筑碎片、地表裂隙与发光震中波纹。','Data-generated architectural fragments, ground fractures, and luminous epicentral waves in a dark space.'),
    role:c('Python 数据处理、参数映射与空间可视化','Python data processing, design mappings, and spatial visualisation'),stage:c('多源分析、程序建模与实时可视化','Multimodal analysis, procedural modelling, and real-time visualisation'),
    deliverables:c('Jupyter 分析、特征与聚类图、数据映射 CSV、Blender 生成模型与 Processing 动态反馈','Jupyter analyses, feature and cluster plots, mapping CSV, Blender-generated models, and Processing feedback'),overview:earthquake.introduction,
    sections:earthquake.chapters.map(chapter=>({id:chapter.id,title:chapter.label})),
  },
  {
    slug:'metamorphosis',title:metamorphosis.title,subtitle:metamorphosis.subtitle,
    description:c('通过 TouchDesigner 将蝴蝶几何、粒子反馈与实时声音分析连接，生成持续蜕变的视听形态。','TouchDesigner connects butterfly geometry, particle feedback, and live audio analysis to create an evolving audiovisual form.'),
    categories:['installation','3d','video'],status:'published',kind:c('创意编程／实时视听交互','Creative coding / Real-time audiovisual interaction'),year:'2025–26',cover:'metamorphosis-cover',background:'metamorphosis-cover',featured:true,
    coverAlt:c('液态背景中的青蓝色蝴蝶骨骸模型，白色粒子围绕形态扩散。','A cyan skeletal butterfly against a liquid background, surrounded by dispersing white particles.'),
    role:c('模型处理、节点编程、声音映射与视觉合成','Geometry processing, node programming, audio mappings, and visual compositing'),stage:c('几何建模、粒子生成、声音响应与实时输出','Geometry, particle generation, audio response, and live output'),
    deliverables:c('完整节点分析、五阶段演进、实时视听影像与声音交互','Operator analysis, five-stage development, live audiovisual film, and audio interaction'),overview:metamorphosis.introduction,
    sections:metamorphosis.chapters.map(chapter=>({id:chapter.id,title:chapter.label})),
  },
];
export const published = projects.filter(p => p.status === 'published');
