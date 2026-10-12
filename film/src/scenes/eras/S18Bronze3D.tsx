import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FONT } from "../../fonts";
import { rng } from "../../three/assets";
import { easeInOut, lerp3, smooth, type V3 } from "../../three/Rig";
import { FireEnv } from "./FireEnv";
import { makeMilletMats, Plant } from "./millet";
import { Stage } from "./Stage";

// 西周 · 《诗经·大雅·生民》. Opens on exactly the frame S17 ends on: the millet, now cast bronze, stands
// in relief on the wall of a vessel. The camera slides along the 云雷纹 and a bundle of bamboo slips
// unrolls in front of the bronze — 「诞降嘉种」 — then its cords give and the slips drift apart.

// ------------------------------------------------------------------ the vessel wall
const WX0 = -1.0; // left edge of the wall (m)
const WW = 3.2;
const WH = 1.6;
const TW = 4096;
const TH = 2048;
const BEND = 3.0; // radius of the vessel wall
const toC = (x: number, y: number): [number, number] => [((x - WX0) / WW) * TW, ((WH / 2 - y) / WH) * TH];
const wallZ = (x: number) => -((x - 0.08) ** 2) / (2 * BEND);

function wallHeight(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(90,90,90)";
  g.fillRect(0, 0, TW, TH);
  // 云雷纹: square spirals in alternating chirality
  const cell = 92;
  g.strokeStyle = "rgb(165,165,165)";
  g.lineWidth = 11;
  g.lineCap = "square";
  for (let y = 0; y < TH + cell; y += cell)
    for (let x = 0; x < TW + cell; x += cell) {
      const flip = ((x / cell + y / cell) | 0) % 2 === 0;
      g.beginPath();
      let l = cell * 0.8;
      let px = x + cell * 0.1;
      let py = y + cell * 0.1;
      g.moveTo(px, py);
      const dirs = flip ? [[1, 0], [0, 1], [-1, 0], [0, -1]] : [[0, 1], [1, 0], [0, -1], [-1, 0]];
      for (let k = 0; k < 8 && l > 8; k++) {
        const [dx, dy] = dirs[k % 4];
        px += dx * l;
        py += dy * l;
        g.lineTo(px, py);
        if (k % 2 === 1) l -= 21;
      }
      g.stroke();
    }
  // bands of bosses (乳钉) above and below
  for (const by of [0.6, -0.62]) {
    const [, cy] = toC(0, by);
    g.fillStyle = "rgb(90,90,90)";
    g.fillRect(0, cy - 70, TW, 140);
    g.strokeStyle = "rgb(185,185,185)";
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(0, cy - 66);
    g.lineTo(TW, cy - 66);
    g.moveTo(0, cy + 66);
    g.lineTo(TW, cy + 66);
    g.stroke();
    for (let x = 40; x < TW; x += 120) {
      const grd = g.createRadialGradient(x - 8, cy - 8, 2, x, cy, 40);
      grd.addColorStop(0, "rgb(255,255,255)");
      grd.addColorStop(0.7, "rgb(200,200,200)");
      grd.addColorStop(1, "rgb(110,110,110)");
      g.fillStyle = grd;
      g.beginPath();
      g.arc(x, cy, 40, 0, Math.PI * 2);
      g.fill();
    }
  }
  // the smooth panel the millet stands on, framed by a raised ridge
  const [px0, py0] = toC(-0.34, 0.46);
  const [px1, py1] = toC(0.52, -0.44);
  g.fillStyle = "rgb(120,120,120)";
  g.fillRect(px0, py0, px1 - px0, py1 - py0);
  g.strokeStyle = "rgb(195,195,195)";
  g.lineWidth = 16;
  g.strokeRect(px0, py0, px1 - px0, py1 - py0);
  g.lineWidth = 6;
  g.strokeRect(px0 + 22, py0 + 22, px1 - px0 - 44, py1 - py0 - 44);
  return c;
}

function wallMaps() {
  const h = wallHeight();
  const soft = document.createElement("canvas");
  soft.width = TW;
  soft.height = TH;
  const sg = soft.getContext("2d")!;
  sg.filter = "blur(2.5px)";
  sg.drawImage(h, 0, 0);
  const hd = sg.getImageData(0, 0, TW, TH).data;
  const H = (x: number, y: number) => hd[((Math.min(TH - 1, Math.max(0, y)) * TW + Math.min(TW - 1, Math.max(0, x))) << 2)] / 255;
  const mkData = () => new ImageData(TW, TH);
  const nrm = mkData();
  const col = mkData();
  const rgh = mkData();
  const met = mkData();
  const r = rng(12);
  // value-noise grids for patina patches at two scales + pitting
  const grid = (cs: number) => {
    const gw = Math.ceil(TW / cs) + 2;
    const gh = Math.ceil(TH / cs) + 2;
    return { gw, cs, d: new Float32Array(gw * gh).map(() => r()) };
  };
  const G1 = grid(96);
  const G2 = grid(24);
  const G3 = grid(7);
  const bil = (G: { gw: number; cs: number; d: Float32Array }, x: number, y: number) => {
    const fx0 = x / G.cs;
    const fy0 = y / G.cs;
    const xi = Math.floor(fx0);
    const yi = Math.floor(fy0);
    const fx = fx0 - xi;
    const fy = fy0 - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = G.d[yi * G.gw + xi];
    const b = G.d[yi * G.gw + xi + 1];
    const c = G.d[(yi + 1) * G.gw + xi];
    const d = G.d[(yi + 1) * G.gw + xi + 1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  const px = WW / TW;
  for (let y = 0; y < TH; y++)
    for (let x = 0; x < TW; x++) {
      const i = (y * TW + x) << 2;
      const hh = H(x, y);
      const dx = ((H(x + 1, y) - H(x - 1, y)) * 0.006) / (2 * px);
      const dy = (-(H(x, y + 1) - H(x, y - 1)) * 0.006) / (2 * px);
      const l = Math.hypot(dx, dy, 1);
      nrm.data[i] = (-dx / l) * 127.5 + 127.5;
      nrm.data[i + 1] = (-dy / l) * 127.5 + 127.5;
      nrm.data[i + 2] = (1 / l) * 127.5 + 127.5;
      nrm.data[i + 3] = 255;
      const n1 = bil(G1, x, y);
      const n2 = bil(G2, x, y);
      const n3 = bil(G3, x, y);
      // recesses fill with malachite / azurite crust; high points are worn back to golden bronze
      const cavity = Math.min(1, Math.max(0, (0.52 - hh) * 2.6 + (n1 - 0.5) * 0.9 + (n2 - 0.5) * 0.35));
      const crust = Math.min(1, Math.max(0, cavity * 1.2 - 0.1));
      const cuprite = Math.max(0, (n1 - 0.72) * 3) * (1 - crust);
      const wear = Math.max(0, (hh - 0.6) * 2.5);
      let R = 112 + 40 * n2 + 70 * wear;
      let G = 80 + 28 * n2 + 52 * wear;
      let B = 44 + 14 * n2 + 22 * wear;
      R = R * (1 - cuprite) + 120 * cuprite;
      G = G * (1 - cuprite) + 52 * cuprite;
      B = B * (1 - cuprite) + 34 * cuprite;
      const vg = n2 > 0.55 ? [54, 120, 112] : [70, 136, 98];
      R = R * (1 - crust) + (vg[0] + 30 * n3) * crust;
      G = G * (1 - crust) + (vg[1] + 30 * n3) * crust;
      B = B * (1 - crust) + (vg[2] + 24 * n3) * crust;
      const pit = n3 > 0.86 ? 0.55 : 1;
      col.data[i] = R * pit;
      col.data[i + 1] = G * pit;
      col.data[i + 2] = B * pit;
      col.data[i + 3] = 255;
      const rough = 0.28 + 0.6 * crust + 0.1 * (1 - wear) + 0.1 * (pit < 1 ? 1 : 0);
      rgh.data[i] = rgh.data[i + 1] = rgh.data[i + 2] = Math.min(255, rough * 255);
      rgh.data[i + 3] = 255;
      const metal = 0.92 * (1 - crust) * (1 - 0.5 * cuprite);
      met.data[i] = met.data[i + 1] = met.data[i + 2] = metal * 255;
      met.data[i + 3] = 255;
    }
  const tex = (d: ImageData | HTMLCanvasElement, srgb: boolean) => {
    let cc: HTMLCanvasElement;
    if (d instanceof HTMLCanvasElement) cc = d;
    else {
      cc = document.createElement("canvas");
      cc.width = TW;
      cc.height = TH;
      cc.getContext("2d")!.putImageData(d, 0, 0);
    }
    const t = new THREE.CanvasTexture(cc);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 16;
    return t;
  };
  // roughness in G, metalness in B, as three.js expects when both maps share a texture
  const rm = mkData();
  for (let i = 0; i < rm.data.length; i += 4) {
    rm.data[i] = 255;
    rm.data[i + 1] = rgh.data[i];
    rm.data[i + 2] = met.data[i];
    rm.data[i + 3] = 255;
  }
  return { normal: tex(nrm, false), color: tex(col, true), rm: tex(rm, false), height: tex(soft, false) };
}

const Wall: React.FC = () => {
  const m = useMemo(wallMaps, []);
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: m.color,
        normalMap: m.normal,
        roughnessMap: m.rm,
        metalnessMap: m.rm,
        roughness: 1,
        metalness: 1,
        displacementMap: m.height,
        displacementScale: 0.008,
        displacementBias: -0.0045,
        clearcoat: 0.08,
        clearcoatRoughness: 0.5,
      }),
    [m],
  );
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(WW, WH, 900, 450);
    g.translate(WX0 + WW / 2, 0, 0);
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setZ(i, wallZ(p.getX(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={mat} receiveShadow />;
};

// ------------------------------------------------------------------ bamboo slips
// 《诗经·大雅·生民》, from the end of the fourth stanza to the end of the poem (punctuation dropped, as on slips)
const TEXT =
  "麻麦幪幪瓜瓞唪唪" +
  "诞后稷之穑有相之道茀厥丰草种之黄茂实方实苞实种实褎实发实秀实坚实好实颖实栗即有邰家室" +
  "诞降嘉种维秬维秠维穈维芑恒之秬秠是获是亩恒之穈芑是任是负以归肇祀" +
  "诞我祀如何或舂或揄或簸或蹂释之叟叟烝之浮浮载谋载惟取萧祭脂取羝以軷载燔载烈以兴嗣岁" +
  "卬盛于豆于豆于登其香始升上帝居歆胡臭亶时后稷肇祀庶无罪悔以迄于今";
const N = 22;
const PER = 6;
const KEY = 13; // the slip that carries 诞降嘉种 (the camera ends on it)
const SW = 0.026;
const SH = 0.42;
const PITCH = 0.031;

function slipAtlas(): THREE.CanvasTexture {
  const CW = 128;
  const CH = 2048;
  const c = document.createElement("canvas");
  c.width = CW * N;
  c.height = CH;
  const g = c.getContext("2d")!;
  const r = rng(4);
  // reading runs right to left: slip N-1 holds the first characters
  const start = TEXT.indexOf("诞降嘉种") - (N - 1 - KEY) * PER;
  for (let k = 0; k < N; k++) {
    const x0 = k * CW;
    const tone = 0.85 + r() * 0.2;
    g.fillStyle = `rgb(${Math.round(176 * tone)},${Math.round(146 * tone)},${Math.round(92 * tone)})`;
    g.fillRect(x0, 0, CW, CH);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(${r() > 0.5 ? "110,84,44" : "232,208,150"},${0.06 + r() * 0.1})`;
      g.fillRect(x0 + r() * CW, 0, 1 + r() * 2.5, CH);
    }
    // bamboo nodes, edge darkening, a few stains
    g.fillStyle = "rgba(80,58,28,0.45)";
    g.fillRect(x0, CH * (0.24 + r() * 0.04), CW, 7);
    g.fillRect(x0, CH * (0.7 + r() * 0.04), CW, 7);
    const eg = g.createLinearGradient(x0, 0, x0 + CW, 0);
    eg.addColorStop(0, "rgba(60,40,20,0.45)");
    eg.addColorStop(0.15, "rgba(60,40,20,0)");
    eg.addColorStop(0.85, "rgba(60,40,20,0)");
    eg.addColorStop(1, "rgba(60,40,20,0.45)");
    g.fillStyle = eg;
    g.fillRect(x0, 0, CW, CH);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = `rgba(70,48,24,${0.06 + r() * 0.08})`;
      g.beginPath();
      g.ellipse(x0 + r() * CW, r() * CH, 10 + r() * 30, 20 + r() * 80, 0, 0, Math.PI * 2);
      g.fill();
    }
    // the text, brushed in ink
    const idx0 = start + (N - 1 - k) * PER;
    g.fillStyle = "rgba(22,14,8,0.92)";
    g.font = `92px ${FONT.kai}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (let j = 0; j < PER; j++) {
      const ch = TEXT[idx0 + j] ?? "";
      g.save();
      g.translate(x0 + CW / 2 + (r() - 0.5) * 4, 300 + j * 118);
      g.rotate((r() - 0.5) * 0.04);
      g.fillText(ch, 0, 0);
      g.restore();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
}

type SlipPose = { p: THREE.Vector3; yaw: number; tilt: number };

/** The bundle unrolls left to right; what is still rolled spirals around a vertical axis at the front edge. */
function slipPoses(unroll: number, loosen: number): SlipPose[] {
  const r = rng(77);
  const x0 = 0.5;
  const z0 = 0.15;
  const L = N * PITCH;
  const U = 0.1 + (L - 0.1) * unroll;
  const out: SlipPose[] = [];
  for (let i = 0; i < N; i++) {
    const xi = i * PITCH;
    const jitter = { a: r(), b: r(), c: r() };
    let p: THREE.Vector3;
    let yaw = 0;
    if (xi <= U) {
      p = new THREE.Vector3(x0 + xi, (jitter.b - 0.5) * 0.008, z0 + (jitter.c - 0.5) * 0.004);
      yaw = (jitter.a - 0.5) * 0.08;
    } else {
      const R = 0.04 + 0.0018 * (xi - U) / PITCH;
      const th = (xi - U) / R;
      p = new THREE.Vector3(x0 + U + R * Math.sin(th), 0, z0 + R - R * Math.cos(th));
      yaw = -th;
    }
    // once the cords give, each slip drifts off on its own
    const lz = loosen * loosen;
    p.x += (i - KEY) * 0.012 * lz + (jitter.a - 0.5) * 0.02 * lz;
    p.y += (jitter.b - 0.5) * 0.05 * lz;
    p.z += (jitter.c - 0.3) * 0.06 * lz;
    out.push({ p, yaw: yaw + (jitter.a - 0.5) * 0.5 * lz, tilt: (jitter.b - 0.5) * 0.25 * lz });
  }
  return out;
}

const Slips: React.FC<{ unroll: number; loosen: number }> = ({ unroll, loosen }) => {
  const atlas = useMemo(slipAtlas, []);
  const geos = useMemo(
    () =>
      Array.from({ length: N }, (_, k) => {
        const g = new THREE.BoxGeometry(SW, SH, 0.005, 1, 1, 1);
        // front face shows this slip's column of the atlas; sides and back are plain bamboo
        const uv = g.getAttribute("uv") as THREE.BufferAttribute;
        for (let i = 0; i < uv.count; i++) uv.setX(i, (k + 0.06 + uv.getX(i) * 0.88) / N);
        return g;
      }),
    [],
  );
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: atlas, roughness: 0.62 }), [atlas]);
  const cordMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6a5232", roughness: 0.95 }), []);
  const poses = slipPoses(unroll, loosen);
  const cordGeo = useMemo(() => new THREE.CylinderGeometry(0.0022, 0.0022, 1, 6), []);
  const cords: React.ReactNode[] = [];
  if (loosen < 0.98) {
    for (const cy of [-0.11, 0.11])
      for (let i = 0; i < N - 1; i++) {
        const a = poses[i].p.clone().add(new THREE.Vector3(0, cy, 0.003));
        const b = poses[i + 1].p.clone().add(new THREE.Vector3(0, cy, 0.003));
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const d = b.clone().sub(a);
        const len = d.length() * (1 - loosen);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
        cords.push(<mesh key={`${cy}-${i}`} geometry={cordGeo} material={cordMat} position={mid} quaternion={q} scale={[1, Math.max(1e-4, len), 1]} castShadow />);
      }
  }
  return (
    <group>
      {poses.map((s, i) => (
        <mesh key={i} geometry={geos[i]} material={mat} position={s.p} rotation={[s.tilt, s.yaw, 0]} castShadow receiveShadow />
      ))}
      {cords}
    </group>
  );
};

// ------------------------------------------------------------------ shot
const KEY_TARGET = new THREE.Object3D();

export const S18: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const u = f / Math.max(1, durationInFrames - 1);
  const mats = useMemo(makeMilletMats, []);
  mats.setBronze(1, 0.5 + 0.12 * u);

  // start exactly where S17 left the camera, slide along the vessel, end pushed in on the key slip
  let pos: V3;
  let target: V3;
  if (u < 0.42) {
    const k = easeInOut(u / 0.42);
    pos = lerp3([0.3, -0.1, 1.08], [0.66, -0.03, 0.92], k);
    target = lerp3([0.06, 0.07, 0.04], [0.64, 0.02, 0.06], k);
  } else {
    const k = easeInOut((u - 0.42) / 0.58);
    const keyX = 0.5 + KEY * PITCH;
    pos = lerp3([0.66, -0.03, 0.92], [keyX + 0.03, 0.03, 0.48], k);
    target = lerp3([0.64, 0.02, 0.06], [keyX, 0.05, 0.15], k);
  }
  const unroll = smooth((u - 0.22) / 0.5);
  const loosen = smooth((u - 0.74) / 0.26);
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 30, near: 0.02, far: 10 }} focus={focus} farBlur={5} bloom={0.35} vignette={0.7} background="#030201">
        <ambientLight intensity={0.02} />
        <FireEnv strength={0.55} />
        <primitive object={KEY_TARGET} position={[0.45, 0.0, 0.0]} />
        <spotLight
          position={[-0.7, 0.95, 1.25]}
          target={KEY_TARGET}
          angle={0.75}
          penumbra={0.85}
          decay={2}
          intensity={5.5}
          color="#ffd2a0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0003}
        />
        <pointLight position={[1.6, 0.4, 1.0]} intensity={0.35} color="#9fb4c8" distance={4} decay={2} />
        <pointLight position={[0.9, -0.5, 0.6]} intensity={0.25 + 0.4 * smooth((u - 0.4) / 0.3)} color="#ffb070" distance={3} decay={2} />
        <Wall />
        <Plant g={1} droop={1} sway={0} mats={mats} />
        <Slips unroll={unroll} loosen={loosen} />
      </Stage>
    </AbsoluteFill>
  );
};
