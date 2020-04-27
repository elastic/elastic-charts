/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import React from 'react';
import {
  Chart,
  Partition,
  Settings,
  PartitionLayout,
  XYChartElementEvent,
  PartitionElementEvent,
  PartialTheme,
  Datum,
} from '../src';
import { mocks } from '../src/mocks/hierarchical';
import { config } from '../src/chart_types/partition_chart/layout/config/config';
import { indexInterpolatedFillColor, interpolatorCET2s, productLookup } from '../stories/utils/utils';
import { Color } from '../src/utils/commons';
import chroma from 'chroma-js';

const partialTheme1: PartialTheme = {
  background: {
    color: 'blue',
  },
};
const partialTheme2: PartialTheme = {
  background: {
    color: 'transparent',
  },
};

function makeHighContrastColor(foreground: Color, background: Color, ratio = 4.5) {
  let contrast = chroma.contrast(foreground, background);
  // determine the lightness factor of the color to determine whether to shade or tint the foreground
  const brightness = chroma(background).luminance();
  let highContrastTextColor = foreground;
  while (contrast < ratio) {
    if (brightness < 0.5) {
      highContrastTextColor =
        chroma.contrast('rgba(255, 255, 255, 1)', background) > ratio
          ? 'rgba(255, 255, 255, 1)'
          : chroma(highContrastTextColor)
              .darken()
              .toString();
    } else {
      highContrastTextColor =
        chroma.contrast('rgba(0, 0, 0, 1)', background) > ratio
          ? 'rgba(0, 0, 0, 1)'
          : chroma(highContrastTextColor)
              .brighten()
              .toString();
    }
    const oldContrast = contrast;
    contrast = chroma.contrast(highContrastTextColor, background);
    if (contrast === oldContrast) {
      break;
    }
  }
  return contrast;
}

export class Playground extends React.Component {
  onElementClick = (elements: (XYChartElementEvent | PartitionElementEvent)[]) => {
    // eslint-disable-next-line no-console
    console.log(elements);
  };
  render() {
    return (
      <div className="chart" style={{ width: 700, height: 300 }}>
        <Chart>
          <Settings onElementClick={this.onElementClick} theme={partialTheme1} />
          <Partition
            id="1"
            data={mocks.pie}
            valueAccessor={(d: Datum) => d.exportVal as number}
            valueFormatter={(d: number) => `$${config.fillLabel.valueFormatter(Math.round(d / 1000000000))}\xa0Bn`}
            layers={[
              {
                groupByRollup: (d: Datum) => d.sitc1,
                nodeLabel: (d: Datum) => productLookup[d].name,
                fillLabel: { textInvertible: true, textColor: 'black' },
                shape: {
                  fillColor: indexInterpolatedFillColor(interpolatorCET2s),
                },
              },
            ]}
          />
        </Chart>
        <span>
          {' '}
          contrast of first pie chart {makeHighContrastColor('rgba(255, 255, 255, 1)', 'rgba(255, 255, 0, 1)')}
        </span>
        <Chart>
          <Settings onElementClick={this.onElementClick} theme={partialTheme2} />
          <Partition
            id="2"
            config={{
              partitionLayout: PartitionLayout.sunburst,
            }}
            valueAccessor={(d: { v: number }) => {
              return d.v;
            }}
            data={[{ g1: 'a', g2: 'a', v: 1 }]}
            layers={[]}
          />
        </Chart>
      </div>
    );
  }
}
