# Agent Handoff

This repository is a small, local-first OpenCode proxy for Windows users. Keep changes narrow, privacy-safe, and easy to ship as a source-only zip.

## Before editing

- Start with `git status --short --branch` and assume uncommitted work may belong to another agent or the user.
- Prefer `rg` and `rg --files` for search.
- Do not store prompts, responses, API keys, session ids, local project paths, or raw request bodies in logs, metrics, exports, or docs.
- Keep management endpoints protected when `MANAGEMENT_TOKEN` is configured or `HOST` is exposed.
- Keep the default bind host as `127.0.0.1`.
- Preserve the `/metrics` schema version as `version: 1`; application package version belongs in `app_version`.
- Add tests when changing endpoint behavior, routing, metrics retention, auth, exports, or dashboard/flow embedded scripts.

## Validation commands

Run these before handing work back:

```powershell
npm test
npm run secret-scan
git diff --check
```

For release-facing changes, also run:

```powershell
.\doctor.cmd
.\doctor-factory.cmd
.\model-health.cmd --compact
.\proxy-status.cmd --compact
.\build-release.cmd
```

## Current handoff notes

Recent fixes made during the 2026-06-26 audit:

- Added `/diag` to the protected management endpoint set.
- Preserved `/metrics` schema `version: 1` and added package version as `app_version`.
- Added a Content Security Policy for `/flow`; dashboard keeps the CDN allowance needed for Chart.js.
- Fixed `/flow` edge redraw after resize by storing `window._lastEdges`.
- Added a fallback for browsers without `AbortSignal.timeout`.
- Normalized invalid `ProxyMetrics({ maxEvents })` values before allocating the ring buffer.
- Extracted shared numeric/string helpers into `src/utils.js`.
- Removed the accidental Windows-reserved `NUL` file that contained an old flow HTML dump.
- Added tests for `/diag` auth, `/flow` script sanity, CSP behavior, `app_version`, and invalid `maxEvents`.

Changes made during 2026-06-26 dashboard/flow session:

- Added `getChartColor(index)` with HSL fallback to browser inline script (fixes `getChartColor is not defined`).
- Rewrote `/flow` as vanilla JS (no React/ReactFlow CDN dependencies). SVG edges + positioned div nodes.
- Added `/diag` endpoint with compact health summary (routes, models, 5min stats, health state).
- Added health banner to dashboard: shows ✅/⚠️/🚨 status with metrics at page top.
- Added GitHub link and package version (v1.0.0) to both dashboard and flow page headers.
- Added `VERSION` constant to dashboard inline script.
- Added `AbortSignal.timeout` fallback polyfill and resize edge redraw to flow page.
- Fixed duplicate `version` field in `/metrics` snapshot (preserved schema `version: 1`).
- Pass version from proxy.js to `renderDashboard(VERSION)` and `renderFlow(VERSION)`.

Backlog reference: `ISSUES.md` for P1-P4 tasks still pending (streaming passthrough, retry/fallback, circuit breaker, etc.).

