import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";

/** Dossier typewriter: chars strike in one by one with uneven ink, then hold and fade. */
export const Typewriter: React.FC<{
  lines: string[];
  start?: number;
  cps?: number; // chars per second
  hold?: number; // frames after last char
  size?: number;
  color?: string;
  fadeOut?: number;
  seed?: string;
}> = ({ lines, start = 0, cps = 7, hold = 30, size = 46, color = "#E9E1D2", fadeOut = 10, seed = "tw" }) => {
  const frame = useCurrentFrame();
  const perChar = 24 / cps;
  let idx = 0;
  const total = lines.join("").length;
  const end = start + total * perChar + hold;
  const out = interpolate(frame, [end, end + fadeOut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <div style={{ display: "flex", flexDirection: "column", gap: size * 0.55 }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ fontFamily: FONT.fang, fontSize: size, color, letterSpacing: "0.32em", whiteSpace: "pre" }}>
            {[...ln].map((ch, ci) => {
              const t0 = start + idx * perChar + random(`${seed}${idx}`) * perChar * 0.35;
              idx++;
              const on = frame >= t0;
              const strike = interpolate(frame, [t0, t0 + 2], [1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const ink = 0.78 + random(`${seed}ink${idx}`) * 0.22;
              return (
                <span
                  key={ci}
                  style={{
                    opacity: on ? ink : 0,
                    display: "inline-block",
                    scale: String(strike),
                    translate: `0px ${(random(`${seed}y${idx}`) - 0.5) * 2.2}px`,
                    filter: "blur(0.25px)",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Film title: 《口供》 style — quiet, wide tracking, slow breathe-in. */
/** A cinnabar seal (朱文印): the character in red on paper-white ground, inked unevenly, pressed in. */
export const Seal: React.FC<{ char: string; size: number; at: number }> = ({ char, size, at }) => {
  const frame = useCurrentFrame();
  const press = interpolate(frame, [at, at + 5, at + 9], [1.25, 0.96, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = interpolate(frame, [at, at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const id = `seal-${char}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity: op, scale: String(press), display: "block" }}>
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" />
        </filter>
      </defs>
      <mask id={`${id}-m`}>
        <rect x="0" y="0" width="100" height="100" fill="white" />
        <text x="50" y="73" textAnchor="middle" fontFamily="SeedSerif" fontWeight={900} fontSize="64" fill="black">{char}</text>
      </mask>
      {/* 白文印: solid cinnabar block, the character cut out of it */}
      <g filter={`url(#${id})`}>
        <rect x="6" y="6" width="88" height="88" rx="5" fill="#c8302a" mask={`url(#${id}-m)`} />
      </g>
    </svg>
  );
};

export const TitleCard: React.FC<{ text: string; from: number; dur: number; size?: number; sub?: string; seal?: string }> = ({ text, from, dur, size = 112, sub, seal }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [from, from + 14, from + dur - 12, from + dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const track = interpolate(frame, [from, from + dur], [0.62, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: op }}>
      <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: size, color: "#EFE7D8", letterSpacing: `${track}em`, paddingLeft: `${track}em`, textShadow: "0 0 30px rgba(0,0,0,0.6)" }}>
        <span style={{ fontWeight: 300, opacity: 0.7, fontSize: size * 0.62, letterSpacing: 0 }}>《</span>
        {text}
        <span style={{ fontWeight: 300, opacity: 0.7, fontSize: size * 0.62, letterSpacing: 0 }}>》</span>
      </div>
      {seal ? (
        <div style={{ position: "absolute", left: "50%", top: "50%", translate: `${size * 6.25}px ${-size * 0.08}px` }}>
          <Seal char={seal} size={size * 0.68} at={from + 22} />
        </div>
      ) : null}
      {sub ? <div style={{ fontFamily: FONT.serif, fontSize: size * 0.24, color: "#bdb3a2", marginTop: 30, letterSpacing: "0.4em" }}>{sub}</div> : null}
    </AbsoluteFill>
  );
};

/** Museum label (展签): bottom-left, line 1 time · place, line 2 quote. One style for all eras. */
export const MuseumLabel: React.FC<{ meta: string; quote?: string; from: number; dur: number; dark?: boolean }> = ({ meta, quote, from, dur, dark }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [from, from + 10, from + dur - 10, from + dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ink = dark ? "#2a241c" : "#F1EADD";
  const rule = dark ? "rgba(42,36,28,0.55)" : "rgba(241,234,221,0.55)";
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", opacity: op }}>
      <div style={{ margin: "0 0 205px 120px", textShadow: dark ? "none" : "0 0 16px rgba(0,0,0,0.75)" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 400, fontSize: 24, color: ink, letterSpacing: "0.28em", opacity: 0.88 }}>{meta}</div>
        <div style={{ width: 54, height: 1, background: rule, margin: "16px 0 16px" }} />
        {quote ? <div style={{ fontFamily: FONT.serif, fontWeight: 500, fontSize: 38, color: ink, letterSpacing: "0.12em" }}>{quote}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
