/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getAnnotationSpecsSelector, getSeriesSpecsSelector } from './get_specs';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesIndexOrderSelector } from '../../../../state/selectors/get_small_multiples_index_order';
import { computeSeriesDomains } from '../utils/utils';

const getDeselectedSeriesSelector = (state: GlobalChartState) => state.interactions.deselectedDataSeries;
const getParentDimensions = (state: GlobalChartState) => state.parentDimensions;

/** Plot-pixel budget: parent size, conservative on rotation (max side). */
function plotPixelWidth(parent: { width: number; height: number }): number {
  // Width is 0 before the first layout; still downsample dense series so spec
  // parse does not copy every row. Real size replaces this on resize.
  return Math.max(parent.width, parent.height) || 1024;
}

/** @internal */
export const computeSeriesDomainsSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getScaleConfigsFromSpecsSelector,
    getAnnotationSpecsSelector,
    getSettingsSpecSelector,
    getDeselectedSeriesSelector,
    getSmallMultiplesIndexOrderSelector,
    getParentDimensions,
  ],
  (seriesSpecs, scaleConfigs, annotations, settings, deselected, smallMultiples, parentDimensions) =>
    computeSeriesDomains(
      seriesSpecs,
      scaleConfigs,
      annotations,
      settings,
      deselected,
      smallMultiples,
      plotPixelWidth(parentDimensions),
    ),
);

/**
 * Returns series domains computed over the full dataset, ignoring any deselected series.
 * When nothing is deselected, reuses the already-memoized result of computeSeriesDomainsSelector
 * at zero extra cost. Only triggers a second computeSeriesDomains call when deselection is active.
 * Used for stable legend width calculation.
 * @internal
 */
export const computeFullSeriesDomainsSelector = createCustomCachedSelector(
  [
    computeSeriesDomainsSelector,
    getDeselectedSeriesSelector,
    getSeriesSpecsSelector,
    getScaleConfigsFromSpecsSelector,
    getAnnotationSpecsSelector,
    getSettingsSpecSelector,
    getSmallMultiplesIndexOrderSelector,
    getParentDimensions,
  ],
  (domains, deselectedSeries, seriesSpecs, scaleConfigs, annotations, settings, smallMultiples, parentDimensions) => {
    if (deselectedSeries.length === 0) return domains;
    return computeSeriesDomains(
      seriesSpecs,
      scaleConfigs,
      annotations,
      settings,
      [],
      smallMultiples,
      plotPixelWidth(parentDimensions),
    );
  },
);
