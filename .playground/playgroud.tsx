import React from 'react';
import {
  Axis,
  Chart,
  getAxisId,
  getSpecId,
  Position,
  ScaleType,
  HistogramBarSeries,
  DARK_THEME,
  Settings,
} from '../src';
import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';
import { render } from 'enzyme';

export class Playground extends React.Component {
  chartRef: React.RefObject<Chart> = React.createRef();
  onSnapshot = () => {
    if (!this.chartRef.current) {
      return;
    }
    const image = this.chartRef.current.getPNGSnapshot();
    if (!image) {
      return;
    }
    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  render() {
    const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 5);

    return (
      <>
        <button onClick={this.onSnapshot}>Snapshot</button>
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Settings theme={DARK_THEME} rotation={180} />
            <Axis id={getAxisId('x')} position={Position.Bottom} />
            <Axis id={getAxisId('y')} position={Position.Left} />

            <HistogramBarSeries
              id={getSpecId('series bars chart')}
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={0}
              yAccessors={[1]}
              data={data}
              yScaleToDataExtent={true}
            />
          </Chart>
        </div>
      </>
    );
  }
}
