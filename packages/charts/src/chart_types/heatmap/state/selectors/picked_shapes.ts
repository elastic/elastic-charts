/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { Cell, TextBox } from '../../layout/types/viewmodel_types';
import { geometries } from './geometries';
import { getGridHeightParamsSelector } from './get_grid_full_height';

function getCurrentPointerPosition(state: GlobalChartState) {
  return state.interactions.pointer.current.position;
}

/** @internal */
export const getPickedShapes = createCustomCachedSelector(
  [geometries, getCurrentPointerPosition, getGridHeightParamsSelector],
  (geoms, pointerPosition, gridParams): Cell[] | TextBox => {
    const picker = geoms.pickQuads;
    const { x, y } = pointerPosition;
    const arrayPicker = picker(x, y) as Cell[];
    return Array.isArray(picker(x, y))
      ? arrayPicker.filter(({ y }) => y < gridParams.gridCellHeight * gridParams.pageSize)
      : picker(x, y);
  },
);
