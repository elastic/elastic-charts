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

import createCachedSelector from 're-reselect';
import { getTree } from './tree';
import { SeriesKey } from '../../../xy_chart/utils/series';
import { LegendItem } from '../../../xy_chart/legend/legend';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getPieSpecOrNull } from './pie_spec';
import { HierarchyOfArrays, CHILDREN_KEY, PrimitiveValue } from '../../layout/utils/group_by_rollup';

/** @internal */
export const computeLegendSelector = createCachedSelector(
  [getPieSpecOrNull, getTree],
  (pieSpec, tree): Map<SeriesKey, LegendItem> => {
    // console.log(tree, flatSlicesNames(tree, [], []));
    // const legendItems = flatSlicesNames(tree);

    // legendItems.map<LegendItem>((d) => {
    //   return {
    //     key: d,
    //     color: 'red',
    //     name: d,
    //     seriesIdentifier: {},
    //   };
    // });

    return new Map();
  },
)(getChartIdSelector);

function flatSlicesNames(tree: HierarchyOfArrays, parent: PrimitiveValue[] = [], keys: string[] = []) {
  if (tree.length === 0) {
    keys.push(parent.filter(Boolean).join(' - '));
    return;
  }
  for (let i = 0; i < tree.length; i++) {
    const arrayNode = tree[i][1];
    const key = tree[i][0];
    parent.push(key);
    const children = arrayNode[CHILDREN_KEY];
    flatSlicesNames(children, parent, keys);
    parent.pop();
  }
  return keys;
}
