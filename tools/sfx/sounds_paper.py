"""纸与颗粒：翻页、纸袋、倒谷、谷粒洒落、炭笔、毛笔。"""
import numpy as np

from dsp_basic import (ad_env, amp_jitter, lognorm_mod, lowpass, mix, ns, peak_norm as pk,
                       place, ramp, shaped_noise, tvec, velocity)
from dsp_grain import (noise_grain_bank, poisson_times, scatter, stroke_cloud,
                       tick_bank)
from dsp_synth import burst, modal, reverb
from sfx_types import Sound


def _gauss(n, center, width):
    return np.exp(-0.5 * ((tvec(n) - center) / width) ** 2)


def paper_flip(rng, dur):
    n = ns(dur)
    fiber = lognorm_mod(rng, n, 150, 0.5)
    low = shaped_noise(rng, n, 90, 600) * _gauss(n, 0.30, 0.12)
    mid = shaped_noise(rng, n, 600, 3000) * _gauss(n, 0.28, 0.10) * fiber
    hi = shaped_noise(rng, n, 2000, 6000) * _gauss(n, 0.34, 0.07) * fiber
    out = 0.7 * pk(low) + 0.8 * pk(mid) + 0.35 * pk(hi)
    bank = noise_grain_bank(rng, 32, ms=(2.0, 6.0), lo=(1500, 3000), hi=6500)
    times = poisson_times(rng, lambda t: 250 * np.exp(-0.5 * ((t - 0.3) / 0.13) ** 2), 0.05, 0.62)
    scatter(out, rng, times, 0.25 * amp_jitter(rng, 0.5, times.size), bank)
    place(out, burst(rng, 0.1, 150, 1500, tau=0.025), 0.58, 0.55)
    return reverb(lowpass(out, 8000, 2), rng, 0.15, 0.08)


def bag_tip(rng, dur):
    n = ns(dur)
    out = np.zeros(n)
    fine = noise_grain_bank(rng, 40, ms=(1.0, 4.0), lo=(1200, 2500), hi=6000)
    coarse = noise_grain_bank(rng, 24, ms=(5.0, 15.0), lo=800, hi=(3000, 4500))
    for lo, hi, dens in ((0.02, 0.30, 400), (0.36, 0.55, 120)):
        t = poisson_times(rng, lambda x: dens * np.hanning(x.size) ** 0.5, lo, hi)
        scatter(out, rng, t, 0.4 * amp_jitter(rng, 0.5, t.size), fine)
        t = poisson_times(rng, lambda x: dens * 0.08 * np.ones(x.size), lo, hi)
        scatter(out, rng, t, 0.5 * amp_jitter(rng, 0.4, t.size), coarse)
    thud = mix(ns(0.3), [(pk(modal(ns(0.3), [95.0, 140.0, 215.0], [1, .7, .4], [.05, .04, .03],
                                   rng, .02)), 1.0),
                         (pk(shaped_noise(rng, ns(0.3), 50, 420, order=2) * ad_env(ns(0.3), .001, .02)), .5),
                         (burst(rng, 0.03, 600, 3500, tau=0.008), 0.3)])
    place(out, thud, 0.30, 1.6)
    return reverb(out, rng, 0.12, 0.1)


def grain_pour_bag(rng, dur):
    n = ns(dur)
    t0, t1 = 0.05, 2.65
    flow = lambda t: 2600 * np.exp(-(t - t0) / 0.95) + 120
    bank = noise_grain_bank(rng, 64, ms=(1.0, 3.0), lo=(1500, 4000), hi=(4500, 8000))
    out = np.zeros(n)
    times = poisson_times(rng, flow, t0, t1)
    amps = amp_jitter(rng, 0.5, times.size) * (0.35 + 0.65 * flow(times) / 2720)
    scatter(out, rng, times, amps, bank)
    out = pk(out) * 0.7
    env = np.interp(tvec(n), [0, t0, t0 + 0.2, 1.2, 2.2, t1, dur], [0, 0, 1, .55, .22, .08, 0])
    out += 0.4 * pk(shaped_noise(rng, n, 50, 320) * lognorm_mod(rng, n, 14, 0.5)) * env
    crink = noise_grain_bank(rng, 16, ms=(5.0, 15.0), lo=700, hi=(2500, 3500))
    ct = poisson_times(rng, lambda t: 6 * np.interp(t, tvec(n), env), t0, t1)
    scatter(out, rng, ct, 0.25 * amp_jitter(rng, 0.4, ct.size), crink)
    place(out, pk(modal(ns(0.2), [120.0, 180.0], [1, .6], [.04, .03], rng, .02)), t0, 0.3)
    return reverb(lowpass(out, 9000, 2), rng, 0.1, 0.1)


def grains_spill(rng, dur):
    n = ns(dur)
    out = np.zeros(n)
    ticks = tick_bank(rng, 48, freq=(900, 3600), tau_ms=(1.5, 5.0))
    hiss = noise_grain_bank(rng, 32, ms=(1.0, 3.0), lo=(1500, 3000), hi=(5000, 8000))
    dense = poisson_times(rng, lambda t: 3500 * np.exp(-(t - 0.02) / 0.18), 0.02, 0.6)
    scatter(out, rng, dense, 0.5 * amp_jitter(rng, 0.6, dense.size), ticks)
    scatter(out, rng, dense, 0.25 * amp_jitter(rng, 0.5, dense.size), hiss)
    starts = poisson_times(rng, lambda t: 28 * np.exp(-(t - 0.3) / 0.8), 0.3, 2.3)
    for t in starts:
        g = ticks[rng.integers(len(ticks))]
        gap, amp, tt = rng.uniform(0.03, 0.09), rng.uniform(0.35, 0.7), t
        while gap > 0.0015 and amp > 0.03 and tt < dur - 0.1:
            place(out, g, tt, amp)
            tt += gap
            gap *= rng.uniform(0.65, 0.78)
            amp *= rng.uniform(0.55, 0.72)
        if rng.random() < 0.4 and tt < dur - 0.6:
            m = ns(rng.uniform(0.15, 0.5))
            roll = pk(shaped_noise(rng, m, 300, 1800, order=2) * lognorm_mod(rng, m, 90, 0.7))
            place(out, roll * ad_env(m, 0.02, 0.15), tt, rng.uniform(0.04, 0.1))
    place(out, pk(modal(ns(0.3), [110.0, 185.0], [1, .6], [.04, .03], rng, .02)), 0.0, 0.3)
    return reverb(lowpass(out, 9000, 2), rng, 0.2, 0.1)


def charcoal_scratch(rng, dur):
    n = ns(dur)
    grains, rasp = np.zeros(n), np.zeros(n)
    bank = noise_grain_bank(rng, 64, ms=(0.4, 1.6), lo=(1200, 2500), hi=(4500, 7500))
    for t0, d, peak in ((0.10, 0.28, 0.4), (0.55, 0.30, 0.6), (0.95, 0.42, 0.35), (1.45, 0.25, 0.5)):
        stroke_cloud(grains, rng, t0, d, 4500, bank, peakpos=peak, power=1.2)
        m = ns(d)
        body = pk(shaped_noise(rng, m, 600, 3500, order=2) * lognorm_mod(rng, m, 200, 0.6))
        place(rasp, body * velocity(m, peak), t0)
    return reverb(lowpass(pk(grains) + 0.35 * pk(rasp), 8000, 2), rng, 0.08, 0.06)


def paper_brush(rng, dur):
    n = ns(dur)
    out = np.zeros(n)
    bank = noise_grain_bank(rng, 32, ms=(3.0, 8.0), lo=1200, hi=(3000, 4000))
    for t0, d, peak in ((0.12, 0.68, 0.45), (0.88, 0.42, 0.3)):
        m = ns(d)
        v = velocity(m, peak)
        hiss = pk(shaped_noise(rng, m, 500, 3000, order=2, tilt=-3) * lognorm_mod(rng, m, 60, 0.3))
        place(out, hiss * v ** 0.8 * ramp(m, 0.04), t0, 0.5)
        place(out, pk(shaped_noise(rng, ns(0.12), 60, 350) * ad_env(ns(0.12), .005, .03)), t0, 0.22)
        times = poisson_times(rng, lambda t: 35 * np.ones(t.size), t0 + 0.05, t0 + d - 0.05)
        scatter(out, rng, times, 0.15 * amp_jitter(rng, 0.5, times.size), bank)
    return reverb(out, rng, 0.15, 0.08)


SOUNDS = [
    Sound("paper_flip", 0.8, "翻一页旧纸：纸张摩擦的宽带噪声扫过，带一点低频“呼”",
          paper_flip, centroid=(800, 5000)),
    Sound("bag_tip", 0.7, "纸袋歪倒：纸的皱响，随后一下闷闷的落桌声",
          bag_tip, centroid=(300, 5000)),
    Sound("grain_pour_bag", 2.8, "干谷粒倒进牛皮纸袋的“沙沙”声：大量小颗粒碰撞，密度先大后小，带纸袋的低频轻微鼓动",
          grain_pour_bag, centroid=(2000, 7000)),
    Sound("grains_spill", 3.0, "一小股谷粒倒在木桌上滚开：先是密集倾泻，随后一粒粒在木头上弹跳、滚动，慢慢停止",
          grains_spill, centroid=(1500, 5500)),
    Sound("charcoal_scratch", 2.0, "炭笔在粗纸上快速划线的沙沙声，几道笔触",
          charcoal_scratch, centroid=(2500, 7500)),
    Sound("paper_brush", 1.5, "毛笔在宣纸上运笔，纸张轻响",
          paper_brush, centroid=(800, 3500)),
]
