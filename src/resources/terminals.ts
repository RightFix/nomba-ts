import { NombaClient } from '../client'
import type {
  NombaResponse,
  PaginatedResponse,
} from '../types/models'

export interface Terminal {
  terminalId: string
  terminalSerial: string
  terminalModel: string
  status: string
  accountRef?: string
  assignedAt?: string
}

export interface FetchTerminalsResponse extends NombaResponse<PaginatedResponse<Terminal>> {}

export interface FetchTerminalDetailsResponse extends NombaResponse<Terminal> {}

export class Terminals {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchTerminals(limit?: string, cursor?: string): Promise<FetchTerminalsResponse> {
    return this.client.get('/v1/terminals', { limit, cursor })
  }

  async fetchTerminalDetails(terminalId: string): Promise<FetchTerminalDetailsResponse> {
    return this.client.get(`/v1/terminals/${terminalId}`)
  }
}