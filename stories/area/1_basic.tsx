/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Chart, ScaleType } from '../../packages/charts/src';
import { KIBANA_METRICS } from '../../packages/charts/src/utils/data_samples/test_dataset_kibana';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => {
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
  return (
    <Chart className="story-chart">
      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};

// storybook configuration
Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
  },
};
