/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, select } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { TraceDatum, TraceSpanBadge, TraceSpanBadgeAccessor, TraceSpanBadgeSize } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import { LANGUAGE_BADGE_ICONS, DURATION_BADGE_ICON } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Synthetic single-trace fixture exercising every Span badge facet (Spec 27): a language image
 * icon, semantic colors, an image-only badge, a `none`-visible badge, and a long cluster that must
 * truncate and overflow. Elapsed-ms (`linear`) timings.
 */
const DATA: TraceDatum[] = [
  { id: 'root', name: 'GET /checkout', start: 0, end: 1000 },
  { id: 'db', name: 'SELECT * FROM orders WHERE user_id = $1', parentId: 'root', start: 80, end: 520 },
  { id: 'cache', name: 'Cache.get session', parentId: 'root', start: 540, end: 700 },
  { id: 'palette', name: 'Color palette', parentId: 'root', start: 720, end: 900 },
  { id: 'overflow', name: 'Overflowing badge cluster', parentId: 'root', start: 120, end: 980 },
];

/** The six named badge colors, shown on the `palette` span. */
const PALETTE: TraceSpanBadge['color'][] = ['default', 'hollow', 'primary', 'success', 'warning', 'danger'];

export const Example: ChartsStory = (_, { title, description }) => {
  const badgeSize = select<TraceSpanBadgeSize>('badgeSize', { s: 's', m: 'm' }, 'm');
  const labelPosition = select<'gutter' | 'inline' | 'none'>(
    'labelPosition',
    { gutter: 'gutter', inline: 'inline', none: 'none' },
    'inline',
  );
  const clickable = boolean('clickable badges (onBadgeClick)', true);
  const brokenImage = boolean('simulate image load failure', false);
  const width = number('chart width (px) — narrow to force overflow', 900, { min: 320, max: 1200, step: 20 });

  // The accessor depends on the image knob, so memoize on it (a stable ref per render otherwise).
  const badgeAccessor = useMemo<TraceSpanBadgeAccessor>(() => {
    const js = LANGUAGE_BADGE_ICONS.javascript!;
    const iconSrc = brokenImage ? 'https://invalid.example/missing-icon.png' : js.src;

    const byId: Record<string, TraceSpanBadge[]> = {
      root: [
        // Image icon, and a status badge kept visible even when labels are omitted (visibleIn none).
        {
          id: 'lang',
          image: { src: iconSrc },
          ariaLabel: js.label,
          text: js.label,
          visibleIn: ['gutter', 'inline', 'none'],
        },
        { id: 'method', text: 'GET', color: 'hollow' },
        { id: 'status', text: '200', color: 'success', visibleIn: ['gutter', 'inline', 'none'] },
        { id: 'dur', text: '1000 ms', image: { src: DURATION_BADGE_ICON } },
      ],
      db: [
        { id: 'db', text: 'postgresql', color: 'primary' },
        { id: 'rows', text: '128 rows' },
      ],
      // Image-only badge (no text): its accessible name comes from ariaLabel.
      cache: [
        { id: 'redis', image: { src: iconSrc }, ariaLabel: 'Redis cache' },
        { id: 'miss', text: 'MISS', color: 'danger' },
      ],
      palette: PALETTE.map((color, i) => ({ id: `c${i}`, text: String(color), color })),
      overflow: [
        { id: 'o1', text: 'authentication', color: 'primary' },
        { id: 'o2', text: 'authorization', color: 'success' },
        { id: 'o3', text: 'rate-limiting', color: 'warning' },
        { id: 'o4', text: 'circuit-breaker', color: 'danger' },
      ],
    };
    return (datum) => byId[datum.id] ?? [];
  }, [brokenImage]);

  return (
    <div style={{ width, maxWidth: '100%' }}>
      <Chart title={title} description={description} size={{ width: '100%', height: 320 }}>
        <Settings baseTheme={useBaseTheme()} theme={{ trace: { labelPosition, laneHeight: 44 } }} />
        <Trace
          id="trace_span_badges"
          data={DATA}
          xScaleType="linear"
          badgeSize={badgeSize}
          badgeAccessor={badgeAccessor}
          onBadgeOver={action('onBadgeOver')}
          onBadgeOut={action('onBadgeOut')}
          {...(clickable ? { onBadgeClick: action('onBadgeClick') } : {})}
        />
      </Chart>
    </div>
  );
};

Example.parameters = {
  markdown:
    'Span badges (Spec 27): structured, themed adornments derived from each span by `badgeAccessor`. ' +
    'This demo exercises every facet via knobs:\n\n' +
    '- **badgeSize** — one shared `s` / `m` size for the whole Trace (controls text, padding, and image box).\n' +
    '- **labelPosition** — `gutter` / `inline` / `none`. In `none`, only badges with `visibleIn` ' +
    "including `'none'` (the JS icon and `200` status here) render, in a compact badge-only gutter.\n" +
    '- **colors** — the `Color palette` lane shows the six named colors ' +
    '(`default`, `hollow`, `primary`, `success`, `warning`, `danger`).\n' +
    '- **images** — the JS icon and the image-only `Redis cache` badge load inline-SVG data URLs. ' +
    'Toggle **simulate image load failure** to see the placeholder fallback (text, name, and ' +
    'interaction stay available).\n' +
    '- **overflow** — narrow **chart width** to watch the `Overflowing badge cluster` lane truncate ' +
    'then omit trailing badges (omitted badges remain in the screen-reader table).\n' +
    '- **events** — hover and (when **clickable**) click a badge to log `onBadgeOver` / `onBadgeOut` / ' +
    '`onBadgeClick` in the **Actions** panel. The pointer cursor turns interactive only when ' +
    '`onBadgeClick` is supplied.',
};
