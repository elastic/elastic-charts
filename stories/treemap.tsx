import { Chart, getSpecId, Partition } from '../src';
import { mocks } from '../src/mocks/hierarchical/index';
import { config } from '../src/chart_types/partition_chart/layout/config/config';
import { arrayToLookup, hueInterpolator } from '../src/chart_types/partition_chart/layout/utils/calcs';
import { Datum } from '../src/chart_types/xy_chart/utils/specs';
import { countryDimension, productDimension, regionDimension } from '../src/mocks/hierarchical/dimension_codes';
import React from 'react';
import { PartitionLayouts } from '../src/chart_types/partition_chart/layout/types/config_types';
import { getRandomNumber } from '../src/mocks/utils'; // @ts-ignore
import { toRGB } from '../src/chart_types/partition_chart/layout/utils/d3_utils';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);
const regionLookup = arrayToLookup((d: Datum) => d.region, regionDimension);
const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

// style calcs
const interpolatorCET2s = hueInterpolator(config.palettes.CET2s);
const interpolatorTurbo = hueInterpolator(config.palettes.turbo);
const defaultFillColor = (colorMaker: any) => (d: any, i: number, a: any[]) => colorMaker(i / (a.length + 1));

export default {
  title: 'Treemap',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const OneLayer = () => (
  <Chart className={'story-chart'}>
    <Partition
      id={getSpecId('spec_' + getRandomNumber())}
      data={mocks.pie}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: Datum) => productLookup[d].name,
          fillLabel: { formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn` },
          shape: {
            fillColor: defaultFillColor(interpolatorCET2s),
          },
        },
      ]}
      config={{
        ...config,
        hierarchicalLayout: PartitionLayouts.treemap,
        minFontSize: 1,
        maxFontSize: 36,
        idealFontSizeJump: 1.01,
      }}
    />
  </Chart>
);
OneLayer.story = {
  name: 'One-layer, resizing treemap',
};

export const MidTwoLayers = () => (
  <Chart
    className={'story-chart'}
    size={
      {
        /*height: 800*/
      }
    }
  >
    <Partition
      id={getSpecId('spec_' + getRandomNumber())}
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
          nodeLabel: (d: any) => regionLookup[d].regionName,
          fillLabel: Object.assign({}, config.fillLabel, {
            formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
            fontFamily: 'Phosphate-Inline',
            textColor: 'yellow',
            textInvertible: false,
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
            textWeight: 200,
            fontStyle: 'normal',
            fontFamily: 'Helvetica',
            fontVariant: 'normal',
          }),
          shape: {
            fillColor: (d: any, i: any, a: any) => {
              const color = defaultFillColor(interpolatorTurbo)(d, i, a);
              const { r, g, b } = toRGB(color) || { r: 255, g: 0, b: 0 };
              return `rgb(${Math.round(r * 0.75)}, ${Math.round(g * 0.75)}, ${Math.round(b * 0.75)})`;
            },
          },
        },
      ]}
      config={Object.assign({}, config, {
        hierarchicalLayout: PartitionLayouts.treemap,
        colors: 'turbo',
        margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
        minFontSize: 4,
        maxFontSize: 84,
        idealFontSizeJump: 1.15,
        outerSizeRatio: 1,
      })}
    />
  </Chart>
);
MidTwoLayers.story = {
  name: 'Midsize two-layer treemap',
};
export const TwoLayersStressTest = () => (
  <Chart
    className={'story-chart'}
    size={
      {
        /*height: 800*/
      }
    }
  >
    <Partition
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
            fontFamily: 'Phosphate-Inline',
            textColor: 'white',
            textInvertible: false,
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
            textWeight: 200,
            fontStyle: 'normal',
            fontFamily: 'Helvetica',
            fontVariant: 'normal',
          }),
          shape: {
            fillColor: (d: any, i: any, a: any) => {
              const color = defaultFillColor(interpolatorCET2s)(d, i, a);
              const { r, g, b } = toRGB(color) || { r: 255, g: 0, b: 0 };
              return `rgb(${Math.round(r * 0.75)}, ${Math.round(g * 0.75)}, ${Math.round(b * 0.75)})`;
            },
          },
        },
      ]}
      config={Object.assign({}, config, {
        hierarchicalLayout: PartitionLayouts.treemap,
        colors: 'turbo',
        margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
        minFontSize: 4,
        maxFontSize: 84,
        idealFontSizeJump: 1.35,
        outerSizeRatio: 1,
      })}
    />
  </Chart>
);
TwoLayersStressTest.story = {
  name: 'Two-layer treemap stress test',
};

export const MultiColor = () => (
  <Chart
    className={'story-chart'}
    size={
      {
        /*height: 800*/
      }
    }
  >
    <Partition
      id={getSpecId('spec_' + getRandomNumber())}
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
          nodeLabel: () => '',
          fillLabel: Object.assign({}, config.fillLabel, {
            formatter: () => '',
          }),
          shape: {
            fillColor: (d: any, i: any, a: any) => {
              const color = defaultFillColor(interpolatorCET2s)(d, i, a);
              const { r, g, b } = toRGB(color) || { r: 255, g: 0, b: 0 };
              return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.5)`;
            },
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          fillLabel: Object.assign({}, config.fillLabel, {
            formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
            textColor: 'rgb(60,60,60,1)',
            textInvertible: false,
            textWeight: 100,
            fontStyle: 'normal',
            fontFamily: 'Din Condensed',
            fontVariant: 'normal',
          }),
          shape: {
            fillColor: 'rgba(0,0,0,0)',
          },
        },
      ]}
      config={Object.assign({}, config, {
        hierarchicalLayout: PartitionLayouts.treemap,
        margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
        minFontSize: 4,
        maxFontSize: 84,
        idealFontSizeJump: 1.05,
        outerSizeRatio: 1,
      })}
    />
  </Chart>
);
MultiColor.story = {
  name: 'Each color identifies a region in a (future) legend',
};

export const CustomStyle = () => (
  <Chart
    className={'story-chart'}
    size={
      {
        /*height: 800*/
      }
    }
  >
    <Partition
      id={getSpecId('spec_' + getRandomNumber())}
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => countryLookup[d.dest].continentCountry.substr(0, 2),
          nodeLabel: () => '',
          fillLabel: Object.assign({}, config.fillLabel, {
            formatter: () => '',
          }),
          shape: {
            fillColor: (d: any, i: any, a: any) => {
              const shade = Math.pow(0.3 + 0.5 * (i / (a.length - 1)), 1 / 3);
              return `rgb(${Math.round(255 * shade)},${Math.round(255 * shade)},${Math.round(255 * shade)})`;
            },
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          fillLabel: Object.assign({}, config.fillLabel, {
            formatter: (d: number) => `${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
            textColor: 'rgb(60,60,60,1)',
            textInvertible: false,
            textWeight: 600,
            fontStyle: 'normal',
            fontFamily: 'Courier New',
            fontVariant: 'normal',
          }),
          shape: {
            fillColor: 'rgba(0,0,0,0)',
          },
        },
      ]}
      config={Object.assign({}, config, {
        hierarchicalLayout: PartitionLayouts.treemap,
        margin: Object.assign({}, config.margin, { top: 0, bottom: 0, left: 0, right: 0 }),
        minFontSize: 8,
        maxFontSize: 14,
        idealFontSizeJump: 1.05,
        outerSizeRatio: 1,
      })}
    />
  </Chart>
);
CustomStyle.story = {
  name: 'Custom style',
};
