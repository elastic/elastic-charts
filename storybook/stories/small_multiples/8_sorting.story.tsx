/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import {
  ScaleType,
  Position,
  Chart,
  Axis,
  GroupBy,
  SmallMultiples,
  Settings,
  BarSeries,
  Predicate,
} from '@elastic/charts';

/**
 * This story is used on VRTs to test the sorting logic of the dataIndex sort predicate
 */
export const Example = () => {
  const data: [string, number][] = [
    ['3', 100],
    ['5', 80],
    ['1', 50],
    ['2', 30],
    ['6', 12],
    ['4', 10],
    ['7', 5],
  ];

  return (
    <Chart>
      <Settings rotation={90} />
      <Axis id="time" title="Day of week" position={Position.Left} />
      <Axis id="y" title="Count of logins" position={Position.Bottom} />

      <GroupBy
        id="h_split"
        by={(spec, datum) => {
          return datum[0];
        }}
        sort={select(
          'Chart sorting',
          {
            ...Predicate,
          },
          Predicate.DataIndex,
        )}
      />
      <SmallMultiples splitVertically="h_split" />

      <BarSeries
        id="Login count"
        name={(si) => {
          return `#logins day ${si.smVerticalAccessorValue}`;
        }}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        timeZone="local"
        xAccessor={() => ''}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
Example.parameters = {
  markdown: `You can sort your small multiples by the \`GroupBy.by\` value in ascending/descending order.
  If the sort is configured with the \`dataIndex\` predicate the small multiples
  will keep the order of the passed data array.`,
};
