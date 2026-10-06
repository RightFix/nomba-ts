import { describe, it, expect } from 'vitest'
import {
  computeSignature,
  verifyWebhookRequest,
  verifyWebhookSignature,
} from './webhooks'

// Payload and expected signature taken verbatim from the Nomba webhook docs.
const DOCS_PAYLOAD = {
  event_type: 'payment_success',
  requestId: '9d3b6f1e-2c4a-4e8b-a7d5-1f0c3e9b8a26',
  data: {
    merchant: {
      walletId: '66f2a91c4be7d3a5c1e08b47',
      walletBalance: 6052,
      userId: '3c8e1f72-5a9d-4b16-8e2f-7d4c0a9b6e53',
    },
    terminal: {},
    transaction: {
      aliasAccountNumber: '5343270516',
      fee: 5,
      sessionId: '100004250929105143781234567890',
      type: 'vact_transfer',
      transactionId: 'API-VACT_TRA-3C8E1-a4f7c2d9-6b1e-4f38-9c5a-2e8d7b0f1c64',
      aliasAccountName: 'SAMPLE/JOHN DOE',
      responseCode: '',
      originatingFrom: 'api',
      transactionAmount: 10,
      narration: 'John Doe Transfer 10.00 To SAMPLE/JOHN DOE - Nomba',
      time: '2025-09-29T10:51:44Z',
      aliasAccountReference: '66f2a9e7c1d84b3a5f0e2c19',
      aliasAccountType: 'VIRTUAL',
    },
    customer: {
      bankCode: '090645',
      senderName: 'John Doe',
      bankName: 'Nombank',
      accountNumber: '0000000000',
    },
  },
} as unknown as Parameters<typeof computeSignature>[1]

const DOCS_SECRET = 'SampleSignatureKey123'
const DOCS_TIMESTAMP = '2025-09-29T10:51:44Z'
const DOCS_SIGNATURE = 'q30yFZDyykoymBf9+mt1wz5UAuLk57raPGPHlGzIv00='

describe('webhook signature (Nomba docs vector)', () => {
  it('reproduces the documented signature', () => {
    expect(computeSignature(DOCS_SECRET, DOCS_PAYLOAD, DOCS_TIMESTAMP)).toBe(DOCS_SIGNATURE)
  })

  it('accepts the nomba-sig-value header alias', () => {
    const payload = verifyWebhookRequest(DOCS_SECRET, {
      body: JSON.stringify(DOCS_PAYLOAD),
      headers: { 'nomba-sig-value': DOCS_SIGNATURE, 'nomba-timestamp': DOCS_TIMESTAMP },
      maxAgeSeconds: null,
    })
    expect(payload.event_type).toBe('payment_success')
  })

  it('returns false (not throw) on length-mismatched signatures', () => {
    expect(verifyWebhookSignature(DOCS_SECRET, DOCS_PAYLOAD, 'short', DOCS_TIMESTAMP)).toBe(false)
  })

  it('treats a "null" responseCode as empty, per docs samples', () => {
    const withNull = structuredClone(DOCS_PAYLOAD) as typeof DOCS_PAYLOAD & {
      data: { transaction: { responseCode: string } }
    }
    withNull.data.transaction.responseCode = 'null'
    const withEmpty = structuredClone(DOCS_PAYLOAD) as typeof DOCS_PAYLOAD & {
      data: { transaction: { responseCode: string } }
    }
    withEmpty.data.transaction.responseCode = ''
    expect(computeSignature(DOCS_SECRET, withNull, DOCS_TIMESTAMP)).toBe(
      computeSignature(DOCS_SECRET, withEmpty, DOCS_TIMESTAMP)
    )
  })
})
