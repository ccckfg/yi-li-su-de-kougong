import meta from "../../public/audio/vo/vo_meta.json";
import { computeTimeline, FPS, type Shot, type VoMeta } from "./spot";

export { FPS };
export const TL = computeTimeline(meta as unknown as VoMeta);

export const SHOT: Record<string, Shot> = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
export const SECTION = Object.fromEntries(TL.sections.map((s) => [s.id, s]));

export const cue = (id: string): number => {
  const c = TL.cues.find((x) => x.id === id);
  if (!c) throw new Error("unknown cue " + id);
  return c.at;
};

export const line = (id: string) => {
  const l = TL.lines.find((x) => x.id === id);
  if (!l) throw new Error("unknown line " + id);
  return l;
};

/** frames -> seconds helper for shaders/animation */
export const sec = (frames: number) => frames / FPS;
