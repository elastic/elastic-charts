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
import { GlobalChartState } from '../../../../state/chart_state';
import { DragShape } from '../../layout/types/viewmodel_types';
import { geometries } from './geometries';

function getCurrentPointerStates(state: GlobalChartState) {
  return state.interactions.pointer;
}

export function createOnBrushingCaller(): (state: GlobalChartState) => void {
  let prevShape: DragShape = { x: 0, y: 0, height: 0, width: 0 };
  let selector: Selector<GlobalChartState, DragShape> | null = null;

  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.Heatmap) {
      selector = createCachedSelector(
        [geometries, getCurrentPointerStates],
        (geoms, pointerStates): DragShape => {
          if (!pointerStates.dragging || !pointerStates.down) {
            return { x: 0, y: 0, height: 0, width: 0 };
          }

          const {
            down: {
              position: { x: startX, y: startY },
            },
            current: {
              position: { x: endX, y: endY },
            },
          } = pointerStates;

          const shape = geoms.pickDragShape([
            { x: startX, y: startY },
            { x: endX, y: endY },
          ]);

          if (!shape) {
            return prevShape;
          }

          prevShape = shape;
          return shape;
        },
      )({
        keySelector: (state: GlobalChartState) => state.chartId,
      });
    }
    return selector!(state);
  };
}
