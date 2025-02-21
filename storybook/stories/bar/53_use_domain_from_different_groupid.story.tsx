/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Settings, Chart, Position, ScaleType, DEFAULT_GLOBAL_ID } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const data1 = [
    [1, 1],
    [2, 2],
  ];
  const data2 = [
    [1, 1],
    [2, 5],
  ];
  const data3 = [
    [1, 1],
    [2, 9],
  ];
  const groupId1 = select(
    'groupId used on blue series',
    {
      default: DEFAULT_GLOBAL_ID,
      group1: 'group1',
      group2: 'group2',
    },
    'group2',
  );

  const groupId2 = select(
    'groupId used on red series',
    {
      default: DEFAULT_GLOBAL_ID,
      group1: 'group1',
      group2: 'group2',
    },
    'group2',
  );

  return (
    <Chart title={title} description={description} renderer="canvas">
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="bottom" position={Position.Bottom} />
      <Axis id="left y" title="GREEN" position={Position.Right} />
      <Axis id="right 1 y" groupId={groupId1} title="BLUE" position={Position.Right} />
      <Axis id="right 2 y" groupId={groupId2} title="RED" position={Position.Right} />
      <BarSeries
        id="stacked bar 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data1}
      />
      <BarSeries
        id="stacked bar 2"
        groupId={groupId1}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data2}
      />

      <BarSeries
        id="stacked bar A"
        groupId={groupId2}
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
  markdown: `You can specify a \`groupId\` in the \`useDefaultGroupDomain\` prop.
This will allows you to match and merge the data domain of two different groups and reuse it on multiple series group.
      `,
};
