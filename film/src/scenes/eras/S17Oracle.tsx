import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { rng } from "../../three/assets";
import { noise1 } from "../../three/Rig";
import { HE_PATH } from "./he_path";

// 商 · 殷墟: firelit plastron, the pyromantic 卜 crack, the carved oracle-bone 禾 (public-domain glyph);
// the carved strokes grow into a real foxtail millet plant whose ear droops to the LEFT like the glyph.
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

function boneTexture(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = rng(17);
  g.fillStyle = "#d8c49a";
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26000; i++) {
    const x = r() * W;
    const y = r() * H;
    g.fillStyle = r() > 0.5 ? `rgba(120,90,50,${0.04 + r() * 0.06})` : `rgba(250,240,215,${0.04 + r() * 0.06})`;
    g.fillRect(x, y, 1 + r() * 4, 1 + r() * 2);
  }
  // cancellous pits
  for (let i = 0; i < 700; i++) {
    const x = r() * W;
    const y = r() * H;
    g.beginPath();
    g.ellipse(x, y, 1 + r() * 3, 1 + r() * 2, r() * 3, 0, Math.PI * 2);
    g.fillStyle = `rgba(80,55,30,${0.15 + r() * 0.2})`;
    g.fill();
  }
  // growth lines
  g.strokeStyle = "rgba(140,105,60,0.12)";
  for (let i = 0; i < 40; i++) {
    g.lineWidth = 1 + r() * 2;
    g.beginPath();
    const y0 = r() * H;
    g.moveTo(0, y0);
    for (let x = 0; x <= W; x += 60) g.lineTo(x, y0 + Math.sin(x * 0.004 + i) * 30 + (r() - 0.5) * 6);
    g.stroke();
  }
  return c;
}

function platePath(W: number, H: number): Path2D {
  const p = new Path2D();
  const r = rng(3);
  const cx = W * 0.5;
  const cy = H * 0.52;
  const rx = W * 0.4;
  const ry = H * 0.43;
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 0.08 + (Math.abs(Math.sin(a * 2.0)) < 0.2 ? -0.06 : 0);
    const x = cx + Math.cos(a) * rx * k;
    const y = cy + Math.sin(a) * ry * k;
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  }
  p.closePath();
  return p;
}

const lerpColor = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgba = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function drawPlant(g: CanvasRenderingContext2D, W: number, H: number, p: number, sway: number, colT: number, bronze: number) {
  // anchor matches the glyph: stem centred on it, ear droops left
  const x0 = W * 0.6;
  const yB = H * 0.84;
  const yT = H * 0.2;
  const carved = [58, 36, 22];
  const gold = [214, 186, 102];
  const leaf = [150, 168, 88];
  const bz = [120, 140, 104];
  const cStem = lerpColor(lerpColor(carved, gold, colT), bz, bronze);
  const cLeaf = lerpColor(lerpColor(carved, leaf, colT), bz, bronze);
  const stemP = ease(p / 0.45);
  g.lineCap = "round";
  // roots
  const rootP = ease((p - 0.05) / 0.35);
  g.strokeStyle = rgba(cStem, 0.9);
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 2 + (i - 2.5) * 0.32;
    g.lineWidth = 3 - i * 0.2;
    g.beginPath();
    g.moveTo(x0, yB);
    const L = H * (0.07 + 0.03 * ((i * 7) % 3)) * rootP;
    g.quadraticCurveTo(x0 + Math.cos(a) * L * 0.5 + (i - 2.5) * 6, yB + Math.sin(a) * L * 0.6, x0 + Math.cos(a) * L, yB + Math.sin(a) * L);
    g.stroke();
  }
  // stem with a gentle lean; tip position follows growth
  const top = yB - (yB - yT) * stemP;
  const lean = (yy: number) => x0 + sway * Math.pow((yB - yy) / (yB - yT), 2) * 22;
  for (let y = yB; y > top; y -= 6) {
    const k = (yB - y) / (yB - yT);
    g.lineWidth = 11 - 6 * k;
    g.strokeStyle = rgba(cStem);
    g.beginPath();
    g.moveTo(lean(y), y);
    g.lineTo(lean(y - 6), y - 6);
    g.stroke();
  }
  // leaves: long arching blades, alternating sides
  const leaves = [0.24, 0.4, 0.55, 0.68];
  leaves.forEach((h, i) => {
    const lp = ease((p - 0.12 - i * 0.08) / 0.35);
    if (lp <= 0) return;
    const y = yB - (yB - yT) * h;
    const side = i % 2 === 0 ? -1 : 1;
    const L = W * (0.14 + 0.02 * (3 - i)) * lp;
    const x = lean(y);
    g.fillStyle = rgba(cLeaf, 0.95);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + side * L * 0.55, y - H * 0.12 * lp, x + side * L, y + H * 0.05 * lp + sway * 6);
    g.quadraticCurveTo(x + side * L * 0.5, y - H * 0.08 * lp, x, y + 10);
    g.closePath();
    g.fill();
  });
  // the ear: a heavy cylindrical panicle drooping to the left from the top of the stem
  const eP = ease((p - 0.5) / 0.4);
  if (eP > 0 && stemP > 0.95) {
    // walk along the ear: it leaves the stem tip heading up-left and bends over to hang down
    let x = lean(yT);
    let y = yT;
    let ang = -Math.PI / 2 - 0.35 - sway * 0.04;
    const n = 48;
    const segL = (H * 0.36) / n;
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1);
      if (s > eP) break;
      ang -= (2.45 / n) * (0.6 + 0.8 * eP); // curl: up-left -> left -> down
      x += Math.cos(ang) * segL;
      y += Math.sin(ang) * segL;
      const w = 9 + 16 * Math.sin(Math.PI * Math.min(1, 0.15 + s * 1.0));
      g.fillStyle = rgba(lerpColor(lerpColor(carved, [222, 184, 96], colT), bz, bronze), 0.96);
      g.beginPath();
      g.ellipse(x, y, w, w * 0.66, ang, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = rgba(lerpColor(carved, [238, 210, 140], colT), 0.55);
      g.lineWidth = 1.1;
      for (let b2 = 0; b2 < 4; b2++) {
        const ba = ang + Math.PI / 2 + (b2 - 1.5) * 0.7;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(ba) * w * 1.6, y + Math.sin(ba) * w * 1.6);
        g.stroke();
      }
    }
  }
}

export const S17: React.FC = () => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps, durationInFrames } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const bone = useMemo(() => boneTexture(W, H), [W, H]);
  const plate = useMemo(() => platePath(W, H), [W, H]);
  const glyph = useMemo(() => new Path2D(HE_PATH), []);
  const t = f / fps;
  const u = f / Math.max(1, durationInFrames - 1);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    const fire = 0.82 + 0.18 * noise1(t * 5.0, 3) + 0.06 * noise1(t * 17.0, 8);
    // background firelight
    g.fillStyle = "#050101";
    g.fillRect(0, 0, W, H);
    const bg = g.createRadialGradient(W * 0.5, H * 1.15, 50, W * 0.5, H * 0.9, H * 1.1);
    bg.addColorStop(0, `rgba(255,110,30,${0.55 * fire})`);
    bg.addColorStop(0.5, `rgba(120,25,8,${0.35 * fire})`);
    bg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // plastron fades as the plant takes over
    const boneA = 1 - ease((u - 0.55) / 0.3);
    if (boneA > 0) {
      g.save();
      g.globalAlpha = boneA;
      g.clip(plate);
      g.drawImage(bone, 0, 0);
      g.globalCompositeOperation = "multiply";
      const tint = g.createLinearGradient(0, H, 0, 0);
      tint.addColorStop(0, `rgba(255,140,60,1)`);
      tint.addColorStop(1, `rgba(120,60,30,1)`);
      g.fillStyle = tint;
      g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "source-over";
      // burnt edge
      g.lineWidth = 60;
      g.strokeStyle = "rgba(30,10,4,0.55)";
      g.stroke(plate);
      // the 卜 crack, cracking open at the start
      const cr = ease(u / 0.12);
      g.strokeStyle = `rgba(20,8,4,0.9)`;
      g.shadowColor = "rgba(255,120,40,0.9)";
      g.shadowBlur = 16 * (1 - ease((u - 0.1) / 0.2));
      g.lineWidth = 4;
      const r2 = rng(9);
      g.beginPath();
      let x = W * 0.3;
      let y = H * 0.18;
      g.moveTo(x, y);
      const vlen = H * 0.62 * cr;
      for (let s = 0; s < vlen; s += 14) {
        x += (r2() - 0.5) * 8;
        y += 14;
        g.lineTo(x, y);
      }
      g.stroke();
      if (cr > 0.4) {
        g.beginPath();
        let bx = W * 0.3;
        let by = H * 0.42;
        g.moveTo(bx, by);
        for (let s = 0; s < W * 0.12 * ease((cr - 0.4) / 0.6); s += 12) {
          bx += 12;
          by += 4 + (r2() - 0.5) * 8;
          g.lineTo(bx, by);
        }
        g.stroke();
      }
      g.shadowBlur = 0;
      g.restore();
    }
    // carved glyph: highlight lip + dark groove, fading into the plant
    const glyphA = 1 - ease((u - 0.38) / 0.22);
    if (glyphA > 0) {
      const scale = (H * 0.66) / 468;
      g.save();
      g.globalAlpha = glyphA * boneA;
      g.translate(W * 0.6 - 234 * scale, H * 0.17);
      g.scale(scale, scale);
      g.translate(0, 468);
      g.scale(0.445714, -0.445714);
      g.translate(6, -6);
      g.fillStyle = "rgba(255,225,170,0.55)";
      g.fill(glyph);
      g.translate(-6, 6);
      g.fillStyle = "rgba(48,26,14,0.95)";
      g.fill(glyph);
      g.restore();
    }
    // the plant
    const p = ease((u - 0.3) / 0.55);
    if (p > 0) {
      const colT = ease((u - 0.45) / 0.3);
      const bronze = ease((u - 0.86) / 0.14);
      const sway = Math.sin(t * 1.6) * 0.8 + noise1(t * 0.9, 2) * 0.6;
      drawPlant(g, W, H, p, sway, colT, bronze);
    }
  }, [f, W, H, bone, plate, glyph, t, u]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
