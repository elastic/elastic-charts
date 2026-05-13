/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, text } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const data = [
  {
    x: 'com.example.something.host.23',
    y: 12,
  },
  { x: 'com.example.something.host.11', y: 8 },
  { x: 'com.example.something.host.07', y: 17 },
  { x: 'com.example.something.host.02', y: 5 },
  { x: 'com.example.something.worker.04', y: 9 },
  { x: 'com.example.something.worker.01', y: 4 },
];

type EllipsisPosition = 'start' | 'middle' | 'end';

/** Knob helper: empty → unset; plain number → px; value like `25` or `25.5 %` → percentage string. */
function parseThemeSize(raw: string): number | string | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const pct = s.match(/^([\d.]+)\s*%$/);
  if (pct) return `${pct[1]}%`;
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  return s;
}

export const Example: ChartsStory = (_, { title, description }) => {
  const xMaxLength = parseThemeSize(text('Max length (X)', ''));
  const xTruncate = select<EllipsisPosition>(
    'Truncate (X)',
    { end: 'end', start: 'start', middle: 'middle' },
    'middle',
  );
  const yMaxLength = parseThemeSize(text('Max length (Y)', '120'));
  const yTruncate = select<EllipsisPosition>(
    'Truncate (Y)',
    { end: 'end', start: 'start', middle: 'middle' },
    'middle',
  );

  const rotation = customKnobs.enum.rotation('Chart rotation', 90);

  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} rotation={rotation} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Count"
        style={{ tickLabel: { maxLength: xMaxLength, truncate: xTruncate } }}
      />
      <Axis
        id="left"
        position={Position.Left}
        title="Team"
        style={{ tickLabel: { maxLength: yMaxLength, truncate: yTruncate } }}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
