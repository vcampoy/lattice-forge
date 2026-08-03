import { ContactShadows, Grid, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { DoubleSide, Plane, Vector3, type PerspectiveCamera as PerspectiveCameraType } from 'three'
import { BracketGeometry } from './BracketGeometry'
import type { BracketGeometryParameters } from './geometryParameters'
import { LatticeStructure } from './LatticeStructureView'
import { RiskHeatmap } from './RiskHeatmap'
import type { DesignViewMode } from '../useDesignStore'
import type { ManufacturingProcess } from '../useDesignStore'
import type { OptimizationFrame } from '../optimizationSequence'
import type { RenderBudget } from '../renderingBudget'
type BracketSceneProps = {
  showGrid: boolean
  viewMode: 'orbit' | 'front' | 'section'
  parameters: BracketGeometryParameters & { latticeDensity: number }
  designViewMode: DesignViewMode
  process: ManufacturingProcess
  optimizationFrame?: OptimizationFrame
  splitPosition: number
  onResetReady?: (reset: () => void) => void
  reducedMotion: boolean
  renderBudget: RenderBudget
}
const CAMERA_POSITIONS: Record<BracketSceneProps['viewMode'], [number, number, number]> = {
  orbit: [150, 108, 178],
  front: [0, 0, 235],
  section: [166, 62, 162],
}
export function BracketScene({ showGrid, viewMode, parameters, designViewMode, splitPosition, onResetReady, process, optimizationFrame, reducedMotion, renderBudget }: BracketSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const cameraRef = useRef<PerspectiveCameraType | null>(null)
  const optimizationClipPlaneRef = useRef(new Plane(new Vector3(-1, 0, 0), 0))
  const splitX = (Math.min(1, Math.max(0, splitPosition)) - 0.5) * parameters.length
  const solidClipPlane = useMemo(() => designViewMode === 'compare' ? new Plane(new Vector3(1, 0, 0), -splitX) : undefined, [designViewMode, splitX])
  const optimizedClipPlane = useMemo(() => designViewMode === 'compare' ? new Plane(new Vector3(-1, 0, 0), splitX) : undefined, [designViewMode, splitX])
  const optimizing = optimizationFrame?.phase === 'scanning' || optimizationFrame?.phase === 'revealing' || optimizationFrame?.phase === 'heatmap' || optimizationFrame?.phase === 'metrics'
  const scanX = ((optimizationFrame?.scanPosition ?? 0) - 0.5) * parameters.length
  useEffect(() => { optimizationClipPlaneRef.current.constant = scanX }, [scanX])
  const optimizationClipPlane = optimizing ? optimizationClipPlaneRef.current : undefined
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
        enableDamping={!reducedMotion}
        dampingFactor={0.08}
        enablePan={false}
        minDistance={105}
        maxDistance={380}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
      />
      <ambientLight intensity={0.46} color="#cfe9ed" />
      {renderBudget.shadows && <directionalLight castShadow intensity={2.2} color="#f4ffff" position={[100, 160, 150]} shadow-mapSize={[512, 512]} shadow-bias={-0.0002} />}
      {renderBudget.shadows && <spotLight castShadow intensity={18} angle={0.42} penumbra={0.8} position={[-120, 160, 110]} color="#4fd8e0" shadow-mapSize={[256, 256]} />}
      <pointLight intensity={2.5} distance={280} color="#f2ac63" position={[140, -80, 100]} />
      {optimizing ? (
        <>
          <BracketGeometry parameters={parameters} />
          <LatticeStructure parameters={parameters} clipPlane={optimizationClipPlane} maxInstances={renderBudget.latticeInstances} />
          <RiskHeatmap parameters={parameters} process={process} opacity={optimizationFrame?.heatmapOpacity ?? 0} clipPlane={optimizationClipPlane} />
          <mesh position={[scanX, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[parameters.depth + 18, parameters.height + 18]} />
            <meshBasicMaterial color="#a7ffff" transparent opacity={0.16} depthWrite={false} side={DoubleSide} />
          </mesh>
        </>
      ) : (designViewMode === 'solid' || designViewMode === 'optimized') && <BracketGeometry parameters={parameters} />}
      {designViewMode === 'optimized' && <LatticeStructure parameters={parameters} maxInstances={renderBudget.latticeInstances} />}
      {designViewMode === 'compare' && (
        <>
          <BracketGeometry parameters={parameters} clipPlane={solidClipPlane} />
          <group>
            <BracketGeometry parameters={parameters} clipPlane={optimizedClipPlane} />
            <LatticeStructure parameters={parameters} clipPlane={optimizedClipPlane} maxInstances={renderBudget.latticeInstances} />
          </group>
          <mesh position={[splitX, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[parameters.depth, parameters.height]} />
            <meshBasicMaterial color="#7afcff" transparent opacity={0.1} depthWrite={false} side={DoubleSide} />
          </mesh>
        </>
      )}
      {renderBudget.shadows && <ContactShadows frames={1} opacity={0.42} scale={310} blur={2.6} far={180} resolution={256} color="#000000" position={[0, -48, 0]} />}
      {showGrid && <Grid args={[420, 420]} cellSize={10} cellThickness={0.45} cellColor="#28515a" sectionSize={40} sectionThickness={0.8} sectionColor="#4caab2" fadeDistance={240} fadeStrength={1.4} infiniteGrid position={[0, -48, 0]} />}
    </>
  )
}
