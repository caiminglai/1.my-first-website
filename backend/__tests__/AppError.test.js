import { describe, it, expect } from 'vitest'
import { AppError } from '../utils/AppError'

describe('AppError', () => {
  it('creates error with message, code, and default status', () => {
    const err = new AppError('Not found', 'NOT_FOUND')
    expect(err.message).toBe('Not found')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.status).toBe(500)
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
  })

  it('creates error with custom status', () => {
    const err = new AppError('Bad request', 'INVALID_INPUT', 400)
    expect(err.status).toBe(400)
    expect(err.code).toBe('INVALID_INPUT')
  })
})
