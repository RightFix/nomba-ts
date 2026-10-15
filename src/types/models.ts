export interface NombaResponse<T = unknown> {
  code: string
  description: string
  data: T
}

export interface PaginatedResponse<T = unknown> {
  results: T[]
  cursor: string | null
}

// Account models
export interface Account {
  accountRef: string
  accountName: string
  accountNumber: string
  bankName: string
  bankCode: string
  accountType: string
  currency: string
  status: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface ListAllAccountsResponse extends NombaResponse<{
  accounts: Account[]
}> {}

export interface FetchTerminalsAssignedToAccountResponse extends NombaResponse<{
  terminals: Terminal[]
}> {}

export interface Terminal {
  terminalId: string
  terminalSerial: string
  terminalModel: string
  status: string
  assignedAt: string
}

// Virtual Account models
export interface VirtualAccount {
  accountRef: string
  accountName: string
  accountNumber: string
  bankName: string
  bankCode: string
  currency: string
  status: string
  identifierType?: string
  restrictInflowToAccountName?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVirtualAccountResponse extends NombaResponse<VirtualAccount> {}

export interface FetchVirtualAccountResponse extends NombaResponse<VirtualAccount> {}

export interface FilterVirtualAccountsResponse extends NombaResponse<PaginatedResponse<VirtualAccount>> {}

export interface FetchVirtualAccountTransactionsResponse extends NombaResponse<PaginatedResponse<Transaction>> {}

// Checkout models
export interface CreateOnlineCheckoutOrderRequest {
  orderReference: string
  amount: string
  currency: string
  customerEmail: string
  customerName: string
  redirectUrl: string
  paymentMethods: string[]
  metadata?: Record<string, unknown>
  description?: string
  expiresAt?: string
}

export interface FetchCheckoutOrderResponse extends NombaResponse<{
  orderReference: string
  amount: string
  currency: string
  customerEmail: string
  customerName: string
  redirectUrl: string
  paymentMethods: string[]
  status: string
  metadata?: Record<string, unknown>
  description?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}> {}

export interface FetchCheckoutTransactionDetailsResponse extends NombaResponse<{
  transactionId: string
  orderReference: string
  amount: string
  currency: string
  status: string
  paymentMethod: string
  customerEmail: string
  customerName: string
  paidAt?: string
  createdAt: string
}> {}

// Charge models
export interface SubmitCustomerCardDetailsRequest {
  cardDetails: string
  key: string
  orderReference: string
  saveCard?: boolean
  deviceInformation?: Record<string, unknown>
}

export interface SubmitCustomerCardDetailsResponse extends NombaResponse<{
  responseCode: string
  status: string
  message?: string
  transactionId?: string
  secureAuthenticationData?: Record<string, unknown>
}> {}

// Transactions models
export interface Transaction {
  transactionId: string
  transactionRef: string
  amount: string
  currency: string
  type: string
  status: string
  source: string
  narration: string
  accountNumber: string
  accountName: string
  bankName: string
  bankCode: string
  createdAt: string
  updatedAt: string
  fee?: string
  balanceAfter?: string
  merchantTxRef?: string
  orderReference?: string
  orderId?: string
  terminalId?: string
  rrn?: string
}

export interface FetchCreditDebitTransactionsResponse extends NombaResponse<PaginatedResponse<Transaction>> {}

export interface FetchTransactionsOnAccountResponse extends NombaResponse<PaginatedResponse<Transaction>> {}

export interface FilterTransactionsRequest {
  transactionRef?: string
  status?: string
  source?: string
  type?: string
  terminalId?: string
  rrn?: string
  merchantTxRef?: string
  orderReference?: string
  orderId?: string
}

export interface FilterTransactionsResponse extends NombaResponse<PaginatedResponse<Transaction>> {}

export interface FetchSingleTransactionResponse extends NombaResponse<Transaction> {}

export interface ConfirmTransactionStatusResponse extends NombaResponse<{
  transactionId: string
  status: string
  responseCode: string
  message: string
}> {}

// Airtime/Data models
export interface DataPlan {
  amount: number
  plan: string
  /** Unique plan identifier — pass as `productId` when purchasing. Required for new integrations. */
  productId: string
}

export interface FetchDataPlansResponse extends NombaResponse<DataPlan[]> {}

export interface AirtimePurchaseRequest {
  amount: string
  phoneNumber: string
  network: string
  merchantTxRef: string
  senderName?: string
}

export interface DataVendingRequest {
  /** Exact plan identifier from Fetch Data Plans. Required — `amount` alone is deprecated upstream. */
  productId: string
  phoneNumber: string
  network: string
  merchantTxRef: string
  senderName?: string
}

export interface DataVendingResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  productId?: string
  plan?: string
  phoneNumber: string
  network: string
  dataPlan: string
  createdAt: string
}> {}

// Bill v2 models (docs: v1 bill endpoints are deprecated, use POST /v2/bill/*).
// v2 data shape: { id, status, type, amount, timeCreated, ... } where
// status SUCCESS (HTTP 200) = delivered, PENDING_BILLING (HTTP 201) =
// still processing — wait for the webhook or requery.
export interface V2BillTransaction {
  id: string
  status: string
  type: string
  amount: number
  source?: string
  sourceUserId?: string | null
  customerBillerId?: string
  productId?: string
  meta?: Record<string, unknown>
  userId?: string | null
  timeCreated: string
}

export interface AirtimePurchaseV2Response extends NombaResponse<V2BillTransaction> {}

export interface DataVendingV2Response extends NombaResponse<V2BillTransaction> {}

export interface CableTvSubscriptionV2Response extends NombaResponse<V2BillTransaction> {}

export interface ElectricityVendingV2Response extends NombaResponse<V2BillTransaction> {}

export interface BettingVendingV2Response extends NombaResponse<V2BillTransaction> {}

// Cable TV models
export interface CableTvLookupRequest {
  customerId: string
  cableTvType: string
}

export interface CableTvLookupResponse extends NombaResponse<{
  customerName: string
  customerId: string
  cableTvType: string
  packageName: string
  amount: string
  currency: string
}> {}

export interface CableTvSubscriptionRequest {
  cableTvType: string
  merchantTxRef: string
  payerName: string
  amount: string
  customerId: string
}

export interface CableTvPlan {
  subScriptionType: string
  amount: number
}

export interface FetchCableTvPlansResponse extends NombaResponse<CableTvPlan[]> {}

// Electricity models
export interface ElectricityProvider {
  code: string
  name: string
  type: string
}

export interface FetchElectricityProvidersResponse extends NombaResponse<ElectricityProvider[]> {}

export interface ElectricityLookupRequest {
  disco: string
  customerId: string
}

export interface ElectricityLookupResponse extends NombaResponse<{
  name: string
  /** Returns `unknown` when the provider does not supply an address. */
  address: string
}> {}

export interface ElectricityVendingRequest {
  disco: string
  merchantTxRef: string
  payerName: string
  amount: string
  customerId: string
  meterType: string
}

// Betting models
export interface BettingProvider {
  code: string
  name: string
}

export interface FetchBettingProvidersResponse extends NombaResponse<BettingProvider[]> {}

export interface BettingLookupRequest {
  providerId: string
  customerId: string
}

export interface BettingLookupResponse extends NombaResponse<{
  customerName: string
  customerId: string
  providerId: string
  providerName: string
  amount: string
  currency: string
}> {}

export interface BettingVendingRequest {
  bettingProvider: string
  merchantTxRef: string
  phoneNumber: string
  payerName: string
  amount: string
  customerId: string
}

// Direct Debits models
export interface DirectDebitMandate {
  mandateId: string
  customerAccountNumber: string
  bankCode: string
  customerName: string
  customerAccountName: string
  amount: string
  frequency: string
  merchantReference: string
  startDate: string
  endDate: string
  customerEmail: string
  customerAddress?: string
  narration?: string
  customerPhoneNumber?: string
  startImmediately?: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateDirectDebitMandateRequest {
  customerAccountNumber: string
  bankCode: string
  customerName: string
  customerAccountName: string
  amount: string
  frequency: string
  merchantReference: string
  startDate: string
  endDate: string
  customerEmail: string
  customerAddress?: string
  narration?: string
  customerPhoneNumber?: string
  startImmediately?: boolean
}

export interface CreateDirectDebitMandateResponse extends NombaResponse<DirectDebitMandate> {}

export interface GetMandatesResponse extends NombaResponse<PaginatedResponse<DirectDebitMandate>> {}

export interface UpdateMandateStatusRequest {
  mandateId: string
  status: string
}

export interface UpdateMandateStatusResponse extends NombaResponse<DirectDebitMandate> {}

export interface DebitMandateRequest {
  mandateId: string
  amount: string
}

export interface DebitMandateResponse extends NombaResponse<{
  transactionId: string
  mandateId: string
  amount: string
  status: string
  reference: string
  createdAt: string
}> {}

export interface GetMandateStatusResponse extends NombaResponse<{
  mandateId: string
  status: string
}> {}

export interface GetMandateByIdResponse extends NombaResponse<DirectDebitMandate> {}

// Global Collections models
export interface InitiateMobileMoneyInflowRequest {
  phoneNumber: string
  callbackUrl: string
  amount: string
  currency: string
  topupVendor: string
  idempotencyKey?: string
}

export interface InitiateMobileMoneyInflowResponse extends NombaResponse<{
  transactionId: string
  status: string
  reference: string
  amount: string
  currency: string
  phoneNumber: string
  topupVendor: string
  idempotencyKey: string
  createdAt: string
}> {}

export interface FetchCollectionTransactionResponse extends NombaResponse<{
  transactionId: string
  status: string
  amount: string
  currency: string
  phoneNumber: string
  topupVendor: string
  reference: string
  completedAt?: string
  createdAt: string
}> {}

export interface DrcInflowProvider {
  code: string
  name: string
  country: string
  currency: string
}

export interface FetchDrcInflowProvidersResponse extends NombaResponse<DrcInflowProvider[]> {}

// Global Payout models
export interface PaymentMethod {
  code: string
  name: string
  description: string
  countries: string[]
  currencies: string[]
  accountTypes: string[]
  bankAccountTypes?: string[]
  purposeOfPayments?: string[]
  requiredFields: string[]
}

export interface FetchPaymentMethodsResponse extends NombaResponse<PaymentMethod[]> {}

export interface InstitutionProvider {
  code: string
  displayName: string
  country: string
  isMobileMoney: boolean
  currency: string
}

export interface ListInstitutionProvidersResponse extends NombaResponse<InstitutionProvider[]> {}

export interface ConvertMoneyRequest {
  amount: string
  currency: string
  destinationCurrency: string
  transactionType: string
  sourceCountryIsoCode: string
}

export interface ConvertMoneyResponse extends NombaResponse<{
  exchangeRateId: string
  sourceAmount: string
  sourceCurrency: string
  destinationAmount: string
  destinationCurrency: string
  exchangeRate: string
  expiresAt: string
}> {}

export interface FetchExchangeRatesResponse extends NombaResponse<{
  from: string
  to: string
  rate: string
  region?: string
  updatedAt: string
}> {}

export interface AuthorizeTransferRequest {
  amount: string
  sourceCurrency: string
  destinationCurrency: string
  receiverName: string
  sourceCountryIsoCode: string
  destinationCountryIsoCode: string
  authCode: string
  paymentMethod: string
  accountType: string
  accountNumber?: string
  institutionCode?: string
  institutionName?: string
  bankAccountType?: string
  purposeOfPayment?: string
  narration?: string
  lockedExchangeRateId?: string
  /**
   * Optional unique key (max 128 chars) for this request. Resend the same
   * key when retrying and the original transaction is returned with
   * `idempotentReplay: true` instead of creating a second one. A key stays
   * tied to its transaction permanently — use a new key for a new attempt.
   */
  idempotencyKey?: string
  bankAddress?: string
  bankCity?: string
  bankState?: string
  bankZipCode?: string
  beneficiary?: Record<string, unknown>
}

export interface AuthorizeTransferResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  sourceCurrency: string
  destinationCurrency: string
  destinationAmount: string
  exchangeRate: string
  fee: string
  estimatedDelivery: string
  createdAt: string
  /** The idempotencyKey sent with the request, echoed back. Empty if none was sent. */
  idempotencyKey?: string
  /** True when this response replays an earlier request with the same key — nothing new was created. */
  idempotentReplay?: boolean
}> {}

export interface AuthorizeExchangeRequest {
  amount: string
  sourceCurrency: string
  destinationCurrency: string
  senderName: string
  receiverName: string
  sourceCountryIsoCode: string
  destinationCountryIsoCode: string
  authCode: string
  narration?: string
  lockedExchangeRateId?: string
}

export interface AuthorizeExchangeResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  sourceAmount: string
  sourceCurrency: string
  destinationAmount: string
  destinationCurrency: string
  exchangeRate: string
  fee: string
  createdAt: string
}> {}

export interface FetchGlobalPayoutTransactionResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  type: string
  amount: string
  sourceCurrency: string
  destinationCurrency: string
  destinationAmount: string
  exchangeRate: string
  fee: string
  receiverName: string
  createdAt: string
  completedAt?: string
}> {}

// Extended Account models
export interface AccountDetails {
  createdAt: string
  accountId: string
  accountHolderId: string
  accountRef: string
  bvn: string
  status: string
  type: string
  accountName: string
  currency: string
  banks: Array<{
    bankAccountNumber: string
    bankName: string
    bankAccountName: string
  }>
}

export interface FetchAccountDetailsResponse extends NombaResponse<AccountDetails> {}

export interface FetchAccountBalanceResponse extends NombaResponse<{
  amount: string
  currency: string
  timeCreated: string
}> {}

export interface CreateSubAccountResponse extends NombaResponse<{
  accountId: string
  accountRef: string
  accountName: string
  status: string
  currency: string
  createdAt: string
}> {}

export interface SuspendAccountResponse extends NombaResponse<{
  accountId: string
  status: string
}> {}

export interface ReactivateAccountResponse extends NombaResponse<{
  accountId: string
  status: string
}> {}

export interface UpdateAccountAccessResponse extends NombaResponse<{
  accountId: string
  canLogin: boolean
  canViewBalance: boolean
  canViewTransactions: boolean
  canInitiateTransfers: boolean
  canManageTerminals: boolean
  canManageVirtualAccounts: boolean
  canManageWebhooks: boolean
  canManageSubAccounts: boolean
}> {}

// Extended Virtual Account models
export interface UpdateVirtualAccountRequest {
  newAccountRef?: string
  accountName?: string
  expectedAmount?: number
}

export interface FilterVirtualAccountsRequest {
  accountName?: string
  accountRef?: string
  bvn?: string
  bankAccountNumber?: string
  dateCreatedFrom?: string
  dateCreatedTo?: string
  expired?: boolean
  resourceAcquired?: boolean
  limit?: string
  cursor?: string
}

export interface FilterVirtualAccountsResponse extends NombaResponse<PaginatedResponse<VirtualAccount>> {}

export interface ExpireVirtualAccountResponse extends NombaResponse<{
  identifier: string
  expired: boolean
}> {}

// Extended Checkout models
export interface CreateOnlineCheckoutOrderRequest {
  order: {
    orderReference: string
    customerId: string
    callbackUrl: string
    customerEmail: string
    amount: number
    currency: string
    accountId?: string
    allowedPaymentMethods?: string[]
    splitRequest?: {
      splitType: 'PERCENTAGE' | 'AMOUNT'
      splitList: Array<{
        accountId: string
        value: number
      }>
    }
    orderMetaData?: Record<string, string>
  }
  tokenizeCard: boolean
}

export interface CreateOnlineCheckoutOrderResponse extends NombaResponse<{
  checkoutLink: string
  orderReference: string
}> {}

export interface FetchCheckoutOrderResponse extends NombaResponse<{
  orderReference: string
  amount: string
  currency: string
  customerEmail: string
  customerName: string
  redirectUrl: string
  paymentMethods: string[]
  status: string
  metadata?: Record<string, unknown>
  description?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}> {}

export interface ChargeTokenizedCardRequest {
  orderReference: string
  amount: number
  currency: string
  cardToken: string
  customerEmail: string
  customerName: string
}

export interface ChargeTokenizedCardResponse extends NombaResponse<{
  transactionId: string
  orderReference: string
  amount: string
  currency: string
  status: string
  paymentMethod: string
  customerEmail: string
  customerName: string
  paidAt?: string
  createdAt: string
}> {}

export interface TokenizedCard {
  cardToken: string
  cardPan: string
  cardType: string
  cardBank: string
  cardCurrency: string
  customerEmail: string
  createdAt: string
}

export interface ListTokenizedCardsResponse extends NombaResponse<TokenizedCard[]> {}

export interface UpdateTokenizedCardRequest {
  cardToken: string
  cardPan?: string
  cardExpiry?: string
}

export interface UpdateTokenizedCardResponse extends NombaResponse<TokenizedCard> {}

export interface DeleteTokenizedCardRequest {
  cardToken: string
}

export interface DeleteTokenizedCardResponse extends NombaResponse<{
  deleted: boolean
}> {}

export interface RefundCheckoutRequest {
  transactionId: string
  amount?: number
  reason?: string
}

export interface RefundCheckoutResponse extends NombaResponse<{
  transactionId: string
  status: string
  refundId: string
}> {}

export interface CancelCheckoutOrderRequest {
  orderReference: string
  reason?: string
}

export interface CancelCheckoutOrderResponse extends NombaResponse<{
  orderReference: string
  status: string
}> {}

// Charge models
export interface SubmitCustomerCardDetailsRequest {
  cardDetails: string
  key: string
  orderReference: string
  saveCard?: boolean
  deviceInformation?: Record<string, unknown>
}

export interface SubmitCustomerCardDetailsResponse extends NombaResponse<{
  responseCode: string
  status: string
  message?: string
  transactionId?: string
  secureAuthenticationData?: Record<string, unknown>
}> {}

export interface SubmitCustomerCardOtpRequest {
  otp: string
  orderReference: string
  transactionId: string
}

export interface SubmitCustomerCardOtpResponse extends NombaResponse<{
  responseCode: string
  status: string
  message?: string
  transactionId?: string
}> {}

export interface ResendCustomerOtpRequest {
  orderReference: string
}

export interface ResendCustomerOtpResponse extends NombaResponse<{
  message: string
}> {}

export interface FetchCheckoutFlashAccountResponse extends NombaResponse<{
  accountNumber: string
  bankName: string
  accountName: string
  expiresAt: string
}> {}

export interface RequestOtpBeforeSavingCardRequest {
  orderReference: string
  phoneNumber: string
}

export interface RequestOtpBeforeSavingCardResponse extends NombaResponse<{
  message: string
}> {}

export interface RequestOtpForSavedCardsRequest {
  orderReference: string
  email: string
}

export interface RequestOtpForSavedCardsResponse extends NombaResponse<{
  message: string
}> {}

export interface SubmitUserOtpRequest {
  otp: string
  orderReference: string
  phoneNumber: string
}

export interface SubmitUserOtpResponse extends NombaResponse<{
  message: string
}> {}

export interface GetUserSavedCardsResponse extends NombaResponse<TokenizedCard[]> {}

export interface FetchCheckoutTransactionDetailsResponse extends NombaResponse<{
  transactionId: string
  orderReference: string
  amount: string
  currency: string
  status: string
  paymentMethod: string
  customerEmail: string
  customerName: string
  paidAt?: string
  createdAt: string
}> {}

export interface CancelCheckoutTransactionRequest {
  transactionId: string
  forceCancel?: boolean
}

export interface CancelCheckoutTransactionResponse extends NombaResponse<{
  transactionId: string
  status: string
}> {}

// Extended Transfers models
export interface Bank {
  code: string
  name: string
  nipCode: string | null
  logo: string
}

export interface FetchBankCodesResponse extends NombaResponse<Bank[]> {}

export interface BankAccountLookupRequest {
  accountNumber: string
  bankCode: string
}

export interface BankAccountLookupResponse extends NombaResponse<{
  accountNumber: string
  accountName: string
}> {}

export interface BankTransferRequest {
  amount: number
  accountNumber: string
  bankCode: string
  accountName: string
  merchantTxRef: string
  senderName?: string
  narration?: string
}

export interface BankTransferResponse extends NombaResponse<{
  amount: string
  source: string
  sourceUserId: string
  customerBillerId: string
  productId: string
  meta: Record<string, unknown>
  fee: number
  timeCreated: string
  id: string
  type: string
  status: string
}> {}

export interface WalletTransferRequest {
  amount: number
  accountId: string
  receiverAccountId: string
  merchantTxRef: string
  narration: string
}

export interface WalletTransferResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  fee: string
  currency: string
  createdAt: string
}> {}

// Terminal models
export interface AssignTerminalRequest {
  serialNumber: string
  terminalLabel?: string
}

export interface AssignTerminalResponse extends NombaResponse<{
  terminalId: string
  serialNumber: string
  accountId: string
  parentAccountId: string
  merchantName: string
  terminalLabel: string
  createdAt: string
  updatedAt: string
}> {}

export interface UnassignTerminalRequest {
  serialNumber: string
  terminalLabel?: string
}

export interface UnassignTerminalResponse extends NombaResponse<{
  terminalId: string
  serialNumber: string
  accountId: string
  parentAccountId: string
  merchantName: string
  terminalLabel: string
  createdAt: string
  updatedAt: string
}> {}

export interface TerminalPaymentRequest {
  merchantTxRef: string
  amount: number
  currency: string
}

export interface TerminalPaymentResponse extends NombaResponse<{
  paymentId: string
  status: string
  amount: number
  currency: string
  createdAt: string
}> {}

// Global Payout extended models
export interface GlobalPayoutAccount {
  accountId: string
  currency: string
  balance: string
  accountName: string
  accountType: string
  status: string
  createdAt: string
}

export interface FetchGlobalPayoutAccountsResponse extends NombaResponse<GlobalPayoutAccount[]> {}

export interface FetchGlobalPayoutAccountResponse extends NombaResponse<GlobalPayoutAccount> {}