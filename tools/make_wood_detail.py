"""Tileable micro wood-fibre detail (one tile ~ 1 cm) for macro shots; mean ~0.5 so it can multiply x2."""
import numpy as np
from PIL import Image

from common import ROOT

N = 1024
rng = np.random.default_rng(7)
noise = rng.standard_normal((N, N))
F = np.fft.fft2(noise)
fx = np.fft.fftfreq(N)[None, :]
fy = np.fft.fftfreq(N)[:, None]
# fibres run along x: long correlation in x, short in y
filt = np.exp(-((fx / 0.004) ** 2 + (fy / 0.06) ** 2))
fib = np.real(np.fft.ifft2(F * filt))
fib = (fib - fib.mean()) / fib.std()
# medium undulation
filt2 = np.exp(-((fx / 0.002) ** 2 + (fy / 0.012) ** 2))
und = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((N, N))) * filt2))
und = (und - und.mean()) / und.std()
v = 0.5 + 0.09 * fib + 0.05 * und
# pores: sparse dark elongated flecks (periodic placement keeps tiling)
pores = np.zeros((N, N))
for _ in range(260):
    x, y = rng.integers(0, N, 2)
    L = rng.integers(6, 22)
    for k in range(L):
        pores[y % N, (x + k) % N] += 1.0 - abs(k - L / 2) / (L / 2)
pores = np.real(np.fft.ifft2(np.fft.fft2(pores) * np.exp(-((fx / 0.25) ** 2 + (fy / 0.25) ** 2))))
v -= 0.35 * pores / (pores.max() + 1e-6)
v = np.clip(v, 0, 1)
img = np.stack([v * 1.02, v, v * 0.97], -1)
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(ROOT / "film/public/tex/wood_detail.jpg", quality=92)
print("mean", float(v.mean()))
