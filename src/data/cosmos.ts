import type {Copy} from './site';
const copy=(zh:string,en:string):Copy=>({zh,en});
export const cosmos={
 title:copy('无垠的宇宙','Infinite Cosmos'),
 subtitle:copy('Rhino × Grasshopper × Processing × ComfyUI 协同设计','A design workflow connecting Rhino, Grasshopper, Processing, and ComfyUI'),
 introduction:copy('以多元宇宙与未来世界观为起点，将参数化几何、粒子交互和生成式影像连接为一条连续的创作路径。通过生物形态与机械结构的组合，构建一个由不同时间线相互支撑、不断生长和变化的混合生态空间。','Beginning with multiverses and future worldviews, this project links parametric geometry, particle interaction, and generative moving images. Organic forms and mechanical structures combine into a hybrid ecology, where possible timelines support one another and continually grow and transform.'),
 chapters:[
 {id:'concept',label:copy('多元宇宙与创作路径','Multiverse and design process')},
 {id:'parametric',label:copy('参数化形态生成','Parametric form generation')},
 {id:'hybrid-space',label:copy('混合生态空间','Hybrid ecological space')},
 {id:'particle-interaction',label:copy('粒子、藤蔓与烟花','Particles, vines, and bursts')},
 {id:'generative-workflow',label:copy('生成式影像工作流','Generative image workflow')},
 {id:'multiverse',label:copy('未来世界的视觉演化','Evolving future worlds')}
 ]
};
