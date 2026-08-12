/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// Anonymized trace with the same shape as a Kibana workflow execution: one long-running step
// (`run_agent`, ~6.9 min) dominates the timeline, followed by a dense burst of very short (~7 ms)
// "write_record" calls inside a `foreach`. Against the ~418 s total, each write is well under a pixel
// wide, so on a linear/time axis the whole tail collapses to nothing. This story exercises the
// `minSpanWidthPx` floor (ADR 0036 / B1): every span is guaranteed a >= 5 px mark, so the burst
// stays visible and locatable even though it is dwarfed by the dominating span.

interface StepMeta {
  /** Generic step type used only for coloring, e.g. `ai.agent`, `request`, `data.set`. */
  type: string;
  status: string;
}

const ROOT = 'demo-trace-0001';
// Arbitrary epoch base so the time axis shows wall-clock ticks; all offsets below are ms from here.
const T0 = 1_700_000_000_000;

const step = (id: string, name: string, type: string, start: number, end: number, parentId = ROOT): TraceDatum => ({
  id,
  name,
  start: T0 + start,
  end: T0 + end,
  parentId: id === ROOT ? undefined : parentId,
  traceId: ROOT,
  meta: { type, status: 'completed' } satisfies StepMeta,
});

// The dominating step ends ~414 s in; the burst of writes runs in the last ~3 s inside the foreach.
const AGENT_END = 414_356;
const BURST_START = 414_466;
const BURST_COUNT = 68;
const BURST_STEP_MS = 45; // gap between successive writes
const BURST_DURATION_MS = 7; // each write lasts a few ms → sub-pixel without the floor

const burst: TraceDatum[] = Array.from({ length: BURST_COUNT }, (_, i) => {
  const start = BURST_START + i * BURST_STEP_MS;
  return step(`write_record_${i}`, 'write_record [request]', 'request', start, start + BURST_DURATION_MS, 'foreach');
});

// Same waterfall shape as the workflow trace: a few instant setup steps, one dominating span, then a
// `foreach` wrapping the dense tail of short writes, closed by an output step.
const DATA: TraceDatum[] = [
  step(ROOT, 'demo workflow', 'workflow', 0, 417_584),
  step('init', 'initialize [data.set]', 'data.set', 0, 1),
  step('fetch', 'fetch_items [query]', 'query', 14, 104),
  step('compute', 'compute_batch [data.set]', 'data.set', 113, 114),
  step('check', 'check_has_work [if]', 'if', 134, 143),
  step('agent', 'run_agent [ai.agent]', 'ai.agent', 152, AGENT_END),
  step('collect', 'collect_results [data.set]', 'data.set', 414_367, 414_368),
  step('guard', 'guard_processed [if]', 'if', 414_391, 417_572),
  step('foreach', 'process_each [foreach]', 'foreach', 414_439, 417_557),
  ...burst,
  step('output', 'output_result [output]', 'output', 417_583, 417_584),
];

// Color lanes by step type so each family reads as its own hue (the multi-hue "workflow" look).
const BY_TYPE = (datum: TraceDatum) => (datum.meta as StepMeta | undefined)?.type ?? 'workflow';

export const Example: ChartsStory = (_, { title, description }) => {
  const showDisplayChildCount = boolean('showDisplayChildCount', false);
  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 600 }}>
      <Settings baseTheme={useBaseTheme()} theme={{ trace: { labelPosition: 'inline' } }} />
      <Trace
        id="trace_min_span_width"
        data={DATA}
        xScaleType="time"
        traceId={ROOT}
        colorBy={BY_TYPE}
        showDisplayChildCount={showDisplayChildCount}
      />
    </Chart>
  );
};

Example.parameters = {
  // Give the story root an explicit height so it grows to fit the 600 px chart; without this the
  // non-resize default (`#story-root { height: 0 }`) clamps the root and the chart overflows on top of
  // the markdown rendered below it.
  resize: { height: '600px', overflowY: 'auto' },
  markdown:
    'A highly **skewed** trace: one `ai.agent` step (~6.9 min) dominates the timeline, followed by a ' +
    'dense burst of ~7 ms `request` writes inside a `foreach`. Against the ~418 s total each write is ' +
    'far less than a pixel wide.\n\n' +
    'This exercises the **`minSpanWidthPx`** theme token (ADR 0036 / B1): every span is floored to at ' +
    'least a 5 px mark, so the burst tail stays visible and locatable instead of collapsing to nothing. ' +
    'The floor is purely visual — picking, timing, and the tooltip still read the true (sub-pixel) ' +
    'extent.\n\n' +
    '- **duration mode** floors the whole bar; **segments mode** (default) floors the total line and ' +
    'guarantees one min-width active mark so a short active leaf reads as active, not idle.\n' +
    '- **colorBy** — lanes are colored by step type.',
};
