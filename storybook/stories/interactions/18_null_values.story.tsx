/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import type { PointerEvent } from '@elastic/charts';
import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  Placement,
  niceTimeFormatter,
  TooltipType,
  LineSeries,
  AreaSeries,
  RectAnnotation,
  Tooltip,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';
import { palettes } from '@elastic/charts/src/utils/themes/colors';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const chartTypes: Record<string, any> = {
  bar: BarSeries,
  line: LineSeries,
  area: AreaSeries,
};

const getSeriesKnob = (group?: string) => {
  const type =
    select<string>(
      'Series type',
      {
        Bar: 'bar',
        Line: 'line',
        Area: 'area',
      },
      'area',
      group,
    ) ?? 'area';
  return chartTypes[type] ?? BarSeries;
};

export const Example: ChartsStory = (_, { title, description }) => {
  const ref1 = React.useRef<Chart>(null);
  const ref2 = React.useRef<Chart>(null);
  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
    if (ref1.current) {
      ref1.current.dispatchExternalPointerEvent(event);
    }
    if (ref2.current) {
      ref2.current.dispatchExternalPointerEvent(event);
    }
  };
  const { data } = KIBANA_METRICS.metrics.kibana_os_load.v1;
  const data1 = KIBANA_METRICS.metrics.kibana_os_load.v1.data;
  const data2 = KIBANA_METRICS.metrics.kibana_os_load.v2.data;

  const TopSeries = getSeriesKnob();
  const BottomSeries = getSeriesKnob();

  const showNullValues = boolean('show null values', true);

  return (
    <>
      <Chart
        title={title}
        description={description}
        className="story-chart"
        ref={ref1}
        size={{ height: '50%' }}
        id="chart1"
      >
        <Settings
          baseTheme={useBaseTheme()}
          onPointerUpdate={pointerUpdate}
          pointerUpdateDebounce={0}
          pointerUpdateTrigger="x"
          externalPointerEvents={{
            tooltip: { visible: true, placement: Placement.Left },
          }}
        />
        <Tooltip type={TooltipType.VerticalCursor} showNullValues={showNullValues} />
        <Axis
          id="bottom"
          position={Position.Bottom}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis
          id="left2"
          ticks={3}
          position={Position.Left}
          tickFormat={(d: any) => (d === null ? 'N/A' : Number(d).toFixed(2))}
        />
        <RectAnnotation
          dataValues={[
            {
              coordinates: { x0: data2[10][0], x1: data2[29][0] },
            },
          ]}
          id="zoomed"
          hideTooltips
        />

        <TopSeries
          id="Top"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data1.slice(2, 35).map((d, i) => {
            if (i === 7 || i === 11 || i === 12) {
              return [d[0], null];
            }
            return d;
          })}
        />
      </Chart>
      <Chart
        title={title}
        description={description}
        className="story-chart"
        ref={ref2}
        size={{ height: '50%' }}
        id="chart2"
      >
        <Settings
          baseTheme={useBaseTheme()}
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{
            tooltip: { visible: true, placement: Placement.Left, boundary: 'chart' },
          }}
        />
        <Tooltip type={TooltipType.VerticalCursor} showNullValues={showNullValues} />
        <Axis
          id="bottom"
          position={Position.Bottom}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis
          id="left2"
          position={Position.Left}
          ticks={3}
          tickFormat={(d: any) => (d === null ? 'N/A' : Number(d).toFixed(2))}
          domain={{ min: 5, max: 20 }}
        />

        <BottomSeries
          id="Bottom"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data2.slice(10, 30).map((d, i) => {
            if (i === 4 || i === 10) {
              return [d[0], null];
            }
            return d;
          })}
          color={palettes.echPaletteForLightBackground.colors[0]}
        />
      </Chart>
    </>
  );
};
