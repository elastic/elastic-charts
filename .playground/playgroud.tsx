import React from 'react';
import { Axis, Chart, Position, ScaleType, Settings, AreaSeries } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <div className="chart">
        <Chart>
          <Settings showLegend />
          <Axis id="y" title={'y'} position={Position.Left} tickFormat={(value) => `y ${Number(value)}`} />
          <Axis id="x" title={'x'} position={Position.Bottom} tickFormat={(value) => `x ${Number(value)}`} />
          <AreaSeries
            id="bars"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            y0Accessors={[1]}
            yAccessors={[2]}
            data={[[0, 10, 20], [1, 22, 33], [2, 33, 44]]}
          />
        </Chart>
      </div>
    );
  }
}
