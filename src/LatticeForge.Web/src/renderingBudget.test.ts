import { describe, expect, it } from 'vitest'
import { getRenderBudget } from './renderingBudget'

describe('getRenderBudget', () => {
  it('caps high-density desktop rendering without degrading the desktop visual budget', () => {
    expect(getRenderBudget({ width: 1440, devicePixelRatio: 3 })).toEqual({
      dpr: 1.5,
      latticeInstances: 512,
      shadows: true,
      postProcessing: false,
    })
  })

  it('uses a stable read-only viewport budget on narrow screens', () => {
    expect(getRenderBudget({ width: 390, devicePixelRatio: 3 })).toEqual({
      dpr: 1,
      latticeInstances: 256,
      shadows: false,
      postProcessing: false,
    })
  })
})
