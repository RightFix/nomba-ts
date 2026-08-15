import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  SubmitCustomerCardDetailsRequest,
  SubmitCustomerCardDetailsResponse,
  SubmitCustomerPaymentOtpRequest,
  SubmitCustomerPaymentOtpResponse,
  ResendCustomerPaymentOtpRequest,
  ResendCustomerPaymentOtpResponse,
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
    validateBody('post', '/v1/charge/card', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/charge/card', request as unknown as Record<string, unknown>)
  }

  async submitCustomerPaymentOtp(request: SubmitCustomerPaymentOtpRequest): Promise<SubmitCustomerPaymentOtpResponse> {
    validateBody('post', '/v1/charge/otp', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/charge/otp', request as unknown as Record<string, unknown>)
  }

  async resendCustomerPaymentOtp(request: ResendCustomerPaymentOtpRequest): Promise<ResendCustomerPaymentOtpResponse> {
    validateBody('post', '/v1/charge/otp/resend', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/charge/otp/resend', request as unknown as Record<string, unknown>)
  }

  async fetchCheckoutTransactionDetails(orderReference: string): Promise<FetchCheckoutTransactionDetailsResponse> {
    return this.client.get('/v1/checkout/transaction', { orderReference } as unknown as Record<string, unknown>)
  }

  async cancelCheckoutTransaction(request: CancelCheckoutTransactionRequest): Promise<CancelCheckoutTransactionResponse> {
    validateBody('post', '/v1/checkout/transaction/cancel', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/transaction/cancel', request as unknown as Record<string, unknown>)
  }
}