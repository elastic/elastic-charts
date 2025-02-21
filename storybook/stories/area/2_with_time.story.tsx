/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { number } from '@storybook/addon-knobs';
import React from 'react';

import {
  AreaSeries,
  Axis,
  Chart,
  Placement,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
  Tooltip,
} from '@elastic/charts';
import { isDefined } from '@elastic/charts/src/utils/common';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

const dateFormatter = timeFormatter('HH:mm');

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings baseTheme={useBaseTheme()} rotation={customKnobs.enum.rotation()} />
    <Tooltip
      stickTo={customKnobs.enum.stickTo('stickTo')}
      placement={customKnobs.enum.placement('placement', undefined)}
      fallbackPlacements={[customKnobs.enum.placement('fallback placement', Placement.LeftStart)].filter(isDefined)}
      offset={number('placement offset', 5)}
    />
    <Axis
      id="bottom"
      title="timestamp per 1 minute"
      position={Position.Bottom}
      showOverlappingTicks
      tickFormat={dateFormatter}
    />
    <Axis
      id="left"
      title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title}
      position={Position.Left}
      tickFormat={(d) => Number(d).toFixed(2)}
    />
    <AreaSeries
      id="area1"
      xScaleType={ScaleType.Time}
      yScaleType={ScaleType.Linear}
      xAccessor={0}
      yAccessors={[1]}
      data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
    />
  </Chart>
);
