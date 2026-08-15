export class NombaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NombaError'
    Object.setPrototypeOf(this, NombaError.prototype)
  }
}

export class NombaAPIError extends NombaError {
  public readonly statusCode: number | null
  public readonly code: string | null
  public readonly responseBody: unknown

  constructor(
    message: string,
    options: {
      statusCode?: number | null
      code?: string | null
      responseBody?: unknown
    } = {}
  ) {
    super(message)
    this.name = 'NombaAPIError'
    this.statusCode = options.statusCode ?? null
    this.code = options.code ?? null
    this.responseBody = options.responseBody ?? null
    Object.setPrototypeOf(this, NombaAPIError.prototype)
  }

  override toString(): string {
    const parts = [super.toString()]
    if (this.statusCode !== null) parts.push(`(status=${this.statusCode})`)
    if (this.code !== null) parts.push(`(code=${this.code})`)
    return parts.join(' ')
  }
}

export class NombaAuthError extends NombaAPIError {
  constructor(
    message: string,
    options: {
      statusCode?: number | null
      responseBody?: unknown
    } = {}
  ) {
    super(message, { ...options, code: 'AUTH_ERROR' })
    this.name = 'NombaAuthError'
    Object.setPrototypeOf(this, NombaAuthError.prototype)
  }
}

export class NombaValidationError extends NombaError {
  public readonly missing: string[]

  constructor(message: string, options: { missing?: string[] } = {}) {
    super(message)
    this.name = 'NombaValidationError'
    this.missing = options.missing ?? []
    Object.setPrototypeOf(this, NombaValidationError.prototype)
  }
}