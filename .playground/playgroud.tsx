import React from 'react';
import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  Position,
  ScaleType,
  Settings,
  BarSeries,
  HistogramBarSeries,
  LineSeries,
  CursorEvent,
} from '../src';
import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';
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
      <React.Fragment>
        <div className="chart">
          <Chart ref={this.ref1}>
            <Settings
              showLegend={true}
              xDomain={{
                min: KIBANA_METRICS.metrics.kibana_os_load[0].data[0][0],
                max: KIBANA_METRICS.metrics.kibana_os_load[0].data[40][0],
              }}
              onCursorUpdate={this.onCursorUpdate}
            />
            <Axis id={getAxisId('y')} position={Position.Left} tickFormat={(d) => d.toFixed(2)} />
            <Axis id={getAxisId('x')} position={Position.Bottom} />
            <HistogramBarSeries
              id={getSpecId('hbar')}
              yScaleType={ScaleType.Linear}
              xScaleType={ScaleType.Time}
              xAccessor={0}
              yAccessors={[1]}
              data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(5, 30).filter((d, i) => i != 0 && i !== 5)}
            />
          </Chart>
        </div>
        <div className="chart">
          <Chart ref={this.ref2}>
            <Settings
              showLegend={true}
              xDomain={{ min: KIBANA_METRICS.metrics.kibana_os_load[0].data[0][0] }}
              onCursorUpdate={this.onCursorUpdate}
            />
            <Axis id={getAxisId('y')} position={Position.Left} tickFormat={(d) => d.toFixed(2)} />
            <Axis id={getAxisId('x')} position={Position.Bottom} />
            <BarSeries
              id={getSpecId('bar')}
              yScaleType={ScaleType.Linear}
              xScaleType={ScaleType.Time}
              xAccessor={0}
              yAccessors={[1]}
              data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 30).filter((d, i) => i != 0 && i !== 5)}
            />
            <BarSeries
              id={getSpecId('bar2')}
              yScaleType={ScaleType.Linear}
              xScaleType={ScaleType.Time}
              xAccessor={0}
              yAccessors={[1]}
              data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(5, 30)}
            />
          </Chart>
        </div>
        <div className="chart">
          <Chart ref={this.ref3}>
            <Settings
              showLegend={true}
              xDomain={{ min: KIBANA_METRICS.metrics.kibana_os_load[0].data[0][0] }}
              onCursorUpdate={this.onCursorUpdate}
            />
            <Axis id={getAxisId('y')} position={Position.Left} tickFormat={(d) => d.toFixed(2)} />
            <Axis id={getAxisId('x')} position={Position.Bottom} />
            <LineSeries
              id={getSpecId('line')}
              yScaleType={ScaleType.Linear}
              xScaleType={ScaleType.Time}
              xAccessor={0}
              yAccessors={[1]}
              data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 40)}
            />
          </Chart>
        </div>
      </React.Fragment>
    );
  }
}
