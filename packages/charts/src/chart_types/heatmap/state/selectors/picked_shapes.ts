/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getActivePointerPosition } from '../../../../state/selectors/get_active_pointer_position';
import { Cell, GridCell, TextBox } from '../../layout/types/viewmodel_types';
import { computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getHeatmapGeometries } from './geometries';

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [getHeatmapGeometries, getActivePointerPosition, computeChartElementSizesSelector],
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
export const getPickedGridCell = createCustomCachedSelector(
  [getHeatmapGeometries, getActivePointerPosition, computeChartElementSizesSelector],
  (geoms, pointerPosition): GridCell | undefined => {
    return geoms.pickGridCell(pointerPosition.x, pointerPosition.y);
  },
);

/** @internal */
export const hasPickedShapes = (pickedShapes: Cell[] | TextBox) =>
  Array.isArray(pickedShapes) && pickedShapes.some(({ visible }) => visible);
