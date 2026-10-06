import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { NombaAuthError, NombaAPIError } from '../exceptions'
import https from 'https'

export interface NombaClientConfig {
  baseUrl?: string
  apiKey: string
  apiSecret: string
  accountId?: string
  timeout?: number
  maxRetries?: number
  retryDelay?: number
  verifySsl?: boolean
}

interface IssueTokenData {
  businessId: string
  access_token: string
  refresh_token: string
  expiresAt: string
}

interface TokenEnvelope {
  code: string
  description: string
  data: IssueTokenData
}

/** Raw legacy shape, kept as a fallback if the gateway ever returns it. */
interface LegacyTokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
}

interface CachedToken {
  accessToken: string
  refreshToken: string | null
  expiresAt: number
}

const DEFAULT_BASE_URL = 'https://api.nomba.com'
const DEFAULT_TIMEOUT = 60000
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000
/** Refresh at least 5 minutes before expiry, per Nomba docs. */
const TOKEN_BUFFER_MS = 5 * 60 * 1000
/** Fallback lifetime when the gateway omits expiresAt (docs: 30 minutes). */
const TOKEN_FALLBACK_TTL_MS = 30 * 60 * 1000

/** Nomba envelope success codes, per docs Response Codes page. */
const SUCCESS_CODES = new Set(['00', '200', '201'])

export class NombaClient {
  private readonly axios: AxiosInstance
  private readonly apiKey: string
  private readonly apiSecret: string
  private readonly accountId: string | undefined
  private readonly maxRetries: number
  private readonly retryDelay: number
  private cachedToken: CachedToken | null = null
  private refreshTokenValue: string | null = null
  private tokenPromise: Promise<string> | null = null

  constructor(config: NombaClientConfig) {
    this.apiKey = config.apiKey
    this.apiSecret = config.apiSecret
    this.accountId = config.accountId
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES
    this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY

    this.axios = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      httpsAgent: config.verifySsl === false
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.axios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      const token = await this.getAccessToken()
      config.headers.set('Authorization', `Bearer ${token}`)

      if (this.accountId) {
        config.headers.set('accountId', this.accountId)
      }

      return config
    })

    this.axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & { _retryCount?: number }

        if (!config || config._retryCount === undefined) {
          config._retryCount = 0
        }

        const status = error.response?.status
        const retryAfterMs = this.parseRetryAfter(error.response?.headers?.['retry-after'])
        const isRateLimited = status === 429
        const isServerError = status !== undefined && status >= 500 && status < 600
        const isNetworkError =
          error.code === 'ECONNABORTED' ||
          error.code === 'ENOTFOUND' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNRESET' ||
          error.code === 'EAI_AGAIN'

        const shouldRetry =
          config._retryCount < this.maxRetries &&
          (isNetworkError || isServerError || isRateLimited)

        // 401 is never retried here: the token is cleared and a
        // NombaAuthError is thrown so the caller sees auth failures
        // immediately instead of burning retries.
        if (shouldRetry && status !== 401) {
          config._retryCount++
          const delay = retryAfterMs ?? this.retryDelay * Math.pow(2, config._retryCount - 1)
          await this.sleep(delay)
          return this.axios.request(config)
        }

        if (error.response?.status === 401) {
          this.clearTokenCache()
          const responseData = error.response.data as Record<string, unknown> | undefined
          const description =
            typeof responseData?.['description'] === 'string'
              ? (responseData['description'] as string)
              : 'Authentication failed - invalid or expired credentials'
          throw new NombaAuthError(description, {
            statusCode: 401,
            responseBody: error.response.data,
          })
        }

        if (error.response) {
          const responseData = error.response.data as Record<string, unknown>
          const code = responseData?.['code'] as string | number | undefined
          const description = responseData?.['description'] as string | undefined
          throw new NombaAPIError(
            description ? `API request failed: ${description}` : `API request failed: ${error.message}`,
            {
              statusCode: error.response.status,
              code: code != null ? String(code) : null,
              responseBody: error.response.data,
            }
          )
        }

        throw new NombaAPIError(`Network error: ${error.message}`)
      }
    )
  }

  private parseRetryAfter(value: unknown): number | null {
    if (value == null) return null
    const raw = Array.isArray(value) ? value[0] : String(value)
    if (raw == null || raw === '') return null
    const seconds = Number(raw)
    if (!Number.isNaN(seconds)) return Math.max(0, seconds * 1000)
    const dateMs = Date.parse(raw)
    if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now())
    return null
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - TOKEN_BUFFER_MS) {
      return this.cachedToken.accessToken
    }

    if (this.tokenPromise) {
      return this.tokenPromise
    }

    this.tokenPromise = this.cachedToken?.refreshToken
      ? this.executeRefresh(this.cachedToken.refreshToken).catch(() => this.fetchNewToken())
      : this.fetchNewToken()
    try {
      const token = await this.tokenPromise
      return token
    } finally {
      this.tokenPromise = null
    }
  }

  private tokenHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.accountId ? { accountId: this.accountId } : {}),
      ...extra,
    }
  }

  private cacheToken(accessToken: string, refreshToken: string | null, expiresAtMs: number): string {
    this.cachedToken = { accessToken, refreshToken, expiresAt: expiresAtMs }
    if (refreshToken) this.refreshTokenValue = refreshToken
    return accessToken
  }

  private parseExpiresAt(expiresAt: unknown): number {
    if (typeof expiresAt === 'string') {
      const ms = Date.parse(expiresAt)
      if (!Number.isNaN(ms)) return ms
    }
    return Date.now() + TOKEN_FALLBACK_TTL_MS
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const response = await axios.post<TokenEnvelope | LegacyTokenResponse>(
        `${this.axios.defaults.baseURL}/v1/auth/token/issue`,
        { grant_type: 'client_credentials', client_id: this.apiKey, client_secret: this.apiSecret },
        { headers: this.tokenHeaders(), timeout: this.axios.defaults.timeout }
      )

      const body = response.data as TokenEnvelope & LegacyTokenResponse
      if (body && typeof body === 'object' && 'data' in body && body.data?.access_token) {
        return this.cacheToken(
          body.data.access_token,
          body.data.refresh_token ?? null,
          this.parseExpiresAt(body.data.expiresAt)
        )
      }
      // Fallback for non-envelope token shapes.
      if (body && typeof (body as LegacyTokenResponse).access_token === 'string') {
        const legacy = body as LegacyTokenResponse
        const ttlMs =
          typeof legacy.expires_in === 'number' ? legacy.expires_in * 1000 : TOKEN_FALLBACK_TTL_MS
        return this.cacheToken(legacy.access_token, null, Date.now() + ttlMs)
      }
      throw new NombaAuthError('Token issue returned an unexpected response shape', {
        responseBody: response.data,
      })
    } catch (error) {
      if (error instanceof NombaAuthError) throw error
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as Record<string, unknown> | undefined
        const description =
          typeof responseData?.['description'] === 'string'
            ? (responseData['description'] as string)
            : 'Failed to obtain access token'
        throw new NombaAuthError(description, {
          statusCode: error.response?.status,
          responseBody: error.response?.data,
        })
      }
      throw new NombaAuthError(`Token fetch failed: ${error}`)
    }
  }

  private async executeRefresh(refreshToken: string): Promise<string> {
    const headers = this.cachedToken
      ? this.tokenHeaders({ Authorization: `Bearer ${this.cachedToken.accessToken}` })
      : this.tokenHeaders()
    try {
      const response = await axios.post<TokenEnvelope>(
        `${this.axios.defaults.baseURL}/v1/auth/token/refresh`,
        { grant_type: 'refresh_token', refresh_token: refreshToken },
        { headers, timeout: this.axios.defaults.timeout }
      )
      const data = response.data?.data
      if (!data?.access_token) {
        throw new NombaAuthError('Token refresh returned an unexpected response shape', {
          statusCode: response.status,
          responseBody: response.data,
        })
      }
      return this.cacheToken(
        data.access_token,
        data.refresh_token ?? refreshToken,
        this.parseExpiresAt(data.expiresAt)
      )
    } catch (error) {
      this.clearTokenCache()
      if (error instanceof NombaAuthError) throw error
      if (axios.isAxiosError(error)) {
        throw new NombaAuthError('Failed to refresh access token', {
          statusCode: error.response?.status,
          responseBody: error.response?.data,
        })
      }
      throw new NombaAuthError(`Token refresh failed: ${error}`)
    }
  }

  /** Exchange the stored refresh_token for a new access_token (docs: 30 min lifetime). */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.cachedToken?.refreshToken ?? this.refreshTokenValue
    if (!refreshToken) return this.fetchNewToken()

    if (this.tokenPromise) return this.tokenPromise

    this.tokenPromise = this.executeRefresh(refreshToken)
    try {
      return await this.tokenPromise
    } finally {
      this.tokenPromise = null
    }
  }

  /** Revoke an access_token immediately (e.g. suspected leak). */
  async revokeAccessToken(accessToken?: string): Promise<void> {
    const token = accessToken ?? this.cachedToken?.accessToken
    if (!token) return
    await axios.post(
      `${this.axios.defaults.baseURL}/v1/auth/token/revoke`,
      { clientId: this.apiKey, access_token: token },
      { headers: this.tokenHeaders(), timeout: this.axios.defaults.timeout }
    )
    if (!accessToken || accessToken === this.cachedToken?.accessToken) {
      this.clearTokenCache()
    }
  }

  private clearTokenCache(): void {
    this.cachedToken = null
    this.refreshTokenValue = null
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Enforce the Nomba envelope contract (`code` 00/200/201 = success).
   * HTTP 2xx alone is not enough: the gateway can return 200 with a
   * non-success `code`, so surface `description` immediately.
   */
  private ensureSuccess<T>(payload: T, path: string, status?: number): T {
    if (payload && typeof payload === 'object' && 'code' in (payload as Record<string, unknown>)) {
      const record = payload as Record<string, unknown>
      const code = record['code']
      if ((typeof code === 'string' || typeof code === 'number') && !SUCCESS_CODES.has(String(code))) {
        const description = typeof record['description'] === 'string' ? record['description'] : undefined
        throw new NombaAPIError(
          description ? `API request failed (${path}): ${description}` : `API request failed (${path}): code ${String(code)}`,
          { statusCode: status ?? null, code: String(code), responseBody: payload }
        )
      }
    }
    return payload
  }

  async get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.get<T>(path, { params })
    return this.ensureSuccess(response.data, `GET ${path}`, response.status)
  }

  async post<T = unknown>(path: string, json?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.post<T>(path, json, { params })
    return this.ensureSuccess(response.data, `POST ${path}`, response.status)
  }

  async put<T = unknown>(path: string, json?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.put<T>(path, json, { params })
    return this.ensureSuccess(response.data, `PUT ${path}`, response.status)
  }

  async delete<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.delete<T>(path, { params })
    return this.ensureSuccess(response.data, `DELETE ${path}`, response.status)
  }

  async patch<T = unknown>(path: string, json?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.patch<T>(path, json, { params })
    return this.ensureSuccess(response.data, `PATCH ${path}`, response.status)
  }
}