import type { BracketGeometryParameters } from './geometry/geometryParameters'
import { apiRoutes, readApiProblem } from './apiClient'
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
    response = await fetch(apiRoutes.analyses, {
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
    const problem = await readApiProblem(response, `Analysis request failed with status ${response.status}.`)
    throw new ManufacturingApiError(response.status, problem.message, problem.detail)
  }

  return await response.json() as ManufacturingAnalysis
}
