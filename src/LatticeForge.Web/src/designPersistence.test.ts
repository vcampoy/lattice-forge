import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDesignExportJson,
  getDesign,
  getRecentDesigns,
  sanitizeFilename,
  saveDesign,
  toDesignRequest,
} from './designPersistence'
import { createOptimizedExportScene } from './geometry/optimizedExport'
import { useDesignStore } from './useDesignStore'

const design = {
  name: 'Bracket / baseline: v1',
  parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 50 },
  materialId: 'aluminum-sls',
  process: 'Sls' as const,
}

const savedDesign = {
  id: 'saved-1',
  name: 'Bracket baseline',
  createdAt: '2026-08-03T00:00:00Z',
  updatedAt: '2026-08-03T00:00:00Z',
  parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 0.5 },
  materialId: 'aluminum-sls',
  process: 'Sls' as const,
  schemaVersion: 1,
}

afterEach(() => {
  vi.restoreAllMocks()
  useDesignStore.getState().resetDesign()
  useDesignStore.getState().setViewMode('orbit')
  useDesignStore.getState().setDesignViewMode('solid')
})

describe('design persistence and export helpers', () => {
  it('sanitizeFilename_should_remove_unsafe_characters_and_keep_a_stable_fallback', () => {
    expect(sanitizeFilename('Bracket / baseline: v1?.stl')).toBe('Bracket-baseline-v1.stl')
    expect(sanitizeFilename('***')).toBe('lattice-design')
  })

  it('sanitizeFilename_should_replace_reserved_windows_device_names', () => {
    expect(sanitizeFilename('CON.stl')).toBe('lattice-design')
  })

  it('createDesignExportJson_should_include_schema_version_and_illustrative_disclaimer', () => {
    const payload = JSON.parse(createDesignExportJson(design)) as Record<string, unknown>

    expect(payload).toMatchObject({
      schemaVersion: 1,
      materialId: 'aluminum-sls',
      process: 'Sls',
      illustrativeDataDisclaimer: expect.stringContaining('illustrative'),
    })
    expect(payload.parameters).toEqual(design.parameters)
  })

  it('toDesignRequest_should_normalize_lattice_density_when_design_uses_percentage', () => {
    const request = toDesignRequest(design)

    expect(request).toMatchObject({
      name: 'Bracket / baseline: v1',
      materialId: 'aluminum-sls',
      process: 'Sls',
      schemaVersion: 1,
      parameters: { latticeDensity: 0.5 },
    })
  })

  it('saveDesign_should_post_controller_contract_when_request_is_valid', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(savedDesign), { status: 201 })))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    const result = await saveDesign(design, controller.signal)

    expect(fetchMock).toHaveBeenCalledWith('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toDesignRequest(design)),
      signal: controller.signal,
    })
    expect(result).toEqual(savedDesign)
  })

  it('saveDesign_should_surface_title_when_api_controller_rejects_model_binding', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({
      title: 'One or more validation errors occurred.',
      status: 400,
    }), { status: 400 }))))

    await expect(saveDesign(design)).rejects.toThrow('One or more validation errors occurred.')
  })

  it('getRecentDesigns_should_get_design_collection_when_requested', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify([savedDesign]), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getRecentDesigns()

    expect(fetchMock).toHaveBeenCalledWith('/api/designs', { signal: undefined })
    expect(result).toEqual([savedDesign])
  })

  it('getDesign_should_encode_identifier_and_get_design_when_requested', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify(savedDesign), { status: 200 })))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getDesign('design/with spaces')

    expect(fetchMock).toHaveBeenCalledWith('/api/designs/design%2Fwith%20spaces', { signal: undefined })
    expect(result).toEqual(savedDesign)
  })

  it('getRecentDesigns_should_reject_non_array_payload_when_response_is_invalid', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify(savedDesign), { status: 200 }))))

    await expect(getRecentDesigns()).rejects.toThrow('The designs response was invalid.')
  })

  it('createOptimizedExportScene_should_include_the_visible_bracket_and_lattice_geometry', () => {
    const scene = createOptimizedExportScene(design.parameters)

    expect(scene.children).toHaveLength(2)
    expect(scene.children.every((child) => child.type === 'Mesh' || child.type === 'InstancedMesh')).toBe(true)
    scene.traverse((child) => {
      const mesh = child as { geometry?: { dispose: () => void } }
      mesh.geometry?.dispose()
    })
  })

  it('loadDesign_should_restore_parameters_without_resetting_view_state', () => {
    useDesignStore.getState().setViewMode('front')
    useDesignStore.getState().setDesignViewMode('compare')

    useDesignStore.getState().loadDesign({ ...design.parameters }, 'Sls', 'aluminum-sls')

    const restored = useDesignStore.getState()
    expect(restored.length).toBe(design.parameters.length)
    expect(restored.latticeDensity).toBe(design.parameters.latticeDensity)
    expect(restored.viewMode).toBe('front')
    expect(restored.designViewMode).toBe('compare')
  })
})
