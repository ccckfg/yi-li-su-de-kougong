import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { rng } from "../three/assets";
import { SHOT } from "../timeline";
import { FlakeFall, InkBloom } from "./TransitionFX";

// 载体接力: the cut between two media is hidden under a third, physical medium that blooms and recedes.
type Kind = "ink" | "flake" | "sepia" | "noise";
const CUTS: { at: string; kind: Kind; half: number }[] = [
  { at: "S20", kind: "ink", half: 11 },
  { at: "S21", kind: "flake", half: 11 },
  { at: "S22", kind: "sepia", half: 10 },
  { at: "S23", kind: "noise", half: 10 },
];

type Blob = { x: number; y: number; r: number; ph: number; k: number };
type Shard = { pts: [number, number][]; th: number; cx: number; cy: number; rot: number };

function makeBlobs(seed: number, W: number, H: number): Blob[] {
  const r = rng(seed);
  return Array.from({ length: 14 }, () => ({ x: r() * W, y: r() * H, r: (0.25 + r() * 0.45) * H, ph: r() * 10, k: 3 + Math.floor(r() * 4) }));
}

function makeShards(seed: number, W: number, H: number): Shard[] {
  const r = rng(seed);
  const out: Shard[] = [];
  const cols = 9;
  const rows = 6;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const cx = ((i + 0.5 + (r() - 0.5) * 0.5) / cols) * W;
      const cy = ((j + 0.5 + (r() - 0.5) * 0.5) / rows) * H;
      const n = 14 + Math.floor(r() * 6);
      const pts: [number, number][] = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const rr = (0.74 + r() * 0.3 + (k % 2 ? -0.025 : 0.02)) * (W / cols) * 0.78;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9]);
      }
      out.push({ pts, th: r() * 0.7, cx, cy, rot: (r() - 0.5) * 0.8 });
    }
  return out;
}

let _plaster: CanvasPattern | null = null;
function plasterPattern(g: CanvasRenderingContext2D): CanvasPattern {
  if (_plaster) return _plaster;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const pg = c.getContext("2d")!;
  const r = rng(91);
  pg.fillStyle = "#cbb68f";
  pg.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    pg.fillStyle = r() > 0.5 ? `rgba(90,70,40,${0.05 + r() * 0.08})` : `rgba(245,232,205,${0.06 + r() * 0.1})`;
    pg.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 2);
  }
  for (let i = 0; i < 40; i++) {
    pg.fillStyle = `rgba(${r() > 0.5 ? "40,90,95" : "150,60,40"},${0.05 + r() * 0.08})`;
    pg.beginPath();
    pg.arc(r() * 256, r() * 256, 4 + r() * 14, 0, Math.PI * 2);
    pg.fill();
  }
  _plaster = g.createPattern(c, "repeat")!;
  return _plaster;
}

function draw(g: CanvasRenderingContext2D, W: number, H: number, kind: Kind, p: number, blobs: Blob[], shards: Shard[], seed: number) {
  g.clearRect(0, 0, W, H);
  const c = Math.sin(Math.PI * Math.min(1, Math.max(0, p))); // 0 -> 1 at the cut -> 0
  if (c <= 0.001) return;
  if (kind === "ink") {
    // ink blooms; past the cut the ink turns into azurite / malachite pigment and thins out
    const late = Math.max(0, (p - 0.5) * 2);
    const col = late > 0 ? `rgba(${Math.round(12 + 20 * late)},${Math.round(14 + 70 * late)},${Math.round(20 + 75 * late)},${0.96 - 0.25 * late})` : "rgba(10,12,18,0.96)";
    g.fillStyle = col;
    g.shadowColor = col;
    g.shadowBlur = 40;
    for (const b of blobs) {
      const R = b.r * Math.pow(c, 0.75);
      g.beginPath();
      for (let i = 0; i <= 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const wob = 1 + 0.16 * Math.sin(a * b.k + b.ph) + 0.08 * Math.sin(a * 11 + b.ph * 2);
        const x = b.x + Math.cos(a) * R * wob;
        const y = b.y + Math.sin(a) * R * wob;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.fill();
    }
    g.shadowBlur = 0;
  } else if (kind === "flake") {
    // plaster flakes: pop in toward the cut, then drop away revealing the woodblock
    const late = Math.max(0, (p - 0.5) * 2);
    for (const s of shards) {
      const vis = (p < 0.5 ? c : 1) > s.th ? 1 : 0;
      if (!vis) continue;
      const fall = late > s.th * 0.8 ? (late - s.th * 0.8) / (1 - s.th * 0.8) : 0;
      if (fall >= 1) continue;
      g.save();
      g.translate(s.cx, s.cy + fall * fall * H * 0.5);
      g.rotate(s.rot * fall);
      g.globalAlpha = 1 - fall;
      g.beginPath();
      s.pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x - s.cx, y - s.cy) : g.lineTo(x - s.cx, y - s.cy)));
      g.closePath();
      g.fillStyle = plasterPattern(g);
      g.shadowColor = "rgba(0,0,0,0.5)";
      g.shadowBlur = 14;
      g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = "rgba(255,245,220,0.35)";
      g.lineWidth = 1.5;
      g.stroke();
      g.restore();
    }
  } else if (kind === "sepia") {
    // the print ages: a warm sepia wash sweeps across with a light leak at its edge
    const edge = (p * 1.4 - 0.2) * W;
    const grd = g.createLinearGradient(edge - W * 0.35, 0, edge + W * 0.05, 0);
    grd.addColorStop(0, `rgba(112,80,42,${0.85 * c})`);
    grd.addColorStop(0.85, `rgba(150,108,58,${0.7 * c})`);
    grd.addColorStop(1, "rgba(255,200,120,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    const leak = g.createRadialGradient(edge, H * 0.4, 10, edge, H * 0.4, H * 0.7);
    leak.addColorStop(0, `rgba(255,190,110,${0.55 * c})`);
    leak.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = leak;
    g.fillRect(0, 0, W, H);
  } else {
    // film grain blows up into colour noise, which then contracts into the eyepiece circle
    const late = Math.max(0, (p - 0.5) * 2);
    const r = rng(seed + Math.floor(p * 40));
    const cell = 6 + Math.floor(10 * c);
    g.save();
    if (late > 0) {
      g.beginPath();
      g.arc(W / 2, H / 2, H * (0.95 - 0.5 * late), 0, Math.PI * 2);
      g.clip();
    }
    for (let y = 0; y < H; y += cell)
      for (let x = 0; x < W; x += cell) {
        const v = r();
        g.fillStyle = `rgba(${Math.round(60 + 160 * v)},${Math.round(90 + 150 * r())},${Math.round(110 + 140 * r())},${0.75 * c})`;
        g.fillRect(x, y, cell, cell);
      }
    g.restore();
  }
}

export const MediumTransitions: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const active = CUTS.map((ct) => ({ ...ct, cut: SHOT[ct.at].from })).find((ct) => frame >= ct.cut - ct.half && frame <= ct.cut + ct.half);
  const blobs = useMemo(() => makeBlobs(41, W, H), [W, H]);
  const shards = useMemo(() => makeShards(42, W, H), [W, H]);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    if (!active) {
      g.clearRect(0, 0, W, H);
      return;
    }
    const p = (frame - (active.cut - active.half)) / (2 * active.half);
    if (active.kind === "ink" || active.kind === "flake") {
      g.clearRect(0, 0, W, H);
      return;
    }
    draw(g, W, H, active.kind, p, blobs, shards, 7);
  }, [frame, active, W, H, blobs, shards]);
  const p = active ? (frame - (active.cut - active.half)) / (2 * active.half) : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%" }} />
      {active?.kind === "ink" ? (
        <AbsoluteFill>
          <InkBloom p={p} time={frame / fps} />
        </AbsoluteFill>
      ) : null}
      {active?.kind === "flake" ? (
        <AbsoluteFill>
          <FlakeFall p={p} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
