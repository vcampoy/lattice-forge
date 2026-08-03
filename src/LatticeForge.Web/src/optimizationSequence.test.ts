import { describe, expect, it } from 'vitest'
import {
  advanceOptimization,
  createOptimizationState,
  getOptimizationFrame,
  type OptimizationEvent,
} from './optimizationSequence'

describe('optimization sequence state machine', () => {
  it('progresses through the controlled scan and ends in compare mode', () => {
    const started = advanceOptimization(createOptimizationState(), { type: 'start' })
    expect(started.phase).toBe('scanning')
    expect(advanceOptimization(started, { type: 'tick', progress: 0.22 }).phase).toBe('scanning')
    expect(advanceOptimization(started, { type: 'tick', progress: 0.42 }).phase).toBe('revealing')
    expect(advanceOptimization(started, { type: 'tick', progress: 0.68 }).phase).toBe('heatmap')
    expect(advanceOptimization(started, { type: 'tick', progress: 0.86 }).phase).toBe('metrics')
    expect(advanceOptimization(started, { type: 'tick', progress: 1 }).phase).toBe('complete')
  })

  it('does not start a second run while one is active', () => {
    const active = advanceOptimization(createOptimizationState(), { type: 'start' })
    expect(advanceOptimization(active, { type: 'start' })).toBe(active)
  })

  it('skips immediately for reduced motion without inventing animation frames', () => {
    const initial = createOptimizationState()
    const reduced = advanceOptimization(initial, { type: 'start', reducedMotion: true })
    expect(reduced.phase).toBe('complete')
    expect(reduced.progress).toBe(1)
    expect(getOptimizationFrame(0.2, true)).toEqual({
      phase: 'complete',
      scanPosition: 1,
      latticeReveal: 1,
      heatmapOpacity: 1,
      metricsProgress: 1,
      compareSplit: 0.5,
    })
  })

  it('maps progress to deterministic visual channels', () => {
    expect(getOptimizationFrame(0.55, false)).toEqual({
      phase: 'heatmap',
      scanPosition: 0.55,
      latticeReveal: 1,
      heatmapOpacity: 0.25,
      metricsProgress: 0,
      compareSplit: 0.5,
    })
  })
})

const events: OptimizationEvent[] = [
  { type: 'start' },
  { type: 'tick', progress: 0.5 },
]
void events
