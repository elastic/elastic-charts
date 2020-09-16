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
import { BrushEndListener } from '../../../..';
import { DragState, GlobalChartState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getSpecOrNull } from './heatmap_spec';
import { getPickedCells } from './picked_shapes';

interface Props {
  onBrushEnd: BrushEndListener | undefined;
  lastDrag: DragState | null;
}

/**
 * Will call the onBrushEnd listener every time the following preconditions are met:
 * - the onBrushEnd listener is available
 * - we dragged the mouse pointer
 * @internal
 */
export function createOnBrushEndCaller(): (state: GlobalChartState) => void {
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.Heatmap) {
      selector = createCachedSelector(
        [getSpecOrNull, getSettingsSpecSelector, getPickedCells],
        (spec, { onBrushEnd, rotation, brushAxis, minBrushDelta }, pickedCells): void => {
          if (!spec || !onBrushEnd || pickedCells.length === 0) {
            return;
          }

          // @ts-ignore
          onBrushEnd(pickedCells);
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
