import React, { useMemo } from "react";
import * as THREE from "three";
import { FONT } from "../../fonts";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getImg, rng, useTex } from "../../three/assets";

const PBR_NAMES = ["desk", "kraft", "paper", "knit", "chairwood"];
const EXTRA_TEX = ["tex/wood_detail.jpg"];
export const ROOM_PRELOAD = {
  tex: [...PBR_NAMES.flatMap((n) => [`tex/${n}_col.jpg`, `tex/${n}_nrm.png`, `tex/${n}_rgh.png`]), ...EXTRA_TEX],
  img: ["tex/paper_col.jpg"],
  fonts: [FONT.fang, FONT.hand, FONT.serif],
};

// ---------------------------------------------------------------- materials
export function usePBR(name: string, opts: { repeat?: [number, number]; normalScale?: number } = {}) {
  const col = useTex(`tex/${name}_col.jpg`, { repeat: opts.repeat });
  const nrm = useTex(`tex/${name}_nrm.png`, { srgb: false, repeat: opts.repeat });
  const rgh = useTex(`tex/${name}_rgh.png`, { srgb: false, repeat: opts.repeat });
  return { col, nrm, rgh, ns: opts.normalScale ?? 1 };
}

// ---------------------------------------------------------------- desk + floor
function addDetail(mat: THREE.MeshPhysicalMaterial, detail: THREE.Texture | null) {
  if (!detail) return mat;
  detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.detailMap = { value: detail };
    sh.uniforms.detailRepeat = { value: new THREE.Vector2(150, 82) };
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D detailMap;\nuniform vec2 detailRepeat;")
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        {
          vec2 duv = vMapUv * detailRepeat;
          float fade = clamp(1.6 - length(fwidth(duv)) * 3.0, 0.0, 1.0);
          vec3 d = texture2D(detailMap, duv).rgb * 2.0;
          diffuseColor.rgb *= mix(vec3(1.0), d, 0.85 * fade);
        }`,
      );
  };
  mat.customProgramCacheKey = () => "desk-detail";
  return mat;
}

export const Desk: React.FC = () => {
  const t = usePBR("desk", { normalScale: 0.32 });
  const detail = useTex("tex/wood_detail.jpg");
  const topMat = useMemo(
    () =>
      addDetail(
        new THREE.MeshPhysicalMaterial({ map: t.col, normalMap: t.nrm, normalScale: new THREE.Vector2(t.ns, t.ns), roughnessMap: t.rgh, roughness: 1, clearcoat: 0.4, clearcoatRoughness: 0.32, color: "#c9bcb4" }),
        detail,
      ),
    [t.col, t.nrm, t.rgh, t.ns, detail],
  );
  const topGeo = useMemo(() => new RoundedBoxGeometry(1.5, 0.044, 0.82, 5, 0.007), []);
  return (
    <group>
      <mesh position={[0, -0.022, 0]} receiveShadow castShadow material={topMat} geometry={topGeo} />
      {/* apron + legs, mostly lost in darkness */}
      <mesh position={[0, -0.1, -0.38]} receiveShadow>
        <boxGeometry args={[1.4, 0.11, 0.025]} />
        <meshStandardMaterial map={t.col} roughness={0.8} color="#7d6a5c" />
      </mesh>
      {[-0.7, 0.7].map((x) =>
        [-0.36, 0.36].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.4, z]}>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
            <meshStandardMaterial map={t.col} roughness={0.8} color="#5d4c40" />
          </mesh>
        )),
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.76, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#080706" roughness={0.95} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- banker's lamp
export const LAMP_POS: [number, number, number] = [-0.46, 0, -0.2];
export const SHADE_H = 0.355;

export const Lamp: React.FC<{ power: number }> = ({ power }) => {
  const brass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#b48b52", metalness: 1, roughness: 0.3, clearcoat: 0.25, clearcoatRoughness: 0.3 }), []);
  const baseGeo = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.074, 0.0], [0.078, 0.006], [0.076, 0.014], [0.06, 0.022], [0.04, 0.03], [0.03, 0.04], [0.014, 0.05], [0.011, 0.06], [0.0, 0.062],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const shadeOuter = useMemo(() => new THREE.CylinderGeometry(0.078, 0.078, 0.27, 64, 1, true, Math.PI / 2, Math.PI), []);
  const shadeInner = useMemo(() => new THREE.CylinderGeometry(0.074, 0.074, 0.268, 64, 1, true, Math.PI / 2, Math.PI), []);
  const cap = useMemo(() => new THREE.CircleGeometry(0.078, 48, 0, Math.PI), []);
  const glowMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const g = c.getContext("2d")!;
    // u runs around the half-cylinder, v along its axis: bright over the bulb, dimmer toward the ends
    const gv = g.createLinearGradient(0, 0, 0, 256);
    gv.addColorStop(0, "rgb(40,40,40)");
    gv.addColorStop(0.5, "rgb(255,255,255)");
    gv.addColorStop(1, "rgb(40,40,40)");
    g.fillStyle = gv;
    g.fillRect(0, 0, 256, 256);
    const gu = g.createLinearGradient(0, 0, 256, 0);
    gu.addColorStop(0, "rgba(0,0,0,0.55)");
    gu.addColorStop(0.5, "rgba(0,0,0,0)");
    gu.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = gu;
    g.fillRect(0, 0, 256, 256);
    // faint streaks in the cased glass
    const r = rng(19);
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.06})`;
      g.fillRect(r() * 256, 0, 1 + r() * 3, 256);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const glow = 0.15 + power;
  return (
    <group position={LAMP_POS}>
      <mesh geometry={baseGeo} material={brass} castShadow receiveShadow />
      {/* stem + yoke */}
      <mesh position={[0, 0.2, 0]} material={brass} castShadow>
        <cylinderGeometry args={[0.0075, 0.009, 0.3, 24]} />
      </mesh>
      <mesh position={[0, 0.335, 0]} material={brass} castShadow>
        <boxGeometry args={[0.2, 0.008, 0.012]} />
      </mesh>
      {/* shade: axis along x, opening faces down/front */}
      <group position={[0, SHADE_H, 0.025]} rotation={[Math.PI / 2 - 0.35, 0, Math.PI / 2]}>
        <mesh geometry={shadeOuter} castShadow>
          <meshPhysicalMaterial color="#093a20" roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={3.5} emissive="#22b45a" emissiveMap={glowMap} emissiveIntensity={0.02 + 0.55 * power} side={THREE.FrontSide} />
        </mesh>
        <mesh geometry={shadeInner}>
          <meshStandardMaterial color="#f3ead8" emissive="#ffe2b0" emissiveIntensity={2.4 * power + 0.01} side={THREE.BackSide} roughness={0.6} />
        </mesh>
        {[-0.135, 0.135].map((y) => (
          <mesh key={y} geometry={cap} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <meshPhysicalMaterial color="#093a20" roughness={0.05} clearcoat={1} envMapIntensity={3.5} emissive="#1c9a4c" emissiveIntensity={0.02 + 0.3 * power + 0.0 * glow} side={THREE.DoubleSide} />
          </mesh>
        ))}
        {/* brass fittings: rims at both ends and a spine along the top */}
        {[-0.1355, 0.1355].map((y) => (
          <mesh key={"rim" + y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={brass}>
            <torusGeometry args={[0.0785, 0.0022, 8, 48, Math.PI]} />
          </mesh>
        ))}
        <mesh position={[0, 0, -0.0795]} material={brass}>
          <cylinderGeometry args={[0.0026, 0.0026, 0.272, 12]} />
        </mesh>
        {/* bulb */}
        <mesh position={[0, 0, 0.004]}>
          <sphereGeometry args={[0.02, 24, 16]} />
          <meshBasicMaterial color={new THREE.Color(1, 0.86, 0.62).multiplyScalar(0.3 + 9 * power)} toneMapped={false} />
        </mesh>
      </group>
      {/* pull chain */}
      {Array.from({ length: 11 }).map((_, i) => (
        <mesh key={i} position={[0.09, SHADE_H - 0.07 - i * 0.0075, 0.045]} material={brass}>
          <sphereGeometry args={[0.0024, 10, 8]} />
        </mesh>
      ))}
      <mesh position={[0.09, SHADE_H - 0.07 - 11 * 0.0075 - 0.008, 0.045]} material={brass}>
        <cylinderGeometry args={[0.0035, 0.005, 0.016, 12]} />
      </mesh>
    </group>
  );
};

/** Lights belonging to the lamp; power 0..1 drives everything. */
export const LampLights: React.FC<{ power: number; shadowMap?: number }> = ({ power, shadowMap = 4096 }) => {
  const spot = useMemo(() => {
    const s = new THREE.SpotLight("#ffd29a");
    s.angle = 0.86;
    s.penumbra = 0.62;
    s.decay = 2;
    s.castShadow = true;
    s.shadow.mapSize.set(shadowMap, shadowMap);
    s.shadow.bias = -0.00004;
    s.shadow.normalBias = 0.0003;
    s.shadow.radius = 3;
    s.shadow.camera.near = 0.02;
    s.shadow.camera.far = 3;
    return s;
  }, [shadowMap]);
  const target = useMemo(() => new THREE.Object3D(), []);
  spot.intensity = 4.2 * power;
  spot.position.set(LAMP_POS[0] + 0.02, SHADE_H - 0.03, LAMP_POS[2] + 0.06);
  target.position.set(-0.1, 0, 0.1);
  spot.target = target;
  return (
    <>
      <primitive object={spot} />
      <primitive object={target} />
      {/* soft spill so the far chair edges catch a little light */}
      <pointLight position={[LAMP_POS[0] + 0.05, SHADE_H - 0.06, LAMP_POS[2] + 0.1]} color="#ffcf94" intensity={0.3 * power} decay={2} distance={0} />
      {/* desk bounce: warm light from below the lamp pool */}
      <pointLight position={[-0.12, 0.06, 0.05]} color="#d89a5c" intensity={0.05 * power} decay={2} />
      {/* the shade glows green above itself */}
      <pointLight position={[LAMP_POS[0], SHADE_H + 0.09, LAMP_POS[2]]} color="#3e9a5e" intensity={0.035 * power} decay={2} />
    </>
  );
};

// ---------------------------------------------------------------- form paper (征集表)
const FORM_ROWS: [string, string][] = [
  ["样品编号", ""],
  ["日　　期", ""],
  ["地　　点", "晋北　　　县　　　乡（镇）　　　村"],
  ["种质名称", ""],
  ["种质类型", "□地方品种　□选育品种　□野生资源　□其他"],
  ["主要特性", "□高产 □优质 □抗病 □抗虫 □抗旱 □耐贫瘠 □广适"],
  ["其他特性", ""],
  ["提 供 人", "姓名　　　　性别　　　年龄"],
  ["备　　注", ""],
];

export function useFormTexture(filled: boolean): THREE.CanvasTexture | null {
  const img = getImg("tex/paper_col.jpg");
  return useMemo(() => {
    if (!img) return null;
    const W = 1500;
    const H = 2121;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0, img.width, img.height, 0, 0, W, H);
    g.fillStyle = "rgba(255,248,232,0.18)";
    g.fillRect(0, 0, W, H);
    const ink = "rgba(48,38,30,0.86)";
    g.fillStyle = ink;
    g.strokeStyle = ink;
    g.textBaseline = "middle";
    g.font = `600 64px ${FONT.serif}`;
    g.textAlign = "center";
    g.fillText("农作物种质资源征集表", W / 2, 170);
    g.font = `30px ${FONT.fang}`;
    g.fillText("第三次全国农作物种质资源普查与收集行动", W / 2, 245);
    const x0 = 120;
    const x1 = W - 120;
    const xk = 390;
    let y = 320;
    const rh = 168;
    g.lineWidth = 3;
    g.strokeRect(x0, y, x1 - x0, rh * FORM_ROWS.length);
    FORM_ROWS.forEach(([k, v], i) => {
      const yy = y + i * rh;
      if (i > 0) {
        g.beginPath();
        g.moveTo(x0, yy);
        g.lineTo(x1, yy);
        g.stroke();
      }
      g.textAlign = "center";
      g.font = `40px ${FONT.fang}`;
      g.fillText(k, (x0 + xk) / 2, yy + rh / 2);
      g.textAlign = "left";
      g.font = `30px ${FONT.fang}`;
      if (v) g.fillText(v, xk + 30, yy + rh / 2);
    });
    g.beginPath();
    g.moveTo(xk, y);
    g.lineTo(xk, y + rh * FORM_ROWS.length);
    g.stroke();
    if (filled) {
      g.fillStyle = "rgba(25,30,60,0.88)";
      g.font = `74px ${FONT.hand}`;
      g.fillText("黄毛", xk + 40, y + rh * 3 + rh / 2);
    }
    // print wear: random specks + faint smudges
    const r = rng(7);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(60,45,30,${0.03 + r() * 0.06})`;
      g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, [img, filled]);
}

// ---------------------------------------------------------------- folder + papers
export const FOLDER_POS: [number, number, number] = [0.06, 0, 0.1];

export const Folder: React.FC<{ coverAngle: number; filled?: boolean }> = ({ coverAngle, filled = false }) => {
  const form = useFormTexture(filled);
  const kraft = usePBR("kraft");
  const paper = usePBR("paper");
  const W = 0.235;
  const D = 0.315;
  return (
    <group position={FOLDER_POS} rotation={[0, -0.06, 0]}>
      {/* back cover (right half) */}
      <mesh position={[W / 2, 0.0012, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, 0.0024, D]} />
        <meshStandardMaterial map={kraft.col} normalMap={kraft.nrm} roughnessMap={kraft.rgh} color="#e7cf9f" />
      </mesh>
      {/* paper stack */}
      <mesh position={[W / 2 + 0.002, 0.0024 + 0.003, 0.002]} receiveShadow castShadow>
        <boxGeometry args={[0.21, 0.006, 0.297]} />
        <meshStandardMaterial map={paper.col} roughness={0.9} color="#f2e6cc" />
      </mesh>
      <mesh position={[W / 2 + 0.003, 0.0024 + 0.0061, 0.002]} rotation={[-Math.PI / 2, 0, 0.012]} receiveShadow>
        <planeGeometry args={[0.21, 0.297]} />
        <meshStandardMaterial map={form} normalMap={paper.nrm} normalScale={new THREE.Vector2(0.4, 0.4)} roughness={0.88} />
      </mesh>
      {/* front cover, hinged at the spine (x=0) */}
      <group rotation={[0, 0, Math.PI - coverAngle]}>
        <mesh position={[W / 2, 0.0034, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, 0.0024, D]} />
          <meshStandardMaterial map={kraft.col} normalMap={kraft.nrm} roughnessMap={kraft.rgh} color="#e7cf9f" />
        </mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- fountain pen
/** Gold nib: shield outline tapering to the tipping, bent around the feed, slit + breather hole. */
function makeNibGeometry(): THREE.BufferGeometry {
  const L = 0.0165; // tip (y=0) .. shoulder (y=L)
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.bezierCurveTo(0.0009, 0.0035, 0.0026, 0.0085, 0.0031, 0.0125);
  sh.lineTo(0.0032, L);
  sh.lineTo(-0.0032, L);
  sh.lineTo(-0.0031, 0.0125);
  sh.bezierCurveTo(-0.0026, 0.0085, -0.0009, 0.0035, 0, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.00028, bevelEnabled: false, curveSegments: 24, steps: 1 });
  const p = g.attributes.position;
  const R = 0.0042;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    // bend across the width (cylinder around the pen axis) and lift the tip slightly
    const ang = x / R;
    const rr = R - z;
    p.setXYZ(i, Math.sin(ang) * rr, y, R - Math.cos(ang) * rr - (1 - y / L) * 0.0006);
  }
  g.computeVertexNormals();
  return g;
}

export const Pen: React.FC<{ position: [number, number, number]; rotation: [number, number, number] }> = ({ position, rotation }) => {
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0a0a0b", roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }), []);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#e2bd72", metalness: 1, roughness: 0.17 }), []);
  const steel = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d8d4cc", metalness: 1, roughness: 0.2 }), []);
  const feed = useMemo(() => new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.55 }), []);
  const nibGeo = useMemo(makeNibGeometry, []);
  // local frame: pen axis along +y, nib tip at the origin
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={nibGeo} material={gold} castShadow />
      {/* slit and breather hole */}
      <mesh position={[0, 0.0045, 0.00042]}>
        <boxGeometry args={[0.00012, 0.009, 0.0004]} />
        <meshBasicMaterial color="#120d06" />
      </mesh>
      <mesh position={[0, 0.0092, 0.0004]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.00055, 0.00055, 0.0005, 16]} />
        <meshBasicMaterial color="#120d06" />
      </mesh>
      {/* tipping */}
      <mesh position={[0, 0.0003, 0.0002]}>
        <sphereGeometry args={[0.00022, 12, 8]} />
        <meshPhysicalMaterial color="#77746d" metalness={1} roughness={0.35} />
      </mesh>
      {/* feed under the nib */}
      <mesh position={[0, 0.0105, -0.0012]} material={feed}>
        <cylinderGeometry args={[0.0021, 0.0014, 0.014, 16, 1, false, 0, Math.PI]} />
      </mesh>
      {/* grip section, ring, barrel */}
      <mesh position={[0, 0.0235, 0.0005]} material={black} castShadow>
        <cylinderGeometry args={[0.0051, 0.0042, 0.016, 40]} />
      </mesh>
      <mesh position={[0, 0.0322, 0.0005]} material={steel} castShadow>
        <cylinderGeometry args={[0.0056, 0.0056, 0.0018, 40]} />
      </mesh>
      <mesh position={[0, 0.074, 0.0005]} material={black} castShadow>
        <cylinderGeometry args={[0.0057, 0.0055, 0.082, 40]} />
      </mesh>
      <mesh position={[0, 0.118, 0.0005]} material={black} castShadow>
        <sphereGeometry args={[0.0055, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- kraft envelope
export const ENV_POS: [number, number, number] = [-0.25, 0, -0.04];

export const Envelope: React.FC<{ tip: number; spin?: number }> = ({ tip, spin = 0.5 + Math.PI }) => {
  const kraft = usePBR("kraft");
  const BACK = 0.0035; // flat back face half-offset
  const geo = useMemo(() => {
    const W = 0.115;
    const H = 0.165;
    const g = new THREE.BoxGeometry(W, H, 0.01, 22, 30, 4);
    const p = g.attributes.position;
    const r = rng(11);
    const bumps = Array.from({ length: 16 }, () => [r() - 0.5, r() - 0.5, (r() - 0.5) * 0.002] as const);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const yy = (y + H / 2) / H; // 0 bottom .. 1 top
      const xx = (x / W) * 2; // -1..1
      // grain sits low in the bag: fullest belly at ~35% height, pinched toward the folded top
      const belly = Math.sin(Math.PI * Math.min(1, yy * 1.15)) * (1 - yy * 0.7) * (1 - xx * xx * 0.55);
      let nz = z > 0 ? BACK * 0.4 + 0.019 * belly : -BACK;
      for (const [bx, by, bz] of bumps) {
        const d = Math.hypot(xx * 0.5 - bx, yy - 0.5 - by);
        nz += (z > 0 ? 1 : 0.25) * bz * Math.exp(-d * d * 70);
      }
      p.setXYZ(i, x, y + H / 2, nz);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  // tip: 0 standing -> 1 lying on its flat back; pivot = bottom edge of the back face
  return (
    <group position={ENV_POS} rotation={[0, spin, 0]}>
      <group position={[0, 0, -BACK]} rotation={[-tip * (Math.PI / 2), 0, 0]}>
        <group position={[0, 0, BACK]}>
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial map={kraft.col} normalMap={kraft.nrm} roughness={0.88} color="#e2c595" />
          </mesh>
          {/* top folded over twice */}
          <mesh position={[0, 0.156, 0.004]} rotation={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.114, 0.02, 0.0035]} />
            <meshStandardMaterial map={kraft.col} roughness={0.9} color="#d4b483" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- chair
export const CHAIR_POS: [number, number, number] = [0.02, -0.76, -0.86];

export const Chair: React.FC = () => {
  const w = usePBR("chairwood");
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a89482", map: w.col, normalMap: w.nrm, roughnessMap: w.rgh }), [w.col, w.nrm, w.rgh]);
  const legs: [number, number][] = [
    [-0.19, -0.18],
    [0.19, -0.18],
    [-0.19, 0.18],
    [0.19, 0.18],
  ];
  return (
    <group position={CHAIR_POS} rotation={[0, 0.06, 0]}>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.225, z]} material={mat} castShadow receiveShadow>
          <boxGeometry args={[0.034, 0.45, 0.034]} />
        </mesh>
      ))}
      <mesh position={[0, 0.462, 0]} material={mat} castShadow receiveShadow>
        <boxGeometry args={[0.43, 0.026, 0.41]} />
      </mesh>
      {[-0.19, 0.19].map((x) => (
        <mesh key={x} position={[x, 0.7, -0.18]} rotation={[-0.06, 0, 0]} material={mat} castShadow receiveShadow>
          <boxGeometry args={[0.034, 0.48, 0.03]} />
        </mesh>
      ))}
      {[0.62, 0.76, 0.9].map((y) => (
        <mesh key={y} position={[0, y, -0.18 - (y - 0.48) * 0.06]} rotation={[-0.06, 0, 0]} material={mat} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.045, 0.018]} />
        </mesh>
      ))}
      {/* stretchers */}
      {[-0.18, 0.18].map((z) => (
        <mesh key={z} position={[0, 0.12, z]} material={mat}>
          <boxGeometry args={[0.38, 0.02, 0.02]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- water glass
const REFLECT_MAT = new THREE.MeshPhysicalMaterial({
  color: "#000000",
  roughness: 0.025,
  metalness: 0,
  specularIntensity: 1,
  envMapIntensity: 3.2,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

let CAUSTIC_TEX: THREE.Texture | null = null;
function causticTex(): THREE.Texture {
  if (CAUSTIC_TEX) return CAUSTIC_TEX;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  // a cylinder of water focuses the lamp into a bright crescent inside its own shadow
  const grd = g.createRadialGradient(128, 64, 2, 128, 64, 60);
  grd.addColorStop(0, "rgba(255,240,205,1)");
  grd.addColorStop(0.35, "rgba(255,225,170,0.55)");
  grd.addColorStop(1, "rgba(255,210,150,0)");
  g.fillStyle = grd;
  g.save();
  g.translate(128, 64);
  g.scale(1.9, 0.55);
  g.translate(-128, -64);
  g.fillRect(0, 0, 256, 128);
  g.restore();
  g.strokeStyle = "rgba(255,248,225,0.8)";
  g.lineWidth = 3;
  g.filter = "blur(2px)";
  g.beginPath();
  g.ellipse(128, 70, 70, 20, 0, Math.PI * 1.1, Math.PI * 1.9);
  g.stroke();
  CAUSTIC_TEX = new THREE.CanvasTexture(c);
  CAUSTIC_TEX.colorSpace = THREE.SRGBColorSpace;
  return CAUSTIC_TEX;
}

export const Glass: React.FC<{ position: [number, number, number]; wobble: number; t: number; power?: number }> = ({ position, wobble, t, power = 1 }) => {
  const glassGeo = useMemo(() => {
    const pts = [
      [0.0, 0.0], [0.031, 0.0], [0.033, 0.002], [0.036, 0.1], [0.0345, 0.1], [0.0315, 0.009], [0.0, 0.009],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 72);
  }, []);
  const waterGeo = useMemo(() => new THREE.CylinderGeometry(0.0342, 0.0314, 0.072, 72, 1), []);
  const surf = useMemo(() => new THREE.CircleGeometry(0.0342, 72, 0, Math.PI * 2), []);
  // tilt the water surface for the slosh
  const tiltX = wobble * Math.sin(t * 9.0) * 0.12;
  const tiltZ = wobble * Math.cos(t * 7.3) * 0.09;
  return (
    <group position={position}>
      {/* reflections only (black albedo, additive): the lamp and the room glint on the glass without greying it */}
      <mesh geometry={glassGeo} material={REFLECT_MAT} renderOrder={3} />
      {/* caustic: offset away from the lamp, inside the shadow, wobbling with the water */}
      <mesh
        position={[Math.cos(Math.atan2(position[2] - LAMP_POS[2], position[0] - LAMP_POS[0])) * 0.075, 0.0006, Math.sin(Math.atan2(position[2] - LAMP_POS[2], position[0] - LAMP_POS[0])) * 0.075]}
        rotation={[-Math.PI / 2, 0, -Math.atan2(position[2] - LAMP_POS[2], position[0] - LAMP_POS[0]) + Math.PI / 2 + wobble * Math.sin(t * 9.0) * 0.15]}
        renderOrder={2}
      >
        <planeGeometry args={[0.07, 0.036]} />
        <meshBasicMaterial map={causticTex()} transparent opacity={0.32 * power * (1 + wobble * 0.3 * Math.sin(t * 13.0))} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={glassGeo} castShadow receiveShadow>
        {/* glass shell: transparent (not transmissive) so the water inside stays visible */}
        <meshPhysicalMaterial transparent opacity={0.085} roughness={0.02} metalness={0} color="#e8f0ec" specularIntensity={1} envMapIntensity={3.5} clearcoat={1} clearcoatRoughness={0.02} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={waterGeo} position={[0, 0.009 + 0.036, 0]}>
        <meshPhysicalMaterial transmission={1} thickness={0.068} roughness={0.0} ior={1.333} color="#f2fbf8" attenuationColor="#bfe3dc" attenuationDistance={0.09} envMapIntensity={2} />
      </mesh>
      <mesh geometry={surf} position={[0, 0.0815, 0]} rotation={[-Math.PI / 2 + tiltX, tiltZ, 0]}>
        <meshPhysicalMaterial transparent opacity={0.35} roughness={0.02} color="#dfeeea" specularIntensity={1} envMapIntensity={4} clearcoat={1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* meniscus: the bright line where water meets glass */}
      <mesh position={[0, 0.0815, 0]} rotation={[Math.PI / 2 + tiltX, tiltZ, 0]}>
        <torusGeometry args={[0.0337, 0.00065, 8, 96]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} envMapIntensity={4} emissive="#fff0d0" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- dust motes in the lamp light
const dustVert = /* glsl */ `
uniform float uTime; uniform vec3 uLamp; uniform vec3 uDir; uniform float uCos; uniform float uPower; uniform float uScale;
attribute float aSeed; varying float vA;
void main(){
  vec3 p = position;
  float t = uTime * 0.12 + aSeed * 40.0;
  p += vec3(sin(t*1.3+aSeed*7.0), sin(t*0.7+aSeed*3.0)*0.6, cos(t*1.1+aSeed*5.0)) * 0.012;
  p.y -= mod(uTime*0.004 + aSeed, 1.0) * 0.02;
  vec3 L = normalize(p - uLamp);
  float cone = smoothstep(uCos, uCos + 0.12, dot(L, uDir));
  float dist = length(p - uLamp);
  vA = 0.6 * cone * uPower / (1.0 + dist*dist*22.0) * (0.45 + 0.55*sin(aSeed*91.0 + uTime*0.8));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uScale * (0.6 + fract(aSeed*13.7)) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const dustFrag = /* glsl */ `
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.66) * vA * a * 1.6, 1.0);
}`;

export const Dust: React.FC<{ time: number; power: number; count?: number; scale?: number; box?: [number, number, number, number, number, number] }> = ({ time, power, count = 420, scale = 2.2, box = [-0.6, 0.6, 0.0, 0.45, -0.5, 0.5] }) => {
  const geo = useMemo(() => {
    const r = rng(23);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = box[0] + r() * (box[1] - box[0]);
      pos[i * 3 + 1] = box[2] + r() * (box[3] - box[2]);
      pos[i * 3 + 2] = box[4] + r() * (box[5] - box[4]);
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count, box]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dustVert,
        fragmentShader: dustFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uLamp: { value: new THREE.Vector3(LAMP_POS[0], SHADE_H - 0.03, LAMP_POS[2] + 0.06) },
          uDir: { value: new THREE.Vector3(0.38, -0.33, 0.29).normalize() },
          uCos: { value: Math.cos(1.0) },
          uPower: { value: 1 },
          uScale: { value: 2 },
        },
      }),
    [],
  );
  mat.uniforms.uTime.value = time;
  mat.uniforms.uPower.value = power;
  mat.uniforms.uScale.value = scale;
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

// ---------------------------------------------------------------- over-the-shoulder foreground
export const Shoulder: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const k = usePBR("knit", { repeat: [3, 3] });
  return (
    <mesh position={position} scale={[0.13, 0.085, 0.11]} rotation={[0.2, 0.5, 0.15]}>
      <sphereGeometry args={[1, 64, 48]} />
      <meshPhysicalMaterial map={k.col} normalMap={k.nrm} roughness={0.95} color="#8c8a86" sheen={1} sheenColor="#b8b4ac" sheenRoughness={0.7} />
    </mesh>
  );
};
