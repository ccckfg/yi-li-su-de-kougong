# 任务卡：给几张画面静帧生成深度图（单目深度估计）

不要问我问题，按卡执行。

## 背景
短片要把几张 AI 生成的静帧做成“可以推进去的画”（2.5D 视差运镜），需要每张图的深度图。

## 输入图片（都在 `D:\Project N2\AI _Videos\film\public\stills\`）
S02.png, S15.png, S20.png, S21.png, S22.png, S27.png

## 要做的事
1. 在 `D:\Project N2\AI _Videos\tools\depth\` 新建一个独立的 Node 项目（自己的 package.json，**不要**改动 `film\` 目录下的 package.json 和 node_modules）。
2. 安装 `@huggingface/transformers`（版本 4.x）。Node 版本是 v24。
3. 写脚本 `D:\Project N2\AI _Videos\tools\depth\depth.mjs`：用 transformers.js 的 `depth-estimation` pipeline，模型优先用 `onnx-community/depth-anything-v2-base`，下载失败或太慢就退回 `onnx-community/depth-anything-v2-small`。
   - 对每张输入图跑深度估计，输出与原图**相同分辨率**的深度图（近处白、远处黑），保存为 16-bit 灰度 PNG：`D:\Project N2\AI _Videos\film\public\depth\<原文件名去扩展名>_depth.png`（目录不存在就新建）。
   - 如果 transformers.js 只能输出低分辨率深度，用双线性/双三次插值放大回原尺寸；放大后做一次轻微的边缘保持平滑（例如以原图亮度为引导的 guided filter 或简单的双边滤波，可用 Python numpy/scipy 实现，Python 3.14 已装 numpy、scipy、pillow），避免锯齿。
   - 同时输出一张 8-bit 预览 `..._depth_preview.jpg`（宽 640）方便检查。
4. 如果网络下载模型失败：本机有代理（v2rayN，端口通常是 10808 socks / 10809 http）。可以尝试设置环境变量 `HTTPS_PROXY=http://127.0.0.1:10809` 再运行；或用 HuggingFace 镜像 `https://hf-mirror.com`（transformers.js 可通过 `env.remoteHost` 设置）。
5. 跑完后检查：每张深度图存在、尺寸与原图一致、不是全黑或全白（打印 min/max/mean）。

## 交付
- 深度图 PNG + 预览 JPG 写到 `D:\Project N2\AI _Videos\film\public\depth\`。
- 在 `D:\Project N2\AI _Videos\tools\depth\README.md` 写明用了哪个模型、怎么重新运行。
- 不要修改项目里任何其他文件。
- 完成后在终端只输出一行：DONE depth。
