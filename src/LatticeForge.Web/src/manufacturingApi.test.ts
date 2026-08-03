import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useManufacturingAnalysis, type AnalysisQuery } from './useManufacturingAnalysis'

const query: AnalysisQuery = {
  parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 10, latticeDensity: 0.5 },
  materialId: 'aluminum-sls',
  process: 'Sls',
}

const analysis = {
  solidVolume: 100,
  optimizedVolume: 60,
  estimatedWeight: 160,
  estimatedCost: 12.5,
  estimatedPrintMinutes: 90,
  materialReductionPercent: 40,
  printabilityScore: 88,
  supportRisk: 'Low',
  warnings: ['Illustrative result'],
  illustrativeEstimate: true,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useManufacturingAnalysis', () => {
  it('debounces requests and exposes the successful response', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(analysis), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useManufacturingAnalysis(query, { debounceMs: 20 }))
    expect(fetchMock).not.toHaveBeenCalled()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 500 })
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.current.data?.printabilityScore).toBe(88)
  })

  it('aborts stale requests and keeps only the newest result', async () => {
    let resolveFirst: ((response: Response) => void) | undefined
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve })
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...analysis, printabilityScore: 92 })))
    vi.stubGlobal('fetch', fetchMock)
    const { result, rerender } = renderHook(({ currentQuery }) => useManufacturingAnalysis(currentQuery, { debounceMs: 10 }), { initialProps: { currentQuery: query } })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const firstSignal = fetchMock.mock.calls[0]?.[1]?.signal as AbortSignal
    rerender({ currentQuery: { ...query, parameters: { ...query.parameters, latticeDensity: 0.75 } } })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(firstSignal.aborted).toBe(true)
    resolveFirst?.(new Response(JSON.stringify(analysis)))
    await waitFor(() => expect(result.current.data?.printabilityScore).toBe(92))
  })

  it('maps validation responses to a recoverable validation state', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ detail: 'Wall thickness is invalid.' }), { status: 400 })))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useManufacturingAnalysis(query, { debounceMs: 0 }))
    await waitFor(() => expect(result.current.status).toBe('validation'))
    expect(result.current.error).toContain('Wall thickness')
  })

  it('offers retry when the API is unavailable', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce(new Response(JSON.stringify(analysis)))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useManufacturingAnalysis(query, { debounceMs: 0 }))
    await waitFor(() => expect(result.current.status).toBe('unavailable'))
    result.current.retry()
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
