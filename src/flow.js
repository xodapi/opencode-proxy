export function renderFlow() {
  return `<!doctype html>
<html lang="ru" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OpenCode — Request Flow</title>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/reactflow@11.11.4/dist/umd/reactflow.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reactflow@11.11.4/dist/base.css">
  <script crossorigin src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.0/babel.min.js"></script>
  <style>
    :root {
      --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --radius: 12px;
      --radius-sm: 8px;
      --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    }
    [data-theme="dark"] {
      --bg: #0f1117;
      --bg-card: #1c1f2e;
      --bg-card-hover: #232640;
      --border: #2a2d42;
      --text: #e8eaed;
      --text-secondary: #9ca3af;
      --text-muted: #6b7280;
      --accent: #6366f1;
      --accent-soft: rgba(99,102,241,.15);
      --good: #10b981;
      --bad: #f43f5e;
      --warn: #f59e0b;
      --rf-bg: #13151e;
      --rf-node-bg: #1c1f2e;
      --rf-node-border: #2a2d42;
      --rf-handle: #6366f1;
    }
    [data-theme="light"] {
      --bg: #f8fafc;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --accent: #6366f1;
      --accent-soft: rgba(99,102,241,.08);
      --good: #059669;
      --bad: #e11d48;
      --warn: #d97706;
      --rf-bg: #f1f5f9;
      --rf-node-bg: #ffffff;
      --rf-node-border: #e2e8f0;
      --rf-handle: #6366f1;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      height: 100vh;
      overflow: hidden;
    }
    .app {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    header h1 {
      font-size: 16px;
      font-weight: 600;
    }
    header h1 span { color: var(--text-muted); font-weight: 400; }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      transition: background .15s, border-color .15s, color .15s;
    }
    .btn:hover { background: var(--bg-card-hover); border-color: var(--accent); color: var(--text); }
    .btn-icon {
      padding: 6px 8px;
      line-height: 1;
    }
    .btn-icon svg { width: 18px; height: 18px; display: block; }
    .flow-wrapper {
      flex: 1;
      position: relative;
    }
    .react-flow { background: var(--rf-bg) !important; }
    .react-flow__background { background: var(--rf-bg) !important; }
    .react-flow__controls { border-radius: var(--radius-sm); overflow: hidden; box-shadow: var(--shadow); }
    .react-flow__controls button {
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      fill: var(--text-secondary);
    }
    .react-flow__controls button:hover { background: var(--bg-card-hover); color: var(--text); fill: var(--text); }
    .react-flow__minimap { border-radius: var(--radius-sm); border: 1px solid var(--border) !important; }
    .react-flow__minimap svg { border-radius: var(--radius-sm); }
    .react-flow__attribution { display: none !important; }

    .flow-node {
      padding: 12px 16px;
      border-radius: var(--radius);
      background: var(--rf-node-bg);
      border: 1.5px solid var(--rf-node-border);
      min-width: 130px;
      text-align: center;
      box-shadow: var(--shadow);
      transition: border-color .2s, box-shadow .2s;
      position: relative;
    }
    .flow-node:hover { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
    .flow-node.active { border-color: var(--good); }
    .flow-node.error { border-color: var(--bad); }
    .flow-node.warn { border-color: var(--warn); }
    .flow-node-icon { font-size: 24px; line-height: 1; margin-bottom: 6px; }
    .flow-node-label { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
    .flow-node-metric { font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
    .flow-node-sub { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
    .react-flow__handle { width: 10px; height: 10px; background: var(--rf-handle) !important; border: 2px solid var(--bg) !important; }
    .react-flow__handle-top { top: -5px; }
    .react-flow__handle-bottom { bottom: -5px; }

    .model-node {
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      background: var(--rf-node-bg);
      border: 1.5px solid var(--rf-node-border);
      min-width: 100px;
      text-align: center;
      font-size: 11px;
      box-shadow: var(--shadow);
      transition: border-color .2s;
    }
    .model-node:hover { border-color: var(--accent); }
    .model-node.available { border-color: var(--good); }
    .model-node.limited { border-color: var(--warn); }
    .model-node.error { border-color: var(--bad); }
    .model-node .model-name { font-weight: 600; font-size: 12px; margin-bottom: 2px; }
    .model-node .model-status { font-size: 10px; color: var(--text-muted); }

    .status-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 20px;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    .status-bar .dot {
      width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px;
    }
    .status-bar .dot.ok { background: var(--good); }
    .status-bar .dot.err { background: var(--bad); }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; display: inline-block;
      background: var(--good);
    }
    .status-pill { display: flex; align-items: center; gap: 6px; }
    .status-pill.error .status-dot { background: var(--bad); }
    .loading {
      display: flex; align-items: center; justify-content: center;
      height: 100%; color: var(--text-muted); font-size: 14px;
    }
    @media (prefers-reduced-motion: no-preference) {
      body, header, .flow-node, .model-node, .status-bar, .btn { transition: background-color .2s, color .2s, border-color .2s; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header>
      <h1>Request Flow <span>· pipeline визуализация</span></h1>
      <div class="header-actions">
        <a class="btn" href="/dashboard">Дашборд</a>
        <button class="btn btn-icon" id="themeToggle" type="button" title="Сменить тему" aria-label="Сменить тему">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>
        </button>
      </div>
    </header>
    <div class="flow-wrapper">
      <div id="root"></div>
    </div>
    <div class="status-bar" id="statusBar">
      <span class="status-pill" id="status"><span class="status-dot"></span> Загрузка...</span>
      <span id="statsLine"></span>
    </div>
  </div>

  <script type="text/babel">
    const { StrictMode, useState, useEffect, useCallback, useMemo, memo, useRef } = React;
    const { createRoot } = ReactDOM;
    const RF = window.Reactflow || {};
    const ReactFlow = RF.default || RF.ReactFlow;
    const { Handle, Position, useNodesState, useEdgesState, Background, Controls, MiniMap, MarkerType } = RF;

    const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
    const fmtInt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

    const FLOW_NODE_WIDTH = 140;
    const FLOW_NODE_HEIGHT = 90;

    function FlowNode({ data }) {
      return (
        <div className={'flow-node ' + (data.status || '')}>
          <Handle type="target" position={Position.Top} />
          <div className="flow-node-icon">{data.icon}</div>
          <div className="flow-node-label">{data.label}</div>
          {data.metric != null && <div className="flow-node-metric">{data.metric}</div>}
          {data.sub != null && <div className="flow-node-sub">{data.sub}</div>}
          <Handle type="source" position={Position.Bottom} />
        </div>
      );
    }

    function ModelNode({ data }) {
      return (
        <div className={'model-node ' + (data.status || '')}>
          <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
          <div className="model-name">{data.label}</div>
          <div className="model-status">{data.sub || data.status || 'нет данных'}</div>
          <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
        </div>
      );
    }

    const nodeTypes = { flowNode: memo(FlowNode), modelNode: memo(ModelNode) };

    function buildFlowData(snapshot) {
      const s = snapshot?.summary?.window || {};
      const all = snapshot?.summary?.all || {};
      const usage = snapshot?.usage || {};
      const today = (usage.by_day || []).find(r => r.day === usage.today) || {};
      const primary = snapshot?.model_status?.primary || [];
      const generatedAt = snapshot?.generated_at ? new Date(snapshot.generated_at).toLocaleTimeString('ru-RU') : '—';
      const uptime = snapshot?.uptime_seconds;

      const nodes = [
        { id: 'client', type: 'flowNode', position: { x: 320, y: 20 }, data: { icon: '🖥', label: 'Client', status: 'active', metric: fmtInt.format(s.requests || 0) + ' запр/5мин', sub: 'OpenCode Desktop / SDK' } },
        { id: 'proxy', type: 'flowNode', position: { x: 320, y: 130 }, data: { icon: '🔒', label: 'Proxy Handler', status: 'active', metric: fmtInt.format(s.ok || 0) + ' OK · ' + fmtInt.format(s.fail || 0) + ' ошибок', sub: 'Авторизация · body' } },
        { id: 'router', type: 'flowNode', position: { x: 320, y: 240 }, data: { icon: '🔀', label: 'Model Router', status: 'active', metric: primary.length + ' моделей', sub: snapshot?.routing || 'round-robin' } },
        { id: 'upstream', type: 'flowNode', position: { x: 320, y: 350 }, data: { icon: '☁️', label: 'Upstream API', status: s.fail > s.ok ? 'error' : 'active', metric: fmtInt.format(s.latency_ms_avg || 0) + 'ms avg', sub: 'opencode.ai/zen/v1' } },
        { id: 'metrics', type: 'flowNode', position: { x: 320, y: 460 }, data: { icon: '📊', label: 'Metrics', status: 'active', metric: fmtInt.format(all.requests || 0) + ' всего событий', sub: all.uptime_seconds ? 'uptime ' + (uptime ? Math.floor(uptime / 3600) + 'ч' : '—') : '—' } },
        { id: 'response', type: 'flowNode', position: { x: 320, y: 570 }, data: { icon: '✅', label: 'Response', status: s.ok > 0 ? 'active' : 'warn', metric: fmtInt.format(s.ok || 0) + ' OK', sub: today.requests ? fmtInt.format(today.requests) + ' сегодня' : 'нет запросов' } },
      ];

      const edges = [
        { id: 'e-c-p', source: 'client', target: 'proxy', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-p-r', source: 'proxy', target: 'router', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-r-u', source: 'router', target: 'upstream', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
        { id: 'e-u-m', source: 'upstream', target: 'metrics', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981', strokeWidth: 2 } },
        { id: 'e-m-r', source: 'metrics', target: 'response', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      ];

      const modelSpacing = 160;
      const modelStartX = 40;
      const modelY = 710;
      let modelIdx = 0;
      for (const m of primary) {
        const state = m.state || 'untested';
        nodes.push({
          id: 'model-' + m.model,
          type: 'modelNode',
          position: { x: modelStartX + modelIdx * modelSpacing, y: modelY },
          data: { label: m.model.length > 14 ? m.model.slice(0, 12) + '…' : m.model, status: state, sub: m.limited ? 'лимит' : (m.rate_limit_remaining != null ? m.rate_limit_remaining + '/' + m.rate_limit_limit : state) },
        });
        edges.push({
          id: 'e-router-' + m.model,
          source: 'router',
          target: 'model-' + m.model,
          style: { stroke: '#2a2d42', strokeWidth: 1, strokeDasharray: '4 3' },
        });
        modelIdx++;
      }

      return { nodes, edges, generatedAt, uptime };
    }

    function App() {
      const [snapshot, setSnapshot] = useState(null);
      const [error, setError] = useState(null);
      const intervalRef = useRef(null);

      const fetchData = useCallback(async () => {
        try {
          const res = await fetch('/metrics?window=300000&days=1', { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          setSnapshot(data);
          setError(null);
          const pill = document.getElementById('status');
          pill.classList.remove('error');
          const dot = pill.querySelector('.status-dot');
          const ts = data.generated_at ? new Date(data.generated_at).toLocaleTimeString('ru-RU') : '—';
          pill.replaceChildren(dot, document.createTextNode(' ' + ts));
          const s = data.summary?.window || {};
          const line = document.getElementById('statsLine');
          line.textContent = fmtInt.format(s.requests || 0) + ' запр · ' + fmtInt.format(s.ok || 0) + ' OK · ' + fmtInt.format(s.fail || 0) + ' ошибок · ' + fmtInt.format(s.latency_ms_avg || 0) + 'ms · ' + (data.uptime_seconds ? Math.floor(data.uptime_seconds / 3600) + 'ч uptime' : '');
        } catch (err) {
          setError(err.message);
          const pill = document.getElementById('status');
          pill.classList.add('error');
          const dot = pill.querySelector('.status-dot');
          pill.replaceChildren(dot, document.createTextNode(' Ошибка: ' + err.message));
        }
      }, []);

      useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, 3000);
        return () => clearInterval(intervalRef.current);
      }, [fetchData]);

      const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
        if (!snapshot) return { nodes: [], edges: [] };
        return buildFlowData(snapshot);
      }, [snapshot]);

      const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
      const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

      useEffect(() => {
        setNodes(flowNodes);
        setEdges(flowEdges);
      }, [flowNodes, flowEdges, setNodes, setEdges]);

      const defaultEdgeOptions = useMemo(() => ({
        style: { strokeWidth: 2 },
        type: 'smoothstep',
        animated: true,
      }), []);

      const fitViewOpts = useMemo(() => ({ padding: 0.2, duration: 300 }), []);

      if (!snapshot) {
        return <div className="loading">Загрузка данных...</div>;
      }

      return (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView={fitViewOpts}
          minZoom={0.5}
          maxZoom={2}
          attributionPosition={false}
        >
          <Background gap={20} size={1} color="var(--border)" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeColor="var(--rf-handle)"
            nodeColor="var(--rf-node-bg)"
            nodeBorderRadius={6}
            maskColor="rgba(0,0,0,.2)"
            style={{ background: 'var(--bg-card)' }}
          />
        </ReactFlow>
      );
    }

    const root = createRoot(document.getElementById('root'));
    root.render(<StrictMode><App /></StrictMode>);

    document.getElementById('themeToggle').addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('oc-dash-theme', next);
    });

    const savedTheme = localStorage.getItem('oc-dash-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  </script>
</body>
</html>`;
}
