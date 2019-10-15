import React, { Fragment } from 'react';
import { Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, DataGenerator, BarSeries } from '../src';

const dg = new DataGenerator();
export class Playground extends React.Component {
  state = {
    legendPosition: Position.Right,
    names: 1,
    data: dg.generateSimpleSeries(),
  };
  switchLegend = () => {
    this.setState({
      legendPosition: [Position.Right, Position.Left][Math.floor(Math.random() * 2)],
      // names: Math.floor(Math.random() * 1000 * Math.random()),
      data: dg.generateSimpleSeries(),
    });
  };
  render() {
    return (
      <Fragment>
        <div className="chart">
          <button onClick={this.switchLegend}>Switch legend</button>
          <Chart>
            <Settings showLegend />
            <Axis
              id={getAxisId('bottom')}
              position={Position.Bottom}
              title={'Bottom axis'}
              showOverlappingTicks={true}
            />
            <Axis
              id={getAxisId('left2')}
              title={'Left axis'}
              position={Position.Left}
              tickFormat={(d: any) => Number(d).toFixed(2)}
            />
            {/* <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          stackAccessors={['x']}
          data={data}
          yScaleToDataExtent={false}
        /> */}
            <BarSeries
              id={getSpecId('bars2')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              stackAccessors={['x']}
              splitSeriesAccessors={['g']}
              data={this.state.data}
            />
          </Chart>
        </div>
      </Fragment>
    );
  }
}
