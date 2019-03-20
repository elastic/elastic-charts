import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { BarSeries, Chart, getSpecId, ScaleType, Settings } from '../src';

storiesOf('Annotations', module)
  .add('basic', () => {
    return (
      <Chart renderer="canvas" size={[500, 300]} className={'story-chart'}>
        <Settings debug={boolean('debug', false)} />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  });
