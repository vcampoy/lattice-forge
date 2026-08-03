import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DESIGN,
  PRESETS,
  isMaterialCompatible,
  useDesignStore,
  type DesignParameter,
} from './useDesignStore'
const read = () => useDesignStore.getState()
describe('design store', () => {
  it('clamps geometry values before storing them', () => {
    read().resetDesign()
    read().setParameter('length', 999)
    read().setParameter('wallThickness', 999)
    expect(read().length).toBe(180)
    expect(read().wallThickness).toBeLessThanOrEqual(16)
  })
  it('applies each named preset and marks the active preset as clean', () => {
    read().applyPreset('Lightweight')
    expect(read().length).toBe(PRESETS.Lightweight.length)
    expect(read().latticeDensity).toBe(PRESETS.Lightweight.latticeDensity)
    expect(read().isModified()).toBe(false)
  })
  it('marks a design modified after a parameter changes and resets to defaults', () => {
    read().applyPreset('Balanced')
    read().setParameter('depth', DEFAULT_DESIGN.depth + 1)
    expect(read().isModified()).toBe(true)
    read().resetDesign()
    expect(read().isModified()).toBe(false)
    expect(read().depth).toBe(DEFAULT_DESIGN.depth)
  })
  it('allows only materials compatible with the selected process', () => {
    expect(isMaterialCompatible({ process: 'Sls' }, 'Sls')).toBe(true)
    expect(isMaterialCompatible({ process: 'Sls' }, 'Sla')).toBe(false)
  })
  it('sets a compatible material when process changes', () => {
    read().resetDesign()
    read().setProcess('Sla')
    expect(read().selectedProcess).toBe('Sla')
    expect(read().selectedMaterialId).toBe('resin-sla')
  })
  it('switches between solid, optimized, and compare design views', () => {
    read().resetDesign()
    read().setDesignViewMode('optimized')
    expect(read().designViewMode).toBe('optimized')
    read().setDesignViewMode('compare')
    expect(read().designViewMode).toBe('compare')
    read().setDesignViewMode('solid')
    expect(read().designViewMode).toBe('solid')
  })
  it('exposes every design parameter through a typed setter', () => {
    const parameters: DesignParameter[] = ['length', 'height', 'depth', 'wallThickness', 'holeRadius', 'latticeDensity']
    read().resetDesign()
    parameters.forEach((parameter) => read().setParameter(parameter, 1))
    expect(read().latticeDensity).toBe(1)
    expect(read().holeRadius).toBeGreaterThan(0)
  })
})
