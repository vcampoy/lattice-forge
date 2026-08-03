import { describe, expect, it } from 'vitest'
import { getBracketSilhouetteDimensions, normalizeBracketParameters } from './geometryParameters'

describe('normalizeBracketParameters', () => {
  it('clamps non-finite and out-of-range values to a safe bracket envelope', () => {
    const result = normalizeBracketParameters({
      length: Number.NaN,
      height: 1,
      depth: 500,
      wallThickness: 0,
      holeRadius: 80,
    })

    expect(result).toEqual({
      length: 120,
      height: 40,
      depth: 80,
      wallThickness: 1,
      holeRadius: 4,
    })
  })

  it('keeps valid values stable and limits holes to the smallest face', () => {
    const result = normalizeBracketParameters({
      length: 150,
      height: 90,
      depth: 30,
      wallThickness: 6,
      holeRadius: 40,
    })

    expect(result).toEqual({
      length: 150,
      height: 90,
      depth: 30,
      wallThickness: 6,
      holeRadius: 9,
    })
  })

  it('limits hole radius to the generated mounting arm when the face limit is too large', () => {
    const result = normalizeBracketParameters({
      length: 120,
      height: 80,
      depth: 40,
      wallThickness: 4,
      holeRadius: 30,
    })

    expect(result.holeRadius).toBe(8)
  })

  it('keeps the bracket silhouette inside the envelope at the smallest supported dimensions', () => {
    const parameters = normalizeBracketParameters({
      length: 60,
      height: 40,
      depth: 20,
      wallThickness: 16,
      holeRadius: 3.9,
    })

    const silhouette = getBracketSilhouetteDimensions(parameters)

    expect(silhouette.armHeight).toBeLessThan(parameters.height / 2)
    expect(silhouette.webHalfWidth).toBeLessThan(parameters.length / 2)
  })
})
