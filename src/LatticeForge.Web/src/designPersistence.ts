import type { BracketGeometryParameters } from './geometry/geometryParameters'
import type { DesignParameters, ManufacturingProcess } from './useDesignStore'

export const DESIGN_SCHEMA_VERSION = 1
export const ILLUSTRATIVE_DATA_DISCLAIMER = 'illustrative demo data. The conceptual lattice mesh has not been checked for watertightness or printability.'

export type DesignDraft = {
  name: string
  parameters: DesignParameters
  materialId: string
  process: ManufacturingProcess
}

export type PersistedDesign = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  parameters: BracketGeometryParameters & { latticeDensity: number }
  materialId: string
  process: ManufacturingProcess
  schemaVersion: number
}

export function sanitizeFilename(value: string, fallback = 'lattice-design'): string {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-+(?=\.)/g, '')
    .replace(/^[.-]+|[.-]+$/g, '')

  return sanitized.length > 0 ? sanitized : fallback
}

export function createDesignExportJson(design: DesignDraft): string {
  return JSON.stringify({
    name: design.name,
    parameters: design.parameters,
    materialId: design.materialId,
    process: design.process,
    schemaVersion: DESIGN_SCHEMA_VERSION,
    illustrativeDataDisclaimer: ILLUSTRATIVE_DATA_DISCLAIMER,
  }, null, 2)
}

export function toDesignRequest(design: DesignDraft): Omit<PersistedDesign, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: design.name.trim(),
    parameters: {
      length: design.parameters.length,
      height: design.parameters.height,
      depth: design.parameters.depth,
      wallThickness: design.parameters.wallThickness,
      holeRadius: design.parameters.holeRadius,
      latticeDensity: design.parameters.latticeDensity / 100,
    },
    materialId: design.materialId,
    process: design.process,
    schemaVersion: DESIGN_SCHEMA_VERSION,
  }
}

async function readApiError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string') return payload.detail
  } catch {
    // Use the status fallback below when the response is not Problem Details JSON.
  }
  return `Design request failed with status ${response.status}.`
}

export async function saveDesign(design: DesignDraft, signal?: AbortSignal): Promise<PersistedDesign> {
  const response = await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toDesignRequest(design)),
    signal,
  })
  if (!response.ok) throw new Error(await readApiError(response))
  return await response.json() as PersistedDesign
}

export async function getRecentDesigns(signal?: AbortSignal): Promise<readonly PersistedDesign[]> {
  const response = await fetch('/api/designs', { signal })
  if (!response.ok) throw new Error(await readApiError(response))
  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) throw new Error('The designs response was invalid.')
  return payload as PersistedDesign[]
}

export async function getDesign(id: string, signal?: AbortSignal): Promise<PersistedDesign> {
  const response = await fetch(`/api/designs/${encodeURIComponent(id)}`, { signal })
  if (!response.ok) throw new Error(await readApiError(response))
  return await response.json() as PersistedDesign
}
