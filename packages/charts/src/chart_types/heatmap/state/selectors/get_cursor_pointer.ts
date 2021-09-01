/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getGridHeightParamsSelector } from './get_grid_full_height';
import { isBrushingSelector } from './is_brushing';
import { getPickedShapes } from './picked_shapes';

/** @internal */
export const getPointerCursorSelector = createCustomCachedSelector(
  [getPickedShapes, isBrushingSelector, getGridHeightParamsSelector],
  (pickedShapes, isBrushing, gridParams) => {
    return isBrushing ||
      (Array.isArray(pickedShapes) &&
        pickedShapes.filter(({ y }) => y < gridParams.gridCellHeight * gridParams.pageSize).length > 0)
      ? 'pointer'
      : DEFAULT_CSS_CURSOR;
  },
);
