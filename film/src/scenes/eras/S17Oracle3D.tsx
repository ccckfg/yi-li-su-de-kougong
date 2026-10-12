import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rng } from "../../three/assets";
import { easeInOut, lerp3, noise1, smooth, type V3 } from "../../three/Rig";
import { HE_PATH } from "./he_path";
import { FireEnv } from "./FireEnv";
import { GS, GX0, GY0, grow, makeMilletMats, Plant, STEM } from "./millet";
import { Stage } from "./Stage";

// 商 · 殷墟, in 3D. A firelit plastron: the pyromantic 卜 crack splits open glowing and spitting sparks,
// the carved oracle-bone 禾 (public-domain glyph) fills with light, and a real foxtail millet plant
// grows out of its strokes — stem from the upright, leaves from the arms, roots from the feet, the
// top hook swelling into a heavy ear that bows to the left exactly like the glyph. At the end the
// plant sets into bronze (hand-off to S18).

// ------------------------------------------------------------------ layout
const PW = 1.9;
const PH = 1.35;
const TW = 2048;
const TH = 1456;
/** world xy -> texture canvas px */
const toC = (X: number, Y: number): [number, number] => [((X + PW / 2) / PW) * TW, ((PH / 2 - Y) / PH) * TH];

function outline(): [number, number][] {
  const r = rng(5);
  const pts: [number, number][] = [];
  const n = 120;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.025 * Math.sin(a * 5 + 1) + 0.012 * Math.sin(a * 13 + 2) + (r() - 0.5) * 0.006;
    const notch = (ac: number, w: number, d: number) => {
      const da = Math.atan2(Math.sin(a - ac), Math.cos(a - ac));
      return Math.exp(-(da * da) / (w * w)) * d;
    };
    const nd = notch(Math.PI / 2, 0.1, 0.06) + notch(-Math.PI / 2, 0.13, 0.1) + notch(Math.PI * 0.18, 0.06, 0.03) + notch(Math.PI * 0.82, 0.06, 0.03);
    pts.push([-0.03 + Math.cos(a) * 0.9 * k * (1 - nd), 0.02 + Math.sin(a) * 0.66 * k * (1 - nd)]);
  }
  return pts;
}

/** The 卜 crack: a wandering upright and one branch, as world polylines. */
function crackLines(): [number, number][][] {
  const r = rng(9);
  const walk = (x: number, y: number, ang: number, len: number, step: number, wob: number) => {
    const pts: [number, number][] = [[x, y]];
    for (let s = 0; s < len; s += step) {
      ang += (r() - 0.5) * wob;
      x += Math.cos(ang) * step;
      y += Math.sin(ang) * step;
      pts.push([x, y]);
    }
    return pts;
  };
  const main = walk(-0.36, 0.36, -Math.PI / 2, 0.66, 0.008, 0.5);
  const j = main[Math.floor(main.length * 0.42)];
  const branch = walk(j[0], j[1], -0.25, 0.2, 0.008, 0.6);
  const hair1 = walk(main[20][0], main[20][1], Math.PI * 0.95, 0.05, 0.006, 0.9);
  const hair2 = walk(main[60][0], main[60][1], -0.1, 0.04, 0.006, 0.9);
  return [main, branch, hair1, hair2];
}

const CRACKS = crackLines();
const OUTLINE = outline();

// ------------------------------------------------------------------ textures
type BoneTex = { map: THREE.Texture; normal: THREE.Texture; height: THREE.Texture; emissive: THREE.Texture; alpha: THREE.Texture };

function glyphOnCanvas(g: CanvasRenderingContext2D) {
  const k = (GS * TW) / PW;
  const ox = (GX0 - 236 * GS + PW / 2) * (TW / PW);
  const oy = (PH / 2 - GY0 - 233 * GS) * (TH / PH);
  g.translate(ox, oy);
  g.scale(k, k);
  g.translate(0, 468);
  g.scale(0.445714, -0.445714);
}

function strokePoly(g: CanvasRenderingContext2D, pts: [number, number][]) {
  g.beginPath();
  pts.forEach(([x, y], i) => {
    const [cx, cy] = toC(x, y);
    if (i === 0) g.moveTo(cx, cy);
    else g.lineTo(cx, cy);
  });
  g.stroke();
}

function seams(): [number, number][][] {
  // scute sulci of the plastron: the midline and a few gently curved cross seams
  const out: [number, number][][] = [];
  const mid: [number, number][] = [];
  for (let y = -0.62; y <= 0.66; y += 0.02) mid.push([-0.13 + 0.012 * Math.sin(y * 9), y]);
  out.push(mid);
  for (const [y0, bend] of [[0.42, 0.05], [0.12, -0.03], [-0.2, 0.04], [-0.46, -0.05]] as const) {
    const s: [number, number][] = [];
    for (let x = -0.92; x <= 0.86; x += 0.02) s.push([x, y0 + bend * (1 - (x / 0.9) ** 2) + 0.006 * Math.sin(x * 23)]);
    out.push(s);
  }
  return out;
}

function makeBoneTextures(): BoneTex {
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = TW;
    c.height = TH;
    return [c, c.getContext("2d")!] as const;
  };
  const glyph = new Path2D(HE_PATH);
  const r = rng(17);
  const seamLines = seams();

  // ---- colour
  const [cc, g] = mk();
  g.fillStyle = "#e2d2ae";
  g.fillRect(0, 0, TW, TH);
  for (let i = 0; i < 60000; i++) {
    g.fillStyle = r() > 0.5 ? `rgba(120,90,50,${0.03 + r() * 0.06})` : `rgba(250,240,215,${0.03 + r() * 0.06})`;
    g.fillRect(r() * TW, r() * TH, 1 + r() * 4, 1 + r() * 2);
  }
  g.strokeStyle = "rgba(140,105,60,0.10)";
  for (let i = 0; i < 70; i++) {
    g.lineWidth = 1 + r() * 2.5;
    g.beginPath();
    const y0 = r() * TH;
    g.moveTo(0, y0);
    for (let x = 0; x <= TW; x += 50) g.lineTo(x, y0 + Math.sin(x * 0.003 + i) * 40 + (r() - 0.5) * 5);
    g.stroke();
  }
  // scorch where the hot rod touched the back (around the crack junction) and along the rim
  const [jx, jy] = toC(CRACKS[1][0][0], CRACKS[1][0][1]);
  for (const [rad, a] of [[260, 0.55], [140, 0.6], [60, 0.7]] as const) {
    const sg = g.createRadialGradient(jx, jy, 4, jx, jy, rad);
    sg.addColorStop(0, `rgba(40,14,4,${a})`);
    sg.addColorStop(1, "rgba(40,14,4,0)");
    g.fillStyle = sg;
    g.fillRect(0, 0, TW, TH);
  }
  g.save();
  g.lineWidth = 120;
  g.strokeStyle = "rgba(50,22,8,0.5)";
  g.filter = "blur(40px)";
  strokePoly(g, [...OUTLINE, OUTLINE[0]]);
  g.restore();
  // seams
  g.strokeStyle = "rgba(90,60,30,0.35)";
  g.lineWidth = 3;
  for (const s of seamLines) strokePoly(g, s);
  // carved strokes hold grime
  g.save();
  glyphOnCanvas(g);
  g.fillStyle = "rgba(70,42,22,0.92)";
  g.fill(glyph);
  g.restore();
  // cracks
  g.strokeStyle = "rgba(25,10,4,0.95)";
  g.lineCap = "round";
  CRACKS.forEach((c, i) => {
    g.lineWidth = i < 2 ? 3.2 : 1.6;
    strokePoly(g, c);
  });

  // ---- height (white = surface)
  const [, h] = mk();
  h.fillStyle = "#ffffff";
  h.fillRect(0, 0, TW, TH);
  for (let i = 0; i < 14000; i++) {
    h.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.07})`;
    h.beginPath();
    h.ellipse(r() * TW, r() * TH, 0.5 + r() * 1.1, 0.4 + r() * 0.7, r() * 3, 0, Math.PI * 2);
    h.fill();
  }
  h.save();
  h.filter = "blur(1.5px)";
  for (let i = 0; i < 900; i++) {
    const x = r() * TW;
    const y = r() * TH;
    const L = 20 + r() * 90;
    const a = 0.25 + (r() - 0.5) * 0.4;
    h.strokeStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`;
    h.lineWidth = 1 + r() * 2;
    h.beginPath();
    h.moveTo(x, y);
    h.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L);
    h.stroke();
  }
  h.restore();
  h.save();
  h.filter = "blur(2px)";
  h.strokeStyle = "rgba(0,0,0,0.2)";
  h.lineWidth = 5;
  for (const s of seamLines) strokePoly(h, s);
  h.restore();
  h.save();
  h.filter = "blur(2.5px)";
  glyphOnCanvas(h);
  h.fillStyle = "#000";
  h.fill(glyph);
  h.restore();
  h.save();
  h.filter = "blur(0.8px)";
  h.strokeStyle = "#000";
  h.lineCap = "round";
  CRACKS.forEach((c, i) => {
    h.lineWidth = i < 2 ? 3 : 1.5;
    strokePoly(h, c);
  });
  h.restore();

  // ---- displacement: only what is wide enough for the mesh to carry (glyph, seams); fine detail stays in the normals
  const [dc, dg] = mk();
  dg.fillStyle = "#ffffff";
  dg.fillRect(0, 0, TW, TH);
  dg.save();
  dg.filter = "blur(3px)";
  dg.strokeStyle = "rgba(0,0,0,0.2)";
  dg.lineWidth = 6;
  for (const s2 of seamLines) strokePoly(dg, s2);
  dg.restore();
  dg.save();
  dg.filter = "blur(3px)";
  glyphOnCanvas(dg);
  dg.fillStyle = "#000";
  dg.fill(glyph);
  dg.restore();

  // ---- normal map from height (OpenGL convention, canvas row 0 = top = +v)
  const hd = h.getImageData(0, 0, TW, TH).data;
  const [nc, n] = mk();
  const nd = n.createImageData(TW, TH);
  const px = PW / TW; // metres per pixel
  const depth = 0.006;
  const H = (x: number, y: number) => hd[(Math.min(TH - 1, Math.max(0, y)) * TW + Math.min(TW - 1, Math.max(0, x))) * 4] / 255;
  for (let y = 0; y < TH; y++)
    for (let x = 0; x < TW; x++) {
      const dx = ((H(x + 1, y) - H(x - 1, y)) * depth) / (2 * px);
      const dy = (-(H(x, y + 1) - H(x, y - 1)) * depth) / (2 * px);
      const l = Math.hypot(dx, dy, 1);
      const o = (y * TW + x) * 4;
      nd.data[o] = (-dx / l) * 127.5 + 127.5;
      nd.data[o + 1] = (-dy / l) * 127.5 + 127.5;
      nd.data[o + 2] = (1 / l) * 127.5 + 127.5;
      nd.data[o + 3] = 255;
    }
  n.putImageData(nd, 0, 0);

  // ---- emissive: R = crack heat, G = glyph glow
  const [ec, e] = mk();
  e.fillStyle = "#000";
  e.fillRect(0, 0, TW, TH);
  e.globalCompositeOperation = "lighter";
  e.lineCap = "round";
  for (const [w, a, blur] of [[7, 0.28, 5], [2.2, 1, 0.9]] as const) {
    e.save();
    e.filter = `blur(${blur}px)`;
    e.strokeStyle = `rgba(255,0,0,${a})`;
    CRACKS.forEach((c, i) => {
      e.lineWidth = i < 2 ? w : w * 0.5;
      strokePoly(e, c);
    });
    e.restore();
  }
  e.save();
  e.filter = "blur(9px)";
  glyphOnCanvas(e);
  e.fillStyle = "rgba(0,255,0,1)";
  e.fill(glyph);
  e.restore();

  // ---- alpha: the plastron outline
  const [ac, a] = mk();
  a.fillStyle = "#000";
  a.fillRect(0, 0, TW, TH);
  a.fillStyle = "#fff";
  a.beginPath();
  OUTLINE.forEach(([x, y], i) => {
    const [cx, cy] = toC(x, y);
    if (i === 0) a.moveTo(cx, cy);
    else a.lineTo(cx, cy);
  });
  a.closePath();
  a.fill();

  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 16;
    return t;
  };
  return { map: tex(cc, true), normal: tex(nc, false), height: tex(dc, false), emissive: tex(ec, false), alpha: tex(ac, false) };
}

const E_NOISE = /* glsl */ `
float eHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float eNoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 w = f*f*(3.0-2.0*f);
  return mix(mix(eHash(i), eHash(i + vec2(1, 0)), w.x), mix(eHash(i + vec2(0, 1)), eHash(i + vec2(1, 1)), w.x), w.y); }
`;

// ------------------------------------------------------------------ the plastron
const Plastron: React.FC<{ crack: number; glyph: number; dim: number; time: number }> = ({ crack, glyph, dim, time }) => {
  const T = useMemo(makeBoneTextures, []);
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      map: T.map,
      normalMap: T.normal,
      displacementMap: T.height,
      displacementScale: 0.006,
      displacementBias: -0.006,
      alphaMap: T.alpha,
      alphaTest: 0.5,
      roughness: 0.48,
      sheen: 0.35,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#ffd8a8"),
      emissiveMap: T.emissive,
      emissive: new THREE.Color("#ffffff"),
      emissiveIntensity: 1,
    });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uCrack = { value: m.userData.crack ?? 0 };
      sh.uniforms.uGlyph = { value: m.userData.glyph ?? 0 };
      sh.uniforms.uTime = { value: m.userData.time ?? 0 };
      m.userData.shader = sh;
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uCrack;\nuniform float uGlyph;\nuniform float uTime;\n" + E_NOISE)
        .replace(
          "#include <emissivemap_fragment>",
          `vec4 emT = texture2D( emissiveMap, vEmissiveMapUv );
          float cr = emT.r, gl = emT.g;
          vec2 eu = vEmissiveMapUv;
          mat2 rA = mat2(0.8, -0.6, 0.6, 0.8);
          mat2 rB = mat2(0.36, 0.93, -0.93, 0.36);
          float flick = eNoise(rA * eu * 70.0 + vec2(uTime * 0.9, -uTime * 0.7)) * 0.5
                      + eNoise(rB * eu * 160.0 - vec2(uTime * 1.6, uTime * 1.2)) * 0.3
                      + eNoise(rA * rB * eu * 380.0 + uTime * 2.0) * 0.2;
          gl *= mix(1.0, smoothstep(0.15, 0.85, flick), 0.45);
          totalEmissiveRadiance = (vec3(1.0, 0.22, 0.03) * cr + vec3(1.0, 0.75, 0.35) * pow(cr, 4.0) * 2.0) * uCrack
                                + (vec3(1.0, 0.25, 0.03) * pow(gl, 2.5) * 0.8 + vec3(1.0, 0.7, 0.3) * pow(gl, 10.0) * 1.6) * uGlyph;`,
        );
    };
    m.onBeforeRender = () => {
      const s = m.userData.shader as { uniforms: Record<string, { value: number }> } | undefined;
      if (s) {
        s.uniforms.uCrack.value = m.userData.crack;
        s.uniforms.uGlyph.value = m.userData.glyph;
        s.uniforms.uTime.value = m.userData.time;
      }
    };
    return m;
  }, [T]);
  mat.userData.crack = crack;
  mat.userData.glyph = glyph;
  mat.userData.time = time;
  mat.color.setScalar(1 - 0.88 * dim);
  const plane = useMemo(() => new THREE.PlaneGeometry(PW, PH, 700, 497), []);
  const body = useMemo(() => {
    const s = new THREE.Shape(OUTLINE.map(([x, y]) => new THREE.Vector2(x * 0.996, y * 0.996)));
    return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 4, curveSegments: 6 });
  }, []);
  return (
    <group>
      <mesh geometry={plane} material={mat} receiveShadow />
      <mesh geometry={body} position={[0, 0, -0.0065 - 0.038]} receiveShadow castShadow>
        <meshStandardMaterial color="#3a2010" roughness={0.85} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ fire: embers and the crack's burst
const EMBER_VERT = /* glsl */ `
uniform float uTime; uniform float uPx; uniform float uBurst; uniform vec3 uBurstAt;
attribute vec4 aR;
varying float vA; varying float vHot;
void main(){
  vec3 p;
  float life;
  if (aR.w < 0.75) {
    // rising embers from the fire below
    float per = 1.4 + aR.x * 1.6;
    float ph = fract(uTime / per + aR.y);
    life = ph;
    p = vec3((aR.x - 0.5) * 1.9, -0.85 + ph * (1.4 + aR.z), 0.05 + aR.z * 0.6);
    p.x += sin(uTime * 2.0 + aR.y * 30.0) * 0.05 * ph + sin(uTime * 0.7 + aR.x * 9.0) * 0.12 * ph;
    vA = smoothstep(0.0, 0.1, ph) * smoothstep(1.0, 0.6, ph);
  } else {
    // sparks spat out of the crack as it splits
    float t = clamp(uBurst - aR.y * 0.3, 0.0, 1.0);
    life = t;
    vec3 v = normalize(vec3((aR.x - 0.5) * 1.6, (aR.z - 0.3) * 1.4, 0.6 + aR.y)) * (0.35 + aR.z * 0.5);
    p = uBurstAt + vec3(0.0, (aR.x - 0.5) * 0.5, 0.0) + v * t - vec3(0.0, 0.5, 0.0) * t * t;
    vA = step(0.001, t) * smoothstep(1.0, 0.4, t);
  }
  vHot = 1.0 - life;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.4 + 2.4 * fract(aR.x * 13.1)) * uPx / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const EMBER_FRAG = /* glsl */ `
varying float vA; varying float vHot;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(vec3(1.0, 0.32, 0.05), vec3(1.0, 0.85, 0.5), vHot * vHot);
  gl_FragColor = vec4(col * 4.0, a * vA);
}`;

const Embers: React.FC<{ time: number; burst: number; px: number }> = ({ time, burst, px }) => {
  const geo = useMemo(() => {
    const r = rng(41);
    const n = 700;
    const pos = new Float32Array(n * 3);
    const ar = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) ar.set([r(), r(), r(), i < 520 ? r() * 0.74 : 0.76 + r() * 0.2], i * 4);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aR", new THREE.BufferAttribute(ar, 4));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: EMBER_VERT,
        fragmentShader: EMBER_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uBurst: { value: 0 }, uBurstAt: { value: new THREE.Vector3(...CRACKS[0][Math.floor(CRACKS[0].length * 0.42)], 0.01) } },
      }),
    [],
  );
  mat.uniforms.uTime.value = time;
  mat.uniforms.uPx.value = px;
  mat.uniforms.uBurst.value = burst;
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={4} />;
};

/** Dull red glow of the fire behind/below everything. */
const Backdrop: React.FC<{ fire: number }> = ({ fire }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uF: { value: 1 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform float uF; varying vec2 vUv;
          void main(){ float d = length((vUv - vec2(0.5, -0.05)) * vec2(1.0, 1.4));
            vec3 c = vec3(0.55, 0.12, 0.03) * smoothstep(0.75, 0.0, d) * uF + vec3(0.02, 0.006, 0.003);
            gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  mat.uniforms.uF.value = fire;
  return (
    <mesh position={[0, -0.1, -0.7]} material={mat}>
      <planeGeometry args={[5, 3.2]} />
    </mesh>
  );
};

// ------------------------------------------------------------------ shot
const FIRE_TARGET = new THREE.Object3D();
const EAR_TARGET = new THREE.Object3D();


export const S17: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames, height } = useVideoConfig();
  const t = f / fps;
  const u = f / Math.max(1, durationInFrames - 1);
  const fire = 0.82 + 0.14 * noise1(t * 6.0, 3) + 0.06 * noise1(t * 19.0, 8);

  // the crack splits open in the first beats, then cools
  const split = smooth(u / 0.1);
  const crackHeat = split * (1 - 0.75 * smooth((u - 0.12) / 0.3)) * (0.85 + 0.15 * noise1(t * 11, 5)) * 1.1;
  const glyphGlow = smooth((u - 0.2) / 0.14) * (1 - smooth((u - 0.4) / 0.14)) * 0.5;
  const g = smooth((u - 0.34) / 0.44);
  const droop = smooth((u - 0.55) / 0.3);
  const bronze = smooth((u - 0.86) / 0.14);
  const dim = smooth((u - 0.42) / 0.3);
  // strokes leave the groove still glowing and cool into straw and grain
  const hot = smooth((u - 0.3) / 0.08) * (1 - smooth((u - 0.4) / 0.26));
  const mats = useMemo(makeMilletMats, []);
  mats.setBronze(bronze, bronze * 0.5, hot);
  const stemP = smooth((g - 0.04) / 0.42);
  const tipPts = grow(STEM, Math.max(0.01, stemP), (s) => 0.006 + 0.05 * smooth(g * 1.4) * Math.sin(Math.PI * 0.5 * s));
  const tip = tipPts[tipPts.length - 1] as V3;
  const tipOn = smooth(stemP / 0.05) * (1 - smooth((stemP - 0.9) / 0.1));

  // camera: raking macro on the crack -> straight on, the plant matching the glyph -> slight orbit
  let pos: V3;
  let target: V3;
  if (u < 0.32) {
    const k = easeInOut(u / 0.32);
    pos = lerp3([-0.5, -0.2, 0.2], [-0.12, -0.06, 0.62], k);
    target = lerp3([-0.34, 0.03, 0.0], [-0.02, 0.03, 0.0], k);
  } else if (u < 0.74) {
    const k = easeInOut((u - 0.32) / 0.42);
    pos = lerp3([-0.12, -0.06, 0.62], [0.09, 0.02, 1.22], k);
    target = lerp3([-0.02, 0.03, 0.0], [0.08, 0.05, 0.02], k);
  } else {
    const k = easeInOut((u - 0.74) / 0.26);
    pos = lerp3([0.09, 0.02, 1.22], [0.3, -0.1, 1.08], k);
    target = lerp3([0.08, 0.05, 0.02], [0.06, 0.07, 0.04], k);
  }
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  // the plant stops moving as it sets into bronze (S18 opens on the frozen pose)
  const sway = (Math.sin(t * 1.5) * 0.6 + noise1(t * 0.8, 2) * 0.5) * (1 - bronze);
  const px = (height / (2 * Math.tan((15 * Math.PI) / 180))) * 0.0008;
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 30, near: 0.02, far: 10 }} focus={focus} farBlur={5} bloom={0.6} vignette={0.75} background="#030101">
        <ambientLight intensity={0.008} color="#ffb070" />
        <primitive object={FIRE_TARGET} position={[0.02, 0.12, 0]} />
        {/* the fire: low and close, light grazes the plate so every pore and groove shows, and falls off upward */}
        <spotLight
          position={[0.02, -0.66, 0.2]}
          target={FIRE_TARGET}
          angle={0.85}
          penumbra={1}
          decay={2}
          intensity={1.25 * fire * (1 - 0.3 * dim)}
          color="#ff8236"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0003}
          shadow-camera-near={0.05}
          shadow-camera-far={3}
        />
        <pointLight position={[-0.55, -0.6, 0.12]} intensity={0.22 * fire} color="#ff5216" distance={2} decay={2} />
        {/* cold night above; a warm bounce comes up on the plant once it stands */}
        <directionalLight position={[-0.5, 1, 0.8]} intensity={0.05} color="#7f8cb0" />
        <pointLight position={[0.5, 0.2, 0.75]} intensity={0.55 * smooth((u - 0.42) / 0.25)} color="#ffc98a" distance={3} decay={2} />
        <pointLight position={[-0.35, 0.45, 0.3]} intensity={0.25 * smooth((u - 0.5) / 0.25)} color="#ffb060" distance={2} decay={2} />
        <primitive object={EAR_TARGET} position={[-0.06, 0.3, 0.05]} />
        <spotLight position={[0.42, 0.42, 0.75]} target={EAR_TARGET} angle={0.22} penumbra={0.85} decay={2} intensity={0.85 * smooth((u - 0.5) / 0.2)} color="#ffc070" />
        <FireEnv strength={0.35 + 0.65 * bronze} />
        {/* low raking key from the upper left once the plant stands: rims every blade and grain */}
        <directionalLight position={[-1, 0.55, 0.16]} intensity={0.9 * smooth((u - 0.45) / 0.25)} color="#ffd29a" />
        <Backdrop fire={fire} />
        <Plastron crack={crackHeat} glyph={glyphGlow} dim={dim} time={t} />
        <Plant g={g} droop={droop} sway={sway} mats={mats} />
        <Embers time={t} burst={smooth(u / 0.16)} px={px} />
        {/* a spark leads the growth up the stroke, lighting the bone around it */}
        {tipOn > 0.01 ? (
          <group position={tip}>
            <pointLight intensity={0.35 * tipOn} color="#ffb24a" distance={0.6} decay={2} />
            <mesh>
              <sphereGeometry args={[0.006, 12, 8]} />
              <meshBasicMaterial color={new THREE.Color(4, 2.2, 0.8).multiplyScalar(tipOn)} toneMapped={false} />
            </mesh>
          </group>
        ) : null}
      </Stage>
    </AbsoluteFill>
  );
};
