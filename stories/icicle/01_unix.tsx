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
 * under the License.
 */

import React from 'react';

import { Chart, Datum, Partition, PartitionLayout, Settings } from '../../src';
import { ShapeTreeNode } from '../../src/chart_types/partition_chart/layout/types/viewmodel_types';
import { PrimitiveValue } from '../../src/chart_types/partition_chart/layout/utils/group_by_rollup';
import { mocks } from '../../src/mocks/hierarchical';
import { STORYBOOK_LIGHT_THEME } from '../shared';
import { categoricalFillColor, viridis18 as palette } from '../utils/utils';

const color = palette.slice().reverse();

const raw = mocks.observabilityTree;

interface Node {
  c?: Node[];
  n: string;
  v: number;
}

type Row = { [layerKey: string]: unknown; value: number; depth: number };

const flatTree = ({ c, n, v }: Node, depth: number): Row[] => {
  if (!c) {
    return [{ [`layer_${depth}`]: n, value: v, depth }];
  }
  // looks like our test runner can't run c.flatMap(...)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line prefer-spread
  const childrenRows: Row[] = [].concat.apply(
    [],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    c.map((child) => flatTree(child, depth + 1)),
  );
  const childrenTotal = childrenRows.reduce((p, { value }) => p + value, 0);
  const missing = Math.max(0, v - childrenTotal);
  if (missing > 0) {
    childrenRows.unshift({ [`layer_${depth + 1}`]: undefined, value: missing / 2, depth });
    childrenRows.push({ [`layer_${depth + 1}`]: undefined, value: missing / 2, depth });
  }
  childrenRows.forEach((innerChild) => {
    innerChild[`layer_${depth}`] = n;
  });
  return childrenRows;
};

const flatData = flatTree(raw, 0);
const maxDepth = flatData.reduce((p, n) => Math.max(p, n.depth), 0);

const layerSpec = [...new Array(maxDepth + 1)].map((_, depth) => ({
  groupByRollup: (d: Datum) => d[`layer_${depth}`],
  nodeLabel: (d: PrimitiveValue) => String(d),
  showAccessor: (d: PrimitiveValue) => d !== undefined,
  shape: {
    fillColor: (d: ShapeTreeNode) => (d.dataName ? categoricalFillColor(color, 0.8)(depth) : 'transparent'),
  },
}));

export const Example = () => {
  return (
    <Chart className="story-chart" size={{ height: 700 }}>
      <Settings showLegend flatLegend legendMaxDepth={18} theme={STORYBOOK_LIGHT_THEME} />
      <Partition
        id="spec_1"
        data={flatData}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={() => ''}
        layers={layerSpec}
        config={{
          partitionLayout: PartitionLayout.icicle,
          fontFamily: 'Arial',
          fillLabel: {
            valueFormatter: (d: number) => d,
            // fontStyle: 'italic',
            textInvertible: true,
            // fontWeight: 900,
            valueFont: {
              // fontFamily: 'Menlo',
              // fontStyle: 'normal',
              // fontWeight: 100,
            },
          },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          minFontSize: 8,
          maxFontSize: 14,
          idealFontSizeJump: 1.01,
          outerSizeRatio: 1,
          emptySizeRatio: 0,
          circlePadding: 0,
          radialPadding: 0,
          backgroundColor: 'rgba(229,229,229,1)',
        }}
      />
    </Chart>
  );
};
