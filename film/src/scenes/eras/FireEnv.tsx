import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

/** A dark room with the fire low in front: a reflection environment for the bronze. */
export const FireEnv: React.FC<{ strength: number }> = ({ strength }) => {
  const gl = useThree((st) => st.gl);
  const scene = useThree((st) => st.scene);
  const env = useMemo(() => {
    const es = new THREE.Scene();
    es.background = new THREE.Color("#060302");
    const fire = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.1, 0.25), side: THREE.DoubleSide }));
    fire.position.set(0, -1.4, 1.2);
    fire.lookAt(0, 0, 0);
    es.add(fire);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(6, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.14, 0.04), side: THREE.DoubleSide }));
    glow.position.set(0, -0.4, -2);
    glow.lookAt(0, 0, 0);
    es.add(glow);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.05, 0.06, 0.09), side: THREE.DoubleSide }));
    sky.position.set(0, 3, 0);
    sky.lookAt(0, 0, 0);
    es.add(sky);
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromScene(es, 0.02);
    pm.dispose();
    return rt.texture;
  }, [gl]);
  scene.environment = env;
  scene.environmentIntensity = strength;
  return null;
};
