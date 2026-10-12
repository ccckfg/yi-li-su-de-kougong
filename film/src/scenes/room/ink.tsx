import React, { useMemo } from "react";
import * as THREE from "three";

// Fresh ink blooming into paper fibres, as a LIT material so the wet core catches the lamp:
// fibrous noisy edge, darker rim where pigment piles up, glossy wet centre drying matte toward the edge.
const GLSL_NOISE = /* glsl */ `
float ihash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float inoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(ihash(i),ihash(i+vec2(1,0)),u.x), mix(ihash(i+vec2(0,1)),ihash(i+vec2(1,1)),u.x), u.y); }
float ifbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*inoise(p); p*=2.03; a*=0.5; } return v; }
`;

export const InkSpot: React.FC<{ position: [number, number, number]; t: number; size?: number }> = ({ position, t, size = 0.012 }) => {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: "#020308", roughness: 0.1, clearcoat: 0.25, clearcoatRoughness: 0.05, envMapIntensity: 0.1, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uT = { value: (m.userData.t as number) ?? 0 };
      m.userData.shader = sh;
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vInkUv;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvInkUv = uv;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uT;\nvarying vec2 vInkUv;\n" + GLSL_NOISE)
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          vec2 ip = vInkUv * 2.0 - 1.0;
          float ir = length(ip);
          float iang = atan(ip.y, ip.x);
          float R = 0.08 + 0.62 * (1.0 - exp(-uT * 2.6)) + 0.08 * uT;
          float fib = ifbm(vec2(ip.x * 18.0, ip.y * 5.0)) * 0.22 + ifbm(ip * 9.0) * 0.12;
          float edge = R * (0.86 + fib + 0.05 * sin(iang * 7.0 + 1.3));
          float inside = smoothstep(edge, edge - 0.04, ir);
          float rim = smoothstep(edge - 0.14, edge - 0.02, ir) * inside;
          // capillary fringe: thin feathers of diluted ink running out along the paper fibres
          float feathers = smoothstep(0.45, 0.85, ifbm(vec2(ip.x * 34.0, ip.y * 9.0) + 3.7));
          float fringe = smoothstep(edge + 0.1, edge, ir) * (1.0 - inside) * feathers;
          vec3 inkCol = mix(vec3(0.006, 0.008, 0.022), vec3(0.002, 0.002, 0.006), rim);
          diffuseColor.rgb = mix(vec3(0.03, 0.045, 0.1), inkCol, inside);
          diffuseColor.a = max(inside, fringe * 0.42);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
          {
            vec2 rp = vInkUv * 2.0 - 1.0;
            float wet = smoothstep(0.75, 0.0, length(rp) / max(0.1, 0.1 + 0.62 * (1.0 - exp(-uT * 2.6))));
            roughnessFactor = mix(0.6, 0.04, wet * (1.0 - min(1.0, uT * 0.35)));
          }`,
        );
    };
    return m;
  }, []);
  mat.userData.t = t;
  const sh = mat.userData.shader as { uniforms: { uT: { value: number } } } | undefined;
  if (sh) sh.uniforms.uT.value = t;
  // first compile happens after this render: keep the uniform in sync via onBeforeRender as well
  mat.onBeforeRender = () => {
    const s2 = mat.userData.shader as { uniforms: { uT: { value: number } } } | undefined;
    if (s2) s2.uniforms.uT.value = mat.userData.t;
  };
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} material={mat} renderOrder={2}>
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};
