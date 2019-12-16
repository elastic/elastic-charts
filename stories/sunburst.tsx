import { storiesOf, Story } from '@storybook/react';
import { Chart, getSpecId, Sunburst } from '../src';
import { mocks } from '../src/mocks/hierarchical/index';
import { config } from '../src/chart_types/hierarchical_chart/layout/config/config';
import { arrayToLookup, cyclicalHueInterpolator } from '../src/chart_types/hierarchical_chart/layout/utils/calcs';
import { Datum } from '../src/chart_types/xy_chart/utils/specs';
import { countryDimension, productDimension, regionDimension } from '../src/mocks/hierarchical/dimensionCodes';
import React, { CElement, Component } from 'react';
import { HierarchicalLayouts } from '../src/chart_types/hierarchical_chart/layout/types/ConfigTypes';
import { getRandomNumber } from '../src/mocks/utils';
// @ts-ignore
import parse from 'parse-color';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);
const regionLookup = arrayToLookup((d: Datum) => d.region, regionDimension);
const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

const addStories = (stories: { [s: string]: CElement<Chart, Component<Chart>> }) =>
  Object.entries(stories).reduce((p: Story, [k, v]) => p.add(k, () => v), storiesOf('Sunburst', module));

// style calcs
const interpolatorCET2s = cyclicalHueInterpolator(config.palettes.CET2s);
const interpolatorTurbo = cyclicalHueInterpolator(config.palettes.turbo);
const defaultFillColor = (colorMaker: any) => (d: any, i: number, a: any[]) => colorMaker(i / (a.length + 1));

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
            shape: {
              fillColor: defaultFillColor(interpolatorTurbo),
            },
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
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
  'Pie chart with direct text labels instead of dimension lookup': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={[
          { sitc1: 'Machinery and transport equipment', exportVal: 5 },
          { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 4 },
        ]}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            // nodeLabel: (d: Datum) => d,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Some slices has a zero value': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie
          .slice(0, 2)
          .concat(mocks.pie.slice(2, 4).map((s) => ({ ...s, exportVal: 0 })))
          .concat(mocks.pie.slice(4))}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Sunburst with two layers': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            fillLabel: {
              fontFamily: 'Impact',
              formatter: (d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000000))}\xa0Tn`,
            },
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
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
  'Sunburst with three layers': (
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
          {
            groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
            nodeLabel: (d: any) => regionLookup[d].regionName,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
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
  'Pie chart with two slices': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie.slice(0, 2)}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Pie chart with one large and one small slice': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={[
          { sitc1: 'Machinery and transport equipment', exportVal: 280 },
          { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 80 },
        ]}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => d,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.sunburst,
          clockwiseSectors: true,
          specialFirstInnermostSector: false,
          outerSizeRatio: 1,
        }}
      />
    </Chart>
  ),
  'Pie chart with one very large and one very small slice': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={[
          { sitc1: 'Machinery and transport equipment', exportVal: 9 },
          { sitc1: 'Mineral fuels, lubricants and related materials', exportVal: 1 },
        ]}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => d,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Pie chart with one near-full and one near-zero slice': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={[{ sitc1: '7', exportVal: 999999 }, { sitc1: '3', exportVal: 1 }]}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Pie chart with one full and one zero slice': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={[{ sitc1: '7', exportVal: 1000000 }, { sitc1: '3', exportVal: 0 }]}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d))}`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Pie chart with a single slice': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie.slice(0, 1)}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'No pie chart if no slices': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={[]}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'No pie chart if some slices are negative': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie
          .slice(0, 2)
          .concat(mocks.pie.slice(2, 3).map((s) => ({ ...s, exportVal: -0.1 })))
          .concat(mocks.pie.slice(3))}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'No pie chart if total is zero': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.pie.map((s) => ({ ...s, exportVal: 0 }))}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: Datum) => productLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{ ...config, hierarchicalLayout: HierarchicalLayouts.sunburst }}
      />
    </Chart>
  ),
  'Hundreds of slices, vanishing & tapering borders': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.manyPie}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.origin,
            nodeLabel: (d: Datum) => countryLookup[d].name,
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.sunburst,
          linkLabel: { ...config.linkLabel, maxCount: 15 },
        }}
      />
    </Chart>
  ),
  'Counterclockwise, special 1st': (
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.sunburst,
          clockwiseSectors: false,
        }}
      />
    </Chart>
  ),
  'Clockwise, non-special 1st': (
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.sunburst,
          specialFirstInnermostSector: false,
        }}
      />
    </Chart>
  ),
  'Linked labels only': (
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.sunburst,
          linkLabel: { ...config.linkLabel, maximumSection: Infinity },
        }}
      />
    </Chart>
  ),
  'No labels at all': (
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.sunburst,
          linkLabel: { ...config.linkLabel, maximumSection: Infinity, maxCount: 0 },
        }}
      />
    </Chart>
  ),
  'One-layer, resizing treemap': (
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
            shape: {
              fillColor: defaultFillColor(interpolatorCET2s),
            },
          },
        ]}
        config={{
          ...config,
          hierarchicalLayout: HierarchicalLayouts.treemap,
          minFontSize: 1,
          maxFontSize: 36,
          idealFontSizeJump: 1.01,
        }}
      />
    </Chart>
  ),
  'Two-layer treemap stress test': (
    <Chart className={'story-chart'}>
      <Sunburst
        id={getSpecId('spec_' + getRandomNumber())}
        data={mocks.sunburst}
        valueAccessor={(d: Datum) => d.exportVal as number}
        valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
        layers={[
          {
            groupByRollup: (d: Datum) => d.sitc1,
            nodeLabel: (d: any) => productLookup[d].name.toUpperCase(),
            fillLabel: Object.assign({}, config.fillLabel, {
              formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
              fontFamily: 'Arial Narrow',
              textColor: 'rgb(255,255,255)',
              textInvertible: false,
              textWeight: 900,
              fontStyle: 'small-caps',
            }),
            shape: { fillColor: 'rgba(255, 229, 180,0.25)' },
          },
          {
            groupByRollup: (d: Datum) => d.dest,
            nodeLabel: (d: any) => countryLookup[d].name,
            fillLabel: Object.assign({}, config.fillLabel, {
              formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
              textColor: 'black',
              textInvertible: false,
              textWeight: 300,
              fontStyle: 'normal',
              fontFamily: 'Helvetica',
              fontVariant: 'normal',
            }),
            shape: {
              fillColor: (d: any, i: any, a: any) => {
                const color = defaultFillColor(interpolatorCET2s)(d, i, a);
                const [r, g, b] = parse(color).rgb;
                return `rgb(${Math.round(r * 0.75)}, ${Math.round(g * 0.75)}, ${Math.round(b * 0.75)})`;
              },
            },
          },
        ]}
        config={Object.assign({}, config, {
          hierarchicalLayout: HierarchicalLayouts.treemap,
          colors: 'turbo',
          linkLabel: Object.assign({}, config.linkLabel, { maxCount: 0 }),
          fontFamily: 'Helvetica Neue',
          fillLabel: Object.assign({}, config.fillLabel, {
            formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
            textColor: 'white',
            textInvertible: true,
            textWeight: 500,
            fontStyle: 'normal',
          }),
          margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
          minFontSize: 4,
          maxFontSize: 84,
          idealFontSizeJump: 1.2,
          outerSizeRatio: 1,
        })}
      />
    </Chart>
  ),
};

addStories(stories);
