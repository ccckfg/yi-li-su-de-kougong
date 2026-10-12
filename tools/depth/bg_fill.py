"""Back layer for 2.5D plates: extend the background a band's width under every foreground edge.

For each still S with depth map S_depth.png (16-bit, near = white) writes
  S_bg.jpg        colour of what lies behind foreground edges (push-pull filled from far-side pixels)
  S_bgdepth.png   matching depth (8-bit), far depth pushed under the near side by `band` pixels
When the camera moves, the front relief tears open at depth steps and this layer shows through.

usage: python tools/depth/bg_fill.py S15 S20 ... [--band 70]
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[2] / "film" / "public"


def push_pull(img: np.ndarray, valid: np.ndarray) -> np.ndarray:
    """Fill invalid pixels from valid neighbours across a pyramid (Gortler et al. push-pull)."""
    w = valid.astype(np.float32)
    if img.ndim == 2:
        img = img[..., None]
    levels = [(img * w[..., None], w)]
    while min(levels[-1][1].shape) > 2:
        c, ww = levels[-1]
        h, wd = ww.shape
        h2, w2 = (h + 1) // 2, (wd + 1) // 2
        cp = np.zeros((h2 * 2, w2 * 2, c.shape[2]), np.float32)
        wp = np.zeros((h2 * 2, w2 * 2), np.float32)
        cp[:h, :wd] = c
        wp[:h, :wd] = ww
        cs = cp.reshape(h2, 2, w2, 2, -1).sum((1, 3))
        ws = wp.reshape(h2, 2, w2, 2).sum((1, 3))
        levels.append((cs, ws))
    # pull: normalise coarsest, then blend down
    c, ww = levels[-1]
    cur = c / np.maximum(ww, 1e-6)[..., None]
    for c, ww in reversed(levels[:-1]):
        h, wd = ww.shape
        up = np.repeat(np.repeat(cur, 2, 0), 2, 1)[:h, :wd]
        up = ndi.uniform_filter(up, size=(3, 3, 1), mode="nearest")
        a = np.clip(ww, 0, 1)[..., None]
        cur = a * (c / np.maximum(ww, 1e-6)[..., None]) + (1 - a) * up
    return cur.squeeze()


def run(name: str, band: int):
    img = np.asarray(Image.open(ROOT / "stills" / f"{name}.png").convert("RGB"), np.float32) / 255.0
    d = np.asarray(Image.open(ROOT / "depth" / f"{name}_depth.png"), np.float32)
    d = d / max(1.0, d.max())
    ds = ndi.gaussian_filter(d, 1.0)
    # depth steps (both sides)
    step = (ndi.maximum_filter(ds, 5) - ndi.minimum_filter(ds, 5)) > 0.05
    # near side within `band` px of a step: something meaningfully farther is close by
    far_env = ndi.minimum_filter(ds, size=band)
    near = ndi.binary_dilation(step, iterations=band // 2) & ((ds - far_env) > 0.035)
    valid = ~near
    # low frequencies from push-pull, texture mirrored across the nearest far-side pixel so the
    # revealed sliver keeps the hatching / grain of its surroundings instead of a smooth smear
    low = np.stack([ndi.gaussian_filter(img[..., c], 2.5) for c in range(3)], -1)
    detail = img - low
    dist, (iy, ix) = ndi.distance_transform_edt(near, return_indices=True)
    yy, xx = np.indices(near.shape)
    sy = np.clip(2 * iy - yy, 0, near.shape[0] - 1)
    sx = np.clip(2 * ix - xx, 0, near.shape[1] - 1)
    bad = near[sy, sx]
    sy = np.where(bad, iy, sy)
    sx = np.where(bad, ix, sx)
    smear = push_pull(low, valid) + np.where(near[..., None], detail[sy, sx], detail)
    # right at the edge (what a camera move actually uncovers) a mirror image of the far side reads
    # as real background; deeper in, fall back to the smooth fill
    w_mirror = np.clip(1.0 - (dist - 25.0) / 30.0, 0.0, 1.0)[..., None]
    bg = w_mirror * img[sy, sx] + (1 - w_mirror) * smear
    bg = np.where(near[..., None], bg, img)
    bgd = push_pull(ds, valid)
    bgd = np.minimum(bgd, ds)  # never nearer than the original surface
    bgd = ndi.gaussian_filter(bgd, 2.0)
    out = ROOT / "depth"
    Image.fromarray((np.clip(bg, 0, 1) * 255 + 0.5).astype(np.uint8)).save(out / f"{name}_bg.jpg", quality=92)
    Image.fromarray((np.clip(bgd, 0, 1) * 255 + 0.5).astype(np.uint8)).save(out / f"{name}_bgdepth.png")
    Image.fromarray((near * 255).astype(np.uint8)).resize((640, int(640 * near.shape[0] / near.shape[1]))).save(out / f"{name}_bgmask_preview.png")
    print(name, "near px %.1f%%" % (100 * near.mean()))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("names", nargs="+")
    ap.add_argument("--band", type=int, default=70)
    a = ap.parse_args()
    for n in a.names:
        run(n, a.band)
