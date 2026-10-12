// ---------------------------------------------------------------- fountain pen
/** Gold nib: shield outline tapering to the tipping, bent around the feed, slit + breather hole. */
function makeNibGeometry(): THREE.BufferGeometry {
  const L = 0.0165; // tip (y=0) .. shoulder (y=L)
  const sh = new THREE.Shape();
  sh.moveTo(0, 0);
  sh.bezierCurveTo(0.0009, 0.0035, 0.0026, 0.0085, 0.0031, 0.0125);
  sh.lineTo(0.0032, L);
  sh.lineTo(-0.0032, L);
  sh.lineTo(-0.0031, 0.0125);
  sh.bezierCurveTo(-0.0026, 0.0085, -0.0009, 0.0035, 0, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.00028, bevelEnabled: false, curveSegments: 24, steps: 1 });
  const p = g.attributes.position;
  const R = 0.0042;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    // bend across the width (cylinder around the pen axis) and lift the tip slightly
    const ang = x / R;
    const rr = R - z;
    p.setXYZ(i, Math.sin(ang) * rr, y, R - Math.cos(ang) * rr - (1 - y / L) * 0.0006);
  }
  g.computeVertexNormals();
  return g;
}

export const Pen: React.FC<{ position: [number, number, number]; rotation: [number, number, number] }> = ({ position, rotation }) => {
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#0a0a0b", roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }), []);
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#e2bd72", metalness: 1, roughness: 0.17 }), []);
  const steel = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d8d4cc", metalness: 1, roughness: 0.2 }), []);
  const feed = useMemo(() => new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.55 }), []);
  const nibGeo = useMemo(makeNibGeometry, []);
  // local frame: pen axis along +y, nib tip at the origin
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={nibGeo} material={gold} castShadow />
      {/* slit and breather hole */}
      <mesh position={[0, 0.0045, 0.00042]}>
        <boxGeometry args={[0.00012, 0.009, 0.0004]} />
        <meshBasicMaterial color="#120d06" />
      </mesh>
      <mesh position={[0, 0.0092, 0.0004]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.00055, 0.00055, 0.0005, 16]} />
        <meshBasicMaterial color="#120d06" />
      </mesh>
      {/* tipping */}
      <mesh position={[0, 0.0003, 0.0002]}>
        <sphereGeometry args={[0.00034, 12, 8]} />
        <meshPhysicalMaterial color="#9a978f" metalness={1} roughness={0.25} />
      </mesh>
      {/* feed under the nib */}
      <mesh position={[0, 0.0105, -0.0012]} material={feed}>
        <cylinderGeometry args={[0.0021, 0.0014, 0.014, 16, 1, false, 0, Math.PI]} />
      </mesh>
      {/* grip section, ring, barrel */}
      <mesh position={[0, 0.0235, 0.0005]} material={black} castShadow>
        <cylinderGeometry args={[0.0051, 0.0042, 0.016, 40]} />
      </mesh>
      <mesh position={[0, 0.0322, 0.0005]} material={steel} castShadow>
        <cylinderGeometry args={[0.0056, 0.0056, 0.0018, 40]} />
      </mesh>
      <mesh position={[0, 0.074, 0.0005]} material={black} castShadow>
        <cylinderGeometry args={[0.0057, 0.0055, 0.082, 40]} />
      </mesh>
      <mesh position={[0, 0.118, 0.0005]} material={black} castShadow>
        <sphereGeometry args={[0.0055, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
};

