"""Submit MiniMax H3 i2v jobs from a JSON spec, poll, download to assets/video/<round>/<shot>.mp4.

usage: python video_batch.py docs/prompts/video_v1.json assets/video/v1 [--only S03,S09] [--res 768P]
Task ids are kept in <outdir>/tasks.json so a crashed run can resume polling without paying twice.
"""
import argparse
import json
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import mm
from common import ROOT

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("outdir")
    ap.add_argument("--only", default="")
    ap.add_argument("--res", default="768P")
    a = ap.parse_args()
    spec = json.loads((ROOT / a.spec).read_text(encoding="utf-8"))
    only = set(x for x in a.only.split(",") if x)
    outdir = ROOT / a.outdir
    outdir.mkdir(parents=True, exist_ok=True)
    tasks_path = outdir / "tasks.json"
    tasks = json.loads(tasks_path.read_text(encoding="utf-8")) if tasks_path.exists() else {}

    for job in spec["jobs"]:
        shot = job["shot"]
        if only and shot not in only:
            continue
        if shot in tasks:
            print(shot, "already submitted:", tasks[shot]["task_id"])
            continue
        tid = mm.video_create(job["prompt"], shot=shot, first_frame=ROOT / job["first"],
                              last_frame=(ROOT / job["last"]) if job.get("last") else None,
                              resolution=a.res, duration=job["duration"], note=f"round {outdir.name}")
        tasks[shot] = {"task_id": tid, "duration": job["duration"], "res": a.res, "submitted": time.time()}
        tasks_path.write_text(json.dumps(tasks, indent=1), encoding="utf-8")
        print(shot, "submitted", tid, flush=True)
        time.sleep(2)

    def fetch(item):
        shot, t = item
        out = outdir / f"{shot}.mp4"
        if out.exists():
            return shot, "exists"
        try:
            mm.video_wait(t["task_id"], out)
            return shot, "OK"
        except Exception as e:
            return shot, f"FAILED {e}"

    todo = [(s, t) for s, t in tasks.items() if (not only or s in only)]
    with ThreadPoolExecutor(max_workers=6) as ex:
        for shot, status in ex.map(fetch, todo):
            print(shot, status, flush=True)
    print(f"MiniMax spent: ¥{mm.spent('minimax'):.2f}")
