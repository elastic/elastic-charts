import React from 'react';
import { BarSeries, Chart } from '../src';

import { Sunburst } from '../src/chart_types/hierarchical_chart/specs/sunburst';
import { mocks } from '../src/chart_types/hierarchical_chart/layout/mocks/mocks';
import { config } from '../src/chart_types/hierarchical_chart/layout/circline/config/config';
import { sunburstMockConfig } from '../src/chart_types/hierarchical_chart/layout/mocks/mockConfigs';

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
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Spec
              id={'test'}
              config={Object.assign({}, config, {
                viewQuery: sunburstMockConfig,
                colors: 'CET2s',
                linkLabel: Object.assign({}, config.linkLabel, {
                  maxCount: 32,
                  fontSize: 14,
                }),
                fontFamily: 'Arial',
                fillLabel: Object.assign({}, config.fillLabel, {
                  formatter: (d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
                  fontStyle: 'italic',
                }),
                margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
                minFontSize: 1,
                idealFontSizeJump: 1.1,
                outerSizeRatio: 0.9, // - 0.5 * Math.random(),
                emptySizeRatio: 0,
                circlePadding: 4,
                backgroundColor: 'rgba(229,229,229,1)',
              })}
              data={mocks.miniSunburst}
            />
          </Chart>
        </div>
        <button onClick={this.onSnapshot}>Snapshot</button>
        <button onClick={this.switchSpec}>Switch Sunburst - Bar </button>
      </>
    );
  }
}
