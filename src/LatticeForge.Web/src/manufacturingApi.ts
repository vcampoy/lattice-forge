import type { BracketGeometryParameters } from './geometry/geometryParameters'
import type { ManufacturingProcess } from './useDesignStore'

export type AnalysisRequest = {
  parameters: BracketGeometryParameters & { latticeDensity: number }
  materialId: string
  process: ManufacturingProcess
}

export type ManufacturingAnalysis = {
  solidVolume: number
  optimizedVolume: number
  estimatedWeight: number
  estimatedCost: number
  estimatedPrintMinutes: number
  materialReductionPercent: number
  printabilityScore: number
  supportRisk: string
  warnings: readonly string[]
  illustrativeEstimate: boolean
}

export class ManufacturingApiError extends Error {
  readonly status: number
  readonly detail?: string

  constructor(status: number, message: string, detail?: string) {
    super(message)
    this.name = 'ManufacturingApiError'
    this.status = status
    this.detail = detail
  }
}

export async function createManufacturingAnalysis(request: AnalysisRequest, signal: AbortSignal): Promise<ManufacturingAnalysis> {
  let response: Response
  try {
    response = await fetch('/api/analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ManufacturingApiError(0, 'The manufacturing API is unavailable.')
  }

  if (!response.ok) {
    let detail: string | undefined
    try {
      const payload: unknown = await response.json()
      if (payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string') detail = payload.detail
    } catch {
      detail = undefined
    }
    throw new ManufacturingApiError(response.status, detail ?? `Analysis request failed with status ${response.status}.`, detail)
  }

  return await response.json() as ManufacturingAnalysis
}
