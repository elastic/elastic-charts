/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  Chart,
  HistogramBarSeries,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// for testing purposes only
export const Example: ChartsStory = (_, { title, description }) => {
  const useLine = boolean('use lines instead of bars', false);
  const multiLayerAxis = boolean('use multilayer time axis', false);
  const oddDomain = boolean('non-round time domain start', false);

  const formatter = timeFormatter(niceTimeFormatByDay(1));

  const binWidthMs = 60000;

  const xDomain = {
    min: KIBANA_METRICS.metrics.kibana_os_load.v1.data[0][0] - (oddDomain ? 217839 : 0),
    max: KIBANA_METRICS.metrics.kibana_os_load.v1.data[0][0] + (oddDomain ? 200000 : 0 ?? binWidthMs - 1),
    minInterval: binWidthMs,
  };

  const Series = useLine ? LineSeries : HistogramBarSeries;

  return (
    <Chart title={title} description={description}>
      <Settings xDomain={xDomain} baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        title="timestamp per 1 minute"
        position={Position.Bottom}
        showOverlappingTicks={!multiLayerAxis}
        tickFormat={formatter}
        timeAxisLayerCount={multiLayerAxis ? 3 : 0}
        style={
          multiLayerAxis
            ? {
                tickLine: { size: 0.0001, padding: 4 },
                tickLabel: { alignment: { horizontal: Position.Left, vertical: Position.Bottom } },
              }
            : {}
        }
      />
      <Axis id="left" title={KIBANA_METRICS.metrics.kibana_os_load.v1.metric.title} position={Position.Left} />
      <Series
        id="series"
        timeZone="local"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 1)}
      />
    </Chart>
  );
};
