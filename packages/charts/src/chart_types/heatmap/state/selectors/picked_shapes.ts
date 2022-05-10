/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { Cell, InvertedPosition, TextBox } from '../../layout/types/viewmodel_types';
import { computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getHeatmapGeometries } from './geometries';

/** @internal */
export function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [getHeatmapGeometries, getCurrentPointerPosition, computeChartElementSizesSelector],
  (geoms, pointerPosition, dims): Cell[] | TextBox => {
    const picker = geoms.pickQuads;
    const { x, y } = pointerPosition;
    const pickedData = picker(x, y);
    return Array.isArray(pickedData)
      ? pickedData.filter(({ y }) => y < dims.rowHeight * dims.visibleNumberOfRows)
      : pickedData;
  },
);

/** @internal */
export const getXValue = createCustomCachedSelector(
  [getHeatmapGeometries, getCurrentPointerPosition, computeChartElementSizesSelector],
  (geoms, pointerPosition): InvertedPosition => {
    const picker = geoms.pickInvertedPosition;
    const { x, y } = pointerPosition;
    const pickedData = picker(x, y);
    return pickedData;
  },
);
