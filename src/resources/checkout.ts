import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CreateOnlineCheckoutOrderRequest,
  CreateOnlineCheckoutOrderResponse,
  FetchCheckoutOrderResponse,
  FetchCheckoutTransactionDetailsResponse,
  CancelCheckoutTransactionRequest,
  CancelCheckoutTransactionResponse,
  ChargeTokenizedCardRequest,
  ChargeTokenizedCardResponse,
  ListTokenizedCardsResponse,
  UpdateTokenizedCardRequest,
  UpdateTokenizedCardResponse,
  DeleteTokenizedCardRequest,
  DeleteTokenizedCardResponse,
  RefundCheckoutRequest,
  RefundCheckoutResponse,
  CancelCheckoutOrderRequest,
  CancelCheckoutOrderResponse,
  SubmitCustomerCardDetailsRequest,
  SubmitCustomerCardDetailsResponse,
  SubmitCustomerCardOtpRequest,
  SubmitCustomerCardOtpResponse,
  ResendCustomerOtpRequest,
  ResendCustomerOtpResponse,
  FetchCheckoutFlashAccountResponse,
  RequestOtpBeforeSavingCardRequest,
  RequestOtpBeforeSavingCardResponse,
  RequestOtpForSavedCardsRequest,
  RequestOtpForSavedCardsResponse,
  SubmitUserOtpRequest,
  SubmitUserOtpResponse,
  GetUserSavedCardsResponse,
} from '../types/models'

export class Checkout {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async createOnlineCheckoutOrder(request: CreateOnlineCheckoutOrderRequest): Promise<CreateOnlineCheckoutOrderResponse> {
    validateBody('post', '/v1/checkout/order', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/order', request as unknown as Record<string, unknown>)
  }

  async fetchCheckoutOrder(orderReference: string): Promise<FetchCheckoutOrderResponse> {
    return this.client.get(`/v1/checkout/order/${orderReference}`)
  }

  /**
   * Fetch rich checkout order details (card/transfer/order metadata).
   * Docs: `GET /v1/checkout/transaction?idType=&id=` — production only.
   * For sandbox verification use
   * `Transactions.fetchSingleTransactionOnParentAccount({ orderReference })`
   * (`GET /v1/transactions/accounts/single`) and check `data.status`.
   * Confirm with `transactionDetails.status === 'PAYMENT SUCCESSFUL'`
   * (`statusCode` is the card-processor code and is empty on non-card rails).
   */
  async fetchCheckoutTransactionDetails(
    options: { idType: 'ORDER_ID' | 'ORDER_REFERENCE'; id: string }
  ): Promise<FetchCheckoutTransactionDetailsResponse> {
    return this.client.get('/v1/checkout/transaction', options as unknown as Record<string, unknown>)
  }

  async cancelCheckoutTransaction(request: CancelCheckoutTransactionRequest): Promise<CancelCheckoutTransactionResponse> {
    validateBody('post', '/v1/checkout/transaction/cancel', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/transaction/cancel', request as unknown as Record<string, unknown>)
  }

  async chargeTokenizedCard(request: ChargeTokenizedCardRequest): Promise<ChargeTokenizedCardResponse> {
    validateBody('post', '/v1/checkout/tokenized-card-payment', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/tokenized-card-payment', request as unknown as Record<string, unknown>)
  }

  async listTokenizedCards(): Promise<ListTokenizedCardsResponse> {
    return this.client.get('/v1/checkout/tokenized-card-data')
  }

  async updateTokenizedCard(request: UpdateTokenizedCardRequest): Promise<UpdateTokenizedCardResponse> {
    validateBody('post', '/v1/checkout/tokenized-card-data', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/tokenized-card-data', request as unknown as Record<string, unknown>)
  }

  async deleteTokenizedCard(request: DeleteTokenizedCardRequest): Promise<DeleteTokenizedCardResponse> {
    return this.client.delete('/v1/checkout/tokenized-card-data', request as unknown as Record<string, unknown>)
  }

  async refundCheckoutTransaction(request: RefundCheckoutRequest): Promise<RefundCheckoutResponse> {
    validateBody('post', '/v1/checkout/refund', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/refund', request as unknown as Record<string, unknown>)
  }

  async cancelCheckoutOrder(request: CancelCheckoutOrderRequest): Promise<CancelCheckoutOrderResponse> {
    validateBody('post', '/v1/checkout/order/cancel', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/order/cancel', request as unknown as Record<string, unknown>)
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

  async fetchCheckoutFlashAccountNumber(orderReference: string): Promise<FetchCheckoutFlashAccountResponse> {
    return this.client.get(`/v1/checkout/get-checkout-kta/${orderReference}`)
  }

  async requestOtpBeforeSavingCard(request: RequestOtpBeforeSavingCardRequest): Promise<RequestOtpBeforeSavingCardResponse> {
    validateBody('post', '/v1/checkout/user-card/auth', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/user-card/auth', request as unknown as Record<string, unknown>)
  }

  async requestOtpForSavedCards(request: RequestOtpForSavedCardsRequest): Promise<RequestOtpForSavedCardsResponse> {
    validateBody('post', '/v1/checkout/user-card/saved-card/auth', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/user-card/saved-card/auth', request as unknown as Record<string, unknown>)
  }

  async submitUserOtp(request: SubmitUserOtpRequest): Promise<SubmitUserOtpResponse> {
    validateBody('post', '/v1/checkout/user-card', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/checkout/user-card', request as unknown as Record<string, unknown>)
  }

  async getUserSavedCards(orderReference: string, otp: string): Promise<GetUserSavedCardsResponse> {
    return this.client.get(`/v1/checkout/user-card/${orderReference}`, { otp } as unknown as Record<string, unknown>)
  }
}