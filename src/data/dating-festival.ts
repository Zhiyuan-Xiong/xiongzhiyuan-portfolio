import { c } from './site';
export const festival = {
  title: c('相亲营销嘉年华', 'Blind Dating Market Festival'),
  lens: c('社会问题研究与叙事空间转译', 'Social Issue Research & Narrative Spatial Translation'),
  overview: c('《相亲嘉年华》围绕相亲过程中“信息如何被展示、筛选与判断”展开。通过对现实相亲行为与沟通方式的观察，将身份包装、条件匹配、信任验证与外部评价转化为可操作的游戏机制。项目以六个连续场景构建完整体验流程，通过用户选择、系统反馈与多结果路径，使隐性的婚恋营销、信息差与关系判断过程转化为可感知、可验证、可反思的交互体验。', 'Blind Dating Market Festival examines how information is presented, filtered and judged during matchmaking. Observations of real-world introductions and conversations are translated into game mechanisms for persona packaging, matching, trust and outside evaluation. Six connected spaces trace a participant’s journey, making the hidden processes of self-promotion and relationship judgement tangible through choices, feedback and multiple possible outcomes.'),
  question: c('有限信息与快速判断，能否真正了解一个人？', 'Can limited information and quick judgements reveal who someone really is?'),
  background: [
    { title: c('相亲的多元入口', 'Multiple entry points'), text: c('相亲角、媒人介绍、婚恋 APP、社交平台及相亲节目构成线上与线下的相亲入口。不同渠道反复面对同一个问题：在有限时间内展示自己，并快速判断对方。', 'Matchmaking markets, introductions, dating apps, social platforms and television shows form online and offline entry points. Across these settings, participants face the same task: present themselves and assess someone else within a limited time.') },
    { title: c('个人特征被条件化', 'People become comparable profiles'), text: c('为了提高筛选效率，复杂的个人特征被转化为可比较的择偶条件：外貌魅力、经济实力、事业潜力、家庭条件、情感经历与性格契合。条件展示、比较、筛选与匹配逐渐成为关系判断的路径。', 'To make screening more efficient, complex personal characteristics become comparable criteria: appearance, finances, career potential, family background, relationship history and personality. Display, comparison, filtering and matching shape the way people evaluate a relationship.') },
    { title: c('从表达走向包装', 'From introduction to packaging'), text: c('项目选取相亲角、婚恋 APP、媒人介绍三类场景，整理个人介绍与交流话术。人们通过突出优势、弱化风险与优化表达，塑造更符合择偶期待的形象。项目由此关注信息表达与真实身份之间的距离。', 'The project examines introductions and conversational language in matchmaking markets, dating apps and introductions through intermediaries. Highlighting strengths, downplaying risk and polishing language create a persona that meets expectations, raising questions about the distance between a presentation and a person.') },
  ],
  packaging: [
    [c('经济包装', 'Financial packaging'), c('有房有车，婚后无忧', 'A home and a car; no worries after marriage')],
    [c('家庭背书', 'Family endorsement'), c('家庭优渥，没有压力', 'A comfortable family background; no pressure')],
    [c('风险弱化', 'Downplaying risk'), c('父母开明，从不干涉', 'Open-minded parents who never interfere')],
    [c('性格包装', 'Personality packaging'), c('性格温和，很好相处', 'Easy-going and pleasant to be around')],
    [c('身份强化', 'Status reinforcement'), c('学历不错，能力很强', 'Well-educated and highly capable')],
    [c('未来承诺', 'Future promises'), c('以后我都会支持你', 'I will always support you')],
  ],
  mechanisms: [
    { title:c('属性系统','Attribute system'), text:c('将择偶信息转化为属性与标签。','Translate matchmaking criteria into attributes and tags.') },
    { title:c('包装机制','Persona packaging'), text:c('把自我展示转化为策略选择。','Make self-presentation a strategic choice.') },
    { title:c('匹配机制','Matching mechanism'), text:c('进行多维筛选与算法配对。','Filter across multiple dimensions and pair profiles.') },
    { title:c('信任验证','Trust verification'), text:c('通过互动验证信息真实性。','Verify the credibility of information through interaction.') },
    { title:c('压力机制','Outside pressure'), text:c('让家庭与社会评价持续介入。','Allow family and social judgement to intervene.') },
    { title:c('多结局反馈','Multiple outcomes'), text:c('让不同选择导向多种关系结果。','Let different choices lead to different relationship outcomes.') },
  ],
  rules: [
    c('请适度包装自己，过度夸大信息可能影响后续匹配结果。','Package yourself in moderation. Exaggeration may affect later matches.'),
    c('请习惯被观察，父母亲友的意见将影响您的约会进程。','Expect to be observed. Family and friends can affect your dating journey.'),
    c('请谨慎相信他人赞美，部分表达可能经过精心设计与包装。','Treat compliments carefully. Some language may be deliberately designed and packaged.'),
    c('请珍惜当前机会，您的约会对象或许正在考虑其他选择。','Value the current opportunity. Your date may be considering other options.'),
  ],
  film: c('概念影片串联六个核心体验场景，通过人物行为、系统反馈与空间切换，呈现玩家从进入相亲市场、建立人物档案、筛选对象，到验证信息、接受外部评价并形成关系结果的体验路径。影片将交互机制、用户选择与叙事世界观整合为连续的游戏体验。','The concept film connects all six spaces through character actions, system feedback and spatial transitions. It follows entry into the matchmaking market, profile creation, partner selection, information verification, outside evaluation and relationship outcomes, integrating the mechanisms and fictional world into one continuous experience.'),
  filmUrl: 'https://www.youtube.com/watch?v=ofMeZN49vNA',
};
export const scenes = [
  { id:'invitation-hall', number:1, title:c('邀请大厅','Invitation Hall'), english:'Invitation Hall', action:c('候选人进入相亲市场','Enter the matchmaking market'), summary:c('相亲营销游戏从候选人走上各自的展示台开始。参与者被作为“展品”呈现，身份、条件与匹配状态进入公众视野；对他人的判断也从观看这些信息开始。','The marketing game begins as candidates step onto their presentation stages. Identity, conditions and matching status become public exhibits, while participants begin assessing others through what is shown.'), poster:'hall', parts:[
    {image:'stage',title:c('展示台','Presentation stage'),text:c('实时公开所有候选人的身份信息与匹配状态。','Publicly displays candidates’ identities and matching status.')},
    {image:'eyes',title:c('监察眼','Monitoring eye'),text:c('用于搜寻相亲对象的眼形监视装置。','An eye-shaped surveillance device searches for potential dates.')},
    {image:'love-card',title:c('爱情卡牌','Love cards'),text:c('每张卡片背后，都藏着一位潜在候选人。','A potential candidate lies behind every card.')},
    {image:'television',title:c('爱情电视','Love television'),text:c('循环播放最受关注的匹配案例与成功配对记录。','Loops popular matching cases and successful pairings.')},
  ]},
  { id:'love-factory',number:2,title:c('爱情工厂','Love Factory'),english:'Love Factory',action:c('加工人物信息成档案','Turn information into a profile'),summary:c('爱情工厂负责生产“理想伴侣”。参与者在邀请大厅完成身份展示后，被送入工厂流水线。外貌、职业、收入、家庭背景与情感需求被转化为标准化数据标签，组装成完整的婚恋档案。信息汇入中央数据库，由匹配系统筛选、计算与配对。','The Love Factory produces the “ideal partner”. After the initial presentation, participants enter an assembly line that turns appearance, occupation, income, family background and emotional needs into standardised tags. These become a dating profile recorded in a central database for screening and matching.'),poster:'factory',parts:[
    {image:'furnace',title:c('爱情熔炉','Furnace of love'),text:c('参与者进入爱情熔炉，开始价值重塑与身份加工。','Participants enter the furnace for value reshaping and identity processing.')},
    {image:'gears',title:c('机械齿轮','Mechanical gears'),text:c('系统持续拆解并重组信息，生成标准化婚恋档案。','The system disassembles and reassembles information into standardised profiles.')},
    {image:'resume',title:c('婚恋档案','Dating résumé'),text:c('加工后的自我描述被记录并用于匹配；完整展示并不等于信息真实。','The processed self-description is stored for matching. A complete presentation does not guarantee authenticity.')},
  ]},
  {id:'lucky-carnival',number:3,title:c('幸运狂欢','Lucky Carnival'),english:'Lucky Carnival',action:c('筛选匹配出相亲对象','Select and match a partner'),summary:c('巨大的机械装置昼夜不停地运转，将参与者的信息送入中央系统。随着装置缓缓转动，新的配对结果不断诞生。每当匹配成功，中央爱心标志亮起，双方档案出现在两侧屏幕，在所有人的见证下完成这场充满仪式感的相遇。匹配依赖资料，同时保留偶然与运气。','A giant machine continuously feeds participants’ information into the central system. Its rotation generates new pairings. When a match succeeds, the central heart lights up and profiles appear on either side. Music announces the encounter, turning matching into a public ceremony shaped by both information and chance.'),poster:'carnival',parts:[
    {image:'gramophone',title:c('庆典号角','Celebration horn'),text:c('配对成功后响起庆典音乐，宣布相亲开始。','Celebratory music announces a successful pairing and the start of the date.')},
    {image:'slot-machine',title:c('幸运转奖机','Matching machine'),text:c('机械运转与两侧档案展示共同构成匹配仪式。','The moving machine and profile displays form the matching ceremony.')},
  ]},
  {id:'additive-roulette',number:4,title:c('情感轮盘','Additive Roulette'),english:'Additive Roulette',action:c('营销包装与相互试探','Package, promote and test'),summary:c('双方在交流中加入自我营销，以包装与夸张放大个人优势，争取对方的心动。情感轮盘把看不见的话术策略转化为试剂、时间与实时反馈：吸引力的提升，也伴随信息真实性的变化。','In conversation, participants use self-promotion and exaggeration to amplify their strengths and attract the other person. The roulette makes these invisible strategies tangible through reagents, time and feedback: a gain in appeal can come with a change in credibility.'),poster:'roulette',parts:[
    {image:'roulette-clock',title:c('时间轮盘','Time roulette'),text:c('象征不断流逝的择偶时间与情感机会。','Represents passing time and relationship opportunities.')},
    {image:'reagents',title:c('谎言试剂','Lie reagents'),text:c('放大个人优势，同时降低信息真实性；反馈包装与营销程度。','Amplifies strengths while reducing credibility, making the degree of self-promotion visible.')},
  ]},
  {id:'theater-of-gaze',number:5,title:c('旁观剧场','Theater of Gaze'),english:'Theater of Gaze',action:c('外界评价与他人建议','Encounter outside judgement'),summary:c('关系的判断不只来自两位参与者。父母、亲友和旁观者的目光持续进入约会过程，以各自的标准评估、建议和干预。这些声音构成压力机制，也让参与者不断重新作出选择。','Relationship judgement extends beyond the two participants. Parents, friends and onlookers enter the dating process with their own standards, advice and interventions. These voices form a pressure mechanism that repeatedly prompts participants to reconsider their choices.'),poster:'gaze',parts:[
    {image:'gaze-eye',title:c('观察之眼','The gaze of others'),text:c('外界的目光持续注视着参与者，影响他们的选择判断。','Outside eyes continually watch participants and influence their judgement.')},
    {image:'parents',title:c('家族审判','Parental scrutiny'),text:c('父母依据自身标准评估对方，并持续干预关系的发展。','Parents assess the potential partner against their own standards and intervene in the relationship.')},
    {image:'voices',title:c('舆论回响','Voices of others'),text:c('亲友提供建议与评价，引导参与者重新作出选择。','Friends and relatives offer opinions that redirect participants’ choices.')},
  ]},
  {id:'dating-paradise',number:6,title:c('约会乐园','Dating Paradise'),english:'Dating Paradise',action:c('形成关系与结果','Reach a relationship outcome'),summary:c('心动约会、恋爱博弈与爱情旋转组成最后的约会空间。两位参与者在反复交谈与试探中逐渐接近，家庭与亲友却仍关注着约会进程。当人们沉浸于浪漫幻想与自我包装，也可能逐渐失去辨别真实与表演关系的能力。','Face-to-face dates, relationship games and rotating tea cups form the final space. Participants get closer through repeated conversations and testing, while family and friends continue watching. Immersion in romantic fantasy and persona packaging can gradually obscure the distinction between a real relationship and a performance.'),poster:'paradise',parts:[
    {image:'face-date',title:c('心动约会','Face-to-face dating'),text:c('在面对面交流中继续确认彼此的期待与信息。','Continue exploring expectations and information through face-to-face conversation.')},
    {image:'love-game',title:c('恋爱博弈','The love game'),text:c('在互动与策略中测试对方的想法。','Test the other person’s intentions through interaction and strategy.')},
    {image:'tea-party',title:c('爱情旋转','The rotating tea party'),text:c('浪漫幻想与持续的相互试探形成关系结果。','Romantic fantasy and continued testing shape the relationship outcome.')},
  ]},
];
