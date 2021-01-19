/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { SeriesIdentifier } from '../../commons/series_id';

/** @internal */
export const ON_LEGEND_ITEM_OVER = 'ON_LEGEND_ITEM_OVER';

/** @internal */
export const ON_LEGEND_ITEM_OUT = 'ON_LEGEND_ITEM_OUT';

/** @internal */
export const ON_TOGGLE_DESELECT_SERIES = 'ON_TOGGLE_DESELECT_SERIES';

interface LegendItemOverAction {
  type: typeof ON_LEGEND_ITEM_OVER;
  legendItemKey: string | null;
}
interface LegendItemOutAction {
  type: typeof ON_LEGEND_ITEM_OUT;
}

/** @internal */
export interface ToggleDeselectSeriesAction {
  type: typeof ON_TOGGLE_DESELECT_SERIES;
  legendItemId: SeriesIdentifier;
  negate: boolean;
}

/** @internal */
export function onLegendItemOverAction(legendItemKey: string | null): LegendItemOverAction {
  return { type: ON_LEGEND_ITEM_OVER, legendItemKey };
}

/** @internal */
export function onLegendItemOutAction(): LegendItemOutAction {
  return { type: ON_LEGEND_ITEM_OUT };
}

/** @internal */
export function onToggleDeselectSeriesAction(
  legendItemId: SeriesIdentifier,
  negate = false,
): ToggleDeselectSeriesAction {
  return { type: ON_TOGGLE_DESELECT_SERIES, legendItemId, negate };
}

/** @internal */
export type LegendActions = LegendItemOverAction | LegendItemOutAction | ToggleDeselectSeriesAction;
