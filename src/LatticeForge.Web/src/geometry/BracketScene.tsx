import { ContactShadows, Grid, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Vector3, type PerspectiveCamera as PerspectiveCameraType } from 'three'
import { BracketGeometry } from './BracketGeometry'
import type { BracketGeometryParameters } from './geometryParameters'
type BracketSceneProps = {
  showGrid: boolean
  viewMode: 'orbit' | 'front' | 'section'
  parameters: BracketGeometryParameters
  onResetReady?: (reset: () => void) => void
}
const CAMERA_POSITIONS: Record<BracketSceneProps['viewMode'], [number, number, number]> = {
  orbit: [150, 108, 178],
  front: [0, 0, 235],
  section: [166, 62, 162],
}
export function BracketScene({ showGrid, viewMode, parameters, onResetReady }: BracketSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const cameraRef = useRef<PerspectiveCameraType | null>(null)
  useEffect(() => {
    const controls = controlsRef.current
    const camera = cameraRef.current
    if (!controls || !camera) return
    camera.position.copy(new Vector3(...CAMERA_POSITIONS[viewMode]))
    controls.target.set(0, 0, 0)
    controls.update()
  }, [viewMode])
  useEffect(() => {
    onResetReady?.(() => {
      const controls = controlsRef.current
      const camera = cameraRef.current
      if (!controls || !camera) return
      camera.position.copy(new Vector3(...CAMERA_POSITIONS.orbit))
      controls.target.set(0, 0, 0)
      controls.update()
    })
  }, [onResetReady])
  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault fov={42} near={0.1} far={1000} position={CAMERA_POSITIONS.orbit} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={105}
        maxDistance={380}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
      />
      <ambientLight intensity={0.46} color="#cfe9ed" />
      <directionalLight castShadow intensity={2.2} color="#f4ffff" position={[100, 160, 150]} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002} />
      <spotLight castShadow intensity={18} angle={0.42} penumbra={0.8} position={[-120, 160, 110]} color="#4fd8e0" shadow-mapSize={[1024, 1024]} />
      <pointLight intensity={2.5} distance={280} color="#f2ac63" position={[140, -80, 100]} />
      <BracketGeometry parameters={parameters} />
      <ContactShadows opacity={0.42} scale={310} blur={2.6} far={180} resolution={512} color="#000000" position={[0, -48, 0]} />
      {showGrid && <Grid args={[420, 420]} cellSize={10} cellThickness={0.45} cellColor="#28515a" sectionSize={40} sectionThickness={0.8} sectionColor="#4caab2" fadeDistance={240} fadeStrength={1.4} infiniteGrid position={[0, -48, 0]} />}
    </>
  )
}
