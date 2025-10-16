# System Logic Trace for News Report Generation

This document decomposes the NewsForge AI report generation pipeline end to end. Each step matches the on-screen "System Logic Trace" that now appears beside every keyword search.

## Overview

The client-side workflow orchestrated in `components/NewsTab.tsx` performs a deterministic sequence for every enabled keyword:

1. Validate configuration (API key, model, keyword state).
2. Compose the OpenRouter payload by merging instructions, keyword text, and normalized model parameters.
3. POST to `https://openrouter.ai/api/v1/chat/completions`.
4. Decode and sanity-check the OpenRouter response payload.
5. Convert the plain-text stories into structured JSON using the user-provided conversion instructions.
6. Transform each story into a `Card` entity and compute usage costs.
7. Persist cards and metrics into the Zustand store.

The UI now renders each step's status, duration, and diagnostic notes so we can immediately pinpoint slow or failing stages.

## Detailed Flow

| Step | Name                             | Trigger                             | Success Output                                             | Failure Mode                                                          |
| ---- | -------------------------------- | ----------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| 1    | Validate Configuration           | `searchKeyword` start               | Records selected model + attempt count                     | Missing API key/model short-circuits before worker launch             |
| 2    | Compose Prompt Payload           | Before network call                 | Builds `{ model, messages, ...normalizedParameters }` body | Malformed parameters (should not happen after normalization)          |
| 3    | POST OpenRouter Chat Completions | Fetch with abort + 20s timeout      | `Response.ok === true`                                     | HTTP error, timeout, abort, or network issue                          |
| 4    | Read OpenRouter Response         | JSON decode or SSE aggregation      | Usage metadata + `choices[0].message.content`              | Streaming never completed, JSON parse error, OpenRouter `error` field |
| 5    | Convert Plain Text to JSON       | `convertTextToStories(result)`      | Stories + rejection counts from conversion                 | Regex errors, zero detected stories, invalid conversion instructions  |
| 6    | Parse Stories JSON               | `parseJSON(convertedJson)`          | Validated `stories[]` array                                | JSON syntax error or missing `stories` key                            |
| 7    | Materialize Cards                | Map stories → `Card` objects        | Cards with ids, metadata, cost calculations                | Skipped if Step 6 fails                                               |
| 8    | Persist & Update State           | Add cards to store, update progress | Cards appended, counters updated                           | Skipped if upstream failure                                           |

### Payload Composition (Step 2)

```
POST https://openrouter.ai/api/v1/chat/completions
Headers: Authorization (Bearer sk-or-v1-...), Content-Type: application/json,
         X-Title: News Report Generator, HTTP-Referer: <origin>
Body: {
  "model": "<selected>:online",
  "messages": [
    {
      "role": "user",
      "content": "<search instructions>\n\n\"<keyword>\""
    }
  ],
  ...normalizedParameters
}
```

### Response Handling (Steps 4–6)

- We inspect the `Content-Type`; `application/json` payloads are parsed directly, while `text/event-stream` bodies are consumed incrementally until a terminal `[DONE]` marker with a complete `choices` payload arrives.
- Regardless of transport, the decoded response must not contain an `error` property.
- `choices[0].message.content` is plain text. We run it through `convertTextToStories`, which applies the configurable regex instructions, returns structured stories, and tracks rejected fragments.
- The conversion outcome is stringified, then parsed with `parseJSON` to reuse downstream validators. If parsing fails or the stories array is missing, later stages are marked as skipped/error.

### Card Materialization (Steps 6–7)

- Each story becomes a `Card` with generated id, keyword back-reference, rating normalization, and ISO timestamps.
- Token usage data from OpenRouter is converted to USD cost using the selected model's pricing.
- Cards are added to the active deck immediately, and totals/history update once all keywords finish.

## Diagnostics & Observability

- Every step writes status + detail text, plus start/end timestamps for duration tracking.
- When retries occur, steps reset so the latest attempt is reflected in the trace.
- Timeouts, aborts, HTTP failures, JSON errors, and skipped downstream stages show as `error` with explicit messaging.
- Downstream steps that never ran are auto-marked as "Skipped" with context about the upstream failure point so the trace never stalls at "pending".

This instrumentation aligns the visual trace with the real execution order, enabling rapid identification of bottlenecks (e.g., long-running OpenRouter calls) or malformed outputs (e.g., parse failures).
