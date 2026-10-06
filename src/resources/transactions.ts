import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  Transaction,
  FetchCreditDebitTransactionsResponse,
  FetchTransactionsOnAccountResponse,
  FilterTransactionsRequest,
  FilterTransactionsResponse,
  FetchSingleTransactionResponse,
  ConfirmTransactionStatusResponse,
} from '../types/models'

export class Transactions {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchCreditDebitTransactionsOnSubAccount(
    subAccountId: string,
    limit?: string,
    cursor?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<FetchCreditDebitTransactionsResponse> {
    return this.client.get(`/v1/transactions/bank/${subAccountId}`, { limit, cursor, dateFrom, dateTo } as unknown as Record<string, unknown>)
  }

  async fetchCreditDebitTransactionsOnParentAccount(
    limit?: string,
    cursor?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<FetchCreditDebitTransactionsResponse> {
    return this.client.get('/v1/transactions/bank', { limit, cursor, dateFrom, dateTo } as unknown as Record<string, unknown>)
  }

  async fetchTransactionsOnSubAccount(
    subAccountId: string,
    limit?: string,
    cursor?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<FetchTransactionsOnAccountResponse> {
    return this.client.get(`/v1/transactions/accounts/${subAccountId}`, { limit, cursor, dateFrom, dateTo } as unknown as Record<string, unknown>)
  }

  async filterSubAccountTransactions(
    subAccountId: string,
    request: FilterTransactionsRequest & { limit?: string; cursor?: string; dateFrom?: string; dateTo?: string } = {}
  ): Promise<FilterTransactionsResponse> {
    const { limit, cursor, dateFrom, dateTo, ...body } = request
    validateBody('post', '/v1/transactions/accounts/{subAccountId}', body as unknown as Record<string, unknown>)
    return this.client.post(`/v1/transactions/accounts/${subAccountId}`, body as unknown as Record<string, unknown>, { limit, cursor, dateFrom, dateTo } as unknown as Record<string, unknown>)
  }

  async fetchTransactionsOnParentAccount(
    limit?: string,
    cursor?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<FetchTransactionsOnAccountResponse> {
    return this.client.get('/v1/transactions/accounts', { limit, cursor, dateFrom, dateTo } as unknown as Record<string, unknown>)
  }

  async filterParentAccountTransactions(
    request: FilterTransactionsRequest & { limit?: string; cursor?: string; dateFrom?: string; dateTo?: string } = {}
  ): Promise<FilterTransactionsResponse> {
    const { limit, cursor, dateFrom, dateTo, ...body } = request
    validateBody('post', '/v1/transactions/accounts', body as unknown as Record<string, unknown>)
    return this.client.post('/v1/transactions/accounts', body as unknown as Record<string, unknown>, { limit, cursor, dateFrom, dateTo } as unknown as Record<string, unknown>)
  }

  async fetchSingleTransactionOnSubAccount(
    subAccountId: string,
    options: { transactionRef?: string; merchantTxRef?: string; orderReference?: string; orderId?: string } = {}
  ): Promise<FetchSingleTransactionResponse> {
    return this.client.get(`/v1/transactions/accounts/${subAccountId}/single`, options as unknown as Record<string, unknown>)
  }

  /**
   * Verify a checkout payment (sandbox + production).
   * Docs: `GET /v1/transactions/accounts/single` with one of
   * `orderReference` (your reference), `orderId` (Nomba-generated id
   * returned as `orderReference` by create-order), `transactionRef`
   * or `merchantTxRef`. Confirm `data.status === 'SUCCESS'` before
   * delivering value. Use DRC credentials for DRC-collected payments.
   */
  async fetchSingleTransactionOnParentAccount(
    options: { transactionRef?: string; merchantTxRef?: string; orderReference?: string; orderId?: string } = {}
  ): Promise<FetchSingleTransactionResponse> {
    return this.client.get('/v1/transactions/accounts/single', options as unknown as Record<string, unknown>)
  }

  async confirmTransactionStatus(sessionId: string): Promise<ConfirmTransactionStatusResponse> {
    return this.client.get(`/v1/transactions/requery/${sessionId}`)
  }
}