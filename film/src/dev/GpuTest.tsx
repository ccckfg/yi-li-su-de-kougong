import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const Probe: React.FC<{ onInfo: (s: string) => void }> = ({ onInfo }) => {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const ctx = gl.getContext();
    const ext = ctx.getExtension("WEBGL_debug_renderer_info");
    const r = ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER);
    onInfo(String(r) + " | webgl2=" + (typeof WebGL2RenderingContext !== "undefined" && ctx instanceof WebGL2RenderingContext));
    console.log("GPU_RENDERER:", r);
  }, [gl, onInfo]);
  return null;
};

export const GpuTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [info, setInfo] = useState("probing...");
  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      <ThreeCanvas width={width} height={height}>
        <Probe onInfo={setInfo} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <mesh rotation={[0.4, frame * 0.05, 0]}>
          <torusKnotGeometry args={[1, 0.35, 512, 64]} />
          <meshStandardMaterial color="#d8b25a" metalness={0.8} roughness={0.25} />
        </mesh>
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 40, top: 40, color: "white", fontSize: 28, fontFamily: "monospace" }}>{info}</div>
    </AbsoluteFill>
  );
};
