import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
describe('Lattice Forge workspace shell', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })
  it('exposes the major workspace regions with accessible names', () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({ status: 'ok', service: 'Lattice Forge API' })))))
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /design controls/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /3d design viewport/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /manufacturing analysis/i })).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
  it('uses explicit waiting states for metrics before analysis exists', () => {
    render(<App />)
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText(/awaiting analysis/i)).toBeInTheDocument()
  })
})
