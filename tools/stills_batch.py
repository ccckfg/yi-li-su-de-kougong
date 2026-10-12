"""Batch-generate stills from a prompt JSON with Codex image generation (parallel workers).

usage: python stills_batch.py docs/prompts/stills_v1.json assets/stills/v1 [--workers 3] [--only S03,S04]
"""
import argparse
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from codex_img import generate
from common import ROOT


def expand(text: str, style: dict) -> str:
    return re.sub(r"\{(\w+)\}", lambda m: style.get(m.group(1), m.group(0)), text)


def build_prompt(item: dict, style: dict) -> str:
    p = expand(item["prompt"], style)
    s = item.get("style", "none")
    if s != "none" and s in style:
        p = p + "\n\nStyle: " + style[s]
    return p


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("outdir")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--only", default="")
    ap.add_argument("--suffix", default="")
    a = ap.parse_args()
    spec = json.loads((ROOT / a.spec).read_text(encoding="utf-8"))
    style = spec["_style"]
    only = set(x for x in a.only.split(",") if x)
    items = [it for it in spec["shots"] if not only or it["shot"] in only]
    outdir = ROOT / a.outdir
    outdir.mkdir(parents=True, exist_ok=True)

    def job(it):
        out = outdir / f"{it['shot']}{a.suffix}.png"
        refs = [ROOT / r for r in it.get("refs", [])]
        res = generate(it["shot"], out, build_prompt(it, style), refs)
        return it["shot"], res

    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        futs = [ex.submit(job, it) for it in items]
        for f in as_completed(futs):
            try:
                shot, res = f.result()
                print(f"{shot}: {'OK ' + ', '.join(p.name for p in res) if res else 'NO IMAGE'}", flush=True)
            except Exception as e:
                print("job failed:", e, flush=True)
