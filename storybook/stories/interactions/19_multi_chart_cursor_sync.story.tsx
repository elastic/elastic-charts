/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { DateTime } from 'luxon';
import React from 'react';

import {
  Axis,
  Chart,
  Position,
  ScaleType,
  Settings,
  PointerEvent,
  Placement,
  TooltipType,
  LineSeries,
  Heatmap,
} from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { heatmapData, lineChartData1, lineChartData2 } from '../heatmap/constants';

export const Example = () => {
  const ref1 = React.useRef<Chart>(null);
  const ref2 = React.useRef<Chart>(null);
  const ref3 = React.useRef<Chart>(null);

  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
    if (ref1.current) {
      ref1.current.dispatchExternalPointerEvent(event);
    }
    if (ref2.current) {
      ref2.current.dispatchExternalPointerEvent(event);
    }
    if (ref3.current) {
      ref3.current.dispatchExternalPointerEvent(event);
    }
  };
  const baseTheme = useBaseTheme();

  return (
    <>
      <Chart ref={ref1} size={{ height: '30%' }} id="chart1">
        <Settings
          baseTheme={baseTheme}
          theme={{
            chartPaddings: { top: 0, bottom: 0, left: 0, right: 0 },
            chartMargins: { top: 0, bottom: 0, left: 0, right: 0 },
            lineSeriesStyle: { point: { visible: false } },
          }}
          pointerUpdateDebounce={0}
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{ tooltip: { visible: true, placement: Placement.Left } }}
          tooltip={{ type: TooltipType.VerticalCursor }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          timeAxisLayerCount={2}
          tickFormat={(v) => DateTime.fromMillis(v as number).toFormat('dd MMMM HH:mm', { timeZone: 'Europe/Rome' })}
          style={{
            tickLine: { size: 0.0001, padding: 4 },
            tickLabel: {
              alignment: { horizontal: Position.Left, vertical: Position.Bottom },
              padding: 0,
            },
            axisTitle: { visible: false },
          }}
        />
        <Axis
          id="left2"
          ticks={2}
          position={Position.Left}
          style={{
            tickLine: { size: 0 },
            tickLabel: { padding: 4 },
            axisTitle: { visible: false, padding: 0 },
            axisPanelTitle: { visible: false, padding: 0 },
          }}
        />

        <LineSeries
          id="Top"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor="date"
          yAccessors={['value']}
          data={lineChartData1}
          yNice
        />
      </Chart>
      <div style={{ height: 20 }} />
      <Chart ref={ref2} size={{ height: '30%' }} id="chart2">
        <Settings
          baseTheme={baseTheme}
          pointerUpdateDebounce={0}
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{ tooltip: { visible: true, placement: Placement.Left } }}
          tooltip={{ type: TooltipType.VerticalCursor }}
          theme={{
            chartPaddings: { top: 0, bottom: 0, left: 0, right: 0 },
            chartMargins: { top: 0, bottom: 0, left: 0, right: 0 },
            lineSeriesStyle: { point: { visible: false } },
          }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          timeAxisLayerCount={2}
          tickFormat={(v) => DateTime.fromMillis(v as number).toFormat('dd MMMM HH:mm', { timeZone: 'Europe/Rome' })}
          style={{
            tickLine: { size: 0.0001, padding: 4 },
            tickLabel: {
              alignment: { horizontal: Position.Left, vertical: Position.Bottom },
              padding: 0,
            },
          }}
        />
        <Axis
          id="left2"
          position={Position.Left}
          ticks={2}
          style={{
            tickLine: { size: 0 },
            tickLabel: { padding: 4 },
            axisTitle: { visible: false, padding: 0 },
            axisPanelTitle: { visible: false, padding: 0 },
          }}
        />
        <LineSeries
          id="Bottom"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor="date"
          yAccessors={['value']}
          data={lineChartData2}
          yNice
        />
      </Chart>
      <div style={{ height: 20 }} />
      <Chart ref={ref3} size={{ height: '30%' }} id="heatmap">
        <Settings
          baseTheme={baseTheme}
          theme={{
            heatmap: {
              grid: {
                stroke: {
                  color: baseTheme.axes.axisLine.stroke,
                  width: baseTheme.axes.axisLine.strokeWidth,
                },
              },

              cell: {
                border: {
                  stroke: 'transparent',
                  strokeWidth: 0,
                },
              },
              yAxisLabel: {
                width: 32,
                textColor: baseTheme.axes.tickLabel.fill,
                fontSize: baseTheme.axes.tickLabel.fontSize,
                fontFamily: baseTheme.axes.tickLabel.fontFamily,
                fontStyle: baseTheme.axes.tickLabel.fontStyle,
              },
              xAxisLabel: {
                textColor: baseTheme.axes.tickLabel.fill,
                fontSize: baseTheme.axes.tickLabel.fontSize,
                fontFamily: baseTheme.axes.tickLabel.fontFamily,
                fontStyle: baseTheme.axes.tickLabel.fontStyle,
              },
            },
          }}
          pointerUpdateDebounce={0}
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{ tooltip: { visible: true } }}
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
          data={heatmapData}
          xAccessor="time"
          yAccessor="laneLabel"
          valueAccessor="value"
          valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
          xScale={{
            type: ScaleType.Time,
            interval: {
              type: 'fixed',
              unit: 'ms',
              value: 21600000,
            },
          }}
          xAxisLabelFormatter={(v) =>
            DateTime.fromMillis(v as number).toFormat('dd MMMM HH:mm', { timeZone: 'Europe/Rome' })
          }
          timeZone="UTC"
          ySortPredicate="dataIndex"
          yAxisLabelFormatter={(laneLabel) => `${laneLabel}`}
        />
      </Chart>
    </>
  );
};

Example.parameters = {
  markdown: '',
};
