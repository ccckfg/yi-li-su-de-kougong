import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { ToneMappingMode } from "postprocessing";
import React, { useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { BokehDOF } from "../../three/BokehDOF";
import { Kick, Preload, type PreloadSpec } from "../../three/assets";
import { RigCamera, type V3 } from "../../three/Rig";

/** Shared 3D stage for the era objects: frame-driven camera, bokeh DOF, bloom, AgX, vignette. */
export const Stage: React.FC<{
  cam: { pos: V3; target: V3; fov: number; near?: number; far?: number };
  focus: number;
  farBlur: number;
  bloom?: number;
  vignette?: number;
  preload?: PreloadSpec;
  background?: string;
  children: React.ReactNode;
}> = ({ cam, focus, farBlur, bloom = 0.5, vignette = 0.7, preload = {}, background = "#000000", children }) => {
  const { width, height } = useVideoConfig();
  const gl = useMemo(() => ({ toneMapping: THREE.NoToneMapping, antialias: false, powerPreference: "high-performance" as const }), []);
  return (
    <Preload spec={preload}>
      <ThreeCanvas width={width} height={height} shadows="percentage" gl={gl} camera={{ fov: cam.fov, near: cam.near ?? 0.01, far: cam.far ?? 20, position: cam.pos }}>
        <RigCamera pos={cam.pos} target={cam.target} fov={cam.fov} near={cam.near ?? 0.01} far={cam.far ?? 20} />
        <color attach="background" args={[background]} />
        {children}
        <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
          <SMAA />
          <BokehDOF focus={focus} farBlur={farBlur} />
          <Bloom intensity={bloom} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur radius={0.75} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          <Vignette offset={0.2} darkness={vignette} />
        </EffectComposer>
        <Kick />
      </ThreeCanvas>
    </Preload>
  );
};
