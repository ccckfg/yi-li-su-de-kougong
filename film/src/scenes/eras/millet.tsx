import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../../three/assets";
import { smooth } from "../../three/Rig";

// Foxtail millet, grown from the strokes of the oracle-bone 禾 (S17) and cast in bronze relief (S18).
// Built in the plate's frame: glyph units (468 box, y up) map to metres on the plane z = 0.
export const GS = 0.62 / 370;
export const GX0 = 0.08;
export const GY0 = 0.02;
/** glyph coords (468 box, y up) -> world xy */
export const gw = (x: number, y: number): [number, number] => [GX0 + (x - 236) * GS, GY0 + (y - 235) * GS];

// ------------------------------------------------------------------ plant geometry
export type P3 = [number, number, number];

/** Tube along a polyline with a radius profile, regenerated as it grows. */
function taperTube(pts: P3[], r0: number, r1: number, radial = 10, segs = 64): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const s = i / segs;
    const c = curve.getPointAt(s);
    const rad = r0 + (r1 - r0) * s;
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const nx = frames.normals[i].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[i].clone().multiplyScalar(Math.sin(a)));
      pos.push(c.x + nx.x * rad, c.y + nx.y * rad, c.z + nx.z * rad);
      nor.push(nx.x, nx.y, nx.z);
    }
  }
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/** A grass blade: a folded ribbon along a polyline, widest a third of the way out. */
function blade(pts: P3[], width: number, twist: number): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const segs = 40;
  const pos: number[] = [];
  const col: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= segs; i++) {
    const s = i / segs;
    const c = curve.getPointAt(s);
    const tng = curve.getTangentAt(s);
    const side = new THREE.Vector3().crossVectors(tng, up).normalize();
    const rot = twist * s;
    side.applyAxisAngle(tng, rot);
    const fold = new THREE.Vector3().crossVectors(side, tng).normalize();
    const w = width * Math.pow(Math.sin(Math.PI * Math.min(1, 0.08 + s * 0.95)), 0.7) * (1 - 0.85 * s * s);
    const l = c.clone().addScaledVector(side, -w);
    const m = c.clone().addScaledVector(fold, w * 0.06);
    const r = c.clone().addScaledVector(side, w);
    pos.push(l.x, l.y, l.z, m.x, m.y, m.z, r.x, r.y, r.z);
    const base = new THREE.Color("#5f5e26").lerp(new THREE.Color("#b09245"), Math.min(1, s * 1.3));
    if (s > 0.85) base.lerp(new THREE.Color("#8a5a2a"), (s - 0.85) / 0.15);
    const rib = base.clone().lerp(new THREE.Color("#f2e2a8"), 0.45);
    col.push(base.r, base.g, base.b, rib.r, rib.g, rib.b, base.r, base.g, base.b);
    uvs.push(0, s, 0.5, s, 1, s);
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 3;
    const b = a + 3;
    idx.push(a, b, a + 1, b, b + 1, a + 1, a + 1, b + 1, a + 2, b + 1, b + 2, a + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Points along a glyph-space polyline, cut at `p` (0..1 of its length), lifted to z. */
export function grow(gpts: [number, number][], p: number, z: (s: number) => number): P3[] {
  const w = gpts.map(([x, y]) => gw(x, y));
  const L: number[] = [0];
  for (let i = 1; i < w.length; i++) L.push(L[i - 1] + Math.hypot(w[i][0] - w[i - 1][0], w[i][1] - w[i - 1][1]));
  const tot = L[L.length - 1];
  const end = Math.max(1e-4, p) * tot;
  const out: P3[] = [];
  for (let i = 0; i < w.length; i++) {
    if (L[i] <= end) out.push([w[i][0], w[i][1], z(L[i] / tot)]);
    else {
      const k = (end - L[i - 1]) / (L[i] - L[i - 1]);
      out.push([w[i - 1][0] + (w[i][0] - w[i - 1][0]) * k, w[i - 1][1] + (w[i][1] - w[i - 1][1]) * k, z(end / tot)]);
      break;
    }
  }
  if (out.length < 2) out.push([out[0][0], out[0][1] + 1e-4, out[0][2]]);
  return out;
}

// skeleton read off the glyph (468 box, y up)
export const STEM: [number, number][] = [[232, 152], [234, 200], [240, 262], [246, 322], [250, 372], [252, 410]];
const LEAVES: { pts: [number, number][]; w: number; tw: number; at: number }[] = [
  { pts: [[256, 330], [276, 350], [302, 370], [334, 380], [364, 374], [388, 356], [404, 330]], w: 0.016, tw: 0.9, at: 0.3 },
  { pts: [[238, 286], [222, 304], [200, 318], [172, 324], [146, 316], [126, 298], [114, 274]], w: 0.015, tw: -0.8, at: 0.38 },
  { pts: [[238, 236], [264, 254], [296, 264], [328, 260], [354, 244], [370, 222]], w: 0.013, tw: 0.7, at: 0.22 },
  { pts: [[234, 200], [212, 214], [186, 220], [162, 212], [146, 194]], w: 0.012, tw: -0.6, at: 0.16 },
];
const ROOTS: [number, number][][] = [
  [[226, 168], [204, 146], [184, 124], [168, 108]],
  [[246, 164], [258, 132], [272, 100], [286, 72]],
  [[236, 160], [232, 120], [226, 84], [220, 54]],
  [[230, 150], [214, 120], [206, 96]],
  [[242, 150], [252, 116], [254, 92]],
];

function leafTexture(): THREE.Texture {
  const W = 256;
  const H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = rng(61);
  g.fillStyle = "#c8c8c8";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = (i + 0.5) * (W / 26);
    g.strokeStyle = `rgba(255,250,235,${0.18 + r() * 0.12})`;
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + (x - W / 2) * -0.6, H);
    g.stroke();
  }
  const mg = g.createLinearGradient(0, 0, W, 0);
  mg.addColorStop(0, "rgba(40,30,10,0.35)");
  mg.addColorStop(0.1, "rgba(40,30,10,0)");
  mg.addColorStop(0.44, "rgba(255,250,230,0)");
  mg.addColorStop(0.5, "rgba(255,250,230,0.55)");
  mg.addColorStop(0.56, "rgba(255,250,230,0)");
  mg.addColorStop(0.9, "rgba(40,30,10,0)");
  mg.addColorStop(1, "rgba(40,30,10,0.35)");
  g.fillStyle = mg;
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(90,60,20,${0.05 + r() * 0.1})`;
    g.fillRect(r() * W, r() * H, 1 + r() * 2, 2 + r() * 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
// ---- bronze + patina, shared by every plant material
const BRONZE = new THREE.Color("#8a6534");
const PATINA_GLSL = /* glsl */ `
float pHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float pNoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(pHash(i+vec3(0,0,0)), pHash(i+vec3(1,0,0)), f.x), mix(pHash(i+vec3(0,1,0)), pHash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(pHash(i+vec3(0,0,1)), pHash(i+vec3(1,0,1)), f.x), mix(pHash(i+vec3(0,1,1)), pHash(i+vec3(1,1,1)), f.x), f.y), f.z); }
`;
function withPatina<M extends THREE.MeshStandardMaterial>(m: M): M {
  m.userData.patina = 0;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPatina = { value: m.userData.patina };
    m.userData.shader = sh;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPw;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\n#ifdef USE_INSTANCING\nvPw = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\nvPw = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uPatina;\nvarying vec3 vPw;\n" + PATINA_GLSL)
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        float pn = pNoise(vPw * 90.0) * 0.55 + pNoise(vPw * 260.0) * 0.45;
        float pm = smoothstep(1.0 - uPatina, 1.15 - uPatina, pn);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.20, 0.42, 0.34), pm);
        roughnessFactor = mix(roughnessFactor, 0.85, pm);`,
      )
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.15, pm);");
  };
  m.onBeforeRender = () => {
    const s = m.userData.shader as { uniforms: Record<string, { value: number }> } | undefined;
    if (s) s.uniforms.uPatina.value = m.userData.patina;
  };
  return m;
}
let LEAF_TEX: THREE.Texture | null = null;

export type MilletMats = {
  stem: THREE.MeshStandardMaterial;
  leaf: THREE.MeshStandardMaterial;
  root: THREE.MeshStandardMaterial;
  grain: THREE.MeshPhysicalMaterial;
  bristle: THREE.LineBasicMaterial;
  /** b: 0 living plant .. 1 cast bronze; patina 0..1; hot: still glowing from the groove */
  setBronze: (b: number, patina: number, hot?: number) => void;
};

/** One material set per scene (S17 and S18 overlap in a cross-dissolve, each with its own state). */
export function makeMilletMats(): MilletMats {
  if (!LEAF_TEX) LEAF_TEX = leafTexture();
  const stem = withPatina(new THREE.MeshStandardMaterial({ color: "#b8954a", roughness: 0.45 }));
  const leaf = withPatina(new THREE.MeshStandardMaterial({ color: "#ffffff", vertexColors: true, roughness: 0.5, side: THREE.DoubleSide, map: LEAF_TEX }));
  const root = withPatina(new THREE.MeshStandardMaterial({ color: "#e6d6ac", roughness: 0.7 }));
  const grain = withPatina(new THREE.MeshPhysicalMaterial({ color: "#e0a020", emissive: "#ff9a20", emissiveIntensity: 0.06, roughness: 0.32, sheen: 0.3, sheenColor: new THREE.Color("#ffc860"), sheenRoughness: 0.4 }));
  const bristle = new THREE.LineBasicMaterial({ color: "#c89a48", transparent: true, opacity: 0.4 });
  const all = [stem, leaf, root, grain];
  const base = all.map((m) => ({ c: m.color.clone(), r: m.roughness }));
  const setBronze = (b: number, patina: number, hot = 0) => {
    all.forEach((m, i) => {
      m.emissive.setRGB(1.0, 0.32, 0.05).multiplyScalar(hot * 0.9);
      if (m === grain) m.emissive.add(new THREE.Color("#ff9a20").multiplyScalar(0.07 * (1 - b)));
      m.color.copy(base[i].c).lerp(BRONZE, b);
      m.metalness = b;
      m.roughness = base[i].r + (0.32 - base[i].r) * b;
      m.userData.patina = patina;
    });
    grain.sheen = 0.3 * (1 - b);
    bristle.color.set("#c89a48").lerp(new THREE.Color("#7a5a30"), b);
  };
  return { stem, leaf, root, grain, bristle, setBronze };
}

// ---- the ear: clustered spikelets along a drooping axis, with bristles
const EAR_N = 2200;
type Grain = { s: number; a: number; rr: number; sc: number; cl: number };
const GRAINS: Grain[] = (() => {
  const r = rng(23);
  const out: Grain[] = [];
  // spikelets come in lobes: pick a lobe position, scatter grains around it
  const lobes = 46;
  for (let i = 0; i < EAR_N; i++) {
    const lobe = Math.floor(r() * lobes);
    const s = (lobe + 0.5 + (r() - 0.5) * 0.9) / lobes;
    out.push({ s, a: r() * Math.PI * 2, rr: 0.75 + r() * 0.35, sc: 0.8 + r() * 0.4, cl: lobe });
  }
  return out;
})();

function earAxis(p: number, droop: number): P3[] {
  // from the stem top: up-left, over, and down — droop pulls the tail lower
  const g: [number, number][] = [
    [252, 410],
    [240, 418],
    [222, 418],
    [202, 410],
    [186, 394 - 8 * droop],
    [174, 370 - 22 * droop],
    [168, 340 - 40 * droop],
    [166, 312 - 52 * droop],
  ];
  return grow(g, p, (s) => 0.05 + 0.03 * Math.sin(Math.PI * s));
}

const Ear: React.FC<{ p: number; droop: number; fill: number; sway: number; mats: MilletMats }> = ({ p, droop, fill, sway, mats }) => {
  const grainGeo = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);
  const inst = useMemo(() => {
    const m = new THREE.InstancedMesh(grainGeo, mats.grain, EAR_N);
    m.castShadow = true;
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }, [grainGeo, mats]);
  const bristleGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(900 * 6), 3));
    return g;
  }, []);
  const axisPts = earAxis(Math.max(0.02, p), droop).map(([x, y, z]) => [x + sway * 0.01 * (y - 0.3), y, z] as P3);
  const curve = new THREE.CatmullRomCurve3(axisPts.map((q) => new THREE.Vector3(...q)), false, "centripetal");
  const frames = curve.computeFrenetFrames(80, false);
  const M = new THREE.Matrix4();
  const Q = new THREE.Quaternion();
  const S = new THREE.Vector3();
  const P = new THREE.Vector3();
  const bpos = bristleGeo.getAttribute("position") as THREE.BufferAttribute;
  let bi = 0;
  GRAINS.forEach((gr, i) => {
    const fi = Math.min(80, Math.round(gr.s * 80));
    const c = curve.getPointAt(gr.s);
    const tng = curve.getTangentAt(gr.s);
    // fat in the middle, tapering to a point; grains appear from the base up as it fills
    const prof = Math.pow(Math.sin(Math.PI * Math.min(1, 0.06 + gr.s * 0.98)), 0.55);
    const lobeBulge = 0.75 + 0.25 * Math.sin(gr.cl * 2.4);
    const R = 0.026 * prof * lobeBulge * gr.rr * (0.4 + 0.6 * fill);
    const nrm = frames.normals[fi].clone().multiplyScalar(Math.cos(gr.a)).add(frames.binormals[fi].clone().multiplyScalar(Math.sin(gr.a)));
    P.copy(c).addScaledVector(nrm, R);
    const appear = smooth((fill * 1.25 - gr.s) / 0.25);
    const size = 0.0042 * gr.sc * appear * (0.6 + 0.4 * prof);
    Q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm.clone().multiplyScalar(0.4).add(tng).normalize());
    S.set(size, size * 1.35, size);
    M.compose(P, Q, S);
    inst.setMatrixAt(i, M);
    if (i % 3 === 0 && bi < 900) {
      const L = 0.01 + 0.008 * ((i * 7) % 5) / 5;
      const e = P.clone().addScaledVector(nrm, L * appear).addScaledVector(tng, L * 0.3 * appear);
      bpos.setXYZ(bi * 2, P.x, P.y, P.z);
      bpos.setXYZ(bi * 2 + 1, e.x, e.y, e.z);
      bi++;
    }
  });
  inst.instanceMatrix.needsUpdate = true;
  bpos.needsUpdate = true;
  return (
    <group>
      <primitive object={inst} />
      <lineSegments geometry={bristleGeo} material={mats.bristle} frustumCulled={false} />
    </group>
  );
};

export const Plant: React.FC<{ g: number; droop: number; sway: number; mats: MilletMats; lift?: number }> = ({ g, droop, sway, mats, lift: liftAmt = 0.05 }) => {
  const lift = (s: number) => 0.006 + liftAmt * smooth(g * 1.4) * Math.sin(Math.PI * 0.5 * s);
  const stemP = smooth((g - 0.04) / 0.42);
  const geos = useMemo(() => ({ list: [] as THREE.BufferGeometry[] }), []);
  geos.list.forEach((x) => x.dispose());
  geos.list = [];
  const keep = (x: THREE.BufferGeometry) => {
    geos.list.push(x);
    return x;
  };
  const swayed = (pts: P3[]): P3[] => pts.map(([x, y, z]) => [x + sway * 0.012 * Math.max(0, y - 0.0), y, z]);
  const stem = stemP > 0.01 ? keep(taperTube(swayed(grow(STEM, stemP, lift)), 0.0125, 0.0075)) : null;
  const leaves = LEAVES.map((l) => {
    const lp = smooth((g - l.at) / 0.4);
    if (lp <= 0.02) return null;
    return keep(blade(swayed(grow(l.pts, lp, (s) => lift(0.6) + 0.02 * s)), l.w * (0.5 + 0.5 * lp), l.tw));
  });
  const roots = ROOTS.map((rt, i) => {
    const rp = smooth((g - i * 0.03) / 0.32);
    if (rp <= 0.02) return null;
    return keep(taperTube(grow(rt, rp, () => 0.004), i < 3 ? 0.0042 : 0.0026, 0.0008, 6, 32));
  });
  const earP = smooth((g - 0.42) / 0.35);
  return (
    <group>
      {stem ? <mesh geometry={stem} material={mats.stem} castShadow receiveShadow /> : null}
      {leaves.map((l, i) => (l ? <mesh key={i} geometry={l} material={mats.leaf} castShadow receiveShadow /> : null))}
      {roots.map((r, i) => (r ? <mesh key={i} geometry={r} material={mats.root} castShadow /> : null))}
      {earP > 0.01 && stemP > 0.97 ? <Ear p={earP} droop={droop} fill={smooth((g - 0.5) / 0.45)} sway={sway} mats={mats} /> : null}
    </group>
  );
};

