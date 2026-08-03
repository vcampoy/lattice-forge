import '@testing-library/jest-dom/vitest'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useOptimizationSequence } from './useOptimizationSequence'

describe('useOptimizationSequence', () => {
  afterEach(() => vi.restoreAllMocks())

  it('calls reduced-motion completion once outside the state updater', () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn())
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onComplete = vi.fn()
    const { result } = renderHook(() => useOptimizationSequence({ onComplete }))

    act(() => result.current.start())

    expect(result.current.phase).toBe('complete')
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('resets and allows a new run when the design signature changes', () => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const { result, rerender } = renderHook(({ signature }) => useOptimizationSequence({ designSignature: signature }), { initialProps: { signature: 'balanced-sls-a' } })

    act(() => result.current.start())
    expect(result.current.isRunning).toBe(true)
    rerender({ signature: 'balanced-metal-a' })

    expect(result.current.phase).toBe('idle')
    expect(result.current.hasRun).toBe(false)
    act(() => result.current.start())
    expect(result.current.isRunning).toBe(true)
  })
})
