/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemExtraValues } from '../../../../common/legend';
import { SeriesKey } from '../../../../common/series_id';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getLegendItemExtraValues } from '../../tooltip/tooltip';
import { getTooltipInfoAndGeomsSelector } from './get_tooltip_values_highlighted_geoms';

/** @internal */
export const getLegendItemExtraValuesSelector = createCustomCachedSelector(
  [getTooltipInfoAndGeomsSelector],
  ({ tooltip: { values } }): Map<SeriesKey, LegendItemExtraValues> => getLegendItemExtraValues(values),
);
