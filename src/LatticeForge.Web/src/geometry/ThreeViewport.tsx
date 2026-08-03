import { Canvas } from '@react-three/fiber'
import { RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BracketScene } from './BracketScene'
import type { BracketGeometryParameters } from './geometryParameters'
import type { DesignViewMode } from '../useDesignStore'
type ThreeViewportProps = {
  showGrid: boolean
  viewMode: 'orbit' | 'front' | 'section'
  parameters: BracketGeometryParameters & { latticeDensity: number }
  designViewMode: DesignViewMode
}
function canUseWebGL(): boolean {
  if (typeof document === 'undefined') return false
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}
export function ThreeViewport({ showGrid, viewMode, parameters, designViewMode }: ThreeViewportProps) {
  const [webglAvailable] = useState(canUseWebGL)
  const [resetView, setResetView] = useState<(() => void) | null>(null)
  const [splitPosition, setSplitPosition] = useState(0.5)
  const [isDraggingSplit, setIsDraggingSplit] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const registerReset = useCallback((reset: () => void) => setResetView(() => reset), [])
  const updateSplitFromClientX = useCallback((clientX: number) => {
    const bounds = viewportRef.current?.getBoundingClientRect()
    if (!bounds || bounds.width <= 0) return
    setSplitPosition(Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width)))
  }, [])
  useEffect(() => {
    if (!isDraggingSplit) return
    const handlePointerMove = (event: PointerEvent) => updateSplitFromClientX(event.clientX)
    const handlePointerUp = () => setIsDraggingSplit(false)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDraggingSplit, updateSplitFromClientX])
  const cameraLabel = useMemo(() => viewMode === 'orbit' ? 'Perspective' : viewMode === 'front' ? 'Front elevation' : 'Section angle', [viewMode])
  return (
    <div ref={viewportRef} className="viewport-card viewport-three" data-testid="three-viewport">
      <div className="viewport-toolbar">
        <span className="viewport-kicker">3D Preview</span>
        <span className="viewport-status">Parametric bracket Â· A-001</span>
      </div>
      <div className="viewport-scene">
        {webglAvailable ? (
          <Canvas
            shadows
            camera={{ fov: 42, near: 0.1, far: 1000, position: [150, 108, 178] }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#0b1115')
              gl.localClippingEnabled = true
            }}
          >
            <BracketScene showGrid={showGrid} viewMode={viewMode} parameters={parameters} designViewMode={designViewMode} splitPosition={splitPosition} onResetReady={registerReset} />
          </Canvas>
        ) : (
          <div className="webgl-fallback" role="status">
            <strong>3D preview unavailable</strong>
            <span>WebGL is not available in this browser. Design controls remain usable.</span>
          </div>
        )}
      </div>
      {designViewMode === 'compare' && (
        <div
          className={`compare-split-control${isDraggingSplit ? ' dragging' : ''}`}
          style={{ left: `${splitPosition * 100}%` }}
          role="slider"
          aria-label="Solid and optimized comparison split"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(splitPosition * 100)}
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault()
            setIsDraggingSplit(true)
            updateSplitFromClientX(event.clientX)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault()
              setSplitPosition((current) => Math.max(0, current - 0.02))
            }
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault()
              setSplitPosition((current) => Math.min(1, current + 0.02))
            }
            if (event.key === 'Home') setSplitPosition(0)
            if (event.key === 'End') setSplitPosition(1)
          }}
        >
          <span className="compare-split-line" aria-hidden="true" />
          <span className="compare-split-label">Drag / arrows</span>
        </div>
      )}
      <div className="viewport-overlay" aria-hidden="true" />
      <div className="viewport-toolbar viewport-toolbar-bottom">
        <span className="viewport-camera-label" aria-label="Current dimensions">{cameraLabel} Â· {parameters.length} Ã— {parameters.height} Ã— {parameters.depth} mm</span>
        <button className="viewport-reset" type="button" onClick={() => resetView?.()} disabled={!webglAvailable || resetView === null}>
          <RotateCcw size={13} /> Reset view
        </button>
      </div>
    </div>
  )
}
