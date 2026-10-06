# nomba-ts

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

Unofficial TypeScript SDK for the [Nomba](https://developer.nomba.com) payments API.

Covers **every endpoint** in Nomba's official OpenAPI spec — 86 methods across 14 resource groups. Built with `axios`, async/await, and TypeScript declarations — no endpoint URLs to memorize, no manual token handling, no guessing field names.

## Install

```bash
npm install nomba-ts
# or
yarn add nomba-ts
# or
pnpm add nomba-ts
```

## Usage

```typescript
import { Nomba } from 'nomba-ts'

const nomba = new Nomba({
  apiKey: '...',
  apiSecret: '...',
  accountId: '...',  // optional, but recommended
})

const account = await nomba.virtualAccounts.createVirtualAccount({
  accountName: 'Jane Doe',
})
```

## Authentication

The SDK handles the OAuth2 client-credentials flow automatically per the Nomba docs: it `POST`s JSON `{ grant_type: 'client_credentials', client_id, client_secret }` to `/v1/auth/token/issue` (with your `accountId` header), caches the returned `access_token`, and refreshes transparently via `/v1/auth/token/refresh` before the 30-minute expiry (5-minute buffer). A `401` clears the cached token and throws `NombaAuthError` immediately — it is never silently retried. Get your `apiKey` / `apiSecret` / `accountId` from your Nomba dashboard under **Webhook & API Keys**.

```typescript
new Nomba({
  apiKey: 'client-id',
  apiSecret: 'client-secret',
  accountId: 'your-account-id',
  baseUrl: 'https://api.nomba.com',  // default
  timeout: 60000,                    // default, ms
  maxRetries: 3,                     // default
  retryDelay: 1000,                  // default, ms (exponential backoff)
  verifySsl: true,                   // default; set false for sandbox
})
```

You can also refresh or revoke tokens manually via the underlying client (`refreshAccessToken()` / `revokeAccessToken()`).

## Resource groups

Each group is available on the `Nomba` instance:

| Group               | Examples |
|---------------------|----------|
| `accounts`           | `listAllAccounts`, `fetchAccountDetails`, `fetchTerminalsAssignedToAccount` |
| `virtualAccounts`    | `createVirtualAccount`, `fetchVirtualAccount`, `filterVirtualAccounts` |
| `checkout`           | `createOnlineCheckoutOrder`, `fetchCheckoutOrder`, `fetchCheckoutTransactionDetails` (production-only rich details) |
| `charge`             | `submitCustomerCardDetails`, `submitCustomerPaymentOtp`, `confirmTransactionReceipt` |
| `transfers`          | `transfer`, `bulkTransfer`, `fetchTransfer`, `fetchTransfers` |
| `terminals`          | `fetchTerminals`, `fetchTerminalDetails` |
| `transactions`       | `fetchCreditDebitTransactionsOnParentAccount`, `filterParentAccountTransactions`, `fetchSingleTransactionOnParentAccount` (sandbox+prod verify), `confirmTransactionStatus` |
| `airtimeData`        | `makeAirtimePurchaseViaParentAccount`, `vendDataViaParentAccount`, `fetchDataPlans` |
| `cableTv`            | `cableTvLookup`, `cableTvSubscriptionViaParentAccount` |
| `electricity`        | `fetchElectricityProviders`, `electricityCustomerLookup`, `vendElectricityViaParentAccount` |
| `betting`            | `fetchBettingProviders`, `bettingCustomerLookup`, `vendBettingViaParentAccount` |
| `directDebits`       | `createDirectDebitMandate`, `debitMandate`, `getMandateStatus`, `getMandates` |
| `globalCollections`  | `initiateMobileMoneyInflow`, `fetchCollectionTransaction`, `fetchDrcInflowProviders` |
| `globalPayout`       | `authorizeTransfer`, `authorizeExchange`, `convertMoney`, `fetchExchangeRates` |

## Reliability (token locking + retry/backoff)

The `NombaClient` guards token fetching with a lock, so concurrent requests never race to re-fetch a token — only one fetch happens, the rest wait and reuse it. Requests that hit a `429` or transient `5xx`/network error are automatically retried with exponential backoff (respecting `Retry-After` if Nomba sends one). `401`s are not retried: the token cache is cleared and a `NombaAuthError` is thrown.

Every response envelope is also checked: only `code` `00`/`200`/`201` counts as success (per Nomba's Response Codes page). Any other `code` on HTTP 2xx throws `NombaAPIError` with the gateway `description` in the message, so `code: '01'` never looks like success.

```typescript
const nomba = new Nomba({
  apiKey: '...',
  apiSecret: '...',
  maxRetries: 3,     // default
  retryDelay: 1000,  // default; delay ~= retryDelay * 2^attempt
})
```

## Typed responses

Every method returns a typed `Promise<T>` generated from Nomba's response schema, giving you editor autocomplete and type-checking on the actual JSON keys (e.g. `resp.data.accountNumber`).

## Nested body validation

Every write call (`POST`/`PUT`) is checked against Nomba's own OpenAPI spec (bundled with the package) before any network call, so a typo or missing nested field fails fast locally instead of round-tripping to Nomba's API:

```typescript
import { NombaValidationError } from 'nomba-ts'

try {
  await nomba.checkout.createOnlineCheckoutOrder({ orderReference: 'x' })
} catch (e) {
  if (e instanceof NombaValidationError) {
    console.log(e.message)  // Missing required field(s) in request body: amount, currency, ...
    console.log(e.missing)  // ['amount', 'currency']
  }
}
```

## Webhook signature verification

Implements Nomba's documented HMAC-SHA256 scheme (`nomba-signature` / `nomba-sig-value` alias / `nomba-timestamp` headers, base64-encoded signature over `event_type:requestId:userId:walletId:transactionId:type:time:responseCode:timestamp`), including replay protection via the timestamp:

```typescript
import { verifyWebhookRequest, NombaValidationError } from 'nomba-ts'

function handleWebhook(body: string | Buffer, headers: Record<string, string>) {
  try {
    const payload = verifyWebhookRequest('your-signature-key', {
      body,
      headers,
      maxAgeSeconds: 300,  // default; reject webhooks older than 5 min
    })
    if (payload.event_type === 'payment_success') { /* ... */ }
  } catch (e) {
    if (e instanceof NombaValidationError) {
      // invalid signature or stale timestamp
      return new Response('Unauthorized', { status: 401 })
    }
  }
  return new Response(null, { status: 200 })
}
```

A valid signature alone doesn't prove a webhook wasn't captured and resent later — `maxAgeSeconds` rejects stale ones. Pass `maxAgeSeconds: null` to disable that check if you have your own replay protection.

## Bounded concurrency for fan-out calls

`gatherLimited` runs concurrent calls with a concurrency cap:

```typescript
import { gatherLimited } from 'nomba-ts'

const calls = accountRefs.map((ref) => () => nomba.virtualAccounts.fetchVirtualAccount(ref))
const results = await gatherLimited(calls, { limit: 5, returnExceptions: true })
```

## Pagination

Nomba's list endpoints are cursor-paginated server-side (they return a `cursor` you feed back in for the next page). `paginate` drives that loop for you — no extra pagination scheme is introduced.

```typescript
import { paginate } from 'nomba-ts'

for await (const account of paginate(nomba.accounts.listAllAccounts.bind(nomba.accounts))) {
  console.log(account.accountRef)
}
```

## Card payment flow

Card checkout is a multi-step sequence (submit card → maybe OTP → maybe 3D Secure → confirm). `CardPaymentFlow` wraps it so you don't have to track `transactionId` by hand or look up what Nomba's `responseCode` values mean:

```typescript
const order = await nomba.checkout.createOnlineCheckoutOrder({...})

const flow = nomba.createCardPaymentFlow(order.data.orderReference)
let step = await flow.submitCard({ cardDetails: '...', key: '' })

if (step.requiresOtp) {
  step = await flow.submitOtp('123456')
} else if (step.requires3ds) {
  // redirect the user using step.secureAuthenticationData
}

if (step.completed) {
  const result = await flow.confirm()
}
```

`flow` is a `CardPaymentFlow` and `step` is a `CardPaymentStep` with `.completed`, `.requiresOtp`, `.requires3ds`, `.transactionId`, `.message`, etc. `responseCode` `00` = success, `T0` = OTP required, `S0`/`SO` = 3D Secure (both spellings appear in Nomba's spec, both are accepted).

Verify before delivering value: for sandbox + production use `transactions.fetchSingleTransactionOnParentAccount({ orderReference })` and check `data.status === 'SUCCESS'`; for production-only rich details use `checkout.fetchCheckoutTransactionDetails({ idType: 'ORDER_REFERENCE', id })` and check `transactionDetails.status === 'PAYMENT SUCCESSFUL'`. `charge.confirmTransactionReceipt(orderReference)` confirms after OTP/transfer within the charge flow.

## Error handling

```typescript
import { NombaAPIError, NombaAuthError } from 'nomba-ts'

try {
  await nomba.virtualAccounts.fetchVirtualAccount('missing-ref')
} catch (e) {
  if (e instanceof NombaAuthError) {
    console.log('auth failed:', e.message)
  } else if (e instanceof NombaAPIError) {
    console.log('api error:', e.statusCode, e.code, e.responseBody)
  }
}
```

## Regenerating from the spec

The resource modules in `src/resources/` and response types in `src/types/models.ts` are generated from `src/data/nomba_openapi.json` (a snapshot of Nomba's published OpenAPI spec, also bundled into the package for runtime nested-body validation). To pick up upstream API changes:

```bash
curl -sL -o src/data/nomba_openapi.json \
  "https://developer.nomba.com/nomba-api-reference/openapi.json"
```

## Development

```bash
npm install
npm run typecheck
npm run build
```

## Status

Generated from Nomba's official OpenAPI spec — all 86 documented endpoints across Accounts, Virtual Accounts, Online Checkout, Charge, Transfers, Terminals, Transactions, Airtime/Data, CableTV, Electricity, Betting, Direct Debits, Global Collections, and Global Payout.

Also includes: typed responses, cursor pagination helpers, a guided card-payment flow, automatic retry/backoff, local nested-body validation against Nomba's own spec, and webhook signature verification with replay protection.
