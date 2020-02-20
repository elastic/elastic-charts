import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, getAxisId, getSpecId, PartialTheme, Position, ScaleType, Settings } from '../../src/';

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

export default {
  title: 'Stylings/Margins and Paddings',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const marginsAndPaddings = () => {
  const theme: PartialTheme = {
    chartMargins: {
      left: range('margin left', 0, 50, 10),
      right: range('margin right', 0, 50, 10),
      top: range('margin top', 0, 50, 10),
      bottom: range('margin bottom', 0, 50, 10),
    },
    chartPaddings: {
      left: range('padding left', 0, 50, 10),
      right: range('padding right', 0, 50, 10),
      top: range('padding top', 0, 50, 10),
      bottom: range('padding bottom', 0, 50, 10),
    },
    scales: {
      barsPadding: range('bar padding', 0, 1, 0.1, undefined, 0.01),
    },
  };
  const withLeftTitle = boolean('left axis with title', true);
  const withBottomTitle = boolean('bottom axis with title', true);
  const withRightTitle = boolean('right axis with title', true);
  const withTopTitle = boolean('top axis with title', true);
  return (
    <Chart className={'story-chart'}>
      <Settings
        theme={theme}
        debug={boolean('debug', true)}
        showLegend
        showLegendExtra
        legendPosition={Position.Right}
      />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={withBottomTitle ? 'Bottom axis' : undefined}
        showOverlappingTicks={true}
        showGridLines={boolean('show bottom axis grid lines', false)}
      />
      <Axis
        id={getAxisId('left2')}
        title={withLeftTitle ? 'Left axis' : undefined}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
        showGridLines={boolean('show left axis grid lines', false)}
      />
      <Axis
        id={getAxisId('top')}
        position={Position.Top}
        title={withTopTitle ? 'Top axis' : undefined}
        showOverlappingTicks={true}
        showGridLines={boolean('show top axis grid lines', false)}
      />
      <Axis
        id={getAxisId('right')}
        title={withRightTitle ? 'Right axis' : undefined}
        position={Position.Right}
        tickFormat={(d) => Number(d).toFixed(2)}
        showGridLines={boolean('show right axis grid lines', false)}
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
    </Chart>
  );
};
marginsAndPaddings.story = {
  name: 'margins and paddings',
};
