/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CSSProperties } from 'react';

import { DEFAULT_CSS_CURSOR } from '../../../../common/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getTooltipInteractionState } from '../../../../state/selectors/get_tooltip_interaction_state';
import { isBrushingSelector } from './is_brushing';
import { getPickedShapes } from './picked_shapes';

/** @internal */
export const getPointerCursorSelector = createCustomCachedSelector(
  [getPickedShapes, isBrushingSelector, getTooltipInteractionState],
  (pickedShapes, isBrushing, tooltipState): CSSProperties['cursor'] => {
    if (tooltipState.pinned) return;
    return isBrushing || (Array.isArray(pickedShapes) && pickedShapes.some(({ visible }) => visible))
      ? 'pointer'
      : DEFAULT_CSS_CURSOR;
  },
);
