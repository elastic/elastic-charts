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

import createCachedSelector from 're-reselect';

import { LegendItem } from '../../../../commons/legend';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { identity, Position } from '../../../../utils/commons';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { PrimitiveValue } from '../../layout/utils/group_by_rollup';
import { map } from '../iterables';
import { partitionGeometries } from './geometries';
import { FlatLegendOrderTuple, getFlatHierarchy } from './get_flat_hierarchy';
import { getPieSpec } from './pie_spec';

/** @internal */
export const computeLegendSelector = createCachedSelector(
  [getPieSpec, getSettingsSpecSelector, partitionGeometries, getFlatHierarchy],
  (pieSpec, { flatLegend, legendMaxDepth, legendPosition }, { quadViewModel }, sortedItems): LegendItem[] => {
    if (!pieSpec) {
      return [];
    }

    const uniqueNames = new Set(map(({ dataName, fillColor }) => makeKey(dataName, fillColor), quadViewModel));
    const forceFlatLegend = flatLegend || legendPosition === Position.Bottom || legendPosition === Position.Top;

    const excluded: Set<string> = new Set();
    const items = quadViewModel.filter(({ depth, dataName, fillColor }) => {
      if (legendMaxDepth != null) {
        return depth <= legendMaxDepth;
      }
      if (forceFlatLegend) {
        const key = makeKey(dataName, fillColor);
        if (uniqueNames.has(key) && excluded.has(key)) {
          return false;
        }
        excluded.add(key);
      }
      return true;
    });

    items.sort(forceFlatLegend ? makeIndexComparator(sortedItems) : compareTreePaths);

    return items.map<LegendItem>(({ dataName, fillColor, depth }) => {
      const formatter = pieSpec.layers[depth - 1]?.nodeLabel ?? identity;
      return {
        color: fillColor,
        label: formatter(dataName),
        dataName,
        childId: dataName,
        depth: forceFlatLegend ? 0 : depth - 1,
        seriesIdentifier: { key: dataName, specId: pieSpec.id },
      };
    });
  },
)(getChartIdSelector);

function makeKey(...keyParts: PrimitiveValue[]): string {
  return keyParts.join('---');
}

function compareTreePaths({ path: a }: QuadViewModel, { path: b }: QuadViewModel): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const diff = a[i] - b[i];
    if (diff) {
      return diff;
    }
  }
  return a.length - b.length; // if one path is fully contained in the other, then parent (shorter) goes first
}

function makeIndexComparator(sortedItems: FlatLegendOrderTuple[]) {
  const indices = new Map(sortedItems.map(([dataName, depth, value], i) => [makeKey(dataName, depth, value), i]));
  const findIndex = findInIndex(indices);
  return (a: QuadViewModel, b: QuadViewModel) => findIndex(a) - findIndex(b);
}

function findInIndex(indices: Map<string, number>) {
  return function({ dataName, depth, value }: QuadViewModel) {
    // still expensive with `makeKey` but a O(n^2 ln n) or worst case, O(n^3), as it's used by a `[].sort`, is avoided
    // we can bring in a liteFields hierarchical Map() indexer if needed - Map nesting avoids string concat
    return indices.get(makeKey(dataName, depth, value)) ?? -1;
  };
}
