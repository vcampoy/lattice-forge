export const apiRoutes = {
  health: '/api/health',
  materials: '/api/materials',
  analyses: '/api/analyses',
  designs: '/api/designs',
  design: (id: string): string => `/api/designs/${encodeURIComponent(id)}`,
} as const

export type ApiProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  traceId?: string
  errors?: Readonly<Record<string, readonly string[]>>
}

export type ApiProblem = {
  message: string
  detail?: string
}

export async function readApiProblem(response: Response, fallback: string): Promise<ApiProblem> {
  try {
    const payload: unknown = await response.json()
    if (payload && typeof payload === 'object') {
      const problem = payload as ApiProblemDetails
      if (typeof problem.detail === 'string' && problem.detail.trim().length > 0) {
        return { message: problem.detail, detail: problem.detail }
      }
      if (typeof problem.title === 'string' && problem.title.trim().length > 0) {
        return { message: problem.title, detail: undefined }
      }
    }
  } catch {
    // Use the caller-provided status fallback when the response is not Problem Details JSON.
  }

  return { message: fallback, detail: undefined }
}
