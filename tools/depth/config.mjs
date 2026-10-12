import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
export const CONFIG_PATH = path.join(TOOL_DIR, 'config.json');

const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
const resolve = (p) => path.resolve(TOOL_DIR, p);

export const config = {
  ...raw,
  stillsDir: resolve(raw.stillsDir),
  outputDir: resolve(raw.outputDir),
  workDir: resolve(raw.workDir),
  cacheDir: resolve(raw.cacheDir),
};
