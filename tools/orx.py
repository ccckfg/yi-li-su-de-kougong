"""OpenRouter client: ElevenLabs TTS (/audio/speech), image models, Lyria 3 music. Logged + costed."""
import base64
import json
from pathlib import Path

import requests

from common import ROOT, ledger, load_env, log_prompt, spent

ENV = load_env()
KEY = ENV["OPENROUTER_API_KEY"]
BASE = "https://openrouter.ai/api/v1"
H = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
     "HTTP-Referer": "https://localhost/seed-film", "X-Title": "seed-film"}
HARD_STOP_USD = 4.40


def _guard(cost: float) -> None:
    used = spent("openrouter")
    if used + cost > HARD_STOP_USD:
        raise RuntimeError(f"OpenRouter budget guard: spent ${used:.3f}, call ${cost:.3f} would pass ${HARD_STOP_USD}")


def credits() -> dict:
    return requests.get(f"{BASE}/credits", headers=H, timeout=30).json().get("data", {})


def tts(text: str, voice: str, out: str | Path, *, shot: str = "", model: str = "elevenlabs/eleven-v4",
        note: str = "") -> Path:
    est = len(text) * 0.00004
    _guard(est)
    body = {"model": model, "input": text, "voice": voice, "response_format": "mp3"}
    r = requests.post(f"{BASE}/audio/speech", headers=H, json=body, timeout=180)
    if r.status_code != 200 or not r.headers.get("Content-Type", "").startswith("audio"):
        raise RuntimeError(f"OpenRouter TTS HTTP {r.status_code}: {r.text[:500]}")
    out = Path(out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(r.content)
    ledger(f"tts {shot}", "openrouter", est, "USD", f"{model} {voice} {len(text)}ch gen={r.headers.get('X-Generation-Id')}")
    log_prompt(shot, "OpenRouter TTS", model, text, {"voice": voice}, [out.relative_to(ROOT)], note)
    return out


def _chat(body: dict, timeout: int = 600) -> dict:
    r = requests.post(f"{BASE}/chat/completions", headers=H, json=body, timeout=timeout)
    try:
        d = r.json()
    except Exception:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:500]}")
    if r.status_code != 200 or "error" in d:
        raise RuntimeError(f"OpenRouter HTTP {r.status_code}: {json.dumps(d, ensure_ascii=False)[:800]}")
    return d


def image(prompt: str, out_prefix: str | Path, *, shot: str = "", model: str = "google/gemini-3.1-flash-image",
          refs: list[str | Path] | None = None, aspect_ratio: str = "16:9", est_cost: float = 0.08,
          note: str = "") -> list[Path]:
    _guard(est_cost)
    content = [{"type": "text", "text": prompt}]
    for ref in refs or []:
        p = Path(ref)
        mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg"
        content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()}})
    body = {"model": model, "messages": [{"role": "user", "content": content}],
            "modalities": ["image", "text"], "image_config": {"aspect_ratio": aspect_ratio}}
    d = _chat(body)
    msg = d["choices"][0]["message"]
    outs = []
    prefix = Path(out_prefix).resolve()
    prefix.parent.mkdir(parents=True, exist_ok=True)
    for i, im in enumerate(msg.get("images") or []):
        url = im["image_url"]["url"]
        b64 = url.split(",", 1)[1]
        ext = ".png" if "png" in url[:30] else ".jpg"
        p = prefix.with_name(f"{prefix.name}_{i}{ext}")
        p.write_bytes(base64.b64decode(b64))
        outs.append(p)
    cost = float((d.get("usage") or {}).get("cost") or est_cost)
    ledger(f"image {shot}", "openrouter", cost, "USD", f"{model} x{len(outs)}")
    log_prompt(shot, "OpenRouter image", model, prompt, {"refs": [str(r) for r in refs or []],
               "aspect_ratio": aspect_ratio}, [o.relative_to(ROOT) for o in outs], note)
    if not outs:
        raise RuntimeError("no image returned: " + json.dumps(msg, ensure_ascii=False)[:400])
    return outs


def music(prompt: str, out: str | Path, *, shot: str = "", model: str = "google/lyria-3-pro-preview",
          est_cost: float = 0.08, note: str = "") -> Path:
    """Lyria via chat completions; audio output is only available when streaming (SSE)."""
    _guard(est_cost)
    body = {"model": model, "messages": [{"role": "user", "content": prompt}], "modalities": ["audio", "text"], "stream": True}
    r = requests.post(f"{BASE}/chat/completions", headers=H, json=body, timeout=900, stream=True)
    if r.status_code != 200:
        raise RuntimeError(f"OpenRouter HTTP {r.status_code}: {r.text[:600]}")
    chunks, texts, usage = [], [], {}
    for raw in r.iter_lines(decode_unicode=True):
        if not raw or not raw.startswith("data:"):
            continue
        data = raw[5:].strip()
        if data == "[DONE]":
            break
        try:
            ev = json.loads(data)
        except Exception:
            continue
        if ev.get("usage"):
            usage = ev["usage"]
        for ch in ev.get("choices") or []:
            delta = ch.get("delta") or {}
            au = delta.get("audio") or {}
            if au.get("data"):
                chunks.append(au["data"])
            if au.get("transcript"):
                texts.append(au["transcript"])
            if isinstance(delta.get("content"), str):
                texts.append(delta["content"])
    if not chunks:
        raise RuntimeError("no audio chunks; text was: " + "".join(texts)[:400])
    blob = b"".join(base64.b64decode(c) for c in chunks)
    out = Path(out).resolve()
    ext = ".wav" if blob[:4] == b"RIFF" else (".mp3" if blob[:3] == b"ID3" or blob[0] == 0xFF else ".bin")
    out = out.with_suffix(ext)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(blob)
    cost = float(usage.get("cost") or est_cost)
    ledger(f"music {shot}", "openrouter", cost, "USD", model)
    log_prompt(shot, "OpenRouter music", model, prompt, {"text": "".join(texts)[:300]}, [out.relative_to(ROOT)], note)
    return out


if __name__ == "__main__":
    print("ledger spent:", spent("openrouter"), "credits:", credits())
