/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartElementSizesSelector } from './compute_chart_dimensions';
import { getHeatmapGeometries } from './geometries';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastDragSelector } from '../../../../state/selectors/get_last_drag';
import { PickDragFunction } from '../../layout/types/viewmodel_types';

/** @internal */
export const getPickedCells = createCustomCachedSelector(
  [getHeatmapGeometries, getLastDragSelector, computeChartElementSizesSelector],
  (geoms, dragState, dims): ReturnType<PickDragFunction> | null => {
    if (!dragState) {
      return null;
    }

    // the pointer is not on the cells but over the y- axis and does not cross the y-axis
    if (dragState.start.position.x < dims.grid.left && dragState.end.position.x < dims.grid.left) {
      const fittedDragStateStart = { x: dims.grid.left, y: dragState.start.position.y };
      const { y, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
      return { x: [], y, cells };
    }

    // the pointer is not on the cells by over the x-axis and does not cross the x-axis
    if (dragState.start.position.y > dims.grid.height && dragState.end.position.y > dims.grid.height) {
      const fittedDragStateStart = { x: dragState.start.position.x, y: dims.grid.height };
      const { x, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
      return { x, y: [], cells };
    }
    return geoms.pickDragArea([dragState.start.position, dragState.end.position]);
  },
);
