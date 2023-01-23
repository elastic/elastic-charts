/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isBrushAvailableSelector } from './is_brush_available';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';

const getPointerSelector = (state: GlobalChartState) => state.interactions.pointer;

/** @internal */
export const isBrushingSelector = createCustomCachedSelector(
  [isBrushAvailableSelector, getPointerSelector],
  (isBrushAvailable, pointer): boolean => isBrushAvailable && pointer.dragging,
);
