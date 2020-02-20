import { color, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, PartialTheme, Position, ScaleType, Settings } from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

function range(title: string, min: number, max: number, value: number, groupId?: string, step = 1) {
  return number(
    title,
    value,
    {
      range: true,
      min,
      max,
      step,
    },
    groupId,
  );
}

const dg = new SeededDataGenerator();
const data1 = dg.generateGroupedSeries(40, 4);

export default {
  title: 'Stylings/Multiple Custom Partial Themes',
  parameters: {
    info: {
      text: 'Notice that the secondary theme bar fill has no effect as the primary value takes priority',
    },
  },
};

export const multipleCustomPartialThemes = () => {
  const primaryTheme: PartialTheme = {
    barSeriesStyle: {
      rect: {
        fill: color('bar fill - primary theme', 'red'),
      },
    },
  };
  const secondaryTheme: PartialTheme = {
    barSeriesStyle: {
      rect: {
        fill: color('bar fill - secondary theme', 'blue'),
        opacity: range('bar opacity - secondary theme', 0.1, 1, 0.7, undefined, 0.1),
      },
    },
  };

  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra theme={[primaryTheme, secondaryTheme]} legendPosition={Position.Right} />
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
multipleCustomPartialThemes.story = {
  name: 'multiple custom partial themes',
};
