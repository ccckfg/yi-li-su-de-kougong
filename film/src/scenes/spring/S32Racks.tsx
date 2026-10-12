import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rng } from "../../three/assets";
import { easeInOut, lerp3, type V3 } from "../../three/Rig";
import { Stage } from "../eras/Stage";

// Drying racks at the station: galvanised bars, bunches of ripe foxtail-millet heads hanging head-down,
// sun from the high windows behind -> rim-lit bristles (the "毛茸茸" halo) and dust in the shafts.

type Panicle = { pos: Float32Array; norm: Float32Array; idx: number[]; bristles: number[] };

function makePanicle(r: () => number, origin: THREE.Vector3, yaw: number, lean: number, len: number): Panicle {
  const rings = 40;
  const seg = 14;
  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const bristles: number[] = [];
  const stemL = 0.035 + r() * 0.02;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= rings; i++) {
    const s = i / rings;
    const d = stemL + len * s;
    // hangs down, bowing outward a little
    const out = Math.sin(s * 1.4) * lean * len;
    pts.push(new THREE.Vector3(origin.x + Math.cos(yaw) * out, origin.y - d, origin.z + Math.sin(yaw) * out));
  }
  for (let i = 0; i <= rings; i++) {
    const s = i / rings;
    const p = pts[i];
    const nxt = pts[Math.min(rings, i + 1)];
    const prv = pts[Math.max(0, i - 1)];
    const tan = nxt.clone().sub(prv).normalize();
    const side = new THREE.Vector3(0, 0, 1).cross(tan).normalize();
    if (side.lengthSq() < 0.01) side.set(1, 0, 0);
    const up = tan.clone().cross(side).normalize();
    const R = 0.002 + 0.0155 * Math.sin(Math.PI * Math.min(1, 0.06 + s * 0.98)) ** 0.6;
    for (let j = 0; j < seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      const lump = 1 + 0.18 * Math.sin(a * 5 + i * 1.7) * Math.sin(i * 0.9 + j);
      const n = side.clone().multiplyScalar(Math.cos(a)).add(up.clone().multiplyScalar(Math.sin(a)));
      const v = p.clone().add(n.clone().multiplyScalar(R * lump));
      pos.push(v.x, v.y, v.z);
      nrm.push(n.x, n.y, n.z);
      if (s > 0.08 && r() < 0.55) {
        const bl = 0.004 + r() * 0.006;
        const bdir = n.clone().multiplyScalar(0.8).add(tan.clone().multiplyScalar(0.4)).normalize();
        bristles.push(v.x, v.y, v.z, v.x + bdir.x * bl, v.y + bdir.y * bl, v.z + bdir.z * bl);
      }
    }
  }
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < seg; j++) {
      const a = i * seg + j;
      const b = i * seg + ((j + 1) % seg);
      const c = (i + 1) * seg + j;
      const d = (i + 1) * seg + ((j + 1) % seg);
      idx.push(a, c, b, b, c, d);
    }
  return { pos: new Float32Array(pos), norm: new Float32Array(nrm), idx, bristles };
}

function buildRacks() {
  const r = rng(21);
  const heads: THREE.BufferGeometry[] = [];
  const bristleAll: number[] = [];
  const bars: { y: number; z: number }[] = [
    { y: 1.0, z: 0.0 },
    { y: 1.0, z: -0.55 },
    { y: 1.0, z: -1.1 },
    { y: 1.0, z: -1.65 },
  ];
  const mergedPos: number[] = [];
  const mergedNrm: number[] = [];
  const mergedIdx: number[] = [];
  let base = 0;
  for (const bar of bars) {
    for (let x = -1.6; x <= 1.6; x += 0.17 + r() * 0.05) {
      const n = 3 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const o = new THREE.Vector3(x + (r() - 0.5) * 0.03, bar.y - 0.01, bar.z + (r() - 0.5) * 0.03);
        const p = makePanicle(r, o, r() * Math.PI * 2, 0.2 + r() * 0.25, 0.12 + r() * 0.06);
        for (let i = 0; i < p.pos.length; i++) {
          mergedPos.push(p.pos[i]);
          mergedNrm.push(p.norm[i]);
        }
        for (const i of p.idx) mergedIdx.push(i + base);
        base += p.pos.length / 3;
        for (const b of p.bristles) bristleAll.push(b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(mergedPos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(mergedNrm, 3));
  g.setIndex(mergedIdx);
  heads.push(g);
  const bg = new THREE.BufferGeometry();
  bg.setAttribute("position", new THREE.Float32BufferAttribute(bristleAll, 3));
  return { heads: g, bristles: bg, bars };
}

const Racks: React.FC = () => {
  const data = useMemo(buildRacks, []);
  const headMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c99a3c", roughness: 0.6, sheen: 0.8, sheenColor: new THREE.Color("#ffd27a"), sheenRoughness: 0.4 }), []);
  const bristleMat = useMemo(() => new THREE.LineBasicMaterial({ color: new THREE.Color(1.0, 0.78, 0.42).multiplyScalar(0.9), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9aa0a3", metalness: 0.9, roughness: 0.35 }), []);
  return (
    <group>
      <mesh geometry={data.heads} material={headMat} castShadow receiveShadow />
      <lineSegments geometry={data.bristles} material={bristleMat} />
      {data.bars.map((b, i) => (
        <mesh key={i} position={[0, b.y, b.z]} rotation={[0, 0, Math.PI / 2]} material={steel} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 3.6, 16]} />
        </mesh>
      ))}
    </group>
  );
};

const dustVert = /* glsl */ `
uniform float uTime; attribute float aSeed; varying float vA;
void main(){
  vec3 p = position;
  float t = uTime*0.08 + aSeed*30.0;
  p += vec3(sin(t*1.1+aSeed*4.0), sin(t*0.6+aSeed*9.0)*0.5 - uTime*0.01, cos(t*0.9+aSeed*2.0))*0.04;
  // brighter inside the slanted sun shafts
  float shaft = smoothstep(0.25, 0.0, abs(fract(p.x*0.9 - p.y*0.55 + 0.2) - 0.5));
  vA = (0.25 + 0.75*shaft) * (0.5 + 0.5*sin(aSeed*77.0 + uTime));
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_PointSize = (2.0 + 3.0*fract(aSeed*7.3)) * 1.6 / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const dustFrag = /* glsl */ `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); gl_FragColor = vec4(vec3(1.0,0.85,0.6)*vA*smoothstep(0.5,0.0,d)*1.4, 1.0); }`;

const Dust: React.FC<{ time: number }> = ({ time }) => {
  const geo = useMemo(() => {
    const r = rng(5);
    const n = 1600;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([(r() - 0.5) * 3.2, 0.2 + r() * 1.3, -2 + r() * 2.6], i * 3);
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, []);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: dustVert, fragmentShader: dustFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 } } }), []);
  mat.uniforms.uTime.value = time;
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

const Shafts: React.FC = () => {
  const mat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 512;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, "rgba(255,220,160,0.55)");
    grd.addColorStop(1, "rgba(255,220,160,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 512);
    const side = g.createLinearGradient(0, 0, 64, 0);
    side.addColorStop(0, "rgba(0,0,0,1)");
    side.addColorStop(0.5, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = side;
    g.fillRect(0, 0, 64, 512);
    const t = new THREE.CanvasTexture(c);
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, opacity: 0.35 });
  }, []);
  return (
    <group>
      {[-1.2, -0.3, 0.6, 1.4].map((x, i) => (
        <mesh key={i} material={mat} position={[x, 1.25, -1.0]} rotation={[0.1, 0, 0.55]}>
          <planeGeometry args={[0.45, 2.6]} />
        </mesh>
      ))}
    </group>
  );
};

export const S32: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const u = f / Math.max(1, durationInFrames - 1);
  const k = easeInOut(u);
  const pos: V3 = lerp3([-0.3, 0.74, 0.5], [0.12, 0.75, 0.46], k);
  const target: V3 = lerp3([-0.15, 0.86, -0.4], [0.27, 0.86, -0.4], k);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 38, near: 0.02, far: 10 }} focus={0.62} farBlur={9} bloom={0.9} vignette={0.6} background="#1a120a">
        <ambientLight intensity={0.12} color="#ffdcae" />
        {/* the sun behind the racks, slightly above: rim light */}
        <directionalLight position={[0.6, 2.2, -4]} intensity={6} color="#ffd9a0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <pointLight position={[0, 0.6, 1.4]} intensity={0.8} color="#8f9fb3" />
        {/* back wall with high windows */}
        <mesh position={[0, 1.2, -2.3]}>
          <planeGeometry args={[6, 3]} />
          <meshStandardMaterial color="#3b2c1e" roughness={0.9} />
        </mesh>
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <mesh key={x} position={[x, 1.75, -2.28]}>
            <planeGeometry args={[0.6, 0.5]} />
            <meshBasicMaterial color={new THREE.Color(1, 0.92, 0.75).multiplyScalar(6)} toneMapped={false} />
          </mesh>
        ))}
        <Shafts />
        <Racks />
        <Dust time={f / fps} />
      </Stage>
    </AbsoluteFill>
  );
};
