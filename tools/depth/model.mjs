import { spawnSync } from 'node:child_process';
import { env, pipeline } from '@huggingface/transformers';

/**
 * Node's built-in fetch only follows HTTP(S)_PROXY when NODE_USE_ENV_PROXY=1,
 * so re-run this process once with it enabled when a proxy variable is present.
 */
export function ensureEnvProxy() {
  const hasProxy = process.env.HTTPS_PROXY || process.env.https_proxy
    || process.env.HTTP_PROXY || process.env.http_proxy;
  if (!hasProxy || process.env.NODE_USE_ENV_PROXY === '1') return;
  const res = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(res.status ?? 1);
}

async function tryLoad(cfg, model, host) {
  const { stallTimeoutSec, totalTimeoutSec } = cfg.download;
  const controller = new AbortController();
  const startedAt = Date.now();
  let lastProgressAt = startedAt;
  let lastPrinted = -1;

  env.remoteHost = host;
  env.cacheDir = cfg.cacheDir;
  env.fetch = (url, opts) => fetch(url, { ...opts, signal: controller.signal });

  const watchdog = setInterval(() => {
    const now = Date.now();
    if (now - lastProgressAt > stallTimeoutSec * 1000) {
      controller.abort(new Error(`download stalled for ${stallTimeoutSec}s`));
    } else if (now - startedAt > totalTimeoutSec * 1000) {
      controller.abort(new Error(`download exceeded ${totalTimeoutSec}s`));
    }
  }, 1000);

  try {
    return await pipeline(cfg.pipelineTask, model, {
      dtype: cfg.dtype,
      progress_callback: (p) => {
        lastProgressAt = Date.now();
        if (p.status !== 'progress' || !p.file?.endsWith('.onnx')) return;
        const pct = Math.floor(p.progress / 10) * 10;
        if (pct === lastPrinted) return;
        lastPrinted = pct;
        console.log(`  downloading ${p.file}: ${pct}% (${(p.loaded / 1e6).toFixed(0)}/${(p.total / 1e6).toFixed(0)} MB)`);
      },
    });
  } finally {
    clearInterval(watchdog);
  }
}

/** Try each model on each host in order; return the first pipeline that loads. */
export async function loadEstimator(cfg) {
  const failures = [];
  for (const model of cfg.models) {
    for (const host of cfg.hosts) {
      console.log(`Loading ${model} from ${host}`);
      try {
        const estimator = await tryLoad(cfg, model, host);
        return { estimator, model, host };
      } catch (err) {
        const reason = err?.cause?.message ?? err?.message ?? String(err);
        console.warn(`  failed: ${reason}`);
        failures.push(`${model} @ ${host}: ${reason}`);
      }
    }
  }
  throw new Error(`No model could be loaded:\n${failures.join('\n')}`);
}
