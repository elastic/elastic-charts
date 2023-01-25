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
import { computeChartElementSizesSelector } from './compute_chart_element_sizes';
import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [getPerPanelHeatmapGeometries, getActivePointerPosition, computeChartElementSizesSelector],
  (geoms, pointerPosition, elementSizes): Cell[] | TextBox => {
    const picker = geoms.pickQuads;
    const { x, y } = pointerPosition;
    const pickedData = picker(x, y);
    return Array.isArray(pickedData)
      ? pickedData.filter(({ y }) => y < elementSizes.rowHeight * elementSizes.visibleNumberOfRows)
      : pickedData;
  },
);

/** @internal */
export const getPickedGridCell = createCustomCachedSelector(
  [getPerPanelHeatmapGeometries, getActivePointerPosition, computeChartElementSizesSelector],
  (geoms, pointerPosition): GridCell | undefined => {
    return geoms.pickGridCell(pointerPosition.x, pointerPosition.y);
  },
);

/** @internal */
export const hasPicketVisibleCells = (pickedShapes: Cell[] | TextBox) =>
  Array.isArray(pickedShapes) && pickedShapes.some(({ visible }) => visible);
