export type OptimizationPhase = 'idle' | 'scanning' | 'revealing' | 'heatmap' | 'metrics' | 'complete' | 'skipped'

export type OptimizationState = {
  phase: OptimizationPhase
  progress: number
}

export type OptimizationEvent =
  | { type: 'start'; reducedMotion?: boolean }
  | { type: 'tick'; progress: number }
  | { type: 'skip' }
  | { type: 'reset' }

export type OptimizationFrame = {
  phase: OptimizationPhase
  scanPosition: number
  latticeReveal: number
  heatmapOpacity: number
  metricsProgress: number
  compareSplit: number
}

export function createOptimizationState(): OptimizationState {
  return { phase: 'idle', progress: 0 }
}

export function advanceOptimization(state: OptimizationState, event: OptimizationEvent): OptimizationState {
  if (event.type === 'reset') return createOptimizationState()
  if (event.type === 'start') {
    if (state.phase !== 'idle' && state.phase !== 'complete' && state.phase !== 'skipped') return state
    return event.reducedMotion ? { phase: 'complete', progress: 1 } : { phase: 'scanning', progress: 0 }
  }
  if (event.type === 'skip') return { phase: 'skipped', progress: 1 }
  if (state.phase === 'idle' || state.phase === 'complete' || state.phase === 'skipped') return state
  const progress = Math.min(1, Math.max(0, event.progress))
  return { phase: phaseForProgress(progress), progress }
}

export function getOptimizationFrame(progress: number, reducedMotion: boolean): OptimizationFrame {
  if (reducedMotion) return { phase: 'complete', scanPosition: 1, latticeReveal: 1, heatmapOpacity: 1, metricsProgress: 1, compareSplit: 0.5 }
  const normalized = Math.min(1, Math.max(0, progress))
  const phase = phaseForProgress(normalized)
  return {
    phase,
    scanPosition: normalized,
    latticeReveal: clamp01((normalized - 0.25) / 0.3),
    heatmapOpacity: round(clamp01((normalized - 0.45) / 0.4)),
    metricsProgress: clamp01((normalized - 0.78) / 0.22),
    compareSplit: 0.5,
  }
}

function phaseForProgress(progress: number): OptimizationPhase {
  if (progress >= 1) return 'complete'
  if (progress >= 0.78) return 'metrics'
  if (progress >= 0.45) return 'heatmap'
  if (progress >= 0.25) return 'revealing'
  return 'scanning'
}

function clamp01(value: number): number { return Math.min(1, Math.max(0, value)) }
function round(value: number): number { return Math.round(value * 100) / 100 }
