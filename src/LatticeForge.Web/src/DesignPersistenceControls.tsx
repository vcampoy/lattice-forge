import { Download, FileJson, Save, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { createDesignExportJson, DESIGN_SCHEMA_VERSION, getDesign, getRecentDesigns, ILLUSTRATIVE_DATA_DISCLAIMER, sanitizeFilename, saveDesign, type PersistedDesign } from './designPersistence'
import { createOptimizedExportScene, disposeOptimizedExportScene } from './geometry/optimizedExport'
import { useDesignStore } from './useDesignStore'

function downloadFile(filename: string, content: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function DesignPersistenceControls() {
  const design = useDesignStore()
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isRecentOpen, setIsRecentOpen] = useState(false)
  const [name, setName] = useState('')
  const [recentDesigns, setRecentDesigns] = useState<readonly PersistedDesign[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const saveTriggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const parameters = useMemo(() => ({
    length: design.length,
    height: design.height,
    depth: design.depth,
    wallThickness: design.wallThickness,
    holeRadius: design.holeRadius,
    latticeDensity: design.latticeDensity,
  }), [design.depth, design.height, design.holeRadius, design.latticeDensity, design.length, design.wallThickness])

  const currentDesign = { name: name || 'Lattice design', parameters, materialId: design.selectedMaterialId, process: design.selectedProcess }

  useEffect(() => {
    if (!isSaveOpen) return

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsSaveOpen(false)
        saveTriggerRef.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isSaveOpen])

  async function handleSave(): Promise<void> {
    if (!name.trim()) {
      setError('Design name is required.')
      return
    }
    try {
      setError(null)
      const saved = await saveDesign({ ...currentDesign, name })
      setName(saved.name)
      setIsSaveOpen(false)
      saveTriggerRef.current?.focus()
      setStatus(`Saved ${saved.name}.`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Design could not be saved.')
    }
  }

  async function handleRecentToggle(): Promise<void> {
    setIsRecentOpen((open) => !open)
    if (isRecentOpen) return
    try {
      setError(null)
      setRecentDesigns(await getRecentDesigns())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Recent designs could not be loaded.')
    }
  }

  async function handleLoad(id: string): Promise<void> {
    try {
      setError(null)
      const loaded = await getDesign(id)
      design.loadDesign({ ...loaded.parameters, latticeDensity: loaded.parameters.latticeDensity * 100 }, loaded.process, loaded.materialId)
      setName(loaded.name)
      setStatus(`Loaded ${loaded.name}. Camera kept.`)
      setIsRecentOpen(false)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Design could not be loaded.')
    }
  }

  function handleExportStl(): void {
    let scene: ReturnType<typeof createOptimizedExportScene> | undefined
    try {
      scene = createOptimizedExportScene(currentDesign.parameters)
      const output = new STLExporter().parse(scene, { binary: true })
      const content: BlobPart = typeof output === 'string' ? output : output.buffer as ArrayBuffer
      downloadFile(`${sanitizeFilename(name || 'lattice-design')}.stl`, content, 'model/stl')
      setError(null)
      setStatus('STL export ready.')
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'STL export failed.')
    } finally {
      if (scene) disposeOptimizedExportScene(scene)
    }
  }

  function handleExportJson(): void {
    try {
      const json = createDesignExportJson(currentDesign)
      downloadFile(`${sanitizeFilename(name || 'lattice-design')}.json`, json, 'application/json')
      setError(null)
      setStatus(`Design JSON export ready. Schema ${DESIGN_SCHEMA_VERSION}.`)
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Design JSON export failed.')
    }
  }

  return (
    <div className="design-persistence" aria-label="Design persistence and export">
      <button ref={saveTriggerRef} className="topbar-action" type="button" onClick={() => { setError(null); setIsSaveOpen(true) }} aria-haspopup="dialog"><Save size={14} /> Save Design</button>
      <button className="topbar-action" type="button" onClick={() => void handleRecentToggle()} aria-haspopup="true" aria-controls="recent-designs-popover" aria-expanded={isRecentOpen}><Upload size={14} /> Recent Designs</button>
      <button className="topbar-action" type="button" onClick={handleExportStl}><Download size={14} /> Export STL</button>
      <button className="topbar-action" type="button" onClick={handleExportJson}><FileJson size={14} /> Export JSON</button>
      {status && <span className="persistence-status" role="status" aria-live="polite">{status}</span>}
      {error && !isSaveOpen && <div className="persistence-error" role="alert">{error}</div>}
      {isSaveOpen && (
        <div className="persistence-dialog-backdrop">
            <div ref={dialogRef} className="persistence-dialog" role="dialog" aria-modal="true" aria-labelledby="save-design-title" aria-describedby="save-design-description">
            <h2 id="save-design-title">Save Design</h2>
            <p id="save-design-description">Save the current geometry, material, and process selection.</p>
            <label htmlFor="design-name">Design name</label>
            <input id="design-name" type="text" maxLength={80} value={name} autoFocus required aria-invalid={Boolean(error)} aria-errormessage={error ? 'save-design-error' : undefined} onChange={(event) => { setName(event.target.value); if (error) setError(null) }} />
            {error && <p id="save-design-error" className="persistence-dialog-error" role="alert">{error}</p>}
            <div className="persistence-dialog-actions">
              <button type="button" onClick={() => { setIsSaveOpen(false); saveTriggerRef.current?.focus() }}>Cancel</button>
              <button type="button" onClick={() => void handleSave()}>Save</button>
            </div>
          </div>
        </div>
      )}
      {isRecentOpen && (
        <div id="recent-designs-popover" className="recent-designs-popover" role="region" aria-label="Recent designs">
          <strong>Recent Designs</strong>
          {recentDesigns.length === 0 ? <p>No saved designs.</p> : recentDesigns.map((recent) => (
            <button key={recent.id} type="button" onClick={() => void handleLoad(recent.id)}>
              <span>{recent.name}</span><small>{new Date(recent.updatedAt).toLocaleDateString()}</small>
            </button>
          ))}
          <p className="persistence-disclaimer">{ILLUSTRATIVE_DATA_DISCLAIMER}</p>
        </div>
      )}
    </div>
  )
}
