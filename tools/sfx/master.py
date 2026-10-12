"""母带处理：去直流、20 Hz 高通、淡入淡出、峰值归一、16-bit 量化。"""
import numpy as np

from dsp_basic import db_to_lin, highpass, highpass_circular, ns
from sfx_config import (AMBIENT_PEAK_DB, FADE_IN_MS, HP_HZ, HP_ORDER, PEAK_DB)
from sfx_types import Sound


def _fade_curve(m):
    return 0.5 - 0.5 * np.cos(np.pi * np.arange(m) / m)


def apply_fades(x, in_ms, out_ms):
    n = x.shape[0]
    gain = np.ones(n)
    mi, mo = ns(in_ms / 1000.0), ns(out_ms / 1000.0)
    gain[:mi] *= _fade_curve(mi)
    gain[n - mo:] *= _fade_curve(mo)[::-1]
    return x * (gain[:, None] if x.ndim == 2 else gain)


def loop_seam(x):
    """首尾样本跳变相对典型逐样本变化的倍数；接近 1 表示接缝连续。"""
    y = x if x.ndim == 1 else x.mean(axis=1)
    return float(abs(y[0] - y[-1]) / (np.std(np.diff(y)) + 1e-12))


def master(x, snd: Sound):
    """返回 (int16 数据, 循环接缝指标或 None)。"""
    x = np.asarray(x, float)
    x = x - x.mean(axis=0)
    x = (highpass_circular if snd.loop else highpass)(x, HP_HZ, HP_ORDER)
    seam = loop_seam(x) if snd.loop else None
    x = apply_fades(x, FADE_IN_MS, snd.fade_out_ms)
    target = db_to_lin(AMBIENT_PEAK_DB if snd.ambient else PEAK_DB)
    x = x * (target / (np.max(np.abs(x)) + 1e-12))
    return np.round(x * 32767.0).astype(np.int16), seam
