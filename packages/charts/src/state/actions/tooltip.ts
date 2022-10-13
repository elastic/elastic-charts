/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipValue } from '../../specs';

/** @internal */
export const PIN_TOOLTIP = 'PIN_TOOLTIP';

/** @internal */
export const TOGGLE_SELECTED_TOOLTIP_ITEM = 'TOGGLE_SELECTED_TOOLTIP_ITEM';

/** @internal */
export const SET_SELECTED_TOOLTIP_ITEMS = 'SET_SELECTED_TOOLTIP_ITEMS';

/** @internal */
export interface PinTooltipAction {
  type: typeof PIN_TOOLTIP;
  pinned: boolean;
  resetPointer: boolean;
}

/** @internal */
export interface ToggleSelectedTooltipItemAction {
  type: typeof TOGGLE_SELECTED_TOOLTIP_ITEM;
  item: TooltipValue;
}

/** @internal */
export interface SetSelectedTooltipItemsAction {
  type: typeof SET_SELECTED_TOOLTIP_ITEMS;
  items: TooltipValue[];
}

/** @internal */
export function pinTooltip(pinned: boolean, resetPointer: boolean = false): PinTooltipAction {
  return { type: PIN_TOOLTIP, pinned, resetPointer };
}

/** @internal */
export function toggleSelectedTooltipItem(item: TooltipValue): ToggleSelectedTooltipItemAction {
  return { type: TOGGLE_SELECTED_TOOLTIP_ITEM, item };
}

/** @internal */
export function setSelectedTooltipItems(items: TooltipValue[]): SetSelectedTooltipItemsAction {
  return { type: SET_SELECTED_TOOLTIP_ITEMS, items };
}

/** @internal */
export type TooltipActions = PinTooltipAction | ToggleSelectedTooltipItemAction | SetSelectedTooltipItemsAction;
