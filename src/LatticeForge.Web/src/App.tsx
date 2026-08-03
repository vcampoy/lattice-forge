import { useEffect, useState, type ReactNode } from 'react'
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
  Ruler,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Waypoints,
} from 'lucide-react'
import { useWorkspaceStore, type ViewMode } from './useWorkspaceStore'
import { DesignControls } from './DesignControls'
import { useDesignStore, type MaterialOption } from './useDesignStore'
import { ThreeViewport } from './geometry/ThreeViewport'
import './App.css'

type HealthState = 'checking' | 'online' | 'offline'

type HealthResponse = {
  status: string
  service: string
}

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

function App() {
  const [healthState, setHealthState] = useState<HealthState>('checking')
  const { viewMode, showGrid, setViewMode, toggleGrid } = useWorkspaceStore()
  const design = useDesignStore()
  const [materials, setMaterials] = useState<readonly MaterialOption[]>(FALLBACK_MATERIALS)

  useEffect(() => {
    const controller = new AbortController()

    const loadHealth = async (): Promise<void> => {
      try {
        const response = await fetch('/api/health', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Health request failed with ${response.status}`)
        }

        const payload = (await response.json()) as HealthResponse
        setHealthState(payload.status === 'ok' ? 'online' : 'offline')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setHealthState('offline')
      }
    }

    void loadHealth()

    const loadMaterials = async (): Promise<void> => {
      try {
        const response = await fetch('/api/materials', { signal: controller.signal })
        if (!response.ok) return
        const payload: unknown = await response.json()
        if (!Array.isArray(payload)) return
        const parsed = payload.filter((item): item is MaterialOption => {
          if (!item || typeof item !== 'object') return false
          const candidate = item as Partial<MaterialOption>
          return typeof candidate.id === 'string' && ['Sls', 'Sla', 'MetalLpbf'].includes(candidate.process as string)
        })
        if (parsed.length > 0) setMaterials(parsed)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

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
          <span className="brand-mark" aria-hidden="true"><Box size={16} strokeWidth={1.6} /></span>
          <span>
            <span className="brand-name">Lattice Forge</span>
            <span className="brand-subtitle">Engineering workspace</span>
          </span>
        </div>
        <div className="topbar-context">
          <span className="project-chip"><CircleDot size={13} aria-hidden="true" /> BRACKET / A-001</span>
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
          <Viewport showGrid={showGrid} viewMode={viewMode} parameters={design} />
        </section>

        <aside className="panel analysis-panel" aria-labelledby="analysis-title">
          <PanelHeader icon={<Waypoints size={16} />} eyebrow="Simulation" title="Manufacturing Analysis" />
          <div className="panel-content analysis-content">
            <div className="analysis-state"><span className="state-dot" /> <span>Awaiting analysis</span></div>
            <p className="analysis-intro">Run optimization to reveal how this design performs in its selected process.</p>
            <div className="metric-grid">
              <Metric label="Estimated weight" value="-" unit="g" />
              <Metric label="Material usage" value="-" unit="%" />
              <Metric label="Printability" value="-" unit="/100" />
              <Metric label="Estimated cost" value="-" unit="EUR" />
            </div>
            <div className="analysis-card warning-card"><div className="card-heading"><ShieldCheck size={14} /> <span>Manufacturing readiness</span></div><strong>Pending geometry</strong><p>Illustrative estimates only. Validate in a qualified workflow before production.</p></div>
            <div className="analysis-card"><div className="card-heading"><Ruler size={14} /> <span>Design envelope</span></div><div className="envelope-row"><span>Wall thickness</span><span>4.0 mm</span></div><div className="envelope-row"><span>Support risk</span><span className="muted-value">â€”</span></div></div>
          </div>
        </aside>
      </div>

      <footer className="bottombar">
        <div className="view-tools" aria-label="Viewport controls">
          {viewModes.map(({ id, label, icon: Icon }) => <button key={id} className={`view-tool ${viewMode === id ? 'active' : ''}`} type="button" aria-pressed={viewMode === id} onClick={() => setViewMode(id)}><Icon size={14} /> {label}</button>)}
          <span className="toolbar-divider" aria-hidden="true" />
          <button className={`view-tool ${showGrid ? 'active' : ''}`} type="button" aria-pressed={showGrid} onClick={toggleGrid}><Grid3X3 size={14} /> Grid</button>
        </div>
        <div className="footer-meta"><span><MousePointer2 size={12} /> Drag to orbit</span><span><Maximize2 size={12} /> Scroll to zoom</span><span>LATFORGE / 02.00</span></div>
      </footer>
    </main>
  )
}

function PanelHeader({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return <div className="panel-header"><div className="panel-icon">{icon}</div><div><p className="panel-eyebrow">{eyebrow}</p><h2>{title}</h2></div><button className="collapse-button" type="button" aria-label={`Collapse ${title}`} title={`Collapse ${title}`}><PanelRight size={15} /></button></div>
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>
}

function Viewport({ showGrid, viewMode, parameters }: { showGrid: boolean; viewMode: ViewMode; parameters: { length: number; height: number; depth: number; wallThickness: number; holeRadius: number } }) {
  return <ThreeViewport showGrid={showGrid} viewMode={viewMode} parameters={parameters} />
}

export default App
