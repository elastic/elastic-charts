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

// style calcs
const interpolatorCET2s = cyclicalHueInterpolator(config.palettes.CET2s);
const interpolatorTurbo = cyclicalHueInterpolator(config.palettes.turbo);
const defaultFillColor = (colorMaker: any) => (d: any, i: number, a: any[]) => colorMaker(i / (a.length + 1));

const addStories = (folderName: string, stories: { [s: string]: CElement<Chart, Component<Chart>> }) =>
  Object.entries(stories).reduce((p: Story, [k, v]) => p.add(k, () => v), storiesOf(folderName, module));

const stories = {
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
    <Chart
      className={'story-chart'}
      size={
        {
          /*height: 800*/
        }
      }
    >
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
          idealFontSizeJump: 1.05,
          outerSizeRatio: 1,
        })}
      />
    </Chart>
  ),
};

addStories('Treemap', stories);
