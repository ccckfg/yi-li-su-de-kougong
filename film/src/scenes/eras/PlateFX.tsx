import { ThreeCanvas } from "@remotion/three";
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { getTex, Preload } from "../../three/assets";

export type PlateMode = "charcoal" | "mural" | "woodcut" | "film" | "snow" | "plain" | "wetsoil";

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uImg;
uniform vec2 uRes;
uniform vec2 uImgSize;
uniform float uT;       // 0..1 over the shot
uniform float uTime;    // seconds
uniform float uFrame;   // integer frame
uniform int uMode;      // 0 charcoal 1 mural 2 woodcut 3 film 4 snow 5 plain
uniform float uPush;    // ken-burns push amount
uniform vec2 uPan;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(3.1,7.7); a*=0.5; } return v; }
float luma(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }

vec2 coverUv(vec2 uv){
  // object-fit: cover + slow push/pan
  float ra = uRes.x/uRes.y, ri = uImgSize.x/uImgSize.y;
  vec2 s = ra > ri ? vec2(1.0, ri/ra) : vec2(ra/ri, 1.0);
  float z = 1.0 + uPush * uT;
  vec2 q = (uv - 0.5) * s / z + 0.5 + uPan * uT;
  return q;
}

vec3 snowLayer(vec2 uv, float scale, float speed, float size, float seed){
  vec2 p = uv * vec2(uRes.x/uRes.y, 1.0) * scale;
  p.y += uTime * speed;
  p.x += sin(uTime*0.6 + seed)*0.3 + uTime*0.15*speed;
  vec2 cell = floor(p); vec2 f = fract(p) - 0.5;
  float h = hash(cell + seed);
  vec2 o = vec2(hash(cell+1.3+seed), hash(cell+7.1+seed)) - 0.5;
  float d = length(f - o*0.7);
  float flake = smoothstep(size, 0.0, d) * step(0.55, h);
  return vec3(flake);
}

void main(){
  vec2 uv = vUv;
  float fr = uFrame;
  vec3 col;
  if (uMode == 0) {
    // charcoal: boiling lines (jitter changes every 3 frames), paper tooth, smudge
    float step3 = floor(fr / 3.0);
    vec2 jit = (vec2(hash(vec2(step3, 1.0)), hash(vec2(step3, 2.0))) - 0.5) * 0.0016;
    vec2 q = coverUv(uv) + jit + (vec2(fbm(uv*40.0 + step3), fbm(uv*40.0 - step3)) - 0.5) * 0.0018;
    vec3 c = texture2D(uImg, q).rgb;
    float l = luma(c);
    float tooth = fbm(uv * vec2(uRes.x/uRes.y, 1.0) * 220.0);
    vec3 paper = vec3(0.84, 0.81, 0.74) * (0.9 + 0.1 * tooth);
    // charcoal sits on the tooth: darks keep their weight, lights show the paper
    float lit = smoothstep(0.1, 0.56, l + (tooth - 0.5) * 0.1);
    vec3 warm = mix(vec3(1.0), vec3(1.05, 0.96, 0.82), smoothstep(0.05, 0.3, c.r - c.b));
    col = mix(vec3(0.07, 0.065, 0.06), paper, lit) * warm;
    // strokes appear out of blank paper at the start
    float rev = smoothstep(0.0, 0.3, uT);
    float m = smoothstep(rev - 0.18, rev, fbm(uv * 5.0) * 0.55 + (1.0 - uv.y) * 0.25 + uv.x * 0.2);
    col = mix(paper, col, rev >= 0.999 ? 1.0 : m);
  } else if (uMode == 1) {
    // mural: mineral pigments, rain, flaking plaster, guttering cave-lamp light
    vec2 q = coverUv(uv);
    vec3 c = texture2D(uImg, q).rgb;
    float flake = smoothstep(0.71, 0.74, fbm(q * 9.0 + 3.0) + uT * 0.03);
    vec3 plaster = vec3(0.78, 0.70, 0.58) * (0.85 + 0.15 * fbm(q * 60.0));
    c = mix(c, plaster, flake * 0.7);
    // rain: thin slanted streaks drifting down, strongest in the upper half
    vec2 rp = vec2(uv.x * uRes.x / uRes.y + uv.y * 0.18, uv.y);
    float lane = floor(rp.x * 160.0);
    float rnd = hash(vec2(lane, 9.0));
    float y = fract(rp.y * 1.5 + uTime * (0.9 + rnd) + rnd * 10.0);
    float streak = smoothstep(0.012, 0.0, abs(fract(rp.x * 160.0) - 0.5) - 0.42) * smoothstep(0.0, 0.08, y) * smoothstep(0.35, 0.1, y);
    c = mix(c, vec3(0.85, 0.9, 0.92), streak * step(0.62, rnd) * 0.35 * smoothstep(0.25, 0.9, uv.y));
    float lamp = 0.9 + 0.1 * noise(vec2(uTime * 3.0, 1.0));
    col = c * lamp * mix(vec3(1.0), vec3(1.08, 1.0, 0.88), 0.5);
  } else if (uMode == 2) {
    // woodcut: lines are cut in from left to right with a ragged front; paper stays
    vec2 q = coverUv(uv);
    vec3 c = texture2D(uImg, q).rgb;
    float l = luma(c);
    float front = smoothstep(0.0, 0.42, uT) * 1.25 - 0.1;
    float m = smoothstep(front - 0.02, front + 0.02, uv.x + (fbm(uv * vec2(4.0, 30.0)) - 0.5) * 0.12);
    vec3 paper = vec3(0.91, 0.87, 0.78) * (0.92 + 0.08 * fbm(uv * 300.0));
    float line = smoothstep(0.55, 0.35, l);
    vec3 printed = mix(paper, vec3(0.06, 0.05, 0.05), line);
    col = mix(printed, paper, m);
  } else if (uMode == 3) {
    // 1940s silver print: weave, flicker, scratches, dust, heavy grain
    vec2 weave = vec2(noise(vec2(fr * 0.7, 1.0)) - 0.5, noise(vec2(fr * 0.9, 5.0)) - 0.5) * 0.004;
    vec2 q = coverUv(uv) + weave;
    float l = luma(texture2D(uImg, q).rgb);
    float flick = 0.9 + 0.1 * hash(vec2(fr, 3.0));
    l *= flick;
    float sx = hash(vec2(floor(fr / 2.0), 11.0));
    float scratch = smoothstep(0.0008, 0.0, abs(uv.x - sx)) * step(0.4, hash(vec2(fr, 7.0)));
    float dust = step(0.9985, hash(floor(uv * uRes / 3.0) + fr));
    float grain = (hash(uv * uRes + fr * 1.7) - 0.5) * 0.16;
    l = l + grain + scratch * 0.5 - dust * 0.6;
    float vig = smoothstep(1.05, 0.35, length((uv - 0.5) * vec2(1.3, 1.0)));
    col = vec3(l) * vig * vec3(1.0, 0.98, 0.94);
  } else if (uMode == 4) {
    // snow village: falling snow in three depths, chimney smoke, warm window flicker
    vec2 q = coverUv(uv);
    vec3 c = texture2D(uImg, q).rgb;
    c += snowLayer(uv, 7.0, 0.05, 0.10, 1.0) * 0.55;
    c += snowLayer(uv, 14.0, 0.08, 0.12, 5.0) * 0.4;
    c += snowLayer(uv, 26.0, 0.11, 0.15, 9.0) * 0.28;
    col = c * (0.97 + 0.03 * noise(vec2(uTime * 4.0, 2.0)));
  } else if (uMode == 6) {
    // water soaking into soil: a darkening front spreads out, a wet sheen, tiny bubbles breaking
    vec2 q = coverUv(uv);
    vec3 c = texture2D(uImg, q).rgb;
    vec2 cp = (uv - vec2(0.48, 0.55)) * vec2(uRes.x/uRes.y, 1.0);
    float front = 0.12 + 0.75 * (1.0 - exp(-uT * 2.4));
    float wet = smoothstep(front, front - 0.12, length(cp) + (fbm(uv * 7.0) - 0.5) * 0.35);
    vec3 dry = c;
    vec3 soaked = c * vec3(0.52, 0.47, 0.44);
    float sheen = pow(fbm(uv * 40.0 + uTime * 0.05), 3.0) * wet * (1.0 - uT * 0.6);
    col = mix(dry, soaked, wet) + vec3(0.9, 0.85, 0.75) * sheen * 0.35;
    // bubbles: little bright rings popping inside the wet area
    vec2 g = uv * vec2(uRes.x/uRes.y, 1.0) * 26.0;
    vec2 cell = floor(g);
    float h = hash(cell);
    float life = fract(uTime * (0.6 + h) + h * 7.0);
    float rr = length(fract(g) - 0.5 - (vec2(hash(cell + 3.1), hash(cell + 5.7)) - 0.5) * 0.5);
    float ring = smoothstep(0.03, 0.0, abs(rr - 0.05 - life * 0.12)) * (1.0 - life) * step(0.82, h);
    col += vec3(1.0) * ring * wet * 0.5;
  } else {
    col = texture2D(uImg, coverUv(uv)).rgb;
  }
  gl_FragColor = vec4(col, 1.0);
}`;

const MODES: Record<PlateMode, number> = { charcoal: 0, mural: 1, woodcut: 2, film: 3, snow: 4, plain: 5, wetsoil: 6 };

const PlateQuad: React.FC<{ src: string; mode: PlateMode; push: number; pan: [number, number] }> = ({ src, mode, push, pan }) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const tex = getTex(src, { srgb: false }); // raw sRGB values in, raw out (canvas is linear=true)
  const mat = useMemo(() => {
    const img = tex?.image as HTMLImageElement | undefined;
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uImg: { value: tex },
        uRes: { value: new THREE.Vector2(width, height) },
        uImgSize: { value: new THREE.Vector2(img?.width ?? 16, img?.height ?? 9) },
        uT: { value: 0 },
        uTime: { value: 0 },
        uFrame: { value: 0 },
        uMode: { value: MODES[mode] },
        uPush: { value: push },
        uPan: { value: new THREE.Vector2(...pan) },
      },
      depthTest: false,
    });
  }, [tex, width, height, mode, push, pan]);
  mat.uniforms.uT.value = frame / Math.max(1, durationInFrames - 1);
  mat.uniforms.uTime.value = frame / fps;
  mat.uniforms.uFrame.value = frame;
  return (
    <mesh material={mat} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
};

/** A generated still brought to life by a medium-specific shader. */
export const PlateFX: React.FC<{ src: string; mode: PlateMode; push?: number; pan?: [number, number] }> = ({ src, mode, push = 0.05, pan = [0, 0] }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Preload spec={{ tex: [src] }}>
        <ThreeCanvas width={width} height={height} gl={{ toneMapping: THREE.NoToneMapping }} linear flat>
          <PlateQuad src={src} mode={mode} push={push} pan={pan} />
        </ThreeCanvas>
      </Preload>
    </AbsoluteFill>
  );
};
