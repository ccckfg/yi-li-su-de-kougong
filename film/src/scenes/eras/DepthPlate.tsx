import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { BokehDOF } from "../../three/BokehDOF";
import { getTex, Kick, Preload, rng } from "../../three/assets";
import { FilmLook, LightShafts } from "../../three/PostFX";
import { easeInOut, easeOut, lerp3, noise1, RigCamera, type V3 } from "../../three/Rig";

// "Walk into the painting". Every pixel of the still is put back where it was seen from: along its
// camera ray, at a distance interpolated in disparity between `near` and `far`. From the start
// position the picture is untouched; as soon as the camera moves, things separate. Where the relief
// tears open at depth steps, a back layer (background extended under the foreground, see
// tools/depth/bg_fill.py) shows through. Medium-specific particles live in the air in between.
export type DepthMode = "charcoal" | "mural" | "woodcut" | "film" | "snow" | "plain" | "wetsoil";
const MODE_ID: Record<DepthMode, number> = { charcoal: 0, mural: 1, woodcut: 2, film: 3, snow: 4, plain: 5, wetsoil: 6 };

const COMMON = /* glsl */ `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(3.1,7.7); a*=0.5; } return v; }
float luma(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
`;

const VERT = /* glsl */ `
uniform sampler2D uDepth; uniform vec2 uTan; uniform float uNear; uniform float uFar; uniform float uPush;
uniform float uSway; uniform float uTime; uniform vec4 uSwayBox;
varying vec2 vUv; varying float vD;
void main(){
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vD = d;
  float Z = uPush / mix(1.0 / uFar, 1.0 / uNear, d);
  vec2 q = uv;
  // near vegetation stirs in the wind (only inside the sway box, only the nearest layer)
  if (uSway > 0.0) {
    float m = smoothstep(uSwayBox.z, uSwayBox.w, d) * step(uSwayBox.x, uv.x) * step(uv.y, uSwayBox.y);
    q.x += uSway * m * (sin(uTime * 1.6 + uv.x * 5.0 + uv.y * 3.0) + 0.4 * sin(uTime * 2.7 + uv.x * 9.0)) * (0.3 + uv.y);
  }
  vec3 p = vec3((q.x * 2.0 - 1.0) * uTan.x * Z, (q.y * 2.0 - 1.0) * uTan.y * Z, -Z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = /* glsl */ `
uniform sampler2D uImg; uniform sampler2D uDepth; uniform float uT; uniform float uTime; uniform float uFrame;
uniform int uMode; uniform float uLayer; uniform float uCut;
varying vec2 vUv; varying float vD;
${COMMON}
vec3 medium(vec2 uv){
  vec3 c = texture2D(uImg, uv).rgb;
  if (uMode == 0) {
    // charcoal: boiling strokes (jitter changes every 3 frames), paper tooth, strokes appear out of blank paper
    float step3 = floor(uFrame / 3.0);
    vec2 jit = (vec2(hash(vec2(step3, 1.0)), hash(vec2(step3, 2.0))) - 0.5) * 0.0011
             + (vec2(fbm(uv * 40.0 + step3), fbm(uv * 40.0 - step3)) - 0.5) * 0.0012;
    c = texture2D(uImg, uv + jit).rgb;
    float l = luma(c);
    float tooth = fbm(uv * vec2(1.78, 1.0) * 300.0);
    vec3 paper = vec3(0.84, 0.81, 0.74) * (0.9 + 0.1 * tooth);
    float lit = smoothstep(0.08, 0.6, l + (tooth - 0.5) * 0.12);
    vec3 warm = mix(vec3(1.0), vec3(1.05, 0.96, 0.82), smoothstep(0.05, 0.3, c.r - c.b));
    vec3 col = mix(vec3(0.06, 0.055, 0.05), paper, lit) * warm;
    // strokes spread out from the gatherer's hands over blank paper
    float rev = smoothstep(0.02, 0.34, uT);
    float order = fbm(uv * 5.0) * 0.45 + length((uv - vec2(0.56, 0.55)) * vec2(1.6, 1.0)) * 0.7;
    float m = smoothstep(0.0, 0.16, rev * 1.3 - order);
    return mix(paper, col, m);
  } else if (uMode == 1) {
    // mural: mineral pigment on plaster; flakes lift off over the shot; guttering lamp
    float flake = smoothstep(0.71, 0.735, fbm(uv * 9.0 + 3.0) + uT * 0.035);
    vec3 plaster = vec3(0.80, 0.72, 0.60) * (0.82 + 0.18 * fbm(uv * 90.0));
    c = mix(c, plaster, flake * 0.75);
    float crack = smoothstep(0.012, 0.0, abs(fbm(uv * vec2(6.0, 3.0) + 11.0) - 0.5)) * 0.25;
    c *= 1.0 - crack;
    float lamp = 0.93 + 0.07 * noise(vec2(uTime * 3.0, 1.0));
    return c * lamp * vec3(1.04, 1.0, 0.93);
  } else if (uMode == 2) {
    // woodcut: lines are cut in from left to right behind a ragged front; paper stays
    float l = luma(c);
    float front = smoothstep(0.0, 0.42, uT) * 1.25 - 0.1;
    float m = smoothstep(front - 0.02, front + 0.02, uv.x + (fbm(uv * vec2(4.0, 30.0)) - 0.5) * 0.12);
    vec3 paper = vec3(0.91, 0.87, 0.78) * (0.92 + 0.08 * fbm(uv * 300.0));
    vec3 printed = mix(paper, vec3(0.06, 0.05, 0.05), smoothstep(0.55, 0.35, l));
    return mix(printed, paper, m);
  } else if (uMode == 3) {
    return vec3(luma(c));
  } else if (uMode == 6) {
    // water soaking into soil: a darkening front spreads, a wet sheen fades as it sinks in, bubbles break
    vec2 cp = (uv - vec2(0.48, 0.55)) * vec2(1.78, 1.0);
    float front = 0.12 + 0.75 * (1.0 - exp(-uT * 2.4));
    float wet = smoothstep(front, front - 0.12, length(cp) + (fbm(uv * 7.0) - 0.5) * 0.35);
    vec3 soaked = c * vec3(0.5, 0.45, 0.42);
    float film = wet * (1.0 - smoothstep(0.2, 0.95, uT));
    float sheen = pow(fbm(uv * 40.0 + uTime * 0.05), 3.0) * film;
    // standing water mirrors a soft sky: a broad glossy sheen plus sparkles on the ripples
    float sky = smoothstep(0.35, 0.9, fbm(uv * vec2(3.0, 5.0) + vec2(uTime * 0.04, 0.0)));
    vec3 col = mix(c, soaked, wet) + vec3(0.95, 0.9, 0.8) * sheen * 0.8 + vec3(0.55, 0.55, 0.52) * sky * film * 0.1;
    vec2 g = uv * vec2(1.78, 1.0) * 30.0;
    vec2 cell = floor(g);
    float h = hash(cell);
    float life = fract(uTime * (0.6 + h) + h * 7.0);
    float rr = length(fract(g) - 0.5 - (vec2(hash(cell + 3.1), hash(cell + 5.7)) - 0.5) * 0.5);
    float ring = smoothstep(0.035, 0.0, abs(rr - 0.04 - life * 0.11)) * (1.0 - life) * step(0.8, h);
    float cap = smoothstep(0.06, 0.0, rr - 0.03 - life * 0.08) * (1.0 - life) * step(0.8, h) * 0.25;
    col += vec3(1.0, 0.97, 0.9) * (ring * 0.55 + cap) * film;
    return col;
  }
  return c;
}
void main(){
  // the relief stretched across a depth step: drop it, the back layer is behind
  if (uLayer < 0.5 && abs(vD - texture2D(uDepth, vUv).r) > uCut) discard;
  gl_FragColor = vec4(medium(vUv), 1.0);
}`;

// ------------------------------------------------------------------ particles
export type ParticleKind = "ash" | "rain" | "pigment" | "chaff" | "dust" | "snow";
const KIND_ID: Record<ParticleKind, number> = { ash: 0, rain: 1, pigment: 2, chaff: 3, dust: 4, snow: 5 };

const P_VERT = /* glsl */ `
uniform float uTime; uniform float uKind; uniform vec2 uTan; uniform float uFocus; uniform float uCoc; uniform float uPx;
uniform vec3 uSrc; uniform vec3 uWind;
attribute float aSeed; attribute vec3 aRnd;
varying float vAlpha; varying float vSeed; varying float vSize; varying float vSpin;
void main(){
  vec3 p = position;
  float t = uTime;
  float Z = -p.z;
  float yHalf = uTan.y * Z * 1.25;
  float base = 1.0;
  vAlpha = 1.0;
  vSpin = aSeed * 6.28 + t * (aRnd.x - 0.5) * 6.0;
  if (uKind < 0.5) {               // ash: charcoal flakes riding a slow current
    p += uWind * t + vec3(sin(t * 0.5 + aSeed * 20.0) * 0.06, sin(t * 0.37 + aSeed * 9.0) * 0.05, 0.0) * Z;
    base = 2.0 + 5.0 * aRnd.y;
  } else if (uKind < 1.5) {        // rain: fast, slanted
    p.y = mod(p.y - t * (5.0 + 3.0 * aRnd.y) * (0.6 + 0.2 * Z) + yHalf, 2.0 * yHalf) - yHalf;
    p.x += p.y * 0.14;
    base = 1.6;
  } else if (uKind < 2.5) {        // pigment chips flaking off and tumbling down
    p.y = mod(p.y - t * (0.12 + 0.18 * aRnd.y) * Z + yHalf, 2.0 * yHalf) - yHalf;
    p.x += sin(t * 1.3 + aSeed * 30.0) * 0.04 * Z;
    base = 3.0 + 6.0 * aRnd.z;
  } else if (uKind < 3.5) {        // chaff tossed from the winnowing basket, drifting off in the wind
    float life = fract(t * (0.32 + 0.25 * aRnd.x) + aSeed);
    vec3 v = vec3((aRnd.y - 0.35) * 1.4, 1.4 + aRnd.z * 1.1, (aRnd.x - 0.5) * 1.6);
    p = uSrc + v * life + vec3(0.0, -2.6, 0.0) * life * life + uWind * life * 1.5;
    vAlpha = smoothstep(0.0, 0.06, life) * smoothstep(1.0, 0.75, life);
    base = 2.2 + 3.5 * aRnd.z;
  } else if (uKind < 4.5) {        // dust motes in the light
    p += vec3(sin(t * 0.21 + aSeed * 13.0), sin(t * 0.17 + aSeed * 7.0) - t * 0.08, sin(t * 0.13 + aSeed * 5.0)) * 0.05 * Z + uWind * t;
    base = 1.5 + 3.0 * aRnd.y;
    vAlpha = 0.35 + 0.65 * smoothstep(0.3, 0.9, sin(t * 0.7 + aSeed * 40.0) * 0.5 + 0.5);
  } else {                         // snow
    p.y = mod(p.y - t * (0.18 + 0.12 * aRnd.y) * Z + yHalf, 2.0 * yHalf) - yHalf;
    p.x += (sin(t * 0.8 + aSeed * 30.0) * 0.05 + uWind.x * t) * Z;
    base = 2.5 + 4.0 * aRnd.z;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float z = max(0.05, -mv.z);
  float coc = min(70.0, uCoc * abs(1.0 / uFocus - 1.0 / z));
  float size = base * uPx / z;
  float s = max(size, coc * 2.0);
  vAlpha *= clamp((size * size + 4.0) / (s * s + 4.0), 0.04, 1.0) * smoothstep(0.08, 0.3, z);
  vSize = s;
  vSeed = aSeed;
  gl_PointSize = s + 2.0;
  gl_Position = projectionMatrix * mv;
}`;

const P_FRAG = /* glsl */ `
uniform float uKind; uniform float uOpacity;
varying float vAlpha; varying float vSeed; varying float vSize; varying float vSpin;
vec3 pigment(float s){
  if (s < 0.25) return vec3(0.22, 0.52, 0.42);   // malachite
  if (s < 0.5) return vec3(0.17, 0.30, 0.62);    // azurite
  if (s < 0.75) return vec3(0.70, 0.25, 0.14);   // cinnabar / red ochre
  return vec3(0.80, 0.71, 0.55);                 // plaster
}
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float cs = cos(vSpin), sn = sin(vSpin);
  vec2 r = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
  float soft = clamp(vSize / 8.0, 0.0, 1.0);
  float a; vec3 col;
  if (uKind > 0.5 && uKind < 1.5) {
    a = smoothstep(0.07, 0.0, abs(c.x + c.y * 0.14)) * smoothstep(0.5, 0.15, abs(c.y));
    col = vec3(0.9, 0.94, 0.97); a *= 0.5;
  } else if (uKind < 0.5) {
    a = smoothstep(0.5, 0.5 - 0.3 * soft - 0.05, length(r * vec2(1.0, 1.7)));
    col = vec3(0.05);
  } else if (uKind < 2.5) {
    float sh = max(abs(r.x) * 1.2, abs(r.y) * 2.0 + abs(r.x) * 0.6);
    a = smoothstep(0.5, 0.5 - 0.25 * soft - 0.04, sh);
    col = pigment(fract(vSeed * 7.31)) * (0.85 + 0.3 * r.y);
  } else if (uKind < 3.5) {
    a = smoothstep(0.5, 0.5 - 0.25 * soft - 0.05, length(r * vec2(2.2, 1.0)));
    col = vec3(0.08, 0.07, 0.06);
  } else if (uKind < 4.5) {
    a = smoothstep(0.5, 0.0, length(c));
    col = vec3(1.0, 0.94, 0.82);
  } else {
    a = smoothstep(0.5, 0.5 - 0.3 * soft - 0.1, length(c));
    col = vec3(0.95, 0.97, 1.0);
  }
  gl_FragColor = vec4(col, a * vAlpha * uOpacity);
}`;

export type ParticleSpec = { kind: ParticleKind; count: number; zRange?: [number, number]; opacity?: number; src?: V3; wind?: V3; additive?: boolean };

const Particles: React.FC<{ spec: ParticleSpec; tan: [number, number]; time: number; focus: number; coc: number; px: number }> = ({ spec, tan, time, focus, coc, px }) => {
  const { kind, count, zRange = [0.35, 5], opacity = 1, src = [0, 0, -2], wind = [0, 0, 0], additive = kind === "dust" } = spec;
  const geo = useMemo(() => {
    const r = rng(KIND_ID[kind] * 977 + count);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const rnd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // uniform in screen space, denser near the camera (z sampled toward the near end)
      const z = zRange[0] + (zRange[1] - zRange[0]) * Math.pow(r(), 1.6);
      pos.set([(r() * 2 - 1) * tan[0] * z * 1.25, (r() * 2 - 1) * tan[1] * z * 1.25, -z], i * 3);
      seed[i] = r();
      rnd.set([r(), r(), r()], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 3));
    return g;
  }, [kind, count, zRange[0], zRange[1], tan[0], tan[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: P_VERT,
        fragmentShader: P_FRAG,
        transparent: true,
        depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uKind: { value: KIND_ID[kind] },
          uTan: { value: new THREE.Vector2(...tan) },
          uFocus: { value: 1 },
          uCoc: { value: 1 },
          uPx: { value: 1 },
          uOpacity: { value: opacity },
          uSrc: { value: new THREE.Vector3(...src) },
          uWind: { value: new THREE.Vector3(...wind) },
        },
      }),
    [kind, additive, src[0], src[1], src[2], wind[0], wind[1], wind[2]], // eslint-disable-line react-hooks/exhaustive-deps
  );
  mat.uniforms.uTime.value = time;
  mat.uniforms.uOpacity.value = opacity;
  mat.uniforms.uFocus.value = focus;
  mat.uniforms.uCoc.value = coc;
  mat.uniforms.uPx.value = px;
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />;
};

// ------------------------------------------------------------------ relief
type ReliefProps = { name: string; mode: DepthMode; near: number; far: number; tan: [number, number]; t: number; time: number; frame: number; cut: number; sway: number; swayBox: [number, number, number, number] };

const Relief: React.FC<ReliefProps> = ({ name, mode, near, far, tan, t, time, frame, cut, sway, swayBox }) => {
  const img = getTex(`stills/${name}.png`, { srgb: false });
  const dep = getTex(`depth/${name}_depth.png`, { srgb: false });
  const bg = getTex(`depth/${name}_bg.jpg`, { srgb: false });
  const bgd = getTex(`depth/${name}_bgdepth.png`, { srgb: false });
  const mk = (layer: number) =>
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uImg: { value: layer < 0.5 ? img : bg },
        uDepth: { value: layer < 0.5 ? dep : bgd },
        uTan: { value: new THREE.Vector2(...tan) },
        uNear: { value: near },
        uFar: { value: far },
        uPush: { value: layer < 0.5 ? 1 : 1.004 },
        uLayer: { value: layer },
        uT: { value: 0 },
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uMode: { value: MODE_ID[mode] },
        uCut: { value: cut },
        uSway: { value: layer < 0.5 ? sway : sway * 0.5 },
        uSwayBox: { value: new THREE.Vector4(...swayBox) },
      },
    });
  const front = useMemo(() => mk(0), [img, dep, mode, near, far, tan[0], tan[1], cut, sway]); // eslint-disable-line react-hooks/exhaustive-deps
  const back = useMemo(() => mk(1), [bg, bgd, mode, near, far, tan[0], tan[1], sway]); // eslint-disable-line react-hooks/exhaustive-deps
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, 836, 470), []);
  for (const m of [front, back]) {
    m.uniforms.uT.value = t;
    m.uniforms.uTime.value = time;
    m.uniforms.uFrame.value = frame;
  }
  return (
    <group>
      <mesh geometry={geo} material={back} frustumCulled={false} />
      <mesh geometry={geo} material={front} frustumCulled={false} />
    </group>
  );
};

type ShaftSpec = { at: V3; strength?: number; threshold?: number; tint?: [number, number, number]; decay?: number; density?: number };

/** Light shafts anchored to a scene point (projected through the current camera each frame). */
const ShaftsAt: React.FC<ShaftSpec> = ({ at, ...rest }) => {
  const cam = useThree((s) => s.camera);
  const v = new THREE.Vector3(...at).project(cam);
  return <LightShafts pos={[v.x * 0.5 + 0.5, v.y * 0.5 + 0.5]} {...rest} />;
};

// ------------------------------------------------------------------ shot
export type DepthMove = {
  /** camera position (start camera = origin looking down -z) */
  from: V3;
  to: V3;
  /** look-at target */
  lookFrom: V3;
  lookTo: V3;
  ease?: "inOut" | "out" | "linear";
  /** focus distance (m) from→to; default: distance to the look target */
  focus?: [number, number];
  /** fraction of the shot over which a focus pull happens */
  focusWindow?: [number, number];
  roll?: [number, number];
};

export type DepthShotProps = {
  name: string;
  mode: DepthMode;
  move: DepthMove;
  near?: number;
  far?: number;
  fov?: number;
  overscan?: number;
  farBlur?: number;
  particles?: ParticleSpec[];
  shafts?: ShaftSpec;
  sway?: number;
  swayBox?: [number, number, number, number];
  cut?: number;
  bloom?: number;
  weave?: number;
};

type SceneProps = {
  name: string; mode: DepthMode; near: number; far: number; tan: [number, number]; u: number; time: number; frame: number; cut: number; sway: number;
  swayBox: [number, number, number, number]; particles: ParticleSpec[]; focus: number; farBlur: number; shafts?: ShaftSpec; bloom: number;
  pos: V3; target: V3; fov: number; roll: number; width: number; height: number;
};

const DepthScene: React.FC<SceneProps> = (p) => {
  // previews render at a lower device scale: keep blur radii and particle sizes proportional to the frame
  const dpr = useThree((s) => s.viewport.dpr);
  const px = (p.height * dpr) / (2 * Math.tan(((p.fov / 2) * Math.PI) / 180));
  return (
    <>
      <RigCamera pos={p.pos} target={p.target} fov={p.fov} roll={p.roll} near={0.05} far={50} />
      <color attach="background" args={["#000000"]} />
      <Relief name={p.name} mode={p.mode} near={p.near} far={p.far} tan={p.tan} t={p.u} time={p.time} frame={p.frame} cut={p.cut} sway={p.sway} swayBox={p.swayBox} />
      {p.particles.map((q, i) => (
        <Particles key={i} spec={{ ...q, opacity: (q.opacity ?? 1) * (p.mode === "charcoal" ? Math.min(1, Math.max(0, (p.u - 0.12) / 0.2)) : p.mode === "woodcut" ? Math.min(1, Math.max(0, (p.u - 0.2) / 0.25)) : 1) }} tan={p.tan} time={p.time} focus={p.focus} coc={p.farBlur * 6 * p.focus * dpr} px={px * 0.004} />
      ))}
      <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
        <SMAA />
        <BokehDOF focus={p.focus} farBlur={p.farBlur} maxBlur={14} scale={dpr} />
        {p.shafts ? <ShaftsAt {...p.shafts} /> : <></>}
        <Bloom intensity={p.bloom} luminanceThreshold={0.8} luminanceSmoothing={0.25} mipmapBlur />
        {p.mode === "film" ? <FilmLook frame={p.frame} res={[p.width * dpr, p.height * dpr]} /> : <></>}
      </EffectComposer>
    </>
  );
};

/** Largest lens scale (<=1) for which every view corner, at every point of the move, still lands on the plate. */
function fitLens(move: DepthMove, fov: number, aspect: number, tan: [number, number], near: number, far: number): number {
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.05, 50);
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]];
  const ok = (s: number) => {
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const k = move.ease === "out" ? easeOut(u, 2.2) : move.ease === "linear" ? u : easeInOut(u);
      const p = lerp3(move.from, move.to, k);
      const t = lerp3(move.lookFrom, move.lookTo, k);
      cam.position.set(...p);
      cam.lookAt(...t);
      cam.updateMatrixWorld();
      const ty = Math.tan(((fov / 2) * Math.PI) / 180) * s;
      for (const [cx, cy] of corners) {
        const dir = new THREE.Vector3(cx * ty * aspect, cy * ty, -1).applyQuaternion(cam.quaternion);
        for (const Z of [near * 0.9, far]) {
          // ray hits the plane z = -Z
          const l = (-Z - p[2]) / dir.z;
          if (!(l > 0)) return false;
          const x = p[0] + dir.x * l;
          const y = p[1] + dir.y * l;
          if (Math.abs(x / (Z * tan[0])) > 0.995 || Math.abs(y / (Z * tan[1])) > 0.995) return false;
        }
      }
    }
    return true;
  };
  if (ok(1)) return 1;
  let lo = 0.5;
  let hi = 1;
  for (let i = 0; i < 14; i++) {
    const m = (lo + hi) / 2;
    if (ok(m)) lo = m;
    else hi = m;
  }
  return lo;
}

export const DepthPlate: React.FC<DepthShotProps> = ({
  name,
  mode,
  move,
  near = 1.6,
  far = 7,
  fov = 36,
  overscan = 1.14,
  farBlur = 3,
  particles = [],
  shafts,
  sway = 0,
  swayBox = [0, 1, 0.8, 0.95],
  cut = 0.06,
  bloom = 0.22,
  weave = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const u = frame / Math.max(1, durationInFrames - 1);
  const k = move.ease === "out" ? easeOut(u, 2.2) : move.ease === "linear" ? u : easeInOut(u);
  let pos = lerp3(move.from, move.to, k);
  const target = lerp3(move.lookFrom, move.lookTo, k);
  if (weave > 0) pos = [pos[0] + (noise1(frame * 0.9, 3) - 0.5) * weave, pos[1] + (noise1(frame * 0.7, 9) - 0.5) * weave, pos[2]];
  const autoFocus = Math.hypot(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2]);
  let focus = autoFocus;
  if (move.focus) {
    const [a, b] = move.focusWindow ?? [0, 1];
    const fk = easeInOut((u - a) / Math.max(1e-3, b - a));
    focus = move.focus[0] + (move.focus[1] - move.focus[0]) * fk;
  }
  const roll = move.roll ? move.roll[0] + (move.roll[1] - move.roll[0]) * k : 0;
  const ty = Math.tan(((fov / 2) * Math.PI) / 180) * overscan;
  const tan: [number, number] = [ty * (width / height), ty];
  const lens = useMemo(() => fitLens(move, fov, width / height, tan, near, far), [JSON.stringify(move), fov, width, height, overscan, near, far]); // eslint-disable-line react-hooks/exhaustive-deps
  const camFov = (2 * Math.atan(Math.tan(((fov / 2) * Math.PI) / 180) * lens) * 180) / Math.PI;
  const time = frame / fps;
  const tex = [`stills/${name}.png`, `depth/${name}_depth.png`, `depth/${name}_bg.jpg`, `depth/${name}_bgdepth.png`];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Preload spec={{ tex }}>
        <ThreeCanvas width={width} height={height} linear flat gl={{ antialias: false }} camera={{ fov: camFov, near: 0.05, far: 50, position: pos }}>
          <DepthScene {...{ name, mode, near, far, tan, u, time, frame, cut, sway, swayBox, particles, focus, farBlur, shafts, bloom, pos, target, fov: camFov, roll, width, height }} />
          <Kick />
        </ThreeCanvas>
      </Preload>
    </AbsoluteFill>
  );
};

export type DepthGeom = { near: number; far: number; fov: number; overscan: number; aspect?: number };
export const DEFAULT_GEOM: DepthGeom = { near: 1.6, far: 7, fov: 36, overscan: 1.14 };

/** Scene point of image position (u right, v up, both 0..1) at depth d (0 far .. 1 near). */
export function sp(u: number, v: number, d: number, g: DepthGeom = DEFAULT_GEOM): V3 {
  const ty = Math.tan(((g.fov / 2) * Math.PI) / 180) * g.overscan;
  const tx = ty * (g.aspect ?? 16 / 9);
  const Z = 1 / (1 / g.far + (1 / g.near - 1 / g.far) * d);
  return [(u * 2 - 1) * tx * Z, (v * 2 - 1) * ty * Z, -Z];
}
