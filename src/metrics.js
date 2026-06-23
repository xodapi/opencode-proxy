const DEFAULT_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_MAX_EVENTS = 2000;

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function emptyAggregate(model) {
  return {
    model,
    requests: 0,
    ok: 0,
    fail: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    cost: 0,
    latency_ms_sum: 0,
    latency_ms_avg: 0,
    latency_ms_max: 0,
  };
}

function readHeader(headers, names) {
  for (const name of names) {
    const value = headers?.get?.(name);
    if (value) return value;
  }
  return '';
}

function parseRetryAfter(value, now = Date.now()) {
  if (!value) return null;
  const trimmed = String(value).trim();
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return {
      retry_after_seconds: Math.ceil(seconds),
      reset_at_ts: now + seconds * 1000,
      reset_at: new Date(now + seconds * 1000).toISOString(),
      source: 'retry-after',
    };
  }

  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) {
    return {
      retry_after_seconds: Math.max(0, Math.ceil((dateMs - now) / 1000)),
      reset_at_ts: dateMs,
      reset_at: new Date(dateMs).toISOString(),
      source: 'retry-after-date',
    };
  }

  return null;
}

function parseResetHeader(value, now = Date.now()) {
  if (!value) return null;
  const trimmed = String(value).trim();
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric >= 0) {
    const resetAtTs = numeric > 10_000_000_000
      ? numeric
      : numeric > 10_000_000
        ? numeric * 1000
        : now + numeric * 1000;
    return {
      retry_after_seconds: Math.max(0, Math.ceil((resetAtTs - now) / 1000)),
      reset_at_ts: resetAtTs,
      reset_at: new Date(resetAtTs).toISOString(),
      source: 'rate-limit-reset',
    };
  }

  const dateMs = Date.parse(trimmed);
  if (Number.isFinite(dateMs)) {
    return {
      retry_after_seconds: Math.max(0, Math.ceil((dateMs - now) / 1000)),
      reset_at_ts: dateMs,
      reset_at: new Date(dateMs).toISOString(),
      source: 'rate-limit-reset-date',
    };
  }

  return null;
}

function extractLimitFromHeaders(headers, status, now = Date.now()) {
  const retryAfter = parseRetryAfter(readHeader(headers, ['retry-after']), now);
  const reset = retryAfter || parseResetHeader(readHeader(headers, [
    'ratelimit-reset',
    'rate-limit-reset',
    'x-ratelimit-reset',
    'x-rate-limit-reset',
  ]), now);
  const remaining = numberOrNull(readHeader(headers, [
    'ratelimit-remaining',
    'rate-limit-remaining',
    'x-ratelimit-remaining',
    'x-rate-limit-remaining',
  ]));
  const limit = numberOrNull(readHeader(headers, [
    'ratelimit-limit',
    'rate-limit-limit',
    'x-ratelimit-limit',
    'x-rate-limit-limit',
  ]));

  return {
    rate_limited: status === 429 || Boolean(reset),
    retry_after_seconds: reset?.retry_after_seconds ?? null,
    limit_reset_at: reset?.reset_at ?? null,
    limit_reset_at_ts: reset?.reset_at_ts ?? null,
    limit_source: reset?.source || '',
    rate_limit_remaining: remaining,
    rate_limit_limit: limit,
  };
}

class ProxyMetrics {
  constructor(options = {}) {
    this.maxEvents = Number.isFinite(options.maxEvents) ? options.maxEvents : DEFAULT_MAX_EVENTS;
    this.startedAt = Date.now();
    this.events = [];
  }

  record(event) {
    const safeEvent = {
      ts: event.ts || Date.now(),
      model: String(event.model || 'unknown'),
      returned_model: event.returned_model ? String(event.returned_model) : '',
      status: Number(event.status || 0),
      ok: Boolean(event.ok),
      latency_ms: Number(event.latency_ms || 0),
      total_tokens: Number(event.total_tokens || 0),
      prompt_tokens: Number(event.prompt_tokens || 0),
      completion_tokens: Number(event.completion_tokens || 0),
      cost: numberOrNull(event.cost),
      finish_reason: event.finish_reason ? String(event.finish_reason) : '',
      error_type: event.error_type ? String(event.error_type) : '',
      rate_limited: Boolean(event.rate_limited),
      retry_after_seconds: numberOrNull(event.retry_after_seconds),
      limit_reset_at: event.limit_reset_at ? String(event.limit_reset_at) : '',
      limit_reset_at_ts: numberOrNull(event.limit_reset_at_ts),
      limit_source: event.limit_source ? String(event.limit_source) : '',
      rate_limit_remaining: numberOrNull(event.rate_limit_remaining),
      rate_limit_limit: numberOrNull(event.rate_limit_limit),
    };

    this.events.push(safeEvent);
    if (this.events.length > this.maxEvents) {
      this.events.splice(0, this.events.length - this.maxEvents);
    }
  }

  snapshot(options = {}) {
    const now = Date.now();
    const windowMs = Number.isFinite(options.windowMs) && options.windowMs > 0
      ? options.windowMs
      : DEFAULT_WINDOW_MS;
    const since = now - windowMs;
    const windowEvents = this.events.filter((event) => event.ts >= since);
    const allSummary = aggregateEvents(this.events, Math.max(1, now - this.startedAt));
    const windowSummary = aggregateEvents(windowEvents, windowMs);

    return {
      version: 1,
      generated_at: new Date(now).toISOString(),
      started_at: new Date(this.startedAt).toISOString(),
      uptime_seconds: Math.floor((now - this.startedAt) / 1000),
      privacy: {
        stores_prompts: false,
        stores_responses: false,
        stores_api_keys: false,
        note: 'Only model, status, latency, token usage, cost, and error class are kept in memory.',
      },
      window_ms: windowMs,
      total_events_kept: this.events.length,
      summary: {
        all: allSummary,
        window: windowSummary,
      },
      limits: currentLimits(this.events, now),
      recent: this.events.slice(-20).reverse(),
    };
  }
}

function currentLimits(events, now = Date.now()) {
  const latestByModel = new Map();
  for (const event of events) {
    if (!event.rate_limited && event.status !== 429) continue;
    const previous = latestByModel.get(event.model);
    if (!previous || event.ts > previous.ts) {
      latestByModel.set(event.model, event);
    }
  }

  return Array.from(latestByModel.values())
    .map((event) => {
      const resetAtTs = event.limit_reset_at_ts || null;
      const resetInSeconds = resetAtTs ? Math.max(0, Math.ceil((resetAtTs - now) / 1000)) : null;
      return {
        model: event.model,
        status: event.status,
        limited: resetAtTs ? resetAtTs > now : event.status === 429,
        reset_at: event.limit_reset_at || null,
        reset_in_seconds: resetInSeconds,
        source: event.limit_source || '',
        last_seen_at: new Date(event.ts).toISOString(),
        error_type: event.error_type || '',
      };
    })
    .sort((a, b) => {
      if (a.limited !== b.limited) return a.limited ? -1 : 1;
      return (a.reset_in_seconds ?? Number.MAX_SAFE_INTEGER) - (b.reset_in_seconds ?? Number.MAX_SAFE_INTEGER);
    });
}

function aggregateEvents(events, durationMs) {
  const durationMinutes = Math.max(durationMs / 60_000, 1 / 60);
  const summary = {
    requests: events.length,
    ok: 0,
    fail: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    cost: 0,
    requests_per_minute: 0,
    tokens_per_minute: 0,
    latency_ms_avg: 0,
    latency_ms_max: 0,
    by_model: {},
  };

  let latencySum = 0;
  for (const event of events) {
    const model = event.model || 'unknown';
    const modelAggregate = summary.by_model[model] || emptyAggregate(model);
    summary.by_model[model] = modelAggregate;

    if (event.ok) {
      summary.ok++;
      modelAggregate.ok++;
    } else {
      summary.fail++;
      modelAggregate.fail++;
    }

    summary.total_tokens += event.total_tokens || 0;
    summary.prompt_tokens += event.prompt_tokens || 0;
    summary.completion_tokens += event.completion_tokens || 0;
    summary.cost += event.cost || 0;
    summary.latency_ms_max = Math.max(summary.latency_ms_max, event.latency_ms || 0);
    latencySum += event.latency_ms || 0;

    modelAggregate.requests++;
    modelAggregate.total_tokens += event.total_tokens || 0;
    modelAggregate.prompt_tokens += event.prompt_tokens || 0;
    modelAggregate.completion_tokens += event.completion_tokens || 0;
    modelAggregate.cost += event.cost || 0;
    modelAggregate.latency_ms_sum += event.latency_ms || 0;
    modelAggregate.latency_ms_max = Math.max(modelAggregate.latency_ms_max, event.latency_ms || 0);
  }

  summary.requests_per_minute = round(summary.requests / durationMinutes, 2);
  summary.tokens_per_minute = round(summary.total_tokens / durationMinutes, 2);
  summary.latency_ms_avg = summary.requests > 0 ? round(latencySum / summary.requests, 0) : 0;
  summary.cost = round(summary.cost, 6);

  for (const aggregate of Object.values(summary.by_model)) {
    aggregate.latency_ms_avg = aggregate.requests > 0
      ? round(aggregate.latency_ms_sum / aggregate.requests, 0)
      : 0;
    aggregate.cost = round(aggregate.cost, 6);
    delete aggregate.latency_ms_sum;
  }

  summary.by_model = Object.values(summary.by_model)
    .sort((a, b) => b.requests - a.requests || a.model.localeCompare(b.model));

  return summary;
}

function extractUsageFromBody(body) {
  if (!body || typeof body !== 'object') {
    return {
      returned_model: '',
      finish_reason: '',
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      cost: null,
    };
  }

  return {
    returned_model: body.model || '',
    finish_reason: body.choices?.[0]?.finish_reason || '',
    total_tokens: Number(body.usage?.total_tokens || 0),
    prompt_tokens: Number(body.usage?.prompt_tokens || 0),
    completion_tokens: Number(body.usage?.completion_tokens || 0),
    cost: numberOrNull(body.cost),
  };
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export {
  DEFAULT_MAX_EVENTS,
  DEFAULT_WINDOW_MS,
  ProxyMetrics,
  aggregateEvents,
  currentLimits,
  extractLimitFromHeaders,
  extractUsageFromBody,
  parseRetryAfter,
  parseResetHeader,
};
