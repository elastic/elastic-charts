import React, { Fragment } from 'react';
import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  Position,
  ScaleType,
  BarSeries,
  DataGenerator,
  Settings,
  LineSeries,
} from '../src';

export class Playground extends React.Component<{}, { showChart1: boolean }> {
  state = {
    showChart1: true,
  };
  removeChart = () => {
    this.setState((prevState) => {
      return {
        showChart1: !prevState.showChart1,
      };
    });
  };
  render() {
    const dg = new DataGenerator();
    const data = dg.generateGroupedSeries(100, 3, 'data series ');
    const data2 = dg.generateGroupedSeries(50, 5, 'data series ');
    return (
      <Fragment>
        <div>
          <button onClick={this.removeChart}>remove chart</button>
        </div>
        <div className="chart">
          {this.state.showChart1 && (
            <Chart>
              <Axis id={getAxisId('top')} position={Position.Bottom} />
              <Axis id={getAxisId('left2')} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

              <LineSeries
                id={getSpecId('series bars chart')}
                xScaleType={ScaleType.Linear}
                yScaleType={ScaleType.Linear}
                xAccessor="x"
                yAccessors={['y']}
                splitSeriesAccessors={['g']}
                stackAccessors={['x']}
                data={data}
                yScaleToDataExtent={true}
              />
            </Chart>
          )}
        </div>
        <div className="chart">
          <Chart>
            <Settings rotation={90} />
            <Axis id={getAxisId('top')} position={Position.Bottom} tickFormat={(d: any) => Number(d).toFixed(2)} />
            <Axis id={getAxisId('left2')} position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

            <BarSeries
              id={getSpecId('series bars chart')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              splitSeriesAccessors={['g']}
              stackAccessors={['x']}
              data={data2}
              yScaleToDataExtent={true}
            />
          </Chart>
        </div>
      </Fragment>
    );
  }
}
