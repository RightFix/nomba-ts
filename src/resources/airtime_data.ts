import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  FetchDataPlansResponse,
  AirtimePurchaseRequest,
  AirtimePurchaseResponse,
  DataVendingRequest,
  DataVendingResponse,
} from '../types/models'

export class AirtimeData {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchDataPlans(telco: string): Promise<FetchDataPlansResponse> {
    return this.client.get(`/v1/bill/data-plan/${telco}`)
  }

  async makeAirtimePurchaseViaParentAccount(request: AirtimePurchaseRequest): Promise<AirtimePurchaseResponse> {
    validateBody('post', '/v1/bill/topup', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/topup', request as unknown as Record<string, unknown>)
  }

  async makeAirtimePurchaseViaSubAccount(subAccountId: string, request: AirtimePurchaseRequest): Promise<AirtimePurchaseResponse> {
    validateBody('post', '/v1/bill/topup/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/topup/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async vendDataViaParentAccount(request: DataVendingRequest): Promise<DataVendingResponse> {
    validateBody('post', '/v1/bill/data', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/data', request as unknown as Record<string, unknown>)
  }

  async vendDataViaSubAccount(subAccountId: string, request: DataVendingRequest): Promise<DataVendingResponse> {
    validateBody('post', '/v1/bill/data/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/data/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}