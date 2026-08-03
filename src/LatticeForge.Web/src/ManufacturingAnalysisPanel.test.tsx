import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ManufacturingAnalysisPanel } from './ManufacturingAnalysisPanel'

const result = {
  solidVolume: 120,
  optimizedVolume: 72,
  estimatedWeight: 180.4,
  estimatedCost: 13.2,
  estimatedPrintMinutes: 96,
  materialReductionPercent: 40,
  printabilityScore: 91,
  supportRisk: 'Low',
  warnings: ['Wall thickness is close to the process minimum.'],
  illustrativeEstimate: true,
}

describe('ManufacturingAnalysisPanel', () => {
  it('renders metrics, comparison, warnings, and the illustrative disclosure', () => {
    render(<ManufacturingAnalysisPanel status="success" data={result} error={null} retry={() => undefined} />)
    expect(screen.getByText('91')).toBeInTheDocument()
    expect(screen.getByText(/solid vs optimized/i)).toBeInTheDocument()
    expect(screen.getAllByText(/wall thickness/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/not engineering validation/i)).toBeInTheDocument()
  })

  it('renders retry guidance for unavailable analysis', () => {
    render(<ManufacturingAnalysisPanel status="unavailable" data={null} error="The manufacturing API is unavailable." retry={() => undefined} />)
    expect(screen.getByRole('button', { name: /retry analysis/i })).toBeInTheDocument()
    expect(screen.getAllByText(/unavailable/i).length).toBeGreaterThan(0)
  })
})
