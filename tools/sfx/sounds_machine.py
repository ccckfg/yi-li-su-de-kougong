"""机械与电子：台灯、审讯床、放映机、化验音、扫描扫频。"""
import numpy as np

from dsp_basic import (TWO_PI, ad_env, amp_jitter, db_to_lin, lognorm_mod, lowpass, mix, ns,
                       peak_norm as pk, place, shaped_noise, slow_noise, tvec, white,
                       window_env)
from dsp_grain import noise_grain_bank, scatter
from dsp_synth import burst, hum, modal, svf_bandpass
from sfx_config import SR
from sfx_types import Sound

HUM_LAMP = {1: 0.45, 2: 1.0, 3: 0.5, 4: 0.3, 6: 0.15}
TICK_VOICES = (  # “滴”偏高，“答”偏低；(模态频率, 幅度, 衰减 tau, 机壳频率, 擒纵噪声频带, 噪声增益)
    ((2350, 3720, 5110, 6400), (1.0, 0.6, 0.35, 0.18), (0.007, 0.005, 0.004, 0.003), 780, (3500, 9000), 0.5),
    ((1480, 2530, 3800), (1.0, 0.55, 0.3), (0.009, 0.006, 0.004), 640, (1200, 4500), 0.3),
)


def lamp_click(rng, dur):
    n, t0 = ns(dur), 0.05
    metal = modal(ns(0.15), [2150, 3380, 5210, 7340], [1, .8, .6, .4],
                  [.006, .0045, .003, .002], rng, .01)
    body = modal(ns(0.1), [820, 1560], [.8, .4], [.009, .006], rng, .02)
    snap = burst(rng, 0.004, 1500, 9000, tau=.0008)
    ret = modal(ns(0.1), [2600, 4300], [1, .6], [.004, .003], rng, .02)
    out = mix(n, [(pk(metal), .8, t0), (pk(body), .5, t0), (snap, .6, t0), (pk(ret), .3, t0 + .011)])
    th = tvec(n)
    env = np.interp(th, [0, t0 + .008, t0 + .04, t0 + .12, t0 + .35, dur],
                    [0, 0, 1.0, .55, .22, .2])
    return out + 0.12 * lowpass(env, 40, 2) * hum(n, 50.0, HUM_LAMP, rng, th)


def lamp_flicker(rng, dur):
    n = ns(dur)
    gate, edges, t = np.zeros(n), [], 0.04
    while t < 0.40:
        on, off = rng.uniform(.012, .06), rng.uniform(.006, .03)
        gate[min(ns(t), n):min(ns(t + on), n)] = rng.uniform(.5, 1.0)
        edges += [t, t + on]
        t += on + off
    gate = lowpass(gate, 300, 2)
    hm = hum(n, 50.0, {1: .4, 2: 1.0, 3: .7, 4: .5, 6: .35, 8: .2}, rng) * gate
    arc = shaped_noise(rng, n, 150, 2500, order=2) * gate ** 2 * 0.2
    out = 0.5 * hm / np.abs(hm).max() + arc
    times = np.concatenate([edges, rng.uniform(0.04, 0.45, 6)])
    bank = noise_grain_bank(rng, 24, ms=(0.6, 3.0), lo=(1500, 3000), hi=(5000, 8000))
    scatter(out, rng, times, amp_jitter(rng, 0.45, times.size) * 0.9, bank)
    return out


def _tick(rng, voice):
    freqs, amps, taus, body_f, (lo, hi), esc_gain = TICK_VOICES[voice]
    ring = modal(ns(0.12), freqs, amps, taus, rng, 0.004)
    case = modal(ns(0.12), [body_f], [1.0], [0.02])
    esc = burst(rng, 0.003, lo, hi, tau=0.0007)
    return mix(ns(0.12), [(pk(ring), 1.0), (pk(case), .3), (esc, esc_gain)])


def interrogation_bed(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    drone = np.zeros(n)
    for f, a, pm_cyc, am_cyc in ((38.0, 1.0, 3, 4), (42.5, .7, 5, 7), (47.0, .55, 7, 11), (55.0, .35, 4, 5)):
        # f*dur 与调制周期数均为整数，保证 60 秒首尾相接
        wander = 0.35 * np.sin(TWO_PI * pm_cyc / dur * t + rng.uniform(0, TWO_PI))
        swell = 1 + 0.35 * np.sin(TWO_PI * am_cyc / dur * t + rng.uniform(0, TWO_PI))
        drone += a * swell * np.sin(TWO_PI * f * t + rng.uniform(0, TWO_PI) + wander)
    rumble = shaped_noise(rng, n, 25, 110) * lognorm_mod(rng, n, 0.2, 0.35) * 0.5
    room = shaped_noise(rng, n, 150, 4500, order=2, tilt=-3) * 0.06
    bed = drone * (1 + 0.15 * slow_noise(rng, n, 0.15)) + rumble + room
    bed = 0.5 * bed / np.abs(bed).max()
    ticks = np.zeros(n)
    for k in range(int(dur)):
        gain = db_to_lin(rng.uniform(-1.2, 1.2))
        place(ticks, _tick(rng, k % 2), 0.5 + k + rng.uniform(-3e-4, 3e-4), gain, wrap=True)
    return bed + 0.38 * ticks / np.abs(ticks).max()


def _projector_click(rng):
    m = ns(0.04)
    return mix(m, [(burst(rng, 0.0025, 500, 3500, tau=.0008), .45),
                   (pk(modal(m, [1100, 2300], [1, .5], [.004, .003], rng, .01)), .5),
                   (pk(modal(m, [140], [1.0], [.012])), .5)])


def projector(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    motor = np.zeros(n)
    for mult, a in ((48, 1.0), (96, .6), (144, .35), (192, .2), (288, .1)):  # k/6 Hz → 整数周期
        wob = 0.15 * np.sin(TWO_PI * 3 / dur * t + rng.uniform(0, TWO_PI))
        motor += a * np.sin(TWO_PI * mult * t + rng.uniform(0, TWO_PI) + wob)
    motor = 0.3 * motor / np.abs(motor).max() + 0.08 * shaped_noise(rng, n, 90, 600)
    clicks = np.zeros(n)
    for k in range(int(dur * 24)):
        place(clicks, _projector_click(rng), k / 24 + 0.004 + rng.uniform(-1.5e-4, 1.5e-4),
              amp_jitter(rng, 0.1), wrap=True)
    film = (shaped_noise(rng, n, 2500, 7000) * 0.035 * (1 + 0.5 * np.sin(TWO_PI * 24 * t))
            * lognorm_mod(rng, n, 1.0, 0.2))
    return motor + 0.5 * clicks / np.abs(clicks).max() + film


LAB_PARTIALS = (1850, 2437, 3011, 3697)
LAB_DETUNE = (0.7, 1.1, 1.6, 0.9)
LAB_PINGS = ((1.2, 2, 2800), (4.1, 1, 4300), (6.3, 3, 3400), (8.6, 1, 5200))


def _ping(rng, f):
    m = ns(0.2)
    return (np.sin(TWO_PI * f * tvec(m)) + 0.1 * np.sin(TWO_PI * 2 * f * tvec(m))) * ad_env(m, 0.003, 0.022)


def lab_tone(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    pad = np.zeros((n, 2))
    for f, d in zip(LAB_PARTIALS, LAB_DETUNE):
        for c in range(2):
            fc = f + 0.6 * c * rng.uniform(0.5, 1.5)   # 右声道略失谐，左右去相关，避免单声道折叠时抵消
            for fq in (fc, fc + d):
                lfo = 0.55 + 0.45 * np.sin(TWO_PI * t / rng.uniform(5, 11) + rng.uniform(0, TWO_PI))
                pad[:, c] += 0.05 * lfo * np.sin(TWO_PI * fq * t + rng.uniform(0, TWO_PI))
    out = pad
    side = -1.0
    for t0, count, f0 in LAB_PINGS:
        for i in range(count):
            f = f0 * (1.0 + 0.12 * i) * rng.uniform(0.97, 1.03)
            p = _ping(rng, f)
            place(out, p, t0 + 0.08 * i, 0.5, pan=0.6 * side)
            place(out, p, t0 + 0.08 * i + 0.17, 0.12, pan=-0.6 * side)
            side = -side
    return out


def scan_sweep(rng, dur):
    n, t = ns(dur), tvec(ns(dur))
    u = np.clip((t - 0.05) / 1.65, 0.0, 1.0)
    f = 300.0 * (6000.0 / 300.0) ** (u ** 0.9)
    noise = pk(svf_bandpass(white(rng, n), f, 6.0))
    ph = TWO_PI * np.cumsum(0.5 * f * (1 + 0.01 * np.sin(TWO_PI * 5 * t))) / SR
    tone = np.sin(ph) + 0.15 * np.sin(2 * ph)
    env = np.zeros(n)
    a, b = ns(0.04), ns(1.85)
    env[a:b] = window_env(b - a, 0.12, 0.15)
    return (noise * 0.8 + tone * 0.5) * env * (1 + 0.15 * np.sin(TWO_PI * 38 * t))


SOUNDS = [
    Sound("lamp_click", 0.6, "老式台灯拉链开关“啪”一声：清脆的金属塑料咔嗒，随后很轻的50/100Hz电流嗡声起来又压低",
          lamp_click, centroid=(100, 3500)),
    Sound("lamp_flicker", 0.7, "台灯电流不稳闪一下：50Hz电流嗡声断续，夹杂小火花噼啪",
          lamp_flicker, centroid=(500, 6000)),
    Sound("interrogation_bed", 60.0, "审讯段环境床：35-60Hz缓慢起伏的极低频持续音、很轻的房间底噪和机械钟表滴答（滴、答交替），可循环",
          interrogation_bed, loop=True, ambient=True, centroid=(30, 3000)),
    Sound("projector", 6.0, "老式电影放映机：马达低频嗡、24Hz规律片门咔哒和胶片走带轻微沙沙，可循环",
          projector, loop=True, ambient=True, centroid=(100, 4000)),
    Sound("lab_tone", 10.0, "化验段冷电子音：略失谐的高频正弦铺底缓慢起伏，偶有数据“滴”声，立体声",
          lab_tone, stereo=True, ambient=True, centroid=(1800, 4800)),
    Sound("scan_sweep", 2.0, "显微镜/扫描仪推进时的电子扫频：带通噪声加上扬正弦",
          scan_sweep, centroid=(600, 4500)),
]
