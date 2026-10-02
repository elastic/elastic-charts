/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { TraceCriticalPath, TraceDatum, TraceSpec } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

type DatasetKey =
  | 'Kibana baseline cases'
  | 'Nested independent correction'
  | 'Long-child clamp'
  | 'No-op and malformed durations'
  | 'Projection and integrations'
  | 'Malformed topology';

interface DatasetConfig {
  data: TraceDatum[];
  criticalPath?: TraceCriticalPath;
  forceChronological?: boolean;
}

const DATASETS: Record<DatasetKey, DatasetConfig> = {
  'Kibana baseline cases': {
    data: [
      { id: 'baseline-root-only', name: 'no parent · unchanged 0–50', start: 0, end: 50 },
      { id: 'baseline-after-parent', name: 'after parent · unchanged 0–100', start: 0, end: 100 },
      {
        id: 'baseline-after-child',
        name: 'after parent child · unchanged 10–60',
        parentId: 'baseline-after-parent',
        start: 10,
        end: 60,
      },
      { id: 'baseline-short-parent', name: 'short-child parent · unchanged 0–100', start: 0, end: 100 },
      {
        id: 'baseline-short-child',
        name: 'short child · −20–20 → 30–70',
        parentId: 'baseline-short-parent',
        start: -20,
        end: 20,
      },
      { id: 'baseline-long-parent', name: 'long-child parent · unchanged 0–100', start: 0, end: 100 },
      {
        id: 'baseline-long-child',
        name: 'long child · −30–120 → 0–150',
        parentId: 'baseline-long-parent',
        start: -30,
        end: 120,
      },
    ],
  },
  'Nested independent correction': {
    data: [
      { id: 'nested-root', name: 'root · unchanged 0–200', start: 0, end: 200 },
      {
        id: 'nested-http',
        name: 'http · −20–80 → 50–150',
        parentId: 'nested-root',
        start: -20,
        end: 80,
        activeSegments: [{ start: -10, end: 30, label: 'http active · 60–100' }],
      },
      {
        id: 'nested-before',
        name: 'before recorded parent · −30…−10 → 90–110',
        parentId: 'nested-http',
        start: -30,
        end: -10,
      },
      {
        id: 'nested-between',
        name: 'between recorded/corrected parent · 0–20 → 90–110',
        parentId: 'nested-http',
        start: 0,
        end: 20,
        activeSegments: [{ start: 5, end: 15, label: 'middle active · 95–105' }],
      },
      {
        id: 'nested-after',
        name: 'after corrected parent · unchanged 100–120',
        parentId: 'nested-http',
        start: 100,
        end: 120,
      },
    ],
  },
  'Long-child clamp': {
    data: [
      { id: 'long-root', name: 'parent · unchanged 0–100', start: 0, end: 100 },
      {
        id: 'long-child',
        name: 'long child · −30–120 → 0–150',
        parentId: 'long-root',
        start: -30,
        end: 120,
      },
    ],
  },
  'No-op and malformed durations': {
    data: [
      { id: 'noop-root', name: 'root · unchanged 0–100', start: 0, end: 100 },
      { id: 'noop-child', name: 'unskewed · unchanged 10–30', parentId: 'noop-root', start: 10, end: 30 },
      {
        id: 'right-overhang',
        name: 'right overhang · unchanged 80–120',
        parentId: 'noop-root',
        start: 80,
        end: 120,
      },
      { id: 'zero-duration', name: 'zero duration · −10 → 50', parentId: 'noop-root', start: -10, end: -10 },
      {
        id: 'negative-duration',
        name: 'negative duration · retained −10…−20',
        parentId: 'noop-root',
        start: -10,
        end: -20,
      },
      { id: 'negative-parent', name: 'negative parent · retained 90…70', start: 90, end: 70 },
      {
        id: 'negative-parent-child',
        name: 'child of negative parent · retained 60–80',
        parentId: 'negative-parent',
        start: 60,
        end: 80,
      },
    ],
  },
  'Projection and integrations': {
    data: [
      { id: 'ordering-root', name: 'root · unchanged absolute 100–300', start: 100, end: 300 },
      {
        id: 'ordering-a',
        name: 'child A · 80–180 → absolute 150–250',
        parentId: 'ordering-root',
        start: 80,
        end: 180,
      },
      {
        id: 'ordering-b',
        name: 'child B · unchanged absolute 110–130, ordered before A',
        parentId: 'ordering-root',
        start: 110,
        end: 130,
      },
    ],
    criticalPath: [{ spanId: 'ordering-a', start: 100, end: 120 }],
  },
  'Malformed topology': {
    data: [
      { id: 'orphan', name: 'missing-parent orphan · retained as root', parentId: 'missing', start: 0, end: 20 },
      { id: 'cycle-a', name: 'cycle A · retained', parentId: 'cycle-b', start: 0, end: 40 },
      { id: 'cycle-b', name: 'cycle B · retained', parentId: 'cycle-a', start: -10, end: 30 },
      { id: 'duplicate', name: 'duplicate ID A · retained', start: 50, end: 70 },
      { id: 'duplicate', name: 'duplicate ID B · retained', start: 80, end: 100 },
    ],
    // Duplicate/cyclic parentage has deliberately unspecified tree semantics (ADR 0027).
    forceChronological: true,
  },
};

const X_SCALE_OPTIONS: Record<string, TraceSpec['xScaleType']> = {
  'linear — elapsed from corrected domain minimum': 'linear',
  'time — absolute timestamp coordinates': 'time',
};

const LANE_ORDER_OPTIONS: Record<string, TraceSpec['laneOrder']> = {
  'tree — corrected root/sibling starts': 'tree',
  'chronological — all corrected starts': 'chronological',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const datasetKey = select<DatasetKey>(
    'Dataset',
    Object.keys(DATASETS) as DatasetKey[],
    'Nested independent correction',
  );
  const xScaleLabel = select(
    'xScaleType',
    Object.keys(X_SCALE_OPTIONS),
    'linear — elapsed from corrected domain minimum',
  );
  const laneOrderLabel = select('laneOrder', Object.keys(LANE_ORDER_OPTIONS), 'tree — corrected root/sibling starts');
  // Number of stacked tick-label rows in time mode (theme.trace.timeAxisLayerCount). Ignored in linear.
  const timeAxisLayerCount = number('tick layers (time mode)', 2, { min: 0, max: 3, step: 1 });
  const dataset = DATASETS[datasetKey];
  const laneOrder = dataset.forceChronological ? 'chronological' : LANE_ORDER_OPTIONS[laneOrderLabel];

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 360 }}>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{ trace: { timeAxisLayerCount } }}
        onElementClick={action('onElementClick')}
        onElementOver={action('onElementOver')}
      />
      <Trace
        id="trace_clock_skew"
        data={dataset.data}
        criticalPath={dataset.criticalPath}
        xScaleType={X_SCALE_OPTIONS[xScaleLabel]}
        laneOrder={laneOrder}
        onSelectionChange={action('onSelectionChange')}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: [
    'Clock-skew correction is always on. Use **Dataset** to load all visual conformance cases; the control changes source data, not correction behavior. Hover and click corrected and uncorrected spans, make a selection, and compare `skewCorrected` in the **Actions** panel. Use **xScaleType** and **laneOrder** to inspect projection and ordering. The hidden screen-reader table and keyboard focus announcement expose the same correction provenance.',
    '**Kibana baseline cases.** These mirror the local golden tests for Kibana commit `36c31d600a371`: a root 0–50 is unchanged; a 10–60 child under a 0–100 parent is unchanged; a shorter −20–20 child moves to 30–70; and a longer −30–120 child clamps to 0–150. Only the moved children carry correction provenance.',
    '**Nested independent correction (default).** Root 0–200. HTTP records −20–80 and renders 50–150. Its 20 ms children start before the recorded parent (−30…−10), between the recorded and corrected parent starts (0–20), and after the corrected parent start (100–120). The first two independently render at 90–110; the last remains 100–120 and unmarked. HTTP’s active segment moves from −10–30 to 60–100; the middle child’s moves from 5–15 to 95–105.',
    '**Long-child clamp.** A 150 ms child records −30–120 under a 0–100 parent and moves to 0–150. Non-negative latency clamps to zero, so the left edge equals the parent start and the overhang remains on the right.',
    '**No-op and malformed durations.** An unskewed 10–30 child and right-overhanging 80–120 child remain unchanged. A zero-duration child moves from −10 to the parent midpoint at 50 and is marked. The −10…−20 child and 90…70 parent retain their malformed coordinates; all incident edges are ignored. Development builds emit one warning listing both IDs.',
    '**Projection and integrations.** In absolute coordinates, child A moves from 80–180 to 150–250; sibling B remains 110–130 and therefore sorts before A. A’s raw critical interval 100–120 moves by A’s own +70 offset to 170–190. In linear mode the corrected domain starts at the root’s 100 ms and is re-zeroed. Switch scale and lane-order controls, then compare tooltip, Actions payloads, selection detail, and screen-reader provenance for A and B.',
    '**Malformed topology.** Partial-trace recovery (Spec 26) now runs before clock-skew correction. With no recorded root, the two duplicate-ID roots elect the last in source order and the missing-parent span is reparented beneath it, while the non-elected duplicate root and the disconnected parent cycle are omitted (one recovery console warning); correction still terminates without hanging. Forced to chronological order because duplicate/cyclic tree relationships have unspecified semantics (ADR 0027). See the dedicated partial-trace reparenting story for the full recovery matrix.',
    'Running-child, running-parent, and completed-edge-below-running-parent cases are deferred to Spec 25, where running spans become valid public input.',
  ].join('\n\n'),
};
