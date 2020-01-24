import { boolean } from '@storybook/addon-knobs';

import { Chart, BarSeries, getSpecId, ScaleType } from '../src';

import React from 'react';

// @ts-ignore

export default {
  title: 'Demo/Basic',
  includeStories: [],
};

export const Basic = () => {
  const darkmode = boolean('darkmode', false);
  const className = darkmode ? 'story-chart-dark' : 'story-chart';
  const toggleSpec = boolean('toggle bar spec', true);
  const data1 = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'bars1' : 'bars2';
  return (
    <Chart className={className}>
      <BarSeries
        id={getSpecId(specId)}
        name={'Simple bar series'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
Basic.story = {
  name: 'basic',
  // @ts-ignore
  parameters: {
    foo: 'bar',
  },
};
