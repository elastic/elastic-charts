/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React, { ReactNode } from 'react';

import { Chart, Heatmap, Settings, Tooltip, TooltipValue } from '@elastic/charts';
import { BABYNAME_DATA } from '@elastic/charts/src/utils/data_samples/babynames';

import { useBaseTheme } from '../../../use_base_theme';

function boldMap(d: TooltipValue[]) {
  return d.reduce<ReactNode[]>(
    (acc, curr, i, array) => {
      acc.push(
        <b>
          {curr.label}:{curr.value}
        </b>,
      );
      if (array.length - 1 > i) {
        acc.push(' and ');
      }
      return acc;
    },
    ['Filter '],
  );
}

export const Example = () => {
  const data = BABYNAME_DATA.filter(([year]) => year > 1950 && year < 1960);

  return (
    <Chart>
      <Settings
        onElementClick={action('onElementClick')}
        brushAxis="both"
        baseTheme={useBaseTheme()}
        theme={{
          heatmap: {
            grid: {
              stroke: {
                width: 0,
              },
            },
            cell: {
              maxWidth: 'fill',
              border: {
                stroke: 'transparent',
                strokeWidth: 1,
              },
            },
            yAxisLabel: {
              visible: true,
            },
          },
        }}
        onBrushEnd={action('onBrushEnd')}
      />
      <Tooltip
        maxVisibleTooltipItems={4}
        maxTooltipItems={4}
        actions={[
          {
            disabled: (d) => d.length !== 1,
            label: (d) =>
              d.length !== 1 ? (
                'Select one to drilldown'
              ) : (
                <span>
                  Drilldown to{' '}
                  <b>
                    {d[0].label}:{d[0].value}
                  </b>
                </span>
              ),
            onSelect: (s) => action('drilldown to')(s[0].label),
          },
          {
            label: (d) => (d.length < 1 ? 'Select to filter' : boldMap(d)),
            onSelect: (s) => action('filter categories')(s.map((d) => d.label)),
          },
        ]}
      />
      <Heatmap
        id="Number of births"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 1000, color: '#AADC32' },
            { start: 1000, end: 5000, color: '#35B779' },
            { start: 5000, end: 10000, color: '#24868E' },
            { start: 10000, end: 50000, color: '#3B528B' },
            { start: 50000, end: Infinity, color: '#471164' },
          ],
        }}
        data={data}
        xAccessor={(d) => d[2]}
        yAccessor={(d) => d[0]}
        valueAccessor={(d) => d[3]}
        valueFormatter={(value) => value.toFixed(0.2)}
        xSortPredicate="alphaAsc"
        yAxisLabelName="Year"
        xAxisLabelName="Name"
      />
    </Chart>
  );
};
