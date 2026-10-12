"""客观质检：时长、峰值、RMS、频谱质心、直流、削波、截断尾巴、循环接缝。"""
import numpy as np

from dsp_basic import ns
from sfx_config import (ACTIVE_FLOOR_DB, AMBIENT_PEAK_DB, DC_MAX, ENV_FRAME_S,
                        LONG_SILENCE_FRAC, LONG_SILENCE_MIN_DUR, PEAK_DB, PEAK_TOL_DB, SEAM_MAX,
                        SILENT_RMS_DB, SR, TAIL_MAX_DB, TAIL_WINDOW_MS)
from sfx_types import Sound


def _db(v):
    return 20.0 * np.log10(max(float(v), 1e-9))


def analyze(pcm, snd: Sound, seam=None):
    """返回 (指标字典, 问题标记列表)。"""
    x = pcm.astype(float) / 32768.0
    mono = x if x.ndim == 1 else x.mean(axis=1)
    n = mono.shape[0]
    peak = float(np.abs(x).max())
    spec = np.abs(np.fft.rfft(mono * np.hanning(n)))
    centroid = float(np.sum(np.fft.rfftfreq(n, 1.0 / SR) * spec) / (np.sum(spec) + 1e-12))

    frame = ns(ENV_FRAME_S)
    k = n // frame
    env = np.sqrt(np.mean(mono[:k * frame].reshape(k, frame) ** 2, axis=1))
    active = np.nonzero(_env_db(env, peak) > ACTIVE_FLOOR_DB)[0]
    active_s = (active[-1] + 1) * ENV_FRAME_S if active.size else 0.0

    end = n - ns(snd.fade_out_ms / 1000.0)
    tail = mono[max(end - ns(TAIL_WINDOW_MS / 1000.0), 0):end]
    m = {
        "n": n, "dur": n / SR, "peak_db": _db(peak),
        "rms_db": _db(np.sqrt(np.mean(x ** 2))), "centroid": centroid,
        "dc": float(abs(x.mean())), "active_s": active_s,
        "tail_db": _db(np.sqrt(np.mean(tail ** 2))) - _db(peak), "seam": seam,
    }
    target = AMBIENT_PEAK_DB if snd.ambient else PEAK_DB
    flags = []
    if m["rms_db"] < SILENT_RMS_DB:
        flags.append("SILENT")
    if int(np.abs(pcm.astype(int)).max()) >= 32767 or abs(m["peak_db"] - target) > PEAK_TOL_DB:
        flags.append("PEAK/CLIP")
    if m["dc"] > DC_MAX:
        flags.append("DC")
    if not (snd.loop or snd.ambient) and m["tail_db"] > TAIL_MAX_DB:
        flags.append("TRUNC")
    if (not (snd.loop or snd.ambient) and m["dur"] >= LONG_SILENCE_MIN_DUR
            and active_s < (1.0 - LONG_SILENCE_FRAC) * m["dur"]):
        flags.append("LONGSIL")
    if snd.centroid and not (snd.centroid[0] <= centroid <= snd.centroid[1]):
        flags.append("CENTROID")
    if seam is not None and seam > SEAM_MAX:
        flags.append("SEAM")
    if n != ns(snd.dur):
        flags.append("LENGTH")
    return m, flags


def _env_db(env, peak):
    return 20.0 * np.log10(np.maximum(env / max(peak, 1e-9), 1e-9))


HEADER = (f"{'file':<24}{'dur':>7}{'peak':>8}{'rms':>8}{'centroid':>10}"
          f"{'active':>8}{'tail':>8}{'seam':>7}  flags")


def format_row(snd: Sound, m, flags):
    seam = f"{m['seam']:.1f}" if m["seam"] is not None else "-"
    return (f"{snd.name + '.wav':<24}{m['dur']:>7.2f}{m['peak_db']:>8.2f}{m['rms_db']:>8.2f}"
            f"{m['centroid']:>10.0f}{m['active_s']:>8.2f}{m['tail_db']:>8.1f}{seam:>7}  "
            f"{','.join(flags) or 'ok'}")
