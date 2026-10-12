import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { getTex, Preload, rng } from "../three/assets";

// Two of the 载体接力 cuts, redone in WebGL over both shots.
// ink:   S19 ink painting -> S20 mural. Ink blooms through the paper with feathered, capillary edges;
//        past the cut the ink turns into mineral pigment (azurite, malachite, cinnabar, ochre) and thins away.
// flake: S20 mural -> S21 woodcut. The painted plaster tiles over, then breaks into chips that tumble
//        and fall with real thickness and light, uncovering the woodblock print.

const INK_FRAG = /* glsl */ `
uniform float uP; uniform vec2 uRes; uniform float uTime;
varying vec2 vUv;
float h1(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h1(i),h1(i+vec2(1,0)),u.x), mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<6;i++){ v+=a*n2(p); p=p*2.03+vec2(3.1,7.7); a*=0.5; } return v; }
void main(){
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float c = sin(3.14159 * clamp(uP, 0.0, 1.0));            // 0 -> 1 at the cut -> 0
  float late = clamp((uP - 0.5) * 2.0, 0.0, 1.0);
  // domain-warped distance field of six blooms: ink runs along the paper fibres
  vec2 w = p + (vec2(fbm(p * 3.0 + 1.7), fbm(p * 3.0 + 9.2)) - 0.5) * 0.35;
  float ink = 0.0; float fringe = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 ctr = vec2(h1(vec2(fi, 1.0)) - 0.5, h1(vec2(fi, 2.0)) - 0.5) * vec2(1.6, 0.9);
    float R = c * (0.35 + 0.35 * h1(vec2(fi, 3.0))) * 1.25;
    float d = length(w - ctr) + (fbm(w * 14.0 + fi) - 0.5) * 0.06;
    ink = max(ink, smoothstep(R, R - 0.05, d));
    fringe = max(fringe, smoothstep(R + 0.07, R, d) * smoothstep(0.45, 0.8, fbm(vec2(w.x * 60.0, w.y * 14.0) + fi)));
  }
  float a = clamp(ink + fringe * 0.4, 0.0, 1.0);
  // ink: blue-black, a little denser where the bloom's rim piles the pigment up
  vec3 inkCol = vec3(0.02, 0.024, 0.036) * (0.9 + 0.2 * fbm(p * 4.0));
  // after the cut the ink turns to mineral pigment, washes blending into one another
  vec3 azur = vec3(0.13, 0.30, 0.58), mala = vec3(0.17, 0.48, 0.40), cinn = vec3(0.66, 0.22, 0.12), ochr = vec3(0.74, 0.56, 0.32);
  float s1 = fbm(p * 1.8 + 4.0), s2 = fbm(p * 1.6 + 11.0);
  vec3 pig = mix(mix(azur, mala, smoothstep(0.35, 0.65, s1)), mix(cinn, ochr, smoothstep(0.35, 0.65, s1)), smoothstep(0.4, 0.62, s2));
  pig *= 0.85 + 0.25 * fbm(p * 22.0);
  vec3 col = mix(inkCol, pig, smoothstep(0.05, 0.75, late) * smoothstep(0.3, 0.7, fbm(p * 3.0 + late * 1.5)));
  // paper tooth shows through the wet edge
  col *= 0.9 + 0.12 * n2(p * vec2(800.0, 520.0));
  gl_FragColor = vec4(col * a, a);
}`;

const QUAD_VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const InkQuad: React.FC<{ p: number; time: number }> = ({ p, time }) => {
  const { width, height } = useVideoConfig();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: QUAD_VERT,
        fragmentShader: INK_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        premultipliedAlpha: true,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        uniforms: { uP: { value: 0 }, uRes: { value: new THREE.Vector2(width, height) }, uTime: { value: 0 } },
      }),
    [width, height],
  );
  mat.uniforms.uP.value = p;
  mat.uniforms.uTime.value = time;
  return (
    <mesh material={mat} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

export const InkBloom: React.FC<{ p: number; time: number }> = ({ p, time }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} linear flat gl={{ alpha: true, premultipliedAlpha: true, toneMapping: THREE.NoToneMapping }}>
      <InkQuad p={p} time={time} />
    </ThreeCanvas>
  );
};

// ------------------------------------------------------------------ plaster chips
type Chip = { poly: THREE.Vector2[]; c: THREE.Vector2; tin: number; tfall: number; axis: THREE.Vector3; spin: number; drift: number };

/** Voronoi cells of jittered sites, by clipping a big square with each neighbour's half-plane. */
function voronoi(aspect: number, seed: number): Chip[] {
  const r = rng(seed);
  const cols = 11;
  const rows = 7;
  const sites: THREE.Vector2[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      sites.push(new THREE.Vector2(((i + 0.5 + (r() - 0.5) * 0.8) / cols - 0.5) * aspect * 1.04, ((j + 0.5 + (r() - 0.5) * 0.8) / rows - 0.5) * 1.04));
  const chips: Chip[] = [];
  for (const s of sites) {
    // start from the frame itself (a hair larger): border chips must not reach off-screen, where the
    // picture has no pixels and a clamped texture would smear into stripes
    const hx = aspect * 0.51;
    let poly = [new THREE.Vector2(-hx, -0.51), new THREE.Vector2(hx, -0.51), new THREE.Vector2(hx, 0.51), new THREE.Vector2(-hx, 0.51)];
    for (const o of sites) {
      if (o === s) continue;
      if (o.distanceTo(s) > 0.6) continue;
      const m = s.clone().add(o).multiplyScalar(0.5);
      const n = o.clone().sub(s);
      const out: THREE.Vector2[] = [];
      for (let k = 0; k < poly.length; k++) {
        const a = poly[k];
        const b = poly[(k + 1) % poly.length];
        const da = a.clone().sub(m).dot(n);
        const db = b.clone().sub(m).dot(n);
        if (da <= 0) out.push(a);
        if (da * db < 0) out.push(a.clone().lerp(b, da / (da - db)));
      }
      poly = out;
    }
    // ragged edges: subdivide and jitter a touch (shrunk slightly so cracks show between chips)
    const rag: THREE.Vector2[] = [];
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k];
      const b = poly[(k + 1) % poly.length];
      for (let q = 0; q < 4; q++) {
        const v = a.clone().lerp(b, q / 4);
        v.sub(s).multiplyScalar(0.985).add(s);
        if (q > 0) v.add(new THREE.Vector2((r() - 0.5) * 0.008, (r() - 0.5) * 0.008));
        rag.push(v);
      }
    }
    chips.push({
      poly: rag.map((v) => v.clone().sub(s)),
      c: s.clone(),
      tin: 0.08 + r() * 0.34,
      tfall: 0.5 + r() * 0.28 + (0.5 - s.y) * 0.05,
      axis: new THREE.Vector3(r() - 0.5, r() - 0.5, (r() - 0.5) * 0.3).normalize(),
      spin: 4 + r() * 6,
      drift: (r() - 0.5) * 0.25,
    });
  }
  return chips;
}

function pigmentTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 576;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = rng(91);
  g.fillStyle = "#c9b48c";
  g.fillRect(0, 0, W, H);
  // washes of mineral colour, as on a Dunhuang wall
  const cols = ["rgba(40,90,150,", "rgba(46,120,100,", "rgba(160,60,36,", "rgba(186,140,80,", "rgba(90,60,40,"];
  for (let i = 0; i < 70; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 30 + r() * 160;
    const grd = g.createRadialGradient(x, y, 2, x, y, rad);
    const col = cols[Math.floor(r() * cols.length)];
    grd.addColorStop(0, col + (0.25 + r() * 0.35) + ")");
    grd.addColorStop(1, col + "0)");
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() > 0.5 ? `rgba(80,60,36,${0.05 + r() * 0.1})` : `rgba(245,232,205,${0.06 + r() * 0.12})`;
    g.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 2);
  }
  // fine craquelure
  g.strokeStyle = "rgba(60,44,28,0.25)";
  for (let i = 0; i < 160; i++) {
    let x = r() * W;
    let y = r() * H;
    g.lineWidth = 0.6 + r();
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 8; k++) {
      x += (r() - 0.5) * 30;
      y += (r() - 0.5) * 30;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const WALL = "trans/S20_last.png";
const LIGHT = new THREE.Vector3(-1.2, 2.0, 3).normalize();

const Chips: React.FC<{ p: number }> = ({ p }) => {
  const { width, height } = useVideoConfig();
  const aspect = width / height;
  const chips = useMemo(() => voronoi(aspect, 42), [aspect]);
  const wall = getTex(WALL);
  const fallback = useMemo(pigmentTexture, []);
  const tex = wall ?? fallback;
  const geos = useMemo(
    () =>
      chips.map((ch) => {
        const shape = new THREE.Shape(ch.poly);
        // no bevel: bevel rings would join the picture group and smear the texture into stripes
        const g = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: false, curveSegments: 1 });
        // the face shows the wall where this chip came from: uv = screen position
        const pos = g.getAttribute("position") as THREE.BufferAttribute;
        const uv = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
          uv[i * 2] = (pos.getX(i) + ch.c.x) / aspect + 0.5;
          uv[i * 2 + 1] = pos.getY(i) + ch.c.y + 0.5;
        }
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        g.translate(0, 0, -0.018);
        return g;
      }),
    [chips, aspect],
  );
  const faceMats = useMemo(() => chips.map(() => new THREE.MeshBasicMaterial({ map: tex })), [chips, tex]);
  // chip edges are bare plaster
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8c8a8", roughness: 1 }), []);
  return (
    <group>
      {chips.map((ch, i) => {
        const appear = Math.min(1, Math.max(0, (p - ch.tin) / 0.12));
        if (appear <= 0) return null;
        const tf = Math.max(0, p - ch.tfall) * 2.2; // seconds-ish of fall
        if (tf > 1.4) return null;
        const pos = new THREE.Vector3(ch.c.x + ch.drift * tf, ch.c.y - 1.8 * tf * tf, 0.06 * Math.sin(Math.min(1, tf * 3) * Math.PI) + 0.25 * tf);
        const q = new THREE.Quaternion().setFromAxisAngle(ch.axis, ch.spin * tf * tf * 0.5 + (1 - appear) * 0.25);
        const s = 1;
        const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
        faceMats[i].color.setScalar(Math.min(1.15, Math.max(0.3, 0.55 + 0.45 * (n.dot(LIGHT) / LIGHT.z))));
        return <mesh key={i} geometry={geos[i]} material={[faceMats[i], edge]} position={pos} quaternion={q} scale={[s, s, s]} />;
      })}
    </group>
  );
};

export const FlakeFall: React.FC<{ p: number }> = ({ p }) => {
  const { width, height } = useVideoConfig();
  return (
    <Preload spec={{ tex: [WALL] }}>
      <FlakeCanvas p={p} width={width} height={height} />
    </Preload>
  );
};

const FlakeCanvas: React.FC<{ p: number; width: number; height: number }> = ({ p, width, height }) => {
  // a long lens so the wall plane fills the frame exactly: height 1 at distance d
  const fov = 20;
  const d = 0.5 / Math.tan(((fov / 2) * Math.PI) / 180);
  return (
    <ThreeCanvas width={width} height={height} gl={{ alpha: true, premultipliedAlpha: true, toneMapping: THREE.NoToneMapping }} camera={{ fov, position: [0, 0, d], near: 0.1, far: 20 }}>
      <ambientLight intensity={1.6} color="#ffffff" />
      <directionalLight position={[-1.2, 2.0, 3]} intensity={1.2} color="#fff0d8" />
      <Chips p={p} />
    </ThreeCanvas>
  );
};
