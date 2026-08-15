import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  PaymentMethod,
  FetchPaymentMethodsResponse,
  InstitutionProvider,
  ListInstitutionProvidersResponse,
  ConvertMoneyRequest,
  ConvertMoneyResponse,
  FetchExchangeRatesResponse,
  AuthorizeTransferRequest,
  AuthorizeTransferResponse,
  AuthorizeExchangeRequest,
  AuthorizeExchangeResponse,
  FetchGlobalPayoutTransactionResponse,
} from '../types/models'

export class GlobalPayout {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async authorizeTransfer(request: AuthorizeTransferRequest): Promise<AuthorizeTransferResponse> {
    validateBody('post', '/v1/global-payout/transfer/authorize', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/global-payout/transfer/authorize', request as unknown as Record<string, unknown>)
  }

  async authorizeExchange(request: AuthorizeExchangeRequest): Promise<AuthorizeExchangeResponse> {
    validateBody('post', '/v1/global-payout/exchange/authorize', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/global-payout/exchange/authorize', request as unknown as Record<string, unknown>)
  }

  async convertMoney(request: ConvertMoneyRequest): Promise<ConvertMoneyResponse> {
    validateBody('post', '/v1/global-payout/money/convert', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/global-payout/money/convert', request as unknown as Record<string, unknown>)
  }

  async fetchExchangeRates(from: string, to: string, region?: string): Promise<FetchExchangeRatesResponse> {
    return this.client.get('/v1/global-payout/exchange-rates', { from, to, region } as unknown as Record<string, unknown>)
  }

  async fetchGlobalPayoutTransaction(transactionId: string): Promise<FetchGlobalPayoutTransactionResponse> {
    return this.client.get(`/v1/global-payout/transactions/${transactionId}`)
  }

  async fetchPaymentMethods(code?: string, name?: string): Promise<FetchPaymentMethodsResponse> {
    return this.client.get('/v1/global-payout/payment-methods', { code, name } as unknown as Record<string, unknown>)
  }

  async listInstitutionProviders(isMobileMoney?: string, countryIsoCode?: string): Promise<ListInstitutionProvidersResponse> {
    return this.client.get('/v1/global-payout/bank/providers', { isMobileMoney, countryIsoCode } as unknown as Record<string, unknown>)
  }
}