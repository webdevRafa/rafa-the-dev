import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Loader, OrbitControls, useGLTF } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import type {
  Light,
  Material,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Object3D,
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

type SwayTarget = {
  object: Object3D;
  baseX: number;
  baseY: number;
  baseZ: number;
  phase: number;
};

type TrunkSwayTarget = SwayTarget & {
  bendFactor: number;
  treePhase: number;
  basePosX: number;
  basePosY: number;
  basePosZ: number;
};

type CanopySwayTarget = SwayTarget & {
  treePhase: number;
  basePosX: number;
  basePosY: number;
  basePosZ: number;
};

function IslandWorld() {
  const gltf = useGLTF(MODEL_URL);
  const { set, size } = useThree();
  const palmRoots = useRef<SwayTarget[]>([]);
  const palmTrunks = useRef<TrunkSwayTarget[]>([]);
  const palmCrowns = useRef<CanopySwayTarget[]>([]);
  const palmLeaves = useRef<CanopySwayTarget[]>([]);

  useEffect(() => {
    palmRoots.current = [];
    palmTrunks.current = [];
    palmCrowns.current = [];
    palmLeaves.current = [];

    let treeIndex = 0;
    let trunkIndex = 0;
    let crownIndex = 0;
    let leafIndex = 0;
    const rootPhase = new Map<Object3D, number>();

    // The GLB was exported with Blender lights. Hide them so they do not stack
    // with the intentional React Three Fiber lighting below.
    gltf.scene.traverse((child) => {
      const maybeLight = child as Light;

      if (maybeLight.isLight) {
        maybeLight.visible = false;
        return;
      }

      // Each palm has a root object. Give every tree its own timing so the
      // island does not look mechanically synchronized.
      if (child.name.startsWith("PalmTree_Root")) {
        const phase = treeIndex * 1.13;
        rootPhase.set(child, phase);

        palmRoots.current.push({
          object: child,
          baseX: child.rotation.x,
          baseY: child.rotation.y,
          baseZ: child.rotation.z,
          phase,
        });
        treeIndex += 1;
      }

      // The Blender generator made the trunk from seven separate cylinder
      // segments. Rotating those segments only slightly was hard to see, so
      // we now BOTH tilt and laterally offset them. The upper pieces move
      // farther than the lower pieces, creating a clearly visible bend.
      if (child.name.startsWith("PalmTrunk_")) {
        const match = child.name.match(/PalmTrunk_(\d+)/);
        const segmentNumber = match ? Number(match[1]) : 1;
        const bendFactor = Math.min(Math.max(segmentNumber / 7, 0.12), 1);
        const treePhase = child.parent
          ? rootPhase.get(child.parent) ?? trunkIndex * 0.31
          : trunkIndex * 0.31;

        palmTrunks.current.push({
          object: child,
          baseX: child.rotation.x,
          baseY: child.rotation.y,
          baseZ: child.rotation.z,
          phase: trunkIndex * 0.19,
          treePhase,
          bendFactor,
          basePosX: child.position.x,
          basePosY: child.position.y,
          basePosZ: child.position.z,
        });
        trunkIndex += 1;
      }

      if (child.name.startsWith("Palm_Crown")) {
        const treePhase = child.parent
          ? rootPhase.get(child.parent) ?? crownIndex * 1.13
          : crownIndex * 1.13;

        palmCrowns.current.push({
          object: child,
          baseX: child.rotation.x,
          baseY: child.rotation.y,
          baseZ: child.rotation.z,
          phase: crownIndex * 0.41,
          treePhase,
          basePosX: child.position.x,
          basePosY: child.position.y,
          basePosZ: child.position.z,
        });
        crownIndex += 1;
      }

      if (child.name.startsWith("PalmLeaf")) {
        const treePhase = child.parent
          ? rootPhase.get(child.parent) ?? leafIndex * 0.37
          : leafIndex * 0.37;

        palmLeaves.current.push({
          object: child,
          baseX: child.rotation.x,
          baseY: child.rotation.y,
          baseZ: child.rotation.z,
          phase: leafIndex * 0.37,
          treePhase,
          basePosX: child.position.x,
          basePosY: child.position.y,
          basePosZ: child.position.z,
        });
        leafIndex += 1;
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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // A broad wind pulse shared by each tree, plus a smaller second wave.
    // This makes the trunks visibly travel left/right instead of merely
    // rotating by a couple of degrees.
    palmRoots.current.forEach(({ object, baseX, baseY, baseZ, phase }) => {
      const wind = Math.sin(t * 0.62 + phase);
      const secondary = Math.sin(t * 1.18 + phase * 1.7) * 0.18;
      const sway = wind + secondary;

      object.rotation.x = baseX + Math.cos(t * 0.48 + phase) * 0.035;
      object.rotation.y = baseY + Math.sin(t * 0.31 + phase) * 0.018;
      object.rotation.z = baseZ + sway * 0.075;
    });

    palmTrunks.current.forEach(
      ({
        object,
        baseX,
        baseY,
        baseZ,
        phase,
        treePhase,
        bendFactor,
        basePosX,
        basePosY,
        basePosZ,
      }) => {
        const wind = Math.sin(t * 0.62 + treePhase);
        const secondary = Math.sin(t * 1.18 + treePhase * 1.7) * 0.18;
        const sway = wind + secondary;

        // Upper trunk pieces physically move farther sideways.
        // 0.48 means the top segment can shift roughly half a Blender unit.
        const lateralOffset = sway * 0.48 * Math.pow(bendFactor, 1.65);
        const depthOffset =
          Math.cos(t * 0.52 + treePhase) * 0.07 * Math.pow(bendFactor, 1.4);

        object.position.x = basePosX + lateralOffset;
        object.position.y = basePosY + depthOffset;
        object.position.z = basePosZ;

        // Stronger visible tilt toward the direction of travel.
        object.rotation.x =
          baseX + Math.sin(t * 0.76 + phase) * 0.045 * bendFactor;
        object.rotation.y =
          baseY + Math.sin(t * 0.43 + treePhase) * 0.025 * bendFactor;
        object.rotation.z = baseZ - sway * 0.18 * bendFactor;
      }
    );

    // Keep the crown attached visually to the moving top of the trunk.
    palmCrowns.current.forEach(
      ({
        object,
        baseX,
        baseY,
        baseZ,
        treePhase,
        basePosX,
        basePosY,
        basePosZ,
      }) => {
        const wind = Math.sin(t * 0.62 + treePhase);
        const secondary = Math.sin(t * 1.18 + treePhase * 1.7) * 0.18;
        const sway = wind + secondary;

        object.position.x = basePosX + sway * 0.5;
        object.position.y = basePosY + Math.cos(t * 0.52 + treePhase) * 0.075;
        object.position.z = basePosZ;
        object.rotation.x = baseX + Math.cos(t * 0.9 + treePhase) * 0.025;
        object.rotation.y = baseY;
        object.rotation.z = baseZ - sway * 0.11;
      }
    );

    // Fronds follow the canopy left/right and flutter independently.
    palmLeaves.current.forEach(
      ({
        object,
        baseX,
        baseY,
        baseZ,
        phase,
        treePhase,
        basePosX,
        basePosY,
        basePosZ,
      }) => {
        const wind = Math.sin(t * 0.62 + treePhase);
        const secondary = Math.sin(t * 1.18 + treePhase * 1.7) * 0.18;
        const sway = wind + secondary;

        object.position.x = basePosX + sway * 0.5;
        object.position.y = basePosY + Math.cos(t * 0.52 + treePhase) * 0.075;
        object.position.z = basePosZ;

        object.rotation.x = baseX + Math.sin(t * 1.45 + phase) * 0.065;
        object.rotation.y = baseY + Math.sin(t * 1.1 + phase * 1.3) * 0.035;
        object.rotation.z =
          baseZ - sway * 0.09 + Math.sin(t * 1.75 + phase) * 0.05;
      }
    );
  });

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
