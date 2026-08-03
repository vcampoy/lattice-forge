import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DesignPersistenceControls } from './DesignPersistenceControls'
import { useDesignStore } from './useDesignStore'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  useDesignStore.getState().resetDesign()
})

describe('DesignPersistenceControls', () => {
  it('opens an accessible save dialog and posts the current design', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response(JSON.stringify({
      id: 'saved-1',
      name: 'Interview bracket',
      createdAt: '2026-08-03T00:00:00Z',
      updatedAt: '2026-08-03T00:00:00Z',
      parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 0.5 },
      materialId: 'aluminum-sls',
      process: 'Sls',
      schemaVersion: 1,
    }), { status: 201 })))
    vi.stubGlobal('fetch', fetchMock)
    render(<DesignPersistenceControls />)

    fireEvent.click(screen.getByRole('button', { name: /save design/i }))
    expect(screen.getByRole('dialog', { name: /save design/i })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: /design name/i }), { target: { value: 'Interview bracket' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/designs', expect.objectContaining({ method: 'POST' })))
    expect(screen.queryByRole('dialog', { name: /save design/i })).not.toBeInTheDocument()
  })

  it('closes the save dialog with Escape and restores focus to its trigger', () => {
    render(<DesignPersistenceControls />)

    const trigger = screen.getByRole('button', { name: /save design/i })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: /save design/i })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('loads a recent design and updates the active design name', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{
        id: 'saved-1',
        name: 'Loaded bracket',
        createdAt: '2026-08-03T00:00:00Z',
        updatedAt: '2026-08-03T00:00:00Z',
        parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 0.5 },
        materialId: 'aluminum-sls',
        process: 'Sls',
        schemaVersion: 1,
      }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 'saved-1',
        name: 'Loaded bracket',
        createdAt: '2026-08-03T00:00:00Z',
        updatedAt: '2026-08-03T00:00:00Z',
        parameters: { length: 120, height: 80, depth: 40, wallThickness: 4, holeRadius: 8, latticeDensity: 0.5 },
        materialId: 'aluminum-sls',
        process: 'Sls',
        schemaVersion: 1,
      }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<DesignPersistenceControls />)

    fireEvent.click(screen.getByRole('button', { name: /recent designs/i }))
    fireEvent.click(await screen.findByRole('button', { name: /loaded bracket/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: /recent designs/i })).toHaveAttribute('aria-expanded', 'false'))
    fireEvent.click(screen.getByRole('button', { name: /save design/i }))
    expect(screen.getByRole('textbox', { name: /design name/i })).toHaveValue('Loaded bracket')
    expect(useDesignStore.getState().latticeDensity).toBe(50)
  })

  it('loads recent designs and shows recoverable errors visibly', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network down'))))
    render(<DesignPersistenceControls />)

    fireEvent.click(screen.getByRole('button', { name: /recent designs/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network down/i)
  })
})
