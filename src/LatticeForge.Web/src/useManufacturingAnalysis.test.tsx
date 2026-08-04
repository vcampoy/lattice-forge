import { act, renderHook, waitFor } from '@testing-library/react'
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

  it('useManufacturingAnalysis_should_clear_previous_analysis_when_design_query_changes', async () => {
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

  it('useManufacturingAnalysis_should_debounce_request_when_enabled', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(RESPONSE), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useManufacturingAnalysis(QUERY, { debounceMs: 20 }))

    expect(fetchMock).not.toHaveBeenCalled()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1), { timeout: 500 })
    await waitFor(() => expect(result.current.status).toBe('success'))
  })

  it('useManufacturingAnalysis_should_not_restart_when_equivalent_query_is_recreated', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(RESPONSE), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)
    const { result, rerender } = renderHook(
      ({ query }) => useManufacturingAnalysis(query, { debounceMs: 0 }),
      { initialProps: { query: QUERY } },
    )
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.status).toBe('success')

    rerender({ query: { ...QUERY, parameters: { ...QUERY.parameters } } })

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('useManufacturingAnalysis_should_abort_stale_request_when_query_changes', async () => {
    let resolveFirst: ((response: Response) => void) | undefined
    const firstResponse = new Promise<Response>((resolve) => { resolveFirst = resolve })
    const fetchMock = vi.fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...RESPONSE, printabilityScore: 92 })))
    vi.stubGlobal('fetch', fetchMock)
    const { result, rerender } = renderHook(
      ({ query }) => useManufacturingAnalysis(query, { debounceMs: 10 }),
      { initialProps: { query: QUERY } },
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const firstSignal = fetchMock.mock.calls[0]?.[1]?.signal as AbortSignal

    rerender({ query: { ...QUERY, parameters: { ...QUERY.parameters, latticeDensity: 0.75 } } })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(firstSignal.aborted).toBe(true)
    resolveFirst?.(new Response(JSON.stringify(RESPONSE)))
    await waitFor(() => expect(result.current.data?.printabilityScore).toBe(92))
  })

  it('useManufacturingAnalysis_should_expose_validation_state_when_controller_returns_bad_request', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({
      detail: 'Wall thickness is invalid.',
    }), { status: 400 }))))
    const { result } = renderHook(() => useManufacturingAnalysis(QUERY, { debounceMs: 0 }))

    await waitFor(() => expect(result.current.status).toBe('validation'))

    expect(result.current.error).toContain('Wall thickness')
  })

  it('useManufacturingAnalysis_should_retry_when_api_becomes_available', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce(new Response(JSON.stringify(RESPONSE)))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useManufacturingAnalysis(QUERY, { debounceMs: 0 }))
    await waitFor(() => expect(result.current.status).toBe('unavailable'))

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
