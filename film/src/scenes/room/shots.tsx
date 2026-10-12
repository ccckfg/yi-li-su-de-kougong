import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { cue, line, SHOT } from "../../timeline";
import { GRAIN_PRELOAD, heroPosition } from "./grains";
import { Preload } from "../../three/assets";
import { easeInOut, easeOut, lerp3, noise1, smooth, type V3 } from "../../three/Rig";
import { RoomShot, type RoomState } from "./RoomScene";

/** Pen orientation: local +y along `axis`, and the nib's convex face (local -z) turned toward `face`. */
export function penBasis(axis: V3, face: V3): V3 {
  const y = new THREE.Vector3(...axis).normalize();
  const f = new THREE.Vector3(...face).normalize();
  const zNeg = f.clone().sub(y.clone().multiplyScalar(f.dot(y))).normalize(); // convex side toward `face`
  const z = zNeg.clone().negate();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  const e = new THREE.Euler().setFromRotationMatrix(m);
  return [e.x, e.y, e.z];
}

/** Euler that turns local +y onto direction d. */
export function dirToEuler(d: V3): V3 {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

// paper field anchors (world) on the open form
export const FIELD_NAME: V3 = [0.1605, 0.0086, 0.0866]; // 种质名称
export const FIELD_OTHER: V3 = [0.1563, 0.0086, 0.1571]; // 其他特性
const PEN_LYING = { pos: [0.205, 0.0094, 0.03] as V3, rot: penBasis([0.93, 0.0, -0.37], [0, 1, 0]) };
const GLASS_REST: V3 = [0.07, 0.0, -0.13];

/** steady lamp with a hint of mains wobble */
const lampSteady = (t: number) => 1 - 0.025 * noise1(t * 3.0, 1) - 0.015 * noise1(t * 17.0, 2);
const lampFlicker = (t: number, at: number, len = 0.5) => {
  const x = (t - at) / len;
  if (x < 0 || x > 1) return lampSteady(t);
  const n = noise1(t * 60, 5);
  return Math.max(0.05, lampSteady(t) * (0.35 + 0.65 * (n > 0.45 ? 1 : n)));
};

const base = (time: number): Omit<RoomState, "cam" | "focus"> => ({
  power: lampSteady(time),
  cover: Math.PI,
  pen: PEN_LYING,
  glass: null,
  envTip: 0,
  shoulder: null,
  ink: null,
  filled: true,
  time,
});

function useT() {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return { f, t: f / fps, fps, dur: durationInFrames, u: f / Math.max(1, durationInFrames - 1) };
}

/** S06 — top shot, the lamp clicks on, flickers once, settles. Title rides on top (Film overlay). */
export const S06: React.FC = () => {
  const { t, fps } = useT();
  const on = (cue("lamp_click") - SHOT.S06.from) / fps;
  let power = 0;
  if (t >= on) {
    const x = t - on;
    power = x < 0.05 ? 0.9 : x < 0.12 ? 0.25 : x < 0.2 ? 1.0 : x < 0.26 ? 0.55 : lampSteady(t);
  }
  return (
    <RoomShot
      state={{
        ...base(t),
        power,
        filled: false,
        cam: { pos: [-0.2, 1.18, -0.04], target: [-0.2, 0, -0.17], fov: 40, roll: 0 },
        focus: { dist: 1.12, range: 0, bokeh: 1.5 },
      }}
    />
  );
};

/** S07 — over the interrogator's shoulder, very slow push toward the empty chair. */
export const S07: React.FC = () => {
  const { t, u } = useT();
  const k = easeInOut(u);
  return (
    <RoomShot
      state={{
        ...base(t),
        filled: false,
        shoulder: [0.2, 0.33, 0.66],
        cam: { pos: lerp3([0.34, 0.47, 0.86], [0.3, 0.45, 0.76], k), target: [0.0, 0.0, -0.86], fov: 30 },
        focus: { dist: 1.88 - 0.1 * k, range: 0, bokeh: 6 },
      }}
    />
  );
};

/** S08 — macro on the nib; it comes down to the 种质名称 field and stops, trembling. */
export const S08: React.FC = () => {
  const { t, fps } = useT();
  const stop = (cue("pen_stop") - SHOT.S08.from) / fps;
  const down = easeOut((t - 0.0) / Math.max(0.2, stop), 2);
  const h = 0.006 * (1 - down);
  const tremble = t > stop ? 0.00035 * Math.sin(t * 38) * Math.exp(-(t - stop) * 1.2) : 0;
  const tip: V3 = [FIELD_NAME[0] + tremble, FIELD_NAME[1] + h + 0.0002, FIELD_NAME[2]];
  return (
    <RoomShot
      state={{
        ...base(t),
        filled: false,
        pen: { pos: tip, rot: penBasis([0.28, 0.78, -0.56], [-0.052, 0.026, 0.046]) },
        cam: { pos: [FIELD_NAME[0] - 0.052, 0.026, FIELD_NAME[2] + 0.046], target: [FIELD_NAME[0] + 0.004, FIELD_NAME[1] + 0.003, FIELD_NAME[2] - 0.002], fov: 26, near: 0.003 },
        focus: { dist: 0.069, range: 0, bokeh: 30 },
        dustScale: 1.2,
        kicker: { pos: [FIELD_NAME[0] - 0.03, 0.05, FIELD_NAME[2] + 0.01], intensity: 0.012 },
      }}
    />
  );
};

/** S09b — reverse low angle on the empty chair while the kid talks. */
export const S09b: React.FC = () => {
  const { t, u } = useT();
  const k = smooth(u);
  return (
    <RoomShot
      state={{
        ...base(t),
        cam: { pos: lerp3([0.24, 0.1, 0.3], [0.21, 0.09, 0.2], k), target: [0.02, -0.14, -0.86], fov: 31 },
        focus: { dist: 1.12, range: 0, bokeh: 7 },
      }}
    />
  );
};

/** S10 — a glass of water is pushed across the desk from out of frame; water sloshes, lamp in the water. */
export const S10: React.FC = () => {
  const { t, fps } = useT();
  const push0 = (cue("glass_push") - SHOT.S10.from) / fps;
  const x = easeOut((t - push0) / 0.9, 3);
  const pos = lerp3([0.3, 0.0, 0.2], GLASS_REST, x);
  const wob = t < push0 ? 0 : Math.exp(-(t - push0 - 0.7) * 1.6) * (t - push0 < 0.7 ? (t - push0) / 0.7 : 1);
  return (
    <RoomShot
      state={{
        ...base(t),
        glass: { pos, wobble: wob },
        cam: { pos: lerp3([0.36, 0.055, 0.16], [0.34, 0.052, 0.14], x), target: [-0.02, 0.035, -0.3], fov: 32 },
        focus: { dist: 0.12 + 0.3 * x, range: 0, bokeh: 10 },
      }}
    />
  );
};

/** S11 — the empty chair in the dark, a long slow push; the lamp breathes. */
export const S11: React.FC = () => {
  const { t, u } = useT();
  const k = easeInOut(u);
  const power = lampSteady(t) * (1 - 0.08 * noise1(t * 1.3, 9)) * (noise1(t * 40, 4) > 0.93 ? 0.8 : 1);
  return (
    <RoomShot
      state={{
        ...base(t),
        power,
        glass: { pos: GLASS_REST, wobble: 0 },
        cam: { pos: lerp3([1.3, 0.1, -0.3], [1.08, 0.05, -0.44], k), target: [0.02, -0.36, -0.86], fov: 30 },
        focus: { dist: 1.42 - 0.22 * k, range: 0, bokeh: 8 },
      }}
    />
  );
};

/** S12 — macro: the nib rests in the 其他特性 field and a drop of ink blooms; long pause. */
export const S12: React.FC = () => {
  const { t, fps } = useT();
  const drop = (cue("ink_drop") - SHOT.S12.from) / fps;
  const it = Math.max(0, t - drop);
  return (
    <RoomShot
      state={{
        ...base(t),
        glass: { pos: GLASS_REST, wobble: 0 },
        pen: { pos: [FIELD_OTHER[0], FIELD_OTHER[1] + 0.0002, FIELD_OTHER[2]], rot: penBasis([0.3, 0.76, -0.58], [-0.03, 0.038, 0.036]) },
        ink: it > 0 ? { pos: [FIELD_OTHER[0], FIELD_OTHER[1] + 0.00015, FIELD_OTHER[2]], t: it * 0.55 } : null,
        cam: { pos: [FIELD_OTHER[0] - 0.03, 0.038, FIELD_OTHER[2] + 0.036], target: [FIELD_OTHER[0] + 0.006, FIELD_OTHER[1], FIELD_OTHER[2] - 0.004], fov: 24, near: 0.003 },
        focus: { dist: 0.052, range: 0, bokeh: 30 },
        dustScale: 1.0,
        kicker: { pos: [FIELD_OTHER[0] - 0.025, 0.045, FIELD_OTHER[2] + 0.012], intensity: 0.01 },
      }}
    />
  );
};

/** S13 — side backlight; the folder closes (hand out of frame). */
export const S13: React.FC = () => {
  const { t, fps, u } = useT();
  const c0 = (cue("folder_close") - SHOT.S13.from) / fps;
  const close = easeInOut((t - c0) / 0.75);
  return (
    <RoomShot
      state={{
        ...base(t),
        pen: { pos: [0.33, 0.0094, 0.2], rot: penBasis([0.9, 0, 0.4], [0, 1, 0]) },
        glass: { pos: GLASS_REST, wobble: 0 },
        ink: { pos: [FIELD_OTHER[0], FIELD_OTHER[1] + 0.00015, FIELD_OTHER[2]], t: 1.6 },
        cover: Math.PI * (1 - close),
        cam: { pos: lerp3([0.62, 0.11, 0.2], [0.6, 0.1, 0.18], u), target: [0.1, 0.02, 0.08], fov: 33 },
        focus: { dist: 0.52, range: 0, bokeh: 8 },
      }}
    />
  );
};

/** S13b — "你是问我，还是问我们？" the camera drifts into the dark toward the chair. */
export const S13b: React.FC = () => {
  const { t, u } = useT();
  const k = easeInOut(u);
  return (
    <RoomShot
      state={{
        ...base(t),
        cover: 0,
        glass: { pos: GLASS_REST, wobble: 0 },
        power: lampSteady(t) * (1 - 0.15 * k),
        cam: { pos: lerp3([-0.05, 0.3, 0.44], [-0.04, 0.2, -0.02], k), target: [0.02, -0.18, -0.86], fov: 29 },
        focus: { dist: 1.2 - 0.35 * k, range: 0, bokeh: 9 },
      }}
    />
  );
};


export { lampFlicker };

/**
 * S14 — the lamp flickers, the camera tilts down to the envelope at the corner of the light;
 * on "差不多" the bag flops over, a trickle of grain runs out and rolls; crash zoom into one grain.
 */
const S14Inner: React.FC = () => {
  const { t, fps, dur } = useT();
  const old = line("v02_24_old");
  const tip0 = (old.speechTo - SHOT.S14.from) / fps - 0.5; // the bag gives way on the tail of 「差不多」
  const spill0 = tip0 + 0.26;
  const zoom0 = Math.min(spill0 + 1.35, dur / fps - 1.0);
  const zoomLen = 0.62;
  // bag: slow lean, then it gives way and flops with a small bounce
  const x = (t - tip0) / 0.55;
  const tip = x <= 0 ? 0 : x >= 1 ? 1 + 0.04 * Math.sin(Math.min(1, (x - 1) * 2.2) * Math.PI) * (1 - Math.min(1, (x - 1) * 2.2)) : Math.pow(x, 2.2);
  const gt = t - spill0;
  const hero = heroPosition(Math.max(0, gt));
  const zk = easeInOut((t - zoom0) / zoomLen);
  // phase A/B: tilt down from the lamp to the corner, then a slow push
  const a = easeInOut(t / Math.max(0.1, tip0 - 0.2));
  const targetAB = lerp3([-0.22, 0.2, -0.14], [-0.12, 0.012, 0.11], a);
  const posAB = lerp3([0.12, 0.33, 0.46], [0.07, 0.24, 0.4], smooth((t - tip0) / (zoom0 - tip0 + 0.001)));
  const heroV: V3 = [hero.x, hero.y, hero.z];
  const posMacro: V3 = [hero.x + 0.0082, hero.y + 0.0118, hero.z + 0.0094];
  const pos = lerp3(posAB, posMacro, zk);
  const target = lerp3(targetAB, heroV, easeInOut((t - zoom0 + 0.08) / zoomLen));
  const dx = pos[0] - (zk > 0.5 ? heroV[0] : target[0]);
  const dy = pos[1] - (zk > 0.5 ? heroV[1] : target[1]);
  const dz = pos[2] - (zk > 0.5 ? heroV[2] : target[2]);
  const focusDist = Math.hypot(dx, dy, dz);
  return (
    <RoomShot
      state={{
        ...base(t),
        power: lampFlicker(t, 0.22, 0.5) * (1 - 0.38 * zk),
        glass: { pos: GLASS_REST, wobble: 0 },
        ink: { pos: [FIELD_OTHER[0], FIELD_OTHER[1] + 0.00015, FIELD_OTHER[2]], t: 1.6 },
        cover: 0,
        envTip: Math.max(0, tip),
        grains: { t: gt, hero: true },
        cam: { pos, target, fov: 30 - 6 * zk, near: 0.0015, far: 6 },
        focus: { dist: focusDist, range: 0, bokeh: 6 + 24 * zk, ao: 0.06 - 0.057 * zk },
        dustScale: 2.2 - 1.6 * zk,
      }}
    />
  );
};

export const S14: React.FC = () => (
  <Preload spec={GRAIN_PRELOAD}>
    <S14Inner />
  </Preload>
);

export const RoomShots = { S06, S07, S08, S09b, S10, S11, S12, S13, S13b, S14 };
