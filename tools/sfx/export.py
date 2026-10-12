"""WAV 与 manifest 输出。"""
import json
from pathlib import Path

from scipy.io import wavfile

from sfx_config import MANIFEST_FILE, SR


def write_wav(out_dir: Path, name: str, pcm) -> Path:
    path = out_dir / f"{name}.wav"
    wavfile.write(str(path), SR, pcm)
    return path


def manifest_entry(snd, m):
    return {
        "dur": round(m["dur"], 3),
        "peak_db": round(m["peak_db"], 2),
        "rms_db": round(m["rms_db"], 2),
        "desc": snd.desc,
    }


def write_manifest(out_dir: Path, manifest: dict) -> Path:
    path = out_dir / MANIFEST_FILE
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path
