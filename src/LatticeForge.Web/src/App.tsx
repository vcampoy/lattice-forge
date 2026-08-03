import { useEffect, useState, type ReactNode } from 'react'
import {
  Box,
  CircleDot,
  Cuboid,
  Eye,
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
  Sparkles,
  Waypoints,
} from 'lucide-react'
import { useWorkspaceStore, type ViewMode } from './useWorkspaceStore'
import './App.css'

type HealthState = 'checking' | 'online' | 'offline'

type HealthResponse = {
  status: string
  service: string
}

const viewModes: Array<{ id: ViewMode; label: string; icon: typeof Orbit }> = [
  { id: 'orbit', label: 'Orbit', icon: Orbit },
  { id: 'front', label: 'Front', icon: Cuboid },
  { id: 'section', label: 'Section', icon: Layers3 },
]

function App() {
  const [healthState, setHealthState] = useState<HealthState>('checking')
  const { viewMode, showGrid, setViewMode, toggleGrid } = useWorkspaceStore()

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
          <div className="panel-content">
            <div className="control-group">
              <div className="control-label-row"><label htmlFor="length">Overall length</label><output>120 <span>mm</span></output></div>
              <input id="length" type="range" min="60" max="180" defaultValue="120" aria-label="Overall length" />
            </div>
            <div className="control-group">
              <div className="control-label-row"><label htmlFor="height">Overall height</label><output>80 <span>mm</span></output></div>
              <input id="height" type="range" min="40" max="140" defaultValue="80" aria-label="Overall height" />
            </div>
            <div className="control-group">
              <div className="control-label-row"><label htmlFor="depth">Depth</label><output>40 <span>mm</span></output></div>
              <input id="depth" type="range" min="20" max="80" defaultValue="40" aria-label="Depth" />
            </div>
          </div>
          <div className="panel-divider" />
          <div className="panel-content">
            <div className="section-heading"><span>Lightweighting</span><span className="section-index">02</span></div>
            <div className="control-group">
              <div className="control-label-row"><label htmlFor="lattice-density">Lattice density</label><output>50 <span>%</span></output></div>
              <input id="lattice-density" type="range" min="0" max="100" defaultValue="50" aria-label="Lattice density" />
            </div>
            <div className="control-group">
              <div className="control-label-row"><label htmlFor="wall-thickness">Wall thickness</label><output>4.0 <span>mm</span></output></div>
              <input id="wall-thickness" type="range" min="1" max="8" step="0.5" defaultValue="4" aria-label="Wall thickness" />
            </div>
            <div className="control-note"><ShieldCheck size={14} /><span>All dimensions remain within the current design envelope.</span></div>
          </div>
          <div className="panel-divider" />
          <div className="panel-content material-selection">
            <div className="section-heading"><span>Material &amp; process</span><span className="section-index">03</span></div>
            <label htmlFor="material">Material</label>
            <select id="material" defaultValue="aluminum-sls" aria-label="Material">
              <option value="aluminum-sls">Aluminum · SLS</option>
              <option value="resin-sla">High-temp resin · SLA</option>
              <option value="titanium-lpbf">Titanium · LPBF</option>
            </select>
            <button className="primary-button" type="button"><Sparkles size={15} /> Optimize design</button>
          </div>
        </aside>

        <section className="viewport-region" aria-label="3D design viewport" role="region">
          <Viewport showGrid={showGrid} viewMode={viewMode} />
        </section>

        <aside className="panel analysis-panel" aria-labelledby="analysis-title">
          <PanelHeader icon={<Waypoints size={16} />} eyebrow="Simulation" title="Manufacturing Analysis" />
          <div className="panel-content analysis-content">
            <div className="analysis-state"><span className="state-dot" /> <span>Awaiting analysis</span></div>
            <p className="analysis-intro">Run optimization to reveal how this design performs in its selected process.</p>
            <div className="metric-grid">
              <Metric label="Estimated weight" value="—" unit="g" />
              <Metric label="Material usage" value="—" unit="%" />
              <Metric label="Printability" value="—" unit="/100" />
              <Metric label="Estimated cost" value="—" unit="EUR" />
            </div>
            <div className="analysis-card warning-card"><div className="card-heading"><ShieldCheck size={14} /> <span>Manufacturing readiness</span></div><strong>Pending geometry</strong><p>Illustrative estimates only. Validate in a qualified workflow before production.</p></div>
            <div className="analysis-card"><div className="card-heading"><Ruler size={14} /> <span>Design envelope</span></div><div className="envelope-row"><span>Wall thickness</span><span>4.0 mm</span></div><div className="envelope-row"><span>Support risk</span><span className="muted-value">—</span></div></div>
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

function Viewport({ showGrid, viewMode }: { showGrid: boolean; viewMode: ViewMode }) {
  return <div className={`viewport-card mode-${viewMode}`}>
    {showGrid && <div className="viewport-grid" aria-hidden="true" />}
    <div className="viewport-atmosphere" aria-hidden="true" />
    <div className="viewport-toolbar"><span className="viewport-kicker"><Eye size={13} /> Preview</span><span className="viewport-status">Parametric bracket · A-001</span></div>
    <div className="bracket-placeholder" aria-hidden="true"><div className="bracket-arm bracket-arm-top" /><div className="bracket-arm bracket-arm-bottom" /><div className="bracket-web" /><span className="hole hole-top" /><span className="hole hole-bottom" /><span className="lattice-glow lattice-glow-one" /><span className="lattice-glow lattice-glow-two" /></div>
    <div className="viewport-caption"><span className="axis-gizmo"><b>X</b><b>Y</b><b>Z</b></span><span>3D viewport · geometry preview</span></div>
    <div className="viewport-crosshair" aria-hidden="true"><span /><span /></div>
  </div>
}

export default App
