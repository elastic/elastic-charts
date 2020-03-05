import React from 'react';
import { Axis, Chart, LineSeries, Position, ScaleType, niceTimeFormatter } from '../../src/';
import { KIBANA_METRICS } from '../../src/utils/data_samples/test_dataset_kibana';
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';

export const example = () => {
  const now = DateTime.fromISO('2019-01-11T00:00:00.000')
    .setZone('utc+1')
    .toMillis();
  const oneDay = 1000 * 60 * 60 * 24;
  const formatter = niceTimeFormatter([now, now + oneDay * 10]);
  const duplicateTicksInAxis = boolean('Hide duplicate ticks in x axis', false);
  return (
    <Chart className="story-chart">
      <Axis id="bottom" position={Position.Bottom} tickFormat={formatter} duplicateTicks={duplicateTicksInAxis} />
      <Axis
        id="left"
        title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
        position={Position.Left}
        tickFormat={(d) => `${Number(d).toFixed(1)}`}
      />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: now, y: 2 },
          { x: now + oneDay, y: 3 },
          { x: now + oneDay * 2, y: 3 },
          { x: now + oneDay * 3, y: 4 },
          { x: now + oneDay * 4, y: 8 },
          { x: now + oneDay * 5, y: 6 },
        ]}
      />
    </Chart>
  );
};
