/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { select, boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  HistogramBarSeries,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  Tooltip,
  TooltipAction,
} from '@elastic/charts';

import { useBaseTheme } from '../../../use_base_theme';
import { getTooltipTypeKnob } from '../../utils/knobs';
import { SB_SOURCE_PANEL } from '../../utils/storybook';
import { wait } from '../../utils/utils';
import { DATA_SERIES } from './data/series';

const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});
const tooltipDateFormatter = (d: number) => formatter.format(d);
const stringPluralize = (d: unknown[]) => (d.length > 1 ? 's' : '');

export const Example = () => {
  const chartType = select('chart type', { bar: 'bar', line: 'line' }, 'line');
  const reduceData = boolean('reduce data', false);
  const asyncDelay = number('async actions delay', 0, { step: 100, min: 0 });

  const actions: TooltipAction[] = [
    {
      disabled: (d) => d.length !== 1,
      label: (d) => (d.length !== 1 ? 'Select to drilldown' : `Drilldown to ${d[0].label}`),
      onSelect: (s) => action('drilldown to')(s[0].label),
    },
    {
      label: () => `Filter this 30s time bucket`,
      onSelect: (s) => action('filter time bucket')(s[0].datum.timestamp),
    },
    {
      disabled: (d) => d.length < 1,
      label: (d) => (d.length < 1 ? 'Select to filter host IDs' : `Filter by ${d.length} host ID${stringPluralize(d)}`),
      onSelect: (s) => action('filter')(s.map((d) => d.label)),
    },
    {
      disabled: (d) => d.length < 1,
      label: (d) => (d.length < 1 ? 'Select to copy host IDs' : `Copy ${d.length} host ID${stringPluralize(d)}`),
      onSelect: (s) => action('copy')(s.map((d) => d.label)),
    },
  ];

  return (
    <Chart>
      <Settings
        baseTheme={useBaseTheme()}
        theme={{
          axes: { tickLine: { visible: true } },
          barSeriesStyle: {
            rect: {
              opacity: 0.9,
            },
          },
          lineSeriesStyle: {
            point: { visible: false },
          },
        }}
      />
      <Tooltip
        type={getTooltipTypeKnob()}
        maxVisibleTooltipItems={4}
        actions={asyncDelay > 0 ? () => wait(asyncDelay, () => actions) : actions}
      />
      <Axis
        id="x"
        position={Position.Bottom}
        showGridLines={true}
        style={{
          tickLine: { size: 0.0001, padding: 4 },
          tickLabel: {
            alignment: { horizontal: Position.Left, vertical: Position.Bottom },
            padding: 0,
            offset: { x: 0, y: 0 },
          },
        }}
        tickFormat={tooltipDateFormatter}
        timeAxisLayerCount={2}
      />
      <Axis
        id="left"
        position={Position.Right}
        showGridLines
        ticks={4}
        tickFormat={(d) => `${Number(d * 100).toFixed(0)}`}
      />
      {DATA_SERIES.map((d) => {
        const data = d.timeseries.rows.slice(0, reduceData ? 20 : undefined);
        return chartType === 'bar' ? (
          <HistogramBarSeries
            id={d.name}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor="timestamp"
            yAccessors={['metric_0']}
            yNice
            data={data}
          />
        ) : (
          <LineSeries
            id={d.name}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor="timestamp"
            yAccessors={['metric_0']}
            yNice
            data={data}
          />
        );
      })}
    </Chart>
  );
};

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
