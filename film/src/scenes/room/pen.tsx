import React, { useMemo } from "react";
import * as THREE from "three";
import { rng } from "../../three/assets";

// A proper fountain pen for macro work. Units: metres; local +y is the pen axis, nib tip at the origin.
// Nib: two-tone 14K gold with a rhodium heart, engraved scrollwork, a real slit + breather hole,
// iridium tipping; black ebonite feed with comb fins; black resin section with threads and gold ring;
// black lacquer barrel with micro-scratched clearcoat.

const NIB_L = 0.0215; // tip -> back of nib (most of it hides in the section)
const NIB_R = 0.0042; // curvature radius across the width

function nibOutline(): THREE.Shape {
  // half-width profile w(y) for y in [0, NIB_L], mirrored
  const w = (y: number) => {
    const t = y / NIB_L;
    if (t < 0.62) return 0.00012 + 0.0037 * Math.pow(t / 0.62, 0.78); // tines widening to the shoulders
    if (t < 0.7) return 0.00382 + 0.00016 * Math.sin(((t - 0.62) / 0.08) * Math.PI * 0.5); // shoulders
    return 0.00398 - 0.0003 * ((t - 0.7) / 0.3); // body tapering into the section
  };
  const N = 60;
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  for (let i = 1; i <= N; i++) {
    const y = (i / N) * NIB_L;
    sh.lineTo(w(y), y);
  }
  for (let i = N; i >= 1; i--) {
    const y = (i / N) * NIB_L;
    sh.lineTo(-w(y), y);
  }
  // (the shape closes itself; repeating the start point leaves a zero-length edge that NaNs the bevel)
  // breather hole (heart-ish) + the slit running from it toward the tip
  const hole = new THREE.Path();
  const hy = 0.0094;
  const hr = 0.00048;
  hole.moveTo(0, hy - hr * 1.35);
  hole.bezierCurveTo(hr * 1.2, hy - hr * 0.5, hr * 1.25, hy + hr * 0.9, 0, hy + hr * 0.45);
  hole.bezierCurveTo(-hr * 1.25, hy + hr * 0.9, -hr * 1.2, hy - hr * 0.5, 0, hy - hr * 1.35);
  sh.holes.push(hole);
  const slit = new THREE.Path();
  const sw = 0.000045;
  slit.moveTo(-sw, 0.00035);
  slit.lineTo(sw, 0.00035);
  slit.lineTo(sw, hy - hr * 1.2);
  slit.lineTo(-sw, hy - hr * 1.2);
  slit.lineTo(-sw, 0.00035);
  sh.holes.push(slit);
  return sh;
}

function nibGeometry(): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(nibOutline(), {
    depth: 0.00022,
    bevelEnabled: true,
    bevelThickness: 0.00003,
    bevelSize: 0.000025,
    bevelSegments: 2,
    curveSegments: 48,
    steps: 1,
  });
  // keep flat-space UVs for the engraving (x in [-4.2mm, 4.2mm], y in [0, NIB_L])
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = p.getX(i) / 0.0084 + 0.5;
    uv[i * 2 + 1] = p.getY(i) / NIB_L;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  // bend across the width around the pen axis; tines flatten toward the tip
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const t = y / NIB_L;
    const R = NIB_R * (1 + 1.4 * Math.pow(1 - t, 3)); // flatter near the tip
    const a = x / R;
    const rr = R - z;
    p.setXYZ(i, Math.sin(a) * rr, y, R - Math.cos(a) * rr - Math.pow(1 - t, 2.2) * 0.00055);
  }
  g.computeVertexNormals();
  return g;
}

/** Engraving maps drawn in nib-flat UV space: colour (gold + rhodium heart), roughness, bump. */
function engravingMaps() {
  const S = 1024;
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = c.height = S;
    return c;
  };
  const toPx = (x: number, y: number): [number, number] => [(x / 0.0084 + 0.5) * S, (1 - y / NIB_L) * S];
  const col = mk();
  const gc = col.getContext("2d")!;
  const bump = mk();
  const gb = bump.getContext("2d")!;
  const rough = mk();
  const gr = rough.getContext("2d")!;
  gc.fillStyle = "#f0cb7e";
  gc.fillRect(0, 0, S, S);
  gb.fillStyle = "#808080";
  gb.fillRect(0, 0, S, S);
  gr.fillStyle = "#2a2a2a"; // polished gold ~0.16
  gr.fillRect(0, 0, S, S);
  // rhodium-plated heart around the breather hole (two-tone nib)
  const heart = (g: CanvasRenderingContext2D, style: string) => {
    const [cx, cy] = toPx(0, 0.0102);
    g.fillStyle = style;
    g.beginPath();
    g.moveTo(cx, cy + 120);
    g.bezierCurveTo(cx + 150, cy + 20, cx + 150, cy - 170, cx, cy - 120);
    g.bezierCurveTo(cx - 150, cy - 170, cx - 150, cy + 20, cx, cy + 120);
    g.fill();
  };
  heart(gc, "#dfe2e4");
  // engraved lines: border following the outline, scrollwork, hallmarks
  const r = rng(14);
  const engrave = (draw: (g: CanvasRenderingContext2D) => void, width: number) => {
    gc.strokeStyle = "rgba(120,80,30,0.85)";
    gc.lineWidth = width;
    draw(gc);
    gb.strokeStyle = "#383838";
    gb.lineWidth = width * 1.2;
    draw(gb);
    gr.strokeStyle = "#8a8a8a";
    gr.lineWidth = width * 1.3;
    draw(gr);
  };
  // border inset from the outline
  engrave((g) => {
    g.beginPath();
    for (let i = 0; i <= 60; i++) {
      const y = 0.0028 + (i / 60) * (NIB_L * 0.68 - 0.0028);
      const t = y / NIB_L;
      const w = (t < 0.62 ? 0.00012 + 0.0037 * Math.pow(t / 0.62, 0.78) : 0.0038) - 0.00055;
      const [px, py] = toPx(w, y);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    for (let i = 60; i >= 0; i--) {
      const y = 0.0028 + (i / 60) * (NIB_L * 0.68 - 0.0028);
      const t = y / NIB_L;
      const w = (t < 0.62 ? 0.00012 + 0.0037 * Math.pow(t / 0.62, 0.78) : 0.0038) - 0.00055;
      const [px, py] = toPx(-w, y);
      g.lineTo(px, py);
    }
    g.stroke();
  }, 5);
  // scrollwork: spirals and vines on the shoulders
  for (const side of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const [cx, cy] = toPx(side * (0.0016 + 0.0006 * (k % 2)), 0.0062 + k * 0.0018);
      engrave((g) => {
        g.beginPath();
        for (let a = 0; a < Math.PI * 3.2; a += 0.08) {
          const rr = 6 + a * 7.5;
          const px = cx + side * Math.cos(a + k) * rr;
          const py = cy + Math.sin(a + k) * rr;
          if (a === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.stroke();
        g.beginPath();
        g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + side * (40 + r() * 30), cy - 60, cx + side * 20, cy - 110);
        g.stroke();
      }, 3);
    }
  }
  // hallmarks "14K" and "585" on the shoulders
  for (const [txt, y] of [["14K", 0.0128], ["585", 0.0141]] as const) {
    const [px, py] = toPx(0, y);
    for (const g of [gc, gb, gr]) {
      g.font = "bold 46px serif";
      g.textAlign = "center";
      g.fillStyle = g === gc ? "rgba(110,70,25,0.9)" : g === gb ? "#3a3a3a" : "#8a8a8a";
      g.fillText(txt, px, py);
    }
  }
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 16;
    return t;
  };
  return { map: tex(col, true), bump: tex(bump, false), rough: tex(rough, false) };
}

/** Fine random scratches for the lacquer clearcoat (tiles around the barrel). */
function scratchNormal(): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgb(128,128,255)";
  g.fillRect(0, 0, S, S);
  const r = rng(77);
  for (let i = 0; i < 260; i++) {
    const x = r() * S;
    const y = r() * S;
    const a = r() * Math.PI;
    const L = 10 + r() * 80;
    const nx = Math.round(128 + Math.cos(a + Math.PI / 2) * 60);
    const ny = Math.round(128 + Math.sin(a + Math.PI / 2) * 60);
    g.strokeStyle = `rgba(${nx},${ny},255,${0.25 + r() * 0.4})`;
    g.lineWidth = 0.6 + r() * 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 6);
  return t;
}

function lathe(points: [number, number][], seg = 96) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), seg);
}

export const FinePen: React.FC<{ position: [number, number, number]; rotation: [number, number, number]; inked?: number }> = ({ position, rotation, inked = 0 }) => {
  const nibGeo = useMemo(nibGeometry, []);
  const eng = useMemo(engravingMaps, []);
  const scratches = useMemo(scratchNormal, []);
  const mats = useMemo(() => {
    const gold = new THREE.MeshPhysicalMaterial({ map: eng.map, roughnessMap: eng.rough, roughness: 0.55, bumpMap: eng.bump, bumpScale: 0.00004, metalness: 1, clearcoat: 0.3, clearcoatRoughness: 0.1, envMapIntensity: 1.6 });
    const trim = new THREE.MeshPhysicalMaterial({ color: "#e9c177", metalness: 1, roughness: 0.18, envMapIntensity: 1.5 });
    const lacquer = new THREE.MeshPhysicalMaterial({ color: "#060607", roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.035, clearcoatNormalMap: scratches, clearcoatNormalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.4 });
    const resin = new THREE.MeshPhysicalMaterial({ color: "#09090a", roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.05, envMapIntensity: 1.2 });
    const ebonite = new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.62, envMapIntensity: 0.6 });
    const iridium = new THREE.MeshPhysicalMaterial({ color: "#a7a39b", metalness: 1, roughness: 0.22 });
    const ink = new THREE.MeshPhysicalMaterial({ color: "#0b1024", roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.85 });
    return { gold, trim, lacquer, resin, ebonite, iridium, ink };
  }, [eng, scratches]);
  // section: front lip with gold ring, gentle concave grip, threads, step to the barrel
  const sectionGeo = useMemo(
    () =>
      lathe([
        [0.0038, 0.0148], [0.0045, 0.0152], [0.0046, 0.0168], [0.00445, 0.019], [0.0044, 0.0215], [0.00455, 0.024], [0.0048, 0.0262], [0.0049, 0.028],
        [0.0049, 0.0292], [0.0045, 0.0294], [0.0045, 0.0335],
      ]),
    [],
  );
  const threadsGeo = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 18; i++) pts.push([0.00455 + (i % 2 ? 0.00022 : 0), 0.0295 + i * 0.00021]);
    return lathe(pts, 72);
  }, []);
  const barrelGeo = useMemo(
    () =>
      lathe([
        [0.0059, 0.0336], [0.0062, 0.0342], [0.0062, 0.07], [0.0061, 0.105], [0.0058, 0.122], [0.0052, 0.128], [0.0038, 0.1315], [0.0, 0.1325],
      ]),
    [],
  );
  // feed under the nib: tapered half-cylinder; comb fins are separate thin plates below it
  const feedGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.0031, 0.0016, 0.0125, 32, 1, false, -Math.PI * 0.5, Math.PI);
    g.translate(0, 0.0125 / 2 + 0.0035, 0);
    return g;
  }, []);
  const fins = useMemo(() => Array.from({ length: 13 }, (_, i) => 0.0068 + i * 0.00058), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={nibGeo} material={mats.gold} castShadow receiveShadow />
      {/* tipping bead, split by the slit */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.00012, 0.00028, -0.0001]} scale={[0.00028, 0.00036, 0.0003]} material={mats.iridium}>
          <sphereGeometry args={[1, 20, 14]} />
        </mesh>
      ))}
      {inked > 0 ? (
        <mesh position={[0, 0.0012, 0.0002]} scale={[0.0003, 0.0016 * inked, 0.00012]} material={mats.ink}>
          <sphereGeometry args={[1, 16, 12]} />
        </mesh>
      ) : null}
      <mesh geometry={feedGeo} material={mats.ebonite} position={[0, 0, 0.00055]} />
      {fins.map((y) => (
        <mesh key={y} position={[0, y, 0.0036]} material={mats.ebonite}>
          <boxGeometry args={[0.0042, 0.00028, 0.0012]} />
        </mesh>
      ))}
      <mesh geometry={sectionGeo} material={mats.resin} position={[0, 0, 0.0026]} castShadow />
      <mesh position={[0, 0.0151, 0.0026]} rotation={[Math.PI / 2, 0, 0]} material={mats.trim}>
        <torusGeometry args={[0.00438, 0.00028, 12, 64]} />
      </mesh>
      <mesh geometry={threadsGeo} material={mats.resin} position={[0, 0, 0.0026]} />
      <mesh geometry={barrelGeo} material={mats.lacquer} position={[0, 0, 0.0026]} castShadow />
      <mesh position={[0, 0.1205, 0.0026]} material={mats.trim}>
        <cylinderGeometry args={[0.00592, 0.00592, 0.0018, 64, 1, true]} />
      </mesh>
    </group>
  );
};

/** A dark "only the desk lamp" environment for reflections in macro shots. */
export function lampEnvScene(): THREE.Scene {
  const s = new THREE.Scene();
  s.background = new THREE.Color("#020202");
  const lamp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.82, 0.55).multiplyScalar(14) }));
  lamp.position.set(-2.2, 3.2, -1.5);
  lamp.lookAt(0, 0, 0);
  s.add(lamp);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.45, 0.28).multiplyScalar(0.5) }));
  glow.position.set(-2.4, 3.6, -1.7);
  glow.lookAt(0, 0, 0);
  s.add(glow);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.32, 0.18, 0.09).multiplyScalar(0.45) }));
  desk.rotation.x = -Math.PI / 2;
  desk.position.y = -0.6;
  s.add(desk);
  const rim = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.65, 0.75).multiplyScalar(0.8) }));
  rim.position.set(2.5, 1.2, 2.0);
  rim.lookAt(0, 0, 0);
  s.add(rim);
  return s;
}
