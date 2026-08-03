import { describe, expect, it } from 'vitest'
import { calculateOverhangRisk, getRiskColor, type ManufacturingProcess } from './heatmapRisk'

describe('deterministic overhang heatmap', () => {
  it('increases risk when surface normal falls below process threshold', () => {
    const normal = { x: 0, y: 0.3, z: 0 }
    expect(calculateOverhangRisk(normal, 'MetalLpbf')).toBeGreaterThan(calculateOverhangRisk(normal, 'Sls'))
  })

  it('returns stable risk and colour for the same orientation and process', () => {
    const input: { x: number; y: number; z: number } = { x: 0.2, y: 0.48, z: 0.1 }
    const first = calculateOverhangRisk(input, 'Sla')
    expect(calculateOverhangRisk(input, 'Sla')).toBe(first)
    expect(getRiskColor(first)).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('keeps non-colour warning mode available for every process', () => {
    const processes: readonly ManufacturingProcess[] = ['Sls', 'Sla', 'MetalLpbf']
    for (const process of processes) expect(calculateOverhangRisk({ x: 0, y: -1, z: 0 }, process)).toBe(1)
  })
})
