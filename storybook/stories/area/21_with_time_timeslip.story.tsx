/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings, AxisSpec } from '@elastic/charts';
import { mergePartial } from '@elastic/charts/src/utils/common';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const minorGridStyle = { stroke: 'black', strokeWidth: 0.15, opacity: 1 };
const gridStyle = { stroke: 'black', strokeWidth: 0.5, opacity: 1 };
const fontFamily = '"Atkinson Hyperlegible"';
const tickLabelStyle = { fontSize: 11, fontFamily, fill: 'rgba(0,0,0,0.8)' };
const axisTitleColor = 'rgb(112,112,112)';
const axisTitleFontSize = 15;
const dataInk = 'rgba(96, 146, 192, 1)';

const tooltipDateFormatter = (d: any) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);

const xAxisStyle: AxisSpec['style'] = {
  tickLine: { size: 0.0001, padding: -6, ...gridStyle },
  axisLine: { stroke: 'magenta', strokeWidth: 10, visible: false },
  tickLabel: {
    ...tickLabelStyle,
    alignment: { horizontal: Position.Left, vertical: Position.Bottom },
    padding: 0,
    offset: { x: 0, y: 0 },
  },
  axisTitle: { visible: false, fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
};

const data = KIBANA_METRICS.metrics.kibana_os_load[0].data;
const t0 = data[0][0];
const t1 = data[data.length - 1][0];

export const Example = () => {
  const whiskers = boolean('X axis minor whiskers', true);
  const shortWhiskers = boolean('Shorter X axis minor whiskers', true);
  const minorGridLines = boolean('Minor grid lines', true);
  const horizontalAxisTitle = boolean('Horizontal axis title', false);
  // const chartWidth = document.querySelector('.echContainer')?.getBoundingClientRect().width ?? 0;
  const topAxisLabelFormat = (d: any) =>
    `${whiskers ? ' ' : ''}${new Intl.DateTimeFormat('en-US', { minute: 'numeric' }).format(d).padStart(2, '0')}′  `;
  const yAxisTitle = 'CPU utilization';
  const timeZoom =
    0 ||
    number('Time zoom', data.length, {
      range: true,
      min: 0,
      max: data.length,
      step: 1,
    });
  const timeStretch =
    0 ||
    number('Stretch time', -0.4, {
      range: true,
      min: -20,
      max: 18,
      step: 0.2,
    });
  const timeShift =
    0 ||
    number('Shift time', 0, {
      range: true,
      min: -10,
      max: 10,
      step: 0.05,
    });

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis
        id="x_minor"
        position={Position.Bottom}
        showOverlappingTicks={boolean('showOverlappingTicks time axis', false)}
        showOverlappingLabels={boolean('showOverlappingLabels time axis', false)}
        ticks={30}
        showGridLines={minorGridLines}
        gridLine={mergePartial(gridStyle, { strokeWidth: 0.1 })}
        style={mergePartial(
          xAxisStyle,
          whiskers
            ? {
                axisLine: { stroke: dataInk, strokeWidth: 1, visible: true },
                tickLine: { size: shortWhiskers ? 6 : 16, padding: shortWhiskers ? 0 : -10, ...minorGridStyle },
                axisTitle: { visible: true, fontFamily },
              }
            : { tickLine: { padding: 6 }, axisTitle: { visible: true, fontFamily } },
        )}
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
        gridLine={minorGridStyle}
        style={{
          tickLine: { ...gridStyle, strokeWidth: 0.2, size: 8, padding: 4 },
          axisLine: { ...gridStyle, visible: false },
          tickLabel: { ...tickLabelStyle },
          axisTitle: { visible: !horizontalAxisTitle, fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
        }}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      <AreaSeries
        id="Utilization"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        yNice
        color={dataInk}
        areaSeriesStyle={{ area: { opacity: 0.3 }, line: { opacity: 1 } }}
        data={data
          .slice(0, timeZoom)
          .map(([t, v]) => [t0 + (t - t0) * 4 * 2 ** timeStretch - (t1 - t0) * 2 ** timeStretch * timeShift, v])}
      />
    </Chart>
  );
};

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
