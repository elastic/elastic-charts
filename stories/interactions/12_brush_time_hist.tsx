import { action } from '@storybook/addon-actions';
import React from 'react';
import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  niceTimeFormatter,
  Position,
  ScaleType,
  Settings,
  HistogramBarSeries,
} from '../../src';

import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import { getChartRotationKnob } from '../common';

export default {
  title: 'Interactions/Brush Select on Time Histogram',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const brushSelectionToolOnHistogramTimeCharts = () => {
  const now = DateTime.fromISO('2019-01-11T00:00:00.000')
    .setZone('utc+1')
    .toMillis();
  const oneDay = 1000 * 60 * 60 * 24;
  const formatter = niceTimeFormatter([now, now + oneDay * 5]);
  return (
    <Chart className={'story-chart'}>
      <Settings
        debug={boolean('debug', false)}
        onBrushEnd={(start, end) => {
          action('onBrushEnd')(formatter(start), formatter(end));
        }}
        onElementClick={action('onElementClick')}
        rotation={getChartRotationKnob()}
      />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={'bottom'}
        showOverlappingTicks={true}
        tickFormat={formatter}
      />
      <Axis id={getAxisId('left')} title={'left'} position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <HistogramBarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        timeZone={'Europe/Rome'}
        data={[
          { x: now, y: 2 },
          { x: now + oneDay, y: 7 },
          { x: now + oneDay * 2, y: 3 },
          { x: now + oneDay * 5, y: 6 },
        ]}
      />
    </Chart>
  );
};
brushSelectionToolOnHistogramTimeCharts.story = {
  name: 'brush selection tool on histogram time charts',
};
