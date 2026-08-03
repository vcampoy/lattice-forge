import { describe, expect, it } from 'vitest'
import { calculateLatticeInstances, getLatticeStrutScale, LATTICE_MAX_INSTANCES } from './latticeStructure'
import { DEFAULT_BRACKET_GEOMETRY } from './geometryParameters'

const LATTICE_ENDPOINTS = ['start', 'end'] as const

describe('calculateLatticeInstances', () => {
  it('caps repeated diagonal instances at the documented maximum', () => {
    const instances = calculateLatticeInstances({ ...DEFAULT_BRACKET_GEOMETRY, latticeDensity: 100 })

    expect(instances.length).toBeLessThanOrEqual(LATTICE_MAX_INSTANCES)
    expect(instances.length).toBeGreaterThan(0)
  })

  it('keeps every endpoint inside the bracket envelope', () => {
    const instances = calculateLatticeInstances({ ...DEFAULT_BRACKET_GEOMETRY, latticeDensity: 72 })
    const halfLength = DEFAULT_BRACKET_GEOMETRY.length / 2 - DEFAULT_BRACKET_GEOMETRY.wallThickness
    const halfHeight = DEFAULT_BRACKET_GEOMETRY.height / 2 - DEFAULT_BRACKET_GEOMETRY.wallThickness
    const halfDepth = DEFAULT_BRACKET_GEOMETRY.depth / 2 - DEFAULT_BRACKET_GEOMETRY.wallThickness

    for (const instance of instances) {
      for (const endpoint of LATTICE_ENDPOINTS) {
        const point = instance[endpoint]
        expect(Math.abs(point.x)).toBeLessThanOrEqual(halfLength)
        expect(Math.abs(point.y)).toBeLessThanOrEqual(halfHeight)
        expect(Math.abs(point.z)).toBeLessThanOrEqual(halfDepth)
      }
    }
  })

  it('increases detail monotonically with density', () => {
    const low = calculateLatticeInstances({ ...DEFAULT_BRACKET_GEOMETRY, latticeDensity: 20 })
    const high = calculateLatticeInstances({ ...DEFAULT_BRACKET_GEOMETRY, latticeDensity: 80 })

    expect(high.length).toBeGreaterThan(low.length)
  })

  it('uses the full segment length for instanced struts', () => {
    expect(getLatticeStrutScale(12, 0.6)).toEqual([0.6, 12, 0.6])
  })
})
