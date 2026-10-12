import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Typewriter } from "../ui/Type";
import { ClipShot } from "./Placeholder";
import { FONT } from "../fonts";
import { RoomShots } from "../scenes/room/shots";
import { LabShots } from "../scenes/lab/LabShots";
import { S02Plate, S15Plate, S20Plate, S21Plate, S22Plate, S34Plate } from "../scenes/eras/EraPlates";
import { S16 } from "../scenes/eras/S16Pottery";
import { S17 } from "../scenes/eras/S17Oracle3D";
import { S18 } from "../scenes/eras/S18Bronze3D";
// S32 code version (scenes/spring/S32Racks) parked; AI plate used for now
import { S35 } from "../scenes/spring/S35Profile";

const Black: React.FC<{ children?: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ backgroundColor: "#000" }}>{children}</AbsoluteFill>;

/** Two clips back to back inside one shot (first runs `split` seconds). */
const Pair: React.FC<{ a: React.ReactNode; b: React.ReactNode; split: number }> = ({ a, b, split }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const s = Math.round(split * fps);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={s}>{a}</Sequence>
      <Sequence from={s} durationInFrames={Math.max(1, durationInFrames - s)}>{b}</Sequence>
    </AbsoluteFill>
  );
};

const Tribute: React.FC = () => (
  <Black>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
      <div style={{ fontFamily: FONT.serif, fontSize: 30, color: "#a8a092", letterSpacing: "0.18em" }}>本片人物与情节为虚构，取材自谷子科研工作者的真实经历。</div>
      <div style={{ fontFamily: FONT.serif, fontSize: 38, color: "#EDE5D6", letterSpacing: "0.16em" }}>谨以此片，致敬刁现民、赵治海等几代在谷子地里弯过腰的人。</div>
    </AbsoluteFill>
  </Black>
);

const Credits: React.FC = () => (
  <Black>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: FONT.serif, color: "#EDE5D6", fontSize: 30, lineHeight: 1.9, letterSpacing: "0.12em", textAlign: "center" }}>
        <div style={{ fontSize: 46, letterSpacing: "0.5em", marginBottom: 26 }}>一粒粟的口供</div>
        <div>编剧 · 分镜　【成员姓名】　【学院】</div>
        <div>导演 · 剪辑　【成员姓名】　【学院】</div>
        <div>史实与科学顾问　【成员姓名】　【学院】</div>
        <div style={{ marginTop: 24, fontSize: 24, color: "#a8a092" }}>AI 工具：Claude Opus 5.5（代码编写与镜头制作）· Claude Sonnet 5.5（史实核对、音效程序）</div>
        <div style={{ fontSize: 24, color: "#a8a092" }}>MiniMax H3（视频）· MiniMax Speech 2.8（配音）· Google Lyria 3（配乐）· OpenAI GPT 图像（静帧）</div>
        <div style={{ fontSize: 24, color: "#a8a092" }}>甲骨文「禾」字形：Wikimedia Commons（公有领域）· 字体：思源宋体 / 朱雀仿宋 / 霞鹜文楷 / 龙藏体（SIL OFL）</div>
      </div>
    </AbsoluteFill>
  </Black>
);

/** Shot id -> component. Placeholders get replaced shot by shot as code scenes land. */
export const SHOTS: Record<string, React.FC> = {
  S01: () => <Black><Typewriter lines={["某年冬。", "晋北，某村。"]} start={6} cps={6.5} hold={10} /></Black>,
  S02: S02Plate,
  S03: () => <ClipShot src="video/S03.mp4" start={0.5} filter="contrast(1.04) saturate(0.85) sepia(0.1)" />,
  S04: () => <ClipShot src="video/S04.mp4" start={0.6} filter="contrast(1.04) saturate(0.85) sepia(0.1)" />,
  S05: () => <Black><Typewriter lines={["嫌疑人，已带走。"]} start={4} cps={8} hold={12} /></Black>,
  S06: RoomShots.S06,
  S07: RoomShots.S07,
  S08: RoomShots.S08,
  S09: () => <ClipShot src="video/S09.mp4" start={1.0} filter="contrast(1.1) saturate(0.82) brightness(0.9) sepia(0.08)" />,
  S09b: RoomShots.S09b,
  S10: RoomShots.S10,
  S11: RoomShots.S11,
  S12: RoomShots.S12,
  S13: RoomShots.S13,
  S13b: RoomShots.S13b,
  S14: RoomShots.S14,
  S15: S15Plate,
  S16,
  S17,
  S18,
  S19: () => <ClipShot src="video/S19.mp4" start={0} />,
  S20: S20Plate,
  S21: S21Plate,
  S22: S22Plate,
  S23: LabShots.S23,
  S24: LabShots.S24,
  S25: LabShots.S25,
  S26: () => <ClipShot src="video/S26.mp4" start={0.8} filter="contrast(1.1) saturate(0.82) brightness(0.9) sepia(0.08)" />,
  S27: () => <ClipShot src="video/S27.mp4" start={0.4} filter="contrast(1.08) saturate(0.85) brightness(0.93) sepia(0.06)" />,
  S28: () => <ClipShot src="video/S28.mp4" start={0.8} filter="contrast(1.1) saturate(0.82) brightness(0.9) sepia(0.08)" />,
  S29a: () => <ClipShot src="video/S29a.mp4" start={0.6} filter="contrast(1.1) saturate(0.82) brightness(0.9) sepia(0.08)" />,
  S29b: () => <ClipShot src="video/S29b.mp4" start={0.4} filter="contrast(1.04) saturate(0.85) sepia(0.1)" />,
  S30_1: () => <ClipShot src="video/S30_1.mp4" start={0.6} filter="sepia(0.32) saturate(0.95) hue-rotate(-10deg) contrast(1.05)" />,
  S30_2: () => <ClipShot src="video/S30_2.mp4" start={0.8} filter="sepia(0.18) saturate(0.88) contrast(1.03)" />,
  S30_3: () => <ClipShot src="video/S30_3.mp4" start={0.8} filter="saturate(0.9) contrast(1.03)" />,
  S31_1: () => <ClipShot src="video/S31_1.mp4" start={0.4} filter="contrast(1.04) saturate(0.85) sepia(0.1)" />,
  S31_2: () => <ClipShot src="video/S19.mp4" start={1.4} />,
  S31_3: () => <ClipShot src="video/S31_3.mp4" start={0.4} filter="saturate(0.9) contrast(1.03)" />,
  S32: () => <ClipShot src="video/S32.mp4" start={0.4} filter="saturate(0.92) contrast(1.04) sepia(0.05)" />,
  S33: () => <Pair split={2.5} a={<ClipShot src="video/S33a.mp4" start={0.6} filter="saturate(0.9) contrast(1.03)" />} b={<ClipShot src="video/S33b.mp4" start={1.8} filter="saturate(0.9) contrast(1.03)" />} />,
  S34: S34Plate,
  S35,
  S36: Tribute,
  S37: Credits,
};
