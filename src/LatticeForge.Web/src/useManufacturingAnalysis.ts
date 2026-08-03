import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createManufacturingAnalysis, ManufacturingApiError, type ManufacturingAnalysis, type AnalysisRequest } from './manufacturingApi'
import type { BracketGeometryParameters } from './geometry/geometryParameters'
import type { ManufacturingProcess } from './useDesignStore'

export type AnalysisQuery = AnalysisRequest
export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'validation' | 'unavailable' | 'error'
export type AnalysisState = {
  status: AnalysisStatus
  data: ManufacturingAnalysis | null
  error: string | null
  retry: () => void
}

type AnalysisOptions = { debounceMs?: number; enabled?: boolean }

export function useManufacturingAnalysis(query: AnalysisQuery, options: AnalysisOptions = {}): AnalysisState {
  const { debounceMs = 320, enabled = true } = options
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [data, setData] = useState<ManufacturingAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const sequence = useRef(0)
  const queryKey = useMemo(() => JSON.stringify(query), [query])
  const retry = useCallback(() => setRetryKey((key) => key + 1), [])

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return undefined
    }
    const controller = new AbortController()
    const requestSequence = sequence.current + 1
    sequence.current = requestSequence
    const timer = window.setTimeout(async () => {
      setStatus('loading')
      setError(null)
      try {
        const result = await createManufacturingAnalysis(query, controller.signal)
        if (sequence.current !== requestSequence || controller.signal.aborted) return
        setData(result)
        setStatus('success')
      } catch (requestError) {
        if (controller.signal.aborted || (requestError instanceof DOMException && requestError.name === 'AbortError')) return
        if (sequence.current !== requestSequence) return
        if (requestError instanceof ManufacturingApiError && requestError.status === 400) {
          setStatus('validation')
          setError(requestError.detail ?? requestError.message)
        } else if (requestError instanceof ManufacturingApiError && requestError.status === 0) {
          setStatus('unavailable')
          setError(requestError.message)
        } else {
          setStatus('error')
          setError(requestError instanceof Error ? requestError.message : 'Unexpected analysis error.')
        }
      }
    }, Math.max(0, debounceMs))
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [debounceMs, enabled, query, queryKey, retryKey])

  return { status, data, error, retry }
}

export type AnalysisDesignParameters = BracketGeometryParameters & { latticeDensity: number }
export type AnalysisProcess = ManufacturingProcess
