// node tools_shotstill.mjs <shotId> <localFrame> <out.png>  — one shot alone (no subtitles/overlays), full res
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, frame, out] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const inputProps = { id };
const composition = await selectComposition({ serveUrl, id: "ShotOnly", inputProps, chromiumOptions: { gl: "angle" } });
await renderStill({ composition, serveUrl, frame: Number(frame), output: out, imageFormat: "png", inputProps, chromiumOptions: { gl: "angle" }, timeoutInMilliseconds: 120000 });
console.log("wrote", out);
