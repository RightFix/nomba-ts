import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CreateOnlineCheckoutOrderRequest,
  CreateOnlineCheckoutOrderResponse,
  FetchCheckoutOrderResponse,
  FetchCheckoutTransactionDetailsResponse,
  CancelCheckoutTransactionResponse,
} from '../types/models'

export class Checkout {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async createOnlineCheckoutOrder(request: CreateOnlineCheckoutOrderRequest): Promise<CreateOnlineCheckoutOrderResponse> {
    validateBody('post', '/v1/checkout/orders', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/orders', request as unknown as Record<string, unknown>)
  }

  async fetchCheckoutOrder(orderReference: string): Promise<FetchCheckoutOrderResponse> {
    return this.client.get(`/v1/checkout/orders/${orderReference}`)
  }

  async fetchCheckoutTransactionDetails(orderReference: string): Promise<FetchCheckoutTransactionDetailsResponse> {
    return this.client.get(`/v1/checkout/orders/${orderReference}/transaction`)
  }

  async cancelCheckoutTransaction(transactionId: string, forceCancel?: boolean): Promise<CancelCheckoutTransactionResponse> {
    return this.client.post(`/v1/checkout/transactions/${transactionId}/cancel`, { forceCancel } as Record<string, unknown>)
  }
}