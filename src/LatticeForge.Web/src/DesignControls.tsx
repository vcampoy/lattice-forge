import { useMemo } from 'react'
import {
  DEFAULT_DESIGN,
  PRESETS,
  useDesignStore,
  type DesignParameter,
  type DesignPresetName,
  type ManufacturingProcess,
  type MaterialOption,
} from './useDesignStore'
const PROCESS_LABELS: Record<ManufacturingProcess, string> = {
  Sls: 'SLS · Polymer',
  Sla: 'SLA · Resin',
  MetalLpbf: 'Metal LPBF',
}
const PARAMETER_LABELS: Record<DesignParameter, { label: string; unit: 'mm' | '%'; min: number; max: number; step: number }> = {
  length: { label: 'Overall length', unit: 'mm', min: 60, max: 180, step: 1 },
  height: { label: 'Overall height', unit: 'mm', min: 40, max: 140, step: 1 },
  depth: { label: 'Depth', unit: 'mm', min: 20, max: 80, step: 1 },
  wallThickness: { label: 'Wall thickness', unit: 'mm', min: 1, max: 16, step: 0.5 },
  holeRadius: { label: 'Hole radius', unit: 'mm', min: 0.1, max: 38.9, step: 0.5 },
  latticeDensity: { label: 'Lattice density', unit: '%', min: 0, max: 100, step: 1 },
}
const DESIGN_PARAMETERS: readonly DesignParameter[] = ['length', 'height', 'depth', 'wallThickness', 'holeRadius', 'latticeDensity']
const PRESET_NAMES: readonly DesignPresetName[] = ['Lightweight', 'Balanced', 'Reinforced']
function limitsFor(parameter: DesignParameter, values: Record<DesignParameter, number>) {
  const base = PARAMETER_LABELS[parameter]
  if (parameter === 'wallThickness') {
    return { ...base, max: Math.max(base.min, Math.min(base.max, Math.min(values.length, values.height) / 2 - 0.1)) }
  }
  if (parameter === 'holeRadius') {
    return { ...base, max: Math.max(base.min, Math.min(values.length, values.height) / 2 - values.wallThickness - 0.1) }
  }
  return base
}
export function DesignControls({ materials }: { materials: readonly MaterialOption[] }) {
  const design = useDesignStore()
  const values: Record<DesignParameter, number> = useMemo(() => ({
    length: design.length,
    height: design.height,
    depth: design.depth,
    wallThickness: design.wallThickness,
    holeRadius: design.holeRadius,
    latticeDensity: design.latticeDensity,
  }), [design.depth, design.height, design.holeRadius, design.latticeDensity, design.length, design.wallThickness])
  const availableProcesses = useMemo(() => {
    const processes = new Set(materials.map((material) => material.process))
    return (Object.keys(PROCESS_LABELS) as ManufacturingProcess[]).filter((process) => processes.has(process))
  }, [materials])
  const compatibleMaterials = materials.filter((material) => material.process === design.selectedProcess)
  return (
    <>
      <div className="panel-content design-controls-content">
        <div className="control-group-header">
          <div><span className="section-heading">Parametric envelope</span><span className="section-index">01</span></div>
          <span className={`modified-indicator ${design.isModified() ? 'is-modified' : ''}`} role="status" aria-live="polite">{design.isModified() ? 'Modified' : 'Balanced'}</span>
        </div>
        <div className="preset-row" aria-label="Design presets">
          {PRESET_NAMES.map((preset) => (
            <button key={preset} type="button" className={`preset-button ${design.activePreset === preset ? 'active' : ''}`} aria-pressed={design.activePreset === preset} onClick={() => design.applyPreset(preset)}>{preset}</button>
          ))}
        </div>
        {DESIGN_PARAMETERS.map((parameter) => {
          const config = limitsFor(parameter, values)
          const inputId = `design-${parameter}`
          const numberId = `${inputId}-number`
          return (
            <div className="control-group" key={parameter}>
              <div className="control-label-row">
                <label htmlFor={inputId}>{config.label}</label>
                <output htmlFor={`${inputId} ${numberId}`} aria-label={`${config.label} current value`}>{values[parameter]} <span>{config.unit}</span></output>
              </div>
              <div className="control-input-row">
                <input id={inputId} type="range" min={config.min} max={config.max} step={config.step} value={values[parameter]} aria-label={config.label} onChange={(event) => design.setParameter(parameter, Number(event.target.value))} />
                <input id={numberId} className="control-number" type="number" min={config.min} max={config.max} step={config.step} value={values[parameter]} aria-label={config.label} onChange={(event) => {
                  const value = Number(event.target.value)
                  if (event.target.value !== '' && Number.isFinite(value)) design.setParameter(parameter, value)
                }} />
                <span className="control-unit" aria-hidden="true">{config.unit}</span>
              </div>
            </div>
          )
        })}
        <button className="reset-design-button" type="button" onClick={design.resetDesign}>Reset design</button>
      </div>
      <div className="panel-divider" />
      <div className="panel-content material-selection">
        <div className="section-heading"><span>Material &amp; process</span><span className="section-index">02</span></div>
        <label htmlFor="manufacturing-process">Manufacturing process</label>
        <select id="manufacturing-process" value={design.selectedProcess} aria-label="Manufacturing process" onChange={(event) => design.setProcess(event.target.value as ManufacturingProcess)}>
          {availableProcesses.map((process) => <option key={process} value={process}>{PROCESS_LABELS[process]}</option>)}
        </select>
        <label htmlFor="material">Material</label>
        <select id="material" value={design.selectedMaterialId} aria-label="Material" onChange={(event) => design.setMaterial(event.target.value, materials)}>
          {compatibleMaterials.map((material) => <option key={material.id} value={material.id}>{material.name ?? material.id}</option>)}
        </select>
      </div>
    </>
  )
}
export { DEFAULT_DESIGN, PRESETS }
