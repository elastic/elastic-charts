import React from 'react';
import { Axis, Chart, Position, ScaleType, Settings, AreaSeries, LineSeries, BarSeries } from '../src';

export class Playground extends React.Component {
  state = {
    data: [[0, 10, 22], [1, 22, 33], [2, 13, 24]],
  };

  render() {
    return (
      <div className="chart">
        <button
          onClick={() => {
            const value = Math.floor(Math.random() * 10000);
            this.setState({
              data: [[0, 10, 22], [1, 22, 33], [2, 13, value]],
            });
          }}
        >
          click
        </button>
        <Chart>
          <Settings showLegend />
          <Axis id="y" title={'y'} position={Position.Left} tickFormat={(value) => `y ${Number(value)}`} />
          <Axis id="x" title={'x'} position={Position.Bottom} tickFormat={(value) => `x ${Number(value)}`} />
          <AreaSeries
            id="areas"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            y0Accessors={[1]}
            yAccessors={[2]}
            data={this.state.data}
          />
          <LineSeries
            id="lines"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[2]}
            data={[[0, 10, 20], [1, 22, 33], [2, 10, 4]]}
          />
          <BarSeries
            id="bars"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[2]}
            data={[[0, 10, 20], [1, 22, 33], [2, 33, 44]]}
          />
        </Chart>
      </div>
    );
  }
}
