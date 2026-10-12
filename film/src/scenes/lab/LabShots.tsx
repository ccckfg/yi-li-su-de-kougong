import { ThreeCanvas } from "@remotion/three";
import { cluster, hierarchy, type HierarchyPointNode } from "d3-hierarchy";
import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rng } from "../../three/assets";
import { RoomShot } from "../room/RoomScene";
import { Dna3D } from "./Dna3D";
import { MICRO_FRAG, MICRO_VERT } from "./microscope.glsl";

const smoother = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const ss = (x: number, a: number, b: number) => smoother((x - a) / (b - a));

// ------------------------------------------------------------------ S23 microscope dive
const T1: [number, number] = [0.06, 0.2155];
const D2: [number, number] = [0.00042, -0.00031];
const D3: [number, number] = [0.000021, 0.000012];

const MicroQuad: React.FC<{ t: number; time: number }> = ({ t, time }) => {
  const { width, height } = useVideoConfig();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: MICRO_VERT,
        fragmentShader: MICRO_FRAG.replace("vec2 T2 = T1 + vec2(0.00042, -0.00031);", "vec2 T2 = T1 + vec2(0.00042, -0.00031);"),
        uniforms: { uRes: { value: new THREE.Vector2(width, height) }, uT: { value: 0 }, uL: { value: 0 }, uC: { value: new THREE.Vector2() }, uTime: { value: 0 }, uSec: { value: 0 } },
        depthTest: false,
        depthWrite: false,
      }),
    [width, height],
  );
  // dwell on the whole longitudinal section (the anatomy judges will read), then rush down to the DNA
  const L =
    t < 0.1 ? -0.35 + 0.1 * smoother(t / 0.1)
    : t < 0.34 ? -0.25 + 0.15 * smoother((t - 0.1) / 0.24)
    : t < 0.72 ? -0.1 + 9.7 * smoother((t - 0.34) / 0.38)
    : 9.6 + 0.2 * smoother((t - 0.72) / 0.28);
  const sec = smoother((t - 0.08) / 0.14);
  const cx = T1[0] * ss(L, 0.4, 3.6) + D2[0] * ss(L, 3.8, 6.4) + D3[0] * ss(L, 6.4, 8.6);
  const cy = T1[1] * ss(L, 0.4, 3.6) + D2[1] * ss(L, 3.8, 6.4) + D3[1] * ss(L, 6.4, 8.6);
  mat.uniforms.uT.value = t;
  mat.uniforms.uL.value = L;
  mat.uniforms.uC.value.set(cx, cy);
  mat.uniforms.uTime.value = time;
  mat.uniforms.uSec.value = sec;
  return (
    <mesh material={mat} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

export const S23: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const t = f / Math.max(1, durationInFrames - 1);
  // the nucleus glow opens onto the molecule itself: a real 3D double helix takes over from the 2D dive
  const dna = smoother((t - 0.64) / 0.1);
  const open = smoother((t - 0.82) / 0.18);
  const field = (0.45 + open * 0.62) * height;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} gl={{ toneMapping: THREE.NoToneMapping }} linear flat>
        <MicroQuad t={t} time={f / fps} />
      </ThreeCanvas>
      {dna > 0.001 ? (
        <AbsoluteFill
          style={{
            opacity: dna,
            WebkitMaskImage: `radial-gradient(circle at 50% 50%, black ${field - 30}px, transparent ${field}px)`,
            maskImage: `radial-gradient(circle at 50% 50%, black ${field - 30}px, transparent ${field}px)`,
          }}
        >
          <Dna3D t={Math.max(0, (t - 0.64) / 0.36)} time={f / fps} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S24 phylogeny on a screen
type TNode = { children?: TNode[]; id: number };

function buildTree(): HierarchyPointNode<TNode> {
  const r = rng(5);
  let id = 0;
  const make = (n: number): TNode => {
    if (n <= 1) return { id: id++ };
    const k = Math.max(1, Math.min(n - 1, Math.round(n * (0.18 + r() * 0.64))));
    return { id: id++, children: [make(k), make(n - k)] };
  };
  const root = hierarchy(make(1400));
  return cluster<TNode>().size([Math.PI * 2, 1])(root);
}

const TREE = buildTree();
const LEAVES = TREE.leaves();
// highlighted lineage: the leaf sitting closest to the lower-right (our Setaria viridis)
const HL = (() => {
  const want = Math.PI * 0.27;
  let best = LEAVES[0];
  for (const l of LEAVES) if (Math.abs(l.x - want) < Math.abs(best.x - want)) best = l;
  return new Set(best.ancestors().map((n) => n.data.id));
})();
const HL_LEAF = LEAVES.find((l) => HL.has(l.data.id))!;

// the highlighted lineage in root -> leaf order (for the travelling light)
const HL_PATH = HL_LEAF.ancestors().reverse();

let GLOW: HTMLCanvasElement | null = null;

function drawTree(g: CanvasRenderingContext2D, W: number, H: number, grow: number, light: number, dim: number, spin = 0, zoom = 1) {
  // screen: deep blue-black, a faint grid
  const bg = g.createRadialGradient(W * 0.6, H * 0.53, 10, W * 0.6, H * 0.53, H * 0.9);
  bg.addColorStop(0, "#04131a");
  bg.addColorStop(1, "#010407");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(80,190,210,0.045)";
  g.lineWidth = 1;
  for (let x = 0; x < W; x += 48) {
    g.beginPath();
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += 48) {
    g.beginPath();
    g.moveTo(0, y + 0.5);
    g.lineTo(W, y + 0.5);
    g.stroke();
  }
  const cx = W * 0.6;
  const cy = H * 0.53;
  const R = H * 0.43 * zoom;
  const depthR = (n: HierarchyPointNode<TNode>) => 0.06 + 0.94 * n.y;
  const reach = grow * 1.06;
  const pt = (a: number, rr: number) => [cx + Math.cos(a + spin - Math.PI / 2) * rr * R, cy + Math.sin(a + spin - Math.PI / 2) * rr * R] as const;
  // one path for every branch: arc at the parent's radius, then the radial run out to the child
  const branch = (ctx: CanvasRenderingContext2D, n: HierarchyPointNode<TNode>, s: number) => {
    const p = n.parent!;
    const r0 = depthR(p);
    const r1 = depthR(n);
    if (r0 > reach) return null;
    const r1c = Math.min(r1, reach);
    const a0 = p.x + spin;
    const a1 = n.x + spin;
    ctx.moveTo((cx + Math.cos(a0 - Math.PI / 2) * r0 * R) * s, (cy + Math.sin(a0 - Math.PI / 2) * r0 * R) * s);
    ctx.arc(cx * s, cy * s, r0 * R * s, a0 - Math.PI / 2, a1 - Math.PI / 2, a1 < a0);
    const [x1, y1] = pt(n.x, r1c);
    ctx.lineTo(x1 * s, y1 * s);
    return r1 > reach ? ([x1, y1] as const) : null;
  };
  const others = TREE.descendants().filter((n) => n.parent && !HL.has(n.data.id));
  const fade = 1 - 0.7 * dim;
  // glow pass at half resolution, blurred, added on top
  if (!GLOW || GLOW.width !== W / 2) {
    GLOW = document.createElement("canvas");
    GLOW.width = W / 2;
    GLOW.height = H / 2;
  }
  const gg = GLOW.getContext("2d")!;
  gg.clearRect(0, 0, W / 2, H / 2);
  gg.strokeStyle = `rgba(70,200,230,${0.9 * fade})`;
  gg.lineWidth = 2.2;
  gg.beginPath();
  for (const n of others) branch(gg, n, 0.5);
  gg.stroke();
  // sharp pass
  g.strokeStyle = `rgba(120,225,240,${0.85 * fade})`;
  g.lineWidth = 1.25;
  g.beginPath();
  const fronts: (readonly [number, number])[] = [];
  for (const n of others) {
    const f = branch(g, n, 1);
    if (f) fronts.push(f);
  }
  g.stroke();
  // leaf tips: a ring of tiny dots once the tree is out
  if (grow > 0.9) {
    g.fillStyle = `rgba(170,240,250,${0.75 * fade * Math.min(1, (grow - 0.9) / 0.1)})`;
    for (const l of LEAVES) {
      if (HL.has(l.data.id)) continue;
      const [x, y] = pt(l.x, depthR(l) + 0.012);
      g.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
    }
  }
  // growth fronts burn bright while the tree is spreading
  if (grow < 1) {
    g.fillStyle = "rgba(220,255,255,0.9)";
    for (const [x, y] of fronts) g.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    gg.fillStyle = "rgba(200,255,255,0.9)";
    for (const [x, y] of fronts) gg.fillRect(x / 2 - 1.5, y / 2 - 1.5, 3, 3);
  }
  g.save();
  g.globalCompositeOperation = "lighter";
  g.filter = "blur(5px)";
  g.globalAlpha = 0.5;
  g.drawImage(GLOW, 0, 0, W, H);
  g.restore();
  // outer scale ring with ticks: it is an instrument
  g.strokeStyle = `rgba(110,210,230,${0.25 * fade})`;
  g.lineWidth = 1;
  g.beginPath();
  g.arc(cx, cy, R * 1.09, 0, Math.PI * 2);
  g.stroke();
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2 + spin;
    const l = k % 10 === 0 ? 10 : 4;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * R * 1.09, cy + Math.sin(a) * R * 1.09);
    g.lineTo(cx + Math.cos(a) * (R * 1.09 + l), cy + Math.sin(a) * (R * 1.09 + l));
    g.stroke();
  }
  // the lineage of interest: lit from the root outward, a pulse running ahead of the amber
  const hlNodes = HL_PATH.slice(1);
  const amberA = 0.35 + 0.65 * light;
  const along = light; // 0..1 of the path lit
  const nLit = along * hlNodes.length;
  g.save();
  g.lineCap = "round";
  for (let pass = 0; pass < 2; pass++) {
    g.strokeStyle = pass === 0 ? `rgba(255,170,60,${0.45 * amberA})` : `rgba(255,214,140,${amberA})`;
    g.lineWidth = pass === 0 ? 7 : 2.4;
    g.filter = pass === 0 ? "blur(4px)" : "none";
    g.beginPath();
    hlNodes.forEach((n, i) => {
      if (light <= 0 && !(depthR(n.parent!) <= reach)) return;
      if (light > 0 && i > nLit) return;
      branch(g, n, 1);
    });
    if (light <= 0) g.strokeStyle = `rgba(120,225,240,${0.85 * fade})`;
    g.stroke();
  }
  g.filter = "none";
  if (light > 0 && light < 1) {
    const n = hlNodes[Math.min(hlNodes.length - 1, Math.floor(nLit))];
    const [x, y] = pt(n.x, depthR(n));
    const pg = g.createRadialGradient(x, y, 0, x, y, 26);
    pg.addColorStop(0, "rgba(255,245,220,1)");
    pg.addColorStop(0.3, "rgba(255,200,110,0.6)");
    pg.addColorStop(1, "rgba(255,170,60,0)");
    g.fillStyle = pg;
    g.fillRect(x - 26, y - 26, 52, 52);
  }
  if (light > 0.85) {
    const [x1, y1] = pt(HL_LEAF.x, depthR(HL_LEAF));
    const k = (light - 0.85) / 0.15;
    g.fillStyle = `rgba(255,220,150,${k})`;
    g.beginPath();
    g.arc(x1, y1, 4, 0, Math.PI * 2);
    g.fill();
    const [lx, ly] = pt(HL_LEAF.x, depthR(HL_LEAF) + 0.06);
    g.font = "italic 28px serif";
    g.fillText("Setaria viridis", lx + 8, ly + 8);
  }
  g.restore();
}

export const TreeCanvas: React.FC<{ grow: number; light: number; dim: number; spin?: number; zoom?: number; style?: React.CSSProperties }> = ({ grow, light, dim, spin = 0, zoom = 1, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    drawTree(c.getContext("2d")!, width, height, grow, light, dim, spin, zoom);
  }, [grow, light, dim, spin, zoom, width, height]);
  return <canvas ref={ref} width={width} height={height} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...style }} />;
};

export const S24: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = f / Math.max(1, durationInFrames - 1);
  const grow = smoother(t / 0.5);
  const light = smoother((t - 0.52) / 0.3);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TreeCanvas grow={grow} light={light} dim={light} spin={-0.12 + 0.12 * t} zoom={0.94 + 0.1 * smoother(t)} />
      {/* scanlines + vignette: it is a screen */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S25 the screen light retreats into the lamp
const S06_STATE_CAM = { pos: [-0.2, 1.18, -0.04] as [number, number, number], target: [-0.2, 0, -0.17] as [number, number, number], fov: 40 };

export const S25: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = f / Math.max(1, durationInFrames - 1);
  const k = smoother(t);
  // the screen image shrinks toward the lamp pool and warms; the desk opens up around it
  const warm = smoother((t - 0.2) / 0.6);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: smoother((t - 0.25) / 0.55) }}>
        <RoomShot
          state={{
            cam: S06_STATE_CAM,
            focus: { dist: 1.15, range: 0, bokeh: 1.5 },
            power: 1,
            cover: 0,
            envTip: 0,
            filled: true,
            time: 30 + f / fps,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          // the screen's light gathers into a circle that lands exactly on the lamp's pool (S06 framing)
          clipPath: `circle(${(1 - k) * 120 + k * 17}% at ${50 + (34 - 50) * k}% ${50 + (40 - 50) * k}%)`,
          opacity: 1 - smoother((t - 0.5) / 0.4),
          filter: `sepia(${0.9 * warm}) saturate(${1 + 1.4 * warm}) hue-rotate(${-12 * warm}deg) brightness(${1 + 0.7 * warm}) blur(${8 * k}px)`,
        }}
      >
        <TreeCanvas grow={1} light={1} dim={1} spin={0} zoom={1.04} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const LabShots = { S23, S24, S25 };
