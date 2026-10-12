import React from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { FPS, SHOT, TL } from "../timeline";

const s = (sec: number) => Math.round(sec * FPS);
const end = (id: string) => SHOT[id].from + SHOT[id].dur;

/** 0..1 "someone is talking" envelope for ducking music under VO. */
function talking(absFrame: number): number {
  let k = 0;
  for (const l of TL.lines) {
    const a = l.speechFrom - 6;
    const b = l.speechTo + 8;
    if (absFrame >= a - 6 && absFrame <= b + 6) {
      k = Math.max(k, interpolate(absFrame, [a - 6, a, b, b + 6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    }
  }
  return k;
}

type Cue = { file: string; from: number; to: number; trim?: number; vol: number; duck: number; fadeIn: number; fadeOut: number };

// 一万年: the cue builds and stops dead at ~57.0 s — line that stop up with the cut out of S22.
const ERAS_STOP = 57.0;
const erasFrom = SHOT.S15.from - s(0.4);
const erasTrim = ERAS_STOP - (end("S22") - erasFrom) / FPS;

const CUES: Cue[] = [
  { file: "eras_lyria_v1.mp3", from: erasFrom, to: end("S22"), trim: erasTrim, vol: 0.46, duck: 0.5, fadeIn: s(1.2), fadeOut: 1 },
  { file: "piano_lyria_v1.mp3", from: SHOT.S26.from, to: TL.total, trim: 1.2, vol: 0.55, duck: 0.6, fadeIn: s(0.3), fadeOut: s(2.0) },
];

export const MusicTrack: React.FC = () => (
  <>
    {CUES.map((c) => {
      const len = c.to - c.from;
      return (
        <Sequence key={c.file} from={c.from} durationInFrames={len} layout="none" name={`MUSIC ${c.file}`}>
          <Audio
            src={staticFile(`audio/music/${c.file}`)}
            trimBefore={Math.round((c.trim ?? 0) * FPS)}
            volume={(f) => {
              const env = interpolate(f, [0, c.fadeIn, len - c.fadeOut, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const duck = 1 - (1 - c.duck) * talking(c.from + f);
              return c.vol * env * duck;
            }}
          />
        </Sequence>
      );
    })}
  </>
);
