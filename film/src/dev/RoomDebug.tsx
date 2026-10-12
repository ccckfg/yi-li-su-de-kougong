import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomContent } from "../scenes/room/RoomScene";
import { ROOM_PRELOAD } from "../scenes/room/props";
import { Kick, Preload } from "../three/assets";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

export const RoomDebug: React.FC<{ post: number }> = ({ post }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#200" }}>
      <Preload spec={ROOM_PRELOAD}><ThreeCanvas width={width} height={height} shadows="percentage" gl={{ toneMapping: post ? THREE.NoToneMapping : THREE.AgXToneMapping }}>
        <RoomContent
          cam={{ pos: [0.34, 0.47, 0.86], target: [0.0, 0.0, -0.3], fov: 40 }}
          focus={{ dist: 1, range: 1, bokeh: 1 }}
          power={1}
          cover={Math.PI}
          envTip={0}
          time={1}
        />
        <ambientLight intensity={post === 2 ? 2 : 0} />
        {post ? (
          <EffectComposer multisampling={4} frameBufferType={THREE.HalfFloatType}>
            <Bloom intensity={0.5} luminanceThreshold={0.8} mipmapBlur />
            <ToneMapping mode={ToneMappingMode.AGX} />
          </EffectComposer>
        ) : null}
        <Kick />
      </ThreeCanvas></Preload>
    </AbsoluteFill>
  );
};
