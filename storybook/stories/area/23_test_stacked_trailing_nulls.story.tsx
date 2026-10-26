/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, LegendValue, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const xDomain = { min: 0, max: 20 };
const fullSeries = Array.from({ length: 16 }, (_, x) => ({ x, y: 2 + Math.sin(x / 2) }));
const sparseSeries = Array.from({ length: 11 }, (_, x) => ({ x, y: 3 + Math.cos(x / 3) }));
const nullTailSeries = Array.from({ length: 16 }, (_, x) => ({
  x,
  y: x <= 10 ? 1.5 + Math.sin(x / 4) : null,
}));

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description}>
    <Settings
      showLegend
      legendValues={[LegendValue.CurrentAndLastValue]}
      legendPosition={Position.Right}
      baseTheme={useBaseTheme()}
      xDomain={xDomain}
      theme={{
        areaSeriesStyle: {
          point: { visible: 'always' },
        },
      }}
    />
    <Axis id="bottom" position={Position.Bottom} title="x" />
    <Axis id="left" position={Position.Left} title="y" />
    <AreaSeries
      id="full"
      name="Full series"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      stackAccessors={['x']}
      data={fullSeries}
    />
    <AreaSeries
      id="sparse"
      name="Ends 5 x values early"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      stackAccessors={['x']}
      data={sparseSeries}
    />
    <AreaSeries
      id="nulls"
      name="Trailing nulls"
      xScaleType={ScaleType.Linear}
      yScaleType={ScaleType.Linear}
      xAccessor="x"
      yAccessors={['y']}
      stackAccessors={['x']}
      data={nullTailSeries}
    />
  </Chart>
);

Example.parameters = {
  markdown: `Hover **Ends 5 x values early** or **Trailing nulls** in the legend.

The x domain is \`0…20\` (as in Kibana, where the time picker is wider than the data). Both of those series stop at x = 10; the third series only goes to x = 15. No fit function is configured.

Without the fix, the highlighted series line continues across the empty x values. With the fix, it stops at the last real value.`,
};
