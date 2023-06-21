/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React from 'react';

import {
  Axis,
  Chart,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  HistogramBarSeries,
  BrushEndListener,
} from '@elastic/charts';
import { isVerticalRotation } from '@elastic/charts/src/chart_types/xy_chart/state/utils/common';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

export const Example: ChartsStory = (_, { title, description }) => {
  const rotation = customKnobs.enum.rotation();
  const isVertical = isVerticalRotation(rotation);
  const now = DateTime.fromISO('2019-01-11T00:00:00.000').setZone('utc+1').toMillis();
  const oneDay = 1000 * 60 * 60 * 24;
  const dateFormatter = niceTimeFormatter([now, now + oneDay * 5]);
  const numberFormatter = (d: any) => Number(d).toFixed(2);
  const brushEndListener: BrushEndListener = ({ x }) => {
    if (!x) {
      return;
    }
    action('onBrushEnd')(dateFormatter(x[0]), dateFormatter(x[1]));
  };
  return (
    <Chart title={title} description={description}>
      <Settings
        baseTheme={useBaseTheme()}
        debug={boolean('debug', false)}
        onBrushEnd={brushEndListener}
        onElementClick={action('onElementClick')}
        rotation={customKnobs.enum.rotation()}
        roundHistogramBrushValues={boolean('roundHistogramBrushValues', false)}
        allowBrushingLastHistogramBin={boolean('allowBrushingLastHistogramBin', true)}
      />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="bottom"
        showOverlappingTicks
        tickFormat={!isVertical ? dateFormatter : numberFormatter}
      />
      <Axis id="left" title="left" position={Position.Left} tickFormat={isVertical ? dateFormatter : numberFormatter} />

      <HistogramBarSeries
        id="bars"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        timeZone="Europe/Rome"
        data={[
          { x: now, y: 2 },
          { x: now + oneDay, y: 7 },
          { x: now + oneDay * 2, y: 3 },
          { x: now + oneDay * 5, y: 6 },
        ]}
      />
    </Chart>
  );
};
