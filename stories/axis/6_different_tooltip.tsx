import React from 'react';

import { Axis, Chart, getAxisId, getGroupId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src/';

export default {
  title: 'Axis/With Multiple Axis, Different Tooltip Formats',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withMultiAxisDifferentTooltipFormats = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend={false} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left')}
        groupId={getGroupId('group1')}
        title={'Line 1'}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(2)} %`}
      />
      <Axis
        id={getAxisId('right')}
        title={'Line 2'}
        groupId={getGroupId('group2')}
        position={Position.Right}
        tickFormat={(d) => `${Number(d).toFixed(2)}/s`}
      />
      <LineSeries
        id={getSpecId('line1')}
        groupId={getGroupId('group1')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 5 },
          { x: 1, y: 4 },
          { x: 2, y: 3 },
          { x: 3, y: 2 },
        ]}
      />
      <LineSeries
        id={getSpecId('line2')}
        groupId={getGroupId('group2')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        stackAccessors={['x']}
        splitSeriesAccessors={['g']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 3 },
          { x: 2, y: 4 },
          { x: 3, y: 5 },
        ]}
      />
    </Chart>
  );
};
withMultiAxisDifferentTooltipFormats.story = {
  name: 'with multi axis different tooltip formats',
};
