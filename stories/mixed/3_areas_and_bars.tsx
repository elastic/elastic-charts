import React from 'react';

import {
  AreaSeries,
  Axis,
  BarSeries,
  Chart,
  CurveType,
  getAxisId,
  getSpecId,
  Position,
  ScaleType,
  Settings,
} from '../../src/';

export default {
  title: 'Mixed Charts/Areas and Bars',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const areasAndBars = () => {
  return (
    <Chart renderer="canvas" className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(2)}
      />
      <Axis id={getAxisId('top')} position={Position.Top} title={'Top axis'} showOverlappingTicks={true} />
      <Axis
        id={getAxisId('right')}
        title={'Right axis'}
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
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
        yScaleToDataExtent={false}
      />
      <AreaSeries
        id={getSpecId('areas')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        curve={CurveType.CURVE_MONOTONE_X}
        data={[
          { x: 0, y: 2.5 },
          { x: 1, y: 7 },
          { x: 2, y: 3 },
          { x: 3, y: 6 },
        ]}
        yScaleToDataExtent={false}
      />
    </Chart>
  );
};
areasAndBars.story = {
  name: 'areas and bars',
};
