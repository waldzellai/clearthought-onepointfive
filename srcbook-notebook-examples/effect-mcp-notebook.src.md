<!-- srcbook:{"language":"typescript"} -->

# Effect for MCP: Hands‑On Srcbook Notebook

This Srcbook gives you a runnable, minimal toolkit to build robust MCP tools with Effect‑TS, plus quick hooks into Srcbook resources and external docs.

## Learning objectives

- Understand `Effect<A, E, R>` and how it maps to MCP tool handlers
- Define a typed error algebra and map it to MCP error codes
- Apply resiliency (retry + timeout) declaratively
- Convert existing Promise code to Effect cleanly
- Practice with short exercises and verify outputs in cells

## Big picture (A/E/R) at a glance

```mermaid
flowchart TD
    A[Input args] --> V[Validation Effect]
    V -->|ok| T[Tool Logic Effect<A,E,R>]
    V -->|fail: ValidationError| M1[Map → MCP InvalidParams]
    T -->|retry/timeout wrapper| R[Resiliency]
    R -->|ok| O[Success A → content[]]
    R -->|fail: E| M2[Map typed E → MCP error]
```

Tip: In MCP, the external request/response shape does not change. Only your internals become typed and resilient.

###### package.json

```json
{
  "type": "module",
  "dependencies": {
    "effect": "^3.5.0"
  }
}
```

## 1) Typed Errors (E) for MCP tools

###### errors.ts

```ts
export class ValidationError { readonly _tag = 'ValidationError'; constructor(readonly message: string) {} }
export class TimeoutError { readonly _tag = 'TimeoutError'; constructor(readonly ms?: number) {} }
export class RateLimitError { readonly _tag = 'RateLimitError'; constructor(readonly retryAfterMs?: number) {} }
export class AuthenticationError { readonly _tag = 'AuthenticationError'; constructor(readonly message = 'Auth failed') {} }
export class ToolUnavailableError { readonly _tag = 'ToolUnavailableError'; constructor(readonly message = 'Tool unavailable') {} }
export class UnexpectedError { readonly _tag = 'UnexpectedError'; constructor(readonly cause: unknown) {} }

export type ToolError =
  | ValidationError
  | TimeoutError
  | RateLimitError
  | AuthenticationError
  | ToolUnavailableError
  | UnexpectedError;
```

## 2) Resiliency wrapper (retry + timeout)

###### resiliency.ts

```ts
import { Effect, Schedule, Duration } from 'effect'
import type { ToolError } from './errors.ts'

export interface ResiliencyPolicy {
  timeout: Duration.DurationInput
  retrySchedule: Schedule.Schedule<any, any, any>
}

export const defaultPolicy: ResiliencyPolicy = {
  timeout: Duration.seconds(5),
  retrySchedule: Schedule.exponential(Duration.millis(100)).pipe(
    Schedule.jittered,
    Schedule.recurs(2),
  ),
}

export const withResiliency = (key: string, p: ResiliencyPolicy) =>
  <A, E extends ToolError, R>(eff: Effect.Effect<A, E, R>) =>
    eff.pipe(
      Effect.retry(p.retrySchedule),
      Effect.timeout(p.timeout),
    )
```

Try it: change `recurs(2)` to `recurs(5)` and re-run the tool in section 4 to see more retries in action (add transient failures to observe behavior).

## 3) MCP error mapping (typed → protocol)

###### mcp-mapping.ts

```ts
import type { ToolError } from './errors.ts'

// Minimal mapping without importing @modelcontextprotocol/sdk types
export type McpErrorLike = { code: string; message: string }

export function toMcp(error: ToolError): McpErrorLike {
  switch (error._tag) {
    case 'ValidationError': return { code: 'InvalidParams', message: error.message }
    case 'TimeoutError': return { code: 'RequestTimeout', message: 'Timed out' }
    case 'RateLimitError': return { code: 'RateLimited', message: 'Rate limited' }
    case 'AuthenticationError': return { code: 'Unauthorized', message: error.message }
    case 'ToolUnavailableError': return { code: 'ServiceUnavailable', message: error.message }
    default: return { code: 'InternalError', message: 'Unexpected error' }
  }
}
```

## 4) Minimal tool effect and runner

###### tool.ts

```ts
import { Effect } from 'effect'
import { ValidationError, type ToolError } from './errors.ts'
import { withResiliency, defaultPolicy } from './resiliency.ts'
import { toMcp } from './mcp-mapping.ts'

type Result = { content: Array<{ type: 'text'; text: string }> }

// Example: validate input and return a simple result
function runTool(input: unknown): Effect.Effect<Result, ToolError> {
  return Effect.gen(function* (_) {
    if (!input || typeof (input as any).message !== 'string') {
      // Typed failure instead of throw
      return yield* _(Effect.fail(new ValidationError('"message" (string) is required')))
    }
    const text = (input as any).message as string
    return { content: [{ type: 'text', text }] }
  })
}

// Wrap with resiliency and run
const runnable = withResiliency('demo.tool', defaultPolicy)(runTool({ message: 'hello from Effect' }))

try {
  const out = await Effect.runPromise(runnable)
  console.log('OK', out)
} catch (e) {
  const mcp = toMcp(e as ToolError)
  console.log('MCP ERROR', mcp)
}
```

Exercise: make `runTool` randomly fail the first time with a `TimeoutError` to watch the retry logic kick in. Hint: keep a module‑level counter and `Effect.fail(new TimeoutError(…))` on the first call.

## 5) Pull docs from Srcbook repo (example)

###### fetch-srcbook-readme.ts

```ts
// Node 18+ has global fetch
const url = 'https://raw.githubusercontent.com/srcbookdev/srcbook/main/README.md'
const res = await fetch(url)
if (!res.ok) throw new Error('Failed to fetch Srcbook README')
const text = await res.text()
console.log(text.slice(0, 400) + '\n...')
```

## 6) Context7 docs (via MCP) – how to query

Use your Context7 MCP server to fetch library docs and feed them into tool logic or markdown cells.

```bash
# Resolve a library id and fetch docs (run from your MCP client)
mcp_context7-mcp_resolve-library-id "effect"
mcp_context7-mcp_get-library-docs "/effect-ts/effect" --topic hooks
```

Then paste the returned snippets into a markdown cell or use them to generate code cells.

## 7) Primer (reference)

This notebook follows the approach in `specs/effect-for-mcp-primer.md`:

- Model tools as `Effect<A,E,R>`
- Typed error algebra with deterministic MCP mapping
- Declarative resiliency wrappers (retry + timeout)
- Minimal environment; expand only as needed

Export this Srcbook to share the pattern with your team.

---

## Bonus: Promise → Effect conversions (practice)

###### promise-to-effect.ts

```ts
// Given: an async function that may reject with unknown
async function fetchNumber(): Promise<number> {
  if (Math.random() < 0.5) throw new Error('flaky')
  return 42
}

// Convert to Effect with a typed error
import { Effect } from 'effect'
import { UnexpectedError } from './errors.ts'

const fetchNumberEffect = Effect.tryPromise({
  try: () => fetchNumber(),
  catch: (cause) => new UnexpectedError(cause),
})

try {
  const n = await Effect.runPromise(fetchNumberEffect)
  console.log('OK number =', n)
} catch (e) {
  console.log('Typed error tag =', (e as any)._tag)
}
```

## Exercises

1) Add a new error type `DependencyError` and map it to MCP `ServiceUnavailable`. Modify `runTool` to fail with `DependencyError` when `process.env.SHOULD_FAIL === 'dep'`.
2) Extend `withResiliency` to accept an optional `onRetry` callback and log attempts.
3) Create a tiny validator that uses a Zod schema; on failure, produce `ValidationError` with the first issue message.

Use the console output from each code cell to validate your work.

## Common pitfalls (and fixes)

- Catch‑all without mapping: Always convert unknown failures into a typed `UnexpectedError` and then to MCP.
- Throwing in `gen`: Prefer `Effect.fail(new TypedError(...))` so the type system tracks `E`.
- Over‑retries: Cap retries with `recurs(n)` or a maximum elapsed constraint; add jitter to avoid thundering herds.


