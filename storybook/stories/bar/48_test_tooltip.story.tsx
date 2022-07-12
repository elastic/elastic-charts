/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, Tooltip, TooltipProps } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';
import {
  getBoundaryKnob,
  getChartRotationKnob,
  getFallbackPlacementsKnob,
  getPlacementKnob,
  getStickToKnob,
  getTooltipTypeKnob,
} from '../utils/knobs';

const CustomTooltip = () => (
  <div
    style={{
      padding: 10,
      height: 40,
      backgroundColor: 'blue',
      color: 'white',
    }}
  >
    My Custom Tooltip
  </div>
);

export const Example = () => {
  const rotation = getChartRotationKnob();
  const tooltipOptions: TooltipProps = {
    stickTo: getStickToKnob('stickTo'),
    placement: getPlacementKnob('Tooltip placement'),
    fallbackPlacements: getFallbackPlacementsKnob(),
    type: getTooltipTypeKnob(),
    boundary: getBoundaryKnob(),
    customTooltip: boolean('Custom Tooltip', false) ? CustomTooltip : undefined,
    offset: number('Tooltip offset', 10, { min: 0, max: 20, range: true, step: 1 }),
  };
  const showAxes = boolean('Show axes', false);
  const showLegend = boolean('Show Legend', false);

  // Added buffer to test tooltip positioning within chart container
  return (
    <div className="buffer" style={{ width: '100%', height: '100%', paddingLeft: 80, paddingRight: 80 }}>
      <Chart>
        <Settings rotation={rotation} showLegend={showLegend} baseTheme={useBaseTheme()} />
        <Tooltip {...tooltipOptions} />

        <Axis id="bottom" hide={!showAxes} position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
        <Axis
          id="left2"
          hide={!showAxes}
          title="Left axis"
          position={Position.Left}
          tickFormat={(d: any) => Number(d).toFixed(2)}
        />

        <BarSeries
          id="bars1"
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y1', 'y2']}
          splitSeriesAccessors={['g']}
          data={TestDatasets.BARCHART_2Y1G}
        />
      </Chart>
    </div>
  );
};
