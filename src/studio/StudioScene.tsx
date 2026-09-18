import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  PerspectiveCamera,
  SRGBColorSpace,
} from "three";
import {
  StudioController,
  cloneStudioScene,
  configureStudioShadows,
} from "./studio-controller";
import type { StudioManifest, StudioOptions } from "./studio-controller";

type Props = {
  url: string;
  manifest: StudioManifest;
  compact: boolean;
  reducedMotion: boolean;
  shadows: boolean;
  exposure: number;
  callbacks: StudioOptions;
  onReady: (controller: StudioController | null) => void;
  onError: (message: string) => void;
};

/** The model is already in glTF Y-up meters: do not center, scale, or rotate it. */
export default function StudioScene({
  url,
  manifest,
  compact,
  reducedMotion,
  shadows,
  exposure,
  callbacks,
  onReady,
  onError,
}: Props) {
  const { scene, animations } = useGLTF(url);
  const model = useMemo(() => cloneStudioScene(scene), [scene]);
  const { camera, gl } = useThree();
  const controller = useRef<StudioController | null>(null);
  const presentation = useRef({ compact, reducedMotion });

  // No lighting/material opacity modification. The GLB supplies its own lights.
  useLayoutEffect(() => {
    gl.toneMapping = ACESFilmicToneMapping;
    gl.outputColorSpace = SRGBColorSpace;
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);

  useLayoutEffect(() => {
    configureStudioShadows(model, shadows);

    // WebGLRenderer and WebGPURenderer do not expose every renderer detail
    // through exactly the same runtime surface. Only request a shadow-map
    // refresh when that property exists.
    const renderer = gl as typeof gl & {
      shadowMap?: { needsUpdate?: boolean };
    };

    if (renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
  }, [model, shadows, gl]);

  // Keep settings current before the controller's mount effect; resize must not
  // create a new controller or reset a visitor's room during a transition.
  useLayoutEffect(() => {
    presentation.current = { compact, reducedMotion };
    controller.current?.setPresentation(compact, reducedMotion);
  }, [compact, reducedMotion]);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) {
      onError("Studio requires a perspective camera.");
      return;
    }
    let active: StudioController;
    try {
      active = new StudioController(model, camera, animations, manifest, {
        ...callbacks,
        mobile: presentation.current.compact,
        reducedMotion: presentation.current.reducedMotion,
      });
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to initialize the studio."
      );
      return;
    }
    controller.current = active;
    onReady(active);
    return () => {
      onReady(null);
      controller.current = null;
      active.dispose();
    };
  }, [model, camera, animations, manifest, callbacks, onReady, onError]);

  useEffect(() => {
    const element = gl.domElement;
    const contextLost = (event: Event) => {
      event.preventDefault();
      onError(
        "The browser lost the graphics context. Reload or try the lightweight scene."
      );
    };
    element.addEventListener("webglcontextlost", contextLost);
    return () => element.removeEventListener("webglcontextlost", contextLost);
  }, [gl, onError]);

  // Native pointer capture keeps finger drags separate from door taps. The
  // listener is on this canvas only: HTML buttons and text remain normal UI.
  useEffect(() => {
    const element = gl.domElement;
    type Drag = {
      id: number;
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      moved: boolean;
    };
    let drag: Drag | null = null;
    let lookX = 0;
    let lookY = 0;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || controller.current?.busy)
        return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        baseX: lookX,
        baseY: lookY,
        moved: false,
      };
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        /* Pointer ended. */
      }
    };
    const move = (event: PointerEvent) => {
      const active = controller.current;
      if (!active || active.busy) return;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (drag?.id === event.pointerId) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (Math.hypot(dx, dy) > 8) drag.moved = true;
        if (drag.moved) {
          lookX = clamp(drag.baseX + (dx / rect.width) * 2.4);
          lookY = clamp(drag.baseY + (dy / rect.height) * 1.6);
          active.lookAround(lookX, lookY);
        }
      } else if (
        event.pointerType === "mouse" &&
        !presentation.current.compact
      ) {
        lookX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1);
        lookY = clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1));
        active.lookAround(lookX, lookY);
      }
    };
    const up = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const tapped = !drag.moved;
      drag = null;
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId);
      if (tapped) {
        try {
          if (
            controller.current?.pick(
              event.clientX,
              event.clientY,
              element.getBoundingClientRect()
            )
          ) {
            lookX = lookY = 0;
          }
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : "The studio interaction failed."
          );
        }
      }
    };
    const cancel = () => {
      drag = null;
    };
    const leave = () => {
      if (!drag && !presentation.current.compact) {
        lookX = lookY = 0;
        controller.current?.lookAround(0, 0);
      }
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", cancel);
    element.addEventListener("lostpointercapture", cancel);
    element.addEventListener("pointerleave", leave);
    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", cancel);
      element.removeEventListener("lostpointercapture", cancel);
      element.removeEventListener("pointerleave", leave);
    };
  }, [gl, onError]);

  useFrame((_state, delta) => {
    if (document.hidden || !controller.current) return;
    try {
      controller.current.update(delta);
    } catch (error) {
      const failed = controller.current;
      controller.current = null;
      failed.dispose();
      onError(
        error instanceof Error ? error.message : "The studio animation stopped."
      );
    }
  });

  return (
    <>
      <color
        attach="background"
        args={[manifest.render?.background ?? "#07090b"]}
      />
      <ambientLight intensity={manifest.render?.ambientIntensity ?? 0.22} />
      <primitive object={model} dispose={null} />
    </>
  );
}
