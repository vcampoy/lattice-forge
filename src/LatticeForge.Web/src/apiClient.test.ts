import { describe, expect, it } from 'vitest'
import { apiRoutes, readApiProblem } from './apiClient'

describe('API client contracts', () => {
  it('apiRoutes_should_preserve_controller_routes_when_requested', () => {
    expect(apiRoutes.health).toBe('/api/health')
    expect(apiRoutes.materials).toBe('/api/materials')
    expect(apiRoutes.analyses).toBe('/api/analyses')
    expect(apiRoutes.designs).toBe('/api/designs')
    expect(apiRoutes.design('42')).toBe('/api/designs/42')
  })

  it('design_should_encode_identifier_when_identifier_contains_reserved_characters', () => {
    expect(apiRoutes.design('design/with spaces')).toBe('/api/designs/design%2Fwith%20spaces')
  })

  it('readApiProblem_should_return_detail_when_problem_details_contains_detail', async () => {
    const response = new Response(JSON.stringify({
      type: 'https://example.test/problems/invalid',
      title: 'Request is invalid.',
      status: 400,
      detail: 'Wall thickness is invalid.',
      traceId: 'trace-1',
    }), { status: 400 })

    const result = await readApiProblem(response, 'Request failed.')

    expect(result).toEqual({
      message: 'Wall thickness is invalid.',
      detail: 'Wall thickness is invalid.',
    })
  })

  it('readApiProblem_should_return_title_when_validation_problem_omits_detail', async () => {
    const response = new Response(JSON.stringify({
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: { request: ['The request field is required.'] },
    }), { status: 400 })

    const result = await readApiProblem(response, 'Request failed.')

    expect(result).toEqual({
      message: 'One or more validation errors occurred.',
      detail: undefined,
    })
  })

  it('readApiProblem_should_return_fallback_when_response_is_not_problem_json', async () => {
    const response = new Response('not-json', { status: 500 })

    const result = await readApiProblem(response, 'Request failed with status 500.')

    expect(result).toEqual({
      message: 'Request failed with status 500.',
      detail: undefined,
    })
  })
})
