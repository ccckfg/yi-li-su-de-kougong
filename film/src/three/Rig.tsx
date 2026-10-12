import { useThree } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";

export type V3 = [number, number, number];

/** Frame-driven camera: drives R3F's default camera every render (effects keep a valid reference). */
export const RigCamera: React.FC<{ pos: V3; target: V3; fov: number; roll?: number; near?: number; far?: number }> = ({ pos, target, fov, roll = 0, near = 0.02, far = 30 }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  cam.position.set(...pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(...target);
  cam.fov = fov;
  cam.aspect = size.width / size.height;
  cam.near = near;
  cam.far = far;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return null;
};

export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
export const easeInOut = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number, p = 3) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), p);
export const easeIn = (t: number, p = 3) => Math.pow(Math.min(1, Math.max(0, t)), p);

/** Hash-based smooth 1D noise for frame-driven flicker / handheld drift (deterministic). */
export function noise1(x: number, seed = 0): number {
  const h = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
}
