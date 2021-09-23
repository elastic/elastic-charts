/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';
import { debounce } from 'ts-debounce';

import {
  Chart,
  DebugState,
  Heatmap,
  HeatmapStyle,
  niceTimeFormatter,
  RecursivePartial,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { SWIM_LANE_DATA } from '@elastic/charts/src/utils/data_samples/test_anomaly_swim_lane';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const debugState = boolean('Enable debug state', true);
  const dataStateAction = action('DataState');

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
    },
    grid: {
      stroke: {
        color: color('grid stroke color', 'gray', 'Theme'),
      },
    },
    cell: {
      label: {
        visible: boolean('cell label visible', false, 'Theme'),
        minFontSize: number('cell label minFontSize', 10, { range: true, min: 5, max: 20 }, 'Theme'),
        maxFontSize: number('cell label maxFontSize', 10, { range: true, min: 5, max: 20 }, 'Theme'),
        textColor: color('cell label textColor', 'black', 'Theme'),
      },
      border: {
        strokeWidth: number('border strokeWidth', 1, { range: true, min: 1, max: 5 }, 'Theme'),
        stroke: color('border stroke color', 'gray', 'Theme'),
      },
    },
  };

  const logDebugState = debounce(() => {
    if (!debugState) return;

    const statusEl = document.querySelector<HTMLDivElement>('.echChartStatus');

    if (statusEl) {
      const dataState = statusEl.dataset.echDebugState
        ? (JSON.parse(statusEl.dataset.echDebugState) as DebugState)
        : null;
      dataStateAction(dataState);
    }
  }, 100);

  return (
    <Chart>
      <Settings
        onRenderChange={logDebugState}
        showLegend
        legendPosition="right"
        onBrushEnd={action('onBrushEnd')}
        brushAxis="both"
        xDomain={{ min: 1572868800000, max: 1572912000000, minInterval: 1800000 }}
        debugState={debugState}
        theme={{ heatmap }}
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
        data={SWIM_LANE_DATA.map((v) => ({ ...v, time: v.time * 1000 }))}
        xAccessor={(d) => d.time}
        yAccessor={(d) => d.laneLabel}
        valueAccessor={(d) => d.value}
        valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
        ySortPredicate="numAsc"
        xScaleType={ScaleType.Time}
        xAxisLabelFormatter={(value) => {
          return niceTimeFormatter([1572825600000, 1572912000000])(value, { timeZone: 'UTC' });
        }}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `
> __Warning:__ ⚠️ default \`Theme\` styles are overrided by knob controls. Toggling between themes may show incorrect styles.
  `,
};
