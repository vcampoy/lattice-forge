import type { BracketGeometryParameters } from './geometryParameters'

export const LATTICE_MAX_INSTANCES = 512

export type LatticePoint = { x: number; y: number; z: number }
export type LatticeInstance = { start: LatticePoint; end: LatticePoint }

export function getLatticeStrutScale(length: number, radius: number): [number, number, number] {
  return [radius, length, radius]
}

function interpolate(start: number, end: number, index: number, count: number): number {
  return start + ((end - start) * index) / count
}

/** Build a bounded conceptual diagonal lattice. Units are millimetres. */
export function calculateLatticeInstances(parameters: BracketGeometryParameters & { latticeDensity: number }): LatticeInstance[] {
  const density = Math.min(100, Math.max(0, Number.isFinite(parameters.latticeDensity) ? parameters.latticeDensity : 50))
  const xSegments = Math.max(2, Math.round(3 + density * 0.09))
  const ySegments = Math.max(2, Math.round(2 + density * 0.055))
  const zLayers = Math.max(1, Math.round(1 + density * 0.03))
  const inset = Math.min(parameters.wallThickness, Math.min(parameters.length, parameters.height, parameters.depth) / 4)
  const minX = -parameters.length / 2 + inset
  const maxX = parameters.length / 2 - inset
  const minY = -parameters.height / 2 + inset
  const maxY = parameters.height / 2 - inset
  const minZ = -parameters.depth / 2 + inset
  const maxZ = parameters.depth / 2 - inset
  const instances: LatticeInstance[] = []

  for (let layer = 0; layer < zLayers && instances.length < LATTICE_MAX_INSTANCES; layer += 1) {
    const z = zLayers === 1 ? 0 : interpolate(minZ, maxZ, layer, zLayers - 1)
    for (let row = 0; row < ySegments && instances.length < LATTICE_MAX_INSTANCES; row += 1) {
      const y0 = interpolate(minY, maxY, row, ySegments)
      const y1 = interpolate(minY, maxY, row + 1, ySegments)
      for (let column = 0; column < xSegments && instances.length < LATTICE_MAX_INSTANCES; column += 1) {
        const x0 = interpolate(minX, maxX, column, xSegments)
        const x1 = interpolate(minX, maxX, column + 1, xSegments)
        instances.push({ start: { x: x0, y: y0, z }, end: { x: x1, y: y1, z } })
        if (instances.length < LATTICE_MAX_INSTANCES) {
          instances.push({ start: { x: x0, y: y1, z }, end: { x: x1, y: y0, z } })
        }
      }
    }
  }

  return instances
}
