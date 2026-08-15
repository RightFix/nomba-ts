import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  ListAllAccountsResponse,
  FetchAccountDetailsResponse,
  FetchTerminalsAssignedToAccountResponse,
} from '../types/models'

export class Accounts {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async listAllAccounts(): Promise<ListAllAccountsResponse> {
    return this.client.get('/v1/accounts')
  }

  async fetchAccountDetails(accountId: string): Promise<FetchAccountDetailsResponse> {
    return this.client.get(`/v1/accounts/${accountId}`)
  }

  async fetchTerminalsAssignedToAccount(accountId: string): Promise<FetchTerminalsAssignedToAccountResponse> {
    return this.client.get(`/v1/accounts/${accountId}/terminals`)
  }

  async fetchTerminalsAssignedToParentAccount(): Promise<FetchTerminalsAssignedToAccountResponse> {
    return this.client.get('/v1/accounts/terminals')
  }
}