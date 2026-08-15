import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CreateVirtualAccountResponse,
  FetchVirtualAccountResponse,
  FilterVirtualAccountsResponse,
  FilterVirtualAccountsRequest,
  UpdateVirtualAccountRequest,
  FetchVirtualAccountTransactionsResponse,
  ExpireVirtualAccountResponse,
} from '../types/models'

export interface CreateVirtualAccountRequest {
  accountRef: string
  accountName: string
  bvn?: string
  expiryDate?: string
  expectedAmount?: number
}

export interface CreateVirtualAccountForSubAccountRequest {
  accountRef: string
  accountName: string
  bvn?: string
  expiryDate?: string
  expectedAmount?: number
}

export class VirtualAccounts {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async createVirtualAccount(request: CreateVirtualAccountRequest): Promise<CreateVirtualAccountResponse> {
    validateBody('post', '/v1/accounts/virtual', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/accounts/virtual', request as unknown as Record<string, unknown>)
  }

  async createVirtualAccountForSubAccount(
    subAccountId: string,
    request: CreateVirtualAccountForSubAccountRequest
  ): Promise<CreateVirtualAccountResponse> {
    validateBody('post', '/v1/accounts/virtual/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/accounts/virtual/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async fetchVirtualAccount(identifier: string): Promise<FetchVirtualAccountResponse> {
    return this.client.get(`/v1/accounts/virtual/${identifier}`)
  }

  async filterVirtualAccounts(request: FilterVirtualAccountsRequest = {}): Promise<FilterVirtualAccountsResponse> {
    validateBody('post', '/v1/accounts/virtual/list', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/accounts/virtual/list', request as unknown as Record<string, unknown>)
  }

  async updateVirtualAccount(identifier: string, request: UpdateVirtualAccountRequest): Promise<FetchVirtualAccountResponse> {
    validateBody('put', '/v1/accounts/virtual/{identifier}', request as unknown as Record<string, unknown>)
    return this.client.put(`/v1/accounts/virtual/${identifier}`, request as unknown as Record<string, unknown>)
  }

  async expireVirtualAccount(identifier: string): Promise<ExpireVirtualAccountResponse> {
    return this.client.delete(`/v1/accounts/virtual/${identifier}`)
  }

  async fetchVirtualAccountTransactions(
    identifier: string,
    limit?: string,
    cursor?: string
  ): Promise<FetchVirtualAccountTransactionsResponse> {
    return this.client.get(`/v1/accounts/virtual/${identifier}/transactions`, { limit, cursor } as unknown as Record<string, unknown>)
  }
}