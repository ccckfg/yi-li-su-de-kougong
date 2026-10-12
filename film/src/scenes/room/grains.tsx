import React, { useMemo } from "react";
import * as THREE from "three";
import { getJson, useTex } from "../../three/assets";

export type GrainBake = { fps: number; n: number; hero: number; radii: number[]; frames: number[][] };
export const GRAIN_PRELOAD = {
  json: ["data/grains_s14.json"],
  tex: ["tex/grain_col.jpg", "tex/grain_nrm.png", "tex/grain_rgh.png"],
};

// visual grain half-axes (m): long axis along local x, matches the baked two-sphere body
export const GR = [0.00105, 0.00084, 0.00066] as const;
const PHYS_R = 0.00072;

export function grainGeometry(wSeg: number, hSeg: number) {
  const g = new THREE.SphereGeometry(1, wSeg, hSeg);
  g.rotateZ(-Math.PI / 2); // poles (texture v) -> long axis x
  // gentle egg asymmetry: one end a touch fuller (embryo end)
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const k = 1 + 0.07 * x;
    const z0 = p.getZ(i);
    const flat = z0 < 0 ? 0.78 : 1.0;
    p.setXYZ(i, x * GR[0], p.getY(i) * GR[1] * k, z0 * GR[2] * k * flat);
  }
  g.computeVertexNormals();
  return g;
}

export function useGrainMaterial() {
  const col = useTex("tex/grain_col.jpg");
  const nrm = useTex("tex/grain_nrm.png", { srgb: false });
  const rgh = useTex("tex/grain_rgh.png", { srgb: false });
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: col,
        normalMap: nrm,
        normalScale: new THREE.Vector2(1.4, 1.4),
        roughnessMap: rgh,
        roughness: 1,
        sheen: 0.12,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color("#ffe6a8"),
        color: new THREE.Color("#ffe9b8"),
        clearcoat: 0.15,
        clearcoatRoughness: 0.45,
      }),
    [col, nrm, rgh],
  );
}

const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);
const _ex = new THREE.Vector3();
const _ey = new THREE.Vector3();
const _ez = new THREE.Vector3();

/** Transform of grain i at time t (s since spill start), y corrected so the ellipsoid touches the desk. */
export function grainTransform(bake: GrainBake, i: number, t: number, outPos: THREE.Vector3, outQ: THREE.Quaternion) {
  const ft = Math.min(bake.frames.length - 1, Math.max(0, t * bake.fps));
  const i0 = Math.floor(ft);
  const i1 = Math.min(bake.frames.length - 1, i0 + 1);
  const a = ft - i0;
  const f0 = bake.frames[i0];
  const f1 = bake.frames[i1];
  const o = i * 7;
  outPos.set(f0[o] + (f1[o] - f0[o]) * a, f0[o + 1] + (f1[o + 1] - f0[o + 1]) * a, f0[o + 2] + (f1[o + 2] - f0[o + 2]) * a);
  _q0.set(f0[o + 3], f0[o + 4], f0[o + 5], f0[o + 6]);
  _q1.set(f1[o + 3], f1[o + 4], f1[o + 5], f1[o + 6]);
  outQ.slerpQuaternions(_q0, _q1, a);
  if (outPos.y > -0.5) {
    _ex.set(1, 0, 0).applyQuaternion(outQ);
    _ey.set(0, 1, 0).applyQuaternion(outQ);
    _ez.set(0, 0, 1).applyQuaternion(outQ);
    const ext = Math.sqrt((GR[0] * _ex.y) ** 2 + (GR[1] * _ey.y) ** 2 + (GR[2] * _ez.y) ** 2);
    outPos.y = outPos.y - PHYS_R + ext;
  }
}

export const Grains: React.FC<{ t: number; hideHero?: boolean }> = ({ t, hideHero }) => {
  const bake = getJson<GrainBake>("data/grains_s14.json");
  const mat = useGrainMaterial();
  const geo = useMemo(() => grainGeometry(28, 16), []);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, bake?.n ?? 1);
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, [geo, mat, bake]);
  if (!bake) return null;
  for (let i = 0; i < bake.n; i++) {
    grainTransform(bake, i, t, _p, _q0);
    const hidden = t < 0 || _p.y < -0.5 || (hideHero && i === bake.hero);
    _s.setScalar(hidden ? 0 : 1);
    _m.compose(_p, _q0, _s);
    mesh.setMatrixAt(i, _m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

/** High-detail stand-in for the hero grain (macro). */
export const HeroGrain: React.FC<{ t: number }> = ({ t }) => {
  const bake = getJson<GrainBake>("data/grains_s14.json");
  const mat = useGrainMaterial();
  const geo = useMemo(() => grainGeometry(220, 110), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  if (!bake) return null;
  grainTransform(bake, bake.hero, t, pos, q);
  // once it has come to rest, sit the actual lowest vertex exactly on the desk (no hovering in macro)
  if (t > 0.9) {
    const pa = geo.attributes.position;
    let minY = Infinity;
    const v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i += 3) {
      v.set(pa.getX(i), pa.getY(i), pa.getZ(i)).applyQuaternion(q);
      if (v.y < minY) minY = v.y;
    }
    const settle = Math.min(1, (t - 0.9) / 0.4);
    pos.y = pos.y * (1 - settle) + (-minY + 0.000005) * settle;
  }
  const fwd = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  const yaw = Math.atan2(-fwd.z, fwd.x);
  const contact = t > 0.9 ? Math.min(1, (t - 0.9) / 0.4) : 0;
  return (
    <>
      <mesh geometry={geo} material={mat} position={[pos.x, pos.y, pos.z]} quaternion={new THREE.Quaternion(q.x, q.y, q.z, q.w)} castShadow receiveShadow />
      {contact > 0 ? (
        <>
          {/* contact occlusion right under the grain */}
          <mesh position={[pos.x, 0.00008, pos.z]} rotation={[-Math.PI / 2, 0, yaw]} material={shadowMat(contact)} renderOrder={3}>
            <planeGeometry args={[0.0034, 0.0027]} />
          </mesh>
          {/* soft cast shadow, away from the lamp (light comes from -x,-z) */}
          <mesh position={[pos.x + 0.0006, 0.00009, pos.z + 0.0006]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} material={shadowMat2(contact)} renderOrder={3}>
            <planeGeometry args={[0.0048, 0.0024]} />
          </mesh>
        </>
      ) : null}
    </>
  );
};

let _shadowTex: THREE.CanvasTexture | null = null;
const _shadowMat = new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, depthWrite: false, opacity: 0.7 });
const _shadowMat2 = new THREE.MeshBasicMaterial({ color: "#1a0d02", transparent: true, depthWrite: false, opacity: 0.5 });
function shadowMat2(k: number) {
  shadowMat(k);
  _shadowMat2.alphaMap = _shadowTex;
  _shadowMat2.opacity = 0.42 * k;
  _shadowMat2.needsUpdate = !_shadowMat2.userData.done;
  _shadowMat2.userData.done = true;
  return _shadowMat2;
}
function shadowMat(k: number) {
  if (!_shadowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g2 = c.getContext("2d")!;
    g2.fillStyle = "#000";
    g2.fillRect(0, 0, 256, 256);
    const grd = g2.createRadialGradient(128, 128, 4, 128, 128, 128);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.35, "#9a9a9a");
    grd.addColorStop(0.7, "#262626");
    grd.addColorStop(1, "#000000");
    g2.fillStyle = grd;
    g2.fillRect(0, 0, 256, 256);
    _shadowTex = new THREE.CanvasTexture(c);
    _shadowMat.alphaMap = _shadowTex;
    _shadowMat.needsUpdate = true;
  }
  _shadowMat.opacity = 0.62 * k;
  return _shadowMat;
}

export function heroPosition(t: number): THREE.Vector3 {
  const bake = getJson<GrainBake>("data/grains_s14.json");
  const p = new THREE.Vector3();
  if (!bake) return p;
  grainTransform(bake, bake.hero, t, p, new THREE.Quaternion());
  return p;
}
