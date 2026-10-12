import React from "react";
import { DepthPlate, sp, type DepthGeom } from "./DepthPlate";

// The four "ten thousand years" paintings and the snowy village, each walked into.
const G15: DepthGeom = { near: 1.4, far: 8, fov: 36, overscan: 1.22 };

/** Wild millet, ~10,000 years ago. Low in the grass, push in; focus slides from the seed heads to the gatherer; sun behind cloud. */
export const S15Plate: React.FC = () => (
  <DepthPlate
    name="S15"
    mode="charcoal"
    {...G15}
    move={{ from: [0, -0.03, 0], to: [0.1, 0.06, -0.6], lookFrom: sp(0.5, 0.48, 0.35, G15), lookTo: sp(0.55, 0.55, 0.43, G15), focus: [1.45, 2.05], focusWindow: [0.15, 0.6] }}
    farBlur={3.2}
    sway={0.0025}
    swayBox={[0, 0.4, 0.5, 0.75]}
    shafts={{ at: sp(0.22, 0.9, 0, G15), strength: 1.4, threshold: 0.42, decay: 0.972, density: 0.95, tint: [1, 0.93, 0.8] }}
    particles={[
      { kind: "ash", count: 420, zRange: [0.7, 4.5], wind: [0.04, 0.01, 0] },
      { kind: "dust", count: 260, zRange: [0.5, 5], opacity: 0.55 },
    ]}
  />
);

const G20: DepthGeom = { near: 1.5, far: 7, fov: 36, overscan: 1.22 };

/** Dunhuang mural, rain on the fields. Truck along with the ox; the painted rain becomes real; pigment flakes drift down. */
export const S20Plate: React.FC = () => (
  <DepthPlate
    name="S20"
    mode="mural"
    {...G20}
    move={{ from: [-0.08, 0.02, 0], to: [0.08, -0.01, -0.3], lookFrom: sp(0.48, 0.47, 0.6, G20), lookTo: sp(0.53, 0.44, 0.6, G20), ease: "linear" }}
    farBlur={2.6}
    particles={[
      { kind: "rain", count: 2400, zRange: [0.4, 6] },
      { kind: "pigment", count: 90, zRange: [0.6, 3.2], opacity: 0.85 },
    ]}
  />
);

const G21: DepthGeom = { near: 1.5, far: 7, fov: 36, overscan: 1.22 };

/** Tiangong Kaiwu, threshing and winnowing. Push in and rise; chaff flies out of the woodcut into the air. */
export const S21Plate: React.FC = () => (
  <DepthPlate
    name="S21"
    mode="woodcut"
    {...G21}
    move={{ from: [0, -0.02, 0], to: [0.07, 0.05, -0.45], lookFrom: sp(0.5, 0.48, 0.3, G21), lookTo: sp(0.6, 0.5, 0.35, G21) }}
    farBlur={2.4}
    particles={[
      { kind: "chaff", count: 520, src: sp(0.74, 0.56, 0.45, G21), wind: [0.35, 0.06, 0.1] },
      { kind: "chaff", count: 160, src: sp(0.3, 0.5, 0.45, G21), wind: [0.2, 0.0, 0.2] },
    ]}
  />
);

const G22: DepthGeom = { near: 1.5, far: 8, fov: 36, overscan: 1.2 };

/** 1940s silver print: cave dwelling, a basket of millet and a rifle. Slow push to the basket; sun shafts and dust. */
export const S22Plate: React.FC = () => (
  <DepthPlate
    name="S22"
    mode="film"
    {...G22}
    move={{ from: [0.1, 0.01, 0], to: [0.15, -0.03, -0.26], lookFrom: [0.1, 0.01, -3], lookTo: sp(0.64, 0.42, 0.72, G22) }}
    farBlur={3}
    weave={0.004}
    shafts={{ at: sp(0.1, 0.95, 0, G22), strength: 0.9, threshold: 0.55, decay: 0.97, density: 0.85, tint: [1, 0.98, 0.94] }}
    particles={[{ kind: "dust", count: 320, zRange: [0.4, 4], opacity: 0.6, wind: [0.02, -0.01, 0] }]}
  />
);

const G34: DepthGeom = { near: 1.6, far: 2.5, fov: 36, overscan: 1.16 };

/** Water sinking into the furrow. A slow push down onto the wet patch; crumbs stand out in relief. */
export const S34Plate: React.FC = () => (
  <DepthPlate
    name="S34"
    mode="wetsoil"
    {...G34}
    move={{ from: [0, 0, 0], to: [0.02, -0.015, -0.28], lookFrom: sp(0.5, 0.5, 0.5, G34), lookTo: sp(0.49, 0.53, 0.5, G34), ease: "out" }}
    farBlur={2.5}
    bloom={0.3}
    cut={0.08}
  />
);

const G02: DepthGeom = { near: 1.6, far: 9, fov: 36, overscan: 1.18 };

/** Snowed-in village at dusk. Push toward the gate and the figure; real snow at every depth. */
export const S02Plate: React.FC = () => (
  <DepthPlate
    name="S02"
    mode="snow"
    {...G02}
    move={{ from: [0, 0.01, 0], to: [0.025, -0.005, -0.32], lookFrom: sp(0.5, 0.5, 0.4, G02), lookTo: sp(0.56, 0.4, 0.5, G02), ease: "out" }}
    farBlur={3}
    bloom={0.45}
    particles={[{ kind: "snow", count: 1500, zRange: [0.5, 7], wind: [0.06, 0, 0] }]}
  />
);
