import { Canvas, useThree } from '@react-three/fiber'
import { RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BracketScene } from './BracketScene'
import type { BracketGeometryParameters } from './geometryParameters'
import type { DesignViewMode } from '../useDesignStore'
import type { ManufacturingProcess } from '../useDesignStore'
import type { OptimizationFrame } from '../optimizationSequence'
import { getRenderBudget, type RenderBudget } from '../renderingBudget'
type ThreeViewportProps = {
  showGrid: boolean
  viewMode: 'orbit' | 'front' | 'section'
  parameters: BracketGeometryParameters & { latticeDensity: number }
  designViewMode: DesignViewMode
  process: ManufacturingProcess
  optimizationFrame?: OptimizationFrame
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

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true)

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return undefined
    const update = () => setReduced(mediaQuery.matches)
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return reduced
}

function WebglLifecycle({ onContextLost, onContextRestored }: { onContextLost: () => void; onContextRestored: () => void }) {
  const gl = useThree(({ gl }) => gl)

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      onContextLost()
    }
    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    const handleContextRestored = () => onContextRestored()
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [gl, onContextLost, onContextRestored])

  return null
}

export function ThreeViewport({ showGrid, viewMode, parameters, designViewMode, process, optimizationFrame }: ThreeViewportProps) {
  const [webglAvailable] = useState(canUseWebGL)
  const [webglLost, setWebglLost] = useState(false)
  const [resetView, setResetView] = useState<(() => void) | null>(null)
  const [splitPosition, setSplitPosition] = useState(0.5)
  const [isDraggingSplit, setIsDraggingSplit] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 560px)').matches === true)
  const renderBudget: RenderBudget = useMemo(() => getRenderBudget({ width: isNarrow ? 390 : 1440, devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio }), [isNarrow])
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
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(max-width: 560px)')
    if (!mediaQuery) return undefined
    const update = () => setIsNarrow(mediaQuery.matches)
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])
  const cameraLabel = useMemo(() => viewMode === 'orbit' ? 'Perspective' : viewMode === 'front' ? 'Front elevation' : 'Section angle', [viewMode])
  const optimizationActive = optimizationFrame?.phase === 'scanning' || optimizationFrame?.phase === 'revealing' || optimizationFrame?.phase === 'heatmap' || optimizationFrame?.phase === 'metrics'
  const handleContextLost = useCallback(() => setWebglLost(true), [])
  const handleContextRestored = useCallback(() => setWebglLost(false), [])
  return (
    <div ref={viewportRef} className="viewport-card viewport-three" data-testid="three-viewport">
      <div className="viewport-toolbar">
        <span className="viewport-kicker">3D Preview</span>
        <span className="viewport-status">Parametric bracket Â· A-001</span>
      </div>
      <div className="viewport-scene">
        {webglAvailable ? (
          <Canvas
            shadows={renderBudget.shadows}
            camera={{ fov: 42, near: 0.1, far: 1000, position: [150, 108, 178] }}
            dpr={renderBudget.dpr}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#0b1115')
              gl.localClippingEnabled = true
            }}
          >
            <WebglLifecycle onContextLost={handleContextLost} onContextRestored={handleContextRestored} />
            <BracketScene showGrid={showGrid} viewMode={viewMode} parameters={parameters} designViewMode={designViewMode} process={process} optimizationFrame={optimizationFrame} splitPosition={splitPosition} onResetReady={registerReset} reducedMotion={reducedMotion} renderBudget={renderBudget} />
          </Canvas>
        ) : (
          <div className="webgl-fallback" role="status">
            <strong>3D preview unavailable</strong>
            <span>WebGL is not available in this browser. Design controls remain usable.</span>
          </div>
        )}
        {webglLost && <div className="webgl-fallback webgl-context-lost" role="alert"><strong>3D preview interrupted</strong><span>WebGL context was lost. Reload the preview to restore the model.</span></div>}
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
      {optimizationActive && <div className="optimization-legend" role="group" aria-label="Overhang risk legend">
        <strong>Overhang risk</strong>
        <span className="risk-scale" aria-hidden="true"><i /><i /><i /></span>
        <span>low · review · high</span>
        <span className="risk-pattern">/// = review surface</span>
      </div>}
      <div className="viewport-toolbar viewport-toolbar-bottom">
        <span className="viewport-camera-label" aria-label="Current dimensions">{cameraLabel} Â· {parameters.length} Ã— {parameters.height} Ã— {parameters.depth} mm</span>
        <button className="viewport-reset" type="button" onClick={() => resetView?.()} disabled={!webglAvailable || resetView === null}>
          <RotateCcw size={13} /> Reset view
        </button>
      </div>
    </div>
  )
}
