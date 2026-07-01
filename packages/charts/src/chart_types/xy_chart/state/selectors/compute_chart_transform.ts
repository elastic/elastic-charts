/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeChartLayoutSelector } from './compute_chart_layout';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { Transform } from '../utils/types';
import { computeChartTransform } from '../utils/utils';

/** @internal */
export const computeChartTransformSelector = createCustomCachedSelector(
  [computeChartLayoutSelector, getSettingsSpecSelector],
  ({ dimensions: { chartDimensions } }, settingsSpecs): Transform =>
    computeChartTransform(chartDimensions, settingsSpecs.rotation),
);
