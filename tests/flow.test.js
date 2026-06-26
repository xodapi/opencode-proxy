import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderFlow } from '../src/flow.js';

describe('flow', () => {
  it('renders a syntactically valid embedded script', () => {
    const html = renderFlow('1.2.3');
    const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

    assert.ok(script);
    new Function(script);
    assert.match(html, /v1\.2\.3/);
  });

  it('persists edges for redraw and supports browsers without AbortSignal.timeout', () => {
    const html = renderFlow();
    const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1] || '';

    assert.match(script, /window\._lastEdges = edges/);
    assert.match(script, /function timeoutSignal/);
    assert.doesNotMatch(html, /body\s*\{[^}]*@media/s);
  });
});
