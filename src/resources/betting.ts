import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  FetchBettingProvidersResponse,
  BettingLookupRequest,
  BettingLookupResponse,
  BettingVendingRequest,
  BettingVendingV2Response,
} from '../types/models'

export class Betting {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchBettingProviders(): Promise<FetchBettingProvidersResponse> {
    return this.client.get('/v1/bill/betting/providers')
  }

  async bettingCustomerLookup(request: BettingLookupRequest): Promise<BettingLookupResponse> {
    return this.client.get('/v1/bill/betting/lookup', request as unknown as Record<string, unknown>)
  }

  async vendBettingViaParentAccount(request: BettingVendingRequest): Promise<BettingVendingV2Response> {
    validateBody('post', '/v2/bill/betting', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/betting', request as unknown as Record<string, unknown>)
  }

  async vendBettingViaSubAccount(subAccountId: string, request: BettingVendingRequest): Promise<BettingVendingV2Response> {
    validateBody('post', '/v2/bill/betting/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/betting/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}
