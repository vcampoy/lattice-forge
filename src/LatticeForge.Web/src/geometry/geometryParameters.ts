export type BracketGeometryParameters = {
  length: number
  height: number
  depth: number
  wallThickness: number
  holeRadius: number
}

export const DEFAULT_BRACKET_GEOMETRY: BracketGeometryParameters = {
  length: 120,
  height: 80,
  depth: 40,
  wallThickness: 4,
  holeRadius: 8,
}

const MIN_HOLE_CLEARANCE = 0.1

export type BracketSilhouetteDimensions = {
  armHeight: number
  webHalfWidth: number
}

export function getBracketSilhouetteDimensions(parameters: BracketGeometryParameters): BracketSilhouetteDimensions {
  const halfLength = parameters.length / 2
  const halfHeight = parameters.height / 2
  const armHeight = Math.min(
    halfHeight - MIN_HOLE_CLEARANCE,
    Math.max(parameters.wallThickness * 2.5, parameters.height * 0.2),
  )
  const webHalfWidth = Math.min(
    halfLength - MIN_HOLE_CLEARANCE,
    Math.max(parameters.wallThickness * 2, parameters.length * 0.14),
  )

  return { armHeight, webHalfWidth }
}

export function getBracketHoleRadiusLimit(parameters: Pick<BracketGeometryParameters, 'length' | 'height' | 'wallThickness'>): number {
  const { armHeight } = getBracketSilhouetteDimensions({
    length: parameters.length,
    height: parameters.height,
    depth: 1,
    wallThickness: parameters.wallThickness,
    holeRadius: MIN_HOLE_CLEARANCE,
  })
  const halfLength = parameters.length / 2
  const holeX = halfLength * 0.57
  return Math.max(MIN_HOLE_CLEARANCE, Math.min(armHeight / 2, halfLength - holeX))
}

const LENGTH_LIMITS = { min: 60, max: 180 }
const HEIGHT_LIMITS = { min: 40, max: 140 }
const DEPTH_LIMITS = { min: 20, max: 80 }
const WALL_THICKNESS_LIMITS = { min: 1, max: 16 }

function clampFinite(value: number | undefined, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(max, Math.max(min, value))
}

/**
 * Normalize UI values before they reach Shape/ExtrudeGeometry.
 * Scene scale is 1 world unit = 1 millimetre; values stay in millimetres.
 */
export function normalizeBracketParameters(
  input: Partial<BracketGeometryParameters> = {},
): BracketGeometryParameters {
  const length = clampFinite(input.length, DEFAULT_BRACKET_GEOMETRY.length, LENGTH_LIMITS.min, LENGTH_LIMITS.max)
  const height = clampFinite(input.height, DEFAULT_BRACKET_GEOMETRY.height, HEIGHT_LIMITS.min, HEIGHT_LIMITS.max)
  const depth = clampFinite(input.depth, DEFAULT_BRACKET_GEOMETRY.depth, DEPTH_LIMITS.min, DEPTH_LIMITS.max)
  const wallThickness = clampFinite(
    input.wallThickness,
    DEFAULT_BRACKET_GEOMETRY.wallThickness,
    WALL_THICKNESS_LIMITS.min,
    Math.min(WALL_THICKNESS_LIMITS.max, Math.min(length, height) / 2 - MIN_HOLE_CLEARANCE),
  )
  const faceHoleRadiusLimit = Math.max(
    MIN_HOLE_CLEARANCE,
    Math.min(length, height) / 2 - wallThickness - MIN_HOLE_CLEARANCE,
  )
  const holeRadiusLimit = Math.min(faceHoleRadiusLimit, getBracketHoleRadiusLimit({ length, height, wallThickness }))
  const holeRadius = clampFinite(input.holeRadius, DEFAULT_BRACKET_GEOMETRY.holeRadius, MIN_HOLE_CLEARANCE, holeRadiusLimit)

  return { length, height, depth, wallThickness, holeRadius }
}
