"""Compile docs/prompt_log.jsonl into the submission document 原始AI指令.md (grouped by shot)."""
import json
from collections import OrderedDict
from pathlib import Path

from common import DOCS, LOG_JSONL

CODE_SHOTS = """
## 代码生成部分（Claude 编写的程序直接渲染）

以下镜头不是由图像/视频模型生成，而是由 Claude（Anthropic，Claude Opus 5.5）根据我们的分镜与指令编写 Remotion + three.js / WebGL 程序实时渲染：

- S06–S14 审讯室：3D 场景（台灯、木桌、征集表、钢笔、牛皮纸袋、空椅子、水杯）、自定义景深着色器、墨点洇开着色器；S14 谷粒倾泻用 cannon-es 物理引擎模拟 260 粒带壳谷粒。
- S15、S20、S21、S22：在 AI 静帧上用着色器做炭笔线条抖动、壁画落雨与颜料剥落、木刻逐刀显影、黑白胶片划痕闪烁。
- S16 半坡彩陶罐（3D，程序绘制红底黑彩纹样）、S17 甲骨「禾」字长成谷子（甲骨文字形取自维基共享资源，公有领域）、S18 青铜云雷纹与竹简（3D）。
- S23–S25 化验：显微一镜到底着色器（谷粒→纵切面→糊粉层→细胞核→DNA）、环形进化树、屏幕光退成台灯。
- S34 水渗进土、S35 露白（3D 谷粒与胚根）。
- 全片字幕、展签、征集表手写字、片名、致敬卡、创作信息页、混音与调色均由程序完成。

给 Claude 的主要指令：参赛通知、剧本《口供》、分镜表与提示词（见附件原文），以及“以代码为主生成视频，AI 图像/视频模型只补充难以用代码实现的素材”的要求。
"""


def main() -> None:
    rows = [json.loads(l) for l in LOG_JSONL.read_text(encoding="utf-8").splitlines() if l.strip()]
    by_shot: "OrderedDict[str, list]" = OrderedDict()
    for r in rows:
        by_shot.setdefault(r["shot"] or "未分类", []).append(r)
    out = ["# 原始 AI 指令（提示词日志）", "", "《一粒粟的口供》 · 自动汇总自制作过程中的每一次 AI 调用（时间、工具、模型、原始提示词、产出文件）。", ""]
    out.append(CODE_SHOTS)
    out.append("## 生成式模型调用明细\n")
    for shot, items in by_shot.items():
        out.append(f"### {shot}\n")
        for r in items:
            out.append(f"- **{r['time']}** · {r['tool']} · `{r['model']}`")
            prompt = r["prompt"] if isinstance(r["prompt"], str) else json.dumps(r["prompt"], ensure_ascii=False)
            out.append("")
            out.append("  ```text")
            for line in prompt.splitlines() or [""]:
                out.append("  " + line)
            out.append("  ```")
            params = {k: v for k, v in (r.get("params") or {}).items() if k not in ("text",)}
            if params:
                out.append(f"  参数：`{json.dumps(params, ensure_ascii=False)[:300]}`")
            if r.get("outputs"):
                out.append(f"  产出：{', '.join(r['outputs'])}")
            if r.get("note"):
                out.append(f"  备注：{r['note']}")
            out.append("")
    dst = DOCS / "原始AI指令.md"
    dst.write_text("\n".join(out), encoding="utf-8")
    print("written", dst, len(rows), "calls")


if __name__ == "__main__":
    main()
