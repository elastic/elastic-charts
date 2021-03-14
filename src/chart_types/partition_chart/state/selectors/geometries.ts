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
import { SmallMultiplesSpec, SpecTypes } from '../../../../specs';
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

const horizontalSplit = (s?: SmallMultiplesSpec) => s?.splitHorizontally;
const verticalSplit = (s?: SmallMultiplesSpec) => s?.splitVertically;
const zigzagSplit = (s?: SmallMultiplesSpec) => !s?.splitVertically && !s?.splitHorizontally;

/** @internal */
export const partitionMultiGeometries = createCachedSelector(
  [getSpecs, getPartitionSpecs, getChartContainerDimensionsSelector, getTree, getChartThemeSelector],
  (specs, partitionSpecs, parentDimensions, tree, { background }): ShapeViewModel[] => {
    const smallMultiplesSpec = getSpecsFromStore<SmallMultiplesSpec>(
      specs,
      ChartTypes.Global,
      SpecTypes.SmallMultiples,
    );

    // todo make it part of configuration
    const outerSpecDirection = ['horizontal', 'vertical', 'zigzag'][0];

    const innerBreakdownDirection = horizontalSplit(smallMultiplesSpec[0])
      ? 'horizontal'
      : verticalSplit(smallMultiplesSpec[0])
      ? 'vertical'
      : 'zigzag';

    const smallMultiplesBreakdownCount = Math.max(
      Number(smallMultiplesSpec.some(zigzagSplit)),
      Number(smallMultiplesSpec.some(horizontalSplit)) + Number(smallMultiplesSpec.some(verticalSplit)),
    );

    const { width, height } = parentDimensions;
    const outerPanelCount = partitionSpecs.length;

    const zigzagColumnCount = Math.ceil(Math.sqrt(outerPanelCount));
    const zigzagRowCount = Math.ceil(outerPanelCount / zigzagColumnCount);

    const categorySplit = smallMultiplesSpec.length > 0;

    const result = partitionSpecs.flatMap((spec, index) => {
      const outerHeight =
        outerSpecDirection === 'vertical'
          ? 1 / outerPanelCount
          : outerSpecDirection === 'zigzag'
          ? 1 / zigzagRowCount
          : 1;
      const outerWidth =
        outerSpecDirection === 'horizontal'
          ? 1 / outerPanelCount
          : outerSpecDirection === 'zigzag'
          ? 1 / zigzagColumnCount
          : 1;
      const innerPanelTrees = categorySplit ? tree[0][1].children : tree; // todo solve it for x*y breakdown ie. two dimensional grid
      return innerPanelTrees.map((t: ArrayEntry, innerIndex, a) => {
        const innerPanelCount = a.length;
        const outerPanelWidth = width * outerWidth;
        const outerPanelHeight = height * outerHeight;
        const outerPanelArea = outerPanelWidth * outerPanelHeight;
        const innerPanelTargetArea = outerPanelArea / innerPanelCount;
        const innerPanelTargetHeight = Math.sqrt(innerPanelTargetArea); // attempting squarish inner panels
        const innerZigzagRowCount = Math.max(1, Math.floor(outerPanelHeight / innerPanelTargetHeight)); // err on the side of landscape aspect ratio
        const innerZigzagColumnCount = Math.ceil(a.length / innerZigzagRowCount);

        return getShapeViewModel(spec, parentDimensions, [t], background.color, smallMultiplesBreakdownCount, {
          index,
          innerIndex,
          partitionLayout: spec.config.partitionLayout ?? config.partitionLayout,
          top:
            (outerSpecDirection === 'vertical'
              ? index / outerPanelCount
              : outerSpecDirection === 'zigzag'
              ? Math.floor(index / zigzagColumnCount) / zigzagRowCount
              : 0) +
            outerHeight *
              (innerBreakdownDirection === 'vertical'
                ? innerIndex / a.length
                : innerBreakdownDirection === 'zigzag'
                ? Math.floor(innerIndex / innerZigzagColumnCount) / innerZigzagRowCount
                : 0),
          height:
            outerHeight *
            (innerBreakdownDirection === 'vertical'
              ? 1 / a.length
              : innerBreakdownDirection === 'zigzag'
              ? 1 / innerZigzagRowCount
              : 1),
          left:
            (outerSpecDirection === 'horizontal'
              ? index / outerPanelCount
              : outerSpecDirection === 'zigzag'
              ? (index % zigzagColumnCount) / zigzagColumnCount
              : 0) +
            outerWidth *
              (innerBreakdownDirection === 'horizontal'
                ? innerIndex / a.length
                : innerBreakdownDirection === 'zigzag'
                ? (innerIndex % innerZigzagColumnCount) / innerZigzagColumnCount
                : 0),
          width:
            outerWidth *
            (innerBreakdownDirection === 'horizontal'
              ? 1 / a.length
              : innerBreakdownDirection === 'zigzag'
              ? 1 / innerZigzagColumnCount
              : 1),
        });
      });
    });

    return result.length === 0 ? [nullShapeViewModel(config, { x: outerWidth, y: outerHeight })] : result;
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
