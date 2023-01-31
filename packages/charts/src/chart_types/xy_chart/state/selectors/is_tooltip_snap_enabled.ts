/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';

/** @internal */
export const isTooltipSnapEnableSelector = createCustomCachedSelector(
  [computeSeriesGeometriesSelector, getTooltipSpecSelector],
  (seriesGeometries, { snap }) =>
    (seriesGeometries.scales.xScale && seriesGeometries.scales.xScale.bandwidth > 0) || snap,
);
