"""Procedural surface for a hulled foxtail-millet grain (UV: u around, v pole-to-pole along the long axis).

Botany notes (docs/factcheck.md 12b): ovoid, pale yellow, semi-matte, fine papillae on the lemma/palea,
faint longitudinal veins; lemma wraps the flatter palea, leaving a seam.
"""
import numpy as np
from PIL import Image, ImageFilter

from common import ROOT

W, H = 2048, 1024
rng = np.random.default_rng(42)
u = np.linspace(0, 1, W, endpoint=False)[None, :]
v = np.linspace(0, 1, H)[:, None]
lat = (v - 0.5) * np.pi  # -pi/2..pi/2 along the long axis
cosl = np.cos(lat)

height = np.zeros((H, W), np.float32)

# longitudinal veins (lemma ~5 veins, palea 2), fading toward the poles
for k, (uc, strength) in enumerate([(0.08, 1.0), (0.2, 0.7), (0.32, 1.0), (0.44, 0.7), (0.56, 1.0), (0.78, 0.6), (0.9, 0.6)]):
    d = np.abs(((u - uc + 0.5) % 1.0) - 0.5)
    height -= strength * 0.6 * np.exp(-(d / 0.006) ** 2) * (cosl ** 0.6)

# lemma margin seam wrapping over the palea
d = np.abs(((u - 0.67 + 0.5) % 1.0) - 0.5)
height -= 0.9 * np.exp(-(d / 0.006) ** 2) * (cosl ** 0.4)
height += 0.35 * np.exp(-((d - 0.012) / 0.006) ** 2) * (cosl ** 0.4)

# papillae: tiny rounded bumps, density corrected for latitude (fewer per texel near poles)
n = 26000
pu = rng.random(n)
pv = np.arcsin(rng.random(n) * 2 - 1) / np.pi + 0.5  # uniform on the sphere
pap = np.zeros((H, W), np.float32)
xs = (pu * W).astype(int)
ys = np.clip((pv * H).astype(int), 0, H - 1)
np.add.at(pap, (ys, xs), 1.0)
pap_img = Image.fromarray(np.clip(pap * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.6))
pap = np.asarray(pap_img, np.float32) / 255.0
pap = pap / (pap.max() + 1e-6)
height += pap * 1.6

# low-frequency undulation
lf = np.asarray(Image.fromarray((rng.random((64, 128)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255.0
height += (lf - 0.5) * 0.25

# normal map (wrap horizontally)
hx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) * 0.5
hy = np.zeros_like(height)
hy[1:-1] = (height[2:] - height[:-2]) * 0.5
s = 3.4
nx, ny, nz = -hx * s, hy * s, np.ones_like(height)
nrm = np.stack([nx, ny, nz], -1)
nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
Image.fromarray(((nrm * 0.5 + 0.5) * 255).astype(np.uint8)).save(ROOT / "film/public/tex/grain_nrm.png")

# colour: pale straw yellow; slightly warmer/darker at the poles and along veins; sparse brown specks
base = np.array([0.93, 0.80, 0.45], np.float32)
col = np.ones((H, W, 3), np.float32) * base
pole = (1 - cosl) ** 2
col *= (1 - 0.18 * pole)[..., None]
col[..., 2] *= (1 - 0.12 * pole)
col *= (1 + 0.6 * np.clip(height, -0.6, 0.0))[..., None]
col *= (1 + (lf - 0.5) * 0.12)[..., None]
specks = rng.random((H, W)) > 0.9993
sp = np.asarray(Image.fromarray((specks * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)), np.float32) / 255.0
col *= (1 - sp * 2.5)[..., None].clip(0.35, 1)
# hilum / embryo end: a soft paler patch near one pole on the palea side
emb = np.exp(-(((u - 0.67) / 0.08) ** 2 + ((v - 0.08) / 0.07) ** 2))
col = col * (1 - 0.25 * emb[..., None]) + np.array([0.95, 0.92, 0.8]) * 0.25 * emb[..., None]
Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)).save(ROOT / "film/public/tex/grain_col.jpg", quality=94)
# roughness: papillae tops slightly smoother (glint), grooves rougher
rough = np.clip(0.55 - pap * 0.25 - np.clip(height, -0.6, 0) * 0.4, 0.2, 0.9)
Image.fromarray((rough * 255).astype(np.uint8)).save(ROOT / "film/public/tex/grain_rgh.png")
print("grain textures written")
