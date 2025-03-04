/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import type { XYChartSeriesIdentifier, SeriesCompareFn } from '@elastic/charts';
import { Axis, HistogramBarSeries, Chart, LegendValue, Position, ScaleType, Settings, Tooltip } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { sampleLogLevelData } from '../utils/datasets/test_log_data';
import { customKnobs } from '../utils/knobs';

const colorMappings: Record<string, string> = {
  debug: '#6092c0',
  info: '#90b0d1',
  notice: '#becfe3',
  warn: '#d6bf57',
  error: '#df9351',
  crit: '#e7664c',
  alert: '#da5f47',
  emerg: '#cc5642',
  other: '#d3dae6',
};

function getSortOrderFn(group: string, disabled = false) {
  const sortEnabled = boolean('enable sorting', !disabled, group);
  const reverseSort = boolean('reverse sort order', false, group);
  const sortOrder = customKnobs.array('order', sampleLogLevelData.levels, undefined, group);

  if (!sortEnabled) return;

  const finalOrder = reverseSort ? sortOrder.toReversed() : sortOrder;
  const renderMap = Object.fromEntries(
    sampleLogLevelData.levels.map((l) => [l, finalOrder.includes(l) ? finalOrder.indexOf(l) : 100]),
  );

  return (a: XYChartSeriesIdentifier, b: XYChartSeriesIdentifier) => {
    const aLogLevel = a.splitAccessors.get('logLevel') ?? '';
    const bLogLevel = b.splitAccessors.get('logLevel') ?? '';
    return Math.sign(renderMap[aLogLevel] - renderMap[bLogLevel]) * 1;
  };
}

export const Example: ChartsStory = (_, { title, description }) => {
  const useDefaultColorPalette = boolean('use default color palette', false);
  const stacked = boolean('stacked', true);
  const renderSortFn = getSortOrderFn('Render');
  const legendSortFn = getSortOrderFn('Legend', true);
  const tooltipSortFn = getSortOrderFn('Tooltip', true);

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        legendPosition={Position.Right}
        baseTheme={useBaseTheme()}
        renderingSort={renderSortFn as SeriesCompareFn}
        legendSort={legendSortFn as SeriesCompareFn}
      />
      <Tooltip sort={tooltipSortFn as SeriesCompareFn} />
      <Axis id="x" title="@timestamp" position={Position.Bottom} tickFormat={(d) => moment(d).format('lll')} />
      <Axis id="y" title="Count" position={Position.Left} maximumFractionDigits={0} />

      <HistogramBarSeries
        id="series-1"
        color={
          useDefaultColorPalette
            ? undefined
            : (v) => {
                const logLevel = v.splitAccessors.get('logLevel') ?? '';
                return colorMappings[logLevel] ?? null;
              }
        }
        name="Events by log.level"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="timestamp"
        yAccessors={['count']}
        splitSeriesAccessors={['logLevel']}
        stackAccessors={stacked ? ['logLevel'] : undefined}
        data={sampleLogLevelData.data}
      />
    </Chart>
  );
};
