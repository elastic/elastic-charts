/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { GlobalChartState } from '../chart_state';

/** @internal */
export interface LegendItemLabel {
  label: string;
  depth: number;
}

/** @internal */
export const getLegendItemsLabelsSelector = (state: GlobalChartState): LegendItemLabel[] =>
  state.internalChartState?.getLegendItemsLabels(state) ?? [];

/** @internal */
export const EMPTY_LEGEND_ITEM_LIST: LegendItemLabel[] = [];
