import { useEffect, useRef } from "react";
import {
  AdaptiveDpr,
  OrbitControls,
  Preload,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

const MODEL_URL = "/acquisition-engine.glb";

function EngineModel() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const runningActions = Object.values(actions).filter(Boolean);

    runningActions.forEach((action) => {
      action?.reset();
      action?.setLoop(THREE.LoopRepeat, Infinity);
      action?.play();
    });

    return () => {
      runningActions.forEach((action) => action?.stop());
    };
  }, [actions]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function EngineLighting() {
  return (
    <>
      <ambientLight intensity={0.18} color="#9ba8b6" />

      <hemisphereLight args={["#8da0ba", "#080604", 0.45]} />

      <directionalLight
        position={[-8, 14, 14]}
        intensity={2.2}
        color="#e5b476"
      />

      <pointLight
        position={[-7, 5, 7]}
        intensity={75}
        distance={28}
        decay={2}
        color="#e9a45c"
      />

      <pointLight
        position={[7, 5, 5]}
        intensity={55}
        distance={28}
        decay={2}
        color="#82bce4"
      />

      <spotLight
        position={[0, 14, 8]}
        angle={0.7}
        penumbra={0.8}
        intensity={80}
        distance={45}
        color="#d9c6aa"
      />
    </>
  );
}

export default function EngineScene() {
  return (
    <Canvas
      className="engine-canvas"
      dpr={[1, 1.65]}
      camera={{
        position: [-9.5, 5.4, 17.5],
        fov: 42,
        near: 0.1,
        far: 180,
      }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
    >
      <color attach="background" args={["#050608"]} />

      <fog attach="fog" args={["#050608", 28, 82]} />

      <EngineLighting />

      <EngineModel />

      <OrbitControls
        makeDefault
        target={[0.5, 3.0, 0]}
        enableDamping
        dampingFactor={0.055}
        enablePan={false}
        minDistance={10}
        maxDistance={46}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.62}
      />

      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
