export interface PaginatedResponse<T> {
  results: T[]
  cursor: string | null
}

function unwrapResponse<T>(response: unknown): PaginatedResponse<T> {
  const resp = response as Record<string, unknown>
  if ('results' in resp || 'cursor' in resp) {
    return { results: (resp['results'] as T[]) ?? [], cursor: (resp['cursor'] as string) ?? null }
  }
  const data = resp['data']
  if (data && typeof data === 'object' && ('results' in data || 'cursor' in data)) {
    const d = data as Record<string, unknown>
    return { results: (d['results'] as T[]) ?? [], cursor: (d['cursor'] as string) ?? null }
  }
  return { results: [], cursor: null }
}

type ResourceMethod<T, Args extends unknown[]> = (
  ...args: Args
) => Promise<PaginatedResponse<T>>

export async function* paginate<T, Args extends unknown[]>(
  method: ResourceMethod<T, Args>,
  ...args: Args
): AsyncGenerator<T, void, unknown> {
  let cursor: string | null = null

  while (true) {
    const callArgs = [...args] as Args
    const lastArg = callArgs[callArgs.length - 1]

    if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg)) {
      ;(lastArg as Record<string, unknown>)['cursor'] = cursor
    }

    const response = await method(...callArgs)
    const page = unwrapResponse(response)
    const results = (page.results ?? []) as T[]

    for (const item of results) {
      yield item
    }

    cursor = page['cursor'] as string | null
    if (!cursor || results.length === 0) break
  }
}

export function createPaginatedHelper<T, Args extends unknown[]>(
  method: ResourceMethod<T, Args>
) {
  return async function* (...args: Args): AsyncGenerator<T, void, unknown> {
    yield* paginate(method, ...args)
  }
}