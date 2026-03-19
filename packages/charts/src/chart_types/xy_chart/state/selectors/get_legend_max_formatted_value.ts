/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getAnnotationSpecsSelector, getAxisSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesIndexOrderSelector } from '../../../../state/selectors/get_small_multiples_index_order';
import { defaultTickFormatter } from '../../utils/axis_utils';
import { getAxesSpecForSpecId } from '../utils/spec';
import { computeSeriesDomains } from '../utils/utils';

/**
 * Computes series domains from ALL series, ignoring deselection state,
 * so that domain-derived measurements remain stable when toggling series visibility.
 */
const computeAllSeriesDomainsSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getScaleConfigsFromSpecsSelector,
    getAnnotationSpecsSelector,
    getSettingsSpecSelector,
    getSmallMultiplesIndexOrderSelector,
  ],
  (seriesSpecs, scaleConfigs, annotations, settings, smallMultiples) =>
    computeSeriesDomains(seriesSpecs, scaleConfigs, annotations, settings, [], smallMultiples),
);

/**
 * Returns the longest formatted max Y domain value across all series.
 * Used to reserve stable width for the CurrentAndLastValue legend column, preventing layout shift on hover.
 * @internal
 */
export const getLongestLegendFormattedValueSelector = createCustomCachedSelector(
  [computeAllSeriesDomainsSelector, getSeriesSpecsSelector, getAxisSpecsSelector, getSettingsSpecSelector],
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
