# depth: 静帧单目深度图

给 `film/public/stills/` 里的静帧生成深度图，用于 2.5D 视差运镜。

## 本次使用的模型

- 模型：`onnx-community/depth-anything-v2-base`（fp32，transformers.js `depth-estimation` pipeline，CPU）
- 来源：`https://huggingface.co/`（直连成功，未使用代理或镜像）
- 库版本：`@huggingface/transformers` 4.3.1，Node v24
- 如果 base 下载失败或卡住，脚本会自动退回 `onnx-community/depth-anything-v2-small`。

## 输出

写入 `film/public/depth/`，每张静帧 `<name>` 对应两个文件：

| 文件 | 说明 |
| --- | --- |
| `<name>_depth.png` | 16-bit 灰度 PNG，与原图同分辨率，近处白、远处黑，范围拉伸到 0 到 65535 |
| `<name>_depth_preview.jpg` | 8-bit 预览，宽 640 |

当前输入：S02, S15, S20, S21, S22, S27（分辨率均为 1672x941）。

## 处理流程

1. `depth.mjs` 用 transformers.js 推理，取 `predicted_depth`（原始浮点视差，v4 已双线性放大到原图尺寸），写入 `.work/<name>.f32`。
2. `postprocess.py` 做归一化，再以原图亮度为引导做一次 guided filter（半径 8，eps 0.002），让深度边缘贴合画面边缘，然后输出 16-bit PNG 和预览 JPG。
3. `verify.py` 检查文件存在、尺寸与原图一致、16-bit 模式，并打印 min/max/mean，深度过平或整体偏黑偏白会报错。

## 重新运行

依赖：Node v24、Python 3 且已安装 numpy、scipy、pillow。

```powershell
cd "D:\Project N2\AI _Videos\tools\depth"
npm install            # 首次运行
node depth.mjs         # 处理 config.json 里 stills 列出的全部静帧
node depth.mjs S02 S15 # 只处理指定静帧
```

首次运行会下载约 390 MB 的模型到 `.cache/`，之后走本地缓存。

## 配置

所有参数都在 `config.json`：输入输出目录、静帧列表、模型优先级、下载主机、下载超时（停滞 60 秒或总计 900 秒会换下一个候选）、滤波参数、预览宽度、校验阈值。

要加新静帧，把名字追加到 `stills`，输入图放进 `film/public/stills/`。

## 网络问题

- 代理（v2rayN 的 http 端口）：

  ```powershell
  $env:HTTPS_PROXY = "http://127.0.0.1:10809"
  node depth.mjs
  ```

  检测到 `HTTPS_PROXY` 或 `HTTP_PROXY` 时，脚本会自动以 `NODE_USE_ENV_PROXY=1` 重启自身，让 Node 的 fetch 走代理。注意 Node fetch 不支持 socks 端口（10808）。
- 镜像：`config.json` 的 `hosts` 里已包含 `https://hf-mirror.com/`，直连 huggingface.co 失败时自动切换。要只用镜像，把它放到 `hosts` 第一位。

## 文件

| 文件 | 职责 |
| --- | --- |
| `config.json` | 全部配置 |
| `config.mjs` | 读取配置并解析路径（Node 端） |
| `model.mjs` | 加载模型：主机和模型回退、下载看门狗、代理 |
| `depth.mjs` | 入口：推理、调用 Python 后处理和校验 |
| `common.py` | Python 端参数和配置读取 |
| `postprocess.py` | 引导滤波、16-bit PNG、预览 JPG |
| `verify.py` | 结果检查 |
