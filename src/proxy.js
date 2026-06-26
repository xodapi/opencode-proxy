import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadConfig } from './config.js';
import { renderDashboard } from './dashboard.js';
import { renderFlow } from './flow.js';
import { ProxyMetrics, extractLimitFromHeaders, extractUsageFromBody, extractUsageFromText, withEstimatedUsage } from './metrics.js';
import { Router } from './router.js';
import { UsageStore } from './usage_store.js';

const PKG = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const VERSION = PKG.version || '0.0.0';
const APP_NAME = PKG.name || 'opencode-proxy';

const DEFAULT_MAX_BODY_BYTES = 2 * 1024 * 1024;
const MANAGEMENT_PATHS = new Set(['/dashboard', '/flow', '/metrics', '/diag', '/usage', '/limits']);

const SAFE_UPSTREAM_HEADERS = [
  'retry-after',
  'ratelimit-reset',
  'rate-limit-reset',
  'x-ratelimit-reset',
  'x-rate-limit-reset',
  'ratelimit-remaining',
  'rate-limit-remaining',
  'x-ratelimit-remaining',
  'x-rate-limit-remaining',
  'ratelimit-limit',
  'rate-limit-limit',
  'x-ratelimit-limit',
  'x-rate-limit-limit',
];

function createProxy(customConfig) {
  const config = customConfig || loadConfig();
  const maxBodyBytes = Number.isFinite(config.maxBodyBytes) && config.maxBodyBytes > 0
    ? config.maxBodyBytes
    : DEFAULT_MAX_BODY_BYTES;
  const router = new Router(config.models, config.routing);
  const usageStore = Object.hasOwn(config, 'usageDbPath')
    ? new UsageStore({ path: config.usageDbPath, retentionDays: config.usageRetentionDays })
    : null;
  const metrics = new ProxyMetrics({
    maxEvents: config.metricsMaxEvents,
    models: config.models,
    primaryModels: config.primaryModels,
    usageStore,
  });
  const logger = config.logger || console;

  async function proxyRequest(req, res) {
    const requestStartedAt = Date.now();
    const url = new URL(req.url, 'http://127.0.0.1');
    const requestId = requestIdFor(req);
    const logContext = {};
    instrumentResponse(req, res, {
      config,
      logger,
      logContext,
      requestId,
      requestStartedAt,
      url,
    });

    if (!authorizeManagementRequest(req, res, config, url)) {
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', models: config.models }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/dashboard') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDashboard(VERSION));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/flow') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderFlow(VERSION));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/metrics') {
      const windowMs = parseInt(url.searchParams.get('window') || '', 10);
      const usageDays = parseInt(url.searchParams.get('days') || '', 10);
      const snap = metrics.snapshot({ windowMs, usageDays });
      snap.routing = config.routing;
      snap.app = APP_NAME;
      snap.app_version = VERSION;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(snap));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/diag') {
      const snap = metrics.snapshot({ usageDays: 1 });
      snap.routing = config.routing;
      snap.app = APP_NAME;
      snap.app_version = VERSION;
      const uptime = snap.uptime_seconds || 0;
      const s = snap.summary?.window || {};
      const primary = snap.model_status?.primary || [];
      const diag = {
        version: VERSION,
        app: APP_NAME,
        uptime_seconds: uptime,
        uptime_human: uptime > 0 ? Math.floor(uptime / 3600) + 'ч ' + Math.floor((uptime % 3600) / 60) + 'м' : '—',
        generated_at: snap.generated_at,
        routing: config.routing,
        models_count: config.models.length,
        primary_models_count: primary.length,
        primary_models: primary.map(m => ({ model: m.model, state: m.state || 'untested', limited: !!m.limited })),
        window_5min: {
          requests: s.requests || 0,
          ok: s.ok || 0,
          fail: s.fail || 0,
          rate_limited: s.rate_limited || 0,
          latency_ms_avg: s.latency_ms_avg || 0,
          latency_ms_max: s.latency_ms_max || 0,
          tokens_per_minute: s.tokens_per_minute || 0,
        },
        health: s.fail > s.ok ? 'error' : ((s.fail || 0) > (s.requests || 0) * 0.2 ? 'warn' : 'ok'),
        errors: snap.errors || [],
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(diag, null, 2));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/usage') {
      const usageDays = parseInt(url.searchParams.get('days') || '', 10);
      const snapshot = metrics.snapshot({ usageDays });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        generated_at: snapshot.generated_at,
        usage: snapshot.usage,
        model_status: snapshot.model_status,
      }));
      return;
    }

    if (req.method === 'GET' && isUsageExportPath(url)) {
      const usageDays = parseInt(url.searchParams.get('days') || '', 10);
      const format = usageExportFormat(url);
      const snapshot = metrics.snapshot({ usageDays });
      if (format === 'csv') {
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="opencode-usage.csv"',
        });
        res.end(usageExportCsv(snapshot.usage));
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="opencode-usage.json"',
        });
        res.end(JSON.stringify({
          generated_at: snapshot.generated_at,
          privacy: snapshot.privacy,
          summary: snapshot.summary,
          usage: snapshot.usage,
          model_status: snapshot.model_status,
        }, null, 2));
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/limits') {
      const snapshot = metrics.snapshot();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        generated_at: snapshot.generated_at,
        limits: snapshot.limits,
        model_status: snapshot.model_status,
      }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/models') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        object: 'list',
        data: config.models.map(m => ({
          id: m,
          object: 'model',
          created: Date.now(),
          owned_by: 'opencode-zen',
        })),
      }));
      return;
    }

    if (req.method !== 'POST' || url.pathname !== '/v1/chat/completions') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    let body;
    try {
      body = await readRequestBody(req, maxBodyBytes);
    } catch (error) {
      if (error?.code === 'REQUEST_BODY_TOO_LARGE') {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body too large' }));
        req.destroy?.();
        return;
      }

      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read request body' }));
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const selectedModel = router.getModelForRequest(parsed.model);
    logContext.model = selectedModel;
    parsed.model = selectedModel;
    const upstreamStartedAt = Date.now();
    let timer;
    let abortOnClose;

    try {
      const controller = new AbortController();
      abortOnClose = () => {
        if (!res.writableEnded) controller.abort();
      };
      req.on?.('close', abortOnClose);
      timer = setTimeout(() => controller.abort(), config.timeout);

      const upstreamUrl = `${config.upstream}/chat/completions`;
      const response = await fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify(parsed),
      });
      clearTimeout(timer);
      timer = null;
      logContext.upstream_status = response.status;

      const text = await response.text();
      const parsedResponse = safeParseJSON(text);
      const rawUsage = parsedResponse
        ? extractUsageFromBody(parsedResponse)
        : extractUsageFromText(text);
      const usage = withEstimatedUsage(rawUsage, parsed, text, parsedResponse);
      const limit = extractLimitFromHeaders(response.headers, response.status, Date.now(), {
        defaultRetryAfter: config.defaultRetryAfter,
        responseBody: text,
      });
      metrics.record({
        model: selectedModel,
        status: response.status,
        ok: response.ok,
        latency_ms: Date.now() - upstreamStartedAt,
        error_type: response.ok ? '' : upstreamErrorType(parsedResponse, response.status),
        ...usage,
        ...limit,
      });

      res.writeHead(response.status, {
        'Content-Type': 'application/json',
        'X-Model-Used': selectedModel,
        ...safeUpstreamHeaders(response.headers),
      });

      res.end(text);
    } catch (error) {
      if (timer) clearTimeout(timer);
      const message = error.name === 'AbortError'
        ? 'Upstream timeout'
        : error.message;
      metrics.record({
        model: selectedModel,
        status: 502,
        ok: false,
        latency_ms: Date.now() - upstreamStartedAt,
        error_type: error.name === 'AbortError' ? 'timeout' : 'network',
      });
      logger.error(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'upstream_error',
        request_id: requestId,
        model: selectedModel,
        error_type: error.name === 'AbortError' ? 'timeout' : 'network',
        error_message: error.message,
      }));
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Upstream request failed' }));
    } finally {
      if (abortOnClose) req.off?.('close', abortOnClose);
    }
  }

  const lastProbeTime = {};

  if (config.probeInterval > 0) {
    const intervalId = setInterval(() => {
      const snap = metrics.snapshot();
      const allModels = snap.model_status?.all || [];
      for (const m of allModels) {
        const lastSeen = m.last_seen_at ? Date.parse(m.last_seen_at) : 0;
        const lastProbe = lastProbeTime[m.model] || 0;
        const timeSinceLastProbe = Date.now() - lastProbe;

        let needsProbe = false;
        if (m.state === 'limited') {
          const resetIn = m.reset_in_seconds || 0;
          if (resetIn > 600) {
            needsProbe = timeSinceLastProbe > 30 * 60 * 1000;
          } else {
            needsProbe = timeSinceLastProbe > config.probeInterval;
          }
        } else {
          const isStale = m.state === 'error'
            || m.state === 'retry'
            || m.state === 'untested'
            || (Date.now() - lastSeen > 5 * 60 * 1000);

          if (isStale) {
            needsProbe = timeSinceLastProbe > config.probeInterval;
          }
        }

        if (needsProbe) {
          lastProbeTime[m.model] = Date.now();
          probeModel(m.model, config, metrics, logger).catch(() => {});
        }
      }
    }, config.probeInterval);

    if (intervalId && typeof intervalId.unref === 'function') {
      intervalId.unref();
    }
  }

  return { proxyRequest, config, router, metrics, usageStore };
}

function instrumentResponse(req, res, options) {
  const { config, logger, logContext, requestId, requestStartedAt, url } = options;
  const originalWriteHead = res.writeHead?.bind(res);

  if (res.setHeader) {
    res.setHeader('X-Request-Id', requestId);
  }

  if (originalWriteHead) {
    res.writeHead = (status, headers = {}) => {
      logContext.status = status;
      return originalWriteHead(status, {
        ...securityHeadersFor(url),
        ...headers,
        'X-Request-Id': requestId,
      });
    };
  }

  res.on?.('finish', () => {
    if (config.accessLog !== true) return;
    const entry = {
      ts: new Date().toISOString(),
      level: 'info',
      event: 'http_request',
      request_id: requestId,
      method: req.method || '',
      path: url.pathname,
      status: logContext.status || res.statusCode || 0,
      latency_ms: Date.now() - requestStartedAt,
    };
    if (logContext.model) entry.model = logContext.model;
    if (logContext.upstream_status) entry.upstream_status = logContext.upstream_status;
    logger.log?.(JSON.stringify(entry));
  });
}

function securityHeadersFor(url) {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  };

  if (isManagementPath(url.pathname)) {
    headers['Cache-Control'] = 'no-store';
  }

  if (url.pathname === '/dashboard' || url.pathname === '/flow') {
    const scriptSrc = url.pathname === '/dashboard'
      ? "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
      : "script-src 'self' 'unsafe-inline'";
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "img-src 'self' data:",
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
    ].join('; ');
  }

  return headers;
}

function authorizeManagementRequest(req, res, config, url) {
  if (req.method !== 'GET' || !isManagementPath(url.pathname)) return true;
  if (config.managementAuthRequired !== true) return true;

  if (!config.managementToken) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Management endpoints require MANAGEMENT_TOKEN when HOST is not localhost',
    }));
    return false;
  }

  if (hasValidManagementToken(req.headers, config.managementToken)) return true;

  res.writeHead(401, {
    'Content-Type': 'application/json',
    'WWW-Authenticate': 'Basic realm="OpenCode Proxy"',
  });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
  return false;
}

function isManagementPath(pathname) {
  return MANAGEMENT_PATHS.has(pathname)
    || pathname === '/export/usage'
    || pathname === '/export/usage.json'
    || pathname === '/export/usage.csv';
}

function hasValidManagementToken(headers, expectedToken) {
  const directToken = headerValue(headers, 'x-proxy-token');
  if (tokenMatches(directToken, expectedToken)) return true;

  const authorization = headerValue(headers, 'authorization');
  const bearer = authorization.match(/^Bearer\s+(.+)$/i);
  if (bearer && tokenMatches(bearer[1].trim(), expectedToken)) return true;

  const basic = authorization.match(/^Basic\s+(.+)$/i);
  if (!basic) return false;

  try {
    const decoded = Buffer.from(basic[1].trim(), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    const token = separator >= 0 ? decoded.slice(separator + 1) : decoded;
    return tokenMatches(token, expectedToken);
  } catch {
    return false;
  }
}

function tokenMatches(actual, expected) {
  if (!actual || !expected) return false;
  const actualBuffer = Buffer.from(String(actual));
  const expectedBuffer = Buffer.from(String(expected));
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function requestIdFor(req) {
  return headerValue(req.headers, 'x-request-id') || randomUUID();
}

function headerValue(headers, name) {
  if (!headers) return '';
  if (headers.get) return headers.get(name) || headers.get(name.toLowerCase()) || '';
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === lowerName) {
      return Array.isArray(value) ? String(value[0] || '') : String(value || '');
    }
  }
  return '';
}

async function readRequestBody(req, maxBodyBytes = DEFAULT_MAX_BODY_BYTES) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBodyBytes) {
      const error = new Error('Request body too large');
      error.code = 'REQUEST_BODY_TOO_LARGE';
      throw error;
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function upstreamErrorType(body, status) {
  if (body?.error?.message) return body.error.message;
  if (body?.error) return String(body.error);
  if (body?.message) return String(body.message);
  return `HTTP ${status}`;
}

function safeUpstreamHeaders(headers) {
  const output = {};
  for (const name of SAFE_UPSTREAM_HEADERS) {
    const value = headers.get(name);
    if (value) output[name] = value;
  }
  return output;
}

function isUsageExportPath(url) {
  return url.pathname === '/export/usage'
    || url.pathname === '/export/usage.json'
    || url.pathname === '/export/usage.csv';
}

function usageExportFormat(url) {
  if (url.pathname.endsWith('.csv')) return 'csv';
  if (url.pathname.endsWith('.json')) return 'json';
  return url.searchParams.get('format') === 'csv' ? 'csv' : 'json';
}

function usageExportCsv(usage) {
  const rows = [[
    'day',
    'model',
    'requests',
    'ok',
    'fail',
    'total_tokens',
    'prompt_tokens',
    'completion_tokens',
    'usage_reported',
    'usage_estimated',
    'rate_limited',
    'latency_ms_avg',
    'latency_ms_max',
    'cost',
  ]];

  for (const day of usage?.by_day || []) {
    rows.push(usageCsvRow(day.day, '__all__', day));
    for (const model of day.by_model || []) {
      rows.push(usageCsvRow(day.day, model.model, model));
    }
  }

  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function usageCsvRow(day, model, item) {
  return [
    day,
    model,
    item.requests || 0,
    item.ok || 0,
    item.fail || 0,
    item.total_tokens || 0,
    item.prompt_tokens || 0,
    item.completion_tokens || 0,
    item.usage_reported || 0,
    item.usage_estimated || 0,
    item.rate_limited || 0,
    item.latency_ms_avg || 0,
    item.latency_ms_max || 0,
    item.cost || 0,
  ];
}

function csvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  if (!/[",\r\n]/.test(safeText)) return safeText;
  return `"${safeText.replace(/"/g, '""')}"`;
}

async function probeModel(model, config, metrics, logger) {
  const upstreamUrl = `${config.upstream}/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000); // 10s timeout for probe

  try {
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      }),
    });
    clearTimeout(timer);

    const text = await response.text();
    const parsedResponse = safeParseJSON(text);
    const limit = extractLimitFromHeaders(response.headers, response.status, Date.now(), {
      defaultRetryAfter: config.defaultRetryAfter,
      responseBody: text,
    });

    metrics.record({
      model,
      status: response.status,
      ok: response.ok,
      latency_ms: 0,
      is_probe: true,
      error_type: response.ok ? '' : upstreamErrorType(parsedResponse, response.status),
      ...limit,
    });
  } catch (error) {
    clearTimeout(timer);
    metrics.record({
      model,
      status: 502,
      ok: false,
      is_probe: true,
      error_type: error.name === 'AbortError' ? 'timeout' : 'network',
    });
  }
}

export { createProxy, readRequestBody, usageExportCsv };
