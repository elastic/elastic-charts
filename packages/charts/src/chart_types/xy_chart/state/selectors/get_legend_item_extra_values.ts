/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getComputedScalesSelector } from './get_computed_scales';
import { getTooltipInfoAndGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import type { LegendItemExtraValues } from '../../../../common/legend';
import { EMPTY_LEGEND_ITEM_EXTRA_VALUES } from '../../../../common/legend';
import type { SeriesKey } from '../../../../common/series_id';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendItemExtraValues } from '../../tooltip/tooltip';

/** @internal */
export const getLegendItemExtraValuesSelector = createCustomCachedSelector(
  [getTooltipInfoAndGeomsSelector, getComputedScalesSelector],
  ({ tooltip: { values } }, { xScale: { type } }): Map<SeriesKey, LegendItemExtraValues> =>
    // See https://github.com/elastic/elastic-charts/issues/2050
    type === ScaleType.Ordinal ? EMPTY_LEGEND_ITEM_EXTRA_VALUES : getLegendItemExtraValues(values),
);
