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
  const rotated = isRotated(chartRotation);
  return {
    left: rotated ? 0 : getLeftPoint(chartDimensions, brushStart),
    top: rotated ? getTopPoint(chartDimensions, brushStart) : 0,
    height: rotated ? getHeight(cursorPosition, brushStart) : chartDimensions.height,
    width: rotated ? chartDimensions.width : getWidth(cursorPosition, brushStart),
  };
}

function getBrushForYAxis(
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  cursorPosition: Point,
  brushStart: Point,
) {
  const rotated = isRotated(chartRotation);
  return {
    left: rotated ? getLeftPoint(chartDimensions, brushStart) : 0,
    top: rotated ? 0 : getTopPoint(chartDimensions, brushStart),
    height: rotated ? chartDimensions.height : getHeight(cursorPosition, brushStart),
    width: rotated ? getWidth(cursorPosition, brushStart) : chartDimensions.width,
  };
}

function getBrushForBothAxis(chartDimensions: Dimensions, cursorPosition: Point, brushStart: Point) {
  return {
    left: getLeftPoint(chartDimensions, brushStart),
    top: getTopPoint(chartDimensions, brushStart),
    height: getHeight(cursorPosition, brushStart),
    width: getWidth(cursorPosition, brushStart),
  };
}

export function isRotated(chartRotation: Rotation) {
  return chartRotation === -90 || chartRotation === 90;
}
export function getLeftPoint({ left }: Dimensions, { x }: Point) {
  return x - left;
}
export function getTopPoint({ top }: Dimensions, { y }: Point) {
  return y - top;
}
export function getHeight(cursorPosition: Point, brushStart: Point) {
  return cursorPosition.y - brushStart.y;
}
export function getWidth(cursorPosition: Point, brushStart: Point) {
  return cursorPosition.x - brushStart.x;
}
