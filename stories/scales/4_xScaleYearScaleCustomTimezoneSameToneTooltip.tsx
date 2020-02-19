import { DateTime } from 'luxon';
import React from 'react';
import { Axis, Chart, getAxisId, getSpecId, LineSeries, Position, ScaleType } from '../../src';

export default {
  title: 'Scales/xScale Year Scale Custom Timezone Same Tone Tooltip',
  parameters: {
    info: {
      source: false,
    },
  },
};
export const xScaleYearScaleCustomTimezoneSameToneTooltip = () => {
  return (
    <Chart className={'story-chart'}>
      <Axis
        id={getAxisId('time')}
        position={Position.Bottom}
        tickFormat={(d) => {
          return DateTime.fromMillis(d, { zone: 'utc-6' }).toISO();
          // return DateTime.fromMillis(d, { zone: 'utc-6' }).toISO();
        }}
      />
      <Axis id={getAxisId('y')} position={Position.Left} />
      <LineSeries
        id={getSpecId('lines')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={1}
        yAccessors={[2]}
        timeZone={'utc-6'}
        data={[
          ['2014-01-01T00:00:00.000-06:00', 1388556000000, 6206],
          ['2015-01-01T00:00:00.000-06:00', 1420092000000, 5674],
          ['2016-01-01T00:00:00.000-06:00', 1451628000000, 4148],
          ['2017-01-01T00:00:00.000-06:00', 1483250400000, 6206],
          ['2018-01-01T00:00:00.000-06:00', 1514786400000, 3698],
        ]}
      />
    </Chart>
  );
};
xScaleYearScaleCustomTimezoneSameToneTooltip.story = {
  name: 'x scale year scale: custom timezone - same zone tooltip',
};
//     {
//       info: {
//         text: `You can visualize data in a different timezone than your local or UTC zones.
//         Specify the \`timeZone={'utc-6'}\` property with the correct timezone and
//         remember to apply the same timezone also to each formatted tick in \`tickFormat\` `,
//       },
//     },
//   )
