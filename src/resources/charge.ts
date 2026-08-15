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

  async fetchCheckoutTransactionDetails(
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