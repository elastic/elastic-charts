/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSeriesDomainsSelector } from './compute_series_domains';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { defaultTickFormatter } from '../../utils/axis_utils';
import { getAxesSpecForSpecId } from '../utils/spec';

/**
 * Returns the longest formatted max Y domain value across all series.
 * Used to reserve stable width for the CurrentAndLastValue legend column, preventing layout shift on hover.
 * @internal
 */
export const getLegendMaxFormattedValueSelector = createCustomCachedSelector(
  [computeSeriesDomainsSelector, getSeriesSpecsSelector, getAxisSpecsSelector, getSettingsSpecSelector],
  ({ yDomains }, seriesSpecs, axesSpecs, settings): string | undefined => {
    const maxYValue = yDomains?.[0]?.domain?.[1];
    if (typeof maxYValue !== 'number' || !isFinite(maxYValue)) return undefined;

    let result: string | undefined;
    for (const spec of seriesSpecs) {
      const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, settings.rotation);
      const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;
      const formatted = formatter(maxYValue);
      if (!result || formatted.length > result.length) {
        result = formatted;
      }
    }
    return result;
  },
);
