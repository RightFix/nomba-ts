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

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface CachedToken {
  accessToken: string
  expiresAt: number
}

const DEFAULT_BASE_URL = 'https://api.nomba.com'
const DEFAULT_TIMEOUT = 60000
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_RETRY_DELAY = 1000
const TOKEN_BUFFER_MS = 30000

export class NombaClient {
  private readonly axios: AxiosInstance
  private readonly apiKey: string
  private readonly apiSecret: string
  private readonly accountId: string | undefined
  private readonly maxRetries: number
  private readonly retryDelay: number
  private cachedToken: CachedToken | null = null
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
        config.headers.set('X-Account-Id', this.accountId)
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

        const shouldRetry =
          config._retryCount < this.maxRetries &&
          (error.code === 'ECONNABORTED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNRESET' ||
            error.code === 'EAI_AGAIN' ||
            (error.response?.status !== undefined &&
              error.response.status >= 500 &&
              error.response.status < 600))

        if (shouldRetry && error.response?.status !== 401) {
          config._retryCount++
          const delay = this.retryDelay * Math.pow(2, config._retryCount - 1)
          await this.sleep(delay)
          return this.axios.request(config)
        }

        if (error.response?.status === 401) {
          this.clearTokenCache()
          throw new NombaAuthError('Authentication failed - invalid or expired credentials', {
            statusCode: 401,
            responseBody: error.response.data,
          })
        }

        if (error.response) {
          const responseData = error.response.data as Record<string, unknown>
          throw new NombaAPIError(
            `API request failed: ${error.message}`,
            {
              statusCode: error.response.status,
              code: responseData?.['code'] as string | null,
              responseBody: error.response.data,
            }
          )
        }

        throw new NombaAPIError(`Network error: ${error.message}`)
      }
    )
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - TOKEN_BUFFER_MS) {
      return this.cachedToken.accessToken
    }

    if (this.tokenPromise) {
      return this.tokenPromise
    }

    this.tokenPromise = this.fetchNewToken()
    try {
      const token = await this.tokenPromise
      return token
    } finally {
      this.tokenPromise = null
    }
  }

  private async fetchNewToken(): Promise<string> {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')

    try {
      const response = await axios.post<TokenResponse>(
        `${this.axios.defaults.baseURL}/v1/auth/token`,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          timeout: this.axios.defaults.timeout,
        }
      )

      const expiresAt = Date.now() + response.data.expires_in * 1000
      this.cachedToken = {
        accessToken: response.data.access_token,
        expiresAt,
      }

      return response.data.access_token
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NombaAuthError('Failed to obtain access token', {
          statusCode: error.response?.status,
          responseBody: error.response?.data,
        })
      }
      throw new NombaAuthError(`Token fetch failed: ${error}`)
    }
  }

  private clearTokenCache(): void {
    this.cachedToken = null
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.get<T>(path, { params })
    return response.data
  }

  async post<T = unknown>(path: string, json?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.post<T>(path, json, { params })
    return response.data
  }

  async put<T = unknown>(path: string, json?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.put<T>(path, json, { params })
    return response.data
  }

  async delete<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.delete<T>(path, { params })
    return response.data
  }

  async patch<T = unknown>(path: string, json?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.patch<T>(path, json, { params })
    return response.data
  }
}