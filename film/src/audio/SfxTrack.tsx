import React from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { cue, FPS, line, SHOT } from "../timeline";

type Hit = { file: string; at: number; vol?: number; name?: string };
type Bed = { file: string; from: number; to: number; vol: number; fadeIn?: number; fadeOut?: number; name?: string };

const s = (sec: number) => Math.round(sec * FPS);
const end = (id: string) => SHOT[id].from + SHOT[id].dur;

// S14 action times mirror the shot's own maths (scenes/room/shots.tsx)
const old = line("v02_24_old");
const tip0 = old.speechTo - s(0.5);
const spill0 = tip0 + s(0.26);
const zoom0 = Math.min(spill0 + s(1.35), end("S14") - s(1.0));

const HITS: Hit[] = [
  { file: "snow_steps.wav", at: cue("snow_steps"), vol: 0.45 },
  { file: "knock_wood.wav", at: cue("knock1"), vol: 0.75 },
  { file: "bowl_lift.wav", at: cue("bowl_lift"), vol: 0.6 },
  { file: "grain_pour_bag.wav", at: cue("grain_pour") + s(0.2), vol: 0.55 },
  { file: "lamp_click.wav", at: cue("lamp_click"), vol: 0.85 },
  { file: "pen_tap.wav", at: cue("pen_stop"), vol: 0.7 },
  { file: "paper_flip.wav", at: cue("paper_flip"), vol: 0.55 },
  { file: "glass_slide.wav", at: cue("glass_push"), vol: 0.7 },
  { file: "ink_drop.wav", at: cue("ink_drop"), vol: 0.6 },
  { file: "folder_close.wav", at: cue("folder_close"), vol: 0.65 },
  { file: "lamp_flicker.wav", at: cue("lamp_flicker"), vol: 0.6 },
  { file: "bag_tip.wav", at: tip0 + s(0.35), vol: 0.65 },
  { file: "grains_spill.wav", at: spill0, vol: 0.75 },
  { file: "whoosh_zoom.wav", at: zoom0 - s(0.12), vol: 0.45 },
  // 一万年: every medium announces itself
  { file: "charcoal_scratch.wav", at: SHOT.S15.from, vol: 0.5 },
  { file: "clay_rub.wav", at: SHOT.S16.from - s(0.2), vol: 0.55 },
  { file: "bone_crack.wav", at: SHOT.S17.from + s(0.1), vol: 0.9 },
  { file: "bronze_bell.wav", at: SHOT.S18.from, vol: 0.45 },
  { file: "bamboo_slips.wav", at: SHOT.S18.from + s(2.6), vol: 0.5 },
  { file: "paper_brush.wav", at: SHOT.S19.from, vol: 0.5 },
  { file: "plaster_crumble.wav", at: SHOT.S21.from - s(0.2), vol: 0.6 },
  { file: "knife_carve.wav", at: SHOT.S21.from + s(0.1), vol: 0.6 },
  // 化验
  { file: "scan_sweep.wav", at: SHOT.S23.from, vol: 0.4 },
  // 接你
  { file: "water_pour_soil.wav", at: SHOT.S33.from + s(2.5), vol: 0.5 },
  { file: "soil_soak.wav", at: SHOT.S34.from, vol: 0.55 },
  { file: "seed_crack.wav", at: SHOT.S35.from + s(1.3), vol: 0.8 },
];

const BEDS: Bed[] = [
  { file: "wind_winter.wav", from: 0, to: SHOT.S05.from + s(0.3), vol: 0.5, fadeIn: s(0.6), fadeOut: s(0.4) },
  { file: "interrogation_bed.wav", from: SHOT.S06.from, to: end("S14"), vol: 0.32, fadeIn: s(1.2), fadeOut: s(0.6) },
  { file: "fire_crackle.wav", from: SHOT.S17.from, to: end("S17") + s(0.3), vol: 0.4, fadeIn: s(0.2), fadeOut: s(0.4) },
  { file: "projector.wav", from: SHOT.S22.from - s(0.2), to: end("S22"), vol: 0.45, fadeIn: s(0.3), fadeOut: s(0.25) },
  { file: "lab_tone.wav", from: SHOT.S23.from, to: end("S25"), vol: 0.5, fadeIn: s(0.4), fadeOut: s(1.0) },
  { file: "room_tone_seedroom.wav", from: SHOT.S26.from, to: end("S29b"), vol: 0.45, fadeIn: s(0.8), fadeOut: s(0.6) },
  { file: "snow_window.wav", from: SHOT.S29b.from, to: end("S29b"), vol: 0.5, fadeIn: s(0.5), fadeOut: s(0.5) },
  { file: "spring_breeze.wav", from: SHOT.S33.from, to: end("S35"), vol: 0.5, fadeIn: s(0.8), fadeOut: s(1.2) },
];

export const SfxTrack: React.FC = () => (
  <>
    {HITS.map((h, i) => (
      <Sequence key={`h${i}`} from={h.at} layout="none" name={`SFX ${h.file}`}>
        <Audio src={staticFile(`audio/sfx/${h.file}`)} volume={h.vol ?? 0.6} />
      </Sequence>
    ))}
    {BEDS.map((b, i) => {
      const len = b.to - b.from;
      return (
        <Sequence key={`b${i}`} from={b.from} durationInFrames={len} layout="none" name={`BED ${b.file}`}>
          <Audio
            src={staticFile(`audio/sfx/${b.file}`)}
            loop
            volume={(f) =>
              b.vol *
              interpolate(f, [0, b.fadeIn ?? 1, len - (b.fadeOut ?? 1), len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            }
          />
        </Sequence>
      );
    })}
  </>
);
