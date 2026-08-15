import type { Charge } from '../resources/charge'
import type {
  SubmitCustomerCardDetailsResponse,
  SubmitCustomerCardOtpResponse,
  ResendCustomerOtpResponse,
  FetchCheckoutTransactionDetailsResponse,
  CancelCheckoutTransactionResponse,
} from '../types/models'

export const RESPONSE_CODE_SUCCESS = '00'
export const RESPONSE_CODE_OTP_REQUIRED = 'T0'
export const RESPONSE_CODE_3DS_REQUIRED = 'S0'

export interface CardPaymentStep {
  raw:
    | SubmitCustomerCardDetailsResponse
    | SubmitCustomerCardOtpResponse
    | Record<string, unknown>
  responseCode: string | null
  status: unknown
  message: string | null
  transactionId: string | null
  requiresOtp: boolean
  requires3ds: boolean
  secureAuthenticationData: Record<string, unknown> | null
  completed: boolean
}

function interpret(
  raw: SubmitCustomerCardDetailsResponse | SubmitCustomerCardOtpResponse,
  transactionIdFallback: string | null = null
): CardPaymentStep {
  const data = raw.data && typeof raw.data === 'object' ? raw.data : raw
  const d = data as Record<string, unknown>
  const responseCode = d['responseCode'] as string | undefined
  const transactionId = (d['transactionId'] as string | undefined) ?? transactionIdFallback

  return {
    raw,
    responseCode: responseCode ?? null,
    status: d['status'] ?? null,
    message: d['message'] as string | null ?? null,
    transactionId: transactionId ?? null,
    requiresOtp: responseCode === RESPONSE_CODE_OTP_REQUIRED,
    requires3ds: responseCode === RESPONSE_CODE_3DS_REQUIRED,
    secureAuthenticationData: (d['secureAuthenticationData'] as Record<string, unknown> | undefined) ?? null,
    completed: responseCode === RESPONSE_CODE_SUCCESS,
  }
}

export class CardPaymentFlow {
  private readonly charge: Charge
  readonly orderReference: string
  transactionId: string | null = null

  constructor(charge: Charge, orderReference: string) {
    this.charge = charge
    this.orderReference = orderReference
  }

  async submitCard(options: {
    cardDetails: string
    key?: string
    saveCard?: boolean
    deviceInformation?: Record<string, unknown>
  }): Promise<CardPaymentStep> {
    const raw = await this.charge.submitCustomerCardDetails({
      cardDetails: options.cardDetails,
      key: options.key ?? '',
      orderReference: this.orderReference,
      saveCard: options.saveCard,
      deviceInformation: options.deviceInformation,
    })

    const step = interpret(raw)
    this.transactionId = step.transactionId
    return step
  }

  async submitOtp(otp: string): Promise<CardPaymentStep> {
    if (!this.transactionId) {
      throw new Error(
        'No transaction_id on this flow yet — call submitCard() first.'
      )
    }

    const raw = await this.charge.submitCustomerCardOtp({
      otp,
      orderReference: this.orderReference,
      transactionId: this.transactionId,
    })

    return interpret(raw, this.transactionId)
  }

  async resendOtp(): Promise<ResendCustomerOtpResponse> {
    return this.charge.resendCustomerOtp({ orderReference: this.orderReference })
  }

  async confirm(): Promise<FetchCheckoutTransactionDetailsResponse> {
    return this.charge.fetchCheckoutTransactionDetails(this.orderReference)
  }

  async cancel(options: { force?: boolean } = {}): Promise<CancelCheckoutTransactionResponse> {
    if (!this.transactionId) {
      throw new Error(
        'No transaction_id on this flow yet — call submitCard() first.'
      )
    }

    return this.charge.cancelCheckoutTransaction({
      transactionId: this.transactionId,
      forceCancel: options.force,
    })
  }
}