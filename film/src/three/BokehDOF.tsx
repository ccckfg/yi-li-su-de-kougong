import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import React, { useMemo } from "react";
import { Uniform } from "three";

// Single-pass scatter-as-gather bokeh DOF (after Dennis Gustafsson): thin-lens circle of confusion,
// golden-angle spiral sampling; nearer samples keep their full CoC so foreground blur spills over
// in-focus backgrounds instead of stopping hard at the silhouette.
const fragmentShader = /* glsl */ `
uniform float focusDist;
uniform float cocScale;
uniform float maxBlur;
float viewDist(const in float d) { return max(1e-4, -getViewZ(d)); }
float cocPx(const in float dist) { return min(maxBlur, cocScale * abs(1.0 / focusDist - 1.0 / dist)); }
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  float cd = viewDist(depth);
  float cs = cocPx(cd);
  vec3 acc = inputColor.rgb;
  float tot = 1.0;
  float r = 0.75;
  float ang = 0.0;
  for (int i = 0; i < 260; i++) {
    if (r > maxBlur) break;
    vec2 tc = uv + vec2(cos(ang), sin(ang)) * texelSize * r;
    vec3 sc = texture2D(inputBuffer, tc).rgb;
    float sd = viewDist(readDepth(tc));
    float ss = cocPx(sd);
    if (sd > cd) ss = clamp(ss, 0.0, cs * 2.0);
    float m = smoothstep(r - 0.5, r + 0.5, ss);
    acc += mix(acc / tot, sc, m);
    tot += 1.0;
    ang += 2.39996323;
    r += 1.6 / r;
  }
  outputColor = vec4(acc / tot, inputColor.a);
}`;

export class BokehDOFEffect extends Effect {
  constructor() {
    super("BokehDOFEffect", fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ["focusDist", new Uniform(1)],
        ["cocScale", new Uniform(10)],
        ["maxBlur", new Uniform(22)],
      ]),
    });
  }
}

/**
 * focus: metres from camera. farBlur: blur radius (px at 1080p) of objects at infinity.
 * Near objects blur by the thin-lens law (clamped to maxBlur).
 */
export const BokehDOF: React.FC<{ focus: number; farBlur: number; maxBlur?: number; scale?: number }> = ({ focus, farBlur, maxBlur = 24, scale = 1 }) => {
  const effect = useMemo(() => new BokehDOFEffect(), []);
  effect.uniforms.get("focusDist")!.value = focus;
  effect.uniforms.get("cocScale")!.value = farBlur * focus * scale;
  effect.uniforms.get("maxBlur")!.value = maxBlur * scale;
  return <primitive object={effect} dispose={null} />;
};
