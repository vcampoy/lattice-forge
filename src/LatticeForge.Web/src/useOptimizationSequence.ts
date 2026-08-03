import { useCallback, useEffect, useRef, useState } from 'react'
import { advanceOptimization, createOptimizationState, getOptimizationFrame, type OptimizationFrame, type OptimizationPhase, type OptimizationState } from './optimizationSequence'

type OptimizationSequenceOptions = { durationMs?: number; designSignature?: string; onComplete?: () => void }
type OptimizationSequence = {
  phase: OptimizationPhase
  progress: number
  frame: OptimizationFrame
  isRunning: boolean
  hasRun: boolean
  start: () => void
  skip: () => void
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

export function useOptimizationSequence(options: OptimizationSequenceOptions = {}): OptimizationSequence {
  const { durationMs = 3000, designSignature = '', onComplete } = options
  const [state, setState] = useState<OptimizationState>(createOptimizationState)
  const [hasRun, setHasRun] = useState(false)
  const stateRef = useRef(state)
  const frameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  stateRef.current = state

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    startTimeRef.current = null
  }, [])

  const start = useCallback(() => {
    const reduced = prefersReducedMotion()
    const current = stateRef.current
    if (current.phase !== 'idle' && current.phase !== 'complete' && current.phase !== 'skipped') return
    const next = advanceOptimization(current, { type: 'start', reducedMotion: reduced })
    stateRef.current = next
    setState(next)
    setHasRun(true)
    if (reduced) {
      onCompleteRef.current?.()
      return
    }
    stopFrame()
    const tick = (timestamp: number) => {
      startTimeRef.current ??= timestamp
      const progress = Math.min(1, (timestamp - startTimeRef.current) / Math.max(1, durationMs))
      const next = advanceOptimization({ phase: 'scanning', progress: 0 }, { type: 'tick', progress })
      stateRef.current = next
      setState(next)
      if (progress >= 1) {
        stopFrame()
        setHasRun(true)
        onCompleteRef.current?.()
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [durationMs, stopFrame])

  const skip = useCallback(() => {
    stopFrame()
    const current = stateRef.current
    if (current.phase === 'idle' || current.phase === 'complete' || current.phase === 'skipped') return
    const next = advanceOptimization(current, { type: 'skip' })
    stateRef.current = next
    setState(next)
    setHasRun(true)
    onCompleteRef.current?.()
  }, [stopFrame])

  useEffect(() => {
    stopFrame()
    const initial = createOptimizationState()
    stateRef.current = initial
    setState(initial)
    setHasRun(false)
  }, [designSignature, stopFrame])
  useEffect(() => stopFrame, [stopFrame])
  const frame = state.phase === 'idle'
    ? { phase: 'idle' as const, scanPosition: 0, latticeReveal: 0, heatmapOpacity: 0, metricsProgress: 0, compareSplit: 0.5 }
    : getOptimizationFrame(state.progress, prefersReducedMotion())
  return { phase: state.phase, progress: state.progress, frame, isRunning: state.phase === 'scanning' || state.phase === 'revealing' || state.phase === 'heatmap' || state.phase === 'metrics', hasRun, start, skip }
}
