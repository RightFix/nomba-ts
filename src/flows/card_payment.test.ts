import { describe, it, expect } from 'vitest'
import { CardPaymentFlow } from './card_payment'
import type { Charge } from '../resources/charge'

function stubCharge(submitResponse: unknown) {
  return {
    submitCustomerCardDetails: async () => submitResponse,
    submitCustomerCardOtp: async () => submitResponse,
    resendCustomerOtp: async () => ({}),
    confirmTransactionReceipt: async () => ({}),
    cancelCheckoutTransaction: async () => ({}),
  } as unknown as Charge
}

const envelope = (data: Record<string, unknown>) => ({ code: '00', description: 'Success', data })

describe('CardPaymentFlow response codes', () => {
  it('treats 00 as completed', async () => {
    const flow = new CardPaymentFlow(
      stubCharge(envelope({ responseCode: '00', status: true, transactionId: 'tx-1' })),
      'order-1'
    )
    const step = await flow.submitCard({ cardDetails: '{}', key: '' })
    expect(step.completed).toBe(true)
    expect(step.requiresOtp).toBe(false)
    expect(step.requires3ds).toBe(false)
  })

  it('treats T0 as OTP required', async () => {
    const flow = new CardPaymentFlow(
      stubCharge(envelope({ responseCode: 'T0', status: true, transactionId: 'tx-1' })),
      'order-1'
    )
    const step = await flow.submitCard({ cardDetails: '{}', key: '' })
    expect(step.requiresOtp).toBe(true)
    expect(step.completed).toBe(false)
  })

  it.each(['S0', 'SO'])('treats %s as 3DS required', async (code) => {
    const flow = new CardPaymentFlow(
      stubCharge(envelope({ responseCode: code, status: true, transactionId: 'tx-1' })),
      'order-1'
    )
    const step = await flow.submitCard({ cardDetails: '{}', key: '' })
    expect(step.requires3ds).toBe(true)
    expect(step.completed).toBe(false)
  })
})
