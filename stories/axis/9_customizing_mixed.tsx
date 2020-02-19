import { number } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  getAxisId,
  getGroupId,
  getSpecId,
  LineSeries,
  Position,
  ScaleType,
  Settings,
} from '../../src/';
import { arrayKnobs } from '../common';

export default {
  title: 'Axis/Customizing Domain Limits Mixed Ordinal Linear xDomain',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const customizingDomainLimitsMixedOrdinalLinearXDomain = () => {
  const leftDomain = {
    min: number('left min', 0),
    max: number('left max', 7),
  };

  const right1Domain = {
    min: number('right1 min', 0),
    max: number('right1 max', 10),
  };

  const xDomain = arrayKnobs('xDomain', ['a', 'b', 'c', 'd', 0, 1, 2, 3]);

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
      <Axis
        id={getAxisId('right')}
        title={'Line axis'}
        groupId={getGroupId('group2')}
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
        domain={right1Domain}
      />
      <Axis
        id={getAxisId('right 2')}
        title={'Line axis 2'}
        groupId={getGroupId('group2')}
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        groupId={getGroupId('group2')}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 3 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 10 },
        ]}
      />
    </Chart>
  );
};
customizingDomainLimitsMixedOrdinalLinearXDomain.story = {
  name: 'customizing domain limits [mixed ordinal & linear x domain]',
};
