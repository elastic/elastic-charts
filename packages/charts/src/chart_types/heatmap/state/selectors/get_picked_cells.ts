/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getPerPanelHeatmapGeometries } from './get_per_panel_heatmap_geometries';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastDragSelector } from '../../../../state/selectors/get_last_drag';
import type { PickDragFunction } from '../../layout/types/viewmodel_types';

/** @internal */
export const getPickedCells = createCustomCachedSelector(
  [getPerPanelHeatmapGeometries, getLastDragSelector, computeChartDimensionsSelector],
  (geoms, dragState, { chartDimensions }): ReturnType<PickDragFunction> | null => {
    if (!dragState) {
      return null;
    }

    // the pointer is not on the cells but over the y- axis and does not cross the y-axis
    if (dragState.start.position.x < chartDimensions.left && dragState.end.position.x < chartDimensions.left) {
      const fittedDragStateStart = { x: chartDimensions.left, y: dragState.start.position.y };
      const { y, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
      // TODO: fix with small multiples
      return { x: [], y, cells };
    }

    // the pointer is not on the cells by over the x-axis and does not cross the x-axis
    if (dragState.start.position.y > chartDimensions.height && dragState.end.position.y > chartDimensions.height) {
      const fittedDragStateStart = { x: dragState.start.position.x, y: chartDimensions.height };
      const { x, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
      // TODO: fix with small multiples
      return { x, y: [], cells };
    }
    return geoms.pickDragArea([dragState.start.position, dragState.end.position]);
  },
);
