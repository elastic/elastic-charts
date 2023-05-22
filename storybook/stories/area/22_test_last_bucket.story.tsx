/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, BarSeries, Chart, HistogramBarSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';
import { TIME_SERIES_DATASET } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana_2';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const fontFamily = '"Atkinson Hyperlegible"';
const tickLabelStyle = { fontSize: 11, fontFamily };
const axisTitleColor = 'rgb(112,112,112)';
const axisTitleFontSize = 15;
const dataInk = 'rgba(96, 146, 192, 1)';
const horizontalGridLineStyle = { stroke: 'black', strokeWidth: 0.15, opacity: 1 };

const tooltipDateFormatter = (d: any) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);

const data = KIBANA_METRICS.metrics.kibana_os_load.v1.data;
const t0 = data[0][0];
const t1 = data[data.length - 1][0];

const topAxisLabelFormat = (d: any) =>
  `${new Intl.DateTimeFormat('en-US', { minute: 'numeric' }).format(d).padStart(2, '0')}′  `;

export const Example = () => {
  const showLegend = boolean('Show legend', true);
  const minorGridLines = true;
  const horizontalAxisTitle = true;
  const yAxisTitle = 'CPU utilization';
  console.log(TIME_SERIES_DATASET[TIME_SERIES_DATASET.length - 1]);
  return (
    <Chart>
      <Settings
        showLegend={showLegend}
        legendExtra="avg"
        baseTheme={useBaseTheme()}
        theme={{ axes: { tickLine: { visible: true } } }}
        xDomain={{
          min: 1684188000000,
          max: 1684321199999,
        }}
      />
      <Axis
        id="x_minor"
        position={boolean('Top X axis', false) ? Position.Top : Position.Bottom}
        showOverlappingTicks={boolean('showOverlappingTicks time axis', false)}
        showOverlappingLabels={boolean('showOverlappingLabels time axis', false)}
        showGridLines={minorGridLines}
        style={{
          axisLine: { stroke: dataInk },
          tickLine: { size: 0.0001, padding: 4 },
          tickLabel: {
            ...tickLabelStyle,
            alignment: { horizontal: Position.Left, vertical: Position.Bottom },
            padding: 0,
            offset: { x: 0, y: 0 },
          },
          axisTitle: { fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
        }}
        tickFormat={tooltipDateFormatter}
        labelFormat={topAxisLabelFormat}
        title="time (1-minute measurements)"
        timeAxisLayerCount={number('layerCount', 3, { range: true, min: 0, max: 3, step: 1 })}
      />
      <Axis
        id="left"
        title={yAxisTitle}
        position={Position.Left}
        showGridLines
        ticks={4}
        gridLine={horizontalGridLineStyle}
        style={{
          tickLine: { ...horizontalGridLineStyle, size: 8, padding: 4 },
          axisLine: { visible: false },
          tickLabel: tickLabelStyle,
          axisTitle: { visible: !horizontalAxisTitle, fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
        }}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      <AreaSeries
        id="CPU Utilization"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        yNice
        color={dataInk}
        // areaSeriesStyle={{ area: { opacity: 0.3 }, line: { opacity: 1 } }}
        data={TIME_SERIES_DATASET}
        // data={data
        //   .slice(0, timeZoom)
        //   .map(([t, v]) => [t0 + (t - t0) * 4 * 2 ** timeStretch - (t1 - t0) * 2 ** timeStretch * timeShift, v])}
      />
    </Chart>
  );
};

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
