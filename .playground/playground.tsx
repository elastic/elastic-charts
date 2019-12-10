import React from 'react';
import { BarSeries, Chart, Sunburst } from '../src';
import { mocks } from '../src/mocks/hierarchical/index';
import { config } from '../src/chart_types/hierarchical_chart/layout/config/config';
import { countryDimension, productDimension, regionDimension } from '../src/mocks/hierarchical/dimensionCodes';
import { arrayToLookup } from '../src/chart_types/hierarchical_chart/layout/utils/calcs';
import { Datum } from '../src/chart_types/xy_chart/utils/specs';

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
    const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);
    const regionLookup = arrayToLookup((d: Datum) => d.region, regionDimension);
    const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);
    return (
      <>
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Spec
              id={'test'}
              data={mocks.miniSunburst}
              valueAccessor={(d: Datum) => d.exportVal as number}
              valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
              layers={[
                {
                  groupByRollup: (d: Datum) => d.sitc1,
                  nodeLabel: (d: Datum) => productLookup[d].name,
                },
                {
                  groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
                  nodeLabel: (d: Datum) => regionLookup[d].regionName,
                },
                {
                  groupByRollup: (d: Datum) => d.dest,
                  nodeLabel: (d: Datum) => countryLookup[d].name,
                },
              ]}
              config={Object.assign({}, config, {
                colors: 'CET2s',
                linkLabel: Object.assign({}, config.linkLabel, {
                  maxCount: 32,
                  fontSize: 14,
                }),
                fontFamily: 'Arial',
                fillLabel: Object.assign({}, config.fillLabel, {
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
            />
          </Chart>
        </div>
        <button onClick={this.onSnapshot}>Snapshot</button>
        <button onClick={this.switchSpec}>Switch Sunburst - Bar </button>
      </>
    );
  }
}
