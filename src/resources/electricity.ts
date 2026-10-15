import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  FetchElectricityProvidersResponse,
  ElectricityLookupRequest,
  ElectricityLookupResponse,
  ElectricityVendingRequest,
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
    return this.client.get('/v2/bill/electricity/lookup', request as unknown as Record<string, unknown>)
  }

  async vendElectricityViaParentAccount(request: ElectricityVendingRequest): Promise<ElectricityVendingV2Response> {
    validateBody('post', '/v2/bill/electricity', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/electricity', request as unknown as Record<string, unknown>)
  }

  async vendElectricityViaSubAccount(subAccountId: string, request: ElectricityVendingRequest): Promise<ElectricityVendingV2Response> {
    validateBody('post', '/v2/bill/electricity/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/electricity/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}
