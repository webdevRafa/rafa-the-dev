import { useEffect, useMemo, useRef } from 'react'
import { AdaptiveDpr, Preload, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ODYSSEY_STAGES, type OdysseyStage } from './useOdysseyProgression.ts'

interface SpaceOdysseySceneProps {
  currentStage: OdysseyStage
  reduceMotion: boolean
  onReady: () => void
}

interface CameraTransition {
  from: number
  to: number
  elapsed: number
  duration: number
}

const easeInOutQuint = (value: number) => (
  value < 0.5
    ? 16 * value ** 5
    : 1 - ((-2 * value + 2) ** 5) / 2
)

const EMISSIVE_LEVELS: Record<string, number> = {
  Astronaut_TelemetryGlow: 1.25,
  Astronaut_ThrusterPlume: 1.15,
  Sky_Starfield: 1.2,
  Stage2_MeteorCores: 1.5,
  Stage2_MeteorTails: 1.05,
  Stage4_NebulaCyan: 0.68,
  Stage4_NebulaMagenta: 0.68,
  Stage5_AethelgardAtmosphere: 0.72,
  Stage6_BeaconRubyLight: 1.4,
  Stage6_BioluminescentCrystals: 1.15,
}

function SpaceOdysseyModel({ currentStage, reduceMotion, onReady }: SpaceOdysseySceneProps) {
  const { scene, animations } = useGLTF('/space_odyssey.glb')
  const currentTime = useRef(ODYSSEY_STAGES[1].targetTime)
  const transition = useRef<CameraTransition>({ from: 0, to: 0, elapsed: 0, duration: 0 })
  const readyReported = useRef(false)
  const astronaut = useRef<THREE.Object3D | null>(null)
  const starfield = useRef<THREE.Object3D | null>(null)
  const asteroidBelt = useRef<THREE.Object3D | null>(null)
  const astronautBasePosition = useRef(new THREE.Vector3())
  const astronautBaseQuaternion = useRef(new THREE.Quaternion())
  const targetAstronautQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const pointerQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const pointerEuler = useMemo(() => new THREE.Euler(), [])
  const sampledPosition = useMemo(() => new Float32Array(3), [])
  const sampledQuaternion = useMemo(() => new Float32Array(4), [])

  const cameraTracks = useMemo(() => {
    const clip = animations.find((animation) => animation.name === 'FlightCameraAction') ?? animations[0]
    const positionTrack = clip?.tracks.find((track) => track.name === 'FlightCamera.position')
    const quaternionTrack = clip?.tracks.find((track) => track.name === 'FlightCamera.quaternion')

    return {
      position: positionTrack?.InterpolantFactoryMethodLinear(sampledPosition),
      quaternion: quaternionTrack?.InterpolantFactoryMethodLinear(sampledQuaternion),
    }
  }, [animations, sampledPosition, sampledQuaternion])

  useEffect(() => {
    astronaut.current = scene.getObjectByName('Astronaut_Root') ?? null
    starfield.current = scene.getObjectByName('Sky_Starfield') ?? null
    asteroidBelt.current = scene.getObjectByName('Stage2_AsteroidBelt') ?? null

    if (astronaut.current) {
      astronautBasePosition.current.copy(astronaut.current.position)
      astronautBaseQuaternion.current.copy(astronaut.current.quaternion)
    }

    scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight && object.name === 'DistantSun') {
        object.intensity = 2.25
        object.castShadow = false
      }

      if (object instanceof THREE.PointLight && object.name === 'Stage6_BeaconPointLight') {
        object.intensity = 24
        object.distance = 32
        object.decay = 2
        object.castShadow = false
      }

      if (!(object instanceof THREE.Mesh)) return
      object.castShadow = false
      object.receiveShadow = false

      const emissiveLevel = EMISSIVE_LEVELS[object.name]
      if (emissiveLevel === undefined) return

      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        material.toneMapped = object.name.startsWith('Stage4_Nebula')
          || object.name === 'Stage5_AethelgardAtmosphere'
        if (material instanceof THREE.MeshStandardMaterial) material.emissiveIntensity = emissiveLevel
      })
    })
  }, [scene])

  useEffect(() => {
    transition.current = {
      from: currentTime.current,
      to: ODYSSEY_STAGES[currentStage].targetTime,
      elapsed: 0,
      duration: reduceMotion ? 0.01 : 3.1,
    }
  }, [currentStage, reduceMotion])

  useEffect(() => {
    if (readyReported.current) return
    readyReported.current = true
    onReady()
  }, [onReady])

  useFrame(({ camera, clock, pointer }, delta) => {
    const activeTransition = transition.current
    activeTransition.elapsed = Math.min(activeTransition.elapsed + delta, activeTransition.duration)
    const progress = activeTransition.duration === 0 ? 1 : activeTransition.elapsed / activeTransition.duration
    currentTime.current = THREE.MathUtils.lerp(activeTransition.from, activeTransition.to, easeInOutQuint(progress))

    const position = cameraTracks.position?.evaluate(currentTime.current)
    const quaternion = cameraTracks.quaternion?.evaluate(currentTime.current)
    if (position) camera.position.fromArray(position)
    if (quaternion) camera.quaternion.fromArray(quaternion).normalize()

    if (!reduceMotion && astronaut.current) {
      pointerEuler.set(-pointer.y * 0.22, pointer.x * 0.3, 0)
      pointerQuaternion.setFromEuler(pointerEuler)
      targetAstronautQuaternion.copy(astronautBaseQuaternion.current).multiply(pointerQuaternion)
      astronaut.current.quaternion.slerp(targetAstronautQuaternion, 1 - Math.exp(-delta * 5.5))
      astronaut.current.position.y = astronautBasePosition.current.y + Math.sin(clock.elapsedTime * 1.35) * 0.045
    }

    if (!reduceMotion && starfield.current) starfield.current.rotation.y += delta * 0.004
    if (!reduceMotion && asteroidBelt.current) asteroidBelt.current.rotation.y += delta * 0.002
  })

  return <primitive object={scene} />
}

export default function SpaceOdysseyScene(props: SpaceOdysseySceneProps) {
  return (
    <Canvas
      className="odyssey-canvas"
      dpr={[1, 1.6]}
      camera={{ fov: 49.43, near: 0.1, far: 1200 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.92,
      }}
    >
      <color attach="background" args={['#01020a']} />
      <ambientLight intensity={0.19} color="#6684bc" />
      <hemisphereLight args={['#7ab6d8', '#08020e', 0.16]} />
      <pointLight
        position={[0, -779, 34]}
        intensity={props.currentStage === 6 ? 78 : 0}
        color="#8adcf1"
        distance={120}
        decay={2}
      />
      <SpaceOdysseyModel {...props} />
      <AdaptiveDpr pixelated />
      <Preload all />
    </Canvas>
  )
}

useGLTF.preload('/space_odyssey.glb')
