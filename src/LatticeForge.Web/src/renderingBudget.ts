export type RenderBudget = {
  dpr: number
  latticeInstances: number
  shadows: boolean
  postProcessing: boolean
}

export function getRenderBudget({ width, devicePixelRatio }: { width: number; devicePixelRatio: number }): RenderBudget {
  const narrow = width <= 560
  return {
    dpr: narrow ? 1 : Math.min(1.5, Math.max(1, devicePixelRatio)),
    latticeInstances: narrow ? 256 : 512,
    shadows: !narrow,
    postProcessing: false,
  }
}
