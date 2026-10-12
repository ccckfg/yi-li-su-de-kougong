"""天气与环境：冬风、雪地脚步、窗外雪、早春微风、种子室房间声。"""
import numpy as np

from dsp_basic import (TWO_PI, ad_env, amp_jitter, bandpass, db_to_lin, lognorm_mod, lowpass,
                       mix, ns, peak_norm as pk, place, rms, shaped_noise, slow_noise, tvec,
                       white, window_env)
from dsp_grain import noise_grain_bank, scatter
from dsp_synth import chirp, modal, svf_bandpass
from sfx_types import Sound

STEP_TIMES = (0.14, 0.69, 1.25, 1.79)


def _gust(rng, n, shared, fmax, depth, own_weight=0.7071):
    """阵风包络：左右声道共享一部分起伏，其余各自独立。"""
    z = np.sqrt(1.0 - own_weight ** 2) * shared + own_weight * slow_noise(rng, n, fmax)
    g = np.exp(depth * z)
    return g / g.mean()


def _whistle(rng, dur):
    m = ns(dur)
    wander = 1.0 + 0.07 * slow_noise(rng, m, 3.0)
    x = svf_bandpass(white(rng, m), rng.uniform(1700, 2900) * wander, 30.0)
    return x / rms(x) * np.hanning(m) ** 1.5 * 0.2


def wind_winter(rng, dur):
    n = ns(dur)
    shared = slow_noise(rng, n, 0.35)
    chans = []
    for _ in range(2):
        g = _gust(rng, n, shared, 0.35, 0.42)
        g2 = g ** 1.4 / np.mean(g ** 1.4)
        low = shaped_noise(rng, n, 100, 500, order=3, tilt=-3) * g
        high = shaped_noise(rng, n, 450, 1200, order=3) * g2 * 0.55
        chans.append((low + high) * lognorm_mod(rng, n, 7.0, 0.25))
    out = np.column_stack(chans)
    for _ in range(3):
        place(out, _whistle(rng, rng.uniform(0.9, 1.5)), rng.uniform(0, dur),
              wrap=True, pan=rng.uniform(-0.8, 0.8))
    return out


def snow_steps(rng, dur):
    n = ns(dur)
    out = np.zeros(n)
    bank = noise_grain_bank(rng, 48, ms=(0.8, 2.6))
    m = ns(0.3)
    for t0 in STEP_TIMES:
        t0 += rng.uniform(-0.025, 0.025)
        d = rng.uniform(0.06, 0.12)
        k = ns(d)
        seg = np.zeros(m)
        cnt = int(rng.uniform(80, 140))
        rel = d * rng.beta(1.3, 2.2, cnt)
        amps = amp_jitter(rng, 0.55, cnt) * (0.3 + 0.7 * np.exp(-rel / (0.5 * d)))
        scatter(seg, rng, rel, amps, bank)
        body = np.zeros(m)
        body[:k] = white(rng, k) * window_env(k, 0.004, 0.6 * d)
        crunch = bandpass(seg + 0.3 * body, rng.uniform(1800, 2600), rng.uniform(5200, 6500))
        thump = shaped_noise(rng, m, 60, 260) * ad_env(m, 0.003, 0.03)
        place(out, pk(crunch) + 0.28 * pk(thump), t0, db_to_lin(rng.uniform(-2.5, 0.0)))
    return out


def snow_window(rng, dur):
    n = ns(dur)
    t = tvec(n)
    shared = slow_noise(rng, n, 0.25)
    chans = []
    for c in range(2):
        g = _gust(rng, n, shared, 0.25, 0.45)
        base = shaped_noise(rng, n, 60, 450, order=3, tilt=-4) * g
        cavity = shaped_noise(rng, n, 190, 330, order=3) * g * 0.35
        air = shaped_noise(rng, n, 400, 3000, tilt=-8) * 0.05 * g
        chans.append((base + cavity + air) * (1.0 if c == 0 else 1.12))
    out = np.column_stack(chans)
    for t0 in (2.6, 5.4, 8.3):
        f0 = rng.uniform(900, 1500)
        tick = modal(ns(0.15), [f0, 2.1 * f0], [1.0, 0.4], [0.012, 0.008], rng, 0.01)
        place(out, tick, t0, 0.9, pan=0.35)
    m = ns(0.22)
    f = np.linspace(1100, 1350, m)
    creak = svf_bandpass(white(rng, m), f, 14.0) * (1 + 0.8 * np.sin(TWO_PI * 38 * tvec(m)))
    place(out, pk(creak) * np.hanning(m), 6.7, 0.8, pan=0.4)
    return out


def _breeze_channel(rng, n, shared):
    g = _gust(rng, n, shared, 0.4, 0.35)
    g2 = g ** 1.4 / np.mean(g ** 1.4)
    body = shaped_noise(rng, n, 150, 2500, tilt=-4) * g
    leaf = shaped_noise(rng, n, 2200, 6000) * g2 * lognorm_mod(rng, n, 22, 0.55) * 0.06
    return body + leaf


def _bird(rng, f0, count, gap):
    parts = []
    for i in range(count):
        d, f, r = rng.uniform(0.09, 0.14), f0 * rng.uniform(0.95, 1.05), rng.uniform(1.25, 1.5)
        c = chirp(d, f, f * r) + 0.12 * chirp(d, 2 * f, 2 * f * r)
        parts.append((c, 1.0 - 0.1 * i, i * gap))
    return lowpass(mix(ns(count * gap + 0.2), parts), 6500, 2)


def spring_breeze(rng, dur):
    n = ns(dur)
    shared = slow_noise(rng, n, 0.4)
    out = np.column_stack([_breeze_channel(rng, n, shared) for _ in range(2)])
    for t0, f0, count, pan in ((3.1, 2900, 3, -0.5), (7.0, 3400, 2, 0.4)):
        b = _bird(rng, f0, count, 0.19)
        place(out, b, t0, 0.6, pan=pan)
        place(out, lowpass(b, 3000, 2), t0 + 0.12, 0.14, pan=-pan * 0.5)
    return out


def room_tone_seedroom(rng, dur):
    n = ns(dur)
    air = shaped_noise(rng, n, 60, 4500, order=2, tilt=-6) * 0.3
    hiss = shaped_noise(rng, n, 4000, 8000) * 0.012
    rumble = shaped_noise(rng, n, 25, 110) * lognorm_mod(rng, n, 0.2, 0.3) * 0.35
    wind = shaped_noise(rng, n, 120, 900, tilt=-3) * lognorm_mod(rng, n, 0.25, 0.5) * 0.5
    return air + hiss + rumble + wind


SOUNDS = [
    Sound("wind_winter", 8.0, "冬天黄土高原的风：带通噪声缓慢起伏的呼啸，偶有高频哨音，左右声道去相关，可循环",
          wind_winter, stereo=True, loop=True, ambient=True, centroid=(150, 1300)),
    Sound("snow_steps", 2.4, "雪地踩踏四步：每步为密集颗粒噪声爆发的“咯吱”声，间隔约0.55秒",
          snow_steps, centroid=(2500, 5500)),
    Sound("snow_window", 10.0, "窗外下雪：非常轻柔的风，偶有窗框细响",
          snow_window, stereo=True, ambient=True, centroid=(60, 900)),
    Sound("spring_breeze", 10.0, "早春田野的微风，远处一两声克制的鸟鸣",
          spring_breeze, stereo=True, ambient=True, centroid=(300, 2500)),
    Sound("room_tone_seedroom", 20.0, "种子室安静的房间声：极轻的底噪和远处很轻的风，可循环",
          room_tone_seedroom, loop=True, ambient=True, centroid=(80, 1500)),
]
