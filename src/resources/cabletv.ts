import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  CableTvLookupRequest,
  CableTvLookupResponse,
  CableTvSubscriptionRequest,
  CableTvSubscriptionV2Response,
  FetchCableTvPlansResponse,
} from '../types/models'

export type CableTvProvider = 'dstv' | 'gotv' | 'startimes' | 'showmax'

export class CableTv {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async cableTvLookup(request: CableTvLookupRequest): Promise<CableTvLookupResponse> {
    return this.client.get('/v1/bill/cabletv/lookup', request as unknown as Record<string, unknown>)
  }

  async fetchCableTvPlans(cableTvType: CableTvProvider): Promise<FetchCableTvPlansResponse> {
    return this.client.get('/v1/bill/cableTvProduct', { cableTvType } as unknown as Record<string, unknown>)
  }

  async cableTvSubscriptionViaParentAccount(request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionV2Response> {
    validateBody('post', '/v2/bill/cabletv', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/cabletv', request as unknown as Record<string, unknown>)
  }

  async cableTvSubscriptionViaSubAccount(subAccountId: string, request: CableTvSubscriptionRequest): Promise<CableTvSubscriptionV2Response> {
    validateBody('post', '/v2/bill/cabletv/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/cabletv/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}
