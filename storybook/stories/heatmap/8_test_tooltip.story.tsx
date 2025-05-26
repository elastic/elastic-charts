/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Heatmap, Settings, Tooltip } from '@elastic/charts';
import type { TooltipProps } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const data = [
    {
      agent: 'Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1',
      unifiedY: '',
      value: 674,
    },
    {
      agent: 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24',
      unifiedY: '',
      value: 589,
    },
    {
      agent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)',
      unifiedY: '',
      value: 488,
    },
  ];

  const tooltipOptions: TooltipProps = {
    stickTo: customKnobs.enum.stickTo('stickTo'),
    placement: customKnobs.enum.placement('Tooltip placement'),
  };

  const showXAxisTitle = boolean('Show x axis title', true);
  const showYAxisTitle = boolean('Show y axis title', true);

  const chartWidth = number('chart width', 700, { step: 1, min: 0 });

  return (
    <Chart title={title} description={description} size={[chartWidth ? chartWidth : '100%', 320]}>
      <Settings
        onElementClick={action('onElementClick')}
        showLegend
        legendPosition="right"
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
              visible: false,
            },
          },
        }}
        onBrushEnd={action('onBrushEnd')}
      />
      <Tooltip {...tooltipOptions} />
      <Heatmap
        id="heatmap8"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 500, color: '#AADC32' },
            { start: 500, end: 600, color: '#35B779' },
            { start: 600, end: Infinity, color: '#24868E' },
          ],
        }}
        data={data}
        xAccessor="agent"
        yAccessor="unifiedY"
        valueAccessor="value"
        valueFormatter={(value) => `${Number(value.toFixed(2))}`}
        xSortPredicate="alphaAsc"
        xAxisTitle={showXAxisTitle ? 'Agents' : undefined}
        yAxisTitle={showYAxisTitle ? 'Bytes' : undefined}
        ySortPredicate="dataIndex"
      />
    </Chart>
  );
};

Example.parameters = {
  resize: true,
};
