import { Bloom, ChromaticAberration, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { BokehDOF } from "../../three/BokehDOF";
import { Kick, rng } from "../../three/assets";
import { RigCamera, type V3 } from "../../three/Rig";

// The bottom of the S23 dive: B-DNA as a coarse-grained space-filling model, in nanometres.
// 10.5 bp per turn, 0.34 nm rise, ~2 nm across; the two backbones sit ~126° apart around the axis,
// which opens the wide major groove and the narrow minor groove. Lit like a confocal render:
// dark teal bodies, cyan rim, faint fluorescence, shallow focus.
const N_BP = 72;
const RISE = 0.34;
const TWIST = (Math.PI * 2) / 10.5;
const OFFSET = 2.2; // strand B backbone phase (rad) relative to strand A, same base pair
const R_P = 0.95;
const R_S = 0.72;

type Atom = { p: THREE.Vector3; r: number; kind: number };

function buildAtoms(): Atom[] {
  const r = rng(73);
  const atoms: Atom[] = [];
  const X = new THREE.Vector3(1, 0, 0);
  const at = (rad: number, ang: number, x: number) => new THREE.Vector3(x, Math.cos(ang) * rad, Math.sin(ang) * rad);
  // phosphate: P with four oxygens around it
  const phosphate = (c: THREE.Vector3, radial: THREE.Vector3) => {
    atoms.push({ p: c.clone(), r: 0.19, kind: 0 });
    const t1 = new THREE.Vector3().crossVectors(radial, X).normalize();
    for (const [dr, dt, dx] of [[0.13, 0, 0.06], [-0.04, 0.12, -0.07], [-0.04, -0.12, -0.07], [0.05, 0, -0.15]] as const)
      atoms.push({ p: c.clone().addScaledVector(radial, dr).addScaledVector(t1, dt).addScaledVector(X, dx), r: 0.15, kind: 0 });
  };
  // deoxyribose: a five-membered ring
  const sugar = (c: THREE.Vector3, radial: THREE.Vector3) => {
    const t1 = new THREE.Vector3().crossVectors(radial, X).normalize();
    for (let k = 0; k < 5; k++) {
      const q = (k / 5) * Math.PI * 2;
      atoms.push({ p: c.clone().addScaledVector(t1, Math.cos(q) * 0.12).addScaledVector(X, Math.sin(q) * 0.12), r: 0.13, kind: 1 });
    }
  };
  // bases lie flat, stacked along the axis: one ring (pyrimidine) or two fused rings (purine)
  const ring = (c: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3, n: number, rad: number, kind: number) => {
    for (let k = 0; k < n; k++) {
      const q = (k / n) * Math.PI * 2 + 0.3;
      atoms.push({ p: c.clone().addScaledVector(u, Math.cos(q) * rad).addScaledVector(v, Math.sin(q) * rad), r: 0.12, kind });
    }
  };
  for (let i = 0; i < N_BP; i++) {
    const x = (i - N_BP / 2) * RISE;
    const a = i * TWIST;
    const b = a + OFFSET;
    const radA = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
    const radB = new THREE.Vector3(0, Math.cos(b), Math.sin(b));
    // backbones run antiparallel: strand A's phosphate sits half a step up the axis, strand B's half a step down
    phosphate(at(R_P, a - TWIST * 0.45, x + RISE * 0.45), new THREE.Vector3(0, Math.cos(a - TWIST * 0.45), Math.sin(a - TWIST * 0.45)));
    phosphate(at(R_P, b + TWIST * 0.45, x - RISE * 0.45), new THREE.Vector3(0, Math.cos(b + TWIST * 0.45), Math.sin(b + TWIST * 0.45)));
    const sA = at(R_S, a + 0.18, x);
    const sB = at(R_S, b - 0.18, x);
    sugar(sA, radA);
    sugar(sB, radB);
    const u = sB.clone().sub(sA);
    const L = u.length();
    u.normalize();
    const v = new THREE.Vector3().crossVectors(X, u).normalize();
    const purineOnA = r() > 0.5;
    const kA = purineOnA ? (r() > 0.5 ? 2 : 3) : r() > 0.5 ? 4 : 5;
    const kB = purineOnA ? (kA === 2 ? 4 : 5) : kA === 4 ? 2 : 3;
    // pyrimidine ring ~0.28 nm across; purine = hexagon + pentagon; together they bridge the two sugars
    const base = (from: THREE.Vector3, dir: THREE.Vector3, purine: boolean, kind: number) => {
      if (purine) {
        ring(from.clone().addScaledVector(dir, 0.2), dir, v, 5, 0.12, kind);
        ring(from.clone().addScaledVector(dir, 0.43), dir, v, 6, 0.14, kind);
      } else {
        ring(from.clone().addScaledVector(dir, 0.27), dir, v, 6, 0.14, kind);
      }
    };
    base(sA, u, purineOnA, kA);
    base(sB, u.clone().negate(), !purineOnA, kB);
    void L;
  }
  return atoms;
}

const ATOMS = buildAtoms();
// backbone, sugar, A, G (purines), T, C (pyrimidines): all inside a cold palette
const KIND_COL = ["#0b4a57", "#0f6372", "#35c4d6", "#26a9bd", "#2f93c8", "#2479b0"].map((c) => new THREE.Color(c));

const Helix: React.FC<{ spin: number }> = ({ spin }) => {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.55,
        metalness: 0,
        specularIntensity: 0.35,
        emissive: "#0aa6c0",
        emissiveIntensity: 0.16,
        sheen: 0.6,
        sheenColor: new THREE.Color("#7fe8ff"),
        sheenRoughness: 0.35,
      }),
    [],
  );
  const inst = useMemo(() => {
    const m = new THREE.InstancedMesh(geo, mat, ATOMS.length);
    const M = new THREE.Matrix4();
    ATOMS.forEach((a, i) => {
      M.makeScale(a.r, a.r, a.r).setPosition(a.p);
      m.setMatrixAt(i, M);
      m.setColorAt(i, KIND_COL[a.kind]);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.frustumCulled = false;
    return m;
  }, [geo, mat]);
  return (
    <group rotation={[spin, 0, 0]}>
      <primitive object={inst} />
    </group>
  );
};

/** Soft nucleoplasm haze and floating particles, all out of focus. */
const Haze: React.FC<{ time: number }> = ({ time }) => {
  const geo = useMemo(() => {
    const r = rng(9);
    const n = 500;
    const pos = new Float32Array(n * 3);
    const s = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([(r() - 0.5) * 30, (r() - 0.5) * 10, (r() - 0.5) * 14], i * 3);
      s[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aS", new THREE.BufferAttribute(s, 1));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uT: { value: 0 } },
        vertexShader: `uniform float uT; attribute float aS; varying float vA;
          void main(){ vec3 p = position + vec3(sin(uT*0.4 + aS*30.0), cos(uT*0.3 + aS*17.0), sin(uT*0.35 + aS*9.0)) * 0.3;
            vec4 mv = modelViewMatrix * vec4(p, 1.0); float z = -mv.z;
            gl_PointSize = (6.0 + 30.0 * aS) * 12.0 / z; vA = (0.05 + 0.12 * aS) * smoothstep(1.5, 4.0, z);
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.3, 0.85, 1.0), smoothstep(0.5, 0.1, d) * vA); }`,
      }),
    [],
  );
  mat.uniforms.uT.value = time;
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

export const Dna3D: React.FC<{ t: number; time: number }> = ({ t, time }) => {
  const { width, height } = useVideoConfig();
  // the camera drifts along the helix and around it while the molecule turns
  const pos: V3 = [-3.4 + 2.6 * t, 2.2 - 0.9 * t, 12.0 - 3.6 * t];
  const target: V3 = [-0.8 + 1.6 * t, 0, 0];
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]) - 0.9;
  const gl = useMemo(() => ({ toneMapping: THREE.NoToneMapping, antialias: false, powerPreference: "high-performance" as const }), []);
  return (
    <ThreeCanvas width={width} height={height} gl={gl} camera={{ fov: 30, near: 0.1, far: 80, position: pos }}>
      <RigCamera pos={pos} target={target} fov={30} near={0.1} far={80} roll={-0.32} />
      <color attach="background" args={["#010507"]} />
      <ambientLight intensity={0.12} color="#7fd8ff" />
      <directionalLight position={[2, 4, 6]} intensity={2.4} color="#d8f6ff" />
      <directionalLight position={[-3, -2, -6]} intensity={4.5} color="#46d6ff" />
      <directionalLight position={[0, -5, 1]} intensity={1.2} color="#1aa0ff" />
      <pointLight position={[0, 0, 3]} intensity={14} distance={16} decay={2} color="#2ec4e6" />
      <group rotation={[0, 0, 0.32]}>
        <Helix spin={time * 1.1} />
      </group>
      <Haze time={time} />
      <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
        {/* contact shadows between atoms make the grooves and the base stack read in depth */}
        <N8AO aoRadius={0.35} distanceFalloff={1.2} intensity={3.2} quality="high" halfRes={false} />
        <SMAA />
        <BokehDOF focus={focus} farBlur={14} maxBlur={20} />
        <Bloom intensity={0.9} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur radius={0.8} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0012, 0.0008)} radialModulation modulationOffset={0.35} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Vignette offset={0.2} darkness={0.75} />
      </EffectComposer>
      <Kick />
    </ThreeCanvas>
  );
};
