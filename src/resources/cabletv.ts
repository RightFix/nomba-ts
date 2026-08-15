import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CableTvLookupRequest,
  CableTvLookupResponse,
  CableTvSubscriptionRequest,
  CableTvSubscriptionResponse,
} from '../types/models'

export class CableTv {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async cableTvLookup(request: CableTvLookupRequest): Promise<CableTvLookupResponse> {
    return this.client.get('/v1/bill/cabletv/lookup', request as unknown as Record<string, unknown>)
  }

  async cableTvSubscriptionViaParentAccount(request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionResponse> {
    validateBody('post', '/v1/bill/cabletv', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/cabletv', request as unknown as Record<string, unknown>)
  }

  async cableTvSubscriptionViaSubAccount(subAccountId: string, request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionResponse> {
    validateBody('post', '/v1/bill/cabletv/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/cabletv/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}