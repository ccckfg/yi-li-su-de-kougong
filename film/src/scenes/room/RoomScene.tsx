import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BokehDOF } from "../../three/BokehDOF";
import { useThree } from "@react-three/fiber";
import { lampEnvScene, FinePen } from "./pen";
import { ThreeCanvas } from "@remotion/three";
import { ToneMappingMode } from "postprocessing";
import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { RigCamera, type V3 } from "../../three/Rig";
import { Chair, Desk, Dust, Envelope, Folder, Glass, LAMP_POS, Lamp, LampLights, ROOM_PRELOAD, SHADE_H, Shoulder } from "./props";
import { VolumetricSpot } from "../../three/VolumetricSpot";
import { Kick, Preload } from "../../three/assets";
import { InkSpot } from "./ink";
import { GRAIN_PRELOAD, Grains, HeroGrain } from "./grains";

const PRELOAD = { ...ROOM_PRELOAD, tex: [...ROOM_PRELOAD.tex, ...GRAIN_PRELOAD.tex], json: GRAIN_PRELOAD.json };

export type RoomState = {
  cam: { pos: V3; target: V3; fov: number; roll?: number; near?: number; far?: number };
  focus: { dist: number; range: number; bokeh: number; ao?: number };
  power: number;
  cover: number;
  pen?: { pos: V3; rot: V3 } | null;
  glass?: { pos: V3; wobble: number } | null;
  envTip: number;
  shoulder?: V3 | null;
  ink?: { pos: V3; t: number } | null;
  grains?: { t: number; hero: boolean } | null;
  filled?: boolean;
  time: number;
  dustScale?: number;
  kicker?: { pos: V3; intensity: number } | null;
  exposure?: number;
  /** multiplier on the beam's smoke density */
  haze?: number;
  children?: React.ReactNode;
};

/** Dim studio environment for reflections on brass, glass and varnish (no direct light). */
const Env: React.FC<{ intensity: number }> = ({ intensity }) => {
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  const tex = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(lampEnvScene(), 0.02).texture;
    pm.dispose();
    return t;
  }, [gl]);
  scene.environment = tex;
  scene.environmentIntensity = intensity;
  return null;
};

const Ambient: React.FC<{ power: number }> = ({ power }) => (
  <>
    {/* near-black room; a whisper of cold light from far behind the chair keeps silhouettes readable */}
    <ambientLight intensity={0.006 + 0.006 * power} color="#9fb4c8" />
    <directionalLight position={[1.5, 1.2, -3]} intensity={0.035} color="#8fa7c4" />
  </>
);

export const RoomContent: React.FC<RoomState> = (s) => {
  return (
    <>
      <RigCamera pos={s.cam.pos} target={s.cam.target} fov={s.cam.fov} roll={s.cam.roll} near={s.cam.near ?? 0.02} far={s.cam.far ?? 30} />
      <color attach="background" args={["#000000"]} />
      {/* the room beyond the lamp falls away into black */}
      <fog attach="fog" args={["#000000", 1.5, 3.6]} />
      <Env intensity={0.15 + 0.6 * s.power} />
      <Ambient power={s.power} />
      <LampLights power={s.power} />
      <Desk />
      <Lamp power={s.power} />
      <Folder coverAngle={s.cover} filled={s.filled} />
      {s.pen ? <FinePen position={s.pen.pos} rotation={s.pen.rot} inked={s.ink ? 1 : 0} /> : null}
      <Envelope tip={s.envTip} />
      <Chair />
      {s.glass ? <Glass position={s.glass.pos} wobble={s.glass.wobble} t={s.time} power={s.power} /> : null}
      {s.shoulder ? <Shoulder position={s.shoulder} /> : null}
      {s.ink ? <InkSpot position={s.ink.pos} t={s.ink.t} /> : null}
      {s.grains ? <Grains t={s.grains.t} hideHero={s.grains.hero} /> : null}
      {s.grains?.hero ? <HeroGrain t={s.grains.t} /> : null}
      <Dust time={s.time} power={s.power} scale={s.dustScale ?? 2.2} />
      {s.kicker ? <pointLight position={s.kicker.pos} intensity={s.kicker.intensity} color="#ffe6c2" decay={2} distance={0.5} /> : null}
      {s.children}
    </>
  );
};

const Post: React.FC<{ focus: RoomState["focus"]; exposure: number; power: number; time: number; haze: number }> = ({ focus, exposure, power, time, haze }) => (
  <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
    <N8AO aoRadius={focus.ao ?? 0.06} distanceFalloff={(focus.ao ?? 0.06) * 8} intensity={2.4} quality="high" halfRes={false} />
    {/* smoke hanging in the lamp's beam */}
    <VolumetricSpot
      light={[LAMP_POS[0] + 0.02, SHADE_H - 0.03, LAMP_POS[2] + 0.06]}
      target={[-0.1, 0, 0.1]}
      angle={0.8}
      softness={0.32}
      color={[1.0, 0.76, 0.48]}
      density={0.013 * power * haze}
      time={time}
      hazeCenter={[-0.24, 0.13, -0.02]}
      hazeRadius={0.55}
    />
    <SMAA />
    <BokehDOF focus={focus.dist} farBlur={focus.bokeh} />
    <Bloom intensity={0.55} luminanceThreshold={0.75} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
    <ToneMapping mode={ToneMappingMode.AGX} />
    <Vignette offset={0.18} darkness={0.72 + 0.0 * exposure} />
  </EffectComposer>
);

/** One shot of the interrogation room. `state` is computed per frame by the shot. */
export const RoomShot: React.FC<{ state: RoomState }> = ({ state }) => {
  const { width, height } = useVideoConfig();
  const gl = useMemo(() => ({ toneMapping: THREE.NoToneMapping, antialias: false, powerPreference: "high-performance" as const }), []);
  return (
    <Preload spec={PRELOAD}>
      <ThreeCanvas width={width} height={height} shadows="percentage" gl={gl} linear={false} camera={{ fov: state.cam.fov, near: state.cam.near ?? 0.02, far: state.cam.far ?? 30, position: state.cam.pos }}>
        <RoomContent {...state} />
        <Post focus={state.focus} exposure={state.exposure ?? 1} power={state.power} time={state.time} haze={state.haze ?? 1} />
        <Kick />
      </ThreeCanvas>
    </Preload>
  );
};
