import { useThree } from "@react-three/fiber";
import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import React, { useMemo } from "react";
import { Matrix4, Uniform, Vector3 } from "three";

// Haze in a spotlight's cone, ray-marched in screen space against the depth buffer: smoke hangs in
// the lamp's beam and catches the light, thinning out of it. Forward scattering (Henyey-Greenstein)
// makes the beam brighter when the camera looks back toward the lamp.
const frag = /* glsl */ `
uniform mat4 uInvProj;
uniform mat4 uCamWorld;
uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uCosOuter;
uniform float uCosInner;
uniform vec3 uColor;
uniform float uDensity;
uniform float uTime;
uniform float uMaxDist;
uniform float uFloorY;
uniform vec3 uHazeCenter;
uniform float uHazeRadius;
float vHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vNoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(vHash(i + vec3(0,0,0)), vHash(i + vec3(1,0,0)), f.x), mix(vHash(i + vec3(0,1,0)), vHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(vHash(i + vec3(0,0,1)), vHash(i + vec3(1,0,1)), f.x), mix(vHash(i + vec3(0,1,1)), vHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec4 vp = uInvProj * vec4(uv * 2.0 - 1.0, 1.0, 1.0);
  vec3 dirV = normalize(vp.xyz / vp.w);
  float tSurf = getViewZ(depth) / dirV.z;
  float tMax = min(uMaxDist, tSurf);
  vec3 ro = (uCamWorld * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vec3 rd = normalize((uCamWorld * vec4(dirV, 0.0)).xyz);
  const int N = 56;
  float dt = tMax / float(N);
  float t = dt * fract(sin(dot(uv * 1777.0, vec2(12.9898, 78.233))) * 43758.5453);
  float acc = 0.0;
  const float g = 0.38;
  for (int i = 0; i < N; i++) {
    vec3 p = ro + rd * t;
    vec3 d = p - uLightPos;
    float dist = length(d);
    vec3 l = d / dist;
    float cone = smoothstep(uCosOuter, uCosInner, dot(l, uLightDir)) * step(uFloorY, p.y);
    if (cone > 0.0) {
      float n = vNoise(p * 7.0 + vec3(0.0, -uTime * 0.04, uTime * 0.025)) * 0.55
              + vNoise(p * 19.0 + vec3(uTime * 0.06, 0.0, -uTime * 0.05)) * 0.3
              + vNoise(p * 47.0 - uTime * 0.1) * 0.15;
      float dens = uDensity * smoothstep(0.18, 0.85, n) * smoothstep(uHazeRadius, uHazeRadius * 0.2, length(p - uHazeCenter));
      float mu = dot(l, -rd);
      float phase = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * mu, 1.5);
      acc += cone * dens * phase / (0.015 + dist * dist) * dt;
    }
    t += dt;
  }
  outputColor = vec4(inputColor.rgb + uColor * acc, inputColor.a);
}`;

class VolumetricSpotEffect extends Effect {
  constructor() {
    super("VolumetricSpotEffect", frag, {
      blendFunction: BlendFunction.NORMAL,
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ["uInvProj", new Uniform(new Matrix4())],
        ["uCamWorld", new Uniform(new Matrix4())],
        ["uLightPos", new Uniform(new Vector3())],
        ["uLightDir", new Uniform(new Vector3(0, -1, 0))],
        ["uCosOuter", new Uniform(0.7)],
        ["uCosInner", new Uniform(0.9)],
        ["uColor", new Uniform(new Vector3(1, 0.8, 0.55))],
        ["uDensity", new Uniform(0.02)],
        ["uTime", new Uniform(0)],
        ["uMaxDist", new Uniform(6)],
        ["uFloorY", new Uniform(0)],
        ["uHazeCenter", new Uniform(new Vector3())],
        ["uHazeRadius", new Uniform(1)],
      ]),
    });
  }
}

export type VolumetricSpotProps = {
  light: [number, number, number];
  target: [number, number, number];
  angle: number;
  /** fraction of the cone that is soft edge (like SpotLight.penumbra) */
  softness: number;
  color: [number, number, number];
  density: number;
  time: number;
  floorY?: number;
  hazeCenter?: [number, number, number];
  hazeRadius?: number;
};

export const VolumetricSpot: React.FC<VolumetricSpotProps> = ({ light, target, angle, softness, color, density, time, floorY = 0, hazeCenter = [0, 0, 0], hazeRadius = 100 }) => {
  const effect = useMemo(() => new VolumetricSpotEffect(), []);
  const camera = useThree((s) => s.camera);
  const u = effect.uniforms;
  (u.get("uInvProj")!.value as Matrix4).copy(camera.projectionMatrixInverse);
  (u.get("uCamWorld")!.value as Matrix4).copy(camera.matrixWorld);
  (u.get("uLightPos")!.value as Vector3).set(...light);
  (u.get("uLightDir")!.value as Vector3).set(target[0] - light[0], target[1] - light[1], target[2] - light[2]).normalize();
  u.get("uCosOuter")!.value = Math.cos(angle);
  u.get("uCosInner")!.value = Math.cos(angle * (1 - softness));
  (u.get("uColor")!.value as Vector3).set(...color);
  u.get("uDensity")!.value = density;
  u.get("uTime")!.value = time;
  u.get("uFloorY")!.value = floorY;
  (u.get("uHazeCenter")!.value as Vector3).set(...hazeCenter);
  u.get("uHazeRadius")!.value = hazeRadius;
  return <primitive object={effect} dispose={null} />;
};
