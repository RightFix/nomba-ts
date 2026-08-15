import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CreateVirtualAccountResponse,
  FetchVirtualAccountResponse,
  FilterVirtualAccountsResponse,
  FetchVirtualAccountTransactionsResponse,
} from '../types/models'

export interface CreateVirtualAccountRequest {
  accountName: string
  currency?: string
  bankCode?: string
  bankName?: string
}

export interface FilterVirtualAccountsRequest {
  accountName?: string
  accountNumber?: string
  bankCode?: string
  status?: string
  limit?: string
  cursor?: string
}

export class VirtualAccounts {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async createVirtualAccount(request: CreateVirtualAccountRequest): Promise<CreateVirtualAccountResponse> {
    validateBody('post', '/v1/virtual-accounts', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/virtual-accounts', request as unknown as Record<string, unknown>)
  }

  async fetchVirtualAccount(accountRef: string): Promise<FetchVirtualAccountResponse> {
    return this.client.get(`/v1/virtual-accounts/${accountRef}`)
  }

  async filterVirtualAccounts(request: FilterVirtualAccountsRequest = {}): Promise<FilterVirtualAccountsResponse> {
    const { limit, cursor, ...params } = request
    return this.client.get('/v1/virtual-accounts', { ...params, limit, cursor } as unknown as Record<string, unknown>)
  }

  async fetchVirtualAccountTransactions(accountRef: string, limit?: string, cursor?: string): Promise<FetchVirtualAccountTransactionsResponse> {
    return this.client.get(`/v1/virtual-accounts/${accountRef}/transactions`, { limit, cursor } as unknown as Record<string, unknown>)
  }
}