/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';
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

const xAxisStyle = {
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

const midAxisLabelFormatter = (d: any) => {
  return `${new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(d).padStart(2, '0')}  `;
};
const bottomAxisLabelFormatter = (d: any) => {
  return `${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)}  `;
};

export const Example = () => {
  const whiskers = boolean('X axis whiskers', true);
  const topAxisLabelFormat = (d: any) => {
    // const chartWidth = document.querySelector('.echContainer')?.getBoundingClientRect().width ?? 0;
    return `${whiskers ? ' ' : ''}${new Intl.DateTimeFormat('en-US', { minute: 'numeric' })
      .format(d)
      .padStart(2, '0')}′  `;
  };
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis
        id="top"
        title="CPU % of Bootstrap"
        position={Position.Top}
        tickFormat={() => ''}
        ticks={0}
        showGridLines
        gridLine={gridStyle}
        style={mergePartial(xAxisStyle, {
          axisTitle: { visible: true, fontFamily, fontSize: 24, fill: 'grey' },
          tickLabel: { padding: 4 },
        })}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        showOverlappingTicks={false}
        tickFormat={topAxisLabelFormat}
        ticks={100}
        showGridLines
        gridLine={mergePartial(gridStyle, { strokeWidth: 0.1 })}
        style={mergePartial(
          xAxisStyle,
          whiskers
            ? {
                axisLine: { stroke: dataInk, strokeWidth: 1, visible: true },
                tickLine: { size: 16, padding: -10, ...minorGridStyle },
              }
            : { tickLine: { padding: 6 } },
        )}
        labelFormat={topAxisLabelFormat}
      />
      <Axis
        id="bottom2"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks={false}
        showDuplicatedTicks={false}
        tickFormat={midAxisLabelFormatter}
        ticks={1}
        showGridLines
        gridLine={gridStyle}
        style={mergePartial(xAxisStyle, {
          tickLabel: {
            padding: 0,
            offset: { x: 0, y: 0 },
          },
          tickLine: { size: 0.0001, padding: -6, ...gridStyle },
        })}
        labelFormat={midAxisLabelFormatter}
      />
      <Axis
        id="bottom3"
        title="time (1-minute measurements)"
        position={Position.Bottom}
        showOverlappingTicks={false}
        showDuplicatedTicks={false}
        tickFormat={bottomAxisLabelFormatter}
        ticks={2}
        showGridLines
        gridLine={gridStyle}
        style={mergePartial(xAxisStyle, {
          axisTitle: { visible: true, fontFamily },
        })}
        labelFormat={bottomAxisLabelFormatter}
      />
      <Axis
        id="left"
        title="CPU utilization"
        position={Position.Left}
        showGridLines
        ticks={4}
        gridLine={minorGridStyle}
        style={{
          tickLine: { ...gridStyle, strokeWidth: 0.2, size: 8, padding: 8 },
          axisLine: { ...gridStyle, visible: false },
          tickLabel: { ...tickLabelStyle },
          axisTitle: { visible: true, fontFamily, fill: axisTitleColor, fontSize: axisTitleFontSize },
        }}
        tickFormat={(d) => `${Number(d).toFixed(0)}%`}
      />
      <AreaSeries
        id="area1"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        yNice
        areaSeriesStyle={{
          area: { fill: dataInk, opacity: 0.3 },
          line: { stroke: dataInk, opacity: 1 },
        }}
        data={data.map(([t, v]) => [t0 + (t - t0) * 4, v])}
      />
    </Chart>
  );
};

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
