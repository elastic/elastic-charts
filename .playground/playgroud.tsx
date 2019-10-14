import React from 'react';
import { Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, AreaSeries, DataGenerator } from '../src';
import { Fit } from '../src/chart_types/xy_chart/utils/specs';

const dg = new DataGenerator();
// const data = dg.generateSimpleSeries(10);
const data = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: null }, { x: 4, y: null }, { x: 5, y: 10 }, { x: 6, y: 15 }];

export class Playground extends React.Component {
  render() {
    return (
      <>
        <div className="chart">
          <Chart className="story-chart">
            <Settings
              theme={{
                areaSeriesStyle: {
                  point: {
                    visible: true,
                  },
                },
              }}
            />
            <Axis
              id={getAxisId('bottom')}
              position={Position.Bottom}
              title={'Bottom axis'}
              showOverlappingTicks={true}
            />
            <Axis id={getAxisId('left')} title={'Left axis'} position={Position.Left} />
            <AreaSeries
              id={getSpecId('test')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={'x'}
              yAccessors={['y']}
              // splitSeriesAccessors={['g']}
              // stackAccessors={['x']}
              fit={Fit.Average}
              data={data}
            />
          </Chart>
        </div>
      </>
    );
  }
}
