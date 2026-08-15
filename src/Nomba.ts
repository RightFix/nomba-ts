import { NombaClient, type NombaClientConfig } from './client'
import { Accounts } from './resources/accounts'
import { VirtualAccounts } from './resources/virtual_accounts'
import { Checkout } from './resources/checkout'
import { Charge } from './resources/charge'
import { Transfers } from './resources/transfers'
import { Terminals } from './resources/terminals'
import { Transactions } from './resources/transactions'
import { AirtimeData } from './resources/airtime_data'
import { CableTv } from './resources/cabletv'
import { Electricity } from './resources/electricity'
import { Betting } from './resources/betting'
import { DirectDebits } from './resources/direct_debits'
import { GlobalCollections } from './resources/global_collections'
import { GlobalPayout } from './resources/global_payout'
import { CardPaymentFlow } from './flows/card_payment'

export interface NombaConfig extends NombaClientConfig {}

export class Nomba {
  private readonly client: NombaClient

  readonly accounts: Accounts
  readonly virtualAccounts: VirtualAccounts
  readonly checkout: Checkout
  readonly charge: Charge
  readonly transfers: Transfers
  readonly terminals: Terminals
  readonly transactions: Transactions
  readonly airtimeData: AirtimeData
  readonly cableTv: CableTv
  readonly electricity: Electricity
  readonly betting: Betting
  readonly directDebits: DirectDebits
  readonly globalCollections: GlobalCollections
  readonly globalPayout: GlobalPayout

  constructor(config: NombaConfig) {
    this.client = new NombaClient(config)

    this.accounts = new Accounts(this.client)
    this.virtualAccounts = new VirtualAccounts(this.client)
    this.checkout = new Checkout(this.client)
    this.charge = new Charge(this.client)
    this.transfers = new Transfers(this.client)
    this.terminals = new Terminals(this.client)
    this.transactions = new Transactions(this.client)
    this.airtimeData = new AirtimeData(this.client)
    this.cableTv = new CableTv(this.client)
    this.electricity = new Electricity(this.client)
    this.betting = new Betting(this.client)
    this.directDebits = new DirectDebits(this.client)
    this.globalCollections = new GlobalCollections(this.client)
    this.globalPayout = new GlobalPayout(this.client)
  }

  createCardPaymentFlow(orderReference: string): CardPaymentFlow {
    return new CardPaymentFlow(this.charge, orderReference)
  }

  async close(): Promise<void> {
    // No cleanup needed for axios client
  }
}