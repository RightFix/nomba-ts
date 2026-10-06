import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CableTvLookupRequest,
  CableTvLookupResponse,
  CableTvSubscriptionRequest,
  CableTvSubscriptionResponse,
  CableTvSubscriptionV2Response,
} from '../types/models'

export class CableTv {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async cableTvLookup(request: CableTvLookupRequest): Promise<CableTvLookupResponse> {
    return this.client.get('/v1/bill/cabletv/lookup', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `cableTvSubscriptionViaParentAccountV2` (`POST /v2/bill/cabletv`). */
  async cableTvSubscriptionViaParentAccount(request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionResponse> {
    validateBody('post', '/v1/bill/cabletv', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/cabletv', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `cableTvSubscriptionViaSubAccountV2` (`POST /v2/bill/cabletv/{subAccountId}`). */
  async cableTvSubscriptionViaSubAccount(subAccountId: string, request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionResponse> {
    validateBody('post', '/v1/bill/cabletv/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/cabletv/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async cableTvSubscriptionViaParentAccountV2(request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionV2Response> {
    validateBody('post', '/v2/bill/cabletv', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/cabletv', request as unknown as Record<string, unknown>)
  }

  async cableTvSubscriptionViaSubAccountV2(subAccountId: string, request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionV2Response> {
    validateBody('post', '/v2/bill/cabletv/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/cabletv/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}