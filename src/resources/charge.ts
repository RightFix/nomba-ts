import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  SubmitCustomerCardDetailsRequest,
  SubmitCustomerCardDetailsResponse,
  SubmitCustomerCardOtpRequest,
  SubmitCustomerCardOtpResponse,
  ResendCustomerOtpRequest,
  ResendCustomerOtpResponse,
  FetchCheckoutTransactionDetailsResponse,
  CancelCheckoutTransactionRequest,
  CancelCheckoutTransactionResponse,
} from '../types/models'

export class Charge {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async submitCustomerCardDetails(request: SubmitCustomerCardDetailsRequest): Promise<SubmitCustomerCardDetailsResponse> {
    validateBody('post', '/v1/checkout/checkout-card-detail', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/checkout-card-detail', request as unknown as Record<string, unknown>)
  }

  async submitCustomerCardOtp(request: SubmitCustomerCardOtpRequest): Promise<SubmitCustomerCardOtpResponse> {
    validateBody('post', '/v1/checkout/checkout-card-otp', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/checkout-card-otp', request as unknown as Record<string, unknown>)
  }

  async resendCustomerOtp(request: ResendCustomerOtpRequest): Promise<ResendCustomerOtpResponse> {
    validateBody('post', '/v1/checkout/resend-otp', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/resend-otp', request as unknown as Record<string, unknown>)
  }

  /**
   * Confirm a card/transfer payment after OTP or transfer.
   * Docs name: "Fetch checkout transaction details"
   * (`POST /v1/checkout/confirm-transaction-receipt`).
   * Distinct from `GET /v1/checkout/transaction` (rich order details,
   * production only) and `GET /v1/transactions/accounts/single`
   * (sandbox + production status check) — use those for verification
   * before delivering value.
   */
  async confirmTransactionReceipt(
    orderReference: string
  ): Promise<FetchCheckoutTransactionDetailsResponse> {
    validateBody('post', '/v1/checkout/confirm-transaction-receipt', { orderReference } as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/confirm-transaction-receipt', { orderReference } as unknown as Record<string, unknown>)
  }

  async cancelCheckoutTransaction(request: CancelCheckoutTransactionRequest): Promise<CancelCheckoutTransactionResponse> {
    validateBody('post', '/v1/checkout/transaction/cancel', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/transaction/cancel', request as unknown as Record<string, unknown>)
  }
}