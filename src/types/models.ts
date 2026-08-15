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

export interface FetchAccountDetailsResponse extends NombaResponse<Account> {}

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

export interface CreateOnlineCheckoutOrderResponse extends NombaResponse<{
  orderReference: string
  checkoutUrl: string
  expiresAt: string
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

export interface CancelCheckoutTransactionResponse extends NombaResponse<{
  transactionId: string
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

export interface SubmitCustomerPaymentOtpRequest {
  otp: string
  orderReference: string
  transactionId: string
}

export interface SubmitCustomerPaymentOtpResponse extends NombaResponse<{
  responseCode: string
  status: string
  message?: string
  transactionId?: string
}> {}

export interface ResendCustomerPaymentOtpRequest {
  orderReference: string
}

export interface ResendCustomerPaymentOtpResponse extends NombaResponse<{
  message: string
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

export interface CancelCheckoutTransactionRequest {
  transactionId: string
  forceCancel?: boolean
}

export interface CancelCheckoutTransactionResponse extends NombaResponse<{
  transactionId: string
  status: string
}> {}

// Transfers models
export interface TransferRequest {
  amount: string
  accountNumber: string
  bankCode: string
  accountName: string
  narration: string
  reference: string
  currency?: string
  feeBearer?: string
}

export interface TransferResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  fee: string
  currency: string
  createdAt: string
}> {}

export interface BulkTransferRequest {
  transfers: TransferRequest[]
}

export interface BulkTransferResponse extends NombaResponse<{
  batchReference: string
  totalAmount: string
  totalFee: string
  status: string
  transfers: TransferResponse['data'][]
}> {}

export interface FetchTransferResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  fee: string
  currency: string
  accountNumber: string
  bankCode: string
  accountName: string
  narration: string
  createdAt: string
}> {}

export interface FetchTransfersResponse extends NombaResponse<PaginatedResponse<FetchTransferResponse['data']>> {}

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
  code: string
  name: string
  amount: string
  validity: string
  network: string
}

export interface FetchDataPlansResponse extends NombaResponse<DataPlan[]> {}

export interface AirtimePurchaseRequest {
  amount: string
  phoneNumber: string
  network: string
  merchantTxRef: string
  senderName?: string
}

export interface AirtimePurchaseResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  phoneNumber: string
  network: string
  createdAt: string
}> {}

export interface DataVendingRequest {
  amount: string
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
  phoneNumber: string
  network: string
  dataPlan: string
  createdAt: string
}> {}

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

export interface CableTvSubscriptionResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  customerId: string
  cableTvType: string
  packageName: string
  createdAt: string
}> {}

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
  customerName: string
  customerId: string
  disco: string
  meterType: string
  address: string
  amount: string
  currency: string
}> {}

export interface ElectricityVendingRequest {
  disco: string
  merchantTxRef: string
  payerName: string
  amount: string
  customerId: string
  meterType: string
}

export interface ElectricityVendingResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  customerId: string
  disco: string
  meterType: string
  token: string
  units: string
  createdAt: string
}> {}

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

export interface BettingVendingResponse extends NombaResponse<{
  transactionId: string
  reference: string
  status: string
  amount: string
  customerId: string
  bettingProvider: string
  createdAt: string
}> {}

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