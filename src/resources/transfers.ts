import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  TransferRequest,
  TransferResponse,
  BulkTransferRequest,
  BulkTransferResponse,
  FetchTransferResponse,
  FetchTransfersResponse,
} from '../types/models'

export class Transfers {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async transfer(request: TransferRequest): Promise<TransferResponse> {
    validateBody('post', '/v1/transfers', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/transfers', request as unknown as Record<string, unknown>)
  }

  async bulkTransfer(request: BulkTransferRequest): Promise<BulkTransferResponse> {
    validateBody('post', '/v1/transfers/bulk', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/transfers/bulk', request as unknown as Record<string, unknown>)
  }

  async fetchTransfer(transactionId: string): Promise<FetchTransferResponse> {
    return this.client.get(`/v1/transfers/${transactionId}`)
  }

  async fetchTransfers(limit?: string, cursor?: string): Promise<FetchTransfersResponse> {
    return this.client.get('/v1/transfers', { limit, cursor } as unknown as Record<string, unknown>)
  }
}