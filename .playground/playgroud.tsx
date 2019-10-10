import React, { Fragment } from 'react';
import { Axis, Chart, getAxisId, getSpecId, Position, ScaleType, BarSeries } from '../src';

export class Playground extends React.Component {
  render() {
    return (
      <Fragment>
        <div className="chart">
          <Chart>
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

            <BarSeries
              id={getSpecId('bars')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Log}
              xAccessor="x"
              yAccessors={['y']}
              splitSeriesAccessors={['g']}
              stackAccessors={['x']}
              data={[
                { x: 1, y: 0, g: 'a' },
                { x: 1, y: 0, g: 'b' },
                { x: 2, y: 1, g: 'a' },
                { x: 2, y: 1, g: 'b' },
                { x: 3, y: 2, g: 'a' },
                { x: 3, y: 2, g: 'b' },
                { x: 4, y: 3, g: 'a' },
                { x: 4, y: 0, g: 'b' },
                { x: 5, y: 4, g: 'a' },
                { x: 5, y: 0.5, g: 'b' },
                { x: 6, y: 5, g: 'a' },
                { x: 6, y: 1, g: 'b' },
                { x: 7, y: 6, g: 'b' },
                { x: 8, y: 7, g: 'a' },
                { x: 8, y: 10, g: 'b' },
                { x: 9, y: 4, g: 'a' },
              ]}
            />
          </Chart>
        </div>
      </Fragment>
    );
  }
}
