import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import * as THREE from "three";

THREE.Cache.enabled = true;
const loader = new THREE.TextureLoader();

// ------------------------------------------------------------ preload cache
// Materials must have their maps from the first render (three.js compiles shaders once),
// so every texture/image/font a scene needs is preloaded before its <ThreeCanvas> mounts.
const TEX = new Map<string, THREE.Texture>();
const IMG = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<void>>();

export type PreloadSpec = { tex?: string[]; img?: string[]; fonts?: string[]; json?: string[] };
const JSONS = new Map<string, unknown>();

function once(key: string, fn: () => Promise<void>): Promise<void> {
  if (!pending.has(key)) pending.set(key, fn());
  return pending.get(key)!;
}

export function preload(spec: PreloadSpec): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const p of spec.tex ?? [])
    jobs.push(
      once("t:" + p, () => new Promise((res) => loader.load(staticFile(p), (t) => { TEX.set(p, t); res(); }, undefined, () => { console.error("tex fail", p); res(); }))),
    );
  for (const p of spec.img ?? [])
    jobs.push(
      once("i:" + p, () => new Promise((res) => { const im = new Image(); im.onload = () => { IMG.set(p, im); res(); }; im.onerror = () => res(); im.src = staticFile(p); })),
    );
  for (const f of spec.fonts ?? []) jobs.push(once("f:" + f, () => document.fonts.load(`40px ${f}`, "种质名称").then(() => undefined).catch(() => undefined)));
  for (const p of spec.json ?? [])
    jobs.push(once("j:" + p, () => fetch(staticFile(p)).then((r) => r.json()).then((d) => { JSONS.set(p, d); }).catch(() => undefined)));
  return Promise.all(jobs).then(() => undefined);
}

/** Renders children only after everything in `spec` is cached. */
export const Preload: React.FC<{ spec: PreloadSpec; children: React.ReactNode }> = ({ spec, children }) => {
  const key = JSON.stringify(spec);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("preload", { timeoutInMilliseconds: 90000 }));
  useEffect(() => {
    preload(spec).then(() => {
      setReady(true);
      continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return ready ? React.createElement(React.Fragment, null, children) : null;
};

type TexOpts = { srgb?: boolean; repeat?: [number, number]; aniso?: number };

/** Synchronous access to a preloaded texture (clone when settings differ). */
export function getTex(path: string, opts: TexOpts = {}): THREE.Texture | null {
  const base = TEX.get(path);
  if (!base) return null;
  const key = `${path}|${opts.srgb === false ? 0 : 1}|${opts.repeat?.join(",") ?? ""}`;
  const cacheKey = "c:" + key;
  const cached = TEX.get(cacheKey);
  if (cached) return cached;
  const t = base.clone();
  t.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = opts.aniso ?? 16;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  t.needsUpdate = true;
  TEX.set(cacheKey, t);
  return t;
}

export const useTex = (path: string, opts: TexOpts = {}) => useMemo(() => getTex(path, opts), [path, opts.srgb, opts.repeat?.[0], opts.repeat?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
export const getImg = (path: string) => IMG.get(path) ?? null;
export const getJson = <T,>(path: string) => (JSONS.get(path) as T) ?? null;

/**
 * After mount, render once more (composer passes exist by now) and only then let Remotion
 * take the screenshot. Frame changes are advanced by @remotion/three itself.
 */
export const Kick: React.FC = () => {
  const advance = useThree((s) => s.advance);
  const [handle] = useState(() => delayRender("r3f kick"));
  useEffect(() => {
    const t1 = setTimeout(() => {
      advance(performance.now());
      const t2 = setTimeout(() => continueRender(handle), 0);
      return () => clearTimeout(t2);
    }, 0);
    return () => clearTimeout(t1);
  }, [advance, handle]);
  return null;
};

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
