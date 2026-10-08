import { c } from './site';

// Source: 熊志愿_简历_体验设计.pdf, supplied 2026-10-03.
export const aboutProfile = {
  name: c('熊志愿', 'Xiong Zhiyuan'),
  personal: c('2004.10 · 湖南益阳', 'Born October 2004 · Yiyang, Hunan'),
  intro: [
    c('我是熊志愿，本科就读于华中科技大学设计学院环境设计专业，目前在伦敦大学学院 UCL Bartlett 建筑学院攻读性能与交互设计硕士。我的实践连接体验设计、数字交互、三维空间与视觉表达。', 'I’m Xiong Zhiyuan. I studied Environmental Design at Huazhong University of Science and Technology and am currently pursuing Design for Performance and Interaction at UCL’s Bartlett School of Architecture. My practice connects experience design, digital interaction, 3D spaces, and visual expression.'),
    c('研究方向包括用户行为与体验、游戏化交互、多用户协作、实时交互系统，以及 AI 与数字原型设计。通过实地研究、交互逻辑、编程与物理交互，将概念转化为可参与、可体验的设计。', 'My research focuses on user behaviour and experience, gamified interaction, multi-user collaboration, real-time interactive systems, and AI and digital prototyping. I develop concepts into participatory experiences through field research, interaction logic, programming, and physical computing.'),
  ],
  focus: [
    { title: c('用户与体验', 'People & experience'), text: c('用户行为与体验、游戏化交互、多用户协作。', 'User behaviour and experience, gamified interaction, and multi-user collaboration.') },
    { title: c('实时与数字交互', 'Real-time & digital interaction'), text: c('实时交互系统、编程与物理交互、AI 与数字原型。', 'Real-time interactive systems, programming, physical computing, and AI and digital prototypes.') },
    { title: c('空间与视觉表达', 'Space & visual expression'), text: c('参数化与 3D 设计、空间与影像制作、品牌视觉。', 'Parametric and 3D design, spatial and film production, and brand identity.') },
  ],
  education: [
    { title: c('伦敦大学学院 UCL · Bartlett 建筑学院', 'University College London · Bartlett School of Architecture'), meta: c('性能与交互设计 · 硕士 · 2025.09–2027.04', 'Design for Performance and Interaction · Master’s · Sep 2025–Apr 2027'), paragraphs: [
      c('研究方向：用户行为与体验、游戏化交互、多用户协作、实时交互系统、AI 与数字原型设计。', 'Research: user behaviour and experience, gamified interaction, multi-user collaboration, real-time interactive systems, and AI and digital prototyping.'),
      c('主修课程：Skills Portfolio 75/100（Distinction-level）；Initial Project 70/100（Distinction-level）。', 'Course results: Skills Portfolio 75/100 (Distinction-level); Initial Project 70/100 (Distinction-level).'),
      c('技能方向：游戏与实时交互、编程与物理交互、参数化与 3D 设计、生成式 AI 与原型、空间与影像制作。', 'Areas of practice: games and real-time interaction, programming and physical computing, parametric and 3D design, generative AI and prototyping, and spatial and film production.'),
    ] },
    { title: c('华中科技大学 [985] · 设计学院', 'Huazhong University of Science and Technology · School of Design'), meta: c('环境设计 · 本科 · 2021.09–2025.06', 'Environmental Design · Bachelor’s · Sep 2021–Jun 2025'), paragraphs: [
      c('GPA 4.54/5.0 · 专业排名 3/66 · 英语四级 · 雅思 6.5。', 'GPA 4.54/5.0 · Ranked 3/66 · CET-4 · IELTS 6.5.'),
      c('主修课程：造型基础（94）、文化与展示空间设计（95）、商业空间策划（95）、智慧城市导视（94）、艺术设计传播学（96）。', 'Selected courses: Fundamentals of Form (94), Cultural and Exhibition Space Design (95), Commercial Space Planning (95), Smart City Wayfinding (94), and Art and Design Communication (96).'),
      c('技能方向：场景与空间设计、展示与信息传播、商业策划与体验设计、城市与建筑设计、材料施工与设计管理。', 'Areas of practice: scene and spatial design, exhibitions and information communication, commercial planning and experience design, urban and architectural design, and materials, construction, and design management.'),
    ] },
  ],
  projects: [
    { title: c('邓泽希《毒蘑菇》Official MV', 'Deng Zexi — Poisonous Mushrooms, Official MV'), meta: c('分镜导演／概念策划 · 2026.01–2026.04', 'Storyboard director / Concept planning · Jan–Apr 2026'), paragraphs: [
      c('围绕歌曲情绪与叙事表达，梳理核心视觉概念与镜头节奏，将抽象主题转化为分镜结构、场景语言与统一视觉风格，参与完成 MV 从概念到拍摄落地。', 'Developed the core visual concept and shot rhythm around the song’s emotions and narrative, translating abstract themes into storyboards, scene language, and a consistent visual style. Contributed to the MV from initial concept through filming.'),
      c('调研抖音潮流宣传小游戏，发现竞速、成就反馈与短时挑战是常见的参与机制，据此将歌曲视觉元素转译为“竞速＋躲避障碍”的轻量玩法，负责游戏视觉与传播内容设计；MV 上线后累计 150 万+播放量。', 'Researched promotional mini-games on Douyin, identifying racing, achievement feedback, and short challenges as common engagement mechanisms. Translated the song’s visual elements into a lightweight racing and obstacle-avoidance game, designing its visuals and promotional content. The released MV accumulated over 1.5 million views.'),
    ] },
    { title: c('中国传统制茶技艺数字交互展示策略研究', 'Digital Interactive Presentation Strategies for Traditional Chinese Tea-Making'), meta: c('项目主负责人 · 2026.01–2026.04', 'Project lead · Jan–Apr 2026'), paragraphs: [
      c('针对传统制茶技艺传播触点单一、静态展示难以兼顾认知与参与的问题，结合实地调研，将用户体验拆分为“吸引—了解—体验—延续”多个阶段，构建游戏化传播、宣传 APP、AR/VR 数字体验与线下文创协同的多触点传播体系。', 'Addressed limited communication touchpoints and the difficulty of combining learning and participation in static displays of traditional tea-making. Used field research to structure the journey into attraction, understanding, experience, and continuation, connecting gamified communication, a promotional app, AR/VR experiences, and physical cultural products.'),
      c('统筹各模块的内容定位与体验衔接，主导 APP UI、交互逻辑及游戏化体验设计，使用户从轻量传播进入工艺认知，再延展至沉浸体验与线下文化接触；项目获湖北省级大学生创新创业训练计划立项并完成结项。', 'Coordinated content positioning and continuity across the modules, leading the app UI, interaction logic, and gamified experience design. The journey connects initial engagement with craft knowledge, immersive experiences, and physical cultural encounters. The project was approved under Hubei’s provincial university student innovation and entrepreneurship training programme and completed.'),
    ] },
    { title: c('SPRING｜骨骸系列 3D 首饰设计', 'SPRING — Bone Series, 3D Jewellery Design'), meta: c('品牌与产品设计负责人 · 2025.04–2025.09', 'Brand and product design lead · Apr–Sep 2025'), paragraphs: [
      c('围绕小红书 Remake 工作室（ID: nextone111）的亚文化定位与系列化产品需求，提炼骨骸、金属与身体结构等核心视觉语言，完成 Logo、视觉识别及首饰概念设计，强化品牌识别与系列产品的一致性。', 'Developed a visual language drawn from bones, metal, and bodily structures for the subcultural positioning and product-series needs of the Xiaohongshu Remake studio nextone111. Designed the logo, identity, and jewellery concepts to strengthen brand recognition and consistency across the collection.'),
      c('将视觉概念转化为可生产产品，完成 3D 建模、佩戴结构优化与生产适配，推动系列从概念设计至实体落地；合作工作室年销售额超百万元。', 'Translated visual concepts into manufacturable products through 3D modelling, refinement of wearable structures, and production adaptation, taking the collection from concept to physical pieces. The partner studio’s annual sales exceeded RMB 1 million.'),
    ] },
    { title: c('《一路驶向密林川》毕业电影及品牌广告短片', 'Driving All the Way to Milinchuan — Graduation Film and Brand Commercials'), meta: c('影视制作与现场统筹 · 2023.04–2023.06', 'Film production and on-set coordination · Apr–Jun 2023'), paragraphs: [
      c('参与毕业电影及荣耀手机、顺丰等品牌广告短片制作，针对多场景拍摄中信息同步、岗位衔接与现场节奏控制需求，承担场记、摄影支持、道具灯光及制片协调，保障拍摄流程稳定推进。', 'Worked on a graduation film and commercials for brands including Honor and SF Express. Handled script supervision, camera support, props and lighting, and production coordination to maintain information flow, coordination between departments, and the pace of multi-location shoots.'),
      c('根据场地、时间与拍摄条件及时调整执行方案，协同导演、摄影、灯光及美术等岗位处理现场问题，完成从前期准备、拍摄执行到素材交付的多环节协作。', 'Adapted plans to location, scheduling, and filming conditions, working with directing, camera, lighting, and art departments to resolve on-set issues. Contributed across preparation, shoot execution, and footage delivery.'),
    ] },
  ],
  internship: { title: c('深圳图钉文化传媒有限公司', 'Shenzhen Tuding Culture Media Co., Ltd.'), meta: c('数字媒体设计实习生 · 2024.07–2024.09', 'Digital media design intern · Jul–Sep 2024'), paragraphs: [
    c('围绕数字艺术内容的多平台传播需求，参与创意策划并负责平面、视频及动画设计，将核心视觉延展至 Web、移动端与社交媒体，支持项目统一视觉输出与落地。', 'Contributed to creative planning and designed graphics, videos, and animation for the cross-platform communication of digital art. Extended the core visual language across web, mobile, and social media to support consistent project delivery.'),
  ] },
  awards: [
    c('华中科技大学优秀毕业生', 'Outstanding Graduate, Huazhong University of Science and Technology'),
    c('米兰设计周中国高校设计学科师生优秀作品展｜湖北省二等奖／国家三等奖', 'Milan Design Week Exhibition of Outstanding Works by Chinese University Design Faculty and Students — Hubei Second Prize / National Third Prize'),
    c('国家励志奖学金｜2022、2023、2024', 'National Encouragement Scholarship — 2022, 2023, 2024'),
    c('中国好创意暨全国数字艺术设计大赛｜中国风创艺类优秀奖', 'China Creative Design & National Digital Art Design Competition — Excellence Award, Chinese Style Creative Art'),
    c('校级社会实践优秀个人', 'University Outstanding Individual in Social Practice'),
    c('华中科技大学人民奖学金—自强奖学金｜2022、2024', 'HUST People’s Scholarship — Self-Reliance Scholarship, 2022 and 2024'),
  ],
  skills: [
    { title: c('交互与数字设计', 'Interaction & digital design'), tools: 'Figma · TouchDesigner · Processing · Python · Arduino · Grasshopper · Codex' },
    { title: c('3D 与视觉设计', '3D & visual design'), tools: 'C4D · Blender · Rhino · Grasshopper · ComfyUI · Photoshop · Illustrator · After Effects · Premiere Pro · DaVinci Resolve' },
  ],
};
