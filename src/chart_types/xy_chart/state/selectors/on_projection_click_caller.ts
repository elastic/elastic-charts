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
import { Selector } from 'reselect';

import { ChartTypes } from '../../..';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { getLastClickSelector } from '../../../../state/selectors/get_last_click';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { isClicking } from '../../../../state/utils';
import { getProjectedScaledValues } from './get_projected_scaled_values';

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 * @internal
 */
export function createOnProjectionClickCaller(): (state: GlobalChartState) => void {
  let prevClick: PointerState | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.XYAxis) {
      selector = createCachedSelector(
        [getLastClickSelector, getSettingsSpecSelector, getProjectedScaledValues],
        (lastClick, { onProjectionClick }, values): void => {
          if (!onProjectionClick) {
            return;
          }

          if (values !== undefined && isClicking(prevClick, lastClick)) {
            onProjectionClick(values);
          }
          prevClick = lastClick;
        },
      )({
        keySelector: ({ chartId }) => chartId,
      });
    }
    if (selector) {
      selector(state);
    }
  };
}
