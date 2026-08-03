import { create } from 'zustand'
import { DEFAULT_BRACKET_GEOMETRY, normalizeBracketParameters, type BracketGeometryParameters } from './geometry/geometryParameters'
import type { ViewMode } from './useWorkspaceStore'
export type ManufacturingProcess = 'Sls' | 'Sla' | 'MetalLpbf'
export type DesignParameter = keyof DesignParameters
export type DesignPresetName = 'Lightweight' | 'Balanced' | 'Reinforced'
export type DesignViewMode = 'solid' | 'optimized' | 'compare'
export type MaterialOption = {
  id: string
  name?: string
  process: ManufacturingProcess
}
export type DesignParameters = BracketGeometryParameters & {
  latticeDensity: number
}
export const DEFAULT_DESIGN: DesignParameters = {
  ...DEFAULT_BRACKET_GEOMETRY,
  latticeDensity: 50,
}
export const PRESETS: Record<DesignPresetName, DesignParameters> = {
  Lightweight: { length: 130, height: 90, depth: 38, wallThickness: 2.5, holeRadius: 10, latticeDensity: 72 },
  Balanced: { ...DEFAULT_DESIGN },
  Reinforced: { length: 110, height: 76, depth: 44, wallThickness: 6, holeRadius: 7, latticeDensity: 25 },
}
export const PROCESS_DEFAULT_MATERIAL: Record<ManufacturingProcess, string> = {
  Sls: 'aluminum-sls',
  Sla: 'resin-sla',
  MetalLpbf: 'titanium-lpbf',
}
const LATTICE_DENSITY_MIN = 0
const LATTICE_DENSITY_MAX = 100
export function isMaterialCompatible(material: Pick<MaterialOption, 'process'>, process: ManufacturingProcess): boolean {
  return material.process === process
}
function clampLatticeDensity(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DESIGN.latticeDensity
  return Math.min(LATTICE_DENSITY_MAX, Math.max(LATTICE_DENSITY_MIN, value))
}
function normalizeDesign(input: Partial<DesignParameters>): DesignParameters {
  const geometry = normalizeBracketParameters(input)
  return { ...geometry, latticeDensity: clampLatticeDensity(input.latticeDensity ?? DEFAULT_DESIGN.latticeDensity) }
}
function equalsDesign(left: DesignParameters, right: DesignParameters): boolean {
  return (Object.keys(DEFAULT_DESIGN) as DesignParameter[]).every((key) => left[key] === right[key])
}
type DesignStore = DesignParameters & {
  selectedProcess: ManufacturingProcess
  selectedMaterialId: string
  viewMode: ViewMode
  designViewMode: DesignViewMode
  activePreset: DesignPresetName
  setParameter: (parameter: DesignParameter, value: number) => void
  applyPreset: (preset: DesignPresetName) => void
  resetDesign: () => void
  setProcess: (process: ManufacturingProcess) => void
  setMaterial: (materialId: string, materials?: readonly MaterialOption[]) => void
  setViewMode: (viewMode: ViewMode) => void
  setDesignViewMode: (viewMode: DesignViewMode) => void
  isModified: () => boolean
}
export const useDesignStore = create<DesignStore>((set, get) => ({
  ...DEFAULT_DESIGN,
  selectedProcess: 'Sls',
  selectedMaterialId: PROCESS_DEFAULT_MATERIAL.Sls,
  viewMode: 'orbit',
  designViewMode: 'solid',
  activePreset: 'Balanced',
  setParameter: (parameter, value) => set((state) => {
    const next = normalizeDesign({ ...state, [parameter]: value })
    return { ...next }
  }),
  applyPreset: (preset) => set(() => ({ ...normalizeDesign(PRESETS[preset]), activePreset: preset })),
  resetDesign: () => set(() => ({ ...DEFAULT_DESIGN, activePreset: 'Balanced', selectedProcess: 'Sls', selectedMaterialId: PROCESS_DEFAULT_MATERIAL.Sls })),
  setProcess: (process) => set(() => ({ selectedProcess: process, selectedMaterialId: PROCESS_DEFAULT_MATERIAL[process] })),
  setMaterial: (materialId, materials) => set((state) => {
    const selected = materials?.find((material) => material.id === materialId)
    if (selected && !isMaterialCompatible(selected, state.selectedProcess)) return state
    return { selectedMaterialId: materialId }
  }),
  setViewMode: (viewMode) => set({ viewMode }),
  setDesignViewMode: (designViewMode) => set({ designViewMode }),
  isModified: () => !equalsDesign(get(), PRESETS[get().activePreset]),
}))
