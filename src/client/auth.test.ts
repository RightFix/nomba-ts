import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { NombaClient } from './index'
import { NombaAPIError } from '../exceptions'

function fakeAxiosInstance(impl: { get?: unknown; post?: unknown } = {}) {
  return {
    defaults: { baseURL: 'https://api.nomba.com', timeout: 60000 },
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    get: vi.fn(async () => ({ data: impl.get, status: 200 })),
    post: vi.fn(async () => ({ data: impl.post, status: 200 })),
    put: vi.fn(async () => ({ data: {}, status: 200 })),
    delete: vi.fn(async () => ({ data: {}, status: 200 })),
    patch: vi.fn(async () => ({ data: {}, status: 200 })),
    request: vi.fn(),
  }
}

const tokenEnvelope = (overrides: Record<string, unknown> = {}) => ({
  code: '00',
  description: 'Success',
  data: {
    businessId: 'business-1',
    access_token: 'tok-123',
    refresh_token: 'ref-123',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ...overrides,
  },
})

describe('NombaClient auth (docs contract)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an axios instance with JSON defaults', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: tokenEnvelope() })
    const createSpy = vi.spyOn(axios, 'create').mockReturnValue(fakeAxiosInstance() as never)

    new NombaClient({ apiKey: 'cid', apiSecret: 'csec', accountId: 'acct-1' })
    expect(createSpy).toHaveBeenCalled()
  })

  it('parses the envelope token response and caches it', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: tokenEnvelope({ access_token: 'tok-abc' }) })
    const instance = fakeAxiosInstance({
      get: { code: '00', description: 'ok', data: { hello: 'world' } },
    })
    vi.spyOn(axios, 'create').mockReturnValue(instance as never)

    const client = new NombaClient({ apiKey: 'cid', apiSecret: 'csec', accountId: 'acct-1' })
    // Reach the private token fetch through the request interceptor callback.
    const requestInterceptor = (instance.interceptors.request.use as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as (config: { headers: { set: ReturnType<typeof vi.fn> } }) => Promise<unknown>
    await requestInterceptor({ headers: { set: vi.fn() } })

    const postCall = (axios.post as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(postCall?.[0]).toBe('https://api.nomba.com/v1/auth/token/issue')
    expect(postCall?.[1]).toEqual({ grant_type: 'client_credentials', client_id: 'cid', client_secret: 'csec' })
    expect(postCall?.[2].headers).toMatchObject({ accountId: 'acct-1', 'Content-Type': 'application/json' })

    // Second call reuses the cached token — no extra token POST.
    await requestInterceptor({ headers: { set: vi.fn() } })
    expect((axios.post as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1)
    void client
  })

  it('throws NombaAPIError on non-success envelope codes', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: tokenEnvelope() })
    const instance = fakeAxiosInstance({
      get: { code: '01', description: 'Transaction not found', data: null },
    })
    vi.spyOn(axios, 'create').mockReturnValue(instance as never)

    const client = new NombaClient({ apiKey: 'cid', apiSecret: 'csec' })
    await expect(client.get('/v1/transactions/accounts/single')).rejects.toMatchObject({
      name: 'NombaAPIError',
    })
    try {
      await client.get('/v1/transactions/accounts/single')
    } catch (e) {
      expect(e).toBeInstanceOf(NombaAPIError)
      expect((e as NombaAPIError).code).toBe('01')
      expect((e as NombaAPIError).message).toContain('Transaction not found')
    }
  })

  it('revokes via clientId + access_token JSON body', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: tokenEnvelope({ access_token: 'tok-revoke' }) })
    const instance = fakeAxiosInstance()
    vi.spyOn(axios, 'create').mockReturnValue(instance as never)

    const client = new NombaClient({ apiKey: 'cid', apiSecret: 'csec' })
    const requestInterceptor = (instance.interceptors.request.use as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[0] as (config: { headers: { set: ReturnType<typeof vi.fn> } }) => Promise<unknown>
    await requestInterceptor({ headers: { set: vi.fn() } })
    ;(axios.post as ReturnType<typeof vi.fn>).mockClear()

    await client.revokeAccessToken()
    const revokeCall = (axios.post as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(revokeCall?.[0]).toBe('https://api.nomba.com/v1/auth/token/revoke')
    expect(revokeCall?.[1]).toEqual({ clientId: 'cid', access_token: 'tok-revoke' })
  })
})
