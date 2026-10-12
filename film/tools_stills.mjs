// node tools_stills.mjs <outdir> <comp> frame1,frame2,... [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [outdir, compId, framesArg, scaleArg] = process.argv.slice(2);
const frames = framesArg.split(",").map((x) => x.trim()).filter(Boolean);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), onProgress: () => {} });
const composition = await selectComposition({ serveUrl, id: compId, chromiumOptions: { gl: "angle" } });
for (const fr of frames) {
  const [name, num] = fr.includes(":") ? fr.split(":") : [fr, fr];
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: Number(num), output: path.join(outdir, `${name}.jpg`), imageFormat: "jpeg", jpegQuality: 90, scale: Number(scaleArg ?? 0.5), chromiumOptions: { gl: "angle" }, timeoutInMilliseconds: 120000 });
  console.log(name, num, `${Date.now() - t0}ms`);
}
