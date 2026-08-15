import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { NombaValidationError } from '../exceptions'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface OpenAPISpec {
  paths: Record<string, Record<string, OpenAPIOperation>>
  components: {
    schemas: Record<string, OpenAPISchema>
  }
}

interface OpenAPIOperation {
  tags?: string[]
  operationId?: string
  summary?: string
  description?: string
  parameters?: OpenAPIParameter[]
  requestBody?: {
    content: {
      'application/json'?: {
        schema: OpenAPISchema
      }
    }
  }
  responses: Record<string, {
    content?: {
      'application/json'?: {
        schema: OpenAPISchema
      }
    }
  }>
}

interface OpenAPIParameter {
  name: string
  in: 'query' | 'path' | 'header' | 'cookie'
  required?: boolean
  description?: string
  schema?: OpenAPISchema
}

interface OpenAPISchema {
  type?: string
  properties?: Record<string, OpenAPISchema>
  required?: string[]
  items?: OpenAPISchema
  $ref?: string
  description?: string
}

let specCache: OpenAPISpec | null = null

function loadSpec(): OpenAPISpec {
  if (specCache) return specCache

  const specPath = join(__dirname, '..', 'data', 'nomba_openapi.json')
  const content = readFileSync(specPath, 'utf-8')
  specCache = JSON.parse(content)
  return specCache!
}

function resolveSchema(spec: OpenAPISpec, schema: OpenAPISchema): OpenAPISchema {
  if (!schema || typeof schema !== 'object') return schema
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop()
    if (refName && spec.components.schemas[refName]) {
      return spec.components.schemas[refName]
    }
    return {}
  }
  return schema
}

function getRequestSchema(verb: string, pathTemplate: string): OpenAPISchema | null {
  const spec = loadSpec()
  const path = spec.paths[pathTemplate]
  if (!path) return null

  const op = path[verb.toLowerCase()]
  if (!op) return null

  const requestBody = op.requestBody
  if (!requestBody) return null

  const schema = requestBody.content?.['application/json']?.schema
  if (!schema) return null

  const resolved = resolveSchema(spec, schema)
  return resolved ?? null
}

interface ValidationResult {
  valid: boolean
  missing: string[]
}

function checkRequiredFields(
  spec: OpenAPISpec,
  schema: OpenAPISchema,
  value: unknown,
  path: string,
  missing: string[]
): void {
  const resolved = resolveSchema(spec, schema)
  if (!resolved || typeof resolved !== 'object') return

  const schemaType = resolved.type

  if (schemaType === 'object' || resolved.properties) {
    if (typeof value !== 'object' || value === null) {
      if (value !== null && value !== undefined) {
        missing.push(`${path} (expected an object)`)
      }
      return
    }

    const obj = value as Record<string, unknown>
    const required = resolved.required ?? []

    for (const reqField of required) {
      if (!(reqField in obj) || obj[reqField] === null || obj[reqField] === undefined) {
        missing.push(path ? `${path}.${reqField}` : reqField)
      }
    }

    const props = resolved.properties ?? {}
    for (const [key, subValue] of Object.entries(obj)) {
      if (key in props && props[key]) {
        checkRequiredFields(spec, props[key]!, subValue, path ? `${path}.${key}` : key, missing)
      }
    }
  } else if (schemaType === 'array') {
    if (!Array.isArray(value)) return

    const itemsSchema = resolved.items
    if (itemsSchema) {
      value.forEach((item, index) => {
        checkRequiredFields(spec, itemsSchema, item, `${path}[${index}]`, missing)
      })
    }
  }
}

export function validateBody(verb: string, pathTemplate: string, body: Record<string, unknown>): void {
  const schema = getRequestSchema(verb, pathTemplate)
  if (!schema) return

  const spec = loadSpec()
  const missing: string[] = []
  checkRequiredFields(spec, schema, body, '', missing)

  if (missing.length > 0) {
    throw new NombaValidationError(
      `Missing required field(s) in request body: ${missing.join(', ')}`,
      { missing }
    )
  }
}