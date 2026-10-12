"""手工与器物：陶土、刻刀、壁画剥落、竹简、龟甲、编钟。"""
import numpy as np

from dsp_basic import (amp_jitter, lognorm_mod, lowpass, mix, ns, peak_norm as pk, place, ramp,
                       shaped_noise, tvec, velocity, window_env)
from dsp_grain import (noise_grain_bank, poisson_times, scatter, stroke_cloud, tick_bank)
from dsp_synth import burst, chirp, modal, reverb
from sfx_types import Sound

RUB_PERIOD = 0.34
BAMBOO_RATIOS = np.array([1.0, 2.76, 5.40, 8.93])   # 自由-自由梁的模态比
BAMBOO_AMPS = (1.0, 0.5, 0.25, 0.12)
BELL_F0 = 220.0
BELL_RATIOS = (1.0, 2.4, 3.9, 5.4, 6.8, 8.3, 9.9)
BELL_AMPS = (1.0, 0.75, 0.55, 0.45, 0.3, 0.2, 0.12)
BELL_T60 = (4.2, 3.2, 2.4, 1.7, 1.2, 0.8, 0.5)
LN1000 = 6.9078


def clay_rub(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    active = np.zeros(n)
    k = ns(1.0)
    active[:k] = window_env(k, 0.05, 0.25)
    v = np.abs(np.sin(np.pi * t / RUB_PERIOD)) * active
    fric = shaped_noise(rng, n, 120, 1400, order=2, tilt=-3) * lognorm_mod(rng, n, 35, 0.7)
    out = pk(lowpass(fric, 2500, 2)) * v ** 0.9
    for tt in poisson_times(rng, lambda x: 14 * np.interp(x, t, v), 0.05, 0.95):
        f = rng.uniform(300, 900)
        place(out, chirp(0.02, f, f * rng.uniform(1.25, 1.6), tau=0.012), tt, 0.3 * amp_jitter(rng, 0.4))
    for k in (1, 2, 3):
        place(out, burst(rng, 0.03, 80, 450, tau=0.006), k * RUB_PERIOD, 0.25)
    return reverb(out, rng, 0.1, 0.06)


def knife_carve(rng, dur):
    n, m = ns(dur), ns(0.45)
    wood = modal(ns(0.4), [180.0, 420.0, 960.0], [1, .7, .4], [.045, .03, .02], rng, .02)
    hit = mix(ns(0.4), [(pk(wood), 1.0), (burst(rng, 0.006, 1500, 8000, tau=0.001), 0.7),
                        (pk(modal(ns(0.4), [2500.0], [1.0], [0.003])), 0.3)])
    bank = noise_grain_bank(rng, 48, ms=(1.0, 4.0), lo=(800, 2000), hi=(4000, 6500))
    scrape = np.zeros(m)
    stroke_cloud(scrape, rng, 0.0, 0.45, 450, bank, peakpos=0.3, power=1.0)
    resist = pk(shaped_noise(rng, m, 300, 1200, order=2) * lognorm_mod(rng, m, 100, 0.7)) * velocity(m, 0.3)
    out = mix(n, [(hit, 1.0, 0.08), (pk(scrape), 0.45, 0.11), (resist, 0.25, 0.11),
                  (burst(rng, 0.004, 1200, 7000, tau=0.001), 0.25, 0.57)])
    chips = tick_bank(rng, 4, freq=(900, 2200), tau_ms=(2.0, 4.0))
    for g, tt in zip(chips, (0.62, 0.74, 0.83, 0.95)):
        place(out, g, tt, rng.uniform(0.15, 0.3))
    return reverb(lowpass(out, 8000, 2), rng, 0.2, 0.1)


def plaster_crumble(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    out = np.zeros(n)
    bank = (noise_grain_bank(rng, 48, ms=(1.0, 4.0), lo=(1500, 3500), hi=(5000, 8000))
            + tick_bank(rng, 48, freq=(1500, 4500), tau_ms=(0.6, 2.5), partial=0.1))
    rate = lambda x: 20 + 160 * np.exp(-(x - 0.1) / 0.6)
    times = poisson_times(rng, rate, 0.1, dur - 0.05)
    for c in rng.uniform(0.3, 1.5, 5):          # 一小片掉落引发的连串碎屑
        times = np.concatenate([times, c + rng.uniform(0.0, 0.06, rng.integers(8, 20))])
    scatter(out, rng, times, 0.5 * amp_jitter(rng, 0.6, times.size), bank)
    for tt in rng.uniform(0.3, 1.7, 6):
        place(out, burst(rng, 0.05, 150, 800, tau=0.012), tt, 0.2)
    dust_env = rate(np.maximum(t, 0.1)) / rate(np.array([0.1])) * ramp(n, 0.1)
    out += 0.05 * shaped_noise(rng, n, 2500, 7000) * lognorm_mod(rng, n, 40, 0.6) * dust_env
    place(out, burst(rng, 0.01, 1500, 7000, tau=0.002), 0.05, 0.7)
    place(out, tick_bank(rng, 1, freq=(3000, 3400))[0], 0.05, 0.4)
    return reverb(lowpass(out, 8500, 2), rng, 0.2, 0.08)


def _bamboo_hit(rng):
    f0 = np.exp(rng.uniform(np.log(850), np.log(2200)))
    tau0, m = rng.uniform(0.012, 0.03), ns(0.2)
    taus = tau0 / (1.0 + 0.8 * np.arange(BAMBOO_RATIOS.size))
    ring = modal(m, f0 * BAMBOO_RATIOS, BAMBOO_AMPS, taus, rng, 0.005)
    return mix(m, [(pk(ring), 1.0), (burst(rng, 0.004, 2000, 9000, tau=0.0006), 0.3)])


def bamboo_slips(rng, dur):
    n = ns(dur)
    out = np.zeros(n)
    rate = lambda x: 36 * np.exp(-0.5 * ((x - 0.45) / 0.3) ** 2) + 4
    for tt in poisson_times(rng, rate, 0.03, 1.15):
        g = 0.5 * amp_jitter(rng, 0.45)
        place(out, _bamboo_hit(rng), tt, g)
        if rng.random() < 0.25:
            place(out, _bamboo_hit(rng), tt + rng.uniform(0.008, 0.025), 0.6 * g)
    k = ns(0.7)
    rustle = pk(shaped_noise(rng, k, 900, 4500) * lognorm_mod(rng, k, 40, 0.9)) * window_env(k, 0.05, 0.3)
    place(out, rustle, 0.0, 0.05 * np.max(np.abs(out)))
    return reverb(out, rng, 0.18, 0.12)


def bone_crack(rng, dur):
    n, t0, m = ns(dur), 0.06, ns(0.3)
    crack = mix(m, [(burst(rng, 0.02, 900, 6000, tau=0.003, attack=0.0001), 1.0),
                    (pk(modal(m, [2100.0, 3300.0, 4800.0], [1, .7, .45], [.012, .008, .005], rng, .01)), 0.7),
                    (pk(modal(m, [560.0, 880.0], [1, .6], [.015, .01], rng, .02)), 0.5)])
    out = np.zeros(n)
    place(out, crack, t0)
    bank = tick_bank(rng, 24, freq=(1500, 4500), tau_ms=(0.8, 2.5), noise=0.4, partial=0.1)
    times = t0 + 0.03 + poisson_times(rng, lambda x: 60 * np.exp(-x / 0.18) + 6, 0.0, 0.5)
    amps = 0.35 * np.exp(-(times - t0) / 0.25) * amp_jitter(rng, 0.5, times.size)
    scatter(out, rng, times, amps, bank)
    place(out, burst(rng, 0.6, 2000, 5500, tau=0.3, attack=0.01), t0, 0.04)
    return reverb(lowpass(out, 8000, 2), rng, 0.12, 0.08)


def bronze_bell(rng, dur):
    n = ns(dur)
    freqs, amps, taus = [], [], []
    for r, a, t60 in zip(BELL_RATIOS, BELL_AMPS, BELL_T60):
        beat = rng.uniform(0.6, 2.2)            # 编钟正侧鼓音的双音拍频
        for df, ga, gt in ((0.0, 1.0, 1.0), (beat, 0.8, 0.9)):
            freqs.append(BELL_F0 * r + df)
            amps.append(a * ga)
            taus.append(t60 * gt / LN1000)
    freqs.append(BELL_F0 * 0.5)                  # 低八度的嗡鸣
    amps.append(0.25)
    taus.append(2.5 / LN1000)
    ring = modal(n, freqs, amps, taus, rng, jitter=0.002, attack=0.002)
    clack = modal(n, [1500.0, 2300.0], [1, .6], [.004, .003], rng, .01)
    thunk = modal(n, [330.0], [1.0], [0.03])
    out = mix(n, [(pk(ring), 1.0), (burst(rng, 0.012, 800, 6000, tau=0.002), 0.35),
                  (pk(clack), 0.3), (pk(thunk), 0.3)])
    return reverb(out, rng, 0.9, 0.18, lp_hz=6000)


SOUNDS = [
    Sound("clay_rub", 1.2, "手指揉搓陶土的湿润摩擦声，低沉",
          clay_rub, centroid=(150, 1500)),
    Sound("knife_carve", 1.2, "刻刀落在木板上刻一刀：短促硬瞬态加木屑刮擦",
          knife_carve, centroid=(500, 4500)),
    Sound("plaster_crumble", 2.0, "壁画颜料层剥落掉渣的细碎声",
          plaster_crumble, centroid=(2000, 7000)),
    Sound("bamboo_slips", 1.5, "竹简散开、竹片互相碰撞的清脆声",
          bamboo_slips, centroid=(1200, 5000)),
    Sound("bone_crack", 1.0, "龟甲被灼烧裂开的“咔”一声，随后细碎裂纹蔓延的小噼啪",
          bone_crack, centroid=(1000, 6000)),
    Sound("bronze_bell", 4.0, "编钟一击：青铜非谐波模态合成，基频约220Hz，长衰减，带拍频",
          bronze_bell, centroid=(300, 2500)),
]
