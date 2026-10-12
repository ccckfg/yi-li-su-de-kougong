import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { getTex, rng } from "../../three/assets";
import { easeInOut, easeOut, smooth, type V3 } from "../../three/Rig";
import { GR, grainGeometry, GRAIN_PRELOAD, useGrainMaterial } from "../room/grains";
import { Stage } from "../eras/Stage";

// 露白, seen the way the storyboard asks: through the glass of a soil observation box. Moist crumbs
// pressed against the glass, condensation beaded on it (out of focus in front), the grain in a pocket
// between crumbs. It swells; the radicle, in its sheath, pushes out from the BASE (embryo end, local -x;
// docs/factcheck.md 12d) and turns down, root hairs coming in behind the tip.
const SOIL_TEX = "tex/soil_section.jpg";
const GRAIN_C = new THREE.Vector3(0, 0, -0.00125);
const GRAIN_ROT = new THREE.Euler(0.15, 0.35, 0.38);

function crumbGeometry(seed: number) {
  const g = new THREE.SphereGeometry(1, 28, 18);
  const p = g.attributes.position;
  const r = rng(seed);
  const offs = Array.from({ length: 7 }, () => [r() - 0.5, r() - 0.5, r() - 0.5, r() * 0.4] as const);
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
    let k = 1;
    for (const [a, b, c, s] of offs) {
      const d = v.dot(new THREE.Vector3(a, b, c).normalize());
      k += s * 0.5 * Math.sin(d * 4.0 + a * 9) + s * 0.12 * Math.sin(d * 17.0 + b * 5) + s * 0.05 * Math.sin(d * 41.0 + c * 3);
    }
    k -= 0.18 * Math.max(0, Math.abs(v.y) - 0.6); // flattened like a clod
    v.multiplyScalar(k * (0.86 + 0.14 * Math.sin(v.x * 9 + v.y * 6 + v.z * 4)));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** The radicle path: out of the base along -x, bending down under gravity. */
function radiclePath(grow: number, anchor: THREE.Vector3, dirOut: THREE.Vector3): THREE.Vector3[] {
  const L = 0.00145 * grow;
  const pts: THREE.Vector3[] = [];
  const down = new THREE.Vector3(0, -1, 0);
  const p = anchor.clone();
  const d = dirOut.clone().normalize();
  const n = 20;
  pts.push(p.clone());
  for (let i = 1; i <= n; i++) {
    const s = i / n;
    d.lerp(down, 0.11 * grow).normalize();
    p.addScaledVector(d, L / n);
    pts.push(p.clone().add(new THREE.Vector3(0, 0, 0.00004 * s)));
  }
  return pts;
}

function inPocket(x: number, y: number, z: number, path: THREE.Vector3[], s = 0) {
  const q = new THREE.Vector3(x, y, z).sub(GRAIN_C);
  // nothing may sit between the grain and the glass, and nothing may cut into it
  if (Math.hypot(q.x / 1.25, q.y) < 0.00125 + s && z > GRAIN_C.z - 0.0002) return true;
  if ((q.x / (0.00165 + s)) ** 2 + (q.y / (0.00138 + s)) ** 2 + (q.z / (0.0012 + s)) ** 2 < 1) return true;
  for (const p of path) if (Math.hypot(x - p.x, y - p.y, z - p.z) < 0.0004 + s * 0.8) return true;
  return false;
}

const Crumbs: React.FC<{ path: THREE.Vector3[] }> = ({ path }) => {
  const geos = useMemo(() => [crumbGeometry(3), crumbGeometry(7), crumbGeometry(11)], []);
  const soil = getTex(SOIL_TEX);
  if (soil) {
    soil.wrapS = soil.wrapT = THREE.RepeatWrapping;
    soil.needsUpdate = true;
  }
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.9, clearcoat: 0.35, clearcoatRoughness: 0.45 });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uSoil = { value: soil };
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vTpPos;\nvarying vec3 vTpNrm;")
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nmat4 tpM = modelMatrix;\n#ifdef USE_INSTANCING\ntpM = modelMatrix * instanceMatrix;\n#endif\nvTpPos = (tpM * vec4(transformed, 1.0)).xyz;\nvTpNrm = normalize(mat3(tpM) * objectNormal);",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform sampler2D uSoil;\nvarying vec3 vTpPos;\nvarying vec3 vTpNrm;")
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          {
            vec3 bw = pow(abs(normalize(vTpNrm)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
            vec3 q = vTpPos * 260.0;
            vec3 tp = texture2D(uSoil, q.yz).rgb * bw.x + texture2D(uSoil, q.xz).rgb * bw.y + texture2D(uSoil, q.xy).rgb * bw.z;
            diffuseColor.rgb *= tp * 1.9;
          }`,
        );
    };
    return m;
  }, [soil]);
  const meshes = useMemo(() => {
    const r = rng(8);
    const per = 900;
    return geos.map((geo, gi) => {
      const m = new THREE.InstancedMesh(geo, mat, per);
      const M = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const col = new THREE.Color();
      let k = 0;
      for (let tries = 0; k < per && tries < per * 12; tries++) {
        const s = 0.00004 + Math.pow(r(), 3.2) * 0.0007;
        const x = (r() - 0.5) * 0.019;
        const y = (r() - 0.5) * 0.012;
        let z = -0.0065 + r() * 0.0064;
        // crumbs at the front are pressed flat against the glass
        const front = z + s > -0.00005;
        if (front) z = -0.00005 - s * 0.45;
        if (inPocket(x, y, z, path, s)) continue;
        q.setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
        M.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (0.6 + r() * 0.4), front ? s * 0.45 : s * (0.6 + r() * 0.4)));
        m.setMatrixAt(k, M);
        const kind = r();
        if (kind < 0.55) col.setHSL(0.08, 0.12, 0.34 + r() * 0.2); // brown loam
        else if (kind < 0.8) col.setHSL(0.06, 0.2, 0.38 + r() * 0.16); // reddish clay
        else if (kind < 0.93) col.setHSL(0.1, 0.04, 0.5 + r() * 0.2); // grey silt / sand grain
        else col.setHSL(0.08, 0.1, 0.14); // humus, almost black
        if (gi === 2) col.multiplyScalar(1.15);
        m.setColorAt(k, col);
        k++;
      }
      m.count = k;
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      return m;
    });
  }, [geos, mat]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  );
};

/** Beads of condensation on the inside of the glass: in front of the focus, they bloom into soft discs. */
const Condensation: React.FC = () => {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.01, transmission: 1, thickness: 0.0003, ior: 1.33, specularIntensity: 1, envMapIntensity: 4.5, clearcoat: 1, clearcoatRoughness: 0.01 }),
    [],
  );
  const mesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    geo.rotateX(Math.PI / 2); // dome toward +z (the camera)
    const r = rng(21);
    const n = 140;
    const m = new THREE.InstancedMesh(geo, mat, n);
    const M = new THREE.Matrix4();
    let k = 0;
    for (let tries = 0; k < n && tries < 3000; tries++) {
      const x = (r() - 0.5) * 0.016;
      const y = (r() - 0.5) * 0.01;
      // leave the grain mostly clear
      if (Math.hypot((x - GRAIN_C.x) / 1.3, y - GRAIN_C.y) < 0.0018 && r() > 0.12) continue;
      const s = 0.00008 + Math.pow(r(), 1.8) * 0.00045;
      M.compose(new THREE.Vector3(x, y, 0.00002), new THREE.Quaternion(), new THREE.Vector3(s, s * (0.9 + r() * 0.2), s * 0.55));
      m.setMatrixAt(k++, M);
    }
    m.count = k;
    m.frustumCulled = false;
    return m;
  }, [mat]);
  return <primitive object={mesh} />;
};

/** Soft warm light from above the box: reflections for the wet crumbs and the droplets. */
const BoxEnv: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const env = useMemo(() => {
    const es = new THREE.Scene();
    es.background = new THREE.Color("#050302");
    const box = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.7, 1.2), side: THREE.DoubleSide }));
    box.position.set(0, 2.5, 1.0);
    box.lookAt(0, 0, 0);
    es.add(box);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.12, 0.14, 0.18), side: THREE.DoubleSide }));
    fill.position.set(-2, 0, 2);
    fill.lookAt(0, 0, 0);
    es.add(fill);
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(es, 0.02);
    pm.dispose();
    return rt.texture;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = 0.6;
  return null;
};

const Radicle: React.FC<{ grow: number; path: THREE.Vector3[] }> = ({ grow, path }) => {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.3, transmission: 0.15, thickness: 0.0003, sheen: 1, sheenColor: new THREE.Color("#ffffff"), clearcoat: 0.8, clearcoatRoughness: 0.12, emissive: "#fff8ea", emissiveIntensity: 0.12 }),
    [],
  );
  const hairMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.4, transparent: true, opacity: 0.75, sheen: 1, sheenColor: new THREE.Color("#ffffff") }), []);
  const hairs = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.0000045, 0.0000065, 1, 5);
    geo.translate(0, 0.5, 0);
    return new THREE.InstancedMesh(geo, hairMat, 260);
  }, [hairMat]);
  const geo = useMemo(() => {
    if (grow <= 0.001) return null;
    const curve = new THREE.CatmullRomCurve3(path);
    const segs = 40;
    const radial = 18;
    const frames = curve.computeFrenetFrames(segs, false);
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const s = i / segs;
      const c = curve.getPointAt(s);
      // sheath (coleorhiza) thicker at the base, rounded cap at the tip
      const rad = 0.00019 * (1 - 0.3 * s) * (s > 0.92 ? Math.sqrt(Math.max(0, 1 - ((s - 0.92) / 0.08) ** 2)) : 1) + 0.000004;
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        const nx = frames.normals[i].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[i].clone().multiplyScalar(Math.sin(a)));
        pos.push(c.x + nx.x * rad, c.y + nx.y * rad, c.z + nx.z * rad);
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
    g.setIndex(idx);
    g.computeVertexNormals();
    // root hairs: in the zone a little behind the tip, only once the radicle is long enough
    const r = rng(5);
    const M = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let k = 0;
    const hairOn = smooth((grow - 0.55) / 0.4);
    for (let h = 0; h < 260; h++) {
      const s = 0.35 + r() * 0.45;
      const fi = Math.round(s * segs);
      const c = curve.getPointAt(s);
      const a = r() * Math.PI * 2;
      const nx = frames.normals[fi].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[fi].clone().multiplyScalar(Math.sin(a)));
      const len = (0.00008 + r() * 0.00022) * hairOn * (1 - Math.abs(s - 0.55) * 1.2);
      if (len <= 0.000002) continue;
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nx);
      M.compose(c.clone().addScaledVector(nx, 0.00015), q, new THREE.Vector3(1, len, 1));
      hairs.setMatrixAt(k++, M);
    }
    hairs.count = k;
    hairs.instanceMatrix.needsUpdate = true;
    return g;
  }, [grow, path, hairs]);
  if (!geo) return null;
  return (
    <group>
      <mesh geometry={geo} material={mat} castShadow />
      <primitive object={hairs} />
    </group>
  );
};

const Grain: React.FC<{ swell: number }> = ({ swell }) => {
  const geo = useMemo(() => grainGeometry(220, 110), []);
  const mat = useGrainMaterial();
  const s = 1 + 0.12 * swell;
  return <mesh geometry={geo} material={mat} position={GRAIN_C} rotation={GRAIN_ROT} scale={[s, s * 1.02, s]} castShadow receiveShadow />;
};

const Backing: React.FC = () => {
  const tex = getTex(SOIL_TEX);
  return (
    <mesh position={[0, 0, -0.0068]}>
      <planeGeometry args={[0.04, 0.024]} />
      <meshStandardMaterial map={tex} roughness={0.85} color="#5a4c40" />
    </mesh>
  );
};

export const S35: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const u = f / Math.max(1, durationInFrames - 1);
  const swell = easeOut(t / 1.4, 2);
  const grow = easeInOut((t - 1.2) / 1.5);
  const sc = 1 + 0.12 * swell;
  // the embryo end of the grain (local -x), after rotation and swell
  const anchor = new THREE.Vector3(-GR[0] * sc * 0.97, -GR[1] * 0.15, 0).applyEuler(GRAIN_ROT).add(GRAIN_C);
  const dirOut = new THREE.Vector3(-1, -0.15, 0.1).applyEuler(GRAIN_ROT);
  // crumbs are laid out once around the radicle's full path, so it always has room
  const fullPath = useMemo(() => radiclePath(1, anchor.clone(), dirOut.clone()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const path = radiclePath(Math.max(0.001, grow), anchor, dirOut);
  // centred while it swells; by the title (u≈0.48) the grain has settled below centre so the
  // caption and title sit above it, then a slow push continues
  const k = easeInOut(Math.min(1, u / 0.42));
  const push = easeInOut(Math.max(0, (u - 0.42) / 0.58));
  const D = 0.0135 - 0.0012 * k - 0.0008 * push;
  // level camera at the end: the grain's centre lands ~14% below frame centre
  const target: V3 = [GRAIN_C.x - 0.00025 * (1 - k), GRAIN_C.y - 0.0002 * (1 - k) + 0.09 * D * k, GRAIN_C.z];
  const pos: V3 = [target[0] + 0.0011 * (1 - k) + 0.0002, target[1] + 0.0009 * (1 - k), target[2] + D];
  const focus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  return (
    <AbsoluteFill>
      <Stage cam={{ pos, target, fov: 30, near: 0.0005, far: 1 }} focus={focus} farBlur={16} bloom={0.45} vignette={0.8} background="#0a0604" preload={{ tex: [SOIL_TEX, ...GRAIN_PRELOAD.tex] }}>
        <BoxEnv />
        <ambientLight intensity={0.02} color="#d8c8b0" />
        {/* a pool of warm light on the grain; the soil around it falls away into shadow */}
        <spotLight position={[0.003, 0.022, 0.012]} angle={0.16} penumbra={1} intensity={0.03} color="#ffe2b8" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.00002} />
        <spotLight position={[0.004, 0.03, 0.012]} angle={0.45} penumbra={1} intensity={0.006} color="#ffd8a8" />
        <pointLight position={[-0.012, 0.004, 0.01]} intensity={0.00018} color="#9fb4c8" />
        <pointLight position={[0.002, 0.008, -0.004]} intensity={0.00045} color="#ffcf9a" />
        <Backing />
        <Crumbs path={fullPath} />
        <Grain swell={swell} />
        <Radicle grow={grow} path={path} />
        <Condensation />
      </Stage>
    </AbsoluteFill>
  );
};
