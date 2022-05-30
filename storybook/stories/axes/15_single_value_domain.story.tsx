/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { LineSeries, Chart, ScaleType, Settings, Axis, Position } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="y" position={Position.Left} domain={{ min: 10, max: 10 }} />
      <Axis id="x" position={Position.Bottom} />
      <LineSeries
        id="area"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={[[10, 10]]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `A series with a single datapoint doesn't have enough data to compute the horizontal x domain.
        In this case the chart should render the data point at the middle of the axis.
        The same should happen on the Y axis if the domain is configured to be limited to a single value, as in this example.
        It should show the full scale from the baseline to the Y value if the domain is automatically computed.
`,
};
