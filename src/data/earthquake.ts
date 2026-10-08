import {c} from './site';
export const earthquake={
 title:c('地震：数据转译','Earthquake: Data into Space'),
 subtitle:c('Jupyter × Python × Blender × Processing 协同设计','A design workflow connecting Jupyter, Python, Blender, and Processing'),
 introduction:c('以地震为主题，将图像中的视觉特征、文本中的叙事信号与地球物理记录转化为可计算的设计变量。在 Jupyter 中完成采集、清洗、分析与融合，再用 Python 将这些变量映射为 Blender 的建筑碎片、地表裂隙与动态场景，最终在 Processing 中转化为粒子、波纹与实时反馈。','This earthquake study turns visual features, narrative signals, and geophysical records into computable design variables. Collection, cleaning, analysis, and fusion in Jupyter lead to Python-driven architectural fragments, ground fractures, and animated scenes in Blender, followed by particles, waves, and real-time feedback in Processing.'),
 chapters:[
  {id:'data-workflow',label:c('从数据到设计的工作流','From data to design')},
  {id:'image-analysis',label:c('图像采集与视觉特征','Images and visual features')},
  {id:'text-analysis',label:c('文本语义与叙事信号','Text and narrative signals')},
  {id:'fusion-analysis',label:c('地震记录与多源融合','Seismic records and data fusion')},
  {id:'design-mapping',label:c('Python 数据转译规则','Python design mappings')},
  {id:'spatial-generation',label:c('数据驱动的空间生成','Data-driven spatial generation')},
  {id:'realtime',label:c('从空间到实时行为','From space to live behaviour')}
 ],
 code:{
  visual:`df_img["darkness"] = 255 - df_img["brightness"]
df_img["damage_proxy"] = (
    df_img["edge_density"] * 0.5
    + (df_img["contrast"] / df_img["contrast"].max()) * 0.3
    + (df_img["darkness"] / df_img["darkness"].max()) * 0.2
)

features = df_img[["brightness", "contrast", "edge_density", "damage_proxy"]]
X = StandardScaler().fit_transform(features)
df_img["cluster"] = KMeans(n_clusters=4, random_state=42).fit_predict(X)`,
  mapping:`fusion_df['x'] = fusion_df['longitude_norm']
fusion_df['y'] = fusion_df['latitude_norm']
fusion_df['z'] = -fusion_df['depth_norm']
fusion_df['scale'] = 1 + fusion_df['magnitude_norm'] * 4
fusion_df['fragmentation'] = fusion_df['emotion_intensity']
fusion_df['rotation_chaos'] = np.where(
    fusion_df['emotion_label'].eq('panic'),
    fusion_df['emotion_intensity'],
    fusion_df['emotion_intensity'] * 0.4
)
fusion_df['material_index'] = fusion_df['cluster_id']
fusion_df.to_csv(OUTPUT_DIR / 'final_fusion_data.csv', index=False)`
 }
};
