/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

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
  Tooltip,
} from '@elastic/charts';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const rng = getRandomNumberGenerator('static');

const aggData = [
  ...KIBANA_METRICS.metrics.kibana_os_load.v1.data
    .reduce<{ x: number; y: string; value: number }[]>((acc, [x, y], i) => {
      if (i % 5 === 0) {
        acc.push({ x, y: '2fd4e', value: y });
      } else {
        acc.at(-1).value += y;
      }

      return acc;
    }, [])
    .map(({ x, y, value }) => (rng() > 0.6 ? { x, y, value: null } : { x, y, value })),
  ...KIBANA_METRICS.metrics.kibana_os_load.v2.data
    .reduce<{ x: number; y: string; value: number }[]>((acc, [x, y], i) => {
      if (i % 5 === 0) {
        acc.push({ x, y: '3afad', value: y });
      } else {
        acc.at(-1).value += y;
      }

      return acc;
    }, [])
    .map(({ x, y, value }) => (rng() > 0.6 ? { x, y, value: null } : { x, y, value })),
  ...KIBANA_METRICS.metrics.kibana_os_load.v3.data
    .reduce<{ x: number; y: string; value: number }[]>((acc, [x, y], i) => {
      if (i % 5 === 0) {
        acc.push({ x, y: 'f9560', value: y });
      } else {
        acc.at(-1).value += y;
      }

      return acc;
    }, [])
    .map(({ x, y, value }) => (rng() > 0.6 ? { x, y, value: null } : { x, y, value })),
];

export const Example = () => {
  const ref1 = React.useRef<Chart>(null);
  const ref2 = React.useRef<Chart>(null);
  const ref3 = React.useRef<Chart>(null);

  const pointerUpdate = (event: PointerEvent) => {
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
      <div style={{ paddingLeft: 52 }}>Response times</div>
      <Chart ref={ref1} size={{ height: '30%' }} id="chart1">
        <Settings
          baseTheme={baseTheme}
          theme={{
            chartPaddings: { top: 0, bottom: 0, left: 0, right: 0 },
            chartMargins: { top: 0, bottom: 0, left: 16, right: 0 },
            lineSeriesStyle: { point: { visible: false } },
          }}
          pointerUpdateDebounce={0}
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{ tooltip: { visible: true, placement: Placement.Left } }}
        />
        <Tooltip type={TooltipType.VerticalCursor} placement={Placement.Left} stickTo={Position.Top} />
        <Axis
          id="bottom"
          position={Position.Bottom}
          timeAxisLayerCount={2}
          tickFormat={(v) => DateTime.fromMillis(v as number).toFormat('dd MMMM HH:mm:ss', { timeZone: 'Europe/Rome' })}
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
          tickFormat={(d) => `${d / 1000}s`}
          style={{
            tickLine: { size: 0 },
            tickLabel: { padding: 4 },
            axisTitle: { visible: false, padding: 0 },
            axisPanelTitle: { visible: false, padding: 0 },
          }}
        />

        <LineSeries
          id="Response time"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_response_times.v1.data}
          yNice
          color="#343741"
        />
      </Chart>
      <div style={{ paddingLeft: 52, height: 30, lineHeight: '30px' }}>Number of requests</div>
      <Chart ref={ref2} size={{ height: '30%' }} id="chart2">
        <Settings
          baseTheme={baseTheme}
          pointerUpdateDebounce={0}
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{ tooltip: { visible: true, placement: Placement.Left } }}
          theme={{
            chartPaddings: { top: 0, bottom: 0, left: 0, right: 0 },
            chartMargins: { top: 0, bottom: 0, left: 16, right: 0 },
            lineSeriesStyle: { point: { visible: false } },
          }}
        />
        <Tooltip type={TooltipType.VerticalCursor} placement={Placement.Left} stickTo={Position.Top} />
        <Axis
          id="bottom"
          position={Position.Bottom}
          timeAxisLayerCount={2}
          tickFormat={(v) => DateTime.fromMillis(v as number).toFormat('dd MMMM HH:mm:ss', { timeZone: 'Europe/Rome' })}
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
          id="# Requests"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_requests.v1.data}
          color="#343741"
          yNice
        />
      </Chart>
      <div style={{ paddingLeft: 52, height: 30, lineHeight: '30px' }}>Memory pressure</div>
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
                width: 50,
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
          id="CPU temp"
          colorScale={{
            type: 'bands',
            bands: [
              { start: -Infinity, end: 40, color: '#ffffb2' },
              { start: 40, end: 50, color: '#fed976' },
              { start: 50, end: 60, color: '#feb24c' },
              { start: 60, end: 70, color: '#fd8d3c' },
              { start: 70, end: 80, color: '#fc4e2a' },
              { start: 80, end: 90, color: '#e31a1c' },
              { start: 90, end: Infinity, color: '#b10026' },
            ],
          }}
          data={aggData}
          xAccessor="x"
          yAccessor="y"
          valueAccessor="value"
          valueFormatter={(d) => `${Number(d.toFixed(1))}℃`}
          xScale={{
            type: ScaleType.Time,
            interval: {
              type: 'fixed',
              unit: 'ms',
              value: aggData[1].x - aggData[0].x,
            },
          }}
          xAxisLabelFormatter={(v) =>
            DateTime.fromMillis(v as number).toFormat('dd MMMM HH:mm:ss', { timeZone: 'Europe/Rome' })
          }
          xAxisLabelName="time"
          yAxisLabelName="cluster"
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
