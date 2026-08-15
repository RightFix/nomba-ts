import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  InitiateMobileMoneyInflowRequest,
  InitiateMobileMoneyInflowResponse,
  FetchCollectionTransactionResponse,
  FetchDrcInflowProvidersResponse,
  DrcInflowProvider,
} from '../types/models'

export class GlobalCollections {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async initiateMobileMoneyInflow(request: InitiateMobileMoneyInflowRequest): Promise<InitiateMobileMoneyInflowResponse> {
    validateBody('post', '/v1/global-collection/inflow/initiate', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/global-collection/inflow/initiate', request as unknown as Record<string, unknown>)
  }

  async fetchCollectionTransaction(transactionId: string): Promise<FetchCollectionTransactionResponse> {
    return this.client.get(`/v1/global-collection/transactions/${transactionId}`)
  }

  async fetchDrcInflowProviders(): Promise<FetchDrcInflowProvidersResponse> {
    return this.client.get('/v1/global-collection/drc/inflow/providers')
  }

  async fetchDrcInflowProvidersSandbox(): Promise<FetchDrcInflowProvidersResponse> {
    return this.client.get('/v1/sandbox/global-collection/drc/inflow/providers')
  }
}