/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select, color, number, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Heatmap,
  HeatmapStyle,
  niceTimeFormatter,
  RecursivePartial,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { DATA_6 } from '@elastic/charts/src/utils/data_samples/test_dataset_heatmap';

import { AxisStyle } from '../../../packages/charts/src/utils/themes/theme';
import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';

export const Example: ChartsStory = (_, { title, description }) => {
  const debugState = boolean('Enable debug state', true);
  const axes: RecursivePartial<AxisStyle> = {
    axisTitle: {
      fontSize: number('axisTitle fontSize', 12, { range: true, min: 5, max: 20 }, 'Axis Title'),
      fontFamily: 'sans-serif',
      fill: color('axisTitle textColor', 'black', 'Axis Title'),
      padding: {
        inner: number('axisTitle inner pad', 8, { range: true, min: 0, max: 20 }, 'Axis Title'),
        outer: number('axisTitle outer pad', 8, { range: true, min: 0, max: 20 }, 'Axis Title'),
      },
    },
  };

  const yAxisLabelWidthType = select('yAxisLabel width type', ['auto', 'static', 'max'], 'auto', 'Theme');
  const yAxisLabelWidthSize = number('yAxisLabel width max/static', 100, { min: 0, max: 200, step: 1 }, 'Theme');

  const heatmap: RecursivePartial<HeatmapStyle> = {
    brushArea: {
      visible: boolean('brushArea visible', true, 'Theme'),
      fill: color('brushArea fill', 'black', 'Theme'),
      stroke: color('brushArea stroke', '#69707D', 'Theme'),
      strokeWidth: number('brushArea strokeWidth', 2, { range: true, min: 1, max: 10 }, 'Theme'),
    },
    brushMask: {
      visible: boolean('brushMask visible', true, 'Theme'),
      fill: color('brushMask fill', 'rgb(115 115 115 / 50%)', 'Theme'),
    },
    brushTool: {
      visible: boolean('brushTool visible', false, 'Theme'),
      fill: color('brushTool fill color', 'gray', 'Theme'),
    },
    xAxisLabel: {
      visible: boolean('xAxisLabel visible', true, 'Theme'),
      fontSize: number('xAxisLabel fontSize', 12, { range: true, min: 5, max: 20 }, 'Theme'),
      textColor: color('xAxisLabel textColor', 'black', 'Theme'),
      padding: number('xAxisLabel padding', 6, { range: true, min: 0, max: 15 }, 'Theme'),
    },
    yAxisLabel: {
      visible: boolean('yAxisLabel visible', true, 'Theme'),
      fontSize: number('yAxisLabel fontSize', 12, { range: true, min: 5, max: 20 }, 'Theme'),
      textColor: color('yAxisLabel textColor', 'black', 'Theme'),
      padding: number('yAxisLabel padding', 5, { range: true, min: 0, max: 15 }, 'Theme'),
      width:
        yAxisLabelWidthType === 'static'
          ? yAxisLabelWidthSize
          : yAxisLabelWidthType === 'max'
          ? { max: yAxisLabelWidthSize }
          : 'auto',
    },
    grid: {
      stroke: {
        color: color('grid stroke color', 'gray', 'Theme'),
        width: number('grid stroke width', 1, { range: true, min: 0, max: 10, step: 1 }, 'Theme'),
      },
    },
    cell: {
      label: {
        visible: boolean('cell label visible', false, 'Theme'),
        textColor: color('cell label textColor', 'black', 'Theme'),
        useGlobalMinFontSize: boolean('cell label use global min fontSize', true, 'Theme'),
        minFontSize: number('cell label min fontSize', 6, { step: 1, min: 4, max: 10, range: true }, 'Theme'),
        maxFontSize: number('cell label max fontSize', 12, { step: 1, min: 10, max: 64, range: true }, 'Theme'),
      },
      border: {
        strokeWidth: number('border strokeWidth', 0, { range: true, min: 0, max: 5 }, 'Theme'),
        stroke: color('border stroke color', 'gray', 'Theme'),
      },
    },
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        onRenderChange={getDebugStateLogger(debugState)}
        showLegend
        legendPosition="right"
        onBrushEnd={action('onBrushEnd')}
        brushAxis="both"
        xDomain={{ min: 1572868800000, max: 1572912000000, minInterval: 1800000 }}
        debugState={debugState}
        theme={{ axes, heatmap }}
        baseTheme={useBaseTheme()}
      />
      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 3.5, color: '#d2e9f7' },
            { start: 3.5, end: 25, color: '#8bc8fb' },
            { start: 25, end: 50, color: '#fdec25' },
            { start: 50, end: 75, color: '#fba740' },
            { start: 75, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={DATA_6.data}
        xAccessor="x"
        yAccessor="y"
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
        ySortPredicate="numAsc"
        xScale={{ type: ScaleType.Time, interval: DATA_6.interval }}
        xAxisLabelFormatter={(value) => {
          return niceTimeFormatter([1572825600000, 1572912000000])(value, { timeZone: 'UTC' });
        }}
        xAxisTitle={text('xAxisTitle', 'xAxis', 'Axis Title')}
        yAxisTitle={text('yAxisTitle', 'yAxis', 'Axis Title')}
        timeZone={DATA_6.timeZone}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `
> __Warning:__ ⚠️ default \`Theme\` styles are overrided by knob controls. Toggling between themes may show incorrect styles.
  `,
};
