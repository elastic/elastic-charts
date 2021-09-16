/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Scale } from '../../../../scales';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getTooltipSnapSelector } from './get_tooltip_snap';

/** @internal */
export const isTooltipSnapEnableSelector = createCustomCachedSelector(
  [computeSeriesGeometriesSelector, getTooltipSnapSelector],
  (seriesGeometries, snap) => isTooltipSnapEnabled(seriesGeometries.scales.xScale, snap),
);

function isTooltipSnapEnabled(xScale: Scale<number | string>, snap: boolean) {
  return (xScale && xScale.bandwidth > 0) || snap;
}
