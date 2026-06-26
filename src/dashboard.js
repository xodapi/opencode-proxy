const CHART_COLORS = [
  '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

function getChartColor(index) {
  if (index < CHART_COLORS.length) return CHART_COLORS[index];
  const hue = (index * 137.508) % 360;
  return 'hsl(' + hue + ', 70%, 60%)';
}

function renderDashboard(version) {
  return `<!doctype html>
<html lang="ru" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OpenCode Proxy Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js" integrity="sha384-vsrfeLOOY6KuIYKDlmVH5UiBmgIdB1oEf7p01YgWHuqmOHfZr374+odEv96n9tNC" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <style>
    :root {
      --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --radius: 12px;
      --radius-sm: 8px;
      --radius-xs: 6px;
      --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --shadow-lg: 0 10px 25px rgba(0,0,0,.08), 0 4px 10px rgba(0,0,0,.04);
      --transition: 200ms cubic-bezier(.4,0,.2,1);
    }

    [data-theme="dark"] {
      --bg-primary: #0f1117;
      --bg-secondary: #161822;
      --bg-card: #1c1f2e;
      --bg-card-hover: #232640;
      --bg-input: #252840;
      --bg-badge: #252840;
      --border: #2a2d42;
      --border-hover: #3d4166;
      --text-primary: #e8eaed;
      --text-secondary: #9ca3af;
      --text-muted: #6b7280;
      --accent: #6366f1;
      --accent-soft: rgba(99,102,241,.12);
      --good: #10b981;
      --good-bg: rgba(16,185,129,.12);
      --bad: #f43f5e;
      --bad-bg: rgba(244,63,94,.12);
      --warn: #f59e0b;
      --warn-bg: rgba(245,158,11,.12);
      --info: #3b82f6;
      --info-bg: rgba(59,130,246,.12);
      --chart-grid: rgba(255,255,255,.04);
      --chart-text: #9ca3af;
      --glow: 0 0 20px rgba(99,102,241,.15);
      --sidebar-bg: rgba(22, 24, 34, 0.7);
    }

    [data-theme="light"] {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --bg-input: #f1f5f9;
      --bg-badge: #f1f5f9;
      --border: #e2e8f0;
      --border-hover: #cbd5e1;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-soft: rgba(99,102,241,.08);
      --good: #059669;
      --good-bg: rgba(5,150,105,.08);
      --bad: #e11d48;
      --bad-bg: rgba(225,29,72,.08);
      --warn: #d97706;
      --warn-bg: rgba(217,119,6,.08);
      --info: #2563eb;
      --info-bg: rgba(37,99,235,.08);
      --chart-grid: rgba(0,0,0,.05);
      --chart-text: #64748b;
      --glow: none;
      --sidebar-bg: rgba(255, 255, 255, 0.75);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font);
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }

    /* App Layout */
    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background: var(--sidebar-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      transition: var(--transition);
    }

    .sidebar-brand {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--border);
    }

    .sidebar-logo {
      width: 32px;
      height: 32px;
      color: var(--accent);
      filter: drop-shadow(0 0 8px rgba(99,102,241,.3));
    }

    .sidebar-brand-text h2 {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: var(--text-primary);
    }

    .sidebar-brand-text span {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sidebar-nav {
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-grow: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition);
      font-family: var(--font);
    }

    .nav-item:hover {
      color: var(--text-primary);
      background: var(--bg-card-hover);
    }

    .nav-item.active {
      color: #fff;
      background: var(--accent);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .nav-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .sidebar-footer {
      padding: 20px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
    }

    .sidebar-footer a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color var(--transition);
    }

    .sidebar-footer a:hover {
      color: var(--text-primary);
    }

    /* Main Content Area */
    .main-content {
      margin-left: 260px;
      padding: 24px 32px;
      flex-grow: 1;
      width: calc(100% - 260px);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transition: var(--transition);
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .brand h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }

    .brand p {
      color: var(--text-muted);
      font-size: 13px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: var(--good-bg);
      color: var(--good);
      border: 1px solid transparent;
    }

    .status-pill.error { background: var(--bad-bg); color: var(--bad); }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .4; }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition);
      font-family: var(--font);
    }

    .btn:hover { border-color: var(--border-hover); background: var(--bg-card-hover); }
    .btn svg { width: 14px; height: 14px; }
    .btn-icon-only { padding: 8px; }

    .btn-primary {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .btn-primary:hover { opacity: .9; border-color: var(--accent); }

    .btn-sm {
      padding: 6px 10px;
      font-size: 12px;
    }

    /* Health Banner */
    .banner-summary {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .banner-details {
      margin-top: 8px;
      padding: 8px 12px;
      background: rgba(0,0,0,0.15);
      border-radius: var(--radius-sm);
      width: 100%;
      font-size: 11px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .banner-error-row {
      display: flex;
      justify-content: space-between;
      color: var(--text-secondary);
    }

    .banner-error-row strong {
      color: var(--text-primary);
    }

    /* Tab Content */
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .stat-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      transition: all var(--transition);
    }

    .stat-card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--glow);
    }

    .stat-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }

    .stat-icon,
    .chart-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      background: var(--accent-soft);
      color: var(--accent);
      flex: 0 0 auto;
    }

    .stat-icon svg,
    .chart-icon svg {
      width: 15px;
      height: 15px;
    }

    .stat-icon.tokens { background: rgba(139,92,246,.12); color: #8b5cf6; }
    .stat-icon.latency { background: var(--warn-bg); color: var(--warn); }
    .stat-icon.errors { background: var(--bad-bg); color: var(--bad); }
    .stat-icon.cost { background: var(--good-bg); color: var(--good); }

    .stat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .stat-value {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1;
    }

    .stat-sub {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 6px;
    }

    /* Charts & Donuts */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: all var(--transition);
    }

    .chart-card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--glow);
    }

    .chart-card.wide { grid-column: span 2; }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .chart-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .chart-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chart-subtitle {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .chart-tabs {
      display: flex;
      gap: 2px;
      background: var(--bg-input);
      border-radius: var(--radius-xs);
      padding: 2px;
    }

    .chart-tab {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: var(--radius-xs);
      transition: all var(--transition);
      font-family: var(--font);
    }

    .chart-tab.active { background: var(--accent); color: #fff; }
    .chart-tab:hover:not(.active) { color: var(--text-primary); }

    .chart-wrap { position: relative; width: 100%; }
    .chart-wrap canvas { width: 100% !important; }

    .donuts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .donut-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      text-align: center;
    }

    .donut-wrap {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 0 auto 12px;
    }

    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }

    .donut-center-value {
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
    }

    .donut-center-label {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .donut-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px 12px;
      margin-top: 12px;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--text-secondary);
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Model Grid */
    .model-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }

    .model-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      transition: all var(--transition);
    }

    .model-card:hover {
      border-color: var(--border-hover);
      box-shadow: var(--glow);
    }

    .model-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
    }

    .model-name {
      font-size: 13px;
      font-weight: 600;
      word-break: break-all;
      line-height: 1.3;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .badge.available { background: var(--good-bg); color: var(--good); }
    .badge.limited { background: var(--bad-bg); color: var(--bad); }
    .badge.retry { background: var(--warn-bg); color: var(--warn); }
    .badge.error { background: var(--bad-bg); color: var(--bad); }
    .badge.untested { background: var(--bg-badge); color: var(--text-muted); }

    .model-status-text {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .model-sub { font-size: 12px; color: var(--text-muted); min-height: 30px; }

    .quota-bar { margin-top: 12px; }
    .quota-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .quota-row strong { color: var(--text-primary); font-weight: 600; }

    .progress-track {
      height: 4px;
      background: var(--bg-input);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 600ms cubic-bezier(.4,0,.2,1);
    }

    .progress-fill.good { background: var(--good); }
    .progress-fill.bad { background: var(--bad); }
    .progress-fill.unknown {
      background: repeating-linear-gradient(90deg, var(--border) 0 6px, transparent 6px 12px);
    }

    .model-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 12px;
    }

    .model-stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }
    .model-stat-value { font-size: 13px; font-weight: 600; }

    /* Sections & Tables */
    .section { display: flex; flex-direction: column; gap: 12px; }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
    }

    .table-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    table { width: 100%; border-collapse: collapse; }

    th, td {
      padding: 10px 14px;
      text-align: left;
      font-size: 12px;
      border-bottom: 1px solid var(--border);
    }

    th {
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-size: 10px;
      background: var(--bg-secondary);
      position: sticky;
      top: 0;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg-card-hover); }

    .ok { color: var(--good); }
    .fail { color: var(--bad); }
    .warn { color: var(--warn); }
    .muted { color: var(--text-muted); }
    .right { text-align: right; }
    .mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 11px; }

    .privacy-note {
      padding: 12px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 12px;
      color: var(--text-muted);
    }

    .empty-state {
      padding: 32px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Settings View */
    .settings-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
    }

    .models-checkbox-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      max-height: 500px;
      overflow-y: auto;
      padding-right: 8px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition);
      user-select: none;
    }

    .checkbox-item:hover {
      border-color: var(--border-hover);
      background: var(--bg-card-hover);
    }

    .checkbox-item input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--accent);
      cursor: pointer;
    }

    .checkbox-item-label {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .checkbox-model-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .checkbox-model-desc {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Adaptive Design & Media Queries */
    @media (max-width: 1200px) {
      .model-grid { grid-template-columns: repeat(2, 1fr); }
      .stat-row { grid-template-columns: repeat(3, 1fr); }
      .donuts-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 992px) {
      .sidebar {
        width: 70px;
      }
      .sidebar-brand-text, .sidebar-footer span, .nav-item span {
        display: none;
      }
      .sidebar-brand {
        padding: 16px;
        justify-content: center;
      }
      .sidebar-nav {
        padding: 16px 8px;
      }
      .nav-item {
        padding: 12px;
        justify-content: center;
      }
      .sidebar-footer {
        padding: 16px;
        justify-content: center;
      }
      .sidebar-footer a {
        display: none;
      }
      .main-content {
        margin-left: 70px;
        width: calc(100% - 70px);
        padding: 20px;
      }
    }

    @media (max-width: 768px) {
      .stat-row { grid-template-columns: 1fr 1fr; }
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card.wide { grid-column: span 1; }
      .donuts-grid { grid-template-columns: 1fr; }
      .model-grid { grid-template-columns: 1fr; }
      .table-card { overflow-x: auto; }
      th, td { white-space: nowrap; }
    }

    @media (max-width: 576px) {
      .sidebar {
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 60px;
        flex-direction: row;
        border-right: none;
        border-top: 1px solid var(--border);
        padding: 0;
        background: rgba(22, 24, 34, 0.85);
        border-radius: 0;
      }
      .sidebar-brand {
        display: none;
      }
      .sidebar-nav {
        flex-direction: row;
        justify-content: space-around;
        padding: 0;
        width: 100%;
        gap: 0;
        align-items: center;
      }
      .nav-item {
        flex: 1;
        height: 100%;
        border-radius: 0;
        justify-content: center;
        padding: 0;
      }
      .sidebar-footer {
        display: none;
      }
      .main-content {
        margin-left: 0;
        margin-bottom: 60px;
        width: 100%;
        padding: 16px;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      body, .stat-card, .chart-card, .donut-card, .table-card, .btn, .status-pill, .empty-state, .privacy-note, .checkbox-item {
        transition: background-color .2s, color .2s, border-color .2s;
      }
    }

    :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      border-radius: var(--radius-xs);
    }

    .btn:focus-visible, .chart-tab:focus-visible {
      outline-offset: 1px;
    }
  </style>
</head>
<body>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <svg class="sidebar-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <div class="sidebar-brand-text">
          <h2>OpenCode</h2>
          <span>Proxy Control</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item active" id="tabBtnDashboard" data-tab="dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
          <span>Дашборд</span>
        </button>
        <button class="nav-item" id="tabBtnSettings" data-tab="settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Настройки</span>
        </button>
        <a class="nav-item" href="/flow" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span>Потоки (Flow)</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <span class="app-version">v${version}</span>
        <a href="https://github.com/ArtemPotapov52/opencode-proxy" target="_blank" rel="noopener">GitHub</a>
      </div>
    </aside>

    <main class="main-content">
      <header class="app-header">
        <div class="brand">
          <h1 id="pageTitle">OpenCode Proxy</h1>
          <p id="pageSubtitle">Мониторинг моделей, токенов и производительности</p>
        </div>
        <div class="header-actions">
          <div class="status-pill" id="status" role="status" aria-live="polite"><span class="status-dot"></span> Загрузка...</div>
          <a class="btn" href="/export/usage.csv?days=7" download title="Скачать статистику CSV">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
            CSV
          </a>
          <a class="btn" href="/export/usage.json?days=7" download title="Скачать статистику JSON">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 13h4"/><path d="M10 17h4"/></svg>
            JSON
          </a>
          <button class="btn btn-icon-only" id="themeToggle" type="button" title="Сменить тему" aria-label="Сменить тему">
            <svg id="themeIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
          </button>
          <button class="btn btn-primary" id="refresh" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Обновить
          </button>
        </div>
      </header>

      <div id="healthBanner" style="display:none;padding:12px 20px;font-size:13px;align-items:center;gap:12px;border-radius:var(--radius);margin-bottom:20px;flex-direction:column;align-items:flex-start"></div>

      <!-- Вкладка Дашборда -->
      <div class="tab-content" id="tabDashboard">
        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-label">Запросы (5 мин)</div>
              <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3-3 3 2 5-6"/></svg></div>
            </div>
            <div class="stat-value" id="requests">0</div>
            <div class="stat-sub" id="rpm">0 rpm</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-label">Токены сегодня</div>
              <div class="stat-icon tokens"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            </div>
            <div class="stat-value" id="tpm">0</div>
            <div class="stat-sub" id="tokens">0 токенов</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-label">Задержка</div>
              <div class="stat-icon latency"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg></div>
            </div>
            <div class="stat-value" id="latency">0мс</div>
            <div class="stat-sub" id="maxLatency">max 0мс</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-label">Ошибки (5 мин)</div>
              <div class="stat-icon errors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
            </div>
            <div class="stat-value" id="errors">0</div>
            <div class="stat-sub" id="success">0 ok</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-label">Стоимость</div>
              <div class="stat-icon cost"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            </div>
            <div class="stat-value" id="cost">0</div>
            <div class="stat-sub" id="costToday">$ за сегодня</div>
          </div>
        </div>

        <!-- Модели -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">Наблюдаемые модели</div>
          </div>
          <div class="model-grid" id="modelCards"></div>
        </div>

        <!-- Лимиты API -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">Лимиты API</div>
          </div>
          <div class="table-card">
            <table>
              <caption style="display:none">Лимиты API по моделям</caption>
              <thead><tr><th scope="col">Модель</th><th scope="col">Статус</th><th scope="col">Остаток</th><th scope="col">Сброс</th><th scope="col" class="right">Ждать</th><th scope="col">Ошибка</th></tr></thead>
              <tbody id="limits"><tr><td colspan="6" class="empty-state">Активных лимитов пока нет</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- Последние запросы -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">Последние запросы</div>
          </div>
          <div class="table-card">
            <table aria-label="Последние запросы">
              <caption style="display:none">Последние запросы</caption>
              <thead><tr><th scope="col">Время</th><th scope="col">Модель</th><th scope="col">Статус</th><th scope="col" class="right">Задержка</th><th scope="col" class="right">Токены</th><th scope="col" class="right">Prompt</th><th scope="col" class="right">Completion</th><th scope="col">Финиш</th></tr></thead>
              <tbody id="recent"><tr><td colspan="8" class="empty-state">Запросов пока нет</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- Графики активности и задержки -->
        <div class="charts-grid">
          <div class="chart-card wide">
            <div class="chart-header">
              <div>
                <div class="chart-title-row">
                  <div class="chart-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-7"/></svg></div>
                  <div>
                    <div class="chart-title">Активность</div>
                    <div class="chart-subtitle">Нагрузка по минутам: запросы, OK/ошибки или токены</div>
                  </div>
                </div>
              </div>
              <div class="chart-tabs" id="activityTabs" role="tablist">
                <button class="chart-tab active" data-metric="requests" role="tab" aria-selected="true">Запросы</button>
                <button class="chart-tab" data-metric="tokens" role="tab" aria-selected="false">Токены</button>
              </div>
            </div>
            <div class="chart-wrap"><canvas id="activityChart" aria-label="График активности: запросы и токены по минутам"></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <div class="chart-title-row">
                  <div class="chart-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg></div>
                  <div>
                    <div class="chart-title">Задержка</div>
                    <div class="chart-subtitle">Средняя линия и пиковые ответы upstream</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-wrap"><canvas id="latencyChart" aria-label="График задержки: средняя и максимальная в мс"></canvas></div>
          </div>
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <div class="chart-title-row">
                  <div class="chart-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19h16"/><path d="M7 16V8"/><path d="M12 16V4"/><path d="M17 16v-6"/></svg></div>
                  <div>
                    <div class="chart-title">Стоимость</div>
                    <div class="chart-subtitle">Cost из upstream: по минутам и накопительно</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-wrap"><canvas id="costChart" aria-label="График стоимости по минутам"></canvas></div>
          </div>
        </div>

        <!-- Круговые диаграммы -->
        <div class="donuts-grid">
          <div class="donut-card">
            <div class="chart-title" style="margin-bottom:12px;justify-content:center"><span class="chart-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>Распределение по моделям</div>
            <div class="donut-wrap"><canvas id="modelDonut" aria-label="Круговая диаграмма: распределение запросов по моделям"></canvas>
              <div class="donut-center"><div class="donut-center-value" id="modelDonutTotal">0</div><div class="donut-center-label">запр.</div></div>
            </div>
            <div class="donut-legend" id="modelLegend"></div>
          </div>
          <div class="donut-card">
            <div class="chart-title" style="margin-bottom:12px">Prompt vs Completion</div>
            <div class="donut-wrap"><canvas id="tokenDonut" aria-label="Круговая диаграмма: prompt против completion токенов"></canvas>
              <div class="donut-center"><div class="donut-center-value" id="tokenDonutTotal">0</div><div class="donut-center-label">токенов</div></div>
            </div>
            <div class="donut-legend" id="tokenLegend"></div>
          </div>
          <div class="donut-card">
            <div class="chart-title" style="margin-bottom:12px;justify-content:center"><span class="chart-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></span>Успешность</div>
            <div class="donut-wrap"><canvas id="successDonut" aria-label="Круговая диаграмма: успешные запросы, ошибки и лимиты"></canvas>
              <div class="donut-center"><div class="donut-center-value" id="successDonutTotal">0%</div><div class="donut-center-label">ok rate</div></div>
            </div>
            <div class="donut-legend" id="successLegend"></div>
          </div>
        </div>

        <!-- Расход сегодня -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">Расход сегодня</div>
          </div>
          <div class="table-card">
            <table aria-label="Расход по моделям сегодня">
              <caption style="display:none">Расход по моделям сегодня</caption>
              <thead><tr><th scope="col">Модель</th><th scope="col" class="right">Запр.</th><th scope="col" class="right ok">OK</th><th scope="col" class="right fail">Ошибки</th><th scope="col" class="right">Токены</th><th scope="col" class="right">Prompt</th><th scope="col" class="right">Completion</th><th scope="col" class="right">429</th><th scope="col" class="right">мс</th><th scope="col" class="right">Cost</th></tr></thead>
              <tbody id="todayModels"><tr><td colspan="10" class="empty-state">Запросов сегодня ещё нет</td></tr></tbody>
            </table>
          </div>
        </div>

        <!-- По дням -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">По дням</div>
          </div>
          <div class="table-card">
            <table aria-label="Расход по дням">
              <caption style="display:none">Расход по дням</caption>
              <thead><tr><th scope="col">День</th><th scope="col" class="right">Запр.</th><th scope="col" class="right ok">OK</th><th scope="col" class="right fail">Ошибки</th><th scope="col" class="right">Токены</th><th scope="col" class="right">429</th><th scope="col" class="right">Cost</th></tr></thead>
              <tbody id="dailyUsage"><tr><td colspan="7" class="empty-state">Истории пока нет</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Вкладка Настроек -->
      <div class="tab-content" id="tabSettings" style="display:none">
        <div class="section">
          <div class="settings-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px">
              <div style="font-weight:600; font-size:15px">Наблюдаемые модели на дашборде</div>
              <div style="display:flex; gap:8px">
                <button class="btn btn-sm" id="selectAllModels" type="button">Выбрать все</button>
                <button class="btn btn-sm" id="selectNoneModels" type="button">Сбросить</button>
              </div>
            </div>
            <div class="models-checkbox-list" id="modelsCheckboxList">
              <div class="empty-state">Загрузка моделей...</div>
            </div>
          </div>
        </div>
      </div>

      <div class="privacy-note" id="privacy"></div>
    </main>
  </div>

  <script>
    const VERSION = '${version}';
    const CHART_COLORS = ${JSON.stringify(CHART_COLORS)};
    function getChartColor(index) {
      if (index < CHART_COLORS.length) return CHART_COLORS[index];
      const hue = (index * 137.508) % 360;
      return 'hsl(' + hue + ', 70%, 60%)';
    }
    const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
    const fmtInt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
    const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 });
    const $ = (id) => document.getElementById(id);

    // Tab switcher
    const tabDashboard = $('tabDashboard');
    const tabSettings = $('tabSettings');
    const tabBtnDashboard = $('tabBtnDashboard');
    const tabBtnSettings = $('tabBtnSettings');
    const pageTitle = $('pageTitle');
    const pageSubtitle = $('pageSubtitle');

    function switchTab(tabId) {
      if (tabId === 'dashboard') {
        tabDashboard.style.display = 'flex';
        tabSettings.style.display = 'none';
        tabBtnDashboard.classList.add('active');
        tabBtnSettings.classList.remove('active');
        pageTitle.textContent = 'OpenCode Proxy';
        pageSubtitle.textContent = 'Мониторинг моделей, токенов и производительности';
      } else if (tabId === 'settings') {
        tabDashboard.style.display = 'none';
        tabSettings.style.display = 'flex';
        tabBtnDashboard.classList.remove('active');
        tabBtnSettings.classList.add('active');
        pageTitle.textContent = 'Настройки';
        pageSubtitle.textContent = 'Выбор моделей для отображения на дашборде';
        renderSettingsCheckboxList();
      }
    }

    tabBtnDashboard.addEventListener('click', () => switchTab('dashboard'));
    tabBtnSettings.addEventListener('click', () => switchTab('settings'));

    // Observed Models Logic
    let allAvailableModels = [];
    let observedModels = null;

    function loadObservedModels() {
      try {
        const saved = localStorage.getItem('oc-observed-models');
        if (saved) {
          observedModels = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Failed to load observed models:', e);
      }
    }

    function saveObservedModels() {
      try {
        localStorage.setItem('oc-observed-models', JSON.stringify(observedModels));
      } catch (e) {
        console.error('Failed to save observed models:', e);
      }
    }

    function renderSettingsCheckboxList() {
      const list = $('modelsCheckboxList');
      if (!list) return;
      if (!allAvailableModels || allAvailableModels.length === 0) {
        list.innerHTML = '<div class="empty-state">Список моделей пуст. Подключитесь к прокси.</div>';
        return;
      }

      list.innerHTML = allAvailableModels.map((m) => {
        const isChecked = observedModels && observedModels.includes(m.model);
        const typeLabel = m.is_primary ? 'Первичная' : 'Вторичная';
        const badgeClass = m.state || 'untested';
        return '<label class="checkbox-item">' +
          '<input type="checkbox" data-model="' + escapeHtml(m.model) + '" ' + (isChecked ? 'checked' : '') + ' />' +
          '<div class="checkbox-item-label">' +
            '<span class="checkbox-model-name">' + escapeHtml(m.model) + '</span>' +
            '<span class="checkbox-model-desc">' + typeLabel + ' · ' + stateLabel(m.state) + '</span>' +
          '</div>' +
        '</label>';
      }).join('');

      list.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
          const modelName = e.target.dataset.model;
          if (e.target.checked) {
            if (!observedModels.includes(modelName)) observedModels.push(modelName);
          } else {
            observedModels = observedModels.filter(name => name !== modelName);
          }
          saveObservedModels();
          refresh(); // Update dashboard on background
        });
      });
    }

    $('selectAllModels').addEventListener('click', () => {
      observedModels = allAvailableModels.map(m => m.model);
      saveObservedModels();
      renderSettingsCheckboxList();
      refresh();
    });

    $('selectNoneModels').addEventListener('click', () => {
      observedModels = [];
      saveObservedModels();
      renderSettingsCheckboxList();
      refresh();
    });

    let previousModelStates = {};
    function requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    document.addEventListener('click', requestNotificationPermission, { once: true });

    function showNotification(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body });
        } catch (e) {
          console.warn('Failed to show notification:', e);
        }
      }
    }

    let activityMode = 'requests';
    let chartInstances = {};
    const hasCharts = () => typeof Chart !== 'undefined' && Object.keys(chartInstances).length > 0;

    const chartDefaults = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,.85)',
          titleFont: { size: 11 },
          bodyFont: { size: 11 },
          padding: 8,
          cornerRadius: 6,
          displayColors: true,
          boxPadding: 4,
        },
      },
      scales: {
        x: {
          grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim() || 'rgba(255,255,255,.04)' },
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--chart-text').trim() || '#9ca3af', font: { size: 10 }, maxRotation: 0 },
          border: { display: false },
        },
        y: {
          grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim() || 'rgba(255,255,255,.04)' },
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--chart-text').trim() || '#9ca3af', font: { size: 10 } },
          border: { display: false },
        },
      },
    };

    function updateChartColors() {
      const style = getComputedStyle(document.documentElement);
      const grid = style.getPropertyValue('--chart-grid').trim() || 'rgba(255,255,255,.04)';
      const text = style.getPropertyValue('--chart-text').trim() || '#9ca3af';
      Object.values(chartInstances).forEach((c) => {
        if (!c?.options) return;
        if (c.options.scales?.x) { c.options.scales.x.grid.color = grid; c.options.scales.x.ticks.color = text; }
        if (c.options.scales?.y) { c.options.scales.y.grid.color = grid; c.options.scales.y.ticks.color = text; }
        c.update('none');
      });
    }

    const chartDataHashes = {};

    function hasChartDataChanged(chartId, data) {
      try {
        const hash = JSON.stringify(data);
        if (chartDataHashes[chartId] === hash) return false;
        chartDataHashes[chartId] = hash;
        return true;
      } catch { return true; }
    }

    function chartOpts(overrides = {}) {
      const style = getComputedStyle(document.documentElement);
      const grid = style.getPropertyValue('--chart-grid').trim() || 'rgba(255,255,255,.04)';
      const text = style.getPropertyValue('--chart-text').trim() || '#9ca3af';
      return JSON.parse(JSON.stringify({
        ...chartDefaults,
        ...overrides,
        scales: {
          x: { ...chartDefaults.scales.x, grid: { color: grid }, ticks: { color: text, font: { size: 10 }, maxRotation: 0 }, border: { display: false }, ...(overrides.scales?.x || {}) },
          y: { ...chartDefaults.scales.y, grid: { color: grid }, ticks: { color: text, font: { size: 10 } }, border: { display: false }, ...(overrides.scales?.y || {}) },
        },
      }));
    }

    function formatTime(ts) {
      return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }

    function formatShortNum(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return fmtInt.format(n);
    }

    function setText(id, text) { $(id).textContent = text; }

    const CACHE_KEYS = new Map();

    function setInnerCached(id, html, cacheKey) {
      if (cacheKey != null) {
        const prev = CACHE_KEYS.get(id);
        if (prev === cacheKey) return;
        CACHE_KEYS.set(id, cacheKey);
      }
      $(id).innerHTML = html;
    }

    function withCacheKey(data) {
      if (!data || typeof data !== 'object') return '';
      try { return JSON.stringify(data); } catch { return ''; }
    }

    function escapeHtml(value) {
      return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }

    function statusDot() {
      const dot = document.createElement('span');
      dot.className = 'status-dot';
      return dot;
    }

    function renderRows(rows, empty, mapper) {
      if (!rows || !rows.length) return empty;
      return rows.map(mapper).join('');
    }

    function initCharts() {
      if (typeof Chart === 'undefined') return;
      const h = 200;

      chartInstances.activity = new Chart($('activityChart'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
          ...chartOpts(),
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            ...chartDefaults.plugins,
            tooltip: {
              ...chartDefaults.plugins.tooltip,
              callbacks: {
                label: (ctx) => {
                  const ds = ctx.dataset;
                  return ds.label + ': ' + fmtInt.format(ctx.parsed.y);
                },
              },
            },
          },
          elements: { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.35, borderWidth: 2 } },
        },
      });
      $('activityChart').parentElement.style.height = h + 'px';

      chartInstances.latency = new Chart($('latencyChart'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
          ...chartOpts(),
          interaction: { intersect: false, mode: 'index' },
          elements: { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.35, borderWidth: 2 } },
        },
      });
      $('latencyChart').parentElement.style.height = h + 'px';

      chartInstances.cost = new Chart($('costChart'), {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
          ...chartOpts(),
          interaction: { intersect: false, mode: 'index' },
          elements: { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.35, borderWidth: 2 } },
          plugins: {
            ...chartDefaults.plugins,
            tooltip: {
              ...chartDefaults.plugins.tooltip,
              callbacks: { label: (ctx) => ctx.dataset.label + ': $' + money.format(ctx.parsed.y) },
            },
          },
        },
      });
      $('costChart').parentElement.style.height = h + 'px';

      const donutOpts = (centerId) => ({
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        animation: { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,.85)',
            titleFont: { size: 11 },
            bodyFont: { size: 11 },
            padding: 8,
            cornerRadius: 6,
          },
        },
      });

      chartInstances.modelDonut = new Chart($('modelDonut'), {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: CHART_COLORS, borderWidth: 0 }] },
        options: donutOpts(),
      });

      chartInstances.tokenDonut = new Chart($('tokenDonut'), {
        type: 'doughnut',
        data: { labels: ['Prompt', 'Completion'], datasets: [{ data: [0, 0], backgroundColor: ['#6366f1', '#10b981'], borderWidth: 0 }] },
        options: donutOpts(),
      });

      chartInstances.successDonut = new Chart($('successDonut'), {
        type: 'doughnut',
        data: { labels: ['OK', 'Ошибки', '429'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'], borderWidth: 0 }] },
        options: donutOpts(),
      });
    }

    function updateActivityChart(tsData) {
      const chart = chartInstances.activity;
      if (!chart) return;

      const labels = tsData.map((b) => formatTime(b.ts));
      const datasets = activityMode === 'requests' ? [
        { label: 'Всего', data: tsData.map((b) => b.requests), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.15)', fill: true },
        { label: 'OK', data: tsData.map((b) => b.ok), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true },
        { label: 'Ошибки', data: tsData.map((b) => b.fail), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,.1)', fill: true },
      ] : [
        { label: 'Всего', data: tsData.map((b) => b.total_tokens), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,.15)', fill: true },
        { label: 'Prompt', data: tsData.map((b) => b.prompt_tokens), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.1)', fill: true },
        { label: 'Completion', data: tsData.map((b) => b.completion_tokens), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true },
      ];

      if (!hasChartDataChanged('activity', { labels, datasets })) return;
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update('none');
    }

    function updateLatencyChart(tsData) {
      const chart = chartInstances.latency;
      if (!chart) return;
      const labels = tsData.map((b) => formatTime(b.ts));
      const datasets = [
        { label: 'Средняя мс', data: tsData.map((b) => b.latency_ms_avg), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.1)', fill: true },
        { label: 'Макс. мс', data: tsData.map((b) => b.latency_ms_max), borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,.05)', fill: false, borderDash: [4, 4] },
      ];
      if (!hasChartDataChanged('latency', { labels, datasets })) return;
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update('none');
    }

    function updateCostChart(tsData) {
      const chart = chartInstances.cost;
      if (!chart) return;
      let cumulative = 0;
      const cumulativeData = tsData.map((b) => { cumulative += b.cost || 0; return Math.round(cumulative * 1000000) / 1000000; });
      const labels = tsData.map((b) => formatTime(b.ts));
      const datasets = [
        { label: 'Накоплено $', data: cumulativeData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.12)', fill: true },
        { label: 'За минуту $', data: tsData.map((b) => b.cost || 0), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.08)', fill: false },
      ];
      if (!hasChartDataChanged('cost', { labels, datasets })) return;
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update('none');
    }

    function updateDonut(chartId, legendId, centerId, labels, data, colors) {
      const total = data.reduce((a, b) => a + b, 0);
      $(centerId).textContent = chartId === 'successDonut' ? (total > 0 ? Math.round((data[0] || 0) / total * 100) + '%' : '0%') : formatShortNum(total);

      $(legendId).innerHTML = labels.map((label, i) => {
        const pct = total > 0 ? Math.round(data[i] / total * 100) : 0;
        return '<span class="legend-item"><span class="legend-dot" style="background:' + colors[i] + '"></span>' + escapeHtml(label) + ' ' + pct + '%</span>';
      }).join('');

      const chart = chartInstances[chartId];
      if (!chart) return;
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.data.datasets[0].backgroundColor = colors;
      chart.update('none');
    }

    function renderModelCard(item) {
      const state = item.state || 'untested';
      const label = stateLabel(state);
      const today = item.today || {};
      const previous = item.previous_day;
      const reset = item.reset_at ? 'Сброс через ' + formatDuration(item.reset_in_seconds) : resetFallback(state, item);
      const quota = formatQuota(item);
      const percent = quotaPercent(item);
      const fillClass = percent == null ? 'unknown' : (state === 'limited' ? 'bad' : 'good');
      const previousText = previous
        ? previous.day + ': ' + fmt.format(previous.requests) + ' / ' + tokenText(previous)
        : 'нет';
      const sub = state === 'available'
        ? 'Ответ ' + formatSeen(item.last_seen_at)
        : state === 'limited' ? reset
          : state === 'retry' ? 'Нужна проверка'
            : state === 'error' ? 'Ошибка ' + (item.last_status || '')
              : 'Нет данных';

      return '<div class="model-card">' +
        '<div class="model-card-header"><div class="model-name">' + escapeHtml(item.model) + '</div><div class="badge ' + escapeHtml(state) + '">' + escapeHtml(label) + '</div></div>' +
        '<div class="model-status-text">' + escapeHtml(headline(state)) + '</div>' +
        '<div class="model-sub">' + escapeHtml(sub) + '</div>' +
        '<div class="quota-bar"><div class="quota-row"><span>Остаток</span><strong>' + escapeHtml(quota) + '</strong></div><div class="progress-track"><div class="progress-fill ' + fillClass + '" style="width:' + (percent == null ? '0' : percent) + '%"></div></div></div>' +
        '<div class="model-stats">' +
          '<div><div class="model-stat-label">Сегодня</div><div class="model-stat-value">' + fmt.format(today.requests || 0) + '</div></div>' +
          '<div><div class="model-stat-label">Токены</div><div class="model-stat-value">' + escapeHtml(tokenText(today)) + '</div></div>' +
          '<div><div class="model-stat-label">24ч</div><div class="model-stat-value">' + fmt.format((item.last_24h && item.last_24h.requests) || 0) + '</div></div>' +
          '<div><div class="model-stat-label">Вчера</div><div class="model-stat-value">' + escapeHtml(previousText) + '</div></div>' +
        '</div>' +
      '</div>';
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
      if (state === 'available') return 'лимита нет';
      if (state === 'untested') return 'нет данных';
      if (item.last_status === 429) return 'сброс неизвестен';
      return 'нет данных';
    }

    function formatQuota(item) {
      if (item.rate_limit_remaining != null && item.rate_limit_limit != null) {
        return fmt.format(item.rate_limit_remaining) + ' / ' + fmt.format(item.rate_limit_limit);
      }
      if (item.rate_limit_remaining != null) return fmt.format(item.rate_limit_remaining);
      return 'не сообщается';
    }

    function tokenText(item) {
      if (!item || !item.requests) return '0';
      if (item.usage_reported || item.usage_estimated) {
        return (item.usage_estimated && !item.usage_reported ? '≈' : '') + formatShortNum(item.total_tokens || 0);
      }
      return 'нет usage';
    }

    // Helper functions for table rendering
    function tokenPartText(item, field) {
      if (!item || !item.requests) return '0';
      if (item.usage_reported || item.usage_estimated) {
        return (item.usage_estimated && !item.usage_reported ? '≈' : '') + fmtInt.format(item[field] || 0);
      }
      return '—';
    }

    function todayUsage(usage) {
      const rows = usage.by_day || [];
      return rows.find((row) => row.day === usage.today) || rows[0] || {};
    }

    function tokenRateText(summary) {
      const usageKnown = summary.requests === 0 || summary.usage_reported > 0 || summary.usage_estimated > 0;
      if (!usageKnown) return 'usage не передан';
      const usageApprox = summary.usage_estimated > 0 && summary.usage_reported === 0;
      return (usageApprox ? '≈' : '') + formatShortNum(summary.tokens_per_minute) + ' ток/мин';
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

    async function refresh() {
      try {
        const res = await fetch('/metrics?window=300000&days=7', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const s = data.summary.window;
        const all = data.summary.all;
        const usage = data.usage || {};
        const today = todayUsage(usage);
        const ts = data.timeseries || [];

        // Save list of all available models
        allAvailableModels = (data.model_status && data.model_status.all) || [];

        // Initialize observed models if null
        if (observedModels === null) {
          loadObservedModels();
          if (observedModels === null) {
            // Select all primary models by default
            observedModels = allAvailableModels.filter(m => m.is_primary).map(m => m.model);
            saveObservedModels();
          }
        }

        const pill = $('status');
        pill.classList.remove('error');
        pill.replaceChildren(
          statusDot(),
          document.createTextNode(' ' + new Date(data.generated_at).toLocaleTimeString('ru-RU') + ' · uptime ' + formatDuration(data.uptime_seconds)),
        );

        // Health Banner with detailed error breakdown
        const healthBanner = $('healthBanner');
        const failPct = s.requests > 0 ? Math.round(s.fail / s.requests * 100) : 0;

        let errorsHtml = '';
        if (data.errors && data.errors.length > 0) {
          const uniqueErrors = [];
          const seenKeys = new Set();
          for (const err of data.errors) {
            const key = err.model + ':' + err.error_type;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              uniqueErrors.push(err);
            }
            if (uniqueErrors.length >= 3) break;
          }

          if (uniqueErrors.length > 0) {
            errorsHtml = '<div class="banner-details">' +
              '<div style="font-weight:600; margin-bottom:2px">Последние сбои:</div>' +
              uniqueErrors.map((err) => {
                const timeStr = formatTime(err.ts);
                return '<div class="banner-error-row">' +
                  '<span><strong>' + escapeHtml(err.model) + '</strong>: ' + escapeHtml(err.error_type) + '</span>' +
                  '<span class="mono">' + timeStr + '</span>' +
                '</div>';
              }).join('') +
            '</div>';
          }
        }

        if (s.fail > s.ok) {
          healthBanner.style.display = 'flex';
          healthBanner.style.background = 'var(--bad-bg)';
          healthBanner.style.color = 'var(--bad)';
          healthBanner.innerHTML = '<div class="banner-summary">' +
            '<span>⚠️ Критическая ошибка: ' + fmtInt.format(s.fail) + ' из ' + fmtInt.format(s.requests) + ' (' + failPct + '%)</span>' +
            '<span style="color:var(--text-secondary);font-size:11px">latency ' + fmtInt.format(s.latency_ms_avg) + 'ms · ' + fmtInt.format(s.latency_ms_max) + 'ms max</span>' +
          '</div>' + errorsHtml;
        } else if (failPct > 20) {
          healthBanner.style.display = 'flex';
          healthBanner.style.background = 'var(--warn-bg)';
          healthBanner.style.color = 'var(--warn)';
          healthBanner.innerHTML = '<div class="banner-summary">' +
            '<span>⚠️ Ошибок: ' + failPct + '%</span>' +
            '<span style="color:var(--text-secondary);font-size:11px">' + fmtInt.format(s.ok) + ' OK · ' + fmtInt.format(s.fail) + ' fail · ' + fmtInt.format(s.latency_ms_avg) + 'ms avg</span>' +
          '</div>' + errorsHtml;
        } else {
          healthBanner.style.display = 'flex';
          healthBanner.style.background = 'var(--good-bg)';
          healthBanner.style.color = 'var(--good)';
          healthBanner.innerHTML = '<div class="banner-summary">' +
            '<span>✅ Система работает стабильно</span>' +
            '<span style="color:var(--text-secondary);font-size:11px">' + fmtInt.format(s.requests || 0) + ' запр/5мин · ' + fmtInt.format(s.latency_ms_avg || 0) + 'ms avg</span>' +
          '</div>' + errorsHtml;
        }

        setText('requests', fmtInt.format(s.requests));
        setText('rpm', fmt.format(s.requests_per_minute) + ' rpm · сегодня ' + fmtInt.format(today.requests || 0));
        setText('tpm', tokenText(today));
        setText('tokens', '5 мин: ' + tokenRateText(s));
        setText('latency', fmtInt.format(s.latency_ms_avg) + 'мс');
        setText('maxLatency', 'max ' + fmtInt.format(s.latency_ms_max) + 'мс');
        setText('errors', fmtInt.format(s.fail));
        setText('success', fmt.format(s.ok) + ' ok');
        setText('cost', '$' + money.format(today.cost || 0));
        setText('costToday', '$' + money.format(usage.totals?.cost || all.cost || 0) + ' за 7д');

        // Filter and render model cards
        const filteredModels = allAvailableModels.filter(m => observedModels.includes(m.model));
        setInnerCached('modelCards', renderRows(filteredModels, '<div class="empty-state">Нет моделей. Выберите наблюдаемые модели во вкладке "Настройки".</div>', renderModelCard), withCacheKey(filteredModels));

        // Push desktop notifications
        if (Object.keys(previousModelStates).length > 0) {
          allAvailableModels.forEach((m) => {
            const prevState = previousModelStates[m.model];
            const currentState = m.state;
            if (prevState && prevState !== currentState) {
              if (currentState === 'available' && (prevState === 'limited' || prevState === 'error' || prevState === 'retry')) {
                showNotification('Модель ' + m.model + ' снова доступна!', 'Статус изменился на "доступна".');
              } else if (currentState === 'limited' && prevState !== 'limited') {
                const waitText = m.reset_in_seconds ? ' через ' + formatDuration(m.reset_in_seconds) : '';
                showNotification('Модель ' + m.model + ' заблокирована (429)!', 'Лимит исчерпан. Ожидаемый сброс' + waitText + '.');
              } else if (currentState === 'error' && prevState !== 'error') {
                showNotification('Ошибка на модели ' + m.model + '!', 'Вернулся статус ' + (m.last_status || 'неизвестно') + '.');
              }
            }
            previousModelStates[m.model] = currentState;
          });
        } else {
          allAvailableModels.forEach((m) => {
            previousModelStates[m.model] = m.state;
          });
        }

        // Render limits table
        setInnerCached('limits', renderRows(data.limits, '<tr><td colspan="6" class="empty-state">Активных лимитов нет</td></tr>', (limit) => {
          const reset = limit.reset_at ? new Date(limit.reset_at).toLocaleString('ru-RU') : '—';
          const wait = limit.reset_in_seconds == null ? '—' : formatDuration(limit.reset_in_seconds);
          const state = limit.limited ? 'лимит' : 'ранее';
          return '<tr><td>' + escapeHtml(limit.model) + '</td><td class="' + (limit.limited ? 'fail' : 'muted') + '">' + state + '</td><td>' + escapeHtml(formatQuota(limit)) + '</td><td>' + escapeHtml(reset) + '</td><td class="right">' + escapeHtml(wait) + '</td><td>' + escapeHtml(limit.error_type || '') + '</td></tr>';
        }), withCacheKey(data.limits));

        // Render today usage table
        const todayRows = ((usage.by_model_today || []).filter((row) => row.requests > 0));
        setInnerCached('todayModels', renderRows(todayRows, '<tr><td colspan="10" class="empty-state">Запросов сегодня нет</td></tr>', (m) =>
          '<tr><td>' + escapeHtml(m.model) + '</td><td class="right">' + fmtInt.format(m.requests) + '</td><td class="right ok">' + fmtInt.format(m.ok) + '</td><td class="right fail">' + fmtInt.format(m.fail) + '</td><td class="right">' + escapeHtml(tokenText(m)) + '</td><td class="right">' + escapeHtml(tokenPartText(m, 'prompt_tokens')) + '</td><td class="right">' + escapeHtml(tokenPartText(m, 'completion_tokens')) + '</td><td class="right warn">' + fmtInt.format(m.rate_limited || 0) + '</td><td class="right">' + fmtInt.format(m.latency_ms_avg) + '</td><td class="right">' + money.format(m.cost || 0) + '</td></tr>'
        ), withCacheKey(todayRows));

        // Render daily usage table
        const dayRows = (usage.by_day || []).filter((row) => row.requests > 0);
        setInnerCached('dailyUsage', renderRows(dayRows, '<tr><td colspan="7" class="empty-state">Истории нет</td></tr>', (day) =>
          '<tr><td>' + escapeHtml(day.day) + '</td><td class="right">' + fmtInt.format(day.requests) + '</td><td class="right ok">' + fmtInt.format(day.ok) + '</td><td class="right fail">' + fmtInt.format(day.fail) + '</td><td class="right">' + escapeHtml(tokenText(day)) + '</td><td class="right warn">' + fmtInt.format(day.rate_limited || 0) + '</td><td class="right">' + money.format(day.cost || 0) + '</td></tr>'
        ), withCacheKey(dayRows));

        // Render recent events
        setInnerCached('recent', renderRows(data.recent, '<tr><td colspan="8" class="empty-state">Запросов нет</td></tr>', (e) => {
          const statusClass = e.ok ? 'ok' : 'fail';
          const detail = e.ok ? e.finish_reason : e.error_type;
          return '<tr><td>' + new Date(e.ts).toLocaleTimeString('ru-RU') + '</td><td>' + escapeHtml(e.model) + '</td><td class="' + statusClass + '">' + escapeHtml(String(e.status)) + '</td><td class="right">' + fmtInt.format(e.latency_ms) + 'мс</td><td class="right">' + escapeHtml(tokenText(e)) + '</td><td class="right">' + escapeHtml(tokenPartText(e, 'prompt_tokens')) + '</td><td class="right">' + escapeHtml(tokenPartText(e, 'completion_tokens')) + '</td><td>' + escapeHtml(detail || '') + '</td></tr>';
        }), withCacheKey(data.recent));
 
        // Update charts
        if (ts.length > 0 && hasCharts()) {
          const visibleTs = ts.slice(-60);
          updateActivityChart(visibleTs);
          updateLatencyChart(visibleTs);
          updateCostChart(visibleTs);
        }

        // Render model distribution donut
        const modelAgg = {};
        for (const row of todayRows) {
          if (!modelAgg[row.model]) modelAgg[row.model] = 0;
          modelAgg[row.model] += row.requests || 0;
        }
        if (Object.keys(modelAgg).length === 0) {
          for (const b of ts) {
            for (const [model, agg] of Object.entries(b.by_model || {})) {
              if (!modelAgg[model]) modelAgg[model] = 0;
              modelAgg[model] += agg.requests || 0;
            }
          }
        }
        const modelLabels = Object.keys(modelAgg).sort((a, b) => modelAgg[b] - modelAgg[a]);
        const modelData = modelLabels.map((m) => modelAgg[m]);
        updateDonut('modelDonut', 'modelLegend', 'modelDonutTotal', modelLabels, modelData, modelLabels.map((_, i) => getChartColor(i)));

        // Prompt vs Completion donut
        let totalPrompt = 0, totalCompletion = 0;
        if (today.requests) {
          totalPrompt = today.prompt_tokens || 0;
          totalCompletion = today.completion_tokens || 0;
        } else {
          for (const b of ts) { totalPrompt += b.prompt_tokens || 0; totalCompletion += b.completion_tokens || 0; }
        }
        updateDonut('tokenDonut', 'tokenLegend', 'tokenDonutTotal', ['Prompt', 'Completion'], [totalPrompt, totalCompletion], ['#6366f1', '#10b981']);

        // Success vs Error donut
        let totalOk = today.ok || 0, totalFail = today.fail || 0, totalRateLimited = today.rate_limited || 0;
        if (!today.requests) {
          for (const b of ts) { totalOk += b.ok || 0; totalFail += b.fail || 0; totalRateLimited += b.rate_limited || 0; }
        }
        updateDonut('successDonut', 'successLegend', 'successDonutTotal', ['OK', 'Ошибки', '429'], [totalOk, totalFail, totalRateLimited], ['#10b981', '#f43f5e', '#f59e0b']);

        const dbState = usage.enabled ? (usage.path || 'usage.jsonl') : 'только RAM';
        $('privacy').textContent = data.privacy.note + ' Хранение: ' + dbState + '.';
      } catch (error) {
        const pill = $('status');
        pill.classList.add('error');
        pill.replaceChildren(statusDot(), document.createTextNode(' Ошибка: ' + error.message));
      }
    }

    $('themeToggle').addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('oc-dash-theme', next);
      requestAnimationFrame(() => requestAnimationFrame(updateChartColors));
    });

    $('activityTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.chart-tab');
      if (!tab) return;
      document.querySelectorAll('#activityTabs .chart-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activityMode = tab.dataset.metric === 'tokens' ? 'tokens' : 'requests';
    });

    $('refresh').addEventListener('click', refresh);

    const savedTheme = localStorage.getItem('oc-dash-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    initCharts();
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`;
}

export { renderDashboard };
