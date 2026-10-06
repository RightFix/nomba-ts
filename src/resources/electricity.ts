import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  FetchElectricityProvidersResponse,
  ElectricityLookupRequest,
  ElectricityLookupResponse,
  ElectricityVendingRequest,
  ElectricityVendingResponse,
  ElectricityVendingV2Response,
} from '../types/models'

export class Electricity {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchElectricityProviders(): Promise<FetchElectricityProvidersResponse> {
    return this.client.get('/v1/bill/electricity/discos')
  }

  async electricityCustomerLookup(request: ElectricityLookupRequest): Promise<ElectricityLookupResponse> {
    return this.client.get('/v1/bill/electricity/lookup', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `vendElectricityViaParentAccountV2` (`POST /v2/bill/electricity`). */
  async vendElectricityViaParentAccount(request: ElectricityVendingRequest): Promise<ElectricityVendingResponse> {
    validateBody('post', '/v1/bill/electricity', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/electricity', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `vendElectricityViaSubAccountV2` (`POST /v2/bill/electricity/{subAccountId}`). */
  async vendElectricityViaSubAccount(subAccountId: string, request: ElectricityVendingRequest): Promise<ElectricityVendingResponse> {
    validateBody('post', '/v1/bill/electricity/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/electricity/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async vendElectricityViaParentAccountV2(request: ElectricityVendingRequest): Promise<ElectricityVendingV2Response> {
    validateBody('post', '/v2/bill/electricity', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/electricity', request as unknown as Record<string, unknown>)
  }

  async vendElectricityViaSubAccountV2(subAccountId: string, request: ElectricityVendingRequest): Promise<ElectricityVendingV2Response> {
    validateBody('post', '/v2/bill/electricity/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/electricity/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}