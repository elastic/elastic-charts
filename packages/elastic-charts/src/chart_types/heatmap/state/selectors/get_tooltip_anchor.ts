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

import { TooltipAnchorPosition } from '../../../../components/tooltip/types';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPickedShapes } from './picked_shapes';

function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

/** @internal */
export const getTooltipAnchorSelector = createCachedSelector(
  [getPickedShapes, computeChartDimensionsSelector, getCurrentPointerPosition],
  (shapes, chartDimensions, position): TooltipAnchorPosition => {
    if (Array.isArray(shapes) && shapes.length > 0) {
      const firstShape = shapes[0];
      return {
        isRotated: false,
        x1: firstShape.x + chartDimensions.left + firstShape.width / 2,
        y1: firstShape.y - chartDimensions.top + firstShape.height,
      };
    }
    return {
      isRotated: false,

      x1: position.x,
      y1: position.y,
    };
  },
)(getChartIdSelector);
