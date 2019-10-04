import React, { Fragment } from 'react';
import { Axis, Chart, getAxisId, getSpecId, Position, ScaleType, Settings, AreaSeries, DataGenerator } from '../src';

const dg = new DataGenerator();

export class Playground extends React.Component {
  state = {
    data: dg.generateSimpleSeries(50),
    fixed: Math.floor(Math.random() * 10),
  };
  render() {
    const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
    return (
      <Fragment>
        <div>
          <button
            onClick={() => {
              this.setState(() => {
                return {
                  data: dg.generateSimpleSeries(),
                  fixed: Math.floor(Math.random() * 10),
                };
              });
            }}
          >
            Update data
          </button>
        </div>
        <div className="chart">
          <Chart>
            <Settings showLegend />
            <Axis
              id={getAxisId('top')}
              position={Position.Bottom}
              title={'Bottom axis'}
              showOverlappingTicks={true}
              showGridLines
            />
            <Axis id={getAxisId('left2')} title={'Left axis'} position={Position.Left} />

            <BarSeries
              id={getSpecId('bars1')}
              xScaleType={ScaleType.Time}
              yScaleType={ScaleType.Linear}
              xAccessor={0}
              yAccessors={[1]}
              timeZone={'US/Pacific'}
              data={data}
            />
          </Chart>
        </div>
      </Fragment>
    );
  }
}
