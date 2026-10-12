"""Measure real speech span (trim leading/trailing silence) of each VO line; write into vo_meta.json."""
import json
import sys
import wave
from pathlib import Path

import numpy as np

from common import ROOT

VO = ROOT / "film" / "public" / "audio" / "vo"


def speech_span(path: Path, thresh_db: float = -42.0, win_ms: float = 10.0):
    with wave.open(str(path)) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    hop = int(sr * win_ms / 1000)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    on = np.where(db > thresh_db)[0]
    if len(on) == 0:
        return 0, len(x) / sr * 1000, len(x) / sr * 1000
    start = max(0, on[0] - 2) * win_ms
    end = min(n, on[-1] + 3) * win_ms
    return start, end, len(x) / sr * 1000


TAKES = ROOT / "assets" / "audio" / "vo_takes"
MAXC = 22  # max chars per subtitle row


def clean(t: str) -> str:
    import re
    return re.sub(r"\(\w[\w-]*\)|<#[\d.]+#>", "", t).strip()


def split_long(text: str, b: float, e: float) -> list:
    """split a sentence longer than MAXC at the comma closest to the middle, timing by char share"""
    if len(text) <= MAXC:
        return [{"text": text, "b": round(b), "e": round(e)}]
    marks = [i + 1 for i, ch in enumerate(text) if ch in "，、；：,"]
    if not marks:
        return [{"text": text, "b": round(b), "e": round(e)}]
    cut = min(marks, key=lambda i: abs(i - len(text) / 2))
    t = b + (e - b) * cut / len(text)
    return split_long(text[:cut], b, t) + split_long(text[cut:], t, e)


def segments(lid: str, m: dict) -> list:
    take = m.get("take")
    sub = TAKES / (Path(take).stem + ".subs.json") if take else None
    segs = []
    if sub and sub.exists():
        for x in json.loads(sub.read_text(encoding="utf-8")):
            segs += split_long(clean(x["text"]), x["time_begin"], x["time_end"])
    if not segs:
        segs = split_long(clean(m["text"]), m["start_ms"], m["end_ms"])
    return [sg for sg in segs if sg["text"]]


if __name__ == "__main__":
    meta_path = VO / "vo_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    tot = {}
    for lid, m in meta.items():
        s, e, full = speech_span(VO / f"{lid}.wav")
        m.update({"start_ms": round(s), "end_ms": round(e), "full_ms": round(full), "speech_ms": round(e - s)})
        m["segs"] = segments(lid, m)
        sec = lid.split("_")[0]
        tot[sec] = tot.get(sec, 0) + (e - s)
        if "-v" in sys.argv:
            print(f"{lid:12s} lead {s:6.0f}  speech {e - s:6.0f}  tail {full - e:6.0f}  {m['text']}")
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    for k, v in tot.items():
        print(f"{k}: speech total {v / 1000:.1f}s")
