import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  FetchDataPlansResponse,
  AirtimePurchaseRequest,
  AirtimePurchaseResponse,
  AirtimePurchaseV2Response,
  DataVendingRequest,
  DataVendingResponse,
  DataVendingV2Response,
} from '../types/models'

export class AirtimeData {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchDataPlans(telco: string): Promise<FetchDataPlansResponse> {
    return this.client.get(`/v1/bill/data-plan/${telco}`)
  }

  /** @deprecated Docs: v1 is deprecated, use `makeAirtimePurchaseViaParentAccountV2` (`POST /v2/bill/topup`). */
  async makeAirtimePurchaseViaParentAccount(request: AirtimePurchaseRequest): Promise<AirtimePurchaseResponse> {
    validateBody('post', '/v1/bill/topup', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/topup', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `makeAirtimePurchaseViaSubAccountV2` (`POST /v2/bill/topup/{subAccountId}`). */
  async makeAirtimePurchaseViaSubAccount(subAccountId: string, request: AirtimePurchaseRequest): Promise<AirtimePurchaseResponse> {
    validateBody('post', '/v1/bill/topup/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/topup/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `vendDataViaParentAccountV2` (`POST /v2/bill/data`). */
  async vendDataViaParentAccount(request: DataVendingRequest): Promise<DataVendingResponse> {
    validateBody('post', '/v1/bill/data', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/bill/data', request as unknown as Record<string, unknown>)
  }

  /** @deprecated Docs: v1 is deprecated, use `vendDataViaSubAccountV2` (`POST /v2/bill/data/{subAccountId}`). */
  async vendDataViaSubAccount(subAccountId: string, request: DataVendingRequest): Promise<DataVendingResponse> {
    validateBody('post', '/v1/bill/data/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/bill/data/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async makeAirtimePurchaseViaParentAccountV2(request: AirtimePurchaseRequest): Promise<AirtimePurchaseV2Response> {
    validateBody('post', '/v2/bill/topup', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/topup', request as unknown as Record<string, unknown>)
  }

  async makeAirtimePurchaseViaSubAccountV2(subAccountId: string, request: AirtimePurchaseRequest): Promise<AirtimePurchaseV2Response> {
    validateBody('post', '/v2/bill/topup/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/topup/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async vendDataViaParentAccountV2(request: DataVendingRequest): Promise<DataVendingV2Response> {
    validateBody('post', '/v2/bill/data', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/bill/data', request as unknown as Record<string, unknown>)
  }

  async vendDataViaSubAccountV2(subAccountId: string, request: DataVendingRequest): Promise<DataVendingV2Response> {
    validateBody('post', '/v2/bill/data/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/bill/data/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}