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

import { LegendPath } from '../../../../state/actions/legend';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { partitionGeometries } from './geometries';

const getHighlightedLegendItemPath = (state: GlobalChartState) => state.interactions.highlightedLegendPath;

const logic = {
  node: (legendPath: LegendPath) => ({ path }: QuadViewModel) =>
    // highlight exact match in the path only
    legendPath.length === path.length &&
    legendPath.every(({ index, value }, i) => index === path[i]?.index && value === path[i]?.value),

  path: (legendPath: LegendPath) => ({ path }: QuadViewModel) =>
    // highlight members of the exact path; ie. exact match in the path, plus all its ancestors
    path.every(({ index, value }, i) => index === legendPath[i]?.index && value === legendPath[i]?.value),

  keyInLayer: (legendPath: LegendPath) => ({ dataName, path }: QuadViewModel) =>
    // highlight all identically named items which are within the same depth (ring) as the hovered legend depth
    legendPath.length === path.length && dataName === legendPath[legendPath.length - 1].value,

  key: (legendPath: LegendPath) => ({ dataName }: QuadViewModel) =>
    // highlight all identically named items, no matter where they are
    dataName === legendPath[legendPath.length - 1].value,

  nodeWithDescendants: (legendPath: LegendPath) => ({ path }: QuadViewModel) =>
    // highlight exact match in the path, and everything that is its descendant in that branch
    legendPath.every(({ index, value }, i) => index === path[i]?.index && value === path[i]?.value),

  pathWithDescendants: (legendPath: LegendPath) => ({ path }: QuadViewModel) =>
    // highlight exact match in the path, and everything that is its ancestor, or its descendant in that branch
    legendPath
      .slice(0, path.length)
      .every(({ index, value }, i) => index === path[i]?.index && value === path[i]?.value),
};

const pickedLogic: keyof typeof logic = 'key';

/** @internal */
// why is it called highlighted... when it's a legend hover related thing, not a hover over the slices?
export const legendHoverHighlightNodes = createCachedSelector(
  [getHighlightedLegendItemPath, partitionGeometries],
  (highlightedLegendItemPath, geoms): QuadViewModel[] => {
    if (highlightedLegendItemPath.length === 0) {
      return [];
    }
    return geoms.quadViewModel.filter(logic[pickedLogic](highlightedLegendItemPath));
  },
)(getChartIdSelector);
