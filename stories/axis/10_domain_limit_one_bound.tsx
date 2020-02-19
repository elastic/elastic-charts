import { number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Axis/Customizing Domain Limits Only One Bound Defined',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const customizingDomainLimitsOnlyOneBoundDefined = () => {
  const leftDomain = {
    min: number('left min', 0),
  };

  const xDomain = {
    max: number('xDomain max', 3),
  };

  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={false} xDomain={xDomain} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left')}
        title={'Bar axis'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={leftDomain}
      />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
customizingDomainLimitsOnlyOneBoundDefined.story = {
  name: 'customizing domain limits [only one bound defined]',
};
