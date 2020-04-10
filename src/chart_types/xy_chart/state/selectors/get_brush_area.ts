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
import { GlobalChartState } from '../../../../state/chart_state';
import { Dimensions } from '../../../../utils/dimensions';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { BrushAxis } from '../../../../specs';
import { Rotation } from '../../../../utils/commons';
import { Point } from '../../../../utils/point';

const getMouseDownPosition = (state: GlobalChartState) => state.interactions.pointer.down;
const getCurrentPointerPosition = (state: GlobalChartState) => {
  return state.interactions.pointer.current.position;
};

/** @internal */
export const getBrushAreaSelector = createCachedSelector(
  [
    getMouseDownPosition,
    getCurrentPointerPosition,
    getChartRotationSelector,
    computeChartDimensionsSelector,
    getSettingsSpecSelector,
  ],
  (mouseDownPosition, cursorPosition, chartRotation, { chartDimensions }, { brushAxis }): Dimensions | null => {
    if (!mouseDownPosition) {
      return null;
    }
    const brushStart = {
      x: mouseDownPosition.position.x,
      y: mouseDownPosition.position.y,
    };
    switch (brushAxis) {
      case BrushAxis.Y:
        return getBrushForYAxis(chartDimensions, chartRotation, cursorPosition, brushStart);
      case BrushAxis.Both:
        return getBrushForBothAxis(chartDimensions, cursorPosition, brushStart);
      case BrushAxis.X:
      default:
        return getBrushForXAxis(chartDimensions, chartRotation, cursorPosition, brushStart);
    }
  },
)(getChartIdSelector);

function getBrushForXAxis(
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  cursorPosition: Point,
  brushStart: Point,
) {
  if (chartRotation === 0 || chartRotation === 180) {
    const area = {
      left: brushStart.x - chartDimensions.left,
      width: cursorPosition.x - brushStart.x,
      top: 0,
      height: chartDimensions.height,
    };
    return area;
  } else {
    const area = {
      left: 0,
      width: chartDimensions.width,
      top: brushStart.y - chartDimensions.top,
      height: cursorPosition.y - brushStart.y,
    };
    return area;
  }
}

function getBrushForYAxis(
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  cursorPosition: Point,
  brushStart: Point,
) {
  if (chartRotation === -90 || chartRotation === 90) {
    const area = {
      left: brushStart.x - chartDimensions.left,
      width: cursorPosition.x - brushStart.x,
      top: 0,
      height: chartDimensions.height,
    };
    return area;
  } else {
    const area = {
      left: 0,
      width: chartDimensions.width,
      top: brushStart.y - chartDimensions.top,
      height: cursorPosition.y - brushStart.y,
    };
    return area;
  }
}

function getBrushForBothAxis(chartDimensions: Dimensions, cursorPosition: Point, brushStart: Point) {
  return {
    left: brushStart.x - chartDimensions.left,
    width: cursorPosition.x - brushStart.x,
    top: brushStart.y - chartDimensions.top,
    height: cursorPosition.y - brushStart.y,
  };
}
