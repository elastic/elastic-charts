/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getComputedScalesSelector } from './get_computed_scales';
import { getTooltipInfoAndGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { LegendItemExtraValues } from '../../../../common/legend';
import { SeriesKey } from '../../../../common/series_id';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendItemExtraValues } from '../../tooltip/tooltip';

const EMPTY_MAP = new Map();
/** @internal */
export const getLegendItemExtraValuesSelector = createCustomCachedSelector(
  [getTooltipInfoAndGeomsSelector, getComputedScalesSelector],
  ({ tooltip: { values } }, { xScale: { type } }): Map<SeriesKey, LegendItemExtraValues> =>
    // 24/05/2023 A decision was made by the Kibana Visualization Team (MarcoV, StratoulaK)
    // to disable representing `current` hovered values if the X scale is Ordinal. at Elastic this feature wasn't used
    // and the the information was redundant because it was alredy available in the tooltip.
    // A possible enhancement will probably update this configuration to allow `current` values if explicitly configured.
    // See https://github.com/elastic/elastic-charts/issues/2050
    type === ScaleType.Ordinal ? EMPTY_MAP : getLegendItemExtraValues(values),
);
