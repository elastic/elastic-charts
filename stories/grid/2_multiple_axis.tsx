import { boolean, color, number } from '@storybook/addon-knobs';
import React from 'react';
import {
  Axis,
  BarSeries,
  Chart,
  getAxisId,
  getGroupId,
  getSpecId,
  GridLineConfig,
  LineSeries,
  Position,
  ScaleType,
  Settings,
} from '../../src/';

function generateGridLineConfig(group: string, gridColor = 'purple'): GridLineConfig {
  const groupId = `${group} axis`;

  return {
    stroke: color(`${groupId} grid line stroke color`, gridColor, groupId),
    strokeWidth: number(
      `${groupId} grid line stroke width`,
      1,
      {
        range: true,
        min: 0,
        max: 10,
        step: 1,
      },
      groupId,
    ),
    opacity: number(
      `${groupId} grid line stroke opacity`,
      1,
      {
        range: true,
        min: 0,
        max: 1,
        step: 0.01,
      },
      groupId,
    ),
    dash: [
      number(
        `${groupId} grid line dash length`,
        1,
        {
          range: true,
          min: 0,
          max: 10,
          step: 1,
        },
        groupId,
      ),
      number(
        `${groupId} grid line dash spacing`,
        1,
        {
          range: true,
          min: 0,
          max: 10,
          step: 1,
        },
        groupId,
      ),
    ],
  };
}

export default {
  title: 'Grids/Multiple Axes With the Same Position',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const multipleAxesWithTheSamePosition = () => {
  const leftAxisGridLineConfig = generateGridLineConfig(Position.Left);
  const leftAxisGridLineConfig2 = generateGridLineConfig(`${Position.Left}2`);

  return (
    <Chart size={[500, 300]} className={'story-chart'}>
      <Settings debug={boolean('debug', false)} />
      <Axis
        id={getAxisId('left1')}
        title={'Left axis 1'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        showGridLines={boolean('show left axis grid lines', false, 'left axis')}
        gridLineStyle={leftAxisGridLineConfig}
      />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis 2'}
        groupId={getGroupId('group2')}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        showGridLines={boolean('show left axis 2 grid lines', false, 'left2 axis')}
        gridLineStyle={leftAxisGridLineConfig2}
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
multipleAxesWithTheSamePosition.story = {
  name: 'multiple axes with the same position',
};
