import { describe, expect, it } from 'vitest'
import { getPasswordRecoveryRedirect, isAppRole, resolveAppReturnPath } from './index'

describe('application roles', () => {
  it('accepts only the two supported roles', () => {
    expect(isAppRole('admin')).toBe(true)
    expect(isAppRole('client')).toBe(true)
    expect(isAppRole('owner')).toBe(false)
    expect(isAppRole(null)).toBe(false)
  })
})

describe('post-login return path', () => {
  it('keeps safe local paths and query strings', () => {
    expect(resolveAppReturnPath('/pedidos?status=novo')).toBe('/pedidos?status=novo')
  })

  it('rejects external and malformed destinations', () => {
    expect(resolveAppReturnPath('//evil.example')).toBe('/')
    expect(resolveAppReturnPath('https://evil.example')).toBe('/')
    expect(resolveAppReturnPath('/\\evil.example')).toBe('/')
  })
})

describe('password recovery redirect', () => {
  it('returns the local callback with the password setup route', () => {
    expect(getPasswordRecoveryRedirect('https://admin.delupa.labafero.com')).toBe(
      'https://admin.delupa.labafero.com/auth/callback?next=%2Fdefinir-senha'
    )
  })
})
