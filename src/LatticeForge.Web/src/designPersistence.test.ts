import { afterEach, describe, expect, it } from 'vitest'
import { createDesignExportJson, sanitizeFilename } from './designPersistence'
import { createOptimizedExportScene } from './geometry/optimizedExport'
import { useDesignStore } from './useDesignStore'

const design = {
  name: 'Bracket / baseline: v1',
  parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 50 },
  materialId: 'aluminum-sls',
  process: 'Sls' as const,
}

afterEach(() => {
  useDesignStore.getState().resetDesign()
  useDesignStore.getState().setViewMode('orbit')
  useDesignStore.getState().setDesignViewMode('solid')
})

describe('design persistence and export helpers', () => {
  it('sanitizeFilename_should_remove_unsafe_characters_and_keep_a_stable_fallback', () => {
    expect(sanitizeFilename('Bracket / baseline: v1?.stl')).toBe('Bracket-baseline-v1.stl')
    expect(sanitizeFilename('***')).toBe('lattice-design')
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
