import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
describe('Lattice Forge workspace shell', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })
  it('App_should_expose_major_workspace_regions_when_rendered', () => {
    vi.stubGlobal('fetch', createApiFetchMock())
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /design controls/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /3d design viewport/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /manufacturing analysis/i })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
  it('App_should_use_waiting_states_when_analysis_does_not_exist', () => {
    render(<App />)
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText(/awaiting analysis/i)).toBeInTheDocument()
  })

  it('App_should_keep_viewport_when_design_panel_is_collapsed', async () => {
    render(<App />)

    const designToggle = screen.getByRole('button', { name: /collapse design controls/i })
    fireEvent.click(designToggle)

    expect(designToggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/parametric envelope/i)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: /3d design viewport/i })).toBeInTheDocument()
  })

  it('App_should_request_health_and_materials_when_mounted', async () => {
    const fetchMock = createApiFetchMock()
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({ signal: expect.any(AbortSignal) }))
      expect(fetchMock).toHaveBeenCalledWith('/api/materials', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    })
    expect(await screen.findByText('API online')).toBeInTheDocument()
    expect(await screen.findByRole('option', { name: /controller material/i })).toBeInTheDocument()
  })

  it('App_should_keep_fallback_materials_when_materials_controller_is_unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      if (input === '/api/health') {
        return Promise.resolve(new Response(JSON.stringify({ status: 'ok', service: 'Lattice Forge API' }), { status: 200 }))
      }
      if (input === '/api/materials') {
        return Promise.resolve(new Response(null, { status: 503 }))
      }
      return Promise.resolve(new Response(JSON.stringify(createAnalysisResponse()), { status: 200 }))
    }))

    render(<App />)

    expect(await screen.findByRole('option', { name: /aluminium pa/i })).toBeInTheDocument()
  })
})

function createApiFetchMock() {
  return vi.fn((input: RequestInfo | URL) => {
    if (input === '/api/health') {
      return Promise.resolve(new Response(JSON.stringify({ status: 'ok', service: 'Lattice Forge API' }), { status: 200 }))
    }
    if (input === '/api/materials') {
      return Promise.resolve(new Response(JSON.stringify([
        { id: 'controller-material', name: 'Controller Material', process: 'Sls' },
      ]), { status: 200 }))
    }
    return Promise.resolve(new Response(JSON.stringify(createAnalysisResponse()), { status: 200 }))
  })
}

function createAnalysisResponse() {
  return {
    solidVolume: 100,
    optimizedVolume: 60,
    estimatedWeight: 160,
    estimatedCost: 12.5,
    estimatedPrintMinutes: 90,
    materialReductionPercent: 40,
    printabilityScore: 88,
    supportRisk: 'Low',
    warnings: [],
    illustrativeEstimate: true,
  }
}
