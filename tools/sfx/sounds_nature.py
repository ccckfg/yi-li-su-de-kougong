"""火、水、土与过渡：火堆、急推嗖声、浇水、渗水气泡、种子裂开。"""
import numpy as np

from dsp_basic import (amp_jitter, lognorm_mod, lowpass, mix, ns, peak_norm as pk, place, ramp,
                       shaped_noise, tvec, white, window_env)
from dsp_grain import noise_grain_bank, poisson_times, scatter, tick_bank
from dsp_synth import burst, chirp, modal, reverb, svf_bandpass
from sfx_types import Sound


def _flame(rng, n):
    roar = shaped_noise(rng, n, 35, 380, order=3, tilt=-3) * lognorm_mod(rng, n, 2.5, 0.45)
    flicker = shaped_noise(rng, n, 380, 2200, tilt=-6) * lognorm_mod(rng, n, 14, 0.7) * 0.22
    return roar + flicker


def fire_crackle(rng, dur):
    n = ns(dur)
    out = 0.7 * np.column_stack([_flame(rng, n) for _ in range(2)])
    pops = noise_grain_bank(rng, 32, ms=(1.0, 4.0), lo=(1500, 3500), hi=(5000, 9000))
    snaps = tick_bank(rng, 32, freq=(700, 2600), tau_ms=(3.0, 9.0), noise=0.35)
    cracks = [pk(modal(ns(0.06), [rng.uniform(300, 600), rng.uniform(1200, 2500)], [1, .6],
                       [.015, .006])) for _ in range(6)]
    for t in poisson_times(rng, lambda x: 11 * (1 + 0.5 * np.sin(0.9 * x)), 0.0, dur - 0.05):
        r = rng.random()
        bank = pops if r < 0.6 else snaps if r < 0.9 else cracks
        amp, pan = 1.5 * amp_jitter(rng, 0.8, cap=3.0), rng.uniform(-0.8, 0.8)
        place(out, bank[rng.integers(len(bank))], t, amp, pan=pan)
        if rng.random() < 0.25:                  # 一次爆裂带出的几下余响
            for k in range(rng.integers(2, 5)):
                place(out, pops[rng.integers(len(pops))], t + rng.uniform(0.003, 0.03),
                      amp * 0.5 ** (k + 1), pan=pan)
    return out


def whoosh_zoom(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    u = np.clip((t - 0.04) / 0.64, 0.0, 1.0)
    f = 200.0 * (4000.0 / 200.0) ** (u ** 1.3)
    body = pk(svf_bandpass(white(rng, n), f, 3.0))
    sheen = pk(svf_bandpass(white(rng, n), f * 1.15, 7.0))
    fall = np.where(t < 0.68, 1.0, 0.5 + 0.5 * np.cos(np.pi * np.clip((t - 0.68) / 0.09, 0.0, 1.0)))
    out = (body + 0.3 * sheen) * (0.04 + u ** 2.2) * ramp(n, 0.04) * fall
    return lowpass(out, 5500, 2)


def water_pour_soil(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    flow = np.clip(lowpass(np.interp(t, [0, .12, .5, 2.0, 2.45, 2.7, dur], [0, 0, 1, .95, .3, .05, 0]), 4, 2), 0, None)
    water = shaped_noise(rng, n, 400, 6000, order=2, tilt=-4) * lognorm_mod(rng, n, 45, 0.35)
    out = 0.8 * pk(water) * flow
    spray = noise_grain_bank(rng, 32, ms=(1.0, 2.5), lo=2500, hi=8000)
    st = poisson_times(rng, lambda x: 600 * np.interp(x, t, flow), 0.1, 2.8)
    scatter(out, rng, st, 0.1 * amp_jitter(rng, 0.5, st.size), spray)
    for tt in poisson_times(rng, lambda x: 13 * np.interp(x, t, flow) ** 0.7, 0.2, 2.6):
        f, m = rng.uniform(90, 220), ns(0.15)
        thump = mix(m, [(pk(modal(m, [f], [1.0], [0.022])), 1.0), (burst(rng, 0.08, 60, 420, tau=0.02), 0.7)])
        place(out, thump, tt, 0.35 * amp_jitter(rng, 0.4))
    tink = modal(ns(0.3), [1100.0, 2750.0, 4400.0], [1, .6, .4], [.04, .025, .015], rng, .01)
    place(out, pk(tink), 0.04, 0.25)
    place(out, pk(tink), 0.09, 0.15)
    for tt in poisson_times(rng, lambda x: 7 * np.clip((2.9 - x) / 0.7, 0, 1), 2.1, 2.9):
        f = rng.uniform(500, 900)
        place(out, chirp(0.03, f, f * 1.5, tau=0.01), tt, 0.25)
    return reverb(out, rng, 0.15, 0.08)


def soil_soak(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    out = np.zeros(n)
    for tt in poisson_times(rng, lambda x: 22 * np.exp(-0.5 * ((x - 0.8) / 0.6) ** 2) + 2, 0.05, 2.4):
        f0 = np.exp(rng.uniform(np.log(900), np.log(3600)))   # 气泡越小音越高、衰减越快
        bubble = chirp(0.03, f0, f0 * rng.uniform(1.1, 1.5), tau=0.0045 * (2000.0 / f0) ** 0.8)
        pop = burst(rng, 0.004, 1500, 7000, tau=0.0006)
        place(out, mix(ns(0.03), [(bubble, 1.0), (pop, 0.15)]), tt, 0.5 * amp_jitter(rng, 0.6))
    seep = shaped_noise(rng, n, 2500, 7000) * lognorm_mod(rng, n, 40, 0.8)
    out += 0.02 * seep * window_env(n, 0.3, 0.6)
    crumbs = tick_bank(rng, 6, freq=(800, 2500), tau_ms=(2.0, 4.0))
    scatter(out, rng, np.sort(rng.uniform(0.2, 2.2, 6)), np.full(6, 0.15), crumbs)
    return reverb(out, rng, 0.12, 0.06)


def seed_crack(rng, dur):
    n = ns(dur)
    out = mix(n, [(burst(rng, 0.003, 2500, 7500, tau=0.0007, attack=0.0001), 1.0, 0.08),
                  (burst(rng, 0.03, 1500, 3500, tau=0.012, attack=0.002), 0.5, 0.082),
                  (pk(modal(ns(0.05), [300.0], [1.0], [0.01])), 0.15, 0.08),
                  (burst(rng, 0.003, 3000, 8000, tau=0.0007, attack=0.0001), 0.4, 0.125),
                  (burst(rng, 0.03, 1500, 3500, tau=0.012, attack=0.002), 0.15, 0.127),
                  (burst(rng, 0.2, 800, 2500, tau=0.04, attack=0.01), 0.1, 0.09)])
    return reverb(out, rng, 0.06, 0.05)


SOUNDS = [
    Sound("fire_crackle", 6.0, "火光映照龟甲的火堆噼啪：低频火焰呼呼声加随机爆裂颗粒，立体声",
          fire_crackle, stereo=True, ambient=True, centroid=(100, 3500)),
    Sound("whoosh_zoom", 1.0, "急推镜头的“嗖”：上扬的带通噪声扫频，从200Hz到4kHz，结尾收得很干净",
          whoosh_zoom, centroid=(500, 4000)),
    Sound("water_pour_soil", 3.0, "铁皮水壶浇水落在土上：水流的宽带噪声加落土的低频噗噗声",
          water_pour_soil, centroid=(800, 5500)),
    Sound("soil_soak", 2.5, "水渗进土里冒小气泡：稀疏的细小气泡破裂声",
          soil_soak, centroid=(1500, 6000)),
    Sound("seed_crack", 0.6, "种子露白时极轻的一声细裂：非常小、亲密",
          seed_crack, centroid=(1500, 7000)),
]
