import { storiesOf, Story } from '@storybook/react';
import { Chart, getSpecId, Sunburst } from '../src';
import { mocks } from '../src/mocks/hierarchical/index';
import { config } from '../src/chart_types/hierarchical_chart/layout/config/config';
import { arrayToLookup } from '../src/chart_types/hierarchical_chart/layout/utils/calcs';
import { Datum } from '../src/chart_types/xy_chart/utils/specs';
import { countryDimension, productDimension, regionDimension } from '../src/mocks/hierarchical/dimensionCodes';
import React, { CElement, Component } from 'react';
import { HierarchicalLayouts } from '../src/chart_types/hierarchical_chart/layout/types/ConfigTypes';
import { getRandomNumber } from '../src/mocks/utils';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);
const regionLookup = arrayToLookup((d: Datum) => d.region, regionDimension);
const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

const addStories = (stories: { [s: string]: CElement<Chart, Component<Chart>> }) =>
  Object.entries(stories).reduce((p: Story, [k, v]) => p.add(k, () => v), storiesOf('Sunburst', module));

const stories = {
  'Most basic pie chart': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Pie chart with fill labels': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
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
          hierarchicalLayout: HierarchicalLayouts.sunburst,
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
  ),
  'Donut chart with fill labels': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
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
          hierarchicalLayout: HierarchicalLayouts.sunburst,
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
  ),
  'Sunburst with fill labels': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
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
          hierarchicalLayout: HierarchicalLayouts.sunburst,
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
  ),
  'Most basic treemap': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.treemap,
          minFontSize: 8,
          maxFontSize: 36,
          idealFontSizeJump: Math.sqrt(1.618),
        }}
      />
    </Chart>
  ),
};

addStories(stories);
