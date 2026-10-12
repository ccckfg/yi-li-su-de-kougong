import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import React, { useMemo } from "react";
import { Uniform, Vector2, Vector3 } from "three";

// Screen-space light scattering (GPU Gems 3, ch. 13): march toward the light, accumulate what is
// bright enough to be sky. Dark silhouettes contribute nothing, so they cast the shafts.
const shaftsFrag = /* glsl */ `
uniform vec2 lightPos;
uniform float strength;
uniform float decay;
uniform float density;
uniform float threshold;
uniform vec3 tint;
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 delta = (uv - lightPos) * density / 72.0;
  vec2 tc = uv;
  float illum = 1.0;
  float acc = 0.0;
  for (int i = 0; i < 72; i++) {
    tc -= delta;
    vec3 s = texture2D(inputBuffer, clamp(tc, 0.001, 0.999)).rgb;
    acc += max(0.0, dot(s, vec3(0.3, 0.59, 0.11)) - threshold) * illum;
    illum *= decay;
  }
  acc /= 72.0;
  outputColor = vec4(inputColor.rgb + tint * acc * strength, inputColor.a);
}`;

class LightShaftsEffect extends Effect {
  constructor() {
    super("LightShaftsEffect", shaftsFrag, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform>([
        ["lightPos", new Uniform(new Vector2(0.5, 0.8))],
        ["strength", new Uniform(1)],
        ["decay", new Uniform(0.975)],
        ["density", new Uniform(0.9)],
        ["threshold", new Uniform(0.45)],
        ["tint", new Uniform(new Vector3(1, 0.92, 0.8))],
      ]),
    });
  }
}

export const LightShafts: React.FC<{ pos: [number, number]; strength?: number; decay?: number; density?: number; threshold?: number; tint?: [number, number, number] }> = ({
  pos,
  strength = 1,
  decay = 0.975,
  density = 0.9,
  threshold = 0.45,
  tint = [1, 0.92, 0.8],
}) => {
  const effect = useMemo(() => new LightShaftsEffect(), []);
  (effect.uniforms.get("lightPos")!.value as Vector2).set(pos[0], pos[1]);
  effect.uniforms.get("strength")!.value = strength;
  effect.uniforms.get("decay")!.value = decay;
  effect.uniforms.get("density")!.value = density;
  effect.uniforms.get("threshold")!.value = threshold;
  (effect.uniforms.get("tint")!.value as Vector3).set(...tint);
  return <primitive object={effect} dispose={null} />;
};

// Things that live on the film, not in the scene: silver grain, flicker, scratches, dust, gate vignette.
const filmFrag = /* glsl */ `
uniform float frame;
uniform float amount;
uniform vec2 res;
float fh(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float l = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  float flick = 0.92 + 0.08 * fh(vec2(frame, 3.0));
  float grain = (fh(uv * res + frame * 1.7) + fh(uv * res * 0.5 + frame * 3.1) - 1.0) * 0.11;
  float sx = fh(vec2(floor(frame / 2.0), 11.0));
  float scratch = smoothstep(0.0009, 0.0, abs(uv.x - sx - 0.002 * sin(uv.y * 40.0 + frame))) * step(0.45, fh(vec2(frame, 7.0)));
  vec2 dc = floor(uv * res / 3.0);
  float dust = step(0.99935, fh(dc + floor(frame)));
  float vig = smoothstep(1.1, 0.35, length((uv - 0.5) * vec2(1.25, 1.0)));
  l = (l * flick + grain) * mix(1.0, vig, 0.85) + scratch * 0.35 - dust * 0.55;
  vec3 c = vec3(l) * vec3(1.0, 0.975, 0.93);
  outputColor = vec4(mix(inputColor.rgb, c, amount), inputColor.a);
}`;

class FilmEffect extends Effect {
  constructor() {
    super("FilmEffect", filmFrag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["frame", new Uniform(0)],
        ["amount", new Uniform(1)],
        ["res", new Uniform(new Vector2(1920, 1080))],
      ]),
    });
  }
}

export const FilmLook: React.FC<{ frame: number; amount?: number; res: [number, number] }> = ({ frame, amount = 1, res }) => {
  const effect = useMemo(() => new FilmEffect(), []);
  effect.uniforms.get("frame")!.value = frame;
  effect.uniforms.get("amount")!.value = amount;
  (effect.uniforms.get("res")!.value as Vector2).set(res[0], res[1]);
  return <primitive object={effect} dispose={null} />;
};
