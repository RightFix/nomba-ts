import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  AssignTerminalRequest,
  AssignTerminalResponse,
  UnassignTerminalRequest,
  UnassignTerminalResponse,
  TerminalPaymentRequest,
  TerminalPaymentResponse,
} from '../types/models'

export class Terminals {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async assignTerminalToParent(request: AssignTerminalRequest): Promise<AssignTerminalResponse> {
    validateBody('post', '/v1/terminals/assign', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/terminals/assign', request as unknown as Record<string, unknown>)
  }

  async assignTerminalToSubAccount(subAccountId: string, request: AssignTerminalRequest): Promise<AssignTerminalResponse> {
    validateBody('post', '/v1/terminals/assign/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/terminals/assign/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async unassignTerminalFromParent(request: UnassignTerminalRequest): Promise<UnassignTerminalResponse> {
    validateBody('post', '/v1/terminals/unassign', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/terminals/unassign', request as unknown as Record<string, unknown>)
  }

  async unassignTerminalFromSubAccount(subAccountId: string, request: UnassignTerminalRequest): Promise<UnassignTerminalResponse> {
    validateBody('post', '/v1/terminals/unassign/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/terminals/unassign/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async sendPaymentRequestToTerminal(terminalId: string, request: TerminalPaymentRequest): Promise<TerminalPaymentResponse> {
    validateBody('post', '/v1/terminals/payment-request/{terminalId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v1/terminals/payment-request/${terminalId}`, request as unknown as Record<string, unknown>)
  }
}