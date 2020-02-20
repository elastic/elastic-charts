import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../../src/';
import { SubSeriesStringPredicate } from '../../src/chart_types/xy_chart/utils/specs';
import moment from 'moment';
import { DateTime } from 'luxon';

export default {
  title: 'Stylings/Add Custom SubSeries Label Formatting',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const addCustomSubSeriesLabelFormatting = () => {
  const start = DateTime.fromISO('2019-01-01T00:00:00.000', { zone: 'utc' });
  const data = [
    { x: 1, y: 3, percent: 0.5, time: start.plus({ month: 1 }).toMillis() },
    { x: 2, y: 6, percent: 0.5, time: start.plus({ month: 2 }).toMillis() },
    { x: 3, y: 20, percent: 0.5, time: start.plus({ month: 3 }).toMillis() },
    { x: 1, y: 9, percent: 0.7, time: start.plus({ month: 1 }).toMillis() },
    { x: 2, y: 13, percent: 0.7, time: start.plus({ month: 2 }).toMillis() },
    { x: 3, y: 14, percent: 0.7, time: start.plus({ month: 3 }).toMillis() },
    { x: 1, y: 15, percent: 0.1, time: start.plus({ month: 1 }).toMillis() },
    { x: 2, y: 18, percent: 1, time: start.plus({ month: 2 }).toMillis() },
    { x: 3, y: 7, percent: 1, time: start.plus({ month: 3 }).toMillis() },
  ];
  const customSubSeriesLabel: SubSeriesStringPredicate = (accessor, key, isTooltip) => {
    if (key === 'time') {
      // Format time group
      if (isTooltip) {
        // Format tooltip time to be longer
        return moment(accessor).format('ll');
      }

      // Format legend to be shorter
      return moment(accessor).format('M/YYYY');
    }

    if (key === 'percent') {
      // Format percent group
      return `${(accessor as number) * 100}%`;
    }

    // don't format yAccessor
    return null;
  };

  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />

      <BarSeries
        id={getSpecId('bars1')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['time', 'percent']}
        data={data}
        customSubSeriesLabel={customSubSeriesLabel}
      />
    </Chart>
  );
};
addCustomSubSeriesLabelFormatting.story = {
  name: 'Add custom sub-series label formatting [time/date and percent]',
};
