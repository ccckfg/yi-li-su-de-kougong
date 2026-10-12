"""Derive normal + roughness maps from photographic textures (height ~ luminance)."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from common import ROOT

SRC = ROOT / "assets" / "textures" / "v1"
DST = ROOT / "film" / "public" / "tex"

# name: (normal strength, blur radius for height, roughness base, roughness span, invert height)
SPEC = {
    "desk": (3.5, 1.0, 0.62, 0.3, False),
    "kraft": (2.5, 1.2, 0.86, 0.1, False),
    "paper": (1.2, 1.5, 0.92, 0.06, False),
    "knit": (5.0, 0.8, 0.95, 0.04, False),
    "chairwood": (3.0, 1.0, 0.55, 0.35, False),
}


def normal_from_height(h: np.ndarray, strength: float) -> np.ndarray:
    gx = np.zeros_like(h)
    gy = np.zeros_like(h)
    gx[:, 1:-1] = (h[:, 2:] - h[:, :-2]) * 0.5
    gy[1:-1, :] = (h[2:, :] - h[:-2, :]) * 0.5
    nx, ny, nz = -gx * strength, gy * strength, np.ones_like(h)
    n = np.stack([nx, ny, nz], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return ((n * 0.5 + 0.5) * 255).astype(np.uint8)


if __name__ == "__main__":
    DST.mkdir(parents=True, exist_ok=True)
    for name, (strength, blur, rbase, rspan, inv) in SPEC.items():
        src = SRC / f"tex_{name}.png"
        if not src.exists():
            print("missing", src)
            continue
        im = Image.open(src).convert("RGB")
        im.save(DST / f"{name}_col.jpg", quality=93)
        lum = np.asarray(im.convert("L").filter(ImageFilter.GaussianBlur(blur)), dtype=np.float32) / 255.0
        if inv:
            lum = 1 - lum
        # high-pass the height so large stains don't read as bumps
        low = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(24)), dtype=np.float32) / 255.0
        h = lum - low
        Image.fromarray(normal_from_height(h * 4.0, strength)).save(DST / f"{name}_nrm.png")
        # roughness: darker grooves/dirt rougher, polished light areas a bit smoother
        r = np.clip(rbase + (0.5 - lum) * rspan + (np.abs(h) * 1.5), 0.04, 1.0)
        Image.fromarray((r * 255).astype(np.uint8)).save(DST / f"{name}_rgh.png")
        print(name, im.size, "ok")
