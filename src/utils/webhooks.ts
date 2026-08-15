import { createHmac, timingSafeEqual } from 'crypto'
import { NombaValidationError } from '../exceptions'

export interface WebhookPayload {
  event_type: string
  requestId: string
  data: {
    merchant: {
      userId: string
      walletId: string
    }
    transaction: {
      transactionId: string
      type: string
      time: string
      responseCode: string
    }
  }
}

export interface WebhookHeaders {
  'nomba-signature': string
  'nomba-signature-algorithm': string
  'nomba-signature-version': string
  'nomba-timestamp': string
}

const SIGNATURE_HEADER = 'nomba-signature'
const ALGORITHM_HEADER = 'nomba-signature-algorithm'
const VERSION_HEADER = 'nomba-signature-version'
const TIMESTAMP_HEADER = 'nomba-timestamp'

function getPath(obj: unknown, ...path: string[]): string {
  let current: unknown = obj
  for (const key of path) {
    if (!current || typeof current !== 'object') return ''
    current = (current as Record<string, unknown>)[key]
  }
  return current == null ? '' : String(current)
}

function parseRfc3339(timestamp: string): Date {
  const ts = timestamp.trim()
  const normalized = ts.endsWith('Z') ? ts.slice(0, -1) + '+00:00' : ts
  return new Date(normalized)
}

export function checkTimestampFreshness(
  timestamp: string,
  maxAgeSeconds: number
): void {
  let sentAt: Date
  try {
    sentAt = parseRfc3339(timestamp)
  } catch {
    throw new NombaValidationError(`Invalid ${TIMESTAMP_HEADER} format: ${timestamp}`)
  }

  if (isNaN(sentAt.getTime())) {
    throw new NombaValidationError(`Invalid ${TIMESTAMP_HEADER} format: ${timestamp}`)
  }

  const now = new Date()
  const ageSeconds = (now.getTime() - sentAt.getTime()) / 1000

  if (ageSeconds > maxAgeSeconds) {
    throw new NombaValidationError(
      `Webhook timestamp is ${Math.round(ageSeconds)}s old, exceeding max_age_seconds=${maxAgeSeconds} ` +
      '(possible replay attack, or a webhook retried long after the original send)'
    )
  }

  if (ageSeconds < -maxAgeSeconds) {
    throw new NombaValidationError(
      `Webhook timestamp is ${Math.round(-ageSeconds)}s in the future, exceeding max_age_seconds=${maxAgeSeconds} ` +
      '(check for clock skew, or treat with suspicion)'
    )
  }
}

export function computeSignature(
  signatureKey: string,
  payload: WebhookPayload,
  timestamp: string
): string {
  const hashingPayload = [
    getPath(payload, 'event_type'),
    getPath(payload, 'requestId'),
    getPath(payload, 'data', 'merchant', 'userId'),
    getPath(payload, 'data', 'merchant', 'walletId'),
    getPath(payload, 'data', 'transaction', 'transactionId'),
    getPath(payload, 'data', 'transaction', 'type'),
    getPath(payload, 'data', 'transaction', 'time'),
    getPath(payload, 'data', 'transaction', 'responseCode'),
  ].join(':')

  const message = `${hashingPayload}:${timestamp}`
  const hmac = createHmac('sha256', signatureKey)
  hmac.update(message)
  return hmac.digest('base64')
}

export function verifyWebhookSignature(
  signatureKey: string,
  payload: WebhookPayload,
  signature: string,
  timestamp: string
): boolean {
  const expected = computeSignature(signatureKey, payload, timestamp)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)
  return timingSafeEqual(expectedBuffer, signatureBuffer)
}

export function verifyWebhookRequest(
  signatureKey: string,
  options: {
    body: string | Buffer
    headers: Record<string, string>
    maxAgeSeconds?: number | null
  }
): WebhookPayload {
  const { body, headers, maxAgeSeconds = 300 } = options

  const lowerHeaders: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    lowerHeaders[key.toLowerCase()] = value
  }

  const signature = lowerHeaders[SIGNATURE_HEADER.toLowerCase()]
  const timestamp = lowerHeaders[TIMESTAMP_HEADER.toLowerCase()]

  if (!signature || !timestamp) {
    throw new NombaValidationError(
      `Missing '${SIGNATURE_HEADER}' or '${TIMESTAMP_HEADER}' header on webhook request`
    )
  }

  if (maxAgeSeconds !== null) {
    checkTimestampFreshness(timestamp, maxAgeSeconds)
  }

  let payload: WebhookPayload
  try {
    const bodyString = Buffer.isBuffer(body) ? body.toString('utf-8') : body
    payload = JSON.parse(bodyString)
  } catch (error) {
    throw new NombaValidationError(`Webhook body is not valid JSON: ${error}`)
  }

  if (!verifyWebhookSignature(signatureKey, payload, signature, timestamp)) {
    throw new NombaValidationError('Webhook signature verification failed')
  }

  return payload
}