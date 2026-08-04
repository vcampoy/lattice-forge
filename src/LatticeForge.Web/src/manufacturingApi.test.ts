import { afterEach, describe, expect, it, vi } from 'vitest'
import { createManufacturingAnalysis, ManufacturingApiError, type AnalysisRequest } from './manufacturingApi'

const REQUEST: AnalysisRequest = {
  parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 10, latticeDensity: 0.5 },
  materialId: 'aluminum-sls',
  process: 'Sls',
}

const ANALYSIS = {
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

describe('createManufacturingAnalysis', () => {
  it('createManufacturingAnalysis_should_post_controller_contract_when_request_is_valid', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(ANALYSIS), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    const result = await createManufacturingAnalysis(REQUEST, controller.signal)

    expect(fetchMock).toHaveBeenCalledWith('/api/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(REQUEST),
      signal: controller.signal,
    })
    expect(result).toEqual(ANALYSIS)
  })

  it('createManufacturingAnalysis_should_surface_detail_when_controller_returns_problem_details', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({
      title: 'Manufacturing analysis request is invalid.',
      detail: 'Wall thickness is invalid.',
      status: 400,
      traceId: 'trace-1',
    }), { status: 400 }))))

    const error = await captureError(() => createManufacturingAnalysis(REQUEST, new AbortController().signal))

    expect(error).toBeInstanceOf(ManufacturingApiError)
    expect(error).toMatchObject({ status: 400, message: 'Wall thickness is invalid.', detail: 'Wall thickness is invalid.' })
  })

  it('createManufacturingAnalysis_should_surface_title_when_api_controller_rejects_model_binding', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: { request: ['The request field is required.'] },
    }), { status: 400 }))))

    const error = await captureError(() => createManufacturingAnalysis(REQUEST, new AbortController().signal))

    expect(error).toMatchObject({ status: 400, message: 'One or more validation errors occurred.', detail: undefined })
  })

  it('createManufacturingAnalysis_should_report_unavailable_when_fetch_fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network down'))))

    const error = await captureError(() => createManufacturingAnalysis(REQUEST, new AbortController().signal))

    expect(error).toMatchObject({ status: 0, message: 'The manufacturing API is unavailable.' })
  })

  it('createManufacturingAnalysis_should_preserve_abort_when_request_is_cancelled', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(abortError)))

    const error = await captureError(() => createManufacturingAnalysis(REQUEST, new AbortController().signal))

    expect(error).toBe(abortError)
  })
})

async function captureError(action: () => Promise<unknown>): Promise<Error> {
  try {
    await action()
  } catch (error) {
    return error as Error
  }

  throw new Error('Expected action to throw.')
}
