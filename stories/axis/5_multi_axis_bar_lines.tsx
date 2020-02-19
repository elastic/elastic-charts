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

export default {
  title: 'Axis/With Multiple Axis Bar Lines',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withMultiAxisBarLines = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={false} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left')}
        title={'Bar axis'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <Axis
        id={getAxisId('right')}
        title={'Line axis'}
        groupId={getGroupId('group2')}
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
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
withMultiAxisBarLines.story = {
  name: 'with multi axis bar/lines',
};
