"""合成原语：模态、噪声脉冲、啁啾、电流嗡声、时变带通、短混响。"""
import numpy as np
from scipy import signal

from dsp_basic import (NYQ_GUARD, SR, TWO_PI, ad_env, fft_filter, lowpass, ns,
                       ramp, tvec)


def modal(n, freqs, amps, taus, rng=None, jitter=0.0, attack=0.0003):
    """多个指数衰减正弦之和（敲击体的模态响应）。jitter 为频率的相对随机偏差。"""
    freqs = np.atleast_1d(np.asarray(freqs, float))
    k = freqs.size
    amps = np.broadcast_to(np.asarray(amps, float), (k,))
    taus = np.broadcast_to(np.asarray(taus, float), (k,))
    if rng is not None and jitter:
        freqs = freqs * (1.0 + jitter * rng.standard_normal(k))
    out = np.zeros(n)
    for f, a, tau in zip(freqs, amps, taus):
        if f >= NYQ_GUARD:
            continue
        m = min(n, int(tau * 11.5 * SR) + 1)
        t = np.arange(m) / SR
        out[:m] += a * np.exp(-t / tau) * np.sin(TWO_PI * f * t)
    return out * ramp(n, attack)


def burst(rng, dur, lo=None, hi=None, tau=0.003, attack=0.0002, order=2):
    """带通噪声脉冲，峰值归一为 1。"""
    n = ns(dur)
    x = fft_filter(rng.standard_normal(n), lo, hi, order)
    return x / (np.abs(x).max() + 1e-12) * ad_env(n, attack, tau)


def chirp(dur, f0, f1, tau=None, curve="exp"):
    """正弦啁啾；tau 为 None 时用汉宁包络，否则用指数衰减。"""
    n = ns(dur)
    u = np.arange(n) / max(n - 1, 1)
    f = f0 * (f1 / f0) ** u if curve == "exp" else f0 + (f1 - f0) * u
    env = np.hanning(n) if tau is None else ad_env(n, 0.001, tau)
    return np.sin(TWO_PI * np.cumsum(f) / SR) * env


def hum(n, f0, weights, rng, t=None):
    """工频嗡声：weights = {谐波倍数: 幅度}，相位随机。"""
    t = tvec(n) if t is None else t
    out = np.zeros(n)
    for mult, a in weights.items():
        out += a * np.sin(TWO_PI * f0 * mult * t + rng.uniform(0, TWO_PI))
    return out


def svf_bandpass(x, fc, q):
    """逐样本时变带通（TPT 状态变量滤波器），fc 可为随时间变化的数组，增益在中心频率为 1。"""
    n = x.shape[0]
    g = np.tan(np.pi * np.minimum(np.broadcast_to(fc, (n,)), NYQ_GUARD) / SR)
    k = np.broadcast_to(1.0 / np.asarray(q, float), (n,))
    a1 = 1.0 / (1.0 + g * (g + k))
    a2 = g * a1
    a3 = g * a2
    s1 = s2 = 0.0
    out = [0.0] * n
    for i, (v, a1i, a2i, a3i, ki) in enumerate(zip(x.tolist(), a1.tolist(), a2.tolist(),
                                                   a3.tolist(), k.tolist())):
        v3 = v - s2
        v1 = a1i * s1 + a2i * v3
        v2 = s2 + a2i * s1 + a3i * v3
        s1 = 2.0 * v1 - s1
        s2 = 2.0 * v2 - s2
        out[i] = v1 * ki
    return np.asarray(out)


def room_ir(rng, rt60, lp_hz=5000.0, predelay=0.0):
    """指数衰减噪声脉冲响应：早期较亮、后期变暗，能量归一。"""
    length = ns(rt60 * 1.1)
    t = tvec(length)
    ir = lowpass(rng.standard_normal(length) * np.exp(-6.9078 * t / rt60), lp_hz, 2)
    dark = lowpass(ir, lp_hz * 0.35, 2)
    w = np.exp(-t / (0.35 * rt60))
    ir = ir * w + dark * (1.0 - w)
    ir = np.concatenate([np.zeros(ns(predelay)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


def reverb(x, rng, rt60, wet, lp_hz=5000.0, predelay=0.0):
    """短混响：干声 + wet * (干声 * IR)，结果截断到原长度。"""
    if x.ndim == 2:
        return np.column_stack([reverb(x[:, c], rng, rt60, wet, lp_hz, predelay)
                                for c in range(x.shape[1])])
    ir = room_ir(rng, rt60, lp_hz, predelay)
    return x + wet * signal.fftconvolve(x, ir)[:x.shape[0]]
