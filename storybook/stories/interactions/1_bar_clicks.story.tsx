/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import type { TooltipHeaderFormatter } from '@elastic/charts';
import { Axis, BarSeries, Chart, LegendValue, Position, ScaleType, Settings, Tooltip } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const onElementListeners = {
  onElementClick: action('onElementClick'),
  onElementOver: action('onElementOver'),
  onElementOut: action('onElementOut'),
  onProjectionClick: action('onProjectionClick'),
};

export const Example: ChartsStory = (_, { title, description }) => {
  const useObjectAsX = boolean('use object on x', false);
  const headerFormatter: TooltipHeaderFormatter = ({ value }) => {
    if (value % 2 === 0) {
      return (
        <div>
          <p>special header for even x values</p>
          <p>{value}</p>
        </div>
      );
    }

    return value;
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendValues={[LegendValue.CurrentAndLastValue]}
        baseTheme={useBaseTheme()}
        legendPosition={Position.Right}
        {...onElementListeners}
      />
      <Tooltip headerFormatter={headerFormatter} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars1"
        name="Series 1"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 2, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 7, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: -3, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 6, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
      <BarSeries
        id="bars2"
        name="Series 2"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 3, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 5, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: 4, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 8, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
      <BarSeries
        id="bars3"
        name="Series 3"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 4, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 6, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: 5, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 3, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
      <BarSeries
        id="bars4"
        name="Series 4"
        xScaleType={useObjectAsX ? ScaleType.Ordinal : ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={useObjectAsX ? 'sObj' : 'x'}
        yAccessors={['y']}
        data={[
          { x: 0, y: 5, obj: { from: 10, to: 20 }, sObj: 'from 10 to 20' },
          { x: 1, y: 4, obj: { from: 20, to: 30 }, sObj: 'from 20 to 30' },
          { x: 2, y: 6, obj: { from: 30, to: 40 }, sObj: 'from 30 to 40' },
          { x: 3, y: 7, obj: { from: 40, to: 50 }, sObj: 'from 40 to 50' },
        ]}
      />
    </Chart>
  );
};
