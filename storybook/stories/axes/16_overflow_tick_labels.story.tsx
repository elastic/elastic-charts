/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select, text } from '@storybook/addon-knobs';
import React from 'react';

import type { AxisStyle, RecursivePartial, Rotation } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';
import { getNumberSelectKnob } from '../utils/knobs/custom';

const CHART_CONFIG_GROUP = 'Chart config';
const AXIS_X_GROUP = 'Axis X';
const AXIS_Y_GROUP = 'Axis Y';

const values = [47, 36, 28, 16, 13, 8, 8, 3] as const;

const datasets = {
  Categories: [
    'this is the longest category name in this story',
    'this is an even longer category name',
    'this is a longer category name',
    'another category',
    'category name',
    'category',
    'category',
    'ctg',
  ],
  URLs: [
    'https://analytics.example.com/dashboards/traffic/regions/north-america/overview',
    'https://cdn.assets.io/images/products/catalog/item-48291/preview.png',
    'https://api.metrics.dev/v2/series/latency/p99',
    'https://docs.elastic.co/guide/en/kibana',
    'https://github.com/elastic/charts',
    'https://elastic.co',
    'https://kibana.dev',
    'https://x.io',
  ],
  UUIDs: [
    'a3f8c2e1-9b4d-4e7a-8c5f-1d2e3a4b5c6d',
    '7b2e9f4a-1c8d-4a3e-9f6b-2e5c8a1d4f7b',
    'e5d1a8c3-6f2b-4d9e-a7c4-8b3f1e6d2a9c',
    '4c9b2e7f-3a1d-4f8c-b5e2-9d6a3c8f1b4e',
    'f1a6d3b8-2e9c-4b7f-8d5a-3c6e9b2f5a8d',
    '8d4e1a7c-5b2f-4c9e-a3d6-1f8b4e7c2a5d',
    '2b7f9c4e-8a1d-4e6b-9c3f-5d2a8e1b4c7f',
    'c6e3a9f2-4d1b-4a8e-b7c5-2f9d6a3e8b1c',
  ],
  Services: [
    'checkout.payment.processor.stripe.webhook',
    'search.query.coordinator.elasticsearch',
    'auth.identity.provider.oauth',
    'ingest.pipeline.parser',
    'metrics.aggregator',
    'api.gateway',
    'cache.redis',
    'logs.shipper',
  ],
} as const;

type DatasetKey = keyof typeof datasets;

const toData = (labels: readonly string[]) => labels.map((category, i) => ({ category, value: values[i] }));

function parseThemeSize(raw: string): number | string | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const pct = s.match(/^([\d.]+)\s*%$/);
  if (pct) return `${pct[1]}%`;
  const n = Number(s);
  if (Number.isFinite(n)) return n;
  return s;
}

const getWrapAxisKnobs = (group: string) => {
  const rotation = number('rotation', 0, { range: true, min: -90, max: 90, step: 1 }, group);
  const alignmentVertical = customKnobs.enum.verticalTextAlignment('Alignment Vertical', undefined, { group });
  const alignmentHorizontal = customKnobs.enum.horizontalTextAlignment('Alignment Horizontal', undefined, {
    group,
  });
  const minLength = number('label minLength', 12, { min: 0, step: 1 }, group);
  const maxLength = number('label maxLength (0 = auto)', 0, { min: 0, step: 1 }, group);
  const minExtent = parseThemeSize(text('minExtent', '', group));
  const maxExtent = parseThemeSize(text('maxExtent', '', group));
  const wrapLines = number('wrapLines', 1, { min: 1, max: 10, step: 1 }, group);
  const lineHeight = number('lineHeight', 1.2, { min: 0, max: 2, step: 0.1 }, group);
  const showOverlapping = boolean('show overlapping', false, group);
  const truncate = select(
    'truncate',
    { disabled: 'disabled', end: 'end', start: 'start', middle: 'middle' },
    'disabled',
    group,
  );

  return {
    rotation,
    alignmentVertical,
    alignmentHorizontal,
    minLength,
    maxLength,
    minExtent,
    maxExtent,
    wrapLines,
    lineHeight,
    showOverlapping,
    truncate,
  };
};

const buildAxisStyle = (knobs: ReturnType<typeof getWrapAxisKnobs>): RecursivePartial<AxisStyle> => {
  const {
    rotation,
    lineHeight,
    wrapLines,
    minLength,
    maxLength,
    minExtent,
    maxExtent,
    alignmentHorizontal,
    alignmentVertical,
    truncate,
  } = knobs;
  const alignment =
    alignmentHorizontal !== undefined || alignmentVertical !== undefined
      ? {
          ...(alignmentHorizontal !== undefined && { horizontal: alignmentHorizontal }),
          ...(alignmentVertical !== undefined && { vertical: alignmentVertical }),
        }
      : undefined;

  return {
    ...(minExtent !== undefined && { minExtent }),
    ...(maxExtent !== undefined && { maxExtent }),
    tickLabel: {
      rotation,
      lineHeight,
      wrapLines,
      minLength,
      ...(maxLength > 0 && { maxLength }),
      ...(alignment !== undefined && { alignment }),
      truncate: truncate === 'disabled' ? false : truncate,
    },
  };
};

export const Example: ChartsStory = (_, { title, description }) => {
  const chartRotation = getNumberSelectKnob<Rotation>(
    'Chart rotation',
    { '0 deg': 0, '90 deg': 90, '-90 deg': -90, '180 deg': 180 },
    0,
    CHART_CONFIG_GROUP,
  );
  const datasetKey = select('Dataset', Object.keys(datasets) as DatasetKey[], 'Categories', CHART_CONFIG_GROUP);
  const data = toData(datasets[datasetKey]);
  const barCount = number('Number of bars', data.length, { min: 1, max: data.length, step: 1 }, CHART_CONFIG_GROUP);
  const debug = boolean('debug', true, CHART_CONFIG_GROUP);

  const xPosition = select('Position', { Bottom: Position.Bottom, Top: Position.Top }, Position.Bottom, AXIS_X_GROUP);
  const yPosition = select('Position', { Left: Position.Left, Right: Position.Right }, Position.Left, AXIS_Y_GROUP);

  const axisXKnobs = getWrapAxisKnobs(AXIS_X_GROUP);
  const axisYKnobs = getWrapAxisKnobs(AXIS_Y_GROUP);

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} baseTheme={useBaseTheme()} rotation={chartRotation} />
      <Axis
        id="x-axis"
        position={xPosition}
        title="X axis"
        showOverlappingLabels={axisXKnobs.showOverlapping}
        style={buildAxisStyle(axisXKnobs)}
      />
      <Axis
        id="y-axis"
        position={yPosition}
        title="Y axis"
        showOverlappingTicks={axisYKnobs.showOverlapping}
        style={buildAxisStyle(axisYKnobs)}
      />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="category"
        yAccessors={['value']}
        data={data.slice(0, barCount)}
      />
    </Chart>
  );
};
