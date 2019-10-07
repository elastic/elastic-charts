import React, { Fragment } from 'react';
import { Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, AreaSeries } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <Fragment>
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
            {/* <AreaSeries
              id={getSpecId(`machine-3`)}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={0}
              yAccessors={[1]}
              stackAccessors={[0]}
              data={[
                [0, 100],
                [1, null],
                [2, 300],
                [3, null],
                [3.5, 200],
                [4, 200],
                [5, null],
                [6, 231],
                [7, null],
                [8, 100],
                [9, 110],
                [10, null],
                [11, 100],
                [12, 140],
                [13, 180],
                [14, 200],
                [15, 230],
                [16, 260],
                [17, null],
                [18, null],
                [19, 100],
                [20, 100],
                [21, 100],
              ]}
            /> */}
            <AreaSeries
              id={getSpecId(`machine-1`)}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={'x'}
              yAccessors={['y1']}
              stackAccessors={['x']}
              stackAsPercentage
              data={[{ x: 1, y1: 90 }, { x: 3, y1: 30 }]}
              // data={[
              //   [0, 100],
              //   [1, null],
              //   [2, 300],
              //   [3, null],
              //   [3.5, 200],
              //   [4, 200],
              //   [5, null],
              //   [6, 231],
              //   [7, null],
              //   [8, 100],
              //   [8.5, 40],
              //   [9, 110],
              //   [10, null],
              //   [11, 100],
              //   [12, 140],
              //   [13, 180],
              //   [14, 200],
              //   [15, 230],
              //   [16, 260],
              //   [17, null],
              //   [18, null],
              //   [19, 100],
              //   [20, 100],
              //   [21, 100],
              // ]}
            />
            <AreaSeries
              id={getSpecId(`machine-2`)}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={'x'}
              yAccessors={['y1']}
              stackAccessors={['x']}
              data={
                [{ x: 1, y1: 10 }, { x: 2, y1: 20 }, { x: 4, y1: 40 }]
                // [[0, 100],
                // [1, null],
                // [2, 300],
                // [3, null],
                // [3.5, 200],
                // [4, 200],
                // [5, null],
                // [6, 231],
                // [7, null],
                // [8, 100],
                // [9, 110],
                // [10, null],
                // [11, 100],
                // [12, 140],
                // [13, 180],
                // [14, 200],
                // [15, 230],
                // [16, 260],
                // [17, null],
                // [18, null],
                // [19, 100],
                // [20, 100],
                // [21, 100],]
              }
            />
          </Chart>
        </div>
      </Fragment>
    );
  }
}
