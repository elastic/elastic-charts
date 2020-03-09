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
import { Selector } from 'reselect';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SettingsSpec, LayerValue } from '../../../../specs';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { getPickedShapes } from './picked_shapes';
import { getPieSpecOrNull } from './pie_spec';
import { ChartTypes } from '../../..';
import { PARENT_KEY, DEPTH_KEY, SORT_INDEX_KEY, AGGREGATE_KEY, CHILDREN_KEY } from '../../layout/utils/group_by_rollup';
import { SeriesIdentifier } from '../../../xy_chart/utils/series';
import { isClicking } from '../../../../state/utils';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 */
export function createOnElementClickCaller(): (state: GlobalChartState) => void {
  let prevClick: PointerState | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.Partition) {
      selector = createCachedSelector(
        [getPieSpecOrNull, getLastClickSelector, getSettingsSpecSelector, getPickedShapes],
        (pieSpec, lastClick: PointerState | null, settings: SettingsSpec, pickedShapes: QuadViewModel[]): void => {
          if (!pieSpec) {
            return;
          }
          const nextPickedShapesLength = pickedShapes.length;
          if (nextPickedShapesLength > 0 && isClicking(prevClick, lastClick, settings)) {
            if (settings && settings.onElementClick) {
              const elements = pickedShapes.map<[Array<LayerValue>, SeriesIdentifier]>((model) => {
                const values: Array<LayerValue> = [];
                values.push({
                  groupByRollup: model.dataName,
                  value: model.value,
                });
                let parent = model.parent;
                let index = model.parent.sortIndex;
                while (parent[DEPTH_KEY] > 0) {
                  const value = parent[AGGREGATE_KEY];
                  const dataName = parent[PARENT_KEY][CHILDREN_KEY][index][0];
                  values.push({ groupByRollup: dataName, value });

                  parent = parent[PARENT_KEY];
                  index = parent[SORT_INDEX_KEY];
                }
                return [
                  values.reverse(),
                  {
                    specId: pieSpec.id,
                    key: `spec{${pieSpec.id}}`,
                  },
                ];
              });
              settings.onElementClick(elements);
            }
          }
          prevClick = lastClick;
        },
      )({
        keySelector: (state: GlobalChartState) => state.chartId,
      });
    }
    if (selector) {
      selector(state);
    }
  };
}
