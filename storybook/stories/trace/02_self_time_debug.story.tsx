/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { normalize } from '@elastic/charts/src/chart_types/trace_chart/data/normalize';
import { resolveActive } from '@elastic/charts/src/chart_types/trace_chart/data/self_time';
import type { NormalizedSpan } from '@elastic/charts/src/chart_types/trace_chart/data/types';

import { CHECKOUT_SPANS } from './data';

// ---------------------------------------------------------------------------
// Run the self-time pipeline once at module load (spans are static)
// ---------------------------------------------------------------------------
const { spans: normalized } = normalize(CHECKOUT_SPANS, 'linear');
const resolved = resolveActive(normalized);

const TOTAL_MS = 1000;
const pct = (ms: number) => `${((ms / TOTAL_MS) * 100).toFixed(2)}%`;

// ---------------------------------------------------------------------------
// SpanRow — renders one resolved span as a proportional bar
// ---------------------------------------------------------------------------
function SpanRow({ span }: { span: NormalizedSpan }) {
  const totalWidth = ((span.end - span.start) / TOTAL_MS) * 100;
  const totalLeft  = (span.start / TOTAL_MS) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 13, marginBottom: 6 }}>
        <strong>{span.name}</strong>
        {' — '}[{span.start}–{span.end}ms]
        {' — self-time: '}
        {span.activeSegments.length === 0
          ? '(none)'
          : span.activeSegments.map((a) => `[${a.start}–${a.end}ms]`).join(', ')}
      </div>
      <div style={{ position: 'relative', height: 16, background: '#f0f0f0', border: '1px solid #ccc', width: 600, borderRadius: 2 }}>
        {/* Total duration (muted) */}
        <div
          style={{ position: 'absolute', left: `${totalLeft}%`, width: `${totalWidth}%`, height: '100%', background: '#b0c4de', opacity: 0.5 }}
          title={`Total: ${span.start}–${span.end}ms`}
        />
        {/* Active (self-time) segments */}
        {span.activeSegments.map((seg, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: pct(seg.start), width: pct(seg.end - seg.start), height: '100%', background: '#1f6feb' }}
            title={`Active: ${seg.start}–${seg.end}ms`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------
export const Example = () => (
  <div className="echChart">
    <div className="echChartStatus" data-ech-render-complete={true} />
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      {resolved.map((span) => <SpanRow key={span.id} span={span} />)}
    </div>
  </div>
);

Example.parameters = {
  markdown:
    'Debug view of the self-time derivation algorithm (`normalize` → `resolveActive`). ' +
    '**Light blue** = total span duration. **Dark blue** = derived self-time (active) segments — ' +
    'the portions not covered by any child. Gaps between active segments show where children run.\n\n' +
    'Explicit `activeSegments` fields (if present on a span) are copied verbatim; ' +
    'implicit self-time is derived from child coverage.',
};
