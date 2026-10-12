"""基础 DSP 原语：噪声整形、滤波、包络、定位叠加。"""
import numpy as np
from scipy import signal

from sfx_config import SR

TWO_PI = 2.0 * np.pi
NYQ_GUARD = 0.45 * SR


def ns(sec):
    return int(round(sec * SR))


def tvec(n):
    return np.arange(n) / SR


def db_to_lin(db):
    return 10.0 ** (db / 20.0)


def rms(x):
    return float(np.sqrt(np.mean(np.square(x)))) + 1e-12


def peak_norm(x):
    return x / (np.max(np.abs(x)) + 1e-12)


def white(rng, n):
    return rng.standard_normal(n)


def amp_jitter(rng, sigma, size=None, cap=2.2):
    """对数正态随机幅度，设上限，避免个别极大值把整体峰值归一后的电平压得过低。"""
    return np.minimum(rng.lognormal(0.0, sigma, size), cap)


# ---------- 频域整形（零相位、天然循环，适合可循环素材） ----------

def shape_gain(freqs, lo=None, hi=None, order=4, tilt_db_oct=0.0, ref=1000.0):
    f = np.maximum(freqs, 1e-3)
    g = np.ones_like(f)
    if lo:
        g = g / np.sqrt(1.0 + (lo / f) ** (2 * order))
    if hi:
        g = g / np.sqrt(1.0 + (f / hi) ** (2 * order))
    if tilt_db_oct:
        g = g * (np.maximum(f, 20.0) / ref) ** (tilt_db_oct / 6.0206)
    g[0] = 0.0
    return g


def fft_filter(x, lo=None, hi=None, order=4, tilt_db_oct=0.0):
    n = x.shape[0]
    spec = np.fft.rfft(x, axis=0)
    g = shape_gain(np.fft.rfftfreq(n, 1.0 / SR), lo, hi, order, tilt_db_oct)
    if x.ndim > 1:
        g = g[:, None]
    return np.fft.irfft(spec * g, n, axis=0)


def shaped_noise(rng, n, lo=None, hi=None, order=4, tilt=0.0):
    y = fft_filter(rng.standard_normal(n), lo, hi, order, tilt)
    return y / (y.std() + 1e-12)


def slow_noise(rng, n, fmax, order=4):
    """零均值、单位方差的慢变随机曲线（首尾相接）。"""
    return shaped_noise(rng, n, hi=max(fmax, 2.0 * SR / n), order=order)


def lognorm_mod(rng, n, fmax, depth):
    """均值为 1 的正向随机调制曲线，偏态，偶有强起伏（阵风、摩擦颤动）。"""
    m = np.exp(depth * slow_noise(rng, n, fmax))
    return m / m.mean()


# ---------- 因果滤波 ----------

def _sos(kind, cut, order):
    return signal.butter(order, cut, btype=kind, fs=SR, output="sos")


def lowpass(x, fc, order=4):
    return signal.sosfilt(_sos("lowpass", min(fc, NYQ_GUARD), order), x, axis=0)


def highpass(x, fc, order=4):
    return signal.sosfilt(_sos("highpass", fc, order), x, axis=0)


def bandpass(x, lo, hi, order=2):
    return signal.sosfilt(_sos("bandpass", [lo, min(hi, NYQ_GUARD)], order), x, axis=0)


def highpass_circular(x, fc, order=4):
    """三段拼接后取中段，使滤波结果在首尾处连续。"""
    n = x.shape[0]
    y = signal.sosfilt(_sos("highpass", fc, order), np.concatenate([x, x, x]), axis=0)
    return y[n:2 * n]


# ---------- 包络 ----------

def ramp(n, dur):
    m = min(n, max(2, ns(dur)))
    r = np.ones(n)
    r[:m] = 0.5 - 0.5 * np.cos(np.pi * np.arange(m) / m)
    return r


def window_env(n, rise, fall):
    return ramp(n, rise) * ramp(n, fall)[::-1]


def decay(n, tau):
    return np.exp(-tvec(n) / tau)


def ad_env(n, attack, tau):
    return ramp(n, attack) * decay(n, tau)


def velocity(n, peakpos=0.4):
    """起止为零的钟形速度曲线，峰值位于 peakpos（0-1）。"""
    x = np.linspace(0.0, 1.0, n)
    return np.sin(np.pi * x ** (np.log(0.5) / np.log(peakpos)))


# ---------- 叠加 ----------

def pan_gains(pan):
    a = (np.clip(pan, -1.0, 1.0) + 1.0) * np.pi / 4.0
    return np.cos(a), np.sin(a)


def place(buf, sig, t, gain=1.0, wrap=False, pan=0.0):
    """把 sig 加到 buf 的 t 秒处；wrap=True 时超出末尾的部分回绕到开头（循环素材）。"""
    n, i, length = buf.shape[0], int(round(t * SR)), sig.shape[0]
    if buf.ndim == 2 and sig.ndim == 1:
        gl, gr = pan_gains(pan)
        sig = np.column_stack([sig * gl, sig * gr])
    if wrap:
        buf[(np.arange(length) + i) % n] += gain * sig
        return
    lo, hi = max(i, 0), min(i + length, n)
    if hi > lo:
        buf[lo:hi] += gain * sig[lo - i:hi - i]


def mix(n, parts):
    """parts: [(信号, 增益[, 起始秒]), ...]"""
    out = np.zeros(n)
    for p in parts:
        place(out, p[0], p[2] if len(p) > 2 else 0.0, p[1])
    return out
