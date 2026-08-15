import { NombaClient } from '../client'
import { validateBody } from '../utils/validation'
import type {
  Bank,
  FetchBankCodesResponse,
  BankAccountLookupRequest,
  BankAccountLookupResponse,
  BankTransferRequest,
  BankTransferResponse,
  WalletTransferRequest,
  WalletTransferResponse,
} from '../types/models'

export class Transfers {
  private readonly client: NombaClient

  constructor(client: NombaClient) {
    this.client = client
  }

  async fetchBankCodes(): Promise<FetchBankCodesResponse> {
    return this.client.get('/v1/transfers/banks')
  }

  async bankAccountLookup(request: BankAccountLookupRequest): Promise<BankAccountLookupResponse> {
    validateBody('post', '/v1/transfers/bank/lookup', request as unknown as Record<string, unknown>)
    return this.client.post('/v1/transfers/bank/lookup', request as unknown as Record<string, unknown>)
  }

  async bankTransferFromParent(request: BankTransferRequest): Promise<BankTransferResponse> {
    validateBody('post', '/v2/transfers/bank', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/transfers/bank', request as unknown as Record<string, unknown>)
  }

  async bankTransferFromSubAccount(subAccountId: string, request: BankTransferRequest): Promise<BankTransferResponse> {
    validateBody('post', '/v2/transfers/bank/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/transfers/bank/${subAccountId}`, request as unknown as Record<string, unknown>)
  }

  async walletTransferFromParent(request: WalletTransferRequest): Promise<WalletTransferResponse> {
    validateBody('post', '/v2/transfers/wallet', request as unknown as Record<string, unknown>)
    return this.client.post('/v2/transfers/wallet', request as unknown as Record<string, unknown>)
  }

  async walletTransferFromSubAccount(subAccountId: string, request: WalletTransferRequest): Promise<WalletTransferResponse> {
    validateBody('post', '/v2/transfers/wallet/{subAccountId}', request as unknown as Record<string, unknown>)
    return this.client.post(`/v2/transfers/wallet/${subAccountId}`, request as unknown as Record<string, unknown>)
  }
}