import React from 'react';
import { Chart, BarSeries } from '../src';

import { Sunburst } from '../src/chart_types/hierarchical_chart/specs/sunburst';
export class Playground extends React.Component<{}, { isSunburstShown: boolean }> {
  chartRef: React.RefObject<Chart> = React.createRef();
  state = {
    isSunburstShown: true,
  };
  onSnapshot = () => {
    if (!this.chartRef.current) {
      return;
    }
    const snapshot = this.chartRef.current.getPNGSnapshot({
      backgroundColor: 'white',
      pixelRatio: 1,
    });
    if (!snapshot) {
      return;
    }
    const fileName = 'chart.png';
    switch (snapshot.browser) {
      case 'IE11':
        return navigator.msSaveBlob(snapshot.blobOrDataUrl, fileName);
      default:
        const link = document.createElement('a');
        link.download = fileName;
        link.href = snapshot.blobOrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  switchSpec = () => {
    this.setState((prevState) => {
      return {
        isSunburstShown: !prevState.isSunburstShown,
      };
    });
  };

  render() {
    const Spec = this.state.isSunburstShown ? Sunburst : BarSeries;
    return (
      <>
        <button onClick={this.onSnapshot}>Snapshot</button>
        <button onClick={this.switchSpec}>Switch Sunburst - Bar </button>
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Spec
              id={'test'}
              data={[
                {
                  x: 1,
                  y: 10,
                },
                {
                  x: 2,
                  y: 20,
                },
                {
                  x: 3,
                  y: 30,
                },
              ]}
            />
          </Chart>
        </div>
      </>
    );
  }
}
