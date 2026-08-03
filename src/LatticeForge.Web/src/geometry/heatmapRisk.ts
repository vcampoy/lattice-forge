export type ManufacturingProcess = 'Sls' | 'Sla' | 'MetalLpbf'
export type SurfaceNormal = { x: number; y: number; z: number }

const OVERHANG_THRESHOLDS: Readonly<Record<ManufacturingProcess, number>> = {
  Sls: 0.55,
  Sla: 0.65,
  MetalLpbf: 0.8,
}

export function calculateOverhangRisk(normal: SurfaceNormal, process: ManufacturingProcess): number {
  const threshold = OVERHANG_THRESHOLDS[process]
  const orientationY = Math.min(1, Math.max(-1, normal.y))
  return round(Math.min(1, Math.max(0, (threshold - orientationY) / (threshold + 1))))
}

export function getRiskColor(risk: number): string {
  const value = Math.min(1, Math.max(0, risk))
  if (value < 0.5) return interpolateColor('#39d6b3', '#f4d35e', value * 2)
  return interpolateColor('#f4d35e', '#f05a67', (value - 0.5) * 2)
}

function interpolateColor(start: string, end: string, amount: number): string {
  const channels = [0, 2, 4].map((offset) => Math.round(Number.parseInt(start.slice(1 + offset, 3 + offset), 16) + (Number.parseInt(end.slice(1 + offset, 3 + offset), 16) - Number.parseInt(start.slice(1 + offset, 3 + offset), 16)) * amount))
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function round(value: number): number { return Math.round(value * 100) / 100 }
