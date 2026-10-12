// Spotting: lays out every VO line, shot and cue on one timeline from measured VO durations.
// Pure module (no imports) so Node can run it directly for reports: node tools/timeline_report.mjs

export const FPS = 24;

export type VoMeta = Record<
  string,
  { role: string; text: string; file: string; start_ms: number; end_ms: number; full_ms: number; speech_ms: number }
>;

type Ev =
  | { t: "sec"; id: string }
  | { t: "shot"; id: string; at?: number }
  | { t: "line"; id: string; gap?: number }
  | { t: "xline"; a: string; b: string; gap?: number; xf: number }
  | { t: "wait"; s: number }
  | { t: "cue"; id: string; at?: number }
  | { t: "split"; line: string; shots: string[]; fracs: number[]; offset?: number };

const S = (id: string, at = 0): Ev => ({ t: "shot", id, at });
const L = (id: string, gap = 0.2): Ev => ({ t: "line", id, gap });
const W = (s: number): Ev => ({ t: "wait", s });
const C = (id: string, at = 0): Ev => ({ t: "cue", id, at });

// gaps are seconds between the end of the previous speech and the start of this one
export const SPEC: Ev[] = [
  { t: "sec", id: "带走" },
  S("S01"), C("wind_in"), C("typewriter", 0.3), W(2.5),
  S("S02"), C("snow_steps", 0.1), C("knock1", 1.35), C("knock2", 1.75), W(2.7),
  S("S03"), C("bowl_lift", 0.2), L("v01_gran_a", 0.75), W(0.15),
  S("S04"), C("grain_pour", 0.0), L("v01_gran_b", 0.3), W(0.25),
  S("S05"), C("caption_taken", 0.15), W(1.8),

  { t: "sec", id: "口供" },
  S("S06"), C("lamp_click", 0.4), C("title_kougong", 0.75), W(1.9),
  S("S07"), L("v02_01_int", 0.15), L("v02_02_kid", 0.5), L("v02_03_int", 0.2), L("v02_04_kid", 0.12),
  S("S08", 0.12), C("pen_stop", 0.12), L("v02_05_kid", 0.6),
  S("S09", 0.12), L("v02_06_int", 0.3), L("v02_07_kid", 0.1), C("paper_flip", 0.15), L("v02_08_int", 0.4), L("v02_09_kid", 0.1), { t: "split", line: "v02_09_kid", shots: ["S09b"], fracs: [0], offset: -0.12 },
  S("S10", 0.12), C("glass_push", 0.12), L("v02_10_kid", 0.5), L("v02_11_int", 0.15), L("v02_12_kid", 0.08),
  S("S11", 0.15), L("v02_13_int", 0.45), L("v02_14_kid", 0.12), L("v02_15_int", 0.2), L("v02_16_kid", 0.1), L("v02_17_int", 0.35),
  S("S12", 0.1), L("v02_18_kid", 0.2), C("ink_drop", 0.05), W(1.25),
  S("S13"), L("v02_19_int", 0.05), L("v02_20_kid", 0.25), C("folder_close", 0.3), L("v02_21_int", 0.45), L("v02_22_kid", 0.2), { t: "split", line: "v02_22_kid", shots: ["S13b"], fracs: [0], offset: -0.15 }, L("v02_23_int", 0.35),
  S("S14", 0.2), C("lamp_flicker", 0.25), { t: "xline", a: "v02_24_kid", b: "v02_24_old", gap: 0.55, xf: 0 }, C("bag_tip", 0.1), C("grains_spill", 0.35), W(2.8),

  { t: "sec", id: "一万年" },
  S("S15"), L("v03_1", 0.45),
  S("S16", 0.25), L("v03_2", 0.35),
  S("S17", 0.25), L("v03_3", 0.35),
  S("S18", 0.25), L("v03_4", 0.35),
  S("S19", 0.25), L("v03_5", 0.35),
  S("S20", 0.25), L("v03_6", 0.35),
  S("S21", 0.25), L("v03_7", 0.35),
  S("S22", 0.25), L("v03_8", 0.35), W(0.6),

  { t: "sec", id: "化验" },
  S("S23"), W(3.6),
  S("S24"), L("v04_old", 2.4), W(0.4),
  S("S25"), W(1.5),

  { t: "sec", id: "接你" },
  S("S26"), C("piano_1", 0.2), W(2.8),
  S("S27"), C("piano_2", 0.4), W(3.6),
  S("S28"), C("pen_write", 0.1), L("v05_01_old", 0.5), W(0.4),
  S("S29a"), L("v05_02_man", 0.25), W(0.15),
  S("S29b"), L("v05_03_man", 0.35), L("v05_04_man", 0.55), W(0.35),
  S("S30_1"), L("v05_05_old", 0.3), { t: "split", line: "v05_05_old", shots: ["S30_2", "S30_3"], fracs: [0.36, 0.7] }, W(0.15),
  S("S31_1"), L("v05_06_old", 0.25), { t: "split", line: "v05_06_old", shots: ["S31_2", "S31_3"], fracs: [0.34, 0.66] }, W(0.25),
  S("S32"), L("v05_07_old", 0.25), { t: "split", line: "v05_07_old", shots: ["S33"], fracs: [0.56] }, C("wind_water", 0.1), W(1.8),
  S("S34"), L("v05_08_old", 0.2), L("v05_09_kid", 0.6), W(0.25),
  S("S35"), C("caption_spring", 0.7), C("title_full", 2.4), W(5.0),

  { t: "sec", id: "片尾" },
  S("S36"), W(3.0),
  S("S37"), W(7.0),
];

export type Line = { id: string; role: string; text: string; file: string; audioFrom: number; speechFrom: number; speechTo: number; xfadeWith?: string };
export type Shot = { id: string; section: string; from: number; dur: number };
export type Cue = { id: string; at: number };
export type Timeline = { lines: Line[]; shots: Shot[]; cues: Cue[]; sections: { id: string; from: number; dur: number }[]; total: number };

export function computeTimeline(meta: VoMeta, spec: Ev[] = SPEC): Timeline {
  let cur = 0; // seconds; cursor = end of last speech / wait
  let section = "";
  const lines: Line[] = [];
  const shotStarts: { id: string; section: string; at: number }[] = [];
  const cues: Cue[] = [];
  const secStarts: { id: string; at: number }[] = [];
  const f = (s: number) => Math.round(s * FPS);

  for (const ev of spec) {
    if (ev.t === "sec") {
      section = ev.id;
      secStarts.push({ id: ev.id, at: cur });
    } else if (ev.t === "shot") {
      shotStarts.push({ id: ev.id, section, at: cur + (ev.at ?? 0) });
    } else if (ev.t === "cue") {
      cues.push({ id: ev.id, at: f(cur + (ev.at ?? 0)) });
    } else if (ev.t === "wait") {
      cur += ev.s;
    } else if (ev.t === "line" || ev.t === "xline") {
      const id = ev.t === "line" ? ev.id : ev.a;
      const m = meta[id];
      if (!m) throw new Error("missing VO meta for " + id);
      const speechFrom = cur + (ev.gap ?? 0.2);
      const audioFrom = speechFrom - m.start_ms / 1000;
      lines.push({ id, role: m.role, text: m.text, file: m.file, audioFrom: f(audioFrom), speechFrom: f(speechFrom), speechTo: f(speechFrom + m.speech_ms / 1000) });
      cur = speechFrom + m.speech_ms / 1000;
      if (ev.t === "xline") {
        // second voice starts xf seconds into the first, both run; cursor = end of the later one
        const mb = meta[ev.b];
        const bFrom = speechFrom + ev.xf;
        lines[lines.length - 1].xfadeWith = ev.b;
        lines.push({ id: ev.b, role: mb.role, text: mb.text, file: mb.file, audioFrom: f(bFrom - mb.start_ms / 1000), speechFrom: f(bFrom), speechTo: f(bFrom + mb.speech_ms / 1000) });
        cur = Math.max(cur, bFrom + mb.speech_ms / 1000);
      }
    } else if (ev.t === "split") {
      const ln = lines.find((l) => l.id === ev.line);
      if (!ln) throw new Error("split before line " + ev.line);
      ev.shots.forEach((id, i) => {
        shotStarts.push({ id, section, at: (ln.speechFrom + (ln.speechTo - ln.speechFrom) * ev.fracs[i]) / FPS + (ev.offset ?? 0) });
      });
    }
  }
  const total = f(cur);
  shotStarts.sort((a, b) => a.at - b.at);
  const shots: Shot[] = shotStarts.map((s, i) => {
    const from = f(s.at);
    const to = i + 1 < shotStarts.length ? f(shotStarts[i + 1].at) : total;
    return { id: s.id, section: s.section, from, dur: to - from };
  });
  const sections = secStarts.map((s, i) => {
    const from = f(s.at);
    const to = i + 1 < secStarts.length ? f(secStarts[i + 1].at) : total;
    return { id: s.id, from, dur: to - from };
  });
  return { lines, shots, cues, sections, total };
}
