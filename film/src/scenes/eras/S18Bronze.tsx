import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { rng } from "../../three/assets";
import { easeInOut, lerp3, smooth, type V3 } from "../../three/Rig";
import { Stage } from "./Stage";

// 西周: a bronze surface — 云雷纹 (square spirals) in low relief, a drooping millet ear in high relief,
// verdigris in the recesses; a bundle of bamboo slips beside it loosens and fans out.
const HW = 2048;
const HH = 1152;

function heightCanvas(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = HW;
  c.height = HH;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(80,80,80)";
  g.fillRect(0, 0, HW, HH);
  // leiwen field
  const cell = 150;
  g.strokeStyle = "rgb(160,160,160)";
  g.lineWidth = 17;
  g.lineCap = "square";
  for (let y = 0; y < HH + cell; y += cell) {
    for (let x = 0; x < HW + cell; x += cell) {
      const flip = ((x / cell + y / cell) | 0) % 2 === 0;
      g.beginPath();
      // square spiral inward
      let l = cell * 0.82;
      let px = x + cell * 0.09;
      let py = y + cell * 0.09;
      g.moveTo(px, py);
      const dirs = flip ? [[1, 0], [0, 1], [-1, 0], [0, -1]] : [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (let k = 0; k < 7 && l > 10; k++) {
        const [dx, dy] = dirs[k % 4];
        px += dx * l;
        py += dy * l;
        g.lineTo(px, py);
        if (k % 2 === 1) l -= 34;
      }
      g.stroke();
    }
  }
  // smooth raised field for the main motif + border ridges
  const fy0 = HH * 0.22;
  const fy1 = HH * 0.78;
  g.fillStyle = "rgb(120,120,120)";
  g.fillRect(HW * 0.18, fy0, HW * 0.64, fy1 - fy0);
  g.strokeStyle = "rgb(190,190,190)";
  g.lineWidth = 16;
  g.strokeRect(HW * 0.18, fy0, HW * 0.64, fy1 - fy0);
  // millet in high relief: stem, two leaves, heavy drooping ear (rounded with gradients)
  const sx = HW * 0.58;
  g.strokeStyle = "rgb(215,215,215)";
  g.lineWidth = 26;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(sx, fy1 - 20);
  g.quadraticCurveTo(sx + 30, HH * 0.42, sx - 40, HH * 0.3);
  g.stroke();
  for (const [lx, ly, side] of [[sx + 10, HH * 0.6, 1], [sx + 20, HH * 0.47, -1]] as const) {
    g.fillStyle = "rgb(200,200,200)";
    g.beginPath();
    g.moveTo(lx, ly);
    g.quadraticCurveTo(lx + side * 220, ly - 120, lx + side * 330, ly + 30);
    g.quadraticCurveTo(lx + side * 170, ly - 40, lx, ly + 22);
    g.fill();
  }
  const n = 26;
  for (let i = 0; i < n; i++) {
    const s = i / (n - 1);
    const a = -Math.PI * 0.55 - s * 1.9;
    const cx = sx - 40 + Math.cos(a) * 160 * s - 80 * s;
    const cy = HH * 0.3 + 60 * s * s + Math.sin(a) * 30 * s + 230 * s * s;
    const r = 30 + 26 * Math.sin(Math.PI * Math.min(1, s * 1.1));
    const grd = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r);
    grd.addColorStop(0, "rgb(255,255,255)");
    grd.addColorStop(1, "rgb(170,170,170)");
    g.fillStyle = grd;
    g.beginPath();
    g.ellipse(cx, cy, r, r * 0.8, a, 0, Math.PI * 2);
    g.fill();
  }
  return c;
}

function maps() {
  const h = heightCanvas();
  const g = h.getContext("2d")!;
  // soften the relief a touch
  const soft = document.createElement("canvas");
  soft.width = HW;
  soft.height = HH;
  const sg = soft.getContext("2d")!;
  sg.filter = "blur(3px)";
  sg.drawImage(h, 0, 0);
  const hd = sg.getImageData(0, 0, HW, HH).data;
  const H = (x: number, y: number) => hd[((Math.min(HH - 1, Math.max(0, y)) * HW + Math.min(HW - 1, Math.max(0, x))) << 2)] / 255;
  const nrm = g.createImageData(HW, HH);
  const col = g.createImageData(HW, HH);
  const rgh = g.createImageData(HW, HH);
  const r = rng(12);
  // smooth value noise (two octaves, bilinear) so the patina forms patches, not blocky speckle
  const GW = (HW >> 5) + 2;
  const GH = (HH >> 5) + 2;
  const g1 = new Float32Array(GW * GH).map(() => r());
  const G2W = (HW >> 3) + 2;
  const G2H = (HH >> 3) + 2;
  const g2 = new Float32Array(G2W * G2H).map(() => r());
  const bil = (grid: Float32Array, gw: number, x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = grid[yi * gw + xi];
    const b2 = grid[yi * gw + xi + 1];
    const c = grid[(yi + 1) * gw + xi];
    const d = grid[(yi + 1) * gw + xi + 1];
    return a + (b2 - a) * sx + (c - a) * sy + (a - b2 - c + d) * sx * sy;
  };
  const nz = (x: number, y: number) => 0.7 * bil(g1, GW, x / 32, y / 32) + 0.3 * bil(g2, G2W, x / 8, y / 8);
  for (let y = 0; y < HH; y++) {
    for (let x = 0; x < HW; x++) {
      const i = (y * HW + x) << 2;
      const dx = (H(x + 1, y) - H(x - 1, y)) * 6;
      const dy = (H(x, y + 1) - H(x, y - 1)) * 6;
      const l = Math.hypot(dx, dy, 1);
      nrm.data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      nrm.data[i + 1] = ((dy / l) * 0.5 + 0.5) * 255;
      nrm.data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      nrm.data[i + 3] = 255;
      const hh = H(x, y);
      const pat = Math.min(1, Math.max(0, (0.5 - hh) * 2.4 + (nz(x, y) - 0.5) * 0.9));
      // bronze -> verdigris in recesses, golden polish on the high relief
      const bronze = [118 + hh * 70, 88 + hh * 52, 48 + hh * 22];
      const verd = [64 + nz(x, y) * 30, 128 + nz(x, y) * 30, 104 + nz(x, y) * 20];
      col.data[i] = bronze[0] * (1 - pat) + verd[0] * pat;
      col.data[i + 1] = bronze[1] * (1 - pat) + verd[1] * pat;
      col.data[i + 2] = bronze[2] * (1 - pat) + verd[2] * pat;
      col.data[i + 3] = 255;
      const rough = 0.22 + 0.6 * pat + (1 - hh) * 0.1;
      rgh.data[i] = rgh.data[i + 1] = rgh.data[i + 2] = rough * 255;
      rgh.data[i + 3] = 255;
    }
  }
  const mk = (d: ImageData, srgb: boolean) => {
    const cc = document.createElement("canvas");
    cc.width = HW;
    cc.height = HH;
    cc.getContext("2d")!.putImageData(d, 0, 0);
    const t = new THREE.CanvasTexture(cc);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 16;
    return t;
  };
  return { normal: mk(nrm, false), color: mk(col, true), rough: mk(rgh, false) };
}

function bambooTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 1024;
  const g = c.getContext("2d")!;
  const r = rng(4);
  g.fillStyle = "#8d7448";
  g.fillRect(0, 0, 128, 1024);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? "120,95,50" : "235,215,160"},${0.08 + r() * 0.1})`;
    g.fillRect(r() * 128, 0, 1 + r() * 2, 1024);
  }
  g.fillStyle = "rgba(90,70,35,0.35)";
  g.fillRect(0, 300, 128, 6);
  g.fillRect(0, 760, 128, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const Slips: React.FC<{ open: number }> = ({ open }) => {
  const tex = useMemo(bambooTexture, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }), [tex]);
  const cord = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5a4630", roughness: 0.95 }), []);
  const N = 16;
  return (
    <group position={[0.56, 0.004, 0.06]} rotation={[0, -0.5, 0]} scale={0.8}>
      {Array.from({ length: N }).map((_, i) => {
        const c = i - (N - 1) / 2;
        return (
          <mesh key={i} material={mat} position={[c * (0.0155 + 0.006 * open), 0.0016, Math.abs(c) * 0.004 * open]} rotation={[0, c * 0.045 * open, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.014, 0.003, 0.26]} />
          </mesh>
        );
      })}
      {[-0.07, 0.07].map((z) => (
        <mesh key={z} material={cord} position={[0, 0.0035, z]} scale={[1, 1 - open, 1]}>
          <boxGeometry args={[0.27, 0.0025, 0.004]} />
        </mesh>
      ))}
    </group>
  );
};

const Plate: React.FC = () => {
  const m = useMemo(maps, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: m.color, normalMap: m.normal, normalScale: new THREE.Vector2(2.4, 2.4), roughnessMap: m.rough, roughness: 1, metalness: 0.88 }), [m]);
  return (
    <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[0.8, 0.45]} />
    </mesh>
  );
};

export const S18: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const u = f / Math.max(1, durationInFrames - 1);
  const k = easeInOut(Math.min(1, u / 0.8));
  const pos: V3 = lerp3([-0.3, 0.36, 0.34], [0.22, 0.36, 0.36], k);
  const target: V3 = lerp3([-0.08, 0, 0.0], [0.34, 0, 0.04], k);
  const open = smooth((u - 0.45) / 0.35);
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 34 }} focus={focus} farBlur={7} bloom={0.35} background="#030201">
        <ambientLight intensity={0.04} />
        <spotLight position={[-1.0, 0.22, 0.25]} angle={0.6} penumbra={0.7} intensity={30} color="#ffcf96" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <pointLight position={[0.6, 0.5, 0.6]} intensity={0.6} color="#9fb7c4" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial color="#120c08" roughness={0.9} />
        </mesh>
        <Plate />
        <Slips open={open} />
      </Stage>
    </AbsoluteFill>
  );
};
