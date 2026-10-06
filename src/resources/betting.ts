import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  FetchBettingProvidersResponse,
  BettingLookupRequest,
  BettingLookupResponse,
  BettingVendingRequest,
  BettingVendingResponse,
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

  /** @deprecated Docs: v1 is deprecated, use `vendBettingViaParentAccountV2` (`POST /v2/bill/betting`). */
  async vendBettingViaParentAccount(request: BettingVendingRequest): Promise<BettingVendingResponse> {
    validateBody('post', '/v1/bill/betting', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/betting', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `vendBettingViaSubAccountV2` (`POST /v2/bill/betting/{subAccountId}`). */
  async vendBettingViaSubAccount(subAccountId: string, request: BettingVendingRequest): Promise<BettingVendingResponse> {
    validateBody('post', '/v1/bill/betting/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/betting/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async vendBettingViaParentAccountV2(request: BettingVendingRequest): Promise<BettingVendingV2Response> {
    validateBody('post', '/v2/bill/betting', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/betting', request as unknown as Record<string, unknown>)
  }

  async vendBettingViaSubAccountV2(subAccountId: string, request: BettingVendingRequest): Promise<BettingVendingV2Response> {
    validateBody('post', '/v2/bill/betting/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/betting/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}