import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { FONT } from "../fonts";

export const DESC: Record<string, string> = {
  S01: "黑场 · 打字机字幕「某年冬。晋北，某村。」",
  S02: "雪中村落 · 背影敲门",
  S03: "炕角坛子 · 手掀开碗",
  S04: "递纸袋 · 纸袋鼓起",
  S05: "黑场 · 「嫌疑人，已带走。」",
  S06: "俯拍 · 台灯亮起 · 片名《口供》",
  S07: "过肩 · 空椅子",
  S08: "大特写 · 笔尖停住",
  S09: "特写 · 翻档案",
  S09b: "反打 · 黑暗里的空椅子",
  S10: "水杯被推进画面",
  S11: "缓推 · 黑暗里的空椅子",
  S12: "墨点晕开",
  S13: "档案夹合上",
  S13b: "推向黑暗",
  S14: "台灯闪 · 纸袋倒 · 谷粒滚开 · 推进一粒",
  S15: "炭笔 · 东胡林",
  S16: "彩陶 · 半坡",
  S17: "甲骨 · 「禾」字长成谷子",
  S18: "青铜 + 竹简",
  S19: "水墨 · 挂穗",
  S20: "敦煌壁画 · 雨中耕作",
  S21: "木刻 · 天工开物",
  S22: "黑白胶片 · 小米加步枪",
  S23: "显微推进 · 谷粒→细胞→DNA",
  S24: "进化树 · 青狗尾草",
  S25: "屏幕光退成台灯",
  S26: "摘老花镜",
  S27: "种子室揭晓",
  S28: "在纸袋上写字 · 采集表",
  S29a: "手按纸袋",
  S29b: "窗前 · 雪",
  S30_1: "1980s · 自行车",
  S30_2: "1990s · 蹲田埂",
  S30_3: "现在 · 白发蹲田埂",
  S31_1: "老太太挂穗",
  S31_2: "水墨挂穗",
  S31_3: "老先生挂穗",
  S32: "晒架 · 逆光",
  S33: "春天 · 撒种 · 浇水",
  S34: "水渗进土里",
  S35: "露白 · 片名《一粒粟的口供》",
  S36: "致敬卡",
  S37: "创作信息页",
};

/** Animatic card for shots that are not built yet. */
export const Placeholder: React.FC<{ id: string }> = ({ id }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0c", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: FONT.sans, color: "#6d6a64", fontSize: 30, letterSpacing: "0.3em" }}>{id}</div>
      <div style={{ fontFamily: FONT.serif, color: "#a39d92", fontSize: 44, marginTop: 18 }}>{DESC[id] ?? ""}</div>
    </AbsoluteFill>
  );
};

/** Still with a slow push — used until the real code scene / AI clip replaces it. */
export const StillShot: React.FC<{ src: string; push?: number; pan?: [number, number] }> = ({ src, push = 0.06, pan = [0, 0] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames - 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(1.02 + push * t),
          translate: `${pan[0] * t}px ${pan[1] * t}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** AI clip: plays from `start` seconds, optionally slowed to fill the shot. */
export const ClipShot: React.FC<{ src: string; start?: number; rate?: number; filter?: string; scale?: number }> = ({ src, start = 0, rate = 1, filter, scale = 1 }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video src={staticFile(src)} muted trimBefore={Math.round(start * fps)} playbackRate={rate} style={{ width: "100%", height: "100%", objectFit: "cover", filter, scale: String(scale) }} />
    </AbsoluteFill>
  );
};

export const Caption: React.FC<{ from: number; dur: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, dur, children, style }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [from, from + 8, from + dur - 8, from + dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: op, ...style }}>{children}</div>;
};
