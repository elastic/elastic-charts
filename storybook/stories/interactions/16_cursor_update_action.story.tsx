/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  PointerEvent,
  Placement,
  niceTimeFormatter,
  TooltipType,
  LineSeries,
  AreaSeries,
  Tooltip,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';
import { palettes } from '@elastic/charts/src/utils/themes/colors';

import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

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
      'bar',
      group,
    ) ?? 'bar';
  return chartTypes[type] ?? BarSeries;
};

export const Example = () => {
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

  const group1 = 'Top Chart';
  const group2 = 'Bottom Chart';

  const TopSeries = getSeriesKnob(group1);
  const BottomSeries = getSeriesKnob(group2);
  const topType = customKnobs.enum.tooltipType('local tooltip type', TooltipType.VerticalCursor, { group: group1 });
  const bottomType = customKnobs.enum.tooltipType('local tooltip type', TooltipType.VerticalCursor, { group: group2 });
  const topVisible = boolean('enable external tooltip', true, group1);
  const bottomVisible = boolean('enable external tooltip', true, group2);
  const topPlacement = customKnobs.enum.placement('external tooltip placement', Placement.Left, { group: group1 });
  const bottomPlacement = customKnobs.enum.placement('external tooltip placement', Placement.Left, { group: group2 });

  const debounceDelay = number('pointer update debounce', 20, { min: 0, max: 200, step: 10 });
  const trigger =
    select(
      'pointer update trigger',
      {
        'Only x': 'x',
        'Only y': 'y',
        'Both x and y': 'both',
      },
      'x',
    ) ?? 'x';

  return (
    <>
      <Chart ref={ref1} size={{ height: '50%' }} id="chart1">
        <Settings
          showLegend
          legendExtra="lastBucket"
          baseTheme={useBaseTheme()}
          onPointerUpdate={pointerUpdate}
          pointerUpdateDebounce={debounceDelay}
          pointerUpdateTrigger={trigger}
          externalPointerEvents={{
            tooltip: { visible: topVisible, placement: topPlacement },
          }}
        />
        <Tooltip type={topType} />

        <Axis
          id="bottom"
          position={Position.Bottom}
          title={`External tooltip visible: ${topVisible} - boundary: scroll parent`}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis id="left2" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

        <TopSeries
          id="Top"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data1.slice(3, 60)}
        />
      </Chart>
      <Chart ref={ref2} size={{ height: '50%' }} id="chart2">
        <Settings
          showLegend
          legendExtra="lastBucket"
          onPointerUpdate={pointerUpdate}
          externalPointerEvents={{
            tooltip: { visible: bottomVisible, placement: bottomPlacement, boundary: 'chart' },
          }}
        />
        <Tooltip type={bottomType} />
        <Axis
          id="bottom"
          position={Position.Bottom}
          title={`External tooltip visible: ${bottomVisible} - boundary: chart`}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis
          id="left2"
          position={Position.Left}
          tickFormat={(d: any) => Number(d).toFixed(2)}
          domain={{ min: 5, max: 20 }}
        />

        <BottomSeries
          id="Bottom"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Sqrt}
          xAccessor={0}
          yAccessors={[1]}
          data={data2.slice(10)}
          color={palettes.echPaletteForLightBackground.colors[0]}
        />
      </Chart>
    </>
  );
};

Example.parameters = {
  markdown: 'Sends an event every time the cursor changes. This is provided to sync cursors between multiple charts.',
};
