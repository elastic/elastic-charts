import { Chart, Datum, Partition, PartitionLayout } from '../../src';
import { mocks } from '../../src/mocks/hierarchical/index';
import { config } from '../../src/chart_types/partition_chart/layout/config/config';
import { arrayToLookup, hueInterpolator } from '../../src/chart_types/partition_chart/layout/utils/calcs';
import { countryDimension, productDimension } from '../../src/mocks/hierarchical/dimension_codes';

import { palettes } from '../../src/mocks/hierarchical/palettes';
import React from 'react';
import { ShapeTreeNode } from '../../src/chart_types/partition_chart/layout/types/viewmodel_types';

const productLookup = arrayToLookup((d: Datum) => d.sitc1, productDimension);
const countryLookup = arrayToLookup((d: Datum) => d.country, countryDimension);

const interpolatorTurbo = hueInterpolator(palettes.turbo.map(([r, g, b]) => [r, g, b, 0.7]));

export const example = () => (
  <Chart
    className="story-chart"
    size={
      {
        /*
        height: 800,
          */
      }
    }
  >
    <Partition
      id="spec_1"
      data={mocks.sunburst}
      valueAccessor={(d: Datum) => d.exportVal as number}
      valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
      layers={[
        {
          groupByRollup: (d: Datum) => d.sitc1,
          nodeLabel: (d: any) => productLookup[d].name.toUpperCase(),
          fillLabel: {
            valueFormatter: () => '',
            fontFamily: 'Phosphate-Inline',
            textColor: 'rgba(255,255,0, 0.6)',
            textInvertible: true,
          },
          shape: {
            fillColor: (d: ShapeTreeNode) => {
              // primarily, pick color based on parent's index, but then perturb by the index within the parent
              return interpolatorTurbo(d.sortIndex / (d.parent.children.length + 1));
            },
          },
        },
        {
          groupByRollup: (d: Datum) => d.dest,
          nodeLabel: (d: any) => countryLookup[d].name,
          fillLabel: {
            valueFormatter: (d: number) => `${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`,
            textColor: 'black',
            textInvertible: true,
            fontWeight: 900,
            fontStyle: 'normal',
            fontFamily: 'Helvetica',
            fontVariant: 'normal',
            valueFont: {
              fontWeight: 100,
            },
          },
          shape: {
            fillColor: (d: ShapeTreeNode) => {
              // primarily, pick color based on parent's index, but then perturb by the index within the parent
              return interpolatorTurbo(
                (d.parent.sortIndex + d.sortIndex / d.parent.children.length) / (d.parent.parent.children.length + 1),
              );
            },
          },
        },
      ]}
      config={{
        partitionLayout: PartitionLayout.treemap,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        minFontSize: 4,
        maxFontSize: 84,
        idealFontSizeJump: 1.35,
        outerSizeRatio: 1,
      }}
    />
  </Chart>
);
