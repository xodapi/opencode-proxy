function renderDashboard() {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OpenCode Proxy Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, Segoe UI, system-ui, -apple-system, sans-serif;
      background: #f5f7fa;
      color: #111827;
      --border: #d8dee8;
      --muted: #667085;
      --panel: #ffffff;
      --soft: #eef2f7;
      --good: #087f5b;
      --good-bg: #e9fbf4;
      --warn: #9a5b00;
      --warn-bg: #fff6db;
      --bad: #c03221;
      --bad-bg: #fff0ef;
      --info: #1d4ed8;
      --info-bg: #edf4ff;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f5f7fa; color: #111827; }
    main { max-width: 1380px; margin: 0 auto; padding: 24px; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
    h1 { font-size: 42px; line-height: 1.02; margin: 0 0 6px; font-weight: 780; letter-spacing: 0; }
    h2 { font-size: 18px; margin: 0 0 12px; letter-spacing: 0; }
    p { margin: 0; color: var(--muted); }
    button {
      appearance: none;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #ffffff;
      color: #111827;
      cursor: pointer;
      font: inherit;
      padding: 9px 12px;
      min-height: 38px;
    }
    button:hover { background: #f8fafc; }
    .top-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
    .status { padding: 8px 10px; border: 1px solid #b7dfd4; border-radius: 8px; color: #164b3f; background: #ecfbf6; white-space: nowrap; }
    .source-line { color: #475467; font-size: 14px; }
    .model-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
    .model-card { min-width: 0; border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 16px; box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04); }
    .model-card.available { border-color: #9bd9c6; }
    .model-card.limited { border-color: #ff9b93; }
    .model-card.retry { border-color: #f4c152; }
    .model-card.error { border-color: #f0a39b; }
    .model-card.untested { border-color: var(--border); }
    .model-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; margin-bottom: 16px; }
    .model-name { font-size: 16px; font-weight: 720; line-height: 1.25; overflow-wrap: anywhere; }
    .badge { border-radius: 999px; padding: 5px 8px; font-size: 12px; font-weight: 720; white-space: nowrap; }
    .badge.available { color: var(--good); background: var(--good-bg); }
    .badge.limited { color: var(--bad); background: var(--bad-bg); }
    .badge.retry { color: var(--warn); background: var(--warn-bg); }
    .badge.error { color: var(--bad); background: var(--bad-bg); }
    .badge.untested { color: #475467; background: #f1f4f8; }
    .model-value { font-size: 32px; line-height: 1; font-weight: 790; margin-bottom: 8px; letter-spacing: 0; }
    .model-sub { color: var(--muted); font-size: 13px; min-height: 36px; }
    .quota { margin-top: 14px; }
    .quota-row { display: flex; justify-content: space-between; gap: 12px; color: #344054; font-size: 13px; margin-bottom: 7px; }
    .bar { height: 9px; background: #dde3ea; border-radius: 999px; overflow: hidden; }
    .bar > span { display: block; height: 100%; width: 0%; background: #13a987; border-radius: inherit; }
    .bar.limited > span { background: #ff6b63; }
    .bar.unknown { background: repeating-linear-gradient(90deg, #d7dde5 0 10px, #eef2f6 10px 20px); }
    .stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
    .stat-label { color: var(--muted); font-size: 12px; margin-bottom: 3px; }
    .stat-value { font-weight: 730; font-size: 16px; overflow-wrap: anywhere; }
    .summary-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 8px 0 18px; }
    .card { border: 1px solid var(--border); border-radius: 8px; background: var(--panel); padding: 14px; min-width: 0; }
    .label { color: var(--muted); font-size: 12px; margin-bottom: 8px; }
    .value { font-size: 28px; line-height: 1.1; font-weight: 760; letter-spacing: 0; }
    .sub { color: var(--muted); font-size: 12px; margin-top: 8px; }
    section { margin-top: 18px; }
    .table-wrap { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: #ffffff; }
    table { width: 100%; border-collapse: collapse; background: #ffffff; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #eef2f6; text-align: left; font-size: 13px; vertical-align: top; }
    th { color: #667085; font-weight: 680; background: #f1f4f8; }
    tr:last-child td { border-bottom: none; }
    .ok { color: var(--good); }
    .fail { color: var(--bad); }
    .warn { color: var(--warn); }
    .muted { color: var(--muted); }
    .right { text-align: right; }
    .privacy { margin-top: 16px; border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: #344054; background: #ffffff; }
    @media (max-width: 1120px) {
      .model-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 760px) {
      main { padding: 16px; }
      header { flex-direction: column; }
      h1 { font-size: 34px; }
      .top-actions { justify-content: flex-start; }
      .model-grid, .summary-grid { grid-template-columns: 1fr; }
      .table-wrap { overflow-x: auto; }
      th, td { white-space: nowrap; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Доступ к моделям</h1>
        <p class="source-line">OpenCode Zen proxy · лимиты из API и локальная история расхода</p>
      </div>
      <div class="top-actions">
        <div class="status" id="status">Загрузка...</div>
        <button id="refresh" type="button">Обновить</button>
      </div>
    </header>

    <div class="model-grid" id="modelCards"></div>

    <div class="summary-grid">
      <div class="card"><div class="label">Запросы, 5 мин</div><div class="value" id="requests">0</div><div class="sub" id="rpm">0 rpm</div></div>
      <div class="card"><div class="label">Токены / мин</div><div class="value" id="tpm">0</div><div class="sub" id="tokens">0 токенов</div></div>
      <div class="card"><div class="label">Средняя задержка</div><div class="value" id="latency">0мс</div><div class="sub" id="maxLatency">max 0мс</div></div>
      <div class="card"><div class="label">Ошибки, 5 мин</div><div class="value" id="errors">0</div><div class="sub" id="success">0 ok</div></div>
      <div class="card"><div class="label">Ближайший сброс</div><div class="value" id="nextReset">нет</div><div class="sub" id="nextResetModel">нет активного 429</div></div>
    </div>

    <section>
      <h2>Лимиты API</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Модель</th><th>Статус</th><th>Остаток</th><th>Сброс</th><th class="right">Ждать</th><th>Последняя ошибка</th></tr></thead>
          <tbody id="limits"><tr><td colspan="6" class="muted">Активных лимитов пока не наблюдали.</td></tr></tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Расход сегодня</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Модель</th><th class="right">Запросы</th><th class="right">OK</th><th class="right">Ошибки</th><th class="right">Токены</th><th class="right">429</th><th class="right">Средн. мс</th><th class="right">Cost</th></tr></thead>
          <tbody id="todayModels"><tr><td colspan="8" class="muted">Запросов сегодня еще нет.</td></tr></tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Расход по дням</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>День</th><th class="right">Запросы</th><th class="right">OK</th><th class="right">Ошибки</th><th class="right">Токены</th><th class="right">429</th><th class="right">Cost</th></tr></thead>
          <tbody id="dailyUsage"><tr><td colspan="7" class="muted">Истории пока нет.</td></tr></tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Последние запросы</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Время</th><th>Модель</th><th>Статус</th><th class="right">Задержка</th><th class="right">Токены</th><th>Финиш / ошибка</th></tr></thead>
          <tbody id="recent"><tr><td colspan="6" class="muted">Запросов пока нет.</td></tr></tbody>
        </table>
      </div>
    </section>

    <div class="privacy" id="privacy"></div>
  </main>

  <script>
    const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
    const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 });
    const $ = (id) => document.getElementById(id);

    function setText(id, text) { $(id).textContent = text; }

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }

    function renderRows(rows, empty, mapper) {
      if (!rows || !rows.length) return empty;
      return rows.map(mapper).join('');
    }

    async function refresh() {
      try {
        const res = await fetch('/metrics?window=300000&days=7', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const s = data.summary.window;
        const usage = data.usage || {};

        setText('status', 'Обновлено ' + new Date(data.generated_at).toLocaleTimeString('ru-RU') + ' · uptime ' + data.uptime_seconds + 'с');
        setText('requests', fmt.format(s.requests));
        setText('rpm', fmt.format(s.requests_per_minute) + ' rpm');
        setText('tpm', fmt.format(s.tokens_per_minute));
        setText('tokens', fmt.format(s.total_tokens) + ' токенов');
        setText('latency', fmt.format(s.latency_ms_avg) + 'мс');
        setText('maxLatency', 'max ' + fmt.format(s.latency_ms_max) + 'мс');
        setText('errors', fmt.format(s.fail));
        setText('success', fmt.format(s.ok) + ' ok');

        const primaryModels = (data.model_status && data.model_status.primary) || [];
        $('modelCards').innerHTML = renderRows(primaryModels, '<div class="card muted">Нет моделей в конфиге.</div>', renderModelCard);

        const activeLimits = (data.limits || []).filter((item) => item.limited);
        const nextLimit = activeLimits.find((item) => item.reset_at);
        if (nextLimit) {
          setText('nextReset', formatDuration(nextLimit.reset_in_seconds));
          setText('nextResetModel', nextLimit.model);
        } else if (activeLimits.length) {
          setText('nextReset', 'неизвестно');
          setText('nextResetModel', activeLimits[0].model);
        } else {
          setText('nextReset', 'нет');
          setText('nextResetModel', 'нет активного 429');
        }

        $('limits').innerHTML = renderRows(data.limits, '<tr><td colspan="6" class="muted">Активных лимитов пока не наблюдали.</td></tr>', (limit) => {
          const reset = limit.reset_at ? new Date(limit.reset_at).toLocaleString('ru-RU') : 'неизвестно';
          const wait = limit.reset_in_seconds == null ? 'неизвестно' : formatDuration(limit.reset_in_seconds);
          const state = limit.limited ? 'лимит активен' : 'наблюдали ранее';
          return '<tr><td>' + escapeHtml(limit.model) + '</td><td class="' + (limit.limited ? 'fail' : 'muted') + '">' + state + '</td><td>' + escapeHtml(formatQuota(limit)) + '</td><td>' + escapeHtml(reset) + '</td><td class="right">' + escapeHtml(wait) + '</td><td>' + escapeHtml(limit.error_type || '') + '</td></tr>';
        });

        const todayRows = ((usage.by_model_today || []).filter((row) => row.requests > 0));
        $('todayModels').innerHTML = renderRows(todayRows, '<tr><td colspan="8" class="muted">Запросов сегодня еще нет.</td></tr>', (m) =>
          '<tr><td>' + escapeHtml(m.model) + '</td><td class="right">' + fmt.format(m.requests) + '</td><td class="right ok">' + fmt.format(m.ok) + '</td><td class="right fail">' + fmt.format(m.fail) + '</td><td class="right">' + fmt.format(m.total_tokens) + '</td><td class="right warn">' + fmt.format(m.rate_limited || 0) + '</td><td class="right">' + fmt.format(m.latency_ms_avg) + '</td><td class="right">' + money.format(m.cost || 0) + '</td></tr>'
        );

        const dayRows = (usage.by_day || []).filter((row) => row.requests > 0);
        $('dailyUsage').innerHTML = renderRows(dayRows, '<tr><td colspan="7" class="muted">Истории пока нет.</td></tr>', (day) =>
          '<tr><td>' + escapeHtml(day.day) + '</td><td class="right">' + fmt.format(day.requests) + '</td><td class="right ok">' + fmt.format(day.ok) + '</td><td class="right fail">' + fmt.format(day.fail) + '</td><td class="right">' + fmt.format(day.total_tokens) + '</td><td class="right warn">' + fmt.format(day.rate_limited || 0) + '</td><td class="right">' + money.format(day.cost || 0) + '</td></tr>'
        );

        $('recent').innerHTML = renderRows(data.recent, '<tr><td colspan="6" class="muted">Запросов пока нет.</td></tr>', (e) => {
          const statusClass = e.ok ? 'ok' : 'fail';
          const detail = e.ok ? e.finish_reason : e.error_type;
          return '<tr><td>' + new Date(e.ts).toLocaleTimeString('ru-RU') + '</td><td>' + escapeHtml(e.model) + '</td><td class="' + statusClass + '">' + e.status + '</td><td class="right">' + fmt.format(e.latency_ms) + 'мс</td><td class="right">' + fmt.format(e.total_tokens) + '</td><td>' + escapeHtml(detail || '') + '</td></tr>';
        });

        const dbState = usage.enabled ? 'История: ' + (usage.path || 'usage.jsonl') : 'История: только память процесса';
        $('privacy').textContent = data.privacy.note + ' ' + dbState + '.';
      } catch (error) {
        setText('status', 'Ошибка дашборда: ' + error.message);
      }
    }

    function renderModelCard(item) {
      const state = item.state || 'untested';
      const label = stateLabel(state);
      const today = item.today || {};
      const previous = item.previous_day;
      const reset = item.reset_at ? 'Сброс через ' + formatDuration(item.reset_in_seconds) : resetFallback(state, item);
      const quota = formatQuota(item);
      const percent = quotaPercent(item);
      const barClass = percent == null ? 'bar unknown' : 'bar' + (state === 'limited' ? ' limited' : '');
      const previousText = previous
        ? previous.day + ': ' + fmt.format(previous.requests) + ' / ' + fmt.format(previous.total_tokens) + ' ток.'
        : 'нет истории';
      const sub = state === 'available'
        ? 'Последний успешный ответ ' + formatSeen(item.last_seen_at)
        : state === 'limited'
          ? reset
          : state === 'retry'
            ? 'Сброс прошел, нужна проверка'
            : state === 'error'
              ? 'Последняя ошибка ' + (item.last_status || '')
              : 'Еще не проверяли';

      return '<article class="model-card ' + escapeHtml(state) + '">' +
        '<div class="model-head"><div class="model-name">' + escapeHtml(item.model) + '</div><div class="badge ' + escapeHtml(state) + '">' + escapeHtml(label) + '</div></div>' +
        '<div class="model-value">' + escapeHtml(headline(state)) + '</div>' +
        '<div class="model-sub">' + escapeHtml(sub) + '</div>' +
        '<div class="quota"><div class="quota-row"><span>Остаток</span><strong>' + escapeHtml(quota) + '</strong></div><div class="' + barClass + '"><span style="width:' + (percent == null ? 0 : percent) + '%"></span></div></div>' +
        '<div class="stat-grid">' +
          '<div><div class="stat-label">Сегодня</div><div class="stat-value">' + fmt.format(today.requests || 0) + ' запр.</div></div>' +
          '<div><div class="stat-label">Токены</div><div class="stat-value">' + fmt.format(today.total_tokens || 0) + '</div></div>' +
          '<div><div class="stat-label">24 часа</div><div class="stat-value">' + fmt.format((item.last_24h && item.last_24h.requests) || 0) + ' запр.</div></div>' +
          '<div><div class="stat-label">Прошлый день</div><div class="stat-value">' + escapeHtml(previousText) + '</div></div>' +
        '</div>' +
      '</article>';
    }

    function stateLabel(state) {
      if (state === 'available') return 'доступна';
      if (state === 'limited') return 'лимит';
      if (state === 'retry') return 'проверить';
      if (state === 'error') return 'ошибка';
      return 'нет данных';
    }

    function headline(state) {
      if (state === 'available') return 'Работает';
      if (state === 'limited') return 'Лимит';
      if (state === 'retry') return 'Проверить';
      if (state === 'error') return 'Ошибка';
      return 'Нет данных';
    }

    function resetFallback(state, item) {
      if (state === 'available') return 'активного лимита нет';
      if (state === 'untested') return 'нет данных о сбросе';
      if (item.last_status === 429) return 'сброс не передан API';
      return 'нет данных о сбросе';
    }

    function formatQuota(item) {
      if (item.rate_limit_remaining != null && item.rate_limit_limit != null) {
        return fmt.format(item.rate_limit_remaining) + ' / ' + fmt.format(item.rate_limit_limit);
      }
      if (item.rate_limit_remaining != null) return fmt.format(item.rate_limit_remaining);
      return 'API не передал';
    }

    function quotaPercent(item) {
      if (item.rate_limit_remaining == null || item.rate_limit_limit == null || item.rate_limit_limit <= 0) return null;
      return Math.max(0, Math.min(100, Math.round((item.rate_limit_remaining / item.rate_limit_limit) * 100)));
    }

    function formatSeen(value) {
      return value ? new Date(value).toLocaleTimeString('ru-RU') : 'нет данных';
    }

    function formatDuration(seconds) {
      if (seconds == null) return 'неизвестно';
      const s = Math.max(0, Math.floor(seconds));
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      if (d > 0) return d + 'д ' + h + 'ч';
      if (h > 0) return h + 'ч ' + m + 'м';
      return m + 'м';
    }

    $('refresh').addEventListener('click', refresh);
    refresh();
    setInterval(refresh, 3000);
  </script>
</body>
</html>`;
}

export { renderDashboard };
