import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Box,
  CircleDot,
  Cuboid,
  Grid3X3,
  Layers3,
  Maximize2,
  MousePointer2,
  Orbit,
  PanelRight,
  Settings2,
  SlidersHorizontal,
  Waypoints,
} from 'lucide-react'
import { DesignControls } from './DesignControls'
import { ManufacturingAnalysisPanel } from './ManufacturingAnalysisPanel'
import { ThreeViewport } from './geometry/ThreeViewport'
import { useDesignStore, type MaterialOption } from './useDesignStore'
import { useManufacturingAnalysis } from './useManufacturingAnalysis'
import { useOptimizationSequence } from './useOptimizationSequence'
import { useWorkspaceStore, type ViewMode } from './useWorkspaceStore'
import './App.css'

type HealthState = 'checking' | 'online' | 'offline'
type HealthResponse = { status: string; service: string }

const FALLBACK_MATERIALS: readonly MaterialOption[] = [
  { id: 'aluminum-sls', name: 'Aluminium PA', process: 'Sls' },
  { id: 'resin-sla', name: 'Clear Resin', process: 'Sla' },
  { id: 'titanium-lpbf', name: 'Titanium Ti-6Al-4V', process: 'MetalLpbf' },
]

const viewModes: Array<{ id: ViewMode; label: string; icon: typeof Orbit }> = [
  { id: 'orbit', label: 'Orbit', icon: Orbit },
  { id: 'front', label: 'Front', icon: Cuboid },
  { id: 'section', label: 'Section', icon: Layers3 },
]

const designViewModes: Array<{ id: 'solid' | 'optimized' | 'compare'; label: string; icon: typeof Box }> = [
  { id: 'solid', label: 'Solid', icon: Box },
  { id: 'optimized', label: 'Optimized', icon: Waypoints },
  { id: 'compare', label: 'Compare', icon: Layers3 },
]

function App() {
  const [healthState, setHealthState] = useState<HealthState>('checking')
  const { viewMode, showGrid, setViewMode, toggleGrid } = useWorkspaceStore()
  const design = useDesignStore()
  const [materials, setMaterials] = useState<readonly MaterialOption[]>(FALLBACK_MATERIALS)
  const analysisQuery = useMemo(() => ({
    parameters: {
      length: design.length,
      height: design.height,
      depth: design.depth,
      wallThickness: design.wallThickness,
      holeRadius: design.holeRadius,
      latticeDensity: design.latticeDensity / 100,
    },
    materialId: design.selectedMaterialId,
    process: design.selectedProcess,
  }), [
    design.depth,
    design.height,
    design.holeRadius,
    design.latticeDensity,
    design.length,
    design.selectedMaterialId,
    design.selectedProcess,
    design.wallThickness,
  ])
  const analysis = useManufacturingAnalysis(analysisQuery)
  const optimization = useOptimizationSequence({ designSignature: JSON.stringify(analysisQuery), onComplete: () => design.setDesignViewMode('compare') })

  useEffect(() => {
    const controller = new AbortController()

    const loadHealth = async (): Promise<void> => {
      try {
        const response = await fetch('/api/health', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Health request failed with ${response.status}`)
        }

        const payload = await response.json() as HealthResponse
        setHealthState(payload.status === 'ok' ? 'online' : 'offline')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setHealthState('offline')
      }
    }

    const loadMaterials = async (): Promise<void> => {
      try {
        const response = await fetch('/api/materials', { signal: controller.signal })
        if (!response.ok) return
        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) return

        const parsed = payload.filter((item): item is MaterialOption => {
          if (!item || typeof item !== 'object') return false
          const candidate = item as Partial<MaterialOption>
          return typeof candidate.id === 'string'
            && ['Sls', 'Sla', 'MetalLpbf'].includes(candidate.process as string)
        })
        if (parsed.length > 0) setMaterials(parsed)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    void loadHealth()
    void loadMaterials()
    return () => controller.abort()
  }, [])

  const healthLabel = healthState === 'checking'
    ? 'Connecting to API'
    : healthState === 'online'
      ? 'API online'
      : 'API offline'

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Lattice Forge home">
          <span className="brand-mark" aria-hidden="true">
            <Box size={16} strokeWidth={1.6} />
          </span>
          <span>
            <span className="brand-name">Lattice Forge</span>
            <span className="brand-subtitle">Engineering workspace</span>
          </span>
        </div>
        <div className="topbar-context">
          <span className="project-chip">
            <CircleDot size={13} aria-hidden="true" /> BRACKET / A-001
          </span>
          <div className={`health-badge health-${healthState}`} role="status" aria-live="polite">
            <span className="health-dot" aria-hidden="true" />
            {healthLabel}
          </div>
          <button className="icon-button" type="button" aria-label="Workspace settings" title="Workspace settings">
            <Settings2 size={17} />
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="panel design-panel" aria-labelledby="design-controls-title">
          <PanelHeader icon={<SlidersHorizontal size={16} />} eyebrow="Geometry" title="Design Controls" />
          <DesignControls materials={materials} />
        </aside>

        <section className="viewport-region" aria-label="3D design viewport" role="region">
          <Viewport showGrid={showGrid} viewMode={viewMode} parameters={design} process={design.selectedProcess} designViewMode={design.designViewMode} optimizationFrame={optimization.frame} />
        </section>

        <aside className="panel analysis-panel" aria-labelledby="analysis-title">
          <PanelHeader icon={<Waypoints size={16} />} eyebrow="Simulation" title="Manufacturing Analysis" />
          <ManufacturingAnalysisPanel {...analysis} onOptimize={optimization.start} onSkip={optimization.skip} optimizationPhase={optimization.phase} optimizationRunning={optimization.isRunning} optimizationHasRun={optimization.hasRun} metricsProgress={optimization.frame.metricsProgress} />
        </aside>
      </div>

      <footer className="bottombar">
        <div className="view-tools" aria-label="Viewport controls">
          {viewModes.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`view-tool ${viewMode === id ? 'active' : ''}`} type="button" aria-pressed={viewMode === id} onClick={() => setViewMode(id)}>
              <Icon size={14} /> {label}
            </button>
          ))}
          <span className="toolbar-divider" aria-hidden="true" />
          <button className={`view-tool ${showGrid ? 'active' : ''}`} type="button" aria-pressed={showGrid} onClick={toggleGrid}>
            <Grid3X3 size={14} /> Grid
          </button>
          <span className="toolbar-divider" aria-hidden="true" />
          <span className="view-group-label">Design view</span>
          {designViewModes.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`view-tool ${design.designViewMode === id ? 'active' : ''}`} type="button" aria-pressed={design.designViewMode === id} onClick={() => design.setDesignViewMode(id)}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="footer-meta">
          <span><MousePointer2 size={12} /> Drag to orbit</span>
          <span><Maximize2 size={12} /> Scroll to zoom</span>
          <span>LATFORGE / 02.00</span>
        </div>
      </footer>
    </main>
  )
}

function PanelHeader({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="panel-header">
      <div className="panel-icon">{icon}</div>
      <div>
        <p className="panel-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <button className="collapse-button" type="button" aria-label={`Collapse ${title}`} title={`Collapse ${title}`}>
        <PanelRight size={15} />
      </button>
    </div>
  )
}

function Viewport({ showGrid, viewMode, parameters, process, designViewMode, optimizationFrame }: { showGrid: boolean; viewMode: ViewMode; parameters: { length: number; height: number; depth: number; wallThickness: number; holeRadius: number; latticeDensity: number }; process: 'Sls' | 'Sla' | 'MetalLpbf'; designViewMode: 'solid' | 'optimized' | 'compare'; optimizationFrame: import('./optimizationSequence').OptimizationFrame }) {
  return <ThreeViewport showGrid={showGrid} viewMode={viewMode} parameters={parameters} process={process} designViewMode={designViewMode} optimizationFrame={optimizationFrame} />
}

export default App
