import { color } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, PartialTheme, Position, ScaleType, Settings } from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

const dg = new SeededDataGenerator();
const data1 = dg.generateGroupedSeries(40, 4);

export default {
  title: 'Stylings/Partial Custom Theme',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const partialCustomTheme = () => {
  const customPartialTheme: PartialTheme = {
    barSeriesStyle: {
      rectBorder: {
        stroke: color('BarBorderStroke', 'white'),
        visible: true,
      },
    },
  };

  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra theme={customPartialTheme} legendPosition={Position.Right} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <Axis id={getAxisId('top')} position={Position.Top} title="Top axis" showOverlappingTicks={true} />
      <Axis
        id={getAxisId('right')}
        title="Right axis"
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        stackAccessors={['x']}
        data={data1}
      />
    </Chart>
  );
};
partialCustomTheme.story = {
  name: 'partial custom theme',
};
