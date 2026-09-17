import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import "./PortraitHero.css";

const MODEL_URL = "/models/rafa-portrait-25d.glb";

type LayerSet = {
  background: THREE.Object3D | null;
  torso: THREE.Object3D | null;
  face: THREE.Object3D | null;
};

type LayerBases = {
  background: THREE.Vector3 | null;
  torso: THREE.Vector3 | null;
  face: THREE.Vector3 | null;
};

function PortraitModel() {
  const root = useRef<THREE.Group>(null);
  const pointerTarget = useRef({ x: 0, y: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const initializedScale = useRef(false);

  const reduceMotion = useReducedMotion();
  const { scene } = useGLTF(MODEL_URL);
  const { viewport } = useThree();

  /*
   * Clone the scene so this component can move the GLB objects independently.
   * Materials are NOT modified. The portrait renders exactly as exported.
   */
  const model = useMemo(() => scene.clone(true), [scene]);

  const layers = useMemo<LayerSet>(
    () => ({
      background: model.getObjectByName("Portrait_BG") ?? null,
      torso: model.getObjectByName("Portrait_Torso") ?? null,
      face: model.getObjectByName("Portrait_Face") ?? null,
    }),
    [model]
  );

  const layerBases = useMemo<LayerBases>(
    () => ({
      background: layers.background?.position.clone() ?? null,
      torso: layers.torso?.position.clone() ?? null,
      face: layers.face?.position.clone() ?? null,
    }),
    [layers]
  );

  const modelMetrics = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    return {
      width: Math.max(size.x, 0.0001),
      height: Math.max(size.y, 0.0001),
    };
  }, [model]);

  /*
   * Automatically fit the complete portrait inside the available hero column.
   */
  const fitScale = useMemo(() => {
    const usableWidth = viewport.width * 0.86;
    const usableHeight = viewport.height * 0.88;

    return Math.min(
      usableWidth / modelMetrics.width,
      usableHeight / modelMetrics.height
    );
  }, [
    modelMetrics.height,
    modelMetrics.width,
    viewport.height,
    viewport.width,
  ]);

  useEffect(() => {
    const missing = Object.entries(layers)
      .filter(([, object]) => !object)
      .map(([name]) => name);

    if (missing.length > 0) {
      console.warn(
        `Portrait GLB is missing expected layer(s): ${missing.join(", ")}`
      );
    }
  }, [layers]);

  /*
   * Mouse parallax across the whole browser window.
   */
  useEffect(() => {
    if (reduceMotion) {
      pointerTarget.current = { x: 0, y: 0 };
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      pointerTarget.current.x =
        THREE.MathUtils.clamp(event.clientX / window.innerWidth, 0, 1) * 2 - 1;

      pointerTarget.current.y = -(
        THREE.MathUtils.clamp(event.clientY / window.innerHeight, 0, 1) * 2 -
        1
      );
    };

    const resetPointer = () => {
      pointerTarget.current = { x: 0, y: 0 };
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);
    document.documentElement.addEventListener("mouseleave", resetPointer);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", resetPointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
    };
  }, [reduceMotion]);

  useFrame((_state, delta) => {
    const group = root.current;
    if (!group) return;

    const pointerEase = 1 - Math.exp(-delta * 7);
    const motionEase = 1 - Math.exp(-delta * 5);

    pointer.current.x = THREE.MathUtils.lerp(
      pointer.current.x,
      reduceMotion ? 0 : pointerTarget.current.x,
      pointerEase
    );

    pointer.current.y = THREE.MathUtils.lerp(
      pointer.current.y,
      reduceMotion ? 0 : pointerTarget.current.y,
      pointerEase
    );

    const px = pointer.current.x;
    const py = pointer.current.y;

    /*
     * Very small whole-portrait rotation.
     * No scroll animation and no opacity/material animation.
     */
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      reduceMotion ? 0 : px * 0.025,
      motionEase
    );

    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      reduceMotion ? 0 : -py * 0.012,
      motionEase
    );

    /*
     * Keep the complete image fitted at all times.
     */
    if (!initializedScale.current) {
      group.scale.setScalar(fitScale);
      initializedScale.current = true;
    } else {
      const scale = THREE.MathUtils.lerp(group.scale.x, fitScale, motionEase);

      group.scale.setScalar(scale);
    }

    /*
     * Independent 2.5D layer movement.
     * Background moves least, torso moves a little more, face moves most.
     * No material opacity or brightness is changed.
     */
    const backgroundBase = layerBases.background;

    if (layers.background && backgroundBase) {
      layers.background.position.x = THREE.MathUtils.lerp(
        layers.background.position.x,
        backgroundBase.x + px * 0.008,
        motionEase
      );

      layers.background.position.y = THREE.MathUtils.lerp(
        layers.background.position.y,
        backgroundBase.y + py * 0.004,
        motionEase
      );
    }

    const torsoBase = layerBases.torso;

    if (layers.torso && torsoBase) {
      layers.torso.position.x = THREE.MathUtils.lerp(
        layers.torso.position.x,
        torsoBase.x + px * 0.026,
        motionEase
      );

      layers.torso.position.y = THREE.MathUtils.lerp(
        layers.torso.position.y,
        torsoBase.y + py * 0.012,
        motionEase
      );
    }

    const faceBase = layerBases.face;

    if (layers.face && faceBase) {
      layers.face.position.x = THREE.MathUtils.lerp(
        layers.face.position.x,
        faceBase.x + px * 0.055,
        motionEase
      );

      layers.face.position.y = THREE.MathUtils.lerp(
        layers.face.position.y,
        faceBase.y + py * 0.025,
        motionEase
      );
    }
  });

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  );
}

function PortraitHero() {
  return (
    <div className="portrait-hero" aria-hidden="true">
      <Canvas
        camera={{
          position: [0, 0, 8],
          fov: 30,
          near: 0.1,
          far: 50,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        shadows={false}
      >
        <Suspense fallback={null}>
          <PortraitModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);

export default PortraitHero;
