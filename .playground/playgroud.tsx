import React from 'react';

import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  Position,
  ScaleType,
  Settings,
  RectAnnotation,
  getAnnotationId,
  HistogramBarSeries,
  niceTimeFormatByDay,
  timeFormatter,
} from '../src';
import { CursorEvent } from '../src/specs/settings';
import { CursorUpdateListener } from '../src/chart_types/xy_chart/store/chart_state';

export class Playground extends React.Component {
  ref1 = React.createRef<Chart>();
  ref2 = React.createRef<Chart>();
  ref3 = React.createRef<Chart>();

  onCursorUpdate: CursorUpdateListener = (event?: CursorEvent) => {
    this.ref1.current!.dispatchExternalCursorEvent(event);
    this.ref2.current!.dispatchExternalCursorEvent(event);
    this.ref3.current!.dispatchExternalCursorEvent(event);
  };

  render() {
    return (
      <div className="chart">
        <Chart size={{ height: 200 }}>
          <Settings
            tooltip={{ type: 'vertical' }}
            debug={false}
            legendPosition={Position.Right}
            showLegend={true}
            xDomain={{
              min: 1566079200000,
              max: 1566079200000,
              minInterval: 86400000,
            }}
          />
          <Axis id={getAxisId('count')} title="count" position={Position.Left} tickFormat={(d) => d.toFixed(2)} />
          <Axis
            id={getAxisId('timestamp')}
            title="timestamp"
            position={Position.Bottom}
            tickFormat={timeFormatter(niceTimeFormatByDay(1))}
          />
          <RectAnnotation
            annotationId={getAnnotationId('annotation1')}
            dataValues={[
              {
                coordinates: {
                  x0: 1566103254092,
                },
                details: `06:40`,
              },
            ]}
            style={{
              stroke: 'rgba(0, 0, 0, 0)',
              strokeWidth: 1,
              opacity: 0.5,
              fill: 'rgba(200, 0, 0, 0.5)',
            }}
            zIndex={-2}
          />
          <RectAnnotation
            annotationId={getAnnotationId('annotation2')}
            dataValues={[
              {
                coordinates: {
                  x1: 1566088404270,
                },
                details: `02:33`,
              },
            ]}
            style={{
              stroke: 'rgba(0, 0, 0, 0)',
              strokeWidth: 1,
              opacity: 0.5,
              fill: 'rgba(0, 0, 200, 0.5)',
            }}
            zIndex={-2}
          />
          <HistogramBarSeries
            id={getSpecId('dataset B')}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            data={[[1566079200000, 10]]}
            xAccessor={0}
            yAccessors={[1]}
            timeZone={'local'}
            barSeriesStyle={{
              rect: {
                opacity: 0.7,
              },
            }}
          />
        </Chart>
      </div>
    );
  }
}
