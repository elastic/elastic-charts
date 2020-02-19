import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType } from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

export default {
  title: 'Axis/Fit Domain to Extent in Axis',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const fitDomainToExtentInYAxis = () => {
  const dg = new SeededDataGenerator();
  const base = dg.generateBasicSeries(100, 0, 50);
  const positive = base.map(({ x, y }) => ({ x, y: y + 1000 }));
  const both = base.map(({ x, y }) => ({ x, y: y - 100 }));
  const negative = base.map(({ x, y }) => ({ x, y: y - 1000 }));

  const dataTypes = {
    positive,
    both,
    negative,
  };
  const dataKey = select<string>(
    'dataset',
    {
      'Positive values only': 'positive',
      'Positive and negative': 'both',
      'Negtive values only': 'negative',
    },
    'both',
  );
  // @ts-ignore
  const dataset = dataTypes[dataKey];
  const fit = boolean('fit domain to data', true);

  return (
    <Chart className={'story-chart'}>
      <Axis id={getAxisId('bottom')} title={'index'} position={Position.Bottom} />
      <Axis
        domain={{ fit }}
        id={getAxisId('left')}
        title="Value"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />

      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={dataset}
      />
    </Chart>
  );
};
fitDomainToExtentInYAxis.story = {
  name: 'fit domain to extent in y axis',
};
