import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import "./fonts";
import { FONT } from "./fonts";
import { SHOTS } from "./shots/registry";
import { Placeholder } from "./shots/Placeholder";
import { cue, FPS, SHOT, TL } from "./timeline";
import { Subtitles } from "./ui/Subtitles";
import { SfxTrack } from "./audio/SfxTrack";
import { MusicTrack } from "./audio/MusicTrack";
import { MediumTransitions } from "./ui/MediumTransitions";
import { MuseumLabel, TitleCard } from "./ui/Type";

const LABELS: Record<string, { meta: string; quote?: string; dark?: boolean }> = {
  S15: { meta: "约一万年前 · 北京门头沟 · 东胡林" },
  S16: { meta: "六千多年前 · 陕西西安 · 半坡" },
  S17: { meta: "商 · 河南安阳 · 殷墟", quote: "《说文解字》：「禾，嘉谷也。」" },
  S18: { meta: "西周 · 《诗经·大雅·生民》", quote: "「诞降嘉种。」" },
  S19: { meta: "北魏 · 贾思勰《齐民要术》", quote: "「选好穗纯色者，劁刈高悬之。」", dark: true },
  S20: { meta: "唐 · 李绅《悯农》", quote: "「春种一粒粟，秋收万颗子。」" },
  S21: { meta: "明 · 宋应星《天工开物》", quote: "「卷分前后，乃贵五谷而贱金玉之义。」", dark: true },
  S22: { meta: "二十世纪" },
};

const FORM: [string, string][] = [
  ["种质名称", "黄毛"],
  ["地　　点", "晋北某村"],
  ["提 供 人", "王桂兰，83岁"],
  ["种质类型", "地方品种"],
  ["主要特性", "抗旱　耐贫瘠　广适"],
  ["其他特性", "熬粥香"],
  ["备　　注", "当地种植四十余年（据提供人口述）"],
];

// dissolves: the incoming shot starts early and fades in over the outgoing one (timeline unchanged)
const OVERLAP_IN: Record<string, number> = { S15: 16, S16: 12, S17: 12, S18: 12, S19: 12, S20: 6, S21: 6, S22: 6, S23: 6, S36: 12 };

const FadeIn: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(frame, [0, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

const VoTrack: React.FC = () => (
  <>
    {TL.lines.map((ln) => {
      const partner = TL.lines.find((x) => x.id === ln.xfadeWith);
      const isB = TL.lines.some((x) => x.xfadeWith === ln.id);
      return (
        <Sequence key={ln.id} from={ln.audioFrom} name={`VO ${ln.id}`} layout="none">
          <Audio
            src={staticFile(ln.file)}
            volume={(f) => {
              const abs = ln.audioFrom + f;
              // 童声慢慢沉下去，变成老人声: both takes start together, equal-power morph over ~1.5 s
              const sf = partner ? ln.speechFrom : ln.speechFrom;
              const x = Math.min(1, Math.max(0, (abs - (sf + 11)) / 36));
              if (partner) return Math.cos((x * Math.PI) / 2);
              if (isB) return Math.sin((x * Math.PI) / 2);
              return 1;
            }}
          />
        </Sequence>
      );
    })}
  </>
);

const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const s28 = SHOT.S28;
  const s24 = SHOT.S24;
  const s31a = SHOT.S31_1;
  const s31c = SHOT.S31_3;
  const vq = interpolate(frame, [s31a.from + 4, s31a.from + 16, s31c.from + s31c.dur - 10, s31c.from + s31c.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <TitleCard text="口供" from={cue("title_kougong")} dur={SHOT.S07.from - cue("title_kougong") + 8} />
      {Object.entries(LABELS).map(([id, l]) => (
        <MuseumLabel key={id} meta={l.meta} quote={l.quote} dark={l.dark} from={SHOT[id].from + 8} dur={SHOT[id].dur - 10} />
      ))}
      {/* S24 screen read-out */}
      <AbsoluteFill style={{ opacity: interpolate(frame, [s24.from + 10, s24.from + 22, s24.from + s24.dur - 6, s24.from + s24.dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ position: "absolute", left: 120, top: 110, fontFamily: FONT.sans, color: "#9FE3EC", letterSpacing: "0.12em" }}>
          <div style={{ fontSize: 40, fontWeight: 500 }}>青狗尾草 <i style={{ fontFamily: FONT.serif, fontWeight: 400 }}>Setaria viridis</i></div>
          <div style={{ fontSize: 22, marginTop: 18, color: "#7fb9c2", lineHeight: 1.7, maxWidth: 820 }}>
            谷子由青狗尾草驯化而来。2023年，我国科研团队的谷子泛基因组研究，为「谷子起源于中国」提供了遗传学证据。
          </div>
        </div>
      </AbsoluteFill>
      {/* S28 征集表 handwriting */}
      {FORM.map(([k, v], i) => {
        const t0 = s28.from + 6 + i * 4;
        const op = interpolate(frame, [t0, t0 + 8, SHOT.S29a.from + 30, SHOT.S29a.from + 44], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={k} style={{ position: "absolute", right: 120, top: 200 + i * 62, opacity: op, display: "flex", gap: 26, alignItems: "baseline", textShadow: "0 0 10px rgba(0,0,0,0.85)" }}>
            <span style={{ fontFamily: FONT.fang, fontSize: 24, color: "#d9cfbd", letterSpacing: "0.1em" }}>{k}</span>
            <span style={{ fontFamily: FONT.hand, fontSize: 40, color: "#F4ECDC" }}>{v}</span>
          </div>
        );
      })}
      {/* S31 vertical quote */}
      <div style={{ position: "absolute", right: 150, top: 150, writingMode: "vertical-rl", fontFamily: FONT.serif, fontSize: 40, letterSpacing: "0.3em", color: "#F3EBDD", opacity: vq, textShadow: "0 0 14px rgba(0,0,0,0.8)" }}>
        选好穗纯色者，劁刈高悬之。
      </div>
      {/* S35 */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: interpolate(frame, [cue("caption_spring"), cue("caption_spring") + 12, cue("title_full") - 8, cue("title_full")], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ fontFamily: FONT.serif, fontSize: 56, color: "#F1E9DA", letterSpacing: "0.5em", paddingLeft: "0.5em" }}>春种一粒粟。</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 75%)", opacity: interpolate(frame, [cue("title_full") - 6, cue("title_full") + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      {/* the title clears before the tribute card dissolves in (S36 overlaps 12 frames) */}
      <TitleCard text="一粒粟的口供" size={92} from={cue("title_full")} dur={SHOT.S36.from - (OVERLAP_IN.S36 ?? 0) - cue("title_full")} seal="粟" />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {TL.shots.map((s) => {
        const C = SHOTS[s.id] ?? (() => <Placeholder id={s.id} />);
        const ov = OVERLAP_IN[s.id] ?? 0;
        return (
          <Sequence key={s.id} from={s.from - ov} durationInFrames={s.dur + ov} name={s.id}>
            {ov ? (
              <FadeIn frames={ov}>
                <C />
              </FadeIn>
            ) : (
              <C />
            )}
          </Sequence>
        );
      })}
      <MediumTransitions />
      <VoTrack />
      <SfxTrack />
      <MusicTrack />
      <Overlays />
      <Subtitles />
    </AbsoluteFill>
  );
};

export const FILM_FRAMES = TL.total;
export { FPS };
