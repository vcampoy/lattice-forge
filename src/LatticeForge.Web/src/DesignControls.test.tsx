import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DesignControls } from './DesignControls'
import { useDesignStore } from './useDesignStore'
afterEach(() => {
  cleanup()
  useDesignStore.getState().resetDesign()
})
describe('DesignControls', () => {
  it('renders labelled range and numeric controls for every design dimension', () => {
    render(<DesignControls materials={[{ id: 'aluminum-sls', name: 'Aluminium PA', process: 'Sls' }]} />)
    expect(screen.getByRole('slider', { name: /overall length/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /overall length/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /overall height/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /overall height/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /depth/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /depth/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /wall thickness/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /wall thickness/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /hole radius/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /hole radius/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /lattice density/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /lattice density/i })).toBeInTheDocument()
  })
  it('updates the same store when a range is dragged and supports presets/reset', () => {
    render(<DesignControls materials={[{ id: 'aluminum-sls', name: 'Aluminium PA', process: 'Sls' }]} />)
    fireEvent.change(screen.getByRole('slider', { name: /overall length/i }), { target: { value: '160' } })
    expect(useDesignStore.getState().length).toBe(160)
    fireEvent.click(screen.getByRole('button', { name: /lightweight/i }))
    expect(useDesignStore.getState().activePreset).toBe('Lightweight')
    fireEvent.click(screen.getByRole('button', { name: /reset design/i }))
    expect(useDesignStore.getState().activePreset).toBe('Balanced')
  })
  it('excludes incompatible materials when process changes', () => {
    render(<DesignControls materials={[
      { id: 'aluminum-sls', name: 'Aluminium PA', process: 'Sls' },
      { id: 'resin-sla', name: 'Clear Resin', process: 'Sla' },
    ]} />)
    fireEvent.change(screen.getByRole('combobox', { name: /manufacturing process/i }), { target: { value: 'Sla' } })
    expect(screen.queryByRole('option', { name: /aluminium/i })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /clear resin/i })).toBeInTheDocument()
  })
})
