/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesIdentifier } from '../../common/series_id';

/** @internal */
export const ON_TOOLTIP_STICK = 'ON_TOOLTIP_STICK';

/** @internal */
export const ON_TOOLTIP_ITEM_SELECTED = 'ON_TOOLTIP_ITEM_SELECTED';

/** @internal */
export interface ToggleTooltipStickAction {
  type: typeof ON_TOOLTIP_STICK;
}

/** @internal */
export interface ToggleSelectedTooltipItemAction {
  type: typeof ON_TOOLTIP_ITEM_SELECTED;
  itemId: SeriesIdentifier;
}

/** @internal */
export function onToggleTooltipStick(): ToggleTooltipStickAction {
  return { type: ON_TOOLTIP_STICK };
}

/** @internal */
export function onToggleSelectedTooltipItem(itemId: SeriesIdentifier): ToggleSelectedTooltipItemAction {
  return { type: ON_TOOLTIP_ITEM_SELECTED, itemId };
}

/** @internal */
export type TooltipActions = ToggleTooltipStickAction | ToggleSelectedTooltipItemAction;
