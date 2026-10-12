"""生成全部音效 WAV 与 manifest（固定随机种子，可重复运行）。

用法：python synth_sfx.py [--only 名称 ...]
"""
import argparse
import sys
import zlib

sys.dont_write_bytecode = True

import numpy as np  # noqa: E402

import qa  # noqa: E402
from export import manifest_entry, write_manifest, write_wav  # noqa: E402
from master import master  # noqa: E402
from registry import ALL_SOUNDS  # noqa: E402
from sfx_config import OUT_DIR, SEED  # noqa: E402
from dsp_basic import ns  # noqa: E402


def render(snd):
    rng = np.random.default_rng([SEED, zlib.crc32(snd.name.encode())])
    raw = np.asarray(snd.build(rng, snd.dur), float)
    shape = (ns(snd.dur), 2) if snd.stereo else (ns(snd.dur),)
    if raw.shape != shape:
        raise ValueError(f"{snd.name}: 期望形状 {shape}，实际 {raw.shape}")
    if not np.all(np.isfinite(raw)):
        raise ValueError(f"{snd.name}: 含有 NaN/Inf")
    return master(raw, snd)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="*", help="只生成指定名称（不含扩展名）；此时不重写 manifest")
    args = ap.parse_args()
    sounds = [s for s in ALL_SOUNDS if not args.only or s.name in args.only]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(qa.HEADER)
    manifest, bad = {}, []
    for snd in sounds:
        pcm, seam = render(snd)
        m, flags = qa.analyze(pcm, snd, seam)
        write_wav(OUT_DIR, snd.name, pcm)
        manifest[f"{snd.name}.wav"] = manifest_entry(snd, m)
        print(qa.format_row(snd, m, flags))
        if flags:
            bad.append(snd.name)
    if not args.only:
        write_manifest(OUT_DIR, manifest)
    print(f"\n{len(sounds)} files, {len(bad)} flagged" + (f": {', '.join(bad)}" if bad else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
