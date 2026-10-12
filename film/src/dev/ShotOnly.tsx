import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SHOTS } from "../shots/registry";
import { SHOT } from "../timeline";

const OVERLAP_IN: Record<string, number> = { S15: 16, S16: 12, S17: 12, S18: 12, S19: 12, S20: 6, S21: 6, S22: 6, S23: 6, S36: 12 };

/** One shot on its own, timed exactly as in the film (frame 0 = start of its overlap), without overlays. */
export const ShotOnly: React.FC<{ id: string }> = ({ id }) => {
  const C = SHOTS[id];
  const ov = OVERLAP_IN[id] ?? 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence durationInFrames={SHOT[id].dur + ov}>{C ? <C /> : null}</Sequence>
    </AbsoluteFill>
  );
};
