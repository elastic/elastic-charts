/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesIdentifier } from '../../common/series_id';

/** @internal */
export const ON_TOOLTIP_ITEM_TOGGLED = 'ON_TOOLTIP_ITEM_TOGGLED';

/** @internal */
export interface ToggleTooltipItemAction {
  type: typeof ON_TOOLTIP_ITEM_TOGGLED;
  itemId: SeriesIdentifier;
}

/** @internal */
export function onToggleTooltipItemAction(itemId: SeriesIdentifier): ToggleTooltipItemAction {
  return { type: ON_TOOLTIP_ITEM_TOGGLED, itemId };
}

/** @internal */
export type TooltipActions = ToggleTooltipItemAction;
