const DEFAULT_MODELS = [
  'big-pickle',
  'deepseek-v4-flash-free',
  'mimo-v2.5-free',
  'north-mini-code-free',
  'nemotron-3-ultra-free',
];

const DEFAULT_PRIMARY_MODELS = [
  'deepseek-v4-flash-free',
  'mimo-v2.5-free',
  'north-mini-code-free',
  'nemotron-3-ultra-free',
];

function loadConfig() {
  const models = process.env.MODELS
    ? process.env.MODELS.split(',').map(m => m.trim()).filter(Boolean)
    : DEFAULT_MODELS;
  const activeModels = models.length > 0 ? models : DEFAULT_MODELS;
  const requestedPrimaryModels = process.env.PRIMARY_MODELS
    ? process.env.PRIMARY_MODELS.split(',').map(m => m.trim()).filter(Boolean)
    : DEFAULT_PRIMARY_MODELS;
  const primaryModels = normalizePrimaryModels(requestedPrimaryModels, activeModels);

  return {
    host: process.env.HOST || '127.0.0.1',
    port: parseInt(process.env.PORT || '3000', 10),
    apiKey: process.env.OPENCODE_ZEN_API_KEY || 'public',
    models: activeModels,
    primaryModels,
    upstream: process.env.UPSTREAM_URL || 'https://opencode.ai/zen/v1',
    routing: process.env.ROUTING || 'round-robin',
    timeout: parseInt(process.env.UPSTREAM_TIMEOUT || '30000', 10),
    metricsMaxEvents: parseInt(process.env.METRICS_MAX_EVENTS || '2000', 10),
    usageDbPath: process.env.USAGE_DB_PATH || '',
    usageRetentionDays: parseInt(process.env.USAGE_RETENTION_DAYS || '30', 10),
  };
}

function normalizePrimaryModels(primaryModels, activeModels) {
  const output = [];
  for (const model of primaryModels) {
    if (activeModels.includes(model) && !output.includes(model)) output.push(model);
  }
  for (const model of activeModels) {
    if (output.length >= 4) break;
    if (!output.includes(model)) output.push(model);
  }
  return output.slice(0, 4);
}

export { loadConfig, DEFAULT_MODELS, DEFAULT_PRIMARY_MODELS, normalizePrimaryModels };
