import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { Chart, getSpecId, Sunburst } from '../src';
import { mocks } from '../src/chart_types/hierarchical_chart/layout/mocks/mocks';
import { config } from '../src/chart_types/hierarchical_chart/layout/circline/config/config';
import { pieMockConfig, sunburstMockConfig } from '../src/chart_types/hierarchical_chart/layout/mocks/mockConfigs';
import { arrayToLookup } from '../src/chart_types/hierarchical_chart/layout/circline/utils/calcs';
import { Datum } from '../src/chart_types/xy_chart/utils/specs';
import {
  countryDimension,
  productDimension,
  regionDimension,
} from '../src/chart_types/hierarchical_chart/layout/mocks/dimensionCodes';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);
const regionLookup = arrayToLookup((d: Datum) => d.region, regionDimension);
const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

storiesOf('Sunburst', module)
  .add('Most basic pie chart', () => {
    const darkMode = boolean('darkMode', false);
    const className = darkMode ? 'story-chart-dark' : 'story-chart';
    const specId = 'pie1';

    return (
      <Chart className={className}>
        <Sunburst
          id={getSpecId(specId)}
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
          config={config}
        />
      </Chart>
    );
  })
  .add('Pie chart with fill labels', () => {
    const darkMode = boolean('darkMode', false);
    const className = darkMode ? 'story-chart-dark' : 'story-chart';
    const specId = 'pie1';

    return (
      <Chart className={className}>
        <Sunburst
          id={getSpecId(specId)}
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
          config={Object.assign({}, config, {
            viewQuery: pieMockConfig,
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
        />
      </Chart>
    );
  })
  .add('Donut chart with fill labels', () => {
    const darkMode = boolean('darkMode', false);
    const className = darkMode ? 'story-chart-dark' : 'story-chart';
    const specId = 'pie1';

    return (
      <Chart className={className}>
        <Sunburst
          id={getSpecId(specId)}
          data={mocks.pie}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: Datum) => productLookup[d].name,
            },
          ]}
          config={Object.assign({}, config, {
            viewQuery: pieMockConfig,
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
            margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0.2, right: 0 }),
            minFontSize: 1,
            idealFontSizeJump: 1.1,
            outerSizeRatio: 0.9, // - 0.5 * Math.random(),
            emptySizeRatio: 0.4,
            circlePadding: 4,
            backgroundColor: 'rgba(229,229,229,1)',
          })}
        />
      </Chart>
    );
  })
  .add('Sunburst with fill labels', () => {
    const darkMode = boolean('darkmode', false);
    const className = darkMode ? 'story-chart-dark' : 'story-chart';
    const specId = 'sunburst1';

    return (
      <Chart className={className}>
        <Sunburst
          id={getSpecId(specId)}
          data={mocks.miniSunburst}
          valueAccessor={(d: Datum) => d.exportVal as number}
          valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
          layers={[
            {
              groupByRollup: (d: Datum) => d.sitc1,
              nodeLabel: (d: any) => productLookup[d].name,
            },
            {
              groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
              nodeLabel: (d: any) => regionLookup[d].regionName,
            },
            {
              groupByRollup: (d: Datum) => d.dest,
              nodeLabel: (d: any) => countryLookup[d].name,
            },
          ]}
          config={Object.assign({}, config, {
            viewQuery: sunburstMockConfig,
            colors: 'CET2s',
            linkLabel: Object.assign({}, config.linkLabel, {
              maxCount: 0,
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
            outerSizeRatio: 1,
            emptySizeRatio: 0,
            circlePadding: 4,
            backgroundColor: 'rgba(229,229,229,1)',
          })}
        />
      </Chart>
    );
  });
