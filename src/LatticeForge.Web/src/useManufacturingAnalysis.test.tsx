import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useManufacturingAnalysis, type AnalysisQuery } from './useManufacturingAnalysis'

const QUERY: AnalysisQuery = {
  parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 0.5 },
  materialId: 'aluminum-sls',
  process: 'Sls',
}

const RESPONSE = {
  solidVolume: 120,
  optimizedVolume: 72,
  estimatedWeight: 74.88,
  estimatedCost: 5.09,
  estimatedPrintMinutes: 9.6,
  materialReductionPercent: 40,
  printabilityScore: 91,
  supportRisk: 'Low',
  warnings: [],
  illustrativeEstimate: true,
}

describe('useManufacturingAnalysis', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('clears previous analysis immediately when the design query changes', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify(RESPONSE), { status: 200 }))))
    const { result, rerender } = renderHook(({ query }) => useManufacturingAnalysis(query, { debounceMs: 100 }), { initialProps: { query: QUERY } })

    await act(async () => {
      vi.advanceTimersByTime(100)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.status).toBe('success')
    expect(result.current.data).not.toBeNull()

    act(() => rerender({ query: { ...QUERY, parameters: { ...QUERY.parameters, length: 121 } } }))

    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
