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

import { ChartTypes } from '../../..';
import { CategoryKey } from '../../../../common/category';
import { GroupBySpec, SpecTypes } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecsFromStore } from '../../../../state/utils';
import { Dimensions } from '../../../../utils/dimensions';
import { config } from '../../layout/config';
import { nullShapeViewModel, QuadViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { ArrayEntry } from '../../layout/utils/group_by_rollup';
import { getShapeViewModel } from '../../layout/viewmodel/scenegraph';
import { getPartitionSpecs } from './get_partition_specs';
import { getTree } from './tree';

const getSpecs = (state: GlobalChartState) => state.specs;

/** @internal */
export const partitionMultiGeometries = createCachedSelector(
  [getSpecs, getPartitionSpecs, getChartContainerDimensionsSelector, getTree, getChartThemeSelector],
  (specs, partitionSpecs, parentDimensions, tree, { background }): ShapeViewModel[] => {
    const groupBySpec = getSpecsFromStore<GroupBySpec>(specs, ChartTypes.Global, SpecTypes.IndexOrder);

    // todo make it part of configuration
    const specDirection = ['horizontal', 'vertical', 'zigzag'][0];
    const breakdownDirection = ['horizontal', 'vertical', 'zigzag'][2];

    const zigzagColumnCount = Math.ceil(Math.sqrt(partitionSpecs.length));
    const zigzagRowCount = Math.ceil(partitionSpecs.length / zigzagColumnCount);

    const categorySplit = groupBySpec.length > 0;

    return partitionSpecs.flatMap((spec, index) => {
      const outerHeight =
        specDirection === 'vertical' ? 1 / partitionSpecs.length : specDirection === 'zigzag' ? 1 / zigzagRowCount : 1;
      const outerWidth =
        specDirection === 'horizontal'
          ? 1 / partitionSpecs.length
          : specDirection === 'zigzag'
          ? 1 / zigzagColumnCount
          : 1;
      return (categorySplit ? tree[0][1].children : tree).map((t: ArrayEntry, innerIndex, a) => {
        const zigzagColumnCount2 = Math.ceil(Math.sqrt(a.length));
        const zigzagRowCount2 = Math.ceil(a.length / zigzagColumnCount2);
        return getShapeViewModel(spec, parentDimensions, [t], background.color, {
          index,
          innerIndex,
          partitionLayout: spec.config.partitionLayout ?? config.partitionLayout,
          top:
            (specDirection === 'vertical'
              ? index / partitionSpecs.length
              : specDirection === 'zigzag'
              ? Math.floor(index / zigzagColumnCount) / zigzagRowCount
              : 0) +
            outerHeight *
              (breakdownDirection === 'vertical'
                ? innerIndex / a.length
                : breakdownDirection === 'zigzag'
                ? Math.floor(innerIndex / zigzagColumnCount2) / zigzagRowCount2
                : 0),
          height:
            outerHeight *
            (breakdownDirection === 'vertical'
              ? 1 / a.length
              : breakdownDirection === 'zigzag'
              ? 1 / zigzagRowCount2
              : 1),
          left:
            (specDirection === 'horizontal'
              ? index / partitionSpecs.length
              : specDirection === 'zigzag'
              ? (index % zigzagColumnCount) / zigzagColumnCount
              : 0) +
            outerWidth *
              (breakdownDirection === 'horizontal'
                ? innerIndex / a.length
                : breakdownDirection === 'zigzag'
                ? (innerIndex % zigzagColumnCount2) / zigzagColumnCount2
                : 0),
          width:
            outerWidth *
            (breakdownDirection === 'horizontal'
              ? 1 / a.length
              : breakdownDirection === 'zigzag'
              ? 1 / zigzagColumnCount2
              : 1),
          rowIndex: 0,
          rowCount: 1,
          columnIndex: index,
          columnCount: partitionSpecs.length,
        });
      });
    });
  },
)(getChartIdSelector);

function focusRect(quadViewModel: QuadViewModel[], { left, width }: Dimensions, drilldown: CategoryKey[]) {
  return drilldown.length === 0
    ? { x0: left, x1: left + width }
    : quadViewModel.find(
        ({ path }) => path.length === drilldown.length && path.every(({ value }, i) => value === drilldown[i]),
      ) ?? { x0: left, x1: left + width };
}

/** @internal */
export const partitionDrilldownFocus = createCachedSelector(
  [
    partitionMultiGeometries,
    getChartContainerDimensionsSelector,
    (state) => state.interactions.drilldown,
    (state) => state.interactions.prevDrilldown,
  ],
  (multiGeometries, chartDimensions, drilldown, prevDrilldown) =>
    multiGeometries.map(({ quadViewModel, index, innerIndex }) => {
      const { x0: currentFocusX0, x1: currentFocusX1 } = focusRect(quadViewModel, chartDimensions, drilldown);
      const { x0: prevFocusX0, x1: prevFocusX1 } = focusRect(quadViewModel, chartDimensions, prevDrilldown);
      return { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1, index, innerIndex };
    }),
)((state) => state.chartId);

/** @internal */
export const partitionGeometries = createCachedSelector(
  [partitionMultiGeometries],
  (multiGeometries: ShapeViewModel[]) => {
    return [
      multiGeometries.length > 0 // singleton!
        ? multiGeometries[0]
        : nullShapeViewModel(),
    ];
  },
)(getChartIdSelector);
