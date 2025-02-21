/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select, boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, RectAnnotation, ScaleType, Settings } from '@elastic/charts';
import { Position } from '@elastic/charts/src/utils/common';

import type { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

const getKnobs = () => {
  const enabled = boolean('enable annotation', true);
  let groupId: string | undefined = select(
    'Annotation groupId',
    { group1: 'group1', group2: 'group2', none: 'none' },
    'group1',
  );
  if (groupId === 'none') {
    groupId = undefined;
  }
  const x0 = number('x0', 5);
  const x1 = number('x1', 10);
  const yDefined = boolean('enable y0 and y1 values', false);
  return {
    enabled,
    groupId,
    x0,
    x1,
    y0: yDefined ? number('y0', 0) : undefined,
    y1: yDefined ? number('y1', 3) : undefined,
    outside: boolean('outside', false),
  };
};
export const Example: ChartsStory = (_, { title, description }) => {
  const xAxisKnobs = getKnobs();

  return (
    <Chart title={title} description={description}>
      {xAxisKnobs.enabled && (
        <RectAnnotation
          groupId={xAxisKnobs.groupId}
          id="x axis"
          dataValues={[{ coordinates: xAxisKnobs }]}
          style={{ fill: 'red' }}
          outside={xAxisKnobs.outside}
          outsideDimension={5}
        />
      )}
      <Settings baseTheme={useBaseTheme()} rotation={customKnobs.enum.rotation()} />
      <Axis id="bottom" groupId="group2" position={Position.Bottom} title="Bottom (groupId=group2)" />
      <Axis id="left" groupId="group1" position={Position.Left} title="Left (groupId=group1)" />
      <Axis id="top" groupId="group1" position={Position.Top} title="Top (groupId=group1)" />
      <Axis id="right" groupId="group2" position={Position.Right} title="Right (groupId=group2)" />
      <BarSeries
        id="bars"
        groupId="group1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 5 },
          { x: 5, y: 1 },
          { x: 20, y: 10 },
        ]}
      />
      <BarSeries
        id="bars1"
        groupId="group2"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 61 },
          { x: 5, y: 43 },
          { x: 20, y: 49 },
        ]}
      />
    </Chart>
  );
};
