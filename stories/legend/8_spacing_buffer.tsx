import { number } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, PartialTheme } from '../../src/';

export default {
  title: 'Legend/Legend Spacing Buffer',
  parameters: {
    info: {
      text: `<pre>${'For high variability in values it may be necessary to increase the `spacingBuffer` to account for larger numbers.'}</pre>`,
    },
  },
};

export const legendSpacingBuffer = () => {
  const theme: PartialTheme = {
    legend: {
      spacingBuffer: number('legend buffer value', 80),
    },
  };

  return (
    <Chart className={'story-chart'}>
      <Settings theme={theme} showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d: any) => Number(d).toFixed(2)}
      />

      <BarSeries
        id={getSpecId('bars 1')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 100000000 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
      />
      <BarSeries
        id={getSpecId('bars 2')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 100000000 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
legendSpacingBuffer.story = {
  name: 'legend spacingBuffer',
};
