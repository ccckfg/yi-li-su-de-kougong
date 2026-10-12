import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rng, useTex } from "../../three/assets";
import { easeInOut, lerp3, smooth, type V3 } from "../../three/Rig";
import { Stage } from "./Stage";

// Banpo painted pottery (docs/factcheck.md #8): red-brown ground, black paint; geometric bands,
// abstracted fish, and our frieze — people carrying millet to round bag-shaped storage pits.
const PROFILE: [number, number][] = [
  [0.0, 0.0], [0.055, 0.0], [0.075, 0.012], [0.105, 0.045], [0.135, 0.09], [0.155, 0.135], [0.163, 0.17],
  [0.158, 0.205], [0.14, 0.24], [0.112, 0.268], [0.085, 0.287], [0.072, 0.3], [0.07, 0.312], [0.078, 0.322], [0.082, 0.328],
];

function drawPattern(): HTMLCanvasElement {
  const W = 4096;
  const H = 1024; // v: 0 bottom .. 1 rim
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = rng(31);
  // terracotta ground with burnish and firing clouds
  g.fillStyle = "#a9552f";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9000; i++) {
    const x = r() * W;
    const y = r() * H;
    const s = 2 + r() * 10;
    g.fillStyle = r() > 0.5 ? `rgba(70,25,10,${0.03 + r() * 0.05})` : `rgba(220,140,90,${0.03 + r() * 0.05})`;
    g.fillRect(x, y, s, s * 0.6);
  }
  for (let i = 0; i < 14; i++) {
    const grd = g.createRadialGradient(r() * W, r() * H, 10, r() * W, r() * H, 200 + r() * 300);
    grd.addColorStop(0, "rgba(40,15,8,0.18)");
    grd.addColorStop(1, "rgba(40,15,8,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
  }
  const vy = (v: number) => H * (1 - v); // canvas y from v
  const ink = "rgba(18,12,10,0.94)";
  const wob = () => (r() - 0.5) * 2.5;
  // rim band + neck sawtooth
  g.fillStyle = ink;
  g.fillRect(0, vy(1.0), W, vy(0.955) - vy(1.0));
  const nTri = 48;
  for (let i = 0; i < nTri; i++) {
    const x0 = (i / nTri) * W;
    const x1 = ((i + 1) / nTri) * W;
    g.beginPath();
    g.moveTo(x0 + wob(), vy(0.93));
    g.lineTo(x1 + wob(), vy(0.93));
    g.lineTo((x0 + x1) / 2 + wob(), vy(0.86));
    g.closePath();
    g.fill();
  }
  g.fillRect(0, vy(0.845), W, 9);
  // frieze: walking figures carrying sheaves to round, bag-shaped pits
  const reps = 7;
  for (let k = 0; k < reps; k++) {
    const x = (k / reps) * W + 60;
    const base = vy(0.6);
    // pit (bag-shaped: narrow mouth, wide belly)
    g.lineWidth = 9;
    g.strokeStyle = ink;
    g.beginPath();
    g.moveTo(x + 330, base - 6);
    g.bezierCurveTo(x + 300, base + 30, x + 300, base + 95, x + 360, base + 100);
    g.bezierCurveTo(x + 420, base + 95, x + 420, base + 30, x + 390, base - 6);
    g.stroke();
    // grain heap inside the pit
    for (let d = 0; d < 26; d++) {
      g.beginPath();
      g.arc(x + 330 + r() * 60, base + 55 + r() * 40, 4, 0, Math.PI * 2);
      g.fillStyle = ink;
      g.fill();
    }
    // two figures: triangular bodies, round heads, arms up holding a drooping sheaf
    for (let f = 0; f < 2; f++) {
      const fx = x + f * 120;
      g.fillStyle = ink;
      g.beginPath();
      g.arc(fx + 40, base - 150, 15, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(fx + 40, base - 132);
      g.lineTo(fx + 12, base - 40);
      g.lineTo(fx + 68, base - 40);
      g.closePath();
      g.fill();
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(fx + 28, base - 40);
      g.lineTo(fx + 18, base);
      g.moveTo(fx + 52, base - 40);
      g.lineTo(fx + 66, base);
      g.moveTo(fx + 40, base - 118);
      g.lineTo(fx + 85, base - 170);
      g.stroke();
      // sheaf: stalks + drooping heads
      g.lineWidth = 5;
      for (let s = 0; s < 4; s++) {
        g.beginPath();
        g.moveTo(fx + 82, base - 168);
        g.quadraticCurveTo(fx + 110 + s * 6, base - 220, fx + 128 + s * 9, base - 196 + s * 3);
        g.stroke();
        g.beginPath();
        g.ellipse(fx + 131 + s * 9, base - 188 + s * 3, 6, 15, 0.5, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  // band below the frieze
  g.fillRect(0, vy(0.53), W, 10);
  g.fillRect(0, vy(0.51), W, 5);
  // abstracted Banpo fish: black triangles for the back, ground showing for the belly
  const nFish = 9;
  for (let i = 0; i < nFish; i++) {
    const x = (i / nFish) * W + 40;
    const y = vy(0.43);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 300, y - 42);
    g.lineTo(x + 330, y);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(x + 330, y);
    g.lineTo(x + 380, y - 30);
    g.lineTo(x + 380, y + 30);
    g.closePath();
    g.fill();
    g.beginPath();
    g.arc(x + 60, y - 10, 7, 0, Math.PI * 2);
    g.fillStyle = "#a9552f";
    g.fill();
    g.fillStyle = ink;
  }
  g.fillRect(0, vy(0.36), W, 6);
  return c;
}

/** Cracks open along the black painted lines and branch off them: they glow like the S17 pyromantic crack. */
function drawCracks(): HTMLCanvasElement {
  const W = 4096;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  const r = rng(808);
  const vy = (v: number) => H * (1 - v);
  const walk = (x: number, y: number, ang: number, len: number, w: number, depth: number) => {
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < len; s += 10) {
      ang += (r() - 0.5) * 0.7;
      x += Math.cos(ang) * 10;
      y += Math.sin(ang) * 10;
      g.lineTo(x, y);
      if (depth < 2 && r() < 0.04) {
        g.stroke();
        walk(x, y, ang + (r() > 0.5 ? 1.2 : -1.2), len * 0.4, w * 0.6, depth + 1);
        g.lineWidth = w;
        g.beginPath();
        g.moveTo(x, y);
      }
    }
    g.stroke();
  };
  g.lineCap = "round";
  g.strokeStyle = "#fff";
  for (const v of [0.53, 0.36, 0.845]) {
    for (let k = 0; k < 6; k++) {
      const x = r() * W;
      walk(x, vy(v), (r() > 0.5 ? 0 : Math.PI) + (r() - 0.5) * 0.3, 500 + r() * 700, 3.5, 0);
      walk(x, vy(v), (r() > 0.5 ? 1 : -1) * Math.PI * 0.5 + (r() - 0.5) * 0.5, 120 + r() * 260, 2.5, 1);
    }
  }
  const glow = document.createElement("canvas");
  glow.width = W;
  glow.height = H;
  const gg = glow.getContext("2d")!;
  gg.filter = "blur(6px)";
  gg.drawImage(c, 0, 0);
  gg.filter = "none";
  gg.globalCompositeOperation = "lighter";
  gg.drawImage(c, 0, 0);
  return glow;
}

const Jar: React.FC<{ rot: number; crack: number }> = ({ rot, crack }) => {
  const kn = useTex("tex/kraft_nrm.png", { srgb: false, repeat: [6, 2] });
  // Catmull-Rom through the profile: v stays proportional to the control index, so the pattern bands keep their place
  const geo = useMemo(() => new THREE.LatheGeometry(new THREE.SplineCurve(PROFILE.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(196), 220), []);
  const map = useMemo(() => {
    const t = new THREE.CanvasTexture(drawPattern());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map, normalMap: kn, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.78, clearcoat: 0.15, clearcoatRoughness: 0.6, sheen: 0.2, sheenColor: new THREE.Color("#d9a07a") }),
    [map, kn],
  );
  const cracks = useMemo(() => {
    const t = new THREE.CanvasTexture(drawCracks());
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, []);
  if (mat.emissiveMap !== cracks) {
    mat.emissiveMap = cracks;
    mat.needsUpdate = true;
  }
  mat.emissive = new THREE.Color("#ff6a20");
  mat.emissiveIntensity = crack * 3.2;
  return <mesh geometry={geo} material={mat} rotation={[0, rot, 0]} castShadow receiveShadow />;
};

export const S16: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const u = f / Math.max(1, durationInFrames - 1);
  // open pressed against the clay wall, pull back to the whole jar while it turns
  const k = easeInOut(Math.min(1, u / 0.62));
  const pos: V3 = lerp3([0.06, 0.17, 0.19], [0.0, 0.2, 0.72], k);
  const target: V3 = lerp3([0.0, 0.165, 0.0], [0.0, 0.165, 0.0], k);
  const crack = smooth((u - 0.8) / 0.2);
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]) - 0.15 * (1 - k);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 32 }} focus={focus} farBlur={6} bloom={0.45} preload={{ tex: ["tex/kraft_nrm.png"] }} background="#070403">
        <ambientLight intensity={0.05} color="#ffd9b0" />
        <spotLight position={[-0.6, 0.8, 0.6]} angle={0.5} penumbra={0.8} intensity={14} color="#ffd2a0" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} shadow-normalBias={0.015} />
        <pointLight position={[0.5, 0.35, -0.4]} intensity={0.8} color="#ff8c4a" />
        <spotLight position={[0.55, 0.5, -0.55]} angle={0.4} penumbra={0.9} intensity={6} color="#9fb2d6" />
        <BeamDust time={t} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.5, 64]} />
          <meshStandardMaterial color="#1a0f0a" roughness={0.95} />
        </mesh>
        <Jar rot={0.9 + t * 0.32} crack={crack} />
      </Stage>

    </AbsoluteFill>
  );
};

/** Dust turning slowly in the key light. */
const BeamDust: React.FC<{ time: number }> = ({ time }) => {
  const geo = useMemo(() => {
    const r = rng(5);
    const n = 260;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) pos.set([(r() - 0.5) * 0.9, r() * 0.6, (r() - 0.3) * 0.7], i * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uT: { value: 0 } },
        vertexShader: `uniform float uT; varying float vA;
          void main(){ vec3 p = position; float s = fract(sin(dot(p.xz, vec2(12.9898, 78.233))) * 43758.5453);
            p += vec3(sin(uT * 0.3 + s * 20.0), sin(uT * 0.21 + s * 9.0) * 0.6 - uT * 0.01, cos(uT * 0.25 + s * 7.0)) * 0.02;
            vec3 L = vec3(-0.6, 0.8, 0.6), A = vec3(0.0, 0.15, 0.0); vec3 ax = normalize(A - L);
            float beam = length(cross(p - L, ax));
            vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (1.0 + 2.0 * s) * 1.1 / -mv.z; vA = (0.12 + 0.3 * s) * smoothstep(0.32, 0.08, beam);
            gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(1.0, 0.85, 0.65), smoothstep(0.5, 0.0, d) * vA); }`,
      }),
    [],
  );
  mat.uniforms.uT.value = time;
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};
