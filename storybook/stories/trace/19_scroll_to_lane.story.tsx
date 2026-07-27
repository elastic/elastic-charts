/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useRef, useState } from 'react';

import type { TraceControlCallbacks } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { CHECKOUT_WATERFALL } from './data';
import { LogPanel } from './story_components';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// Remap ids to match span names so the user types what they see in the waterfall.
const idToName = new Map(CHECKOUT_WATERFALL.map((s) => [s.id, s.name]));
const SCROLL_DATA = CHECKOUT_WATERFALL.map((s) => ({
  ...s,
  id: s.name,
  parentId: s.parentId !== undefined ? idToName.get(s.parentId) : undefined,
}));

const AVAILABLE_LABELS = CHECKOUT_WATERFALL.map((s) => s.name);

export const Example: ChartsStory = (_, { title: _title, description: _description }) => {
  const baseTheme = useBaseTheme();
  const [input, setInput] = useState('');
  const [lastSubmit, setLastSubmit] = useState('—');

  // Hold the chart's imperative controls (ADR 0008). `controlProviderCallback` fires on mount with a
  // live `TraceControlCallbacks`; we stash it in a ref so the external search box can call it.
  const controls = useRef<TraceControlCallbacks | null>(null);

  const submit = () => {
    const id = input.trim();
    if (!id) return;
    controls.current?.scrollToSpan(id);
    setLastSubmit(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Chart
        title="Scroll-to-lane"
        description="External search box drives the trace waterfall"
        size={{ width: '100%', height: 300 }}
      >
        <Settings baseTheme={baseTheme} />
        <Trace
          id="trace_scroll_to_lane"
          data={SCROLL_DATA}
          xScaleType="linear"
          controlProviderCallback={(callbacks) => {
            controls.current = callbacks;
          }}
        />
      </Chart>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Type a span name and press Go"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          style={{ flex: 1, padding: '4px 8px', fontFamily: 'monospace', fontSize: 13 }}
        />
        <button onClick={submit} style={{ padding: '4px 12px' }}>
          Go
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <LogPanel label="Last submitted" value={lastSubmit} />
        <LogPanel label="Available span names" value={AVAILABLE_LABELS.join(', ')} />
      </div>
    </div>
  );
};

Example.parameters = {
  resize: { height: '520px', overflowY: 'auto' },
  markdown:
    'Demonstrates programmatic scroll-to-lane: type a span name (as shown in the waterfall) and ' +
    'press **Go** (or Enter) to snap to that lane (centered, highlighted). Re-submitting the same ' +
    'name re-triggers the scroll. An unknown name emits a dev-warn in the console and does nothing.\n\n' +
    'Span ids in this demo match span labels — `id === name` — so the search box input matches ' +
    'exactly what you see in the chart. The chart hands its imperative controls to ' +
    '`controlProviderCallback` (ADR 0008); the story stashes them in a `useRef` and the search box ' +
    "calls `scrollToSpan`. Keyboard focus stays on the search box; a screen reader hears the located " +
    "span via the trace chart's `aria-live` region.",
};
