/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Settings, Chart, Position, ScaleType } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const data1 = [
    [1, 2],
    [2, 2],
    [3, 3],
    [4, 5],
  ];
  const data2 = [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ];
  const data3 = [
    [1, 6],
    [2, 6],
    [3, 3],
    [4, 2],
  ];
  const data4 = [
    [1, 2],
    [2, 6],
    [3, 2],
    [4, 9],
  ];
  const data5 = [
    [1, 1],
    [2, 7],
    [3, 5],
    [4, 6],
  ];
  const useDifferentGroup = boolean('Apply a different groupId to some series', false);
  const useDefaultDomain = boolean('Use the same data domain for each group', false);

  return (
    <Chart title={title} description={description} renderer="canvas">
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis
        id="left y"
        title="Default groupId"
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />
      <Axis
        id="right y"
        groupId={useDifferentGroup && !useDefaultDomain ? 'otherGroupId' : undefined}
        title={useDifferentGroup ? 'Other groupId' : 'Default groupId'}
        position={Position.Right}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />
      <BarSeries
        id="stacked bar 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={data1}
      />
      <BarSeries
        id="stacked bar 2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={data2}
      />

      <BarSeries
        id="stacked bar A"
        groupId={useDifferentGroup ? 'otherGroupId' : undefined}
        useDefaultGroupDomain={useDefaultDomain}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={data4}
      />
      <BarSeries
        id="stacked bar B"
        groupId={useDifferentGroup ? 'otherGroupId' : undefined}
        useDefaultGroupDomain={useDefaultDomain}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        stackAccessors={[0]}
        data={data5}
      />
      <BarSeries
        id="non stacked bar"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data3}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `You can group together series specifying a \`groupId\` prop on the series.
In the case of barchart, series with the same \`groupId\` will be grouped and eventually stacked together.

The data Y domain of each group, specified by \`groupId\`, is computed independently. This is reflected also on the rendering
where the Y value position is scaled independently on the Y axis from the other groups. An axis with the same \`groupId\`
will reflect that scale.

Use \`useDefaultGroupDomain\` if the same domain is required on every series. If you sent a \`boolean\` value, it will use
the group id applied by default on every series with no specific groupId. You can also pass a \`string\` to use a different \`groupId\`
see next storybook example.
      `,
};
