import {c} from './site';
export const skeleton={
 title:c('骨骸共生系统','Skeletal Symbiotic System'),
 english:'Skeletal Symbiotic System',
 subtitle:c('SPRING 品牌｜骨骸系列首饰与视觉设计','SPRING | Skeleton Collection 3D Jewellery & Visual Design'),
 introduction:[
  c('SPRING 是以 Remake 服装与实验性首饰设计为核心的亚文化服饰品牌。项目期间，我参与品牌视觉设计、Logo 设计以及「骨骸系列（Skeleton Collection）」3D 打印首饰开发，构建从品牌视觉到产品设计的完整创作体系。','SPRING is a subculture fashion brand centred on remake clothing and experimental jewellery. I contributed to its visual identity, logo design, and the development of 3D-printed jewellery for the Skeleton Collection, connecting brand expression with product design.'),
  c('骨骸系列以人体骨骼结构、生物异变与未来有机体为设计灵感，将脊椎、肋骨、神经组织与异化人体等元素转化为可穿戴的数字雕塑。通过 3D 建模与打印工艺，将传统首饰从装饰性物件拓展为具有叙事性的身体载体。','Inspired by human skeletal structures, biological mutation, and imagined future organisms, the collection transforms vertebrae, ribs, neural tissue, and altered human forms into wearable digital sculptures. 3D modelling and printing connect jewellery with a narrative expression of the body.'),
  c('系列以 choker 和项链为主，并包含戒指等穿戴形式；结合品牌的哥特式视觉语言，形成具有亚文化特征的产品体系。','The collection focuses on chokers and necklaces, alongside rings and other wearable forms. Gothic visual references connect the pieces with the brand’s subculture identity.')
 ],
 brand:c('围绕 SPRING 的亚文化品牌定位，完成 Logo 设计、视觉符号延展及品牌视觉物料设计，通过统一的视觉语言强化品牌辨识度与市场传播力。','The SPRING identity brings together logo design, extended visual symbols, and brand materials. A consistent visual language connects the mark with the collection’s forms.'),
 collection:c('以骨骼结构、脊椎形态与异化生命体为设计灵感，结合哥特美学与未来主义视觉语言，设计多款 3D 打印首饰，探索人体结构与数字雕塑的融合表达。','Skeletal structures, spinal forms, and altered organisms inform a series of 3D-printed jewellery designs. Gothic and futuristic references connect human anatomy with digital sculpture.'),
 display:c('以身体为展示媒介，呈现首饰与颈部、胸前和面部的关系。额部展示的是戒指，系列以 choker、项链为主要穿戴形式。','The body provides a setting for the jewellery across the neck, chest, and face. The piece displayed on the forehead is a ring; chokers and necklaces form the main wearable formats.'),
};
export const skeletonGroups=[
 {id:'rib-forms',title:c('肋骨与胸腔','Ribs & Cavities'),intro:c('重复肋骨、围合骨架与尖刺，构成围绕胸腔和颈部的六件造型。','Six designs explore the chest and neck through repeated ribs, enclosing skeletal forms, and spurs.')},
 {id:'spinal-forms',title:c('脊柱与异生','Spines & Mutations'),intro:c('纵向骨节、分支骨翼与人像，沿中轴展开六件异生结构。','Six axial designs combine vertebrae, branching skeletal wings, and figurative elements.')},
 {id:'symbiotic-forms',title:c('对称与共生','Symmetry & Symbiosis'),intro:c('翼状轮廓、人像与环形骨节，以镜像和连接关系组成六件首饰。','Six jewellery designs connect wing-like outlines, figures, loops, and joints through mirrored structures.')},
];
export const skeletonPieces=[
 {number:1,name:c('肋翼','Rib Wings'),group:'rib-forms',description:c('肋骨向两侧展开，以骨节连接中央结构。','Ribs open to either side, joined by a central sequence of bones.')},
 {number:2,name:c('静像','Silent Effigy'),group:'symbiotic-forms',description:c('人像位于中央，骨骼曲线与链条环绕其外缘。','A central human effigy is surrounded by skeletal curves and chains.')},
 {number:3,name:c('夜蝶','Nocturnal Moth'),group:'symbiotic-forms',description:c('细长骨线组成翼状轮廓，在中央交汇。','Slender skeletal lines form wings that converge at the centre.')},
 {number:4,name:c('脊冕','Vertebral Crown'),group:'spinal-forms',description:c('上部骨刺向两侧张开，下部沿脊柱向下延伸。','Upper spurs spread sideways while a spinal sequence extends below.')},
 {number:5,name:c('双生','Twinned'),group:'symbiotic-forms',description:c('四向骨刺形成镜像结构，环形镂空穿过中央。','Four mirrored spurs surround openings through the central form.')},
 {number:6,name:c('胸棘','Thoracic Thorn'),group:'rib-forms',description:c('胸腔般的骨架围合中央，尖刺沿外轮廓延伸。','A thoracic structure encloses the centre, with spurs along its outline.')},
 {number:7,name:c('心骸','Heart Relic'),group:'rib-forms',description:c('层叠肋骨逐渐收束，向下延伸出单一尖端。','Layered ribs narrow into a single descending point.')},
 {number:8,name:c('夜脊','Night Spine'),group:'spinal-forms',description:c('宽阔骨翼连接纵向骨节，形成向下生长的轮廓。','Broad skeletal wings connect to a descending spinal chain.')},
 {number:9,name:c('裂冠','Rift Crown'),group:'symbiotic-forms',description:c('曲线与尖刺相互穿插，构成开敞的环形结构。','Interlocking curves and spurs create an open circular structure.')},
 {number:10,name:c('圣笼','Reliquary'),group:'rib-forms',description:c('弧形肋骨包围中轴，骨节穿过中央留白。','Curved ribs surround an axis of bones through an open centre.')},
 {number:11,name:c('翼柱','Winged Spine'),group:'spinal-forms',description:c('侧向骨翼与细长脊柱连接，在末端再次分叉。','Lateral bone wings meet a slender spine that branches at its tip.')},
 {number:12,name:c('赤髓','Crimson Marrow'),group:'spinal-forms',description:c('红色嵌入元素沿中轴排列，与银色骨骼形成对照。','Red inset elements follow the central axis against silver skeletal forms.')},
 {number:13,name:c('圣骸','Sacred Remnant'),group:'spinal-forms',description:c('人像、肋骨与骨节叠合，形成一件纵向结构。','A figure, rib structures, and vertebrae combine in a vertical composition.')},
 {number:14,name:c('锁脊','Bound Spine'),group:'rib-forms',description:c('骨架层层展开，细链连接两侧的转折。','Layered skeletal forms are joined by fine chains at either side.')},
 {number:15,name:c('喉甲','Throat Armour'),group:'rib-forms',description:c('弧形结构从两侧抬起，向中央尖端汇聚。','Raised curved sides converge towards a central point.')},
 {number:16,name:c('蚀环','Eclipse Loop'),group:'symbiotic-forms',description:c('角状骨刺沿横向伸展，环形结构连接下方。','Horn-like spurs spread horizontally above a connected loop.')},
 {number:17,name:c('指节','Knuckle Spine'),group:'symbiotic-forms',description:c('重复骨节串联成排，弯曲的分支从中伸出。','Repeated joints form a row with curved branches emerging from it.')},
 {number:18,name:c('冠生','Crownborn'),group:'spinal-forms',description:c('人像上方伸出角状结构，环与骨刺沿四周连接。','Horn-like forms rise above a figure, surrounded by loops and spurs.')},
 {number:19,name:c('镜翼','Mirror Wings'),group:'brand-symbols',description:c('镂空骨翼相对展开，尖端收束为镜像轮廓。','Open skeletal wings face one another, tapering into mirrored tips.')},
];
