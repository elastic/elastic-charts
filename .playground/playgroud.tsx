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

    const canvas = document.createElement('canvas');

    // determine size of the background chart
    const chart = document.querySelector('.echChart');
    if (!chart) {
      return;
    }
    const width = chart.clientWidth;
    const height = chart.clientHeight;

    canvas.setAttribute('width', width.toString());
    canvas.setAttribute('height', height.toString());
    const context = canvas.getContext('2d');

    const img = new Image();
    img.src = image;

    img.onload = function() {
      if (!context) {
        return;
      }
      context.fillRect(0, 0, width, height);
      context.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = 'image.png';
      link.href = canvas.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };
  render() {
    const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 5);

    return (
      <>
        <button onClick={this.onSnapshot}>Snapshot</button>
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Settings theme={DARK_THEME} rotation={180} showLegend={true} />
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
