"""Refine raw transformers.js depth: size match, guided filter, 16-bit PNG, preview."""
import numpy as np
from PIL import Image
from scipy.ndimage import uniform_filter

from common import parse_args


def normalize(x):
    lo, hi = float(x.min()), float(x.max())
    return (x - lo) / (hi - lo) if hi > lo else np.zeros_like(x)


def guided_filter(guide, src, radius, eps):
    """He et al. guided filter with a single-channel guide (box filters)."""
    size = 2 * radius + 1

    def mean(x):
        return uniform_filter(x, size=size, mode="reflect")

    mean_g, mean_s = mean(guide), mean(src)
    var_g = mean(guide * guide) - mean_g * mean_g
    cov_gs = mean(guide * src) - mean_g * mean_s
    a = cov_gs / (var_g + eps)
    b = mean_s - a * mean_g
    return mean(a) * guide + mean(b)


def load_raw_depth(path, size):
    """Read the float32 dump written by depth.mjs (already at the still's resolution)."""
    width, height = size
    raw = np.fromfile(path, dtype=np.float32)
    if raw.size != width * height:
        raise SystemExit(f"{path.name}: {raw.size} floats, expected {width}x{height}")
    return raw.reshape(height, width).astype(np.float64)


def process(name, cfg):
    still = Image.open(cfg["stillsDir"] / (name + cfg["inputExt"])).convert("RGB")
    depth = normalize(load_raw_depth(cfg["workDir"] / f"{name}.f32", still.size))

    luma = np.asarray(still.convert("L"), dtype=np.float64) / 255.0
    gf = cfg["postprocess"]["guidedFilter"]
    depth = normalize(np.clip(guided_filter(luma, depth, gf["radius"], gf["eps"]), 0, 1))

    depth16 = np.round(depth * 65535).astype(np.uint16)
    out = cfg["outputDir"]
    Image.fromarray(depth16).save(out / (name + cfg["depthSuffix"]))

    width = cfg["postprocess"]["previewWidth"]
    height = round(still.height * width / still.width)
    preview = Image.fromarray((depth * 255).round().astype(np.uint8)).resize(
        (width, height), Image.LANCZOS
    )
    preview.save(out / (name + cfg["previewSuffix"]), quality=cfg["postprocess"]["previewQuality"])
    print(f"{name}: wrote {name + cfg['depthSuffix']} and preview")


if __name__ == "__main__":
    cfg, names = parse_args(__doc__)
    cfg["outputDir"].mkdir(parents=True, exist_ok=True)
    for n in names:
        process(n, cfg)
