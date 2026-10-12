import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { getTex, rng } from "../../three/assets";
import { easeInOut, easeOut, lerp3, type V3 } from "../../three/Rig";
import { GR, grainGeometry, GRAIN_PRELOAD, useGrainMaterial } from "../room/grains";
import { Stage } from "../eras/Stage";

// 露白 (docs/factcheck.md 12d): the grain swells with water; the radicle, sheathed in the coleorhiza,
// pushes out from the BASE (embryo end, local -x) first and turns down; the rest stays in the hull.
const SOIL_TEX = "tex/soil_section.jpg";

function crumbGeometry(seed: number) {
  const g = new THREE.SphereGeometry(1, 18, 12);
  const p = g.attributes.position;
  const r = rng(seed);
  const offs = Array.from({ length: 6 }, () => [r() - 0.5, r() - 0.5, r() - 0.5, r() * 0.35] as const);
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
    let k = 1;
    for (const [a, b, c, s] of offs) k += s * 0.5 * Math.sin(v.dot(new THREE.Vector3(a, b, c).normalize()) * 4.0);
    v.multiplyScalar(k * (0.85 + 0.15 * Math.sin(v.x * 7 + v.y * 5)));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export const Crumbs: React.FC = () => {
  const geo = useMemo(() => crumbGeometry(3), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.85, clearcoat: 0.25, clearcoatRoughness: 0.35 }), []);
  const mesh = useMemo(() => {
    const r = rng(8);
    const n = 160;
    const m = new THREE.InstancedMesh(geo, mat, n);
    const M = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      // a pocket left clear around the grain at the origin
      let x = 0;
      let y = 0;
      let z = 0;
      for (let tries = 0; tries < 20; tries++) {
        x = (r() - 0.5) * 0.02;
        y = (r() - 0.5) * 0.012;
        z = -0.0055 + r() * 0.0035;
        if (Math.hypot(x / 1.6, y / 1.3) > 0.0021) break;
      }
      const s = 0.00012 + Math.pow(r(), 2.6) * 0.0008;
      q.setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
      M.compose(new THREE.Vector3(x, y, z + 0.004), q, new THREE.Vector3(s, s * (0.55 + r() * 0.4), s * 0.6));
      m.setMatrixAt(i, M);
      col.setHSL(0.07 + r() * 0.03, 0.3 + r() * 0.2, 0.06 + r() * 0.08);
      m.setColorAt(i, col);
    }
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }, [geo, mat]);
  return <primitive object={mesh} />;
};

const Radicle: React.FC<{ grow: number; anchor: THREE.Vector3 }> = ({ grow, anchor }) => {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f7f3ea", roughness: 0.35, transmission: 0.25, thickness: 0.0004, sheen: 0.6, sheenColor: new THREE.Color("#ffffff"), clearcoat: 0.6, clearcoatRoughness: 0.2 }), []);
  if (grow <= 0.001) return null;
  // out of the base, then bending downward (gravitropism)
  const L = 0.0011 * grow;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const s = i / 16;
    const a = Math.PI + s * 0.9 * grow; // starts pointing -x, turns toward -y
    pts.push(new THREE.Vector3(anchor.x + Math.cos(a) * L * s * 0.9 - 0.00005, anchor.y - Math.sin(a) * 0 - L * s * s * 0.6, anchor.z + 0.00003 * s));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 24, 0.00017, 16, false);
  const tip = pts[pts.length - 1];
  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow />
      <mesh position={[tip.x, tip.y, tip.z]} material={mat}>
        <sphereGeometry args={[0.000175, 16, 12]} />
      </mesh>
    </group>
  );
};

const Soil: React.FC = () => {
  const tex = getTex(SOIL_TEX);
  return (
    <mesh position={[0, 0, -0.0016]}>
      <planeGeometry args={[0.03, 0.017]} />
      <meshStandardMaterial map={tex} roughness={0.8} color="#8a7a6c" />
    </mesh>
  );
};

const Grain: React.FC<{ swell: number; loosen: number }> = ({ swell, loosen }) => {
  const geo = useMemo(() => grainGeometry(200, 100), []);
  const mat = useGrainMaterial();
  const s = 1 + 0.12 * swell;
  return <mesh geometry={geo} material={mat} rotation={[0.25, 0.5 - loosen * 0.03, -0.18]} scale={[s, s * 1.02, s]} castShadow receiveShadow />;
};

export const S35: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const u = f / Math.max(1, durationInFrames - 1);
  const swell = easeOut(t / 1.3, 2);
  const grow = easeInOut((t - 1.25) / 1.1);
  const pos: V3 = lerp3([0.0012, 0.0016, 0.0145], [0.0006, 0.0009, 0.0108], easeInOut(u));
  const target: V3 = [-0.0004, -0.0002, 0];
  // embryo end of the grain (local -x), after the grain's rotation and swell
  const anchor = new THREE.Vector3(-GR[0] * (1 + 0.12 * swell), 0, 0).applyEuler(new THREE.Euler(0.25, 0.5, -0.18));
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 30, near: 0.0008, far: 1 }} focus={focus} farBlur={22} bloom={0.4} vignette={0.75} background="#0b0705" preload={{ tex: [SOIL_TEX, ...GRAIN_PRELOAD.tex] }}>
        <ambientLight intensity={0.035} color="#d8c8b0" />
        <spotLight position={[0.03, 0.06, 0.06]} angle={0.35} penumbra={0.9} intensity={0.022} color="#ffe7c4" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00002} />
        <pointLight position={[-0.02, -0.01, 0.02]} intensity={0.00025} color="#9fb4c8" />
        <Soil />
        <Grain swell={swell} loosen={grow} />
        <Radicle grow={grow} anchor={anchor} />
      </Stage>
    </AbsoluteFill>
  );
};
