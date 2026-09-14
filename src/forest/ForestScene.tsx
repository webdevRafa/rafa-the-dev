import { useEffect, useMemo, useRef } from 'react'
import { AdaptiveDpr, Preload, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ForestZone } from './useForestProgression.ts'
import { FOREST_ZONES } from './useForestProgression.ts'

interface ForestSceneProps {
  currentZone: ForestZone
  reduceMotion: boolean
  onReady: () => void
}

interface CameraTransition {
  from: number
  to: number
  elapsed: number
  duration: number
}

const easeInOutCubic = (value: number) => (
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
)

const INITIAL_CAMERA_TIME = FOREST_ZONES[1].targetTime

function ForestModel({ currentZone, reduceMotion, onReady }: ForestSceneProps) {
  const { scene, animations } = useGLTF('/dark_forest_walkway.glb')
  const currentTime = useRef(INITIAL_CAMERA_TIME)
  const transition = useRef<CameraTransition>({
    from: INITIAL_CAMERA_TIME,
    to: INITIAL_CAMERA_TIME,
    elapsed: 0,
    duration: 0,
  })
  const readyReported = useRef(false)
  const sampledPosition = useMemo(() => new Float32Array(3), [])
  const sampledQuaternion = useMemo(() => new Float32Array(4), [])

  const cameraTracks = useMemo(() => {
    const clip = animations.find((animation) => animation.name === 'WalkCameraAction') ?? animations[0]
    const positionTrack = clip?.tracks.find((track) => track.name.endsWith('.position'))
    const quaternionTrack = clip?.tracks.find((track) => track.name.endsWith('.quaternion'))

    return {
      position: positionTrack?.InterpolantFactoryMethodLinear(sampledPosition),
      quaternion: quaternionTrack?.InterpolantFactoryMethodLinear(sampledQuaternion),
    }
  }, [animations, sampledPosition, sampledQuaternion])

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.PointLight && object.name.startsWith('LanternLight_')) {
        object.intensity = object.name.endsWith('04')
          || object.name.endsWith('05')
          || object.name.endsWith('06')
          || object.name.endsWith('07')
          || object.name.endsWith('08')
          ? 13
          : 16
        object.distance = 14
        object.decay = 2
        object.castShadow = false
        return
      }

      if (object instanceof THREE.DirectionalLight && object.name === 'Moonlight') {
        object.intensity = 0.28
        object.castShadow = false
        return
      }

      if (!(object instanceof THREE.Mesh)) return

      object.castShadow = true
      object.receiveShadow = true

      if (
        object.name.includes('Lantern_Cores')
        || object.name.includes('Sky_Starfield')
        || object.name.includes('Fireflies')
      ) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          material.toneMapped = false

          if (material instanceof THREE.MeshStandardMaterial) {
            if (object.name.includes('Sky_Starfield')) material.emissiveIntensity = 1.4
            if (object.name.includes('Fireflies')) material.emissiveIntensity = 0.9
            if (object.name.includes('Lantern_Cores')) material.emissiveIntensity = 0.58
          }
        })
      }
    })
  }, [scene])

  useEffect(() => {
    transition.current = {
      from: currentTime.current,
      to: FOREST_ZONES[currentZone].targetTime,
      elapsed: 0,
      duration: reduceMotion ? 0.01 : 2.4,
    }
  }, [currentZone, reduceMotion])

  useEffect(() => {
    if (readyReported.current) return
    readyReported.current = true
    onReady()
  }, [onReady])

  useFrame(({ camera, pointer }, delta) => {
    const activeTransition = transition.current
    activeTransition.elapsed = Math.min(activeTransition.elapsed + delta, activeTransition.duration)

    const transitionProgress = activeTransition.duration === 0
      ? 1
      : activeTransition.elapsed / activeTransition.duration
    currentTime.current = THREE.MathUtils.lerp(
      activeTransition.from,
      activeTransition.to,
      easeInOutCubic(transitionProgress),
    )

    const position = cameraTracks.position?.evaluate(currentTime.current)
    const quaternion = cameraTracks.quaternion?.evaluate(currentTime.current)

    if (position) camera.position.fromArray(position)
    if (quaternion) camera.quaternion.fromArray(quaternion).normalize()

    if (!reduceMotion) {
      camera.rotateY(-pointer.x * 0.008)
      camera.rotateX(pointer.y * 0.005)
    }
  })

  return <primitive object={scene} />
}

function ForestAtmosphere({ currentZone }: Pick<ForestSceneProps, 'currentZone'>) {
  const moonIntensity = currentZone === 2 ? 0.82 : 0.66

  return (
    <>
      <fog attach="fog" args={['#02040b', 14, 85]} />
      <ambientLight intensity={0.19} color="#5978a7" />
      <hemisphereLight args={['#496d9c', '#09080b', 0.24]} />
      <directionalLight
        position={[-20, 48, -24]}
        intensity={moonIntensity}
        color="#91baff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={130}
      />
    </>
  )
}

export default function ForestScene(props: ForestSceneProps) {
  return (
    <Canvas
      className="forest-canvas"
      shadows
      dpr={[1, 1.65]}
      camera={{ fov: 49.43, near: 0.1, far: 450 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
    >
      <color attach="background" args={['#02040b']} />
      <ForestAtmosphere currentZone={props.currentZone} />
      <ForestModel {...props} />
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  )
}

useGLTF.preload('/dark_forest_walkway.glb')
