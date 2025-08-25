/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { BarSeries, Chart, ScaleType, Settings } from '@elastic/charts';
import { useBaseTheme } from '@ech/sb';
// import { text, select, boolean, resetKnobs } from '../../controls++/knobs';
// import type { ChartsStory } from '../../types';

export const Component = (args: any, { chartProps, ...context }: any) => {
  // export const Component: ChartsStory = (args, { title, description }) => {
  const { toggleBarSpec = true } = args;
  // text('text', 'default');

  const data1 = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleBarSpec ? data1 : data2;
  const specId = toggleBarSpec ? 'bars1' : 'bars2';

  console.log(context);

  return (
    <Chart {...chartProps}>
      <Settings baseTheme={useBaseTheme()} />
      <BarSeries
        id={specId}
        name="Simple bar series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};

export const Component2 = (args: any, { chartProps, ...context }: any) => {
  // export const Component: ChartsStory = (args, { title, description }) => {
  const { toggleBarSpec = true } = args;
  // text('text', 'default');

  const data1 = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleBarSpec ? data1 : data2;
  const specId = toggleBarSpec ? 'bars1' : 'bars2';

  console.log(context);

  return (
    <Chart {...chartProps}>
      <Settings baseTheme={useBaseTheme()} />
      <BarSeries
        id={specId}
        name="Simple bar series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};

// TODO type Meta with params
const meta = {
  title: 'Specifications/Bar',
  component: Component,
  // parameters: {
  //   backgrounds: {
  //     disable: true,
  //   },
  // },
  argTypes: {
    prop1: {
      type: "boolean",
      table: {
        category: "foo",
        // subcategory: "bar",
      },
    },
    toggleBarSpec: {
      control: { type: 'boolean' },
      description: 'Toggle between two different bar specifications',
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // onClick: fn(),
    toggleBarSpec: true,
  },
  // globals: {
  //   backgrounds: {
  //     value: undefined
  //   }
  // }
} satisfies Meta<typeof Component>;

export default meta;
// type Story = StoryObj<typeof meta>;
