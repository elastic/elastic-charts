import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType, Settings } from '../../src';

export default {
  title: 'Scales/Remove duplicate scales',
  parameters: {
    info: {
      text: `<pre>${`hideDuplicateAxes will remove redundant axes that have the same min and max labels and position`}</pre>`,
    },
  },
};

export const removeDuplicateScales = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings hideDuplicateAxes={boolean('hideDuplicateAxes', true)} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} />
      <Axis id={getAxisId('y1')} position={Position.Left} tickFormat={(d) => `${d}%`} />
      <Axis id={getAxisId('y2')} position={Position.Left} tickFormat={(d) => `${d}%`} />
      <Axis title="Axis - Different title" id={getAxisId('y3')} position={Position.Left} tickFormat={(d) => `${d}%`} />
      <Axis domain={{ min: 0 }} id={getAxisId('y4')} position={Position.Left} tickFormat={(d) => `${d}%`} />
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        timeZone={'utc-6'}
        data={[
          [1, 62],
          [2, 56],
          [3, 41],
          [4, 62],
          [5, 90],
        ]}
      />
    </Chart>
  );
};
removeDuplicateScales.story = {
  name: 'Remove duplicate scales',
};
//     {
//       info: {
//         text: '`hideDuplicateAxes` will remove redundant axes that have the same min and max labels and position',
//       },
//     },
//   );
