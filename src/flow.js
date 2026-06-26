export function renderFlow(version = '0.0.0') {
  return `<!doctype html>
<html lang="ru" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OpenCode — Request Flow</title>
  <style>
    :root {
      --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --radius: 12px; --radius-sm: 8px; --radius-xs: 6px;
      --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    }
    [data-theme="dark"] {
      --bg: #0f1117; --bg-card: #1c1f2e; --bg-card-hover: #232640;
      --border: #2a2d42; --border-hover: #3d4166;
      --text: #e8eaed; --text-sec: #9ca3af; --text-muted: #6b7280;
      --accent: #6366f1; --accent-soft: rgba(99,102,241,.15);
      --good: #10b981; --good-bg: rgba(16,185,129,.15);
      --bad: #f43f5e; --bad-bg: rgba(244,63,94,.15);
      --warn: #f59e0b; --warn-bg: rgba(245,158,11,.15);
      --pipe-bg: #13151e; --node-bg: #1c1f2e; --node-border: #2a2d42;
    }
    [data-theme="light"] {
      --bg: #f8fafc; --bg-card: #ffffff; --bg-card-hover: #f1f5f9;
      --border: #e2e8f0; --border-hover: #cbd5e1;
      --text: #0f172a; --text-sec: #475569; --text-muted: #94a3b8;
      --accent: #6366f1; --accent-soft: rgba(99,102,241,.10);
      --good: #059669; --good-bg: rgba(5,150,105,.10);
      --bad: #e11d48; --bad-bg: rgba(225,29,72,.10);
      --warn: #d97706; --warn-bg: rgba(217,119,6,.10);
      --pipe-bg: #f1f5f9; --node-bg: #ffffff; --node-border: #e2e8f0;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font); background: var(--bg); color: var(--text);
      height: 100vh; overflow: hidden;
    }
    .app { display: flex; flex-direction: column; height: 100vh; }
    header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 20px; background: var(--bg-card);
      border-bottom: 1px solid var(--border); flex-shrink: 0; gap: 12px;
    }
    header h1 { font-size: 15px; font-weight: 600; white-space: nowrap; }
    header h1 span { color: var(--text-muted); font-weight: 400; }
    .header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border: 1px solid var(--border);
      border-radius: var(--radius-xs); background: var(--bg-card);
      color: var(--text-sec); font-size: 12px; cursor: pointer;
      text-decoration: none; transition: background .15s, border-color .15s;
    }
    .btn:hover { background: var(--bg-card-hover); border-color: var(--accent); color: var(--text); }
    .btn-icon { padding: 5px 7px; line-height: 1; }
    .btn-icon svg { width: 16px; height: 16px; display: block; }
    .btn-primary {
      background: var(--accent); color: #fff; border-color: var(--accent);
    }
    .btn-primary:hover { opacity: .9; }
    .pipe-wrap {
      flex: 1; position: relative; overflow: hidden;
      background: var(--pipe-bg);
    }
    .pipe-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .pipe-node {
      position: absolute; z-index: 2;
      padding: 10px 16px; border-radius: var(--radius);
      background: var(--node-bg); border: 1.5px solid var(--node-border);
      min-width: 120px; text-align: center;
      box-shadow: var(--shadow);
      cursor: default;
    }
    .pipe-node:hover { border-color: var(--accent); }
    .pipe-node .icon { font-size: 22px; line-height: 1; margin-bottom: 4px; }
    .pipe-node .title { font-size: 12px; font-weight: 600; }
    .pipe-node .metric { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
    .pipe-node .sub { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
    .pipe-node.active { border-color: var(--good); }
    .pipe-node.error { border-color: var(--bad); }
    .pipe-node.warn { border-color: var(--warn); }

    .model-tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 999px;
      background: var(--bg-card); border: 1px solid var(--border);
      font-size: 11px; cursor: default;
    }
    .model-tag .dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
    .model-tag .dot.good { background: var(--good); }
    .model-tag .dot.warn { background: var(--warn); }
    .model-tag .dot.err { background: var(--bad); }

    .status-bar {
      display: flex; align-items: center; gap: 16px;
      padding: 6px 20px; background: var(--bg-card);
      border-top: 1px solid var(--border); font-size: 11px;
      color: var(--text-sec); flex-shrink: 0; flex-wrap: wrap;
    }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; background: var(--good); }
    .status-pill { display: flex; align-items: center; gap: 5px; }
    .status-pill.error .status-dot { background: var(--bad); }
    .loading { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 14px; }
    .error-msg { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--bad); font-size: 13px; flex-direction: column; gap: 8px; }
    .version { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
    .version a { color: var(--text-muted); }
    .version a:hover { color: var(--accent); }
    .health-banner {
      padding: 6px 20px; font-size: 12px; display: flex;
      align-items: center; gap: 12px; flex-shrink: 0;
      background: var(--good-bg); border-bottom: 1px solid var(--border);
      color: var(--good);
    }
    .health-banner.warn { background: var(--warn-bg); color: var(--warn); }
    .health-banner.err { background: var(--bad-bg); color: var(--bad); }
    .health-banner .stat { color: var(--text-sec); font-size: 11px; }
    .health-banner .stat strong { color: var(--text); font-weight: 600; }
    @media (prefers-reduced-motion: no-preference) {
      body, header, .pipe-node, .model-tag, .status-bar, .btn, .health-banner { transition: background-color .2s, color .2s, border-color .2s; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <h1>Request Flow <span>· pipeline</span></h1>
      <div class="header-actions">
        <a class="btn" href="/dashboard">Дашборд</a>
        <span class="version">
          <a href="https://github.com/ArtemPotapov52/opencode-proxy" target="_blank" rel="noopener">GitHub</a>
          v${version}
        </span>
        <button class="btn btn-icon" id="themeToggle" type="button" title="Сменить тему" aria-label="Сменить тему">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
        </button>
      </div>
    </header>
    <div class="health-banner" id="healthBanner">Загрузка данных...</div>
    <div class="pipe-wrap" id="pipeWrap">
      <svg class="pipe-svg" id="pipeSvg"></svg>
      <div id="pipeNodes"></div>
    </div>
    <div class="status-bar">
      <span class="status-pill" id="status"><span class="status-dot"></span> Загрузка...</span>
      <span id="statsLine"></span>
    </div>
  </div>

  <script>
    const VERSION = '${version}';
    const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
    const fmtInt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

    function $(id) { return document.getElementById(id); }

    function escapeHtml(s) {
      if (s == null) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function drawEdges(edges) {
      window._lastEdges = edges;
      const svg = $('pipeSvg');
      const wrap = $('pipeWrap');
      const r = wrap.getBoundingClientRect();
      let html = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1"/></marker></defs>';
      for (const e of edges) {
        const from = document.getElementById(e.from);
        const to = document.getElementById(e.to);
        if (!from || !to) continue;
        const fr = from.getBoundingClientRect();
        const tr = to.getBoundingClientRect();
        const x1 = fr.left - r.left + fr.width / 2;
        const y1 = fr.top - r.top + fr.height;
        const x2 = tr.left - r.left + tr.width / 2;
        const y2 = tr.top - r.top;
        const dash = e.dashed ? ' stroke-dasharray="5 4"' : '';
        html += '<path d="M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 + '" stroke="' + (e.color || '#2a2d42') + '" stroke-width="' + (e.width || 1.5) + '" fill="none" marker-end="url(#arrow)"' + dash + '/>';
      }
      svg.innerHTML = html;
    }

    function timeoutSignal(ms) {
      if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
        return AbortSignal.timeout(ms);
      }
      if (typeof AbortController === 'undefined') return undefined;
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      return controller.signal;
    }

    function modelDotClass(state) {
      if (state === 'available') return 'good';
      if (state === 'limited' || state === 'retry' || state === 'untested') return 'warn';
      return 'err';
    }

    function renderFlow(snapshot) {
      const s = snapshot?.summary?.window || {};
      const all = snapshot?.summary?.all || {};
      const usage = snapshot?.usage || {};
      const today = (usage.by_day || []).find(r => r.day === usage.today) || {};
      const primary = snapshot?.model_status?.primary || [];
      const routing = snapshot?.routing || 'round-robin';

      const nodes = [
        { id: 'node-client', icon: '🖥', title: 'Client', metric: fmtInt.format(s.requests || 0) + ' запр/5мин', sub: 'SDK / Desktop', status: 'active', x: 320, y: 30 },
        { id: 'node-proxy', icon: '🔒', title: 'Proxy', metric: fmtInt.format(s.ok || 0) + ' OK · ' + fmtInt.format(s.fail || 0) + ' ошибок', sub: 'Авторизация · body', status: 'active', x: 320, y: 130 },
        { id: 'node-router', icon: '🔀', title: 'Router', metric: primary.length + ' моделей', sub: routing, status: 'active', x: 320, y: 230 },
        { id: 'node-upstream', icon: '☁️', title: 'Upstream', metric: fmtInt.format(s.latency_ms_avg || 0) + 'ms avg', sub: 'opencode.ai/zen/v1', status: s.fail > s.ok ? 'error' : 'active', x: 320, y: 330 },
        { id: 'node-metrics', icon: '📊', title: 'Metrics', metric: fmtInt.format(all.requests || 0) + ' всего', sub: 'uptime ' + (snapshot?.uptime_seconds ? Math.floor(snapshot.uptime_seconds / 3600) + 'ч' : '—'), status: 'active', x: 320, y: 430 },
        { id: 'node-response', icon: '✅', title: 'Response', metric: fmtInt.format(s.ok || 0) + ' OK', sub: today.requests ? fmtInt.format(today.requests) + ' сег.' : 'нет запр.', status: s.ok > 0 ? 'active' : 'warn', x: 320, y: 530 },
      ];

      const nodeContainer = $('pipeNodes');
      nodeContainer.innerHTML = nodes.map(n =>
        '<div class="pipe-node ' + n.status + '" id="' + n.id + '" style="left:' + n.x + 'px;top:' + n.y + 'px">' +
          '<div class="icon">' + n.icon + '</div>' +
          '<div class="title">' + escapeHtml(n.title) + '</div>' +
          '<div class="metric">' + escapeHtml(n.metric) + '</div>' +
          '<div class="sub">' + escapeHtml(n.sub) + '</div>' +
        '</div>'
      ).join('');

      const edges = [
        { from: 'node-client', to: 'node-proxy', color: '#6366f1', width: 2 },
        { from: 'node-proxy', to: 'node-router', color: '#6366f1', width: 2 },
        { from: 'node-router', to: 'node-upstream', color: '#6366f1', width: 2 },
        { from: 'node-upstream', to: 'node-metrics', color: '#10b981', width: 2 },
        { from: 'node-metrics', to: 'node-response', color: '#6366f1', width: 2 },
      ];

      for (let i = 0; i < primary.length; i++) {
        const m = primary[i];
        const state = m.state || 'untested';
        const tagId = 'model-' + i;
        const x = 40 + i * 160;
        const y = 660;
        nodeContainer.innerHTML +=
          '<div class="pipe-node model-tag" id="' + tagId + '" style="left:' + x + 'px;top:' + y + 'px;min-width:auto;padding:4px 10px;border-radius:999px">' +
            '<span class="dot ' + modelDotClass(state) + '"></span>' +
            '<span>' + escapeHtml(m.model.length > 16 ? m.model.slice(0, 14) + '…' : m.model) + '</span>' +
            '<span style="color:var(--text-muted)">' + (m.limited ? 'лимит' : m.rate_limit_remaining != null ? m.rate_limit_remaining + '/' + m.rate_limit_limit : state) + '</span>' +
          '</div>';
        edges.push({ from: 'node-router', to: tagId, color: '#2a2d42', width: 1, dashed: true });
      }

      window._lastEdges = edges;
      requestAnimationFrame(() => drawEdges(edges));

      const healthBanner = $('healthBanner');
      const failPct = s.requests > 0 ? Math.round(s.fail / s.requests * 100) : 0;
      if (s.fail > s.ok) {
        healthBanner.className = 'health-banner err';
        healthBanner.innerHTML = '<span>⚠️ Высокая ошибка: ' + fmtInt.format(s.fail) + ' из ' + fmtInt.format(s.requests) + ' (' + failPct + '%)</span><span class="stat">Модели: ' + primary.filter(m => m.state === 'error' || m.limited).length + ' проблемных</span>';
      } else if (failPct > 20) {
        healthBanner.className = 'health-banner warn';
        healthBanner.innerHTML = '<span>⚠️ Ошибок: ' + failPct + '% (' + fmtInt.format(s.fail) + '/' + fmtInt.format(s.requests) + ')</span><span class="stat"><strong>' + fmtInt.format(s.latency_ms_avg || 0) + '</strong>ms avg · <strong>' + primary.length + '</strong> моделей</span>';
      } else {
        healthBanner.className = 'health-banner';
        healthBanner.innerHTML = '<span>✅ Система работает</span><span class="stat"><strong>' + fmtInt.format(s.requests || 0) + '</strong> запр/5мин · <strong>' + fmtInt.format(s.latency_ms_avg || 0) + '</strong>ms · <strong>' + primary.length + '</strong> моделей</span>';
      }
    }

    async function refresh() {
      try {
        const res = await fetch('/metrics?window=300000&days=1', { cache: 'no-store', signal: timeoutSignal(8000) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        renderFlow(data);

        const pill = $('status');
        pill.classList.remove('error');
        const ts = data.generated_at ? new Date(data.generated_at).toLocaleTimeString('ru-RU') : '—';
        pill.innerHTML = '<span class="status-dot"></span> ' + ts;

        const s = data.summary?.window || {};
        $('statsLine').textContent = fmtInt.format(s.requests || 0) + ' запр · ' + fmtInt.format(s.ok || 0) + ' OK · ' + fmtInt.format(s.fail || 0) + ' ошибок · ' + fmtInt.format(s.latency_ms_avg || 0) + 'ms';
      } catch (err) {
        const pill = $('status');
        pill.classList.add('error');
        pill.innerHTML = '<span class="status-dot"></span> Ошибка: ' + escapeHtml(err.message);
        const banner = $('healthBanner');
        banner.className = 'health-banner err';
        banner.innerHTML = '<span>⚠️ ' + escapeHtml(err.message) + '</span>';
      }
    }

    $('themeToggle').addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('oc-dash-theme', next);
    });

    const savedTheme = localStorage.getItem('oc-dash-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    window.addEventListener('resize', () => {
      if (window._lastEdges) requestAnimationFrame(() => drawEdges(window._lastEdges));
    });

    refresh();
    setInterval(refresh, 3000);
  </script>
</body>
</html>`;
}
