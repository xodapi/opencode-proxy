# Issue Backlog

This backlog converts `Анализ ИИ Прокси Решений.md` into implementation-sized tasks. Keep the project local-first; avoid enterprise features until they solve a real team workflow.

## P1: Preserve streaming responses end-to-end

Labels: `proxy`, `streaming`, `compatibility`

Problem: `POST /v1/chat/completions` currently reads upstream responses with `response.text()`. That buffers SSE responses and hurts agent responsiveness.

Acceptance criteria:

- Proxy forwards `text/event-stream` chunks as they arrive.
- Metrics still record status, latency, safe usage, rate-limit headers, and error class.
- Non-streaming JSON responses keep current behavior.
- Tests cover streaming passthrough without storing streamed content.

## P1: Add bounded retry and model fallback

Labels: `routing`, `reliability`

Problem: The router picks one model, but upstream `429`, timeout, and `5xx` failures still stop the request.

Acceptance criteria:

- Retry transient failures with bounded exponential backoff and jitter.
- Honor `Retry-After` when present.
- Try the next configured model only for safe retry cases.
- Response includes the final `X-Model-Used`.
- Metrics record each attempt without prompts or responses.

## P1: Track per-model circuit breaker state

Labels: `routing`, `metrics`, `reliability`

Problem: Repeatedly failing models remain in rotation.

Acceptance criteria:

- Each model has `healthy`, `degraded`, or `open` state.
- Consecutive `429`, timeout, or `5xx` results can temporarily remove a model from rotation.
- Successful probes or real requests restore the model gradually.
- `/metrics`, `/limits`, `/diag`, and dashboard/flow expose the state.

## P2: Add request schema validation

Labels: `api`, `security`

Problem: Invalid chat-completion payloads are only checked as JSON, so malformed requests can reach upstream.

Acceptance criteria:

- Validate required OpenAI-compatible fields for `/v1/chat/completions`.
- Return stable `400` JSON errors for invalid payloads.
- Keep unknown optional fields pass-through unless unsafe.
- Tests cover malformed JSON, missing messages, invalid message shapes, and oversize bodies.

## P2: Add Anthropic-compatible `/v1/messages` translation

Labels: `api`, `compatibility`

Problem: The research note highlights tool fragmentation between Anthropic and OpenAI-compatible clients. This proxy currently targets OpenAI-compatible OpenCode setup.

Acceptance criteria:

- Add an opt-in `/v1/messages` route that maps basic Anthropic messages to OpenAI chat completions.
- Convert non-streaming responses back to Anthropic-compatible shape.
- Preserve privacy-safe metrics.
- Document unsupported fields clearly before widening scope.

## P2: Preserve streaming in translation paths

Labels: `api`, `streaming`, `compatibility`

Problem: If `/v1/messages` is added, streaming translation must not repeat the current buffering limitation.

Acceptance criteria:

- Anthropic SSE input/output translation works chunk-by-chunk.
- Tool-use and thinking blocks are passed through only when explicitly supported.
- Tests assert early chunk forwarding and privacy-safe usage recording.

## P2: Add latency-aware routing mode

Labels: `routing`, `observability`

Problem: Round-robin and random routing ignore model latency and recent failure rate.

Acceptance criteria:

- Add a config value such as `ROUTING=latency`.
- Use recent per-model latency and health state to choose a model.
- Fall back to round-robin if there is not enough data.
- `/diag` shows the active routing strategy and model scores.

## P2: Add weighted routing mode

Labels: `routing`, `configuration`

Problem: Some models should receive more or less traffic, especially during experiments or quota pressure.

Acceptance criteria:

- Add a simple `MODEL_WEIGHTS` config format.
- Validate weights and ignore unknown models safely.
- Keep deterministic tests for weighted selection.
- Document examples for local Windows users.

## P2: Add local budget guardrails

Labels: `governance`, `cost`

Problem: The dashboard tracks usage, but the proxy does not enforce token or cost ceilings.

Acceptance criteria:

- Support optional daily token and cost limits.
- Return a clear local `429` when a configured limit is exceeded.
- Expose budget state in `/metrics`, `/usage`, `/diag`, and dashboard.
- Never require cloud billing integration.

## P2: Add virtual local proxy tokens

Labels: `security`, `governance`

Problem: `MANAGEMENT_TOKEN` protects management endpoints, but there is no per-client token for API usage or quotas.

Acceptance criteria:

- Support optional local tokens for `/v1/chat/completions`.
- Associate tokens with model allowlists and optional budgets.
- Store only hashed local token identifiers if persistence is added.
- Keep default setup tokenless on `127.0.0.1` for simple local use.

## P3: Add exact-match response cache

Labels: `cache`, `performance`

Problem: Repeated identical requests consume upstream calls even when the answer is reusable.

Acceptance criteria:

- Add opt-in exact cache keyed by normalized request shape and selected model.
- Do not cache requests with unsafe or unknown tool side effects.
- Cache records must not expose prompts in metrics or exports.
- `/metrics` exposes hit/miss counters.

## P3: Research local semantic cache

Labels: `cache`, `research`

Problem: Semantic caching could reduce repeated agent work, but it carries privacy, correctness, and dependency risks.

Acceptance criteria:

- Produce a short design comparing SQLite-only, SQLite plus local embeddings, and external vector DB options.
- Define invalidation and project isolation rules.
- Include a no-network default.
- Do not implement until exact cache and streaming are stable.

## P3: Add `/count_tokens`

Labels: `api`, `developer-experience`

Problem: Agents benefit from local token estimates before sending large contexts.

Acceptance criteria:

- Add a local `/count_tokens` endpoint with no upstream call.
- Start with approximate tokenizer behavior if exact tokenizer dependency is too heavy.
- Mark estimates clearly in JSON output.
- Add tests for strings, chat messages, and empty input.

## P3: Add Prometheus-style metrics endpoint

Labels: `observability`

Problem: `/metrics` is good for the dashboard, but automation often expects scrape-friendly counters/gauges.

Acceptance criteria:

- Add `/metrics/prometheus` or `/metrics.txt`.
- Include requests, failures, rate limits, tokens, latency, cache hits, and circuit-breaker state.
- Keep management auth behavior consistent.
- Tests verify no prompt/response text appears.

## P3: Add dashboard/flow visual QA

Labels: `dashboard`, `quality`

Problem: The lightweight `/flow` view is test-covered syntactically, but not visually.

Acceptance criteria:

- Add a Playwright or browser-based smoke workflow for `/dashboard` and `/flow`.
- Check desktop and mobile viewport screenshots for nonblank content and no obvious overlap.
- Keep the test optional if it adds heavy dependencies.

## P3: Tighten dashboard and flow CSP

Labels: `security`, `frontend`

Problem: Inline scripts/styles require `'unsafe-inline'` in CSP.

Acceptance criteria:

- Move dashboard and flow JS/CSS into static assets or generated asset routes.
- Remove `'unsafe-inline'` from CSP.
- Keep Chart.js pinned or replace it with local source-only assets.
- Tests assert final CSP shape.

## P3: Add project-scoped proxy environment guidance

Labels: `docs`, `developer-experience`

Problem: Global `HTTP_PROXY`/`HTTPS_PROXY` can interfere with npm, git, and VPN workflows.

Acceptance criteria:

- Document supported OpenCode-specific provider configuration.
- Document `NO_PROXY` and localhost expectations.
- Add `doctor` checks for risky global proxy env vars.

## P4: Evaluate tool-use, thinking, and multimodal passthrough

Labels: `research`, `compatibility`

Problem: The research note lists tool calling, thinking metadata, and multimodal payloads, but these can expand scope quickly.

Acceptance criteria:

- Inventory what OpenCode sends today.
- Decide which fields should be pass-through, translated, rejected, or ignored.
- Add compatibility tests before enabling any transformation.

