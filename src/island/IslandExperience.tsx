import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Loader, OrbitControls, useGLTF } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import type {
  Light,
  Material,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from "three";
import { ArrowLeft, MousePointer2, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import "./IslandExperience.css";

const MODEL_URL = "/island.glb";

function tuneMaterial(material: Material) {
  const mat = material as MeshStandardMaterial;

  if (!mat.isMeshStandardMaterial) return;

  const name = mat.name.toLowerCase();

  // Force web-safe tropical colors so the GLB cannot wash out under Three.js lighting.
  if (name.includes("sand")) {
    mat.color.set("#d8b878");
    mat.roughness = 0.95;
    mat.metalness = 0;
  } else if (name.includes("ocean")) {
    mat.color.set("#147fa6");
    mat.roughness = 0.38;
    mat.metalness = 0;
  } else if (name.includes("foam")) {
    mat.color.set("#eaf7f5");
    mat.roughness = 0.75;
    mat.metalness = 0;
  } else if (name.includes("trunk")) {
    mat.color.set("#6f4324");
    mat.roughness = 0.9;
    mat.metalness = 0;
  } else if (name.includes("leaf")) {
    mat.color.set("#1c6f3a");
    mat.roughness = 0.82;
    mat.metalness = 0;
  } else if (name.includes("rock")) {
    mat.color.set("#666b68");
    mat.roughness = 0.95;
    mat.metalness = 0;
  }

  mat.toneMapped = true;
  mat.needsUpdate = true;
}

function IslandWorld() {
  const gltf = useGLTF(MODEL_URL);
  const { set, size } = useThree();

  useEffect(() => {
    // The GLB was exported with Blender lights. Hide them so they do not stack
    // with the intentional React Three Fiber lighting below.
    gltf.scene.traverse((child) => {
      const maybeLight = child as Light;

      if (maybeLight.isLight) {
        maybeLight.visible = false;
        return;
      }

      const mesh = child as Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach(tuneMaterial);
    });
  }, [gltf.scene]);

  useEffect(() => {
    // Prefer the first-person Blender camera when it exists.
    const exportedCamera = gltf.cameras.find(
      (camera) =>
        camera.name === "IslandCamera" || camera.type === "PerspectiveCamera"
    ) as PerspectiveCamera | undefined;

    if (!exportedCamera?.isPerspectiveCamera) return;

    exportedCamera.aspect = size.width / Math.max(size.height, 1);
    exportedCamera.near = 0.05;
    exportedCamera.far = 2000;
    exportedCamera.updateProjectionMatrix();

    set({ camera: exportedCamera });
  }, [gltf.cameras, set, size.height, size.width]);

  return <primitive object={gltf.scene} />;
}

function IslandExperience() {
  return (
    <main className="island-experience">
      <Canvas
        className="island-experience__canvas"
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.2, 9], fov: 50, near: 0.05, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.72;
        }}
      >
        {/* Keep the sky simple for now so we know the scene colors are correct. */}
        <color attach="background" args={["#78bfe3"]} />

        <Suspense fallback={null}>
          {/* Softer outdoor lighting. The previous values were blowing the GLB out. */}
          <hemisphereLight args={["#d9efff", "#7b664b", 0.55]} />

          <directionalLight
            castShadow
            color="#fff1d2"
            position={[12, 18, -10]}
            intensity={1.15}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.1}
            shadow-camera-far={120}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
          />

          <IslandWorld />

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.055}
            enablePan={false}
            minDistance={0.6}
            maxDistance={95}
            maxPolarAngle={Math.PI * 0.52}
          />
        </Suspense>
      </Canvas>

      <div className="island-experience__vignette" aria-hidden="true" />

      <section
        className="island-experience__hud"
        aria-label="Island 3D experience"
      >
        <p className="island-experience__eyebrow">
          <Waves size={15} aria-hidden="true" /> 3D EXPERIENCE / ISLAND
        </p>

        <h1>Island escape.</h1>

        <p>
          A Blender-built tropical scene rendered live with React Three Fiber.
          Drag to look around and use the mouse wheel to move closer or farther
          away.
        </p>
      </section>

      <div className="island-experience__controls" aria-hidden="true">
        <MousePointer2 size={16} />
        <span>Drag to explore · Scroll to zoom</span>
      </div>

      <Link className="island-experience__back" to="/#top">
        <ArrowLeft size={16} aria-hidden="true" />
        Back home
      </Link>

      <Loader
        containerStyles={{ background: "#071d27" }}
        innerStyles={{
          width: "220px",
          background: "rgba(255,255,255,.12)",
        }}
        barStyles={{
          height: "3px",
          background: "#f8d98a",
        }}
        dataStyles={{
          color: "#ffffff",
          fontSize: "12px",
          letterSpacing: ".08em",
        }}
        dataInterpolation={(progress) =>
          `LOADING ISLAND ${progress.toFixed(0)}%`
        }
      />
    </main>
  );
}

useGLTF.preload(MODEL_URL);

export default IslandExperience;
