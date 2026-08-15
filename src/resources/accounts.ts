import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  ListAllAccountsResponse,
  FetchAccountDetailsResponse,
  FetchTerminalsAssignedToAccountResponse,
  FetchAccountBalanceResponse,
  SuspendAccountResponse,
  ReactivateAccountResponse,
  UpdateAccountAccessResponse,
  CreateSubAccountResponse,
} from '../types/models'

export interface CreateSubAccountRequest {
  accountRef: string
  phoneNumber: string
  email: string
  bvn: string
  pin: string
  accountName: string
  currency: string
  callbackUrl?: string
  expiryDate?: string
}

export interface UpdateAccountAccessRequest {
  grantType: 'allow' | 'deny'
  clientId: string
  role: string
}

export class Accounts {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async listAllAccounts(limit?: string, cursor?: string): Promise<ListAllAccountsResponse> {
    return this.client.get('/v1/accounts', { limit, cursor } as unknown as Record<string, unknown>)
  }

  async createSubAccount(request: CreateSubAccountRequest): Promise<CreateSubAccountResponse> {
    validateBody('post', '/v1/accounts', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/accounts', request as unknown as Record<string, unknown>)
  }

  async fetchAccountDetails(
    options: { accountId?: string; accountRef?: string } = {}
  ): Promise<FetchAccountDetailsResponse> {
    return this.client.get('/v1/accounts/sub-account-details', options as unknown as Record<string, unknown>)
  }

  async fetchParentAccountDetails(): Promise<FetchAccountDetailsResponse> {
    return this.client.get('/v1/accounts/parent')
  }

  async fetchParentAccountBalance(): Promise<FetchAccountBalanceResponse> {
    return this.client.get('/v1/accounts/balance')
  }

  async fetchSubAccountBalance(subAccountId: string): Promise<FetchAccountBalanceResponse> {
    return this.client.get(`/v1/accounts/${subAccountId}/balance`)
  }

  async suspendSubAccount(subAccountId: string): Promise<SuspendAccountResponse> {
    return this.client.put(`/v1/accounts/suspend/${subAccountId}`)
  }

  async reactivateSubAccount(subAccountId: string): Promise<ReactivateAccountResponse> {
    return this.client.put(`/v1/accounts/reactivate/${subAccountId}`)
  }

  async updateAccountAccess(subAccountId: string, request: UpdateAccountAccessRequest): Promise<UpdateAccountAccessResponse> {
    validateBody('put', '/v1/accounts/{subAccountId}/access', request as unknown as Record<string, unknown>)
    return this.client.put(`/v1/accounts/${subAccountId}/access`, request as unknown as Record<string, unknown>)
  }

  async fetchTerminalsAssignedToAccount(accountId: string): Promise<FetchTerminalsAssignedToAccountResponse> {
    return this.client.get(`/v1/accounts/${accountId}/terminals`)
  }

  async fetchTerminalsAssignedToParentAccount(): Promise<FetchTerminalsAssignedToAccountResponse> {
    return this.client.get('/v1/accounts/terminals')
  }
}