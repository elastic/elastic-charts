/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import type { TooltipValue } from '../../specs';

/** @internal */
export interface PinTooltipAction {
  pinned: boolean;
  resetPointer?: boolean;
}

/** @internal */
export const pinTooltip = createAction('PIN_TOOLTIP', ({ pinned, resetPointer = false }: PinTooltipAction) => ({
  payload: {
    pinned,
    resetPointer,
  },
}));

/** @internal */
export const toggleSelectedTooltipItem = createAction<TooltipValue>('TOGGLE_SELECTED_TOOLTIP_ITEM');

/** @internal */
export const setSelectedTooltipItems = createAction<TooltipValue[]>('SET_SELECTED_TOOLTIP_ITEMS');
