/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Placement, Position, ScaleType, Settings, timeFormatter } from '@elastic/charts';
import { isDefined } from '@elastic/charts/src/utils/common';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { getChartRotationKnob, getPlacementKnob, getStickToKnob } from '../utils/knobs';
import { SB_SOURCE_PANEL } from '../utils/storybook';

const dateFormatter = timeFormatter('HH:mm');

const minorGridStyle = { stroke: 'black', strokeWidth: 0.15, opacity: 1 };
const gridStyle = { stroke: 'black', strokeWidth: 0.5, opacity: 1 };
const tickLabelStyle = { fontSize: 11, fontFamily: 'Atkinson Hyperlegible', fill: 'rgba(0,0,0,0.8)' };

export const Example = () => (
  <Chart>
    <Settings
      tooltip={{
        stickTo: getStickToKnob('stickTo'),
        placement: getPlacementKnob('placement', undefined),
        fallbackPlacements: [getPlacementKnob('fallback placement', Placement.LeftStart)].filter(isDefined),
        offset: number('placement offset', 5),
      }}
      baseTheme={useBaseTheme()}
      rotation={getChartRotationKnob()}
    />
    <Axis
      id="bottom"
      title="timestamp per 1 minute"
      position={Position.Bottom}
      showOverlappingTicks={false}
      tickFormat={dateFormatter}
      showGridLines
      gridLine={gridStyle}
      style={{
        tickLine: { size: 0.0001, padding: 6, ...gridStyle },
        axisLine: { stroke: 'magenta', strokeWidth: 10, visible: false },
        tickLabel: { ...tickLabelStyle, alignment: { horizontal: Position.Left, vertical: Position.Bottom } },
        axisTitle: { visible: true },
      }}
      labelFormat={(d) => {
        return `${new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(d)}    `;
      }}
    />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
      position={Position.Left}
      showGridLines
      ticks={4}
      gridLine={minorGridStyle}
      style={{
        tickLine: { ...gridStyle, strokeWidth: 0.2, size: 8, padding: 8 },
        axisLine: { ...gridStyle, visible: false },
        tickLabel: { ...tickLabelStyle },
        axisTitle: { visible: true },
      }}
      tickFormat={(d) => Number(d).toFixed(2)}
    />
    <AreaSeries
      id="area1"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      areaSeriesStyle={{
        area: { fill: 'rgba(96, 146, 192, 1)', opacity: 0.3 },
        line: { stroke: 'rgba(96, 146, 192, 1)', opacity: 1 },
      }}
      data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
    />
  </Chart>
);

// storybook configuration
Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
};
