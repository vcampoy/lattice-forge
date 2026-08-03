import { useEffect, useState } from 'react'
import './App.css'

type HealthState = 'checking' | 'online' | 'offline'

type HealthResponse = {
  status: string
  service: string
}

function App() {
  const [healthState, setHealthState] = useState<HealthState>('checking')

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
          <span className="brand-mark" aria-hidden="true">LF</span>
          <span className="brand-name">Lattice Forge</span>
        </div>
        <div className={`health-badge health-${healthState}`} role="status" aria-live="polite">
          <span className="health-dot" aria-hidden="true" />
          {healthLabel}
        </div>
      </header>

      <section className="workspace" aria-labelledby="workspace-title">
        <div className="hero-copy">
          <p className="eyebrow">Design for additive manufacturing</p>
          <h1 id="workspace-title">Shape lighter.<br /><span>Build smarter.</span></h1>
          <p className="intro">
            An interactive workspace for exploring manufacturable lattice designs.
            Your engineering canvas starts here.
          </p>
          <div className="status-line">
            <span className="status-pulse" aria-hidden="true" />
            Foundation ready
          </div>
        </div>

        <div className="viewport-card" aria-label="3D design viewport placeholder">
          <div className="viewport-grid" aria-hidden="true" />
          <div className="bracket-placeholder" aria-hidden="true">
            <div className="bracket-arm bracket-arm-top" />
            <div className="bracket-arm bracket-arm-bottom" />
            <div className="bracket-web" />
            <span className="hole hole-top" />
            <span className="hole hole-bottom" />
          </div>
          <div className="viewport-label">3D viewport · awaiting geometry</div>
          <div className="axis-gizmo" aria-hidden="true"><span>X</span><span>Y</span><span>Z</span></div>
        </div>
      </section>

      <footer className="bottombar">
        <span>LATFORGE / 00.01</span>
        <span className="footer-divider" aria-hidden="true" />
        <span>Parametric design workspace</span>
      </footer>
    </main>
  )
}

export default App
