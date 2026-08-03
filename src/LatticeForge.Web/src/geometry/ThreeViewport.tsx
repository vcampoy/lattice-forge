import { Canvas } from '@react-three/fiber'
import { RotateCcw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { BracketScene } from './BracketScene'
import type { BracketGeometryParameters } from './geometryParameters'
type ThreeViewportProps = {
  showGrid: boolean
  viewMode: 'orbit' | 'front' | 'section'
  parameters: BracketGeometryParameters
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
export function ThreeViewport({ showGrid, viewMode, parameters }: ThreeViewportProps) {
  const [webglAvailable] = useState(canUseWebGL)
  const [resetView, setResetView] = useState<(() => void) | null>(null)
  const registerReset = useCallback((reset: () => void) => setResetView(() => reset), [])
  const cameraLabel = useMemo(() => viewMode === 'orbit' ? 'Perspective' : viewMode === 'front' ? 'Front elevation' : 'Section angle', [viewMode])
  return (
    <div className="viewport-card viewport-three" data-testid="three-viewport">
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
            onCreated={({ gl }) => gl.setClearColor('#0b1115')}
          >
            <BracketScene showGrid={showGrid} viewMode={viewMode} parameters={parameters} onResetReady={registerReset} />
          </Canvas>
        ) : (
          <div className="webgl-fallback" role="status">
            <strong>3D preview unavailable</strong>
            <span>WebGL is not available in this browser. Design controls remain usable.</span>
          </div>
        )}
      </div>
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
