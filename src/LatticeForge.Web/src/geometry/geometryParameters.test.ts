import { describe, expect, it } from 'vitest'
import { normalizeBracketParameters } from './geometryParameters'

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
      holeRadius: 18.9,
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
      holeRadius: 38.9,
    })
  })
})
