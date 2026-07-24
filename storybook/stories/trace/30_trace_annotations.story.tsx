/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import type {
  TraceAnnotationColor,
  TraceAnnotationEvent,
  TraceDatum,
  TraceTimeAnnotationPlacement,
} from '@elastic/charts';
import {
  Chart,
  Settings,
  Trace,
  TraceHierarchyAnnotation,
  TraceLaneAnnotation,
  TraceTimeAnnotation,
} from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Nested single-trace fixture (elapsed-ms `linear`) exercising every annotation kind (Spec 29). The
 * `db` subtree is deliberately interleaved with `auth` and `render` siblings so a hierarchy annotation
 * on `db.query` renders a **segmented** rail (route lanes only, gaps on the interleaved siblings).
 */
const DATA: TraceDatum[] = [
  { id: 'root', name: 'GET /checkout', start: 0, end: 1000 },
  { id: 'auth', name: 'Auth.verify', parentId: 'root', start: 20, end: 180 },
  { id: 'db', name: 'SELECT * FROM orders', parentId: 'root', start: 200, end: 620 },
  { id: 'conn', name: 'acquire connection', parentId: 'db', start: 200, end: 250 },
  { id: 'query', name: 'execute query', parentId: 'db', start: 250, end: 600 },
  { id: 'render', name: 'Render page', parentId: 'root', start: 640, end: 980 },
];

const COLORS: Record<string, TraceAnnotationColor> = {
  default: 'default',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  'custom (#8a2be2)': '#8a2be2',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const labelPosition = select<'gutter' | 'inline' | 'none'>(
    'labelPosition',
    { gutter: 'gutter', inline: 'inline', none: 'none' },
    'gutter',
  );
  const showTimePoint = boolean('time point annotation', true);
  const showTimeRange = boolean('time range annotation', true);
  const showLane = boolean('lane annotation', true);
  const showHierarchy = boolean('hierarchy annotation', true);
  const clickable = boolean('clickable annotations (onAnnotationClick)', true);
  const markerColor = select('time marker color', COLORS, 'primary');
  const timePlacement = select<TraceTimeAnnotationPlacement>(
    'time annotation placement',
    { timebar: 'timebar', plot: 'plot' },
    'timebar',
  );

  // Consumer-owned tooltip: annotations carry no built-in tooltip; hover metadata drives this overlay.
  const [hovered, setHovered] = useState<string | null>(null);

  const onAnnotationOver = (e: TraceAnnotationEvent) => {
    action('onAnnotationOver')(e);
    const meta = e.annotation.meta as { tip?: string } | undefined;
    setHovered(meta?.tip ?? e.annotation.ariaLabel ?? e.annotation.id);
  };
  const onAnnotationOut = (e: TraceAnnotationEvent) => {
    action('onAnnotationOut')(e);
    setHovered(null);
  };

  return (
    <div style={{ position: 'relative', width: 900, maxWidth: '100%' }}>
      <Chart title={title} description={description} size={{ width: '100%', height: 320 }}>
        <Settings baseTheme={useBaseTheme()} theme={{ trace: { labelPosition, laneHeight: 40 } }} />
        <Trace
          id="trace_annotations"
          data={DATA}
          xScaleType="linear"
          onAnnotationOver={onAnnotationOver}
          onAnnotationOut={onAnnotationOut}
          {...(clickable ? { onAnnotationClick: action('onAnnotationClick') } : {})}
        >
          {showTimePoint && (
            <TraceTimeAnnotation
              id="deploy"
              time={300}
              placement={timePlacement}
              color={markerColor}
              ariaLabel="Deploy marker"
              meta={{ tip: 'Deploy v4.2 at +300 ms' }}
            />
          )}
          {showTimeRange && (
            <TraceTimeAnnotation
              id="sla"
              range={[400, 800]}
              placement={timePlacement}
              color="warning"
              ariaLabel="SLA window"
              meta={{ tip: 'SLA budget window (400–800 ms)' }}
            />
          )}
          {showLane && (
            <TraceLaneAnnotation
              id="slow-render"
              spanId="render"
              color="danger"
              ariaLabel="Slow render lane"
              meta={{ tip: 'Render exceeded its budget' }}
            />
          )}
          {showHierarchy && (
            <TraceHierarchyAnnotation
              id="db-route"
              spanId="query"
              color="primary"
              ariaLabel="Database call route"
              meta={{ tip: 'root → SELECT orders → execute query' }}
            />
          )}
        </Trace>
      </Chart>
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: 'none',
          }}
        >
          {hovered}
        </div>
      )}
    </div>
  );
};

Example.parameters = {
  markdown:
    'Trace annotations (Spec 29): declarative marks composed as children of `<Trace>`. Three kinds — ' +
    '`TraceTimeAnnotation` (a **time point** or **time range** on the x-scale), `TraceLaneAnnotation` ' +
    "(a boundary rail on one span's lane), and `TraceHierarchyAnnotation` (a **segmented** rail along " +
    "the visible root-to-target route). Annotations are inert data; interaction handlers live on " +
    '`<Trace>`.\n\n' +
    '- **colors** — each annotation takes a `color` intent: a named token ' +
    '(`default` / `primary` / `success` / `warning` / `danger`) or a custom color. Toggle the ' +
    '**time marker color** knob to see the palette (and a custom `#8a2be2`).\n' +
    '- **time annotations** — a point marker (`Deploy`) and a range (`SLA window`). ' +
    'Range bands are hit-tested on their **edges only**, so spans inside the band stay interactive.\n' +
    '- **placement** — the **time annotation placement** knob switches time annotations between ' +
    "`timebar` (default: a marker head plus a tick in the lower half of the time bar, over the axis " +
    'ticks — nothing is drawn in the plot; a range tints a band across that time-bar region) and ' +
    '`plot` (a solid full-height rail, or a tinted plot band with edge rails for a range). Lane and ' +
    'hierarchy annotations are always plot-anchored.\n' +
    '- **hierarchy** — the `db.query` route is rendered as a segmented rail: only the route lanes ' +
    '(`root`, `SELECT orders`, `execute query`) get a segment; the interleaved `auth` / `render` ' +
    'siblings do not.\n' +
    '- **events** — hover any annotation to log `onAnnotationOver` / `onAnnotationOut` and drive the ' +
    'consumer-owned tooltip overlay (top-right) from `annotation.meta`. When **clickable**, click to ' +
    'log `onAnnotationClick`; the pointer cursor turns interactive only when `onAnnotationClick` is ' +
    'supplied.\n' +
    '- **accessibility** — resolved annotations are listed in a dedicated screen-reader table, ' +
    'separate from the span rows.',
};
