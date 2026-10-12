import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// All fonts are SIL OFL. Family names used across the film's typography system:
//   Serif  — 片名 / 展签 / 字幕 (Noto Serif SC, variable weight)
//   Sans   — 小字信息 (Noto Sans SC)
//   Fang   — 档案打字机字幕 (朱雀仿宋)
//   Hand   — 采集表手写 (Long Cang)
//   Kai    — 旁白引文 (霞鹜文楷)
export const FONT = {
  serif: "SeedSerif",
  sans: "SeedSans",
  fang: "SeedFang",
  hand: "SeedHand",
  kai: "SeedKai",
} as const;

const fonts: [string, string, string?][] = [
  [FONT.serif, "fonts/NotoSerifSC-VF.ttf", "200 900"],
  [FONT.sans, "fonts/NotoSansSC-VF.ttf", "100 900"],
  [FONT.fang, "fonts/ZhuqueFangsong-Regular.ttf"],
  [FONT.hand, "fonts/LongCang-Regular.ttf"],
  [FONT.kai, "fonts/LXGWWenKai-Regular.ttf"],
];

for (const [family, file, weight] of fonts) {
  loadFont({ family, url: staticFile(file), weight: weight ?? "400" }).catch((e) => console.error("font", family, e));
}
