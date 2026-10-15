import { describe, it, expect } from 'vitest'
import { validateBody } from '../utils/validation'
import { NombaValidationError } from '../exceptions'

const BASE_TRANSFER = {
  amount: '500',
  sourceCurrency: 'USD',
  destinationCurrency: 'USD',
  receiverName: 'John Cena',
  sourceCountryIsoCode: 'CD',
  destinationCountryIsoCode: 'CD',
  authCode: 'auth-1',
  paymentMethod: 'MobileMoney',
  accountType: 'INDIVIDUAL',
  accountNumber: '0903086112',
}

describe('authorize transfer idempotency', () => {
  it('flags missing required fields', () => {
    try {
      validateBody('post', '/v1/global-payout/transfer/authorize', {})
      expect.unreachable('expected NombaValidationError')
    } catch (e) {
      expect(e).toBeInstanceOf(NombaValidationError)
      expect((e as NombaValidationError).missing).toContain('amount')
    }
  })

  it('accepts an idempotencyKey for safe retries', () => {
    expect(() =>
      validateBody('post', '/v1/global-payout/transfer/authorize', {
        ...BASE_TRANSFER,
        idempotencyKey: '5e246f9a-3e79-4b11-92f1-dbd98b53b308',
      })
    ).not.toThrow()
  })
})
