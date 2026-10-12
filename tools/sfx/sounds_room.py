"""室内拟音：敲门、碗、玻璃杯、档案夹、笔尖、墨滴。"""
import numpy as np

from dsp_basic import (ad_env, lognorm_mod, mix, ns, peak_norm as pk, place, shaped_noise,
                       velocity, window_env)
from dsp_grain import tick_bank
from dsp_synth import burst, chirp, modal, reverb
from sfx_types import Sound


def knock_wood(rng, dur):
    n, m = ns(dur), ns(0.5)
    freqs = np.array([128.0, 187.0, 243.0, 312.0, 391.0])
    amps = np.array([1.0, 0.8, 0.55, 0.4, 0.25])
    taus = np.array([0.11, 0.085, 0.065, 0.05, 0.035])
    out = np.zeros(n)
    for t0, gain in ((0.05, 1.0), (0.05 + rng.uniform(0.37, 0.39), 0.6)):
        body = modal(m, freqs, amps * rng.uniform(0.75, 1.25, freqs.size), taus, rng, jitter=0.012)
        hit = mix(m, [(pk(body), 1.0), (pk(modal(m, [78.0], [1.0], [0.03])), 0.5),
                      (burst(rng, 0.02, 300, 2200, tau=0.003), 0.35),
                      (pk(modal(m, [1250.0], [1.0], [0.003])), 0.2)])
        place(out, hit, t0, gain * rng.uniform(0.95, 1.05))
    return reverb(out, rng, 0.18, 0.15)


def bowl_lift(rng, dur):
    n, m = ns(dur), ns(0.24)
    fr = shaped_noise(rng, m, 500, 3200, order=2) * lognorm_mod(rng, m, 120.0, 0.6)
    fr = pk(fr) * window_env(m, 0.06, 0.1)
    modes = [640.0, 905.0, 1380.0, 1760.0, 2330.0]
    tok = mix(ns(0.4), [(pk(modal(ns(0.4), modes, [1, .8, .6, .35, .25], [.07, .05, .04, .03, .02],
                                  rng, .01)), 1.0),
                        (burst(rng, 0.01, 800, 5000, tau=0.0015), 0.5),
                        (pk(modal(ns(0.4), [220.0], [1.0], [0.09])), 0.35)])
    out = mix(n, [(fr, 0.22, 0.03), (tok, 1.0, 0.27), (tok, 0.22, 0.34)])
    return reverb(out, rng, 0.25, 0.15)


def glass_slide(rng, dur):
    n, d, t0 = ns(dur), 0.8, 0.05
    m = ns(d)
    speed = velocity(m, 0.35) ** 0.8 * window_env(m, 0.04, 0.08)
    rub = pk(shaped_noise(rng, m, 70, 900, order=3) * lognorm_mod(rng, m, 70, 0.55)) * speed
    sheen = pk(shaped_noise(rng, m, 1500, 4500)) * speed ** 1.5
    stop = pk(modal(ns(0.2), [310.0, 1250.0, 2650.0], [1, .6, .35], [.03, .015, .01], rng, .01))
    out = mix(n, [(rub, 0.5, t0), (sheen, 0.08, t0), (stop, 0.5, t0 + d - 0.02)])
    for t, g in ((0.18, .3), (0.38, .45), (0.60, .5), (0.84, .55), (0.92, .45), (0.97, .2)):
        f = rng.uniform(150, 400)
        slosh = chirp(0.18, f, f * 1.15, tau=0.07)
        water = shaped_noise(rng, ns(0.18), 80, 500, order=2) * ad_env(ns(0.18), 0.004, 0.05)
        place(out, pk(slosh) + 0.3 * pk(water), t, g)
    return reverb(out, rng, 0.2, 0.08)


def folder_close(rng, dur):
    n = ns(dur)
    body = modal(ns(0.3), [140.0, 205.0, 330.0, 480.0], [1, .7, .5, .3],
                 [.035, .03, .022, .015], rng, .02)
    thump = shaped_noise(rng, ns(0.2), 40, 250, order=2) * ad_env(ns(0.2), 0.001, 0.02)
    air_in = pk(shaped_noise(rng, ns(0.11), 500, 3000)) * window_env(ns(0.11), 0.07, 0.01)
    out = mix(n, [(air_in, 0.2, 0.0),
                  (burst(rng, 0.06, 250, 2200, tau=0.012, attack=0.0003), 1.0, 0.11),
                  (pk(body), 0.8, 0.11), (pk(thump), 0.6, 0.11),
                  (burst(rng, 0.03, 400, 2500, tau=0.006), 0.3, 0.16),
                  (burst(rng, 0.2, 500, 2500, tau=0.07, attack=0.01), 0.12, 0.115)])
    return reverb(out, rng, 0.2, 0.12)


def pen_tap(rng, dur):
    n = ns(dur)
    bank = tick_bank(rng, 2, freq=(700, 1100), tau_ms=(3.0, 5.0))
    out = mix(n, [(burst(rng, 0.004, 1500, 6000, tau=0.0008), 0.8, 0.02),
                  (bank[0], 0.55, 0.02),
                  (pk(modal(ns(0.1), [180.0], [1.0], [0.01])), 0.3, 0.02),
                  (burst(rng, 0.003, 1800, 6500, tau=0.0007), 0.22, 0.034),
                  (bank[1], 0.15, 0.034)])
    return reverb(out, rng, 0.08, 0.08)


def ink_drop(rng, dur):
    n = ns(dur)
    parts = [(burst(rng, 0.02, 200, 2200, tau=0.004, attack=0.0004), 0.6, 0.03),
             (pk(modal(ns(0.1), [420.0], [1.0], [0.012])), 0.5, 0.03),
             (burst(rng, 0.2, 1000, 3000, tau=0.04, attack=0.004), 0.1, 0.035)]
    for t, g in ((0.055, 0.22), (0.085, 0.14), (0.125, 0.08)):
        f = rng.uniform(1500, 3000)
        parts.append((chirp(0.008, f, f * 1.3, tau=0.003), g, t))
    return reverb(mix(n, parts), rng, 0.1, 0.1)


SOUNDS = [
    Sound("knock_wood", 0.9, "指节敲老木门两下，间隔约0.38秒，第二下略轻",
          knock_wood, centroid=(150, 900)),
    Sound("bowl_lift", 1.0, "粗瓷碗从陶坛口被轻轻掀起：轻微摩擦，随后一下低沉的陶瓷“嗒”",
          bowl_lift, centroid=(400, 2500)),
    Sound("glass_slide", 1.4, "玻璃杯在木桌上被推过去：木面摩擦的低沉噪声，杯中水晃荡的几下低频“咕噜”",
          glass_slide, centroid=(150, 1500)),
    Sound("folder_close", 0.6, "硬纸档案夹合上：纸板拍合的闷响加一点空气声",
          folder_close, centroid=(250, 3500)),
    Sound("pen_tap", 0.25, "钢笔尖轻点纸面：极短的纸面瞬态",
          pen_tap, centroid=(900, 6000)),
    Sound("ink_drop", 0.5, "一滴墨落在纸上：极轻的“嗒”加很短的湿润尾音",
          ink_drop, centroid=(400, 3500)),
]
