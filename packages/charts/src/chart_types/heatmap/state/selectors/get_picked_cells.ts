/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLastDragSelector } from '../../../../state/selectors/get_last_drag';
import { PickDragFunction } from '../../layout/types/viewmodel_types';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { geometries } from './geometries';

/** @internal */
export const getPickedCells = createCustomCachedSelector(
  [geometries, getLastDragSelector, computeChartDimensionsSelector],
  (geoms, dragState, canvasDimensions): ReturnType<PickDragFunction> | null => {
    if (!dragState) {
      return null;
    }

    // the pointer is not on the cells but over the axis and does not cross the axis
    if (dragState.start.position.x < canvasDimensions.left && dragState.end.position.x < canvasDimensions.left) {
      const fittedDragStateStart = { x: canvasDimensions.left, y: dragState.start.position.y };
      const { y, cells } = geoms.pickDragArea([fittedDragStateStart, dragState.end.position]);
      return { x: [], y, cells };
    }

    return geoms.pickDragArea([dragState.start.position, dragState.end.position]);
  },
);
