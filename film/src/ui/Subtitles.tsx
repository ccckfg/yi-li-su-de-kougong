import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import meta from "../../public/audio/vo/vo_meta.json";
import { FONT } from "../fonts";
import { FPS, TL } from "../timeline";

type Seg = { text: string; b: number; e: number };
type Sub = { from: number; to: number; text: string; role: string };

const META = meta as unknown as Record<string, { segs: Seg[]; role: string }>;

function buildSubs(): Sub[] {
  const subs: Sub[] = [];
  const skip = new Set(TL.lines.filter((l) => l.xfadeWith).map((l) => l.xfadeWith as string));
  for (const ln of TL.lines) {
    if (skip.has(ln.id)) continue;
    const segs = META[ln.id]?.segs ?? [];
    segs.forEach((sg, i) => {
      let to = ln.audioFrom + Math.round((sg.e / 1000) * FPS) + 5;
      if (ln.xfadeWith && i === segs.length - 1) {
        const b = TL.lines.find((x) => x.id === ln.xfadeWith);
        if (b) to = b.speechTo + 6;
      }
      subs.push({ from: ln.audioFrom + Math.round((sg.b / 1000) * FPS), to, text: sg.text, role: ln.role });
    });
  }
  subs.sort((a, b) => a.from - b.from);
  for (let i = 0; i + 1 < subs.length; i++) subs[i].to = Math.min(subs[i].to, subs[i + 1].from - 1);
  return subs;
}

export const SUBS = buildSubs();

/** Burned-in dialogue / narration subtitles. One quiet style for the whole film. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const s = SUBS.find((x) => frame >= x.from && frame <= x.to);
  if (!s) return null;
  const op = interpolate(frame, [s.from, s.from + 3, s.to - 3, s.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          marginBottom: 74,
          opacity: op,
          padding: "14px 64px",
          background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0) 72%)",
          fontFamily: FONT.serif,
          fontWeight: 500,
          fontSize: 40,
          letterSpacing: "0.08em",
          color: "#F3EEE4",
          textShadow: "0 0 14px rgba(0,0,0,0.9), 0 2px 3px rgba(0,0,0,0.95)",
          whiteSpace: "nowrap",
        }}
      >
        {s.text}
      </div>
    </AbsoluteFill>
  );
};
