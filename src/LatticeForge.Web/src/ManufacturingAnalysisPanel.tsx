import { AlertTriangle, CheckCircle2, Clock3, Coins, Gauge, RefreshCw, ShieldCheck, Sparkles, SkipForward, Weight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ManufacturingAnalysis } from './manufacturingApi'
import type { AnalysisStatus } from './useManufacturingAnalysis'
import type { OptimizationPhase } from './optimizationSequence'

type ManufacturingAnalysisPanelProps = {
  status: AnalysisStatus
  data: ManufacturingAnalysis | null
  error: string | null
  retry: () => void
  onOptimize?: () => void
  onSkip?: () => void
  optimizationPhase?: OptimizationPhase
  optimizationRunning?: boolean
  optimizationHasRun?: boolean
  metricsProgress?: number
}

export function ManufacturingAnalysisPanel({ status, data, error, retry, onOptimize, onSkip, optimizationPhase = 'idle', optimizationRunning = false, optimizationHasRun = false, metricsProgress = 0 }: ManufacturingAnalysisPanelProps) {
  const isPending = status === 'idle' || status === 'loading'
  const heading = status === 'success' ? 'Analysis ready' : status === 'loading' ? 'Calculating estimate' : status === 'validation' ? 'Design needs attention' : status === 'unavailable' || status === 'error' ? 'Analysis unavailable' : 'Awaiting analysis'
  const correction = data?.warnings.length ? correctionFor(data.warnings[0]) : null
  return (
    <div className="panel-content analysis-content">
      {onOptimize && <div className="optimization-action">
        <div className="optimization-action-header"><Sparkles size={14} aria-hidden="true" /><span>Manufacturing pathway</span></div>
        {!optimizationHasRun && <p className="optimization-hint">Sweep the design to reveal lattice savings and overhang risk.</p>}
        {optimizationRunning
          ? <button className="primary-button optimization-skip" type="button" onClick={onSkip}><SkipForward size={14} aria-hidden="true" /> Skip animation</button>
          : <button className="primary-button" type="button" onClick={onOptimize} disabled={optimizationPhase === 'complete'}><Sparkles size={14} aria-hidden="true" /> Optimize for Manufacturing</button>}
      </div>}
      <div className={`analysis-state analysis-state-${status}`} role="status" aria-live="polite">
        {status === 'success' ? <CheckCircle2 size={13} aria-hidden="true" /> : status === 'loading' ? <RefreshCw className="spin" size={13} aria-hidden="true" /> : <span className="state-dot" aria-hidden="true" />}
        <span>{heading}</span>
      </div>
      {isPending && <p className="analysis-intro">{status === 'loading' ? 'Server is evaluating the current design.' : 'Change a parameter to request a manufacturing estimate.'}</p>}
      {(status === 'validation' || status === 'unavailable' || status === 'error') && (
        <div className="analysis-error" role="alert">
          <AlertTriangle size={14} aria-hidden="true" />
          <p>{error ?? 'The analysis could not be completed.'}</p>
          <button className="retry-button" type="button" onClick={retry}><RefreshCw size={13} aria-hidden="true" /> Retry analysis</button>
        </div>
      )}
      {data && status === 'success' && <>
        <p className="analysis-intro">Deterministic server-side estimate for the selected process and material.</p>
        <div className="metric-grid" style={{ opacity: 0.72 + metricsProgress * 0.28 }}>
          <Metric icon={<Gauge size={13} />} label="Printability" value={formatNumber(data.printabilityScore)} unit="/100" emphasis />
          <Metric icon={<Weight size={13} />} label="Optimized weight" value={formatNumber(data.estimatedWeight)} unit="g" />
          <Metric icon={<Coins size={13} />} label="Illustrative cost" value={formatNumber(data.estimatedCost)} unit="EUR" />
          <Metric icon={<Clock3 size={13} />} label="Print time" value={formatNumber(data.estimatedPrintMinutes)} unit="min" />
        </div>
        <div className="analysis-card comparison-card">
          <div className="card-heading"><Weight size={14} aria-hidden="true" /> <span>Solid vs Optimized</span></div>
          <ComparisonRow label="Volume" solid={data.solidVolume} optimized={data.optimizedVolume} unit="cm³" />
          <ComparisonRow label="Weight" solid={solidWeight(data)} optimized={data.estimatedWeight} unit="g" />
          <div className="reduction-badge">{formatNumber(data.materialReductionPercent)}% material reduction</div>
        </div>
        <div className="analysis-card warning-card">
          <div className="card-heading"><ShieldCheck size={14} aria-hidden="true" /> <span>Manufacturing readiness</span></div>
          <strong>Support risk: {data.supportRisk}</strong>
          {data.warnings.length > 0 ? <ul className="warning-list">{data.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p>No server warnings for this illustrative scenario.</p>}
          {correction && <p className="suggestion"><b>Suggested correction:</b> {correction}</p>}
        </div>
      </>}
      {isPending && <div className="metric-grid" aria-label="Analysis metrics awaiting response"><Metric label="Optimized weight" value="-" unit="g" /><Metric label="Material reduction" value="-" unit="%" /><Metric label="Printability" value="-" unit="/100" /><Metric label="Illustrative cost" value="-" unit="EUR" /></div>}
      <p className="illustrative-disclosure"><AlertTriangle size={13} aria-hidden="true" /> Illustrative estimate — not engineering validation. Validate in a qualified workflow before production.</p>
    </div>
  )
}

function Metric({ icon, label, value, unit, emphasis = false }: { icon?: ReactNode; label: string; value: string; unit: string; emphasis?: boolean }) {
  return <div className={`metric${emphasis ? ' metric-emphasis' : ''}`}><span>{icon}{label}</span><strong className="metric-value">{value}<small>{unit}</small></strong></div>
}

function ComparisonRow({ label, solid, optimized, unit }: { label: string; solid: number; optimized: number; unit: string }) {
  return <div className="comparison-row"><span>{label}</span><span><b>{formatNumber(solid)}</b> <small>{unit}</small></span><span className="optimized-value"><b>{formatNumber(optimized)}</b> <small>{unit}</small></span></div>
}

function formatNumber(value: number): string { return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value) }
function solidWeight(result: ManufacturingAnalysis): number { return result.estimatedWeight / Math.max(0.01, 1 - result.materialReductionPercent / 100) }
function correctionFor(warning: string): string {
  const normalized = warning.toLowerCase()
  if (normalized.includes('thickness')) return 'Increase wall thickness before selecting this process.'
  if (normalized.includes('support')) return 'Reorient the bracket or choose a process with lower support demand.'
  return 'Review the design warning before continuing.'
}
