/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import type { TraceDatum, TraceSpec } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

type DatasetKey =
  | 'Complete trace'
  | 'Root with genuine orphans'
  | 'No recorded root'
  | 'Multiple recorded roots'
  | 'Multiple traces'
  | 'Clock skew and collapse'
  | 'Malformed identity graph';

interface DatasetConfig {
  data: TraceDatum[];
  /** Elected/recorded root id whose subtree the collapse knob rolls up (when set). */
  collapsibleRootId?: string;
  /** Offer a per-trace isolation knob for combined multi-trace datasets. */
  traceIds?: string[];
}

const DATASETS: Record<DatasetKey, DatasetConfig> = {
  // One recorded root; every span's recorded parent is present. No orphan provenance, no warning.
  'Complete trace': {
    data: [
      { id: 'root', name: 'root · 0–200', start: 0, end: 200 },
      { id: 'child-a', name: 'child A · 10–90', parentId: 'root', start: 10, end: 90 },
      { id: 'grandchild', name: 'grandchild · 20–60', parentId: 'child-a', start: 20, end: 60 },
      { id: 'child-b', name: 'child B · 100–180', parentId: 'root', start: 100, end: 180 },
    ],
    collapsibleRootId: 'root',
  },
  // Two missing-parent spans become direct display children of the recorded root; orphan-1's own
  // recorded descendant stays nested below it. Only the missing-parent spans receive provenance.
  'Root with genuine orphans': {
    data: [
      { id: 'root', name: 'root · 0–300', start: 0, end: 300 },
      { id: 'child-present', name: 'recorded child · 10–100', parentId: 'root', start: 10, end: 100 },
      { id: 'orphan-1', name: 'orphan 1 · parent "missing-x" · 50–150', parentId: 'missing-x', start: 50, end: 150 },
      { id: 'orphan-1-child', name: 'recorded child of orphan 1 · 60–120', parentId: 'orphan-1', start: 60, end: 120 },
      { id: 'orphan-2', name: 'orphan 2 · parent "missing-y" · 120–200', parentId: 'missing-y', start: 120, end: 200 },
    ],
    collapsibleRootId: 'root',
  },
  // No recorded root: the first orphan in source order becomes the fallback display root even though
  // it is not the earliest by start; the remaining orphans attach beneath it.
  'No recorded root': {
    data: [
      {
        id: 'orphan-first',
        name: 'orphan (source #1) · 100–200 · fallback root',
        parentId: 'gone-1',
        start: 100,
        end: 200,
      },
      { id: 'orphan-second', name: 'orphan (source #2) · earliest start 0–80', parentId: 'gone-2', start: 0, end: 80 },
      { id: 'orphan-third', name: 'orphan (source #3) · 50–160', parentId: 'gone-3', start: 50, end: 160 },
    ],
    collapsibleRootId: 'orphan-first',
  },
  // More than one recorded root: the last in source order is elected; the earlier root and its
  // exclusive descendants are omitted (recovery warning). An orphan attaches to the elected root.
  'Multiple recorded roots': {
    data: [
      { id: 'root-early', name: 'recorded root (source #1) · omitted · 0–100', start: 0, end: 100 },
      {
        id: 'early-child',
        name: 'child of omitted root · omitted · 10–60',
        parentId: 'root-early',
        start: 10,
        end: 60,
      },
      { id: 'root-late', name: 'recorded root (source #2) · elected · 0–200', start: 0, end: 200 },
      { id: 'late-child', name: 'recorded child of elected root · 20–120', parentId: 'root-late', start: 20, end: 120 },
      { id: 'orphan', name: 'orphan · parent "missing" · 30–90', parentId: 'missing', start: 30, end: 90 },
    ],
    collapsibleRootId: 'root-late',
  },
  // Two independent trace groups; each elects and reparents on its own. `cross-span` sits in trace A
  // but references a parent that exists only in trace B, so it stays an orphan in A. Isolate a group
  // with the traceId knob.
  'Multiple traces': {
    data: [
      { id: 'a-root', name: 'A · root · 0–100', traceId: 'trace-A', start: 0, end: 100 },
      {
        id: 'a-orphan',
        name: 'A · orphan · parent "a-missing" · 20–80',
        traceId: 'trace-A',
        parentId: 'a-missing',
        start: 20,
        end: 80,
      },
      {
        id: 'cross-span',
        name: 'A · parent "b-root" resolves only in trace B · stays orphan',
        traceId: 'trace-A',
        parentId: 'b-root',
        start: 30,
        end: 70,
      },
      { id: 'b-root', name: 'B · root · 0–120', traceId: 'trace-B', start: 0, end: 120 },
      { id: 'b-child', name: 'B · recorded child · 10–90', traceId: 'trace-B', parentId: 'b-root', start: 10, end: 90 },
    ],
    traceIds: ['trace-A', 'trace-B'],
  },
  // A left-skewed reparented orphan is placed against the corrected display root and carries both
  // orphan and skew provenance; a second reparented orphan needs no correction. Collapsing the root
  // rolls up both reparented orphans without reducing the root's source-derived self time.
  'Clock skew and collapse': {
    data: [
      { id: 'cs-root', name: 'root · 0–200', start: 0, end: 200 },
      {
        id: 'cs-orphan-skew',
        name: 'orphan · left-skewed −20–60 → corrected · parent "missing"',
        parentId: 'missing',
        start: -20,
        end: 60,
      },
      {
        id: 'cs-orphan-noskew',
        name: 'orphan · 100–160 · no correction · parent "missing-2"',
        parentId: 'missing-2',
        start: 100,
        end: 160,
      },
    ],
    collapsibleRootId: 'cs-root',
  },
  // A valid elected tree renders while a disconnected parent cycle is omitted as unreachable (one
  // recovery warning). A same-group reachable duplicate would invalidate only its own trace group; a
  // rootless-only group would render a blank plot; a cross-trace duplicate ID would invalidate the
  // entire combined result (see markdown).
  'Malformed identity graph': {
    data: [
      { id: 'mg-root', name: 'valid root · 0–200', start: 0, end: 200 },
      { id: 'mg-child', name: 'valid child · 10–90', parentId: 'mg-root', start: 10, end: 90 },
      { id: 'mg-cycle-a', name: 'disconnected cycle A · omitted', parentId: 'mg-cycle-b', start: 0, end: 40 },
      { id: 'mg-cycle-b', name: 'disconnected cycle B · omitted', parentId: 'mg-cycle-a', start: 10, end: 50 },
    ],
  },
};

const X_SCALE_OPTIONS: Record<string, TraceSpec['xScaleType']> = {
  'linear — elapsed from domain minimum': 'linear',
  'time — absolute timestamp coordinates': 'time',
};

const LANE_ORDER_OPTIONS: Record<string, TraceSpec['laneOrder']> = {
  'tree — display-topology nesting': 'tree',
  'chronological — corrected starts': 'chronological',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const datasetKey = select<DatasetKey>('Dataset', Object.keys(DATASETS) as DatasetKey[], 'Root with genuine orphans');
  const xScaleLabel = select('xScaleType', Object.keys(X_SCALE_OPTIONS), 'linear — elapsed from domain minimum');
  const laneOrderLabel = select('laneOrder', Object.keys(LANE_ORDER_OPTIONS), 'tree — display-topology nesting');
  const dataset = DATASETS[datasetKey];
  const laneOrder = LANE_ORDER_OPTIONS[laneOrderLabel];

  // Per-trace isolation for the multi-trace dataset; 'all' renders the combined waterfall.
  const traceIdOptions = ['all', ...(dataset.traceIds ?? [])];
  const traceIdLabel = select('traceId', traceIdOptions, 'all');
  const traceId = traceIdLabel === 'all' ? undefined : traceIdLabel;

  const collapseRoot = boolean('collapse elected root', false);
  const collapsedSpanIds =
    collapseRoot && dataset.collapsibleRootId && laneOrder === 'tree' ? [dataset.collapsibleRootId] : undefined;

  return (
    <Chart title={title} description={description} size={{ width: '100%', height: 360 }}>
      <Settings
        baseTheme={useBaseTheme()}
        onElementClick={action('onElementClick')}
        onElementOver={action('onElementOver')}
      />
      <Trace
        id="trace_partial_reparenting"
        data={dataset.data}
        traceId={traceId}
        xScaleType={X_SCALE_OPTIONS[xScaleLabel]}
        laneOrder={laneOrder}
        collapsedSpanIds={collapsedSpanIds}
        onSelectionChange={action('onSelectionChange')}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: [
    'Partial-trace recovery is always on. Missing-parent spans are disclosed as **orphans** and given a synthetic **display parent** beneath their trace group\u2019s **elected root**, without ever changing the recorded `parentId` or `datum`. Use **Dataset** to load each conformance case, then hover/click/select spans and inspect `orphaned` and `reparentedToSpanId` in the **Actions** panel. The tooltip, hidden screen-reader table, and keyboard focus announcement disclose the same provenance. The Trace component renders no aggregate warning callout \u2014 recovery-driven omissions/invalidations emit a single bounded developer console warning only.',
    '**Complete trace.** One recorded root with all recorded parents present. No orphan provenance and no warning. Toggle **laneOrder** to confirm identical visible membership with different ordering only.',
    '**Root with genuine orphans (default).** `orphan-1` and `orphan-2` reference absent parents and become direct display children of `root`; `orphan-1`\u2019s recorded descendant stays nested below it. Only the missing-parent spans carry `orphaned`/`reparentedToSpanId`; `child-present` is unaffected and source self time does not subtract the synthetic edge.',
    '**No recorded root.** Three top-level missing-parent spans. `orphan-first` (source order #1) becomes the fallback display root even though `orphan-second` starts earliest; the other two attach beneath it. The fallback root reports `orphaned` with no `reparentedToSpanId`.',
    '**Multiple recorded roots.** The last recorded root in source order (`root-late`) is elected; `root-early` and its exclusive descendant are omitted, and `orphan` attaches to `root-late`. Reordering the source would change which root is elected \u2014 development builds log one recovery warning naming the affected group.',
    '**Multiple traces.** `trace-A` and `trace-B` each elect and reparent independently. `cross-span` lives in `trace-A` but references `b-root`, which resolves only in `trace-B`, so it stays an orphan of `trace-A`. Use the **traceId** knob to isolate a group. A span ID duplicated across selected trace groups would invalidate the entire combined result (chart-global IDs).',
    '**Clock skew and collapse.** `cs-orphan-skew` records \u221220\u201360 and, once reparented under `cs-root`, is corrected against the display root (carrying `orphaned`, `reparentedToSpanId`, and `skewCorrected`); `cs-orphan-noskew` is reparented without correction. Enable **collapse elected root** (tree mode) to roll both reparented orphans into the root\u2019s bar without reducing its source-derived self time.',
    '**Malformed identity graph.** A valid elected tree renders while a disconnected parent cycle is omitted as unreachable (one recovery warning). Related cases reserved for the future diagnostics feature: a reachable same-group duplicate invalidates only its own trace group; a rootless-only group keeps the time bar mounted over a blank plot; and a cross-trace duplicate ID invalidates the whole combined result.',
    'No visual indicator is drawn for reparented spans in this spec \u2014 provenance is delivered through interaction payloads, the tooltip, and the screen-reader surface only. See [ADR 0028](https://github.com/elastic/elastic-charts/blob/main/docs/adr/trace-viz/0028-partial-trace-synthetic-parentage.md).',
  ].join('\n\n'),
};
