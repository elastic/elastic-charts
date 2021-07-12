/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { computeChartDimensions, ChartDimensions } from '../../utils/dimensions';
import { computeAxisTicksDimensionsSelector } from './compute_axis_ticks_dimensions';
import { getAxesStylesSelector } from './get_axis_styles';
import { getAxisSpecsSelector } from './get_specs';

/** @internal */
export const computeChartDimensionsSelector = createCustomCachedSelector(
  [
    getChartContainerDimensionsSelector,
    getChartThemeSelector,
    computeAxisTicksDimensionsSelector,
    getAxisSpecsSelector,
    getAxesStylesSelector,
    getSmallMultiplesSpec,
  ],
  (chartContainerDimensions, chartTheme, axesTicksDimensions, axesSpecs, axesStyles, smSpec): ChartDimensions =>
    computeChartDimensions(
      chartContainerDimensions,
      chartTheme,
      axesTicksDimensions,
      axesStyles,
      axesSpecs,
      smSpec && smSpec[0],
    ),
);
