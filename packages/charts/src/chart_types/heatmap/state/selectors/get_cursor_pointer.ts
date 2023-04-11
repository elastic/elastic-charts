/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CSSProperties } from 'react';

import { getPickedShapes, hasPicketVisibleCells } from './picked_shapes';
import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getTooltipInteractionState } from '../../../../state/selectors/get_tooltip_interaction_state';
import { isBrushingSelector } from '../../../../state/selectors/is_brushing';

/** @internal */
export const getPointerCursorSelector = createCustomCachedSelector(
  [getPickedShapes, isBrushingSelector, getTooltipInteractionState],
  (pickedShapes, isBrushing, tooltipState): CSSProperties['cursor'] => {
    if (tooltipState.pinned) return;
    return isBrushing || hasPicketVisibleCells(pickedShapes) ? 'pointer' : DEFAULT_CSS_CURSOR;
  },
);
