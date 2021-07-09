/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
// import { isChartAnimatable } from '../utils';

/** @internal */
export const isChartAnimatableSelector = createCustomCachedSelector(
  [computeSeriesGeometriesSelector, getSettingsSpecSelector],
  // eslint-disable-next-line arrow-body-style
  () => {
    // const { geometriesCounts } = seriesGeometries;
    // temporary disabled until
    // https://github.com/elastic/elastic-charts/issues/89 and https://github.com/elastic/elastic-charts/issues/41
    // return isChartAnimatable(geometriesCounts, settingsSpec.animateData);
    return false;
  },
);
