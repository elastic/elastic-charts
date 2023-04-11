/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, LineSeries, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const toggleSpec = boolean('toggle line spec', true);
  const data1 = KIBANA_METRICS.metrics.kibana_os_load.v1.data;
  const data2 = data1.map((datum) => [datum[0]!, datum[1]! - 1]);
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'lines1' : 'lines2';

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <LineSeries
        id={specId}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
