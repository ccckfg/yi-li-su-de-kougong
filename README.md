# 一粒粟的口供

华中农业大学 2026 年种子 AI 短视频创作大赛参赛作品。16:9，片长 2 分 55 秒（含创作信息页）。

一粒谷种在台灯下接受"审讯"，从一万年前的狗尾草说起：半坡陶罐、殷墟甲骨、《诗经》、《齐民要术》、敦煌壁画、《天工开物》、小米加步枪，再到实验室里的泛基因组和春天的试验田。

## 做法

画面以**代码**为主：用 [Remotion](https://www.remotion.dev/) 做剪辑台和合成器，three.js / React Three Fiber 搭 3D 场景，GLSL 写媒介质感和转场，ffmpeg 做终混。只有需要真人表演的镜头才用视频生成模型。

- **审讯室**（S06–S14）：整间屋子是 3D 场景——黄铜台灯、钢笔（金尖、中缝、气孔、刻花）、档案夹、水杯、纸袋、空椅子；台灯光锥里的烟雾是屏幕空间体积光；谷粒倾倒用刚体模拟预烘焙。
- **一万年**（S15–S22）：AI 静帧经单目深度估计（Depth Anything V2）重建成浮雕，镜头"走进画里"，每个时代配自己的粒子和媒介着色（炭笔、壁画、木刻、黑白胶片）。S16 彩陶、S17 甲骨、S18 青铜是完整 3D 场景：甲骨上的「禾」字刻槽发光，长出一株谷子，再凝成青铜器上的浮雕。
- **化验**（S23–S25）：显微镜一镜到底（谷粒纵切面 → 糊粉层 → 细胞核 → 原子级 B 型 DNA），发光进化树。
- **接你**（S26–S33）：MiniMax H3 视频（codex 生成首帧）。
- **露白**（S34–S35）：土壤剖面里谷粒吸水、胚根带着根毛从基部钻出。

剧情和台词保持原剧本，画面实现方式的改动逐条记录在 [`docs/changes.md`](docs/changes.md)，史实核对见 [`docs/factcheck.md`](docs/factcheck.md)。

## 目录

```
film/                 Remotion 工程
  src/timeline/       镜头 / 台词 / 提示点时间线
  src/shots/          镜头注册表
  src/scenes/         room（审讯室）eras（一万年）lab（化验）spring（露白）
  src/three/          景深、体积光、光束、胶片等后期效果
  src/ui/             字幕、字卡、转场
  src/audio/          配音、音效、配乐轨
  public/             静帧、深度图、视频片段、音频、字体、贴图
tools/                Python / Node 工具：MiniMax、OpenRouter、codex 生成，配音分析，深度图，终混
  render_v.sh         整片渲染（分 4 段渲染 → 音频 → 拼接 → 调色颗粒 → 手机版）
docs/                 剧本、分镜、改动记录、史实核对、原始 AI 指令、花费账本
assets/               生成素材原件（配音各条 take、静帧、视频、贴图）
```

## 渲染

```bash
cd film
npm install
npx remotion studio            # 预览
cd .. && bash tools/render_v.sh 8   # 整片 → renders/口供_v8_母版1080p.mp4 和手机版
```

需要 Node 20+、ffmpeg、Python 3（numpy / scipy / pillow）。生成类工具从项目根目录的 `.env` 读取 `MINIMAX_API_KEY`、`OPENROUTER_API_KEY`（不在仓库中）。

## AI 工具

Claude（代码编写与镜头制作；史实核对、音效程序由子 Agent 完成）· MiniMax H3（视频）· MiniMax Speech 2.8（配音）· Google Lyria（配乐）· OpenAI GPT 图像（静帧）· Depth Anything V2（深度估计）。每一条生成指令都记在 [`docs/原始AI指令.md`](docs/原始AI指令.md) 和 `docs/prompt_log.jsonl`。

## 第三方素材

- 字体：思源宋体 / 思源黑体（Noto Serif SC / Noto Sans SC）、霞鹜文楷、朱雀仿宋、龙藏体、志莽行书，均为 SIL Open Font License 1.1，见 [`film/public/fonts/OFL.txt`](film/public/fonts/OFL.txt)。
- 甲骨文「禾」字形：Wikimedia Commons，公有领域。
- 深度估计模型：`onnx-community/depth-anything-v2-base`（Depth Anything V2，模型权重不在仓库中）。
