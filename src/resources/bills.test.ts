import { describe, it, expect } from 'vitest'
import { validateBody } from '../utils/validation'
import { NombaValidationError } from '../exceptions'

describe('bill validation (live spec paths)', () => {
  // Note: the upstream spec only declares `required` for the topup/data
  // schemas; electricity/cabletv/betting schemas list no required fields,
  // so empty bodies pass local validation there (upstream spec gap, the
  // gateway still enforces them).
  it.each([
    '/v2/bill/topup',
    '/v2/bill/topup/{subAccountId}',
    '/v2/bill/data',
    '/v2/bill/data/{subAccountId}',
  ])('flags missing required fields for POST %s', (path) => {
    try {
      validateBody('post', path, {})
      expect.unreachable('expected NombaValidationError')
    } catch (e) {
      expect(e).toBeInstanceOf(NombaValidationError)
      expect((e as NombaValidationError).missing.length).toBeGreaterThan(0)
    }
  })

  it('accepts a complete airtime body', () => {
    expect(() =>
      validateBody('post', '/v2/bill/topup', {
        amount: '100',
        phoneNumber: '08123456788',
        network: 'mtn',
        merchantTxRef: 'REF-1',
      })
    ).not.toThrow()
  })

  it('requires productId for data vending (amount alone is deprecated upstream)', () => {
    expect(() =>
      validateBody('post', '/v2/bill/data', {
        amount: 500,
        phoneNumber: '08123456788',
        network: 'mtn',
        merchantTxRef: 'REF-1',
      })
    ).toThrow(NombaValidationError)
    expect(() =>
      validateBody('post', '/v2/bill/data', {
        productId: 'mtn47',
        phoneNumber: '08123456788',
        network: 'mtn',
        merchantTxRef: 'REF-1',
      })
    ).not.toThrow()
  })
})
