export type Lang = 'zh' | 'en';
export type Copy = { zh: string; en: string };
export const c = (zh: string, en: string): Copy => ({ zh, en });
export const email = 'xiongzhiyuan1027@163.com';
export const name = c('熊志愿', 'Xiong Zhiyuan');
export const categories = [
  { id: 'ux', label: c('UX／产品设计', 'UX / Product') },
  { id: '3d', label: c('三维设计', '3D Design') },
  { id: 'installation', label: c('艺术装置／交互体验', 'Installation / Interaction') },
  { id: 'video', label: c('创意视频', 'Creative Video') },
  { id: 'visual', label: c('平面／品牌视觉', 'Graphic / Brand') },
] as const;
export type Category = typeof categories[number]['id'];
// Compact, bilingual labels for the always-visible work index filters.
export const galleryCategoryLabels: Record<Category | 'all', Copy> = {
  all: c('全部作品', 'All Work'),
  ux: c('产品设计', 'UX Design'),
  '3d': c('三维设计', '3D Design'),
  installation: c('交互装置', 'Art Installation'),
  video: c('创意视频', 'Creative Video'),
  visual: c('品牌视觉', 'Brand Visuals'),
};
export const ui = {
  home: c('首页', 'Home'), works: c('作品', 'Work'), about: c('关于', 'About'), contact: c('联系', 'Contact'),
  all: c('全部', 'All'), skip: c('跳到正文', 'Skip to content'), menu: c('菜单', 'Menu'),
  selected: c('精选项目', 'Selected work'), library: c('查看完整作品库', 'Explore all work'),
  view: c('阅读案例', 'Read case study'), progress: c('进行中', 'In progress'), pending: c('资料整理中', 'Coming soon'),
  back: c('返回作品库', 'Back to all work'), related: c('继续探索', 'Explore more'),
  overview: c('项目概览', 'Overview'), contents: c('章节目录', 'On this page'),
  role: c('我的职责', 'My contribution'), stage: c('完成阶段', 'Project stage'), deliverables: c('产出', 'Deliverables'),
  zoom: c('放大查看图片', 'Enlarge image'), close: c('关闭图片', 'Close image'),
  resume: c('下载中文简历', 'Download English CV'), old: c('旧版作品集', 'Previous portfolio'),
};
export const intro = c('从用户与情境出发，把复杂问题转化为清晰的体验与有表达力的视觉。', 'I turn questions about people and their contexts into clear experiences and expressive visuals.');
export const capabilities = [
  { title: c('用户体验', 'User experience'), text: c('理解情境，梳理流程，让体验清晰易用。', 'Understand context, map journeys, and make experiences easy to navigate.') },
  { title: c('产品思维', 'Product thinking'), text: c('定义问题，连接目标，用原型检验设计选择。', 'Frame problems, connect goals, and explore decisions through prototypes.') },
  { title: c('视觉设计', 'Visual design'), text: c('建立视觉语言，将叙事延伸到平面、空间与影像。', 'Build a visual language across graphics, spaces, and moving images.') },
];
