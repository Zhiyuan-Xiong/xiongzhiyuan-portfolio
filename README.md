<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/media/github-banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/media/github-banner-light.svg">
  <img src="docs/media/github-banner-light.svg" alt="熊志愿｜AI 视觉设计、品牌视觉与创意交互" width="100%">
</picture>
</p>

# 熊志愿｜AI 视觉与创意设计作品集

我把视觉概念转化为品牌、三维、影像与交互作品。关注 AI 辅助的创作流程，也重视人工选择、结构细化和实际体验。

**[GitHub 个人主页](https://github.com/Zhiyuan-Xiong) · [GitHub 项目导航](https://zhiyuan-xiong.github.io/xiongzhiyuan-portfolio/) · [打开完整作品集](https://xiongzhiyuan-portfolio.pages.dev/) · [立即试玩《毒蘑菇》](https://zhiyuan-xiong.github.io/poisonous-mushrooms/) · [关于我与简历](https://xiongzhiyuan-portfolio.pages.dev/zh/about/) · [英文作品集](https://xiongzhiyuan-portfolio.pages.dev/en/)**

本科毕业于华中科技大学设计学院，现于 UCL Bartlett 攻读性能与交互设计硕士。求职方向：AI 设计、视觉设计、创意设计。

## 代表项目与我的贡献

| 项目 | 我的具体贡献 | 项目入口 |
| --- | --- | --- |
| **《毒蘑菇》** | 前期概念、场景与分镜；AI 素材生成与整理、Godot 小游戏搭建和体验验证；参与 MV 调色与视觉统一 | [查看](https://github.com/Zhiyuan-Xiong/poisonous-mushrooms) |
| **骨骸共生系统** | SPRING 品牌视觉与 Logo；Midjourney 图像探索、Tripo 3D 初始建模、ZBrush／Nomad 人工雕刻与首饰细化 | [查看](https://github.com/Zhiyuan-Xiong/spring-skeleton-collection) |
| **无垠的宇宙** | 参数化建模、交互编程与生成影像设计 | [查看](https://github.com/Zhiyuan-Xiong/infinite-cosmos) |
| **地震：数据转译** | Python 数据处理、参数映射与空间可视化 | [查看](https://github.com/Zhiyuan-Xiong/BARC0074-Digital-Skills-Report-Codebook-25097154) |
| **蜕变** | 模型处理、节点编程、声音映射与视觉合成 | [查看](https://github.com/Zhiyuan-Xiong/metamorphosis) |
| **饭搭子** | 产品概念、饮食记录与食宠 UX 流程、Godot 交互原型和 AI 照片工作流；进行中 | [查看](https://github.com/Zhiyuan-Xiong/fandazi) |

**[查看精选项目个人贡献](docs/个人贡献.md) · [GitHub 真实贡献与活动](https://github.com/Zhiyuan-Xiong)**

## 作品预览

<table><tr>
<td width="50%"><a href="https://github.com/Zhiyuan-Xiong/poisonous-mushrooms"><img src="public/images/mushrooms-cover-1280.webp" alt="《毒蘑菇》" width="100%"></a><br><strong>《毒蘑菇》</strong><br>AI 素材工作流、可编辑 Godot 跑酷游戏与浏览器试玩。</td>
<td width="50%"><a href="https://github.com/Zhiyuan-Xiong/spring-skeleton-collection"><img src="public/images/bone-cover-white-1280.webp" alt="骨骸共生系统" width="100%"></a><br><strong>骨骸共生系统</strong><br>SPRING 品牌视觉与骨骸首饰：AI 图像、辅助建模和人工细化。</td>
</tr><tr>
<td width="50%"><a href="https://github.com/Zhiyuan-Xiong/infinite-cosmos"><img src="public/images/cosmos-cover-1280.webp" alt="无垠的宇宙" width="100%"></a><br><strong>无垠的宇宙</strong><br>Rhino、Grasshopper、Processing 与 ComfyUI 的跨工具创作。</td>
<td width="50%"><a href="https://github.com/Zhiyuan-Xiong/metamorphosis"><img src="public/images/metamorphosis-cover-1280.webp" alt="蜕变" width="100%"></a><br><strong>蜕变</strong><br>TouchDesigner 几何、粒子与实时声音响应。</td>
</tr></table>

## 我的 AI 工作方式

我用 AI 扩展灵感、检索与比较信息，再用自己的思考确定问题、审美和约束。针对不同任务选择生成工具与专业软件，通过 Codex 形成原型、迭代和测试；发现问题后，重新回到 Chat 改写提示词与补充检索。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/media/ai-workflow-dark.svg">
  <img src="docs/media/ai-workflow-light.svg" alt="我的 AI 设计工作流：发散检索、个人判断、原型、专业评审、反馈与交付" width="100%">
</picture>

<details>
<summary>展开查看可交互流程图</summary>

```mermaid
flowchart LR
  A["发散与检索<br/>Chat + 多渠道信息"]:::ai
  B["我定义方向<br/>问题 / 审美 / 约束"]:::human
  C["方案与原型<br/>生成工具 + Codex"]:::ai
  D["我评审和细化<br/>专业工具 + 实际测试"]:::human
  E["可查看的交付<br/>作品 / 原型 / 记录"]:::output
  A --> B --> C --> D --> E
  D -. "根据评审回到提示词与检索" .-> A
  classDef human fill:#dcefe5,stroke:#7caa96,color:#183d30;
  classDef ai fill:#eee8fa,stroke:#ada0d0,color:#392c57;
  classDef output fill:#fbefd3,stroke:#cbb574,color:#58461c;
```

</details>

| 项目任务 | 我的 AI 策略 | 我掌握的质量判断 |
| --- | --- | --- |
| **毒蘑菇：游戏资产与实现** | 权威参考约束 imagegen，多素材与 Codex／Godot 原型同步迭代 | 角色与风格一致性、透明素材、中文排字、玩法体验 |
| **骨骸共生：品牌与首饰** | Midjourney 发散 → Tripo 3D 初始形体 → 人工雕刻 | 系列语言、体块、佩戴结构和细节 |
| **无垠的宇宙：生成影像** | 参数化结构与粒子作为基础，ComfyUI 延展视觉 | 形态连续性、构图和运动节奏 |
| **Earthquake：多模态分析** | 用预训练表示解析数据，由我定义空间映射 | 数据来源、变量意义、映射解释和视觉结果 |
| **饭搭子：带 AI 的 UX** | 将识别、人工核对、贴纸生成与降级路径放入产品 | 用户控制、风格一致、等待状态与失败体验 |
| **作品集网站：数字交付** | Chat 梳理 → 我确定设计要求 → Codex 实现、检查与迭代 | 内容结构、页面审美、交互、类型和素材引用 |

**[完整八阶段方法、提示词组织与质量控制](docs/AI设计工作流.md)**

### 这个网站怎样从设计要求形成原型

我提供作品素材、个人职责和视觉要求，由 Chat 辅助组织信息；我确定内容、页面层次与交互方向，再把任务交给 Codex 实现。通过实际页面评审与运行检查，继续迭代视觉、代码和内容，最后整理为中英文作品集、分项目仓库、中文个人主页和可在线体验的游戏。

| 控制环节 | 我提出或判断什么 | AI 协作与产出 |
| --- | --- | --- |
| 研究与内容 | 项目定位、个人贡献、阅读顺序和求职重点 | 结构化文案与项目索引 |
| 视觉与体验 | 色彩、封面、模型与粒子呈现、交互反馈 | Astro 组件、TypeScript 与 WebGL 原型 |
| 迭代与验证 | 实际页面是否符合审美和体验要求 | 类型、构建、浏览器与 5123 项本地引用检查 |
| 交付与复用 | 哪些项目进入精选、哪些资料保留归档 | 42 页双语网站、GitHub 仓库、源码与制作证据 |

## 求职项目索引

10 个精选项目均已建立独立仓库，分别保存详细中文说明、工作流、过程材料与个人贡献。饭搭子为进行中的 UX 原型。

| 项目 | 类型 | 项目说明／仓库 | 完整案例 |
| --- | --- | --- | --- |
| 病名异化实验场 | XR／交互体验 · 协作项目 | [仓库](https://github.com/Zhiyuan-Xiong/the-big-bang-stigma) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/stigma/) |
| 相亲营销嘉年华 | 交互叙事／三维空间 | [仓库](https://github.com/Zhiyuan-Xiong/dating-carnival) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/dating-carnival/) |
| 《毒蘑菇》 | 音乐影像／商业协作 | [仓库](https://github.com/Zhiyuan-Xiong/poisonous-mushrooms) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/poisonous-mushrooms/) |
| 饭搭子 | UX／产品设计 | [仓库](https://github.com/Zhiyuan-Xiong/fandazi) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/works/?project=fandazi) |
| 机械文明计划 | 叙事向概念游戏场景设计 | [仓库](https://github.com/Zhiyuan-Xiong/nexus-mechanical-civilization) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/nexus/) |
| 骨骸共生系统 | 品牌视觉／3D 首饰设计 | [仓库](https://github.com/Zhiyuan-Xiong/spring-skeleton-collection) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/bone-series/) |
| 声学弹性 | Bartlett School 设计项目 · 协作装置 | [仓库](https://github.com/Zhiyuan-Xiong/sonic-elasticity) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/sonic-elasticity/) |
| 无垠的宇宙 | 参数化空间／创意编程／生成影像 | [仓库](https://github.com/Zhiyuan-Xiong/infinite-cosmos) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/infinite-cosmos/) |
| 地震：数据转译 | Bartlett School 设计项目 · 数据驱动设计 | [仓库](https://github.com/Zhiyuan-Xiong/BARC0074-Digital-Skills-Report-Codebook-25097154) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/earthquake/) |
| 蜕变 | 创意编程／实时视听交互 | [仓库](https://github.com/Zhiyuan-Xiong/metamorphosis) | [案例](https://xiongzhiyuan-portfolio.pages.dev/zh/work/metamorphosis/) |

## 从这里开始

- 查看作品与影片：[在线作品集](https://xiongzhiyuan-portfolio.pages.dev/)。
- 实际体验：[毒蘑菇在线试玩](https://zhiyuan-xiong.github.io/poisonous-mushrooms/)、[游戏素材浏览](https://zhiyuan-xiong.github.io/poisonous-mushrooms/resources.html)。
- 阅读代码与工作流：从上方各项目入口进入。
- 查看完整网站源码：本仓库的 `src/`、`public/` 与 `scripts/`。

<details><summary>网站运行与技术说明</summary>

需要 Node.js 22.12 或以上、pnpm 11。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm build
pnpm test
```

网站使用 Astro、TypeScript、CSS 与原生 WebGL；中英文页面共 42 页。已通过类型检查和 5123 个本地链接／素材引用检查。

</details>

## 联系与署名

[关于我、联系方式与双语简历](https://xiongzhiyuan-portfolio.pages.dev/zh/about/)。协作项目按案例中的个人职责说明展示；作品素材和第三方资源遵循各自授权。
