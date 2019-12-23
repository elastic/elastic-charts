import React from 'react';
import { Chart, Partition } from '../src';
import { Datum } from '../src/chart_types/xy_chart/utils/specs';
export class Playground extends React.Component<{}, { isSunburstShown: boolean }> {
  chartRef: React.RefObject<Chart> = React.createRef();
  state = {
    isSunburstShown: true,
  };

  render() {
    return (
      <>
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Partition
              id={'piechart'}
              data={[[10], [20], [30]]}
              valueAccessor={(d: Datum) => d[0]}
              valueFormatter={(d) => `${d}%`}
            />
          </Chart>
        </div>
      </>
    );
  }
}
