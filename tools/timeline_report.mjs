// node tools/timeline_report.mjs  -> prints shot list with durations, writes docs/timeline.json
import { readFileSync, writeFileSync } from "node:fs";
import { computeTimeline, FPS } from "../film/src/timeline/spot.ts";
const meta = JSON.parse(readFileSync(new URL("../film/public/audio/vo/vo_meta.json", import.meta.url), "utf8"));
const tl = computeTimeline(meta);
const fmt = (fr) => { const s = fr / FPS; return `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, "0")}`; };
for (const sec of tl.sections) console.log(`== ${sec.id}  ${fmt(sec.from)}  (${(sec.dur / FPS).toFixed(2)}s)`);
console.log("");
for (const s of tl.shots) console.log(`${s.id.padEnd(6)} ${fmt(s.from)}  ${(s.dur / FPS).toFixed(2)}s  [${s.section}]`);
console.log(`\nTOTAL ${fmt(tl.total)}  (${tl.total} frames)`);
writeFileSync(new URL("../docs/timeline.json", import.meta.url), JSON.stringify(tl, null, 1));
