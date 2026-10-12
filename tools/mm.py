"""MiniMax (CN platform) client: TTS, image-01, H3 video. Every call is logged + costed."""
import base64
import json
import mimetypes
import time
from pathlib import Path

import requests

from common import ROOT, ledger, load_env, log_prompt, spent

ENV = load_env()
BASE = ENV.get("MINIMAX_BASE_URL", "https://api.minimaxi.com")
KEY = ENV["MINIMAX_API_KEY"]
H = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}
BUDGET_CNY = 65.0
HARD_STOP_CNY = 64.0  # keep a hair of margin

PRICE_TTS_PER_10K = {"speech-2.8-hd": 3.5, "speech-2.8-turbo": 2.0}
PRICE_VIDEO_PER_S = {("MiniMax-H3", "768P"): 0.5, ("MiniMax-H3", "2K"): 0.8,
                     ("MiniMax-H3-Max", "480P"): 0.33, ("MiniMax-H3-Max", "768P"): 0.5}
PRICE_IMAGE = 0.025


def _guard(cost: float) -> None:
    used = spent("minimax")
    if used + cost > HARD_STOP_CNY:
        raise RuntimeError(f"MiniMax budget guard: spent ¥{used:.2f}, this call ¥{cost:.2f} would pass ¥{HARD_STOP_CNY}")


def _check(r: requests.Response) -> dict:
    try:
        d = r.json()
    except Exception:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:500]}")
    br = d.get("base_resp") or {}
    if r.status_code != 200 or (br and br.get("status_code", 0) != 0):
        raise RuntimeError(f"MiniMax error HTTP {r.status_code}: {json.dumps(d, ensure_ascii=False)[:800]}")
    return d


def _post_retry(url: str, body: dict, timeout: int = 120, tries: int = 8) -> dict:
    """POST with backoff on MiniMax rate limits (status 1002) and transient HTTP errors."""
    wait = 6.0
    for attempt in range(tries):
        try:
            r = requests.post(url, headers=H, json=body, timeout=timeout)
            return _check(r)
        except requests.exceptions.RequestException as e:  # proxy hiccups, resets, timeouts
            if attempt < tries - 1:
                print(f"  network retry in {wait:.0f}s ({type(e).__name__})")
                time.sleep(wait)
                wait = min(wait * 1.8, 90)
                continue
            raise
        except RuntimeError as e:
            msg = str(e)
            if attempt < tries - 1 and ("1002" in msg or "rate limit" in msg or "HTTP 5" in msg or "HTTP 429" in msg):
                print(f"  retry in {wait:.0f}s ({msg[:80]})")
                time.sleep(wait)
                wait = min(wait * 1.8, 90)
                continue
            raise


# ---------------------------------------------------------------- TTS
def tts(text: str, voice_id: str, out: str | Path, *, shot: str = "", model: str = "speech-2.8-hd",
        speed: float = 1.0, vol: float = 1.0, pitch: int = 0, emotion: str | None = None,
        voice_modify: dict | None = None, sample_rate: int = 44100, fmt: str = "wav",
        subtitles: bool = True, note: str = "") -> dict:
    out = Path(out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    chars = len(text)
    cost = chars / 10000 * PRICE_TTS_PER_10K.get(model, 3.5)
    _guard(cost)
    vs = {"voice_id": voice_id, "speed": speed, "vol": vol, "pitch": pitch}
    if emotion:
        vs["emotion"] = emotion
    body = {"model": model, "text": text, "stream": False, "voice_setting": vs,
            "audio_setting": {"sample_rate": sample_rate, "format": fmt, "channel": 1},
            "language_boost": "Chinese", "output_format": "hex",
            "subtitle_enable": subtitles, "subtitle_type": "word"}
    if voice_modify:
        body["voice_modify"] = voice_modify
    d = _post_retry(f"{BASE}/v1/t2a_v2", body, timeout=120)
    audio = bytes.fromhex(d["data"]["audio"])
    out.write_bytes(audio)
    info = d.get("extra_info", {})
    sub_url = (d.get("data") or {}).get("subtitle_file")
    if sub_url:
        try:
            out.with_suffix(".subs.json").write_bytes(requests.get(sub_url, timeout=60).content)
        except Exception as e:  # subtitles are a bonus
            print("subtitle fetch failed:", e)
    billed = info.get("usage_characters", chars)
    real_cost = billed / 10000 * PRICE_TTS_PER_10K.get(model, 3.5)
    ledger(f"tts {shot}", "minimax", real_cost, "CNY", f"{model} {voice_id} {billed}ch -> {out.name}")
    log_prompt(shot, "MiniMax T2A", model, text,
               {k: v for k, v in body.items() if k not in ("text",)}, [out.relative_to(ROOT)], note)
    return info


# ---------------------------------------------------------------- image-01
def image(prompt: str, out_prefix: str | Path, *, shot: str = "", n: int = 1, aspect_ratio: str = "16:9",
          seed: int | None = None, optimizer: bool = False, subject_ref: str | None = None,
          note: str = "") -> list[Path]:
    cost = PRICE_IMAGE * n
    _guard(cost)
    body = {"model": "image-01", "prompt": prompt, "aspect_ratio": aspect_ratio, "n": n,
            "response_format": "base64", "prompt_optimizer": optimizer}
    if seed is not None:
        body["seed"] = seed
    if subject_ref:
        body["subject_reference"] = [{"type": "character", "image_file": _data_uri(subject_ref)}]
    d = _post_retry(f"{BASE}/v1/image_generation", body, timeout=180)
    outs = []
    prefix = Path(out_prefix).resolve()
    prefix.parent.mkdir(parents=True, exist_ok=True)
    for i, b64 in enumerate(d["data"]["image_base64"]):
        p = prefix.with_name(f"{prefix.name}_{i}.jpg")
        p.write_bytes(base64.b64decode(b64))
        outs.append(p)
    ledger(f"image {shot}", "minimax", cost, "CNY", f"image-01 x{n}")
    log_prompt(shot, "MiniMax image", "image-01", prompt,
               {k: v for k, v in body.items() if k not in ("prompt", "subject_reference")},
               [o.relative_to(ROOT) for o in outs], note)
    return outs


# ---------------------------------------------------------------- H3 video
def _data_uri(path: str | Path) -> str:
    p = Path(path)
    mime = mimetypes.guess_type(p.name)[0] or "image/png"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


def video_create(prompt: str, *, shot: str, first_frame: str | Path | None = None,
                 last_frame: str | Path | None = None, model: str = "MiniMax-H3",
                 resolution: str = "768P", duration: int = 5, ratio: str = "16:9", note: str = "") -> str:
    cost = PRICE_VIDEO_PER_S[(model, resolution)] * duration
    _guard(cost)
    content = [{"type": "text", "text": prompt}]
    if first_frame:
        content.append({"type": "image_url", "image_url": {"url": _data_uri(first_frame)}, "role": "first_frame"})
    if last_frame:
        content.append({"type": "image_url", "image_url": {"url": _data_uri(last_frame)}, "role": "last_frame"})
    body = {"model": model, "content": content, "resolution": resolution, "duration": duration,
            "ratio": "adaptive" if (first_frame or last_frame) else ratio}
    r = requests.post(f"{BASE}/v2/video_generation", headers=H, json=body, timeout=180)
    d = _check(r)
    tid = d.get("task_id") or (d.get("task") or {}).get("id")
    ledger(f"video {shot}", "minimax", cost, "CNY", f"{model} {resolution} {duration}s task={tid}")
    log_prompt(shot, "MiniMax video", model, prompt,
               {"resolution": resolution, "duration": duration,
                "first_frame": str(first_frame) if first_frame else None,
                "last_frame": str(last_frame) if last_frame else None, "task_id": tid}, [], note)
    return tid


def video_query(task_id: str) -> dict:
    r = requests.get(f"{BASE}/v2/query/video_generation/{task_id}", headers=H, timeout=60)
    return _check(r).get("task", {})


def video_wait(task_id: str, out: str | Path, poll: int = 15, timeout_s: int = 1800) -> Path:
    t0 = time.time()
    while True:
        t = video_query(task_id)
        st = t.get("status")
        if st == "succeeded":
            url = (t.get("content") or {}).get("url")
            out = Path(out).resolve()
            out.parent.mkdir(parents=True, exist_ok=True)
            with requests.get(url, stream=True, timeout=300) as resp:
                resp.raise_for_status()
                with out.open("wb") as f:
                    for chunk in resp.iter_content(1 << 20):
                        f.write(chunk)
            return out
        if st in ("failed", "cancelled", "canceled"):
            raise RuntimeError(f"task {task_id} {st}: {json.dumps(t, ensure_ascii=False)[:600]}")
        if time.time() - t0 > timeout_s:
            raise TimeoutError(f"task {task_id} still {st}")
        time.sleep(poll)


if __name__ == "__main__":
    print(f"MiniMax spent so far: ¥{spent('minimax'):.2f} / ¥{BUDGET_CNY}")
