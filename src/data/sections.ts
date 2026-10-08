import { categories, c, type Category } from './site';
const covers: Record<Category, string> = {
  ux: 'stigma-stream', '3d': 'dating-scene-a', installation: 'stigma-cover',
  video: 'mushrooms-story-b', visual: 'mushrooms-characters',
};
const descriptions = {
  ux: c('从问题、情境与用户流程出发，探索清晰的体验。', 'Explore clear experiences through problems, contexts, and user journeys.'),
  '3d': c('用形态、材质与空间，把想法变成可见的世界。', 'Make ideas visible through form, materials, and space.'),
  installation: c('让身体、空间与叙事相遇，建立可以参与的体验。', 'Connect bodies, spaces, and narratives through participatory experiences.'),
  video: c('从概念与分镜出发，在影像中组织视觉与叙事。', 'Shape visual narratives through concepts, storyboards, and moving images.'),
  visual: c('从平面到品牌，建立清晰而有表达力的视觉语言。', 'Build expressive visual languages across graphics and identity.'),
};
export const sections = categories.map(category => ({ ...category, cover: covers[category.id], description: descriptions[category.id] }));