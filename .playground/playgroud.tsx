import React, { Fragment } from 'react';
import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  Position,
  ScaleType,
  Settings,
  AreaSeries,
  HistogramBarSeries,
  HistogramModeAlignments,
} from '../src';

export class Playground extends React.Component {
  render() {
    const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
    return (
      <Fragment>
        <div className="chart">
          <Chart>
            <Settings showLegend theme={{ areaSeriesStyle: { point: { visible: true } } }} />
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
            <AreaSeries
              id={getSpecId('area1')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              histogramModeAlignment={HistogramModeAlignments.Start}
              data={[{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 1 }, { x: 3, y: 8 }]}
            />
            <AreaSeries
              id={getSpecId('area2')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              histogramModeAlignment={HistogramModeAlignments.Start}
              data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
            />
            <HistogramBarSeries
              id={getSpecId('histo')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
            />
          </Chart>
        </div>
      </Fragment>
    );
  }
}
