import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { config, CONFIG_PATH, TOOL_DIR } from './config.mjs';
import { ensureEnvProxy, loadEstimator } from './model.mjs';

ensureEnvProxy();

// Optional CLI filter: `node depth.mjs S02 S15` runs only those stills.
const requested = process.argv.slice(2);
const names = requested.length ? requested : config.stills;

mkdirSync(config.workDir, { recursive: true });
mkdirSync(config.outputDir, { recursive: true });

const { estimator, model, host } = await loadEstimator(config);
console.log(`Using ${model} (${host})`);
writeFileSync(
  path.join(config.workDir, 'model.json'),
  JSON.stringify({ model, host, dtype: config.dtype }, null, 2),
);

// predicted_depth is the raw float disparity (near = large) resized to the
// input resolution; the Python step refines it and writes the PNG/JPG outputs.
for (const name of names) {
  const input = path.join(config.stillsDir, name + config.inputExt);
  const t0 = Date.now();
  const { predicted_depth: depth } = await estimator(input);
  const [height, width] = depth.dims.slice(-2);
  const data = depth.data;
  writeFileSync(
    path.join(config.workDir, `${name}.f32`),
    Buffer.from(data.buffer, data.byteOffset, data.byteLength),
  );
  console.log(`${name}: ${width}x${height} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

await estimator.dispose?.();

const post = spawnSync(
  config.python,
  [path.join(TOOL_DIR, 'postprocess.py'), '--config', CONFIG_PATH, ...names],
  { stdio: 'inherit' },
);
if (post.status !== 0) process.exit(post.status ?? 1);

const verify = spawnSync(
  config.python,
  [path.join(TOOL_DIR, 'verify.py'), '--config', CONFIG_PATH, ...names],
  { stdio: 'inherit' },
);
process.exit(verify.status ?? 1);
