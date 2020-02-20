import { color } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  getAxisId,
  getSpecId,
  PartialTheme,
  Position,
  ScaleType,
  Settings,
  LIGHT_THEME,
} from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

const dg = new SeededDataGenerator();
const data1 = dg.generateGroupedSeries(40, 4);

export default {
  title: 'Stylings',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const partialCustomThemeWithBaseTheme = () => {
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
      <Settings
        showLegend
        showLegendExtra
        theme={customPartialTheme}
        baseTheme={LIGHT_THEME}
        legendPosition={Position.Right}
      />
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
partialCustomThemeWithBaseTheme.story = {
  name: 'partial custom theme with baseTheme',
};
