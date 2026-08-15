import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  DirectDebitMandate,
  CreateDirectDebitMandateRequest,
  CreateDirectDebitMandateResponse,
  GetMandatesResponse,
  UpdateMandateStatusRequest,
  UpdateMandateStatusResponse,
  DebitMandateRequest,
  DebitMandateResponse,
  GetMandateStatusResponse,
  GetMandateByIdResponse,
} from '../types/models'

export interface GetMandatesRequest {
  page: string
  pageSize: string
  from?: string
  to?: string
  status?: string
}

export class DirectDebits {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async getMandates(request: GetMandatesRequest): Promise<GetMandatesResponse> {
    return this.client.get('/v1/direct-debits/mandates', request as unknown as Record<string, unknown>)
  }

  async updateMandateStatus(request: UpdateMandateStatusRequest): Promise<UpdateMandateStatusResponse> {
    validateBody('put', '/v1/direct-debits/update-status', request as unknown as Record<string, unknown>)
    return this.client.put('/v1/direct-debits/update-status', request as unknown as Record<string, unknown>)
  }

  async debitMandate(request: DebitMandateRequest): Promise<DebitMandateResponse> {
    validateBody('post', '/v1/direct-debits/debit-mandate', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/direct-debits/debit-mandate', request as unknown as Record<string, unknown>)
  }

  async getMandateStatus(mandateId: string): Promise<GetMandateStatusResponse> {
    return this.client.get('/v1/direct-debits/status', { mandateId } as unknown as Record<string, unknown>)
  }

  async getMandateById(mandateId: string): Promise<GetMandateByIdResponse> {
    return this.client.get(`/v1/direct-debits/${mandateId}`)
  }

  async createDirectDebitMandate(request: CreateDirectDebitMandateRequest): Promise<CreateDirectDebitMandateResponse> {
    validateBody('post', '/v1/direct-debits', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/direct-debits', request as unknown as Record<string, unknown>)
  }
}