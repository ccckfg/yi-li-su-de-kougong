"""颗粒合成：颗粒库、非齐次泊松时刻、颗粒散布、笔触颗粒云。"""
import numpy as np

from dsp_basic import (SR, TWO_PI, amp_jitter, fft_filter, ns, place, ramp, velocity, white)


def _pick(rng, v, log=False):
    if v is None:
        return None
    if isinstance(v, (tuple, list)):
        a, b = v
        return float(np.exp(rng.uniform(np.log(a), np.log(b)))) if log else float(rng.uniform(a, b))
    return float(v)


def noise_grain_bank(rng, k, ms=(1.0, 3.0), lo=None, hi=None):
    """k 个噪声颗粒；lo/hi 为标量或 (最小, 最大) 区间，每颗各自随机截止频率。"""
    bank = []
    for _ in range(k):
        length = max(8, ns(rng.uniform(*ms) / 1000.0))
        g = fft_filter(white(rng, length), _pick(rng, lo), _pick(rng, hi), 2)
        x = np.arange(length) / length
        env = (np.sin(0.5 * np.pi * np.minimum(x / 0.1, 1.0)) ** 2
               * np.exp(-4.0 * x) * np.minimum((1.0 - x) / 0.2, 1.0))
        g = g * env
        bank.append(g / (np.abs(g).max() + 1e-12))
    return bank


def tick_bank(rng, k, freq=(900.0, 3600.0), tau_ms=(1.5, 5.0), noise=0.25, partial=0.3):
    """k 个短促"咔嗒"颗粒：衰减正弦 + 非谐泛音 + 少量噪声，音高对数均匀随机。"""
    bank = []
    for _ in range(k):
        f = _pick(rng, freq, log=True)
        tau = rng.uniform(*tau_ms) / 1000.0
        length = max(16, ns(tau * 7.0))
        t = np.arange(length) / SR
        g = np.sin(TWO_PI * f * t) + partial * np.sin(TWO_PI * 2.4 * f * t)
        hiss = fft_filter(white(rng, length), None, min(3.0 * f, 10000.0), 2)
        g = g * np.exp(-t / tau) + noise * hiss * np.exp(-t / (0.4 * tau))
        g = g * ramp(length, 0.0001)
        bank.append(g / (np.abs(g).max() + 1e-12))
    return bank


def poisson_times(rng, rate_fn, t0, t1, step=0.001):
    """按时变速率 rate_fn(t) 采样 [t0, t1) 内的事件时刻（升序）。"""
    grid = np.arange(t0, t1, step)
    cum = np.concatenate([[0.0], np.cumsum(np.maximum(rate_fn(grid), 0.0) * step)])
    total = cum[-1]
    u = np.sort(rng.uniform(0.0, total, rng.poisson(total)))
    return np.interp(u, cum, np.concatenate([grid, [t1]]))


def scatter(buf, rng, times, amps, bank, wrap=False, pan_range=0.0):
    for t, a in zip(times, amps):
        pan = rng.uniform(-pan_range, pan_range) if pan_range else 0.0
        place(buf, bank[rng.integers(len(bank))], t, a, wrap=wrap, pan=pan)


def stroke_cloud(buf, rng, t0, dur, density, bank, peakpos=0.4, power=1.2, gain=1.0):
    """一道笔触：颗粒密度与幅度都跟随钟形速度曲线。"""
    m = ns(dur)
    v = velocity(m, peakpos)
    tt = t0 + np.arange(m) / SR
    times = poisson_times(rng, lambda t: density * np.interp(t, tt, v), t0, t0 + dur)
    if times.size:
        amps = gain * amp_jitter(rng, 0.45, times.size) * np.interp(times, tt, v) ** power
        scatter(buf, rng, times, amps, bank)
